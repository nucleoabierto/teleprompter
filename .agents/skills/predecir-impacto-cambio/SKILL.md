---
name: predecir-impacto-cambio
description: >-
  Analiza cambios de código (plan de implementación o rama) y predice impacto
  en sistemas downstream: dependencias, breaking changes, efecto en
  performance, seguridad. Úsalo cuando el usuario pida evaluar, evaluar riesgo
  o hacer análisis de impacto de cambios antes de implementar o crear PR. No
  implementa cambios ni modifica código; solo predice impacto para informar
  decisiones.
---

# Predictor de Impacto de Cambios

Analiza cambios de código y predice impacto downstream: dependencias, breaking changes, performance, seguridad. Identifica qué más necesita cambiar.

Solo análisis: no modifica código. Predice impacto para inform toma de decisiones.

## Fase 0 — Resolver entrada

Requerido: `PLAN-DOC` (plan de implementación) o `BRANCH` (rama local).

Infiere desde:
- Ruta: `docs/**/<TICKET-ID>-implementation-plan.md`
- Rama local: cambios uncommitted vs origin/main
- Contenido pegado: si el usuario pega el plan

Pregunta cuando falta: "¿Qué cambios analizo? (ruta del plan o rama local)"

Declara inputs resueltos: ticket, archivos modificados, scope.

## Fase A — Analizar Cambios

1. Lee el plan: qué se modifica, qué se crea
2. Si hay rama local: ejecuta `git diff origin/main...HEAD`
3. Identifica:
   - Archivos modificados/creados
   - APIs que cambian (endpoints, métodos)
   - Schemas que cambian (new fields, type changes, deletions)
   - Comportamiento que cambia

## Fase B — Detectar Breaking Changes

```
### Breaking Changes Detectados

[Ver tabla de ejemplos en assets/breaking-changes-table.md]

**Recomendaciones**:
- DELETE endpoints: Usar deprecation warning primero (version N), delete en N+1
- Rename fields: Support both nombres temporalmente (backward compat)
- Enum changes: Accept old values, return new values (gradual migration)
- Required fields: Agregar con default value, hacer required gradualmente
```

## Fase C — Mapear Dependencias Downstream

```
### Servicios Afectados por Este Cambio

```
Auth Service (cambio: nueva field `phone` en User)
    ↓ usado por
User Service
    ↓ usado por
API Gateway
    ↓ llamado por
Web Frontend
Mobile App
Admin Dashboard
    ↓ que puede necesitar
Schema migrations
UI updates
Documentation updates
```

**Mapeo de dependencias**:

[Ver ejemplos de código en assets/impact-analysis-examples.md]

**Automatización**: Usar `scripts/scan-dependencies.sh <function-name> <source-dir>` para escanear dependencias automáticamente.

**Análisis**:
- Auth Service modifica User schema
- UserService depends on User schema
- API Gateway expone UserService
- Web/Mobile/Admin call API Gateway
- Todos potencialmente afectados
```

## Fase D — Detectar Comportamiento Cambiado

```
### Cambios de Comportamiento

[Ver ejemplos de código en assets/impact-analysis-examples.md]

**Tipos de cambios a detectar**:
- Nueva lógica condicional
- Cambio de orden/timing (sync → async)
- Cambio de responsabilidad (delegación a otro servicio)
```

## Fase E — Predecir Performance Impact

```
### Análisis de Performance

[Ver ejemplos de código en assets/impact-analysis-examples.md]

**Matriz de impacto**:

[Ver matriz en assets/performance-impact-matrix.md]
```

## Fase F — Validar Impacto en Seguridad

```
### Análisis de Seguridad

[Ver ejemplos de código en assets/impact-analysis-examples.md]

**Riesgos a validar**:
- XSS: ¿Nuevos inputs son escapados en frontend?
- SQL injection: ¿Nuevos campos son parameterizados en DB?
- Storage: ¿Nuevos campos tienen size limits?
- Privilege escalation: ¿Cambios en auth/authorization son seguros?
- Data loss: ¿Hay audit trail para operaciones críticas?
```

## Fase G — Identificar Esfuerzo de Cascade Updates

```
### Matriz de Cascade Updates

[Ver matriz en assets/cascade-updates-matrix.md]

**Timeline**:
- Bloqueantes (antes de deploy): 1 hora (DB migration)
- Parallelizable (durante deploy): 22 horas total
- Post-deploy: Docs, analytics update
```

## Fase H — Escribir Análisis de Impacto

Estructura:

1. **Resumen**: # cambios, # breaking changes, # servicios afectados, severidad
2. **Breaking changes**: Lista con mitigación
3. **Dependencias downstream**: Servicios que serán afectados
4. **Cambios de comportamiento**: Qué es diferente
5. **Performance impact**: Latencia, DB, concurrency
6. **Seguridad**: Nuevos riesgos y validaciones
7. **Cascade updates**: Qué más necesita cambiar
8. **Timeline impacto**: Cuándo se completa el cambio
9. **Risk matrix**: Alto/Medio/Bajo por categoría
10. **Recomendaciones**: Cómo minimizar riesgo
11. **Preguntas abiertas**: Unknowns
12. **Ready for**: `low-risk`, `medium-risk`, `high-risk`

## Salida

Escribe en: `docs/<domain>/<TICKET-ID>-impact-analysis.md`

**Secciones requeridas**:
- Resumen ejecutivo de impacto
- Breaking changes identificados
- Servicios downstream afectados
- Cambios de comportamiento
- Performance impact prediction
- Impacto en seguridad
- Cascade updates requeridos
- Timeline de propagación
- Matriz de riesgos (Alto/Medio/Bajo)
- Recomendaciones de mitigación
- Preguntas abiertas
- Ready for (`low-risk`, `medium-risk`, `high-risk`)

Ready for valores:
- `low-risk`: Cambio seguro, impacto mínimo
- `medium-risk`: Requiere cascade updates, but manageable
- `high-risk`: Breaking changes, múltiples servicios afectados, careful deployment needed
- `blocked`: Risk demasiado alto, reconsiderar arquitectura
