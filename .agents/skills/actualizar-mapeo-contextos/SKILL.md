---
name: actualizar-mapeo-contextos
description: >-
  Actualiza el mapa de dominios y contextos después de implementación leyendo
  el diff de la tarea/epic y modificando docs/<domain>/domain-map.md con
  nuevas agregaciones, contextos limitados y relaciones inter-contexto para
  mantener la arquitectura del dominio sincronizada con el código. Úsalo
  cuando el usuario pida actualizar, sincronizar o mapear el dominio después
  de implementar, o como paso entre implementar-plan y
  revisar-cambios-locales. No lo uses para crear documentación desde cero ni
  para revisar código — usa skills de documentación o revisión para eso.
---

# Actualizador de Mapeo de Contextos

Actualiza el mapa de dominios y contextos después de la implementación de un epic o tarea. Mantiene la visión de arquitectura sincronizada con cambios de código. Úsalo como paso entre Implementación y Revisión Local.

Solo documentación: actualiza docs, no código. Basado en diff real del código implementado.

## Fase 0 — Resolver entrada

Requerido: `PLAN-DOC` (plan de implementación de la tarea) o `BRANCH` (rama con diff).

Infiere desde:
- Ruta: `docs/**/<TICKET-ID>-implementation-plan.md`
- Rama actual: si hay cambios uncommitted o en rama
- Contenido pegado: si el usuario pega el plan

Pregunta cuando falta: "¿De qué tarea/epic actualizo el dominio map? (ruta plan o rama)"

Declara inputs resueltos: tarea/epic, dominio afectado, cambios encontrados.

## Fase A — Cargar Cambios

1. Lee el plan de implementación: qué se toca, qué dominio/contexto limitado
2. Si hay rama local: ejecuta `git diff origin/main...HEAD` para ver cambios reales
3. Grep el codebase para encontrar:
   - Nuevas agregaciones (modelos, entidades)
   - Nuevos contextos limitados (si se crea subdominio)
   - Nuevas relaciones entre contextos
   - Cambios en nombres/APIs públicas

## Fase B — Analizar Cambios de Dominio

Para cada cambio encontrado, clasifícalo:

| Tipo de cambio | Afecta a dominio map | Ejemplo |
|---|---|---|
| Nueva agregación | ✅ SÍ | Crear modelo `User`, debe estar en domain map |
| Nueva relación | ✅ SÍ | `User → Organization`, nueva arista |
| Nuevo contexto limitado | ✅ SÍ | `Authentication BC`, antes no existía |
| Cambio de API pública | ✅ SÍ | Nuevo endpoint `/api/users`, API del BC cambió |
| Refactor interno | ❌ NO | Mover función A a archivo B, estructura interna |
| Cambio de test | ❌ NO | Adicionar test case |
| Cambio de config | ⚠️ MAYBE | Si expone feature nueva (ejemplo: feature flag) |

Solo los cambios "SÍ" requieren actualizar domain map.

## Fase C — Actualizar Domain Map

Lee el domain map existente y actualiza:

```markdown
## Nuevo en esta implementación

### Agregación: User
- **Contexto limitado**: Authentication
- **Responsabilidad**: Identidad de usuario, credenciales
- **Entidades**:
  - User (raíz agregada)
    - id: UUID
    - email: string, unique
    - password_hash: string
    - created_at: timestamp
- **Límites**:
  - User en Authentication BC NO incluye permisos
  - Permisos en Authorization BC (separado)
- **Relaciones**:
  - User → Organization (1..N)
  - User → ApiKey (1..N)

### Relación Inter-contexto Nueva
- **Authentication BC** ←→ **Authorization BC**
  - Authentication publica eventos: UserCreated, UserDeleted
  - Authorization escucha y replica User en su own data (para permisos)
  - Protocolo: async events vía queue

### Público del Contexto (API Externa)
- `POST /auth/register` (new)
- `POST /auth/login` (new)
- `POST /auth/refresh` (new)
- Evento: UserCreated (publicado a otros contextos)
```

## Fase D — Detectar Cambios Estructurales

¿Hay cambios que requieran refactoring arquitectónico?

```
Ejemplo de hallazgo:
"Implementamos User en Authentication BC.
Pero Authorization BC también tiene User data (para permisos).
RIESGO: duplicación de data, posible inconsistencia.
RECOMENDACIÓN: implementar sincronización via eventos o shared table."
```

