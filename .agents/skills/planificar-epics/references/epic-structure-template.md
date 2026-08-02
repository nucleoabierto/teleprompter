# Template de Estructura de Epic

**Propósito**: Estructura estándar para definir epics con criterios de aceptación, dependencias, riesgos y estimación.

---

## Estructura de Epic

```markdown
### Epic: [Nombre descriptivo]
- **Objetivo**: [qué logra este epic en el negocio]
- **AC (Acceptance Criteria)**:
  - AC1: [mensurable desde PR/deploy]
  - AC2: [...]
- **Dependencias**: 
  - Bloqueado por: [otros epics o sistemas]
  - Desbloquea: [qué epics pueden correr en paralelo]
- **Riesgo técnico**: [construcción nueva, legacy refactor, integración desconocida]
- **Estimación gruesa**: [XS/S/M/L/XL en días-persona]
- **Orden sugerido**: [1ro, 2do, paralelo con X, etc.]
```

---

## Guía de Uso

### Campos

- **Nombre descriptivo**: Título claro que indique el valor entregado (ej: "Autenticación con OAuth 2.0" no "Auth")
- **Objetivo**: Qué logra este epic para el negocio/usuario (no qué hace técnicamente)
- **AC (Acceptance Criteria)**: Criterios medibles desde PR/deploy, no implementación interna
- **Dependencias**: Bloqueos y desbloqueos explícitos
- **Riesgo técnico**: Construcciones nuevas, legacy refactor, integraciones desconocidas
- **Estimación gruesa**: XS (< 1 semana), S (1-2 semanas), M (2-3 semanas), L (3-4 semanas), XL (> 4 semanas)
- **Orden sugerido**: Posición en secuencia o paralelismo con otros epics

### Reglas de Epics

1. **Deployable independientemente**: Cada epic debe ser deployable de forma independiente (feature flag, API nueva, schema migration)
2. **Dependencia fuerte → combinar**: Si dos epics tienen dependencia fuerte, combínalos o añade "sequential" en orden sugerido
3. **Tamaño máximo**: Máximo 3-4 semanas por epic (si > L, sugiere dividir)
4. **Valor de negocio**: Cada epic debe entregar valor medible al usuario/negocio

### Ejemplos

#### Ejemplo: Epic de infraestructura

```markdown
### Epic: Base de datos de usuarios
- **Objetivo**: Almacenar información de usuarios con schema escalable para autenticación
- **AC (Acceptance Criteria)**:
  - AC1: Tabla `users` creada con campos: id, email, password_hash, created_at
  - AC2: Índices únicos en email para login rápido
  - AC3: Migration reversible sin pérdida de datos
- **Dependencias**: 
  - Bloqueado por: None
  - Desbloquea: Auth Service, User Profile
- **Riesgo técnico**: Schema migration en producción (requiere downtime o zero-downtime strategy)
- **Estimación gruesa**: S (1-2 semanas)
- **Orden sugerido**: 1ro (base para otros epics)
```

#### Ejemplo: Epic de feature

```markdown
### Epic: Login con Google OAuth
- **Objetivo**: Permitir a usuarios autenticarse con cuenta de Google
- **AC (Acceptance Criteria)**:
  - AC1: Botón "Sign in with Google" en login page
  - AC2: Flujo OAuth 2.0 completo (redirect → callback → token exchange)
  - AC3: Usuario creado/actualizado en DB tras auth exitoso
  - AC4: Session JWT generada y retornada al frontend
- **Dependencias**: 
  - Bloqueado por: Base de datos de usuarios
  - Desbloquea: User Profile, Social Sharing
- **Riesgo técnico**: Integración con Google OAuth API (rate limits, token refresh)
- **Estimación gruesa**: M (2-3 semanas)
- **Orden sugerido**: 2do (después de base de datos)
```

#### Ejemplo: Epic paralelo

```markdown
### Epic: Dashboard de analytics
- **Objetivo**: Visualizar métricas de uso para administradores
- **AC (Acceptance Criteria)**:
  - AC1: Dashboard con gráficos de usuarios activos, conversiones
  - AC2: Filtros por rango de fechas
  - AC3: Export a CSV
- **Dependencias**: 
  - Bloqueado por: None
  - Desbloquea: Reports automation
- **Riesgo técnico**: Queries complejas en DB (requieren optimización)
- **Estimación gruesa**: M (2-3 semanas)
- **Orden sugerido**: Paralelo con Auth Service (no compiten por recursos)
```
