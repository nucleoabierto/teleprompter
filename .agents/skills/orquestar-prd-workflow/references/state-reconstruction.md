# State Reconstruction — Algoritmo de Reanudación

Referencia extraída del orquestador (`orquestar-prd-workflow/SKILL.md` Fase 0.5). Aplicar el patrón de skip-check descrito aquí en cada Fase A–H del orquestador.

Esta fase permite reanudar el workflow si una ejecución previa se interrumpió. Usa `workflow-state.md` como fuente de verdad sobre el último paso completado, complementado con un escaneo de artefactos en disco.

## Formato de `workflow-state.md`

Ruta: `docs/<domain>/idea/<IDEA-SLUG>/workflow-state.md`

```markdown
# Workflow State: <IDEA-SLUG>

- idea-slug: <IDEA-SLUG>
- current-functionality: <PRD-SLUG o null si aún no se selecciona>
- current-step: <nombre del paso en curso, ej. "validar-viabilidad-producto">
- last-completed-step: <nombre del último paso completado, o null>
- updated-at: <ISO timestamp>

## Completed Steps
| Step                 | Functionality | Artifact         | Completed At         |
|----------------------|---------------|------------------|----------------------|
| analizar-idea        | -             | idea-analysis.md | 2026-08-02T10:00:00Z |
| evaluar-alcance-idea | -             | scope-roadmap.md | 2026-08-02T10:30:00Z |
| ...                  |

## Skipped Steps (con justificación)

| Step | Reason |
|------|--------|
| mapear-assumptions | greenfield de bajo riesgo |
| disenar-experimentos | stage MVP |
```

## Algoritmo de Reconstrucción

```
IF NO existe docs/<domain>/idea/<IDEA-SLUG>/workflow-state.md:
  → Es una ejecución nueva. Inicializa el state file:
    - current-functionality: null
    - current-step: analizar-idea (o el primero aplicable)
    - last-completed-step: null
    - completed-steps: []
  → Continúa a Fase Pre-A

IF SÍ existe workflow-state.md:
  → Lee el state file
  → LAST-STEP = last-completed-step
  → CURRENT-FUNC = current-functionality

  → Verificación cruzada: confirma que los artefactos listados en
    completed-steps existen en disco.
    IF algún artefacto listado como completado NO existe en disco:
      → Inconsistencia detectada (posible borrado manual o corrupción)
      → Reporta la inconsistencia al usuario
      → Marca ese paso como NO completado (lo re-ejecutará)
      → Pregunta al usuario si continuar o detenerse

  → Determina el punto de reanudación:
    - Si CURRENT-FUNC = null → reanuda desde Fase Pre-A (analizar-idea)
    - Si LAST-STEP = analizar-idea → reanuda desde Fase A (evaluar-alcance-idea)
    - Si LAST-STEP = evaluar-alcance-idea → reanuda desde Fase B (priorizar-roadmap)
    - Si LAST-STEP = priorizar-roadmap → reanuda desde Fase C (evaluar-conectividad-tecnica) con CURRENT-FUNC
    - Si LAST-STEP = evaluar-conectividad-tecnica → reanuda desde Fase D (capturar-requerimiento)
    - Si LAST-STEP = capturar-requerimiento → reanuda desde Fase D.5 (mapear-assumptions)
    - Si LAST-STEP = mapear-assumptions → reanuda desde Fase D.5.5 (gate de spike por feasibility)
    - Si LAST-STEP = construir-spike (feasibility gate) → reanuda desde Fase E (validar-viabilidad-producto)
    - Si LAST-STEP = validar-viabilidad-producto → reanuda desde Fase F (definir-usuarios)
    - Si LAST-STEP = definir-usuarios → reanuda desde Fase G (mapear-casos-uso)
    - Si LAST-STEP = mapear-casos-uso → reanuda desde Fase G.5 (disenar-experimentos)
    - Si LAST-STEP = disenar-experimentos → reanuda desde Fase H (generar-prd)
    - Si LAST-STEP = generar-prd → reanuda desde Fase I (loop de procesamiento)

  → Reporta al usuario:
    "Workflow reanudado. Último paso completado: <LAST-STEP>.
     Funcionalidad en proceso: <CURRENT-FUNC>.
     Continuando desde: <siguiente fase>."
  → Salta a la fase correspondiente (las fases previas se skip-si-existe)
```

## Tabla canónica de pasos → artefactos

Usada por la reconstrucción para verificar completitud y por cada fase para el skip-check:

| Step                               | Artefacto esperado                                                                               | Fase    |
|------------------------------------|--------------------------------------------------------------------------------------------------|---------|
| analizar-idea                      | `docs/<domain>/idea/<IDEA-SLUG>/idea-analysis.md`                                                | Pre-A   |
| evaluar-alcance-idea               | `docs/<domain>/idea/<IDEA-SLUG>/scope-roadmap.md` (o legacy `…-scope-roadmap.md`)                | A       |
| priorizar-roadmap                  | `docs/<domain>/idea/<IDEA-SLUG>/feature-prioritization.md` (o legacy `…-prioritized-roadmap.md`) | B       |
| evaluar-conectividad-tecnica       | `docs/<domain>/initiatives/<PRD-SLUG>/connectivity/prerequisites-assessment.md`                  | C       |
| capturar-requerimiento             | `docs/<domain>/initiatives/<PRD-SLUG>/requirements.md`                                           | D       |
| mapear-assumptions                 | `docs/<domain>/initiatives/<PRD-SLUG>/assumption-map.md`                                         | D.5     |
| construir-spike (feasibility gate) | `docs/<domain>/initiatives/<PRD-SLUG>/spike-notes.md`                                            | D.5.5   |
| validar-viabilidad-producto        | `docs/<domain>/initiatives/<PRD-SLUG>/product-viability.md`                                      | E       |
| construir-spike (riesgo técnico)   | `docs/<domain>/initiatives/<PRD-SLUG>/spike-notes.md`                                            | E (4.5) |
| definir-usuarios                   | `docs/<domain>/initiatives/<PRD-SLUG>/personas-mapping.md`                                       | F       |
| mapear-casos-uso                   | `docs/<domain>/initiatives/<PRD-SLUG>/use-cases.md`                                              | G       |
| construir-demo                     | `docs/<domain>/initiatives/<PRD-SLUG>/harness-notes.md`                                          | G (6.5) |
| disenar-experimentos               | `docs/<domain>/initiatives/<PRD-SLUG>/experiment-design.md`                                      | G.5     |
| generar-prd                        | `docs/<domain>/initiatives/<PRD-SLUG>/prd.md`                                                    | H       |

## Patrón de skip-check (aplicado en cada Fase A–H)

Cada fase aplica este patrón antes de invocar su skill:

```
SKIP-CHECK para paso <STEP>:
  IF <STEP> está listado en completed-steps del state file
     AND el artefacto canónico de <STEP> existe en disco:
    → Skip: el paso ya se completó en una ejecución previa
    → Reporta: "Skip <STEP>: artefacto ya presente y registrado en state"
    → Continúa a la siguiente fase
  ELSE:
    → Ejecuta el paso normalmente
    → Al completar, actualiza workflow-state.md:
      - last-completed-step = <STEP>
      - current-step = <siguiente paso>
      - Añade fila a completed-steps con timestamp
```
