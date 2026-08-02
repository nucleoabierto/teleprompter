# Catálogo canónico de artefactos

Inventario único de artefactos por funcionalidad y de roadmap. Referenciado desde Fase 0.5 (verificación cruzada), Fase J (consolidación), Fase K.1 (gate de cierre) y Fase K (reporte). Antes de marcar `Ready for: planificar-epics`, verifica que los artefactos obligatorios existen en disco.

## Artefactos de idea/roadmap (siempre)

| Artefacto                                                                                        | Siempre                   | Notas                              |
|--------------------------------------------------------------------------------------------------|---------------------------|------------------------------------|
| `docs/<domain>/idea/<IDEA-SLUG>/idea-analysis.md`                                                | No (opcional, Fase Pre-A) | Veredicto preliminar de viabilidad |
| `docs/<domain>/idea/<IDEA-SLUG>/scope-roadmap.md` (o legacy `…-scope-roadmap.md`)                | Sí                        | Alcance: múltiples vs única        |
| `docs/<domain>/idea/<IDEA-SLUG>/feature-prioritization.md` (o legacy `…-prioritized-roadmap.md`) | Sí                        | Scores RICE + ranking              |
| `docs/<domain>/idea/<IDEA-SLUG>/prd-roadmap-state.md`                                            | Sí (al cierre)            | Estado final del roadmap           |
| `docs/<domain>/idea/<IDEA-SLUG>/workflow-state.md`                                               | Sí (vivo)                 | Fuente de verdad para reanudación  |
| `docs/<domain>/roadmap.md`                                                                       | Sí (al cierre)            | Roadmap consolidado del dominio    |

## Artefactos por funcionalidad (`docs/<domain>/initiatives/<PRD-SLUG>/`)

| Artefacto                                  | Obligatorio    | Condición                                                                                 |
|--------------------------------------------|----------------|-------------------------------------------------------------------------------------------|
| `connectivity/prerequisites-assessment.md` | Sí             | Incluye modo greenfield (veredicto "conectado (greenfield)")                              |
| `connectivity/bridge-roadmap.md`           | No             | Solo si desconectado                                                                      |
| `requirements.md`                          | Sí             | —                                                                                         |
| `assumption-map.md`                        | No             | Recomendado; si se omitió, registrar stub o campo en `requirements.md`                    |
| `spike-notes.md`                           | No             | Si se ejecutó spike (feasibility gate o Conditional Go por riesgo técnico)                |
| `product-viability.md`                     | Sí             | —                                                                                         |
| `personas-mapping.md`                      | Sí             | + `docs/<domain>/personas/<persona>.md` canónicas si son nuevas                           |
| `use-cases.md`                             | Sí             | —                                                                                         |
| `harness-notes.md`                         | No             | Solo si `construir-demo` se ejecutó                                                       |
| `experiment-design.md`                     | No             | Solo si stage = Growth/Scale; si se omitió en MVP, registrar en `prd-workflow-summary.md` |
| `prd.md`                                   | Sí             | Main deliverable por funcionalidad                                                        |
| `prd-workflow-summary.md`                  | Sí (al cierre) | Resumen del workflow por funcionalidad                                                    |

## Verificación de cierre (Fase K.1)

Antes de `Ready for: planificar-epics`:

1. Confirma que todos los artefactos marcados "Sí" existen en disco.
2. Si falta un artefacto obligatorio → genéralo antes de cerrar; reporta qué se generó tardíamente.
3. Si falta un artefacto por omisión justificada (assumptions en greenfield, experimentos en MVP) → verifica que la omisión esté registrada (stub o campo en summary); si no, genera el registro antes de cerrar.
4. Verifica que `workflow-state.md` refleja `current-step = consolidar-resultados` o posterior.
