---
name: generar-trd
description: >-
  Genera un Technical Requirements Document (TRD) especificando arquitectura,
  esquemas, APIs, integraciones y límites técnicos. Salida:
  docs/<domain>/<EPIC-SLUG>-trd.md. Úsalo cuando el usuario pida generar,
  crear o especificar requisitos técnicos antes de implementar. No lo usas
  para generar diagramas arquitectónicos visuales (usar generar-arquitectura)
  ni para documentar decisiones arquitectónicas (usar generar-adr).
---

# Generador de TRD

Genera un Technical Requirements Document que especifica arquitectura, esquemas, APIs, integraciones y límites técnicos de un epic. Puente entre Product Requirements (epic) e Implementación (tareas).

Solo análisis y documentación: no implementa, no crea código. Úsalo para alineación técnica antes de comenzar tareas.

## Fase 0 — Resolver entrada

Requerido: `EPIC-SLUG` o ruta del plan de tareas del epic.

Infiere desde:
- Ruta: `docs/**/<EPIC-SLUG>-tasks.md`
- Contenido pegado: si el usuario pega el plan de tareas
- Epic plan: busca el archivo más reciente de `*-tasks.md`

Pregunta cuando falta: "¿Para qué epic genero TRD? (ruta de tasks.md o epic slug)"

Declara inputs resueltos: epic, tareas, AC técnicos.

## Fase A — Analizar AC Técnicos del Epic

Lee el plan de tareas y extrae **AC técnicos**:
- "Schema migration for X"
- "API endpoint POST /users with auth"
- "Integrate with external service Y"
- "Feature flag for legacy code path"
- "Performance: <100ms latency"

Mapea cada AC técnico a componentes que lo implementan.

## Fase B — Especificar Arquitectura

Documenta decisiones arquitectónicas del epic:

```
## Arquitectura General

### Modelo de datos
- **Entidades nuevas**: [User, Account, etc.]
- **Cambios de schema**:
  - Tabla: users (nueva)
  - Columnas: [id, email, created_at, ...]
  - Constraints: unique(email), not null(id), foreign key(organization_id)
  - Migration strategy: [create-table, backfill, verify]

### Flujos principales
[Diagrama ASCII o descripción de interacciones clave]
- Request → Service → DB
- Async job → external API → webhook

### Integraciones externas
- Servicio X: [qué endpoint, auth, timeout, retry]
- Servicio Y: [webhook, rate limit, error handling]

### Feature flags
- `new_auth_v2`: gradual rollout, 25% → 50% → 100%
- `legacy_user_path`: keep for backward compat, deprecate in Q4

### Límites y Constraints
- Max request payload: 10MB
- Max concurrent connections: 100
- Data retention: 30 days for logs
- Geographic: EU-only storage
```

## Fase C — Especificar APIs (si aplica)

Para cada endpoint nuevo o modificado, usa el template en `references/api-spec-template.md`.

Repite para CADA endpoint nuevo o modificado.

## Fase D — Especificar Esquemas y Modelos

Para cada modelo nuevo, usa el template en `references/model-spec-template.md`.

## Fase E — Especificar Comportamiento Crítico

Documenta behaviors que afectan a testing/implementación:

```
## Comportamientos Críticos

### Autenticación
- Primer login: 2FA requerido (SMS o TOTP)
- Cambio de password: requiere email verification
- Sesión expira en 24h o inactividad 1h
- Rate limit: 5 login attempts → 15min lockout

### Concurrencia
- Actualización simultánea de mismo recurso: last-write-wins
- Operaciones idempotentes: DELETE /users/{id} es safe si ya deletado

### Tolerancia a fallos
- External API down: fallback a cached data (max 1h old)
- Database connection lost: return 503, cliente reintenta
- Async job failed: retry exponencial (1s, 10s, 100s), log error

### Datos sensibles
- Passwords: hash con bcrypt (10+ rounds)
- API keys: hash con SHA-256, nunca log plain
- Personal data: encrypt at rest si GDPR applies
```

## Fase F — Especificar Testing Strategy

```
## Testing

### Unit Tests
- Modelo User: validaciones, relaciones
- Service: lógica de creación, auth checks

### Integration Tests
- Crear user → verifica en DB
- Crear user + crear API key → ambos existen
- Autenticación: token válido pasa, token inválido falla

### E2E Tests
- POST /users flow completo
- Verificar email de bienvenida enviado

### Performance Tests
- Crear 10k users: < 1min
- GET /users con 100k users: < 100ms
```

## Fase G — Especificar Riesgos y Mitigaciones

Usa el template en `references/risk-table-template.md` para documentar los riesgos técnicos.

## Fase H — Gate de Revisión de TRD

Antes de finalizar el TRD, pregunta al humano: **¿Go/No-Go para continuar con arquitectura y validación técnica?**

- Si **No-Go**: Detén el workflow, marca el TRD como "Needs revision" y sugiere revisar requisitos técnicos, arquitectura o alcance antes de continuar.
- Si **Go**: Procede a Fase I para escribir el TRD final.

Este gate asegura que el humano aprueba los requisitos técnicos antes de invertir en arquitectura y validación.

## Fase I — Escribir TRD

Estructura del documento:

1. **Resumen ejecutivo**: qué es el epic, cuál es la especificación técnica de alto nivel
2. **Arquitectura general**: componentes, flujos, decisiones clave
3. **Modelos de datos**: tablas, campos, índices, relaciones, ACLs
4. **APIs**: endpoints, payloads, responses, rate limits
5. **Integraciones externas**: servicios, endpoints, auth, errores
6. **Comportamientos críticos**: autenticación, concurrencia, failover, datos sensibles
7. **Feature flags**: rollout strategy, deprecation plan
8. **Testing strategy**: unit, integration, E2E, performance
9. **Riesgos y mitigaciones**: tabla de riesgos
10. **Preguntas abiertas**: AC ambiguas, límites no definidos
11. **Ready for**: `generar-adr` (decisiones arquitectónicas) o `implementation-ready` (listo para implementar)

## Salida

Escribe en: `docs/<domain>/<EPIC-SLUG>-trd.md`

**Secciones requeridas**:
- Resumen del epic
- Arquitectura general
- Modelos de datos (con validaciones, índices)
- APIs (con request/response ejemplos)
- Integraciones externas
- Comportamientos críticos
- Testing strategy
- Riesgos técnicos y mitigaciones
- Preguntas abiertas
- Ready for (`generar-adr` o `tareas-listas`)

Ready for valores:
- `generar-adr`: TRD completo, proceder a documentar decisiones arquitectónicas
- `implementation-ready`: TRD completo sin ADRs, listo para implementar
- `refine-trd`: Especificación técnica incompleta, necesita clarificación

## Autoevaluación

Antes de finalizar, verifica:

- [ ] Todos los AC técnicos del epic están mapeados a componentes
- [ ] Arquitectura general incluye modelo de datos, flujos, integraciones y feature flags
- [ ] Cada endpoint nuevo/modificado tiene especificación completa (auth, body, responses, rate limit)
- [ ] Cada modelo nuevo tiene especificación completa (campos, índices, validaciones, relaciones, ACLs)
- [ ] Comportamientos críticos documentados (auth, concurrencia, failover, datos sensibles)
- [ ] Testing strategy incluye unit, integration, E2E y performance tests cuando aplica
- [ ] Riesgos técnicos identificados con probabilidad, impacto y mitigación
- [ ] Preguntas abiertas listadas para AC ambiguas o límites no definidos
- [ ] Ready for valor refleja el estado real del TRD
