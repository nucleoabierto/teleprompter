---
name: dividir-epic
description: >-
  Lee un epic del plan de epics y lo divide en tareas atómicas con AC,
  estimaciones y dependencias. Salida: docs/<domain>/<EPIC-SLUG>-tasks.md.
  Úsalo cuando el usuario pida dividir, desagregar, descomponer o breakdown un
  epic en tareas. No lo usas para crear tickets en herramientas de gestión
  (usar crear-ticket) ni para planificar epics desde PRD (usar
  planificar-epics).
---

# Divisor de Epics

Lee un epic del plan de epics y lo divide en **tareas atómicas** con criterios de aceptación, estimaciones y dependencias. Cada tarea debe ser ≤ 8 puntos de complejidad (máximo 1 semana para 1 dev).

Solo análisis: no crea tickets automáticamente, no implementa. Úsalo para preparar trabajo antes de invocar `crear-ticket` para cada tarea.

## Fase 0 — Resolver entrada

Requerido: `EPIC-SLUG` o ruta del epic plan.

Infiere desde:
- Ruta local: `docs/**/<PRD-SLUG>-epic-plan.md` si proporciona EPIC-SLUG
- Contenido pegado: si el usuario pega el epic desde el plan
- Epic plan previo: busca el archivo más reciente de `*-epic-plan.md`

Pregunta cuando falta: "¿Qué epic divido? (de qué PRD, qué epic específico)"

Declara inputs resueltos: PRD, epic seleccionado, AC del epic, riesgos técnicos.

## Fase A — Cargar Epic y Contexto

1. Lee el epic: objetivo, AC, dependencias, estimación gruesa, riesgos técnicos
2. Lee brief de contexto técnico si existe: `docs/**/<DOMAIN>-context-brief.md` (codebase understanding)
3. Analiza codebase:
   - Grep por archivos que el epic tocará (ej. "auth" → encuentra modelos, servicios, routes)
   - Identifica **entry points** reales: rutas HTTP, schemas, jobs, eventos
   - Detecta **artefactos dependientes**: tablas que migran, servicios que consumen, feature flags

## Fase B — Estructurar Tareas Atómicas

Divide el epic en **5-12 tareas** (más chicas = menos riesgo, más overhead). Estructura cada tarea:

```
### Tarea: [Nombre corto, acción activa]
- **Objetivo**: [qué logra esta tarea en el epic]
- **AC (Acceptance Criteria)**:
  - AC1: [código escrito, migration registrada, test verde]
  - AC2: [...]
- **Archivos que toca**: 
  - Crea: `src/new/file.py` (100 líneas aprox)
  - Modifica: `src/existing/model.py` (5-15 líneas de cambio)
  - Test: `tests/.../test_new.py`
- **Dependencias**:
  - Bloqueado por: [otras tareas del epic o epics previos]
  - Desbloquea: [tareas posteriores]
- **Estimación**: [1-8 puntos Fibonacci] (preferir 3-5 puntos, ver [estimation-reference.md](references/estimation-reference.md))
- **Riesgos**: [legacy code, unknowns, integraciones externas]
- **Testing strategy**: [unit, integration, snapshot, manual QA]
```

**Reglas de tarea atómica**:
- ✅ Máximo 8 puntos de complejidad (0-8 días estimado, ver [estimation-reference.md](references/estimation-reference.md))
- ✅ Preferir 3-5 puntos (tamaño óptimo de sprint)
- ✅ Producible cambio verificable (diff visible)
- ✅ Deployable o integrable con feature flag
- ❌ No cruza 3+ artefactos mayores (si lo hace, divide más)
- ❌ No toca legacy + nueva tech simultáneamente (separa refactor → nueva feature)
- ❌ No excede 8 puntos (si lo hace, divide en 2-3 tareas)

## Fase C — Mapear Artefactos del Codebase

Para cada tarea, anota qué toca:

```
## Mapeo de Artefactos

| Tarea | Modelo | Schema | Route | Service | Job | Config |
|-------|--------|--------|-------|---------|-----|--------|
| [T1] | User ↑ | ✓ | POST /users ↑ | AuthSvc ✓ | — | — |
| [T2] | — | — | ✓ (GET) | Cache ↑ | — | — |
```

Leyenda:
- ✓ = crea o modifica
- ↑ = impacto en downstream
- — = no toca

**Beneficio**: detecta si dos tareas compiten por el mismo archivo (reduce paralelización).

## Fase D — Detectar Dependencias Entre Tareas

Usa el template de [dependency-table-template.md](references/dependency-table-template.md) para crear la tabla de dependencias entre tareas.

Detecta:
- **Cadenas secuenciales**: A → B → C (tomar en cuenta en timeline)
- **Paralelización**: T1 || T2 (reducir ciclo de implementación)
- **Ciclos** (nunca debe haber): si existen, reestructura

## Fase E — Estimar Paralela

Si todo fuera serial: Σ (estimaciones) = timeline máximo.
Si paralelizamos:
- Máximo de ramas críticas = timeline probable
- Ejemplo: [T1=2pts] → [T2=2pts || T3=2pts] → [T4=3pts] = 2+2+2+3 = 9 puntos serial vs 2+max(2,2)+3 = 7 puntos en paralelo

Anota: "Implementación en serie: X puntos (~Y días); en paralelo (recomendado): Z puntos (~A días)"

## Fase F — Escribir Plan de Tareas

Estructura del documento:

1. **Resumen del epic**: qué logra, AC, dependencias del epic vs otros
2. **Lista de tareas**: todas las tareas con AC, estimación, archivos
3. **Mapeo de artefactos**: qué toca cada tarea
4. **Dependencias entre tareas**: tabla con orden y paralelización
5. **Timeline**: serial vs paralelo, crítica, ruta crítica
6. **Riesgos por tarea**: legacy code, unknowns, testing difficulty
7. **Preguntas abiertas**: AC ambiguas, límites entre tareas no claros
8. **Ready for siguiente paso**: `crear-tickets` (crear tickets en tu herramienta) o `refine-epic` si se necesita clarificación

## Autoevaluación

Antes de escribir el archivo final, verifica:

- [ ] Epic leído completamente (objetivo, AC, dependencias, riesgos técnicos)
- [ ] Tareas son ≤ 8 puntos de complejidad (ver [estimation-reference.md](references/estimation-reference.md))
- [ ] Cada tarea es deployable o integrable con feature flag
- [ ] Mapeo de artefactos completo (modelos, schemas, routes, services, jobs, config)
- [ ] Dependencias entre tareas mapeadas (sin ciclos)
- [ ] Timeline estimado (serial vs paralelo)
- [ ] Riesgos técnicos identificados por tarea
- [ ] Preguntas abiertas documentadas si hay AC ambiguas o límites no claros

## Salida

Escribe en: `docs/<domain>/<EPIC-SLUG>-tasks.md`

**Secciones requeridas**:
- Resumen del epic
- Lista completa de tareas (5-12 tareas)
- Mapeo de artefactos del codebase
- Tabla de dependencias entre tareas
- Timeline estimado (serial vs paralelo)
- Riesgos técnicos por tarea
- Preguntas abiertas
- Ready for (`crear-tickets` o `refine-epic`)

Ready for valores:
- `crear-ticket`: Tareas están claras, proceder a crear tickets en tu herramienta de gestión (invocar para cada tarea)
- `refine-epic`: División de tareas necesita clarificación antes de crear tickets
- `blocked`: Dependencias externas o unknowns técnicos impiden desagregación
