# Notas operacionales

Referencia para operación del orquestador: reanudación tras interrupción, timings esperados y criterios experimentales por estado del producto.

## Reanudación tras interrupción

El orquestador soporta reanudación idempotente tras interrupciones (caída de sesión, cierre de terminal, error a mitad de fase). El mecanismo se basa en `workflow-state.md` como fuente de verdad.

**Cómo funciona:**

1. Al iniciar (Fase 0.5), el orquestador lee `workflow-state.md` si existe.
2. Determina `last-completed-step` y `current-functionality`.
3. Verifica que los artefactos listados como completados siguen en disco (detección de inconsistencias).
4. Salta directamente a la fase siguiente al último paso completado.
5. Cada fase aplica un skip-check antes de invocar su skill: si el paso ya está registrado como completado y el artefacto existe, se omite.

**Garantía de seguridad frente a artefactos a medias:**

El state file solo registra un paso como completado DESPUÉS de confirmar que el artefacto existe en disco. Si el proceso se interrumpe entre la escritura del artefacto y la actualización del state file, el paso NO se registra como completado → la reanudación re-ejecuta el paso (safe). El skill individual sobreescribe el artefacto parcial, no hay corrupción.

**Reanudación manual (sin orquestador):**

Si prefieres no re-invocar el orquestador completo:

1. Lee `docs/<domain>/idea/<IDEA-SLUG>/workflow-state.md` para ver `last-completed-step` y `current-functionality`.
2. Invoca el skill individual del siguiente paso (ver tabla canónica en [state-reconstruction.md](./state-reconstruction.md)).
3. Al terminar la funcionalidad actual, re-invoca `orquestar-prd-workflow` — el loop (Fase I) usará `prd-roadmap-state.md` para retomar la siguiente funcionalidad.

**Limpieza del state file:**

`workflow-state.md` es un archivo vivo del workflow. Tras el cierre exitoso (Fase K.1), conserva su valor final como registro auditable de la ejecución. No se elimina automáticamente. Si quieres forzar una ejecución desde cero, borra `workflow-state.md` antes de invocar el orquestador.

## Timings esperados (según estado)

| Fase                             | MVP     | Growth  | Scale   |
|----------------------------------|---------|---------|---------|
| Capturar                         | 1h      | 1h      | 1h      |
| Validar                          | 2h      | 2h      | 2h      |
| Spike                            | +4-8h   | +4-8h   | +4-8h   |
| Usuarios                         | 4h      | 4h      | 4h      |
| Casos                            | 4h      | 4h      | 4h      |
| Demo                             | +2-4h   | +2-4h   | +2-4h   |
| PRD                              | 4h      | 4h      | 4h      |
| **Total (sin ramas opcionales)** | **15h** | **15h** | **15h** |

Total workflow: ~1-2 días de trabajo (no lineal, puede parallelizar).

## Criterios experimentales por estado

```
MVP (<1000 users):
  Metric: Feature adoption
  Test: Manual surveys + signups
  Timeline: 2 weeks
  Success: >60% adoption

Growth (1K-10K users):
  Metric: Retention lift
  Test: A/B landing page + cohorts
  Timeline: 4-6 weeks
  Success: >25% conversion, +5% retention

Scale (10K+ users):
  Metric: LTV impact + engagement
  Test: In-app A/B + cohort analysis
  Timeline: 4 weeks
  Success: >3% retention lift, NPS stable
```

**CRÍTICO**: PRD debe especificar estado + criterios apropiados.