Documento cualquier **architectural smell** que detectes:
- Duplicación de entidades entre contextos
- Dependencias circulares (BC A → BC B → BC A)
- Contextos que deberían dividirse
- Contextos que deberían fusionarse

## Fase E — Actualizar Relaciones y Límites

Si el epic modificó contextos existentes:

```
### Contexto limitado: [Nombre] (ACTUALIZADO)
- **Cambios**:
  - Agregación nueva: [List]
  - API pública nueva: [List]
  - Relación nueva: [List]
  - Cambio de límite: [Describe]

### Ejemplo
Authentication BC (Actualizado):
- **Agregaciones nuevas**:
  - User (nueva)
  - UserSession (nueva)
- **APIs públas nuevas**:
  - POST /auth/login
  - POST /auth/logout
  - POST /auth/refresh
- **Cambio de límite**:
  - Antes: Authentication NO mantenía sesiones
  - Ahora: UserSession pertenece a Authentication
```

## Fase F — Validar Integridad del Dominio Map

Checklist de validación:

- ✅ ¿Cada agregación nueva está en algún contexto?
- ✅ ¿Cada contexto tiene definición clara de límite?
- ✅ ¿No hay duplicación de entidades entre contextos?
- ✅ ¿Las relaciones inter-contexto están documentadas?
- ✅ ¿Los públicos (APIs, eventos) están documentados?
- ✅ ¿No hay ciclos de dependencia (BC A → B → A)?
- ✅ ¿Nombres de contexto son descriptivos (no genéricos)?

Si algún check falla → nota en Preguntas abiertas.

## Fase G — Escribir Actualización del Domain Map

Estructura:

1. **Resumen de cambios**: qué tarea/epic, qué se agregó, qué se actualizó
2. **Nuevas agregaciones**: cada una con entidades, límites, responsabilidad
3. **Nuevos contextos limitados** (si aplica): definición completa
4. **Relaciones nuevas inter-contexto**: cómo se comunican, protocolo
5. **APIs/Eventos públicos** (si cambiaron)
6. **Architectural smells detectados**: duplicación, ciclos, etc.
7. **Cambios en el domain map visual** (ASCII o mermaid)
8. **Preguntas abiertas**: ambigüedades de límites, definiciones no claras
9. **Ready for**: `done` (actualización completa) o `refine-domains` (necesita clarificación)

## Salida

Actualiza archivo: `docs/<domain>/domain-map.md`

Estructura de actualizaciones:

```markdown
# Domain Map — [Nombre del Proyecto]

## Última actualización
Fecha: [YYYY-MM-DD]
Tarea: [TICKET-ID] ([qué se agregó])
Actualizado por: [Script nombre]

## Contextos limitados

### [Contexto A] (NUEVO/ACTUALIZADO)
- Responsabilidad: ...
- Agregaciones: ...
- Límites: ...
- APIs: ...

## Relaciones Inter-contexto
- A ←→ B: [protocolo]
- B ←→ C: [protocolo]

## Architectural Smells Detectadas
- [Detalle]

## Histórico de cambios
- [Versión anterior]: Qué cambió
```

Mantén **histórico de cambios** para auditabilidad.

Ready for valores:
- `domain-map-updated`: Mapa actualizado correctamente, listo para revisar cambios
- `refine-domains`: Estructura de dominio incompleta o ambigua, revisar límites
- `architecture-review`: Se detectó architectural smell, requiere revisión de arquitecto

## Casos de Uso

**Caso 1: Tarea pequeña (refactor)**
- Cambio: mover función A a módulo B
- Dominio map: **no cambiar** (refactor interno)
- Ready for: `done`

**Caso 2: Tarea media (nueva agregación)**
- Cambio: crear modelo User en Authentication BC
- Dominio map: **actualizar** Authentication BC, agregar User
- Ready for: `done`

**Caso 3: Tarea grande (nuevo contexto)**
- Cambio: crear Authentication BC completo
- Dominio map: **agregar contexto nuevo**, documentar APIs, relaciones
- Ready for: `architecture-review` (nuevo contexto requiere aprobación)

**Caso 4: Hazardous (duplicación detectada)**
- Cambio: User agregado en Authentication, pero Authorization también tiene User
- Dominio map: **documentar duplicación**, marcar como smell
- Ready for: `architecture-review` (olor requiere decisión)
