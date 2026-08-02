---
name: disenar-experimentos
description: >-
  Diseña setup riguroso de experimento con métricas, sample size, MDE y
  decision rules. Define hypothesis, primary metric, guardrail metrics y
  criterios de continue/kill/pivot. Salida:
  docs/<domain>/initiatives/<PRD-SLUG>/experiment-design.md. Úsalo después de
  mapear-casos-uso y antes de generar-prd.
---

# Diseñador de Experimentos

Diseña setup riguroso de experimento con métricas, sample size, MDE y decision rules. Define hypothesis, primary metric, guardrail metrics y criterios de decisión. Úsalo después de mapear-casos-uso y antes de generar-prd.

Solo diseño: no ejecuta, no implementa. Prepara experimento para ejecución.

**Condicionalidad por stage**: Este skill es apropiado solo para Growth (1K-10K users) y Scale (10K+ users) donde hay data suficiente para A/B testing. Para MVP (<1000 users), los criterios experimentales simplificados en `generar-prd` son suficientes y este skill debe omitirse.

## Cuándo usarlo y cuándo no

- **Sí**: Después de mapear-casos-uso y antes de generar-prd, cuando necesites diseñar un experimento riguroso con métricas, sample size y decision rules
- **No**: Para ejecutar experimentos (usa herramientas de experimentation platform), para análisis post-experimento (usa herramientas de analytics), para tests simples sin métricas complejas

## Fase 0 — Resolver entrada

**Gate de stage** — Verifica el stage del producto (de personas-mapping.md o product-viability.md):

IF Stage = MVP (<1000 users):
  → OMITE este skill
  → Ready for: generar-prd (con criterios estado-específicos por defecto)
  → Registro de omisión (preserva trazabilidad): escribe un stub `docs/<domain>/initiatives/<PRD-SLUG>/experiment-design.md` con header estándar, veredicto "Omitido por stage MVP (muestra insuficiente para A/B testing)" y Ready for: generar-prd. El stub es el registro de que el paso fue evaluado y omitido conscientemente, no saltado.

IF Stage = Growth (1K-10K users) o Scale (10K+ users):
  → Continúa con la ejecución normal del skill

Requerido: `REQ-SLUG` o `USE-CASES-RUTA`.

Infiere desde:
- Ruta: `docs/**/initiatives/**/use-cases.md`
- Contenido pegado: si usuario pega casos de uso
- Casos de uso previos: busca archivo más reciente

Pregunta cuando falta: "¿Qué requerimiento diseño? (ruta o slug)"

Declara inputs resueltos: casos de uso leídos.

## Fase A — Articular Hypothesis

**Null hypothesis**: "El cambio no tiene efecto en [primary metric]"

**Alternative hypothesis**: "[Specific change] will [increase/decrease] [primary metric] by [X%] because [mechanism]"

**Componentes de hypothesis fuerte**:
- **What**: Cambio específico (no "try green button")
- **Expected**: Dirección y magnitud esperada
- **Why**: Mecanismo causal (por qué esperamos el efecto)

**Ejemplo**:
- ❌ "Try green button"
- ✅ "Changing CTA color from blue to green will increase click-through rate by 5% because green is more visible on dark background"

## Fase B — Definir Primary Metric

**Criterios de good primary metric**:
- **Sensitivity**: Detecta cambios significativos
- **Proximity**: Cercano al cambio (no revenue para button color)
- **Business relevance**: Importa para el negocio
- **Measurable**: Puede medirse con data existente

**Ejemplos**:
- Button color test → CTR (no revenue)
- Onboarding flow → Completion rate (not signups)
- Pricing page → Conversion rate (not MRR)

## Fase C — Definir Guardrail Metrics

Métricas que protegen contra optimización ciega:

**Tipos**:
- **Guardrail metrics (non-inferiority)**: No deben empeorar significativamente
- **Deterioration metrics (inferiority)**: No deben empeorar en absoluto
- **Quality metrics**: Mantienen calidad del producto

**Ejemplos**:
- Primary: CTR ↑
- Guardrail: Conversion rate no baja > 2%
- Deterioration: Churn no sube
- Quality: Page load time no sube > 10%

## Fase D — Calcular Sample Size

Usar la fórmula y guía completa en `references/sample-size-formula.md`.

**Fórmula básica**:
```
Sample size = (Z_α + Z_β)² × p × (1-p) / MDE²
```

**Componentes clave**:
- **MDE (Minimum Detectable Effect)**: Mínimo cambio que importa (ej: 5%)
- **Power (1-β)**: Probabilidad de detectar efecto si existe (típico: 80%)
- **Significance (α)**: Probabilidad de falso positivo (típico: 5%)
- **Baseline (p)**: Tasa actual del metric

**Ejemplo rápido**:
- Baseline CTR: 10%, MDE: 5% relativo, Power: 80%, Significance: 5%
- Sample: ~30,000 usuarios por variante

Para cálculos detallados, consideraciones prácticas y errores comunes, consultar la referencia completa.

## Fase E — Definir Duración del Test

**Criterios**:
- Sample size requerida / tráfico diario
- Mínimo 1 semana (capturar variabilidad semanal)
- Máximo 4 semanas (evitar seasonality effects)
- Considerar business cycles

**Ejemplo**:
- Sample: 30,000 usuarios
- Tráfico diario: 5,000 usuarios
- Duración: 6 días → redondear a 1 semana

## Fase F — Definir Decision Rules

**Criterios de decisión**:

| Resultado Primary | Resultado Guardrails | Decisión |
|-------------------|---------------------|----------|
| Statistically significant ↑ | No degradation | Continue (implementar) |
| Statistically significant ↓ | N/A | Kill (rechazar) |
| Not significant | N/A | Pivot (rediseñar) |
| Significant ↑ | Guardrail violated | Re-evaluate (trade-off) |

**Statistical significance**:
- p-value < 0.05 (95% confidence)
- O usar Bayesian si preferido

## Fase G — Definir Setup Técnico

**Componentes**:
- **Population**: Quién es elegible (ej: signed-in users en supported markets)
- **Treatment**: Qué cambia (ej: green CTA enabled)
- **Comparator**: Control (current production)
- **Randomization unit**: User, session, page view
- **Traffic split**: 50/50 default, ajustar por risk

## Fase H — Escribir Experiment Design

Estructura:

1. **Resumen ejecutivo**: Hypothesis, primary metric, duración estimada
2. **Hypothesis articulation**: Null + alternative con mecanismo
3. **Primary metric**: Definición, baseline, MDE
4. **Guardrail metrics**: Lista con thresholds
5. **Sample size calculation**: Fórmula, resultado, justificación
6. **Test duration**: Días/semanas, justificación
7. **Decision rules**: Matriz de continue/kill/pivot
8. **Setup técnico**: Population, treatment, comparator, randomization
9. **Risks y mitigaciones**: Qué podría salir mal
10. **Ready for**: `generar-prd`

## Salida

Escribe en: `docs/<domain>/initiatives/<PRD-SLUG>/experiment-design.md`

**Header requerido** (al inicio del documento):
- [Req slug]
- Dominio
- Fecha
- Skill: disenar-experimentos
- Input: ruta del artefacto fuente

**Secciones requeridas**:
- Header requerido (al inicio del documento)
- Resumen ejecutivo
- Hypothesis articulation (null + alternative)
- Primary metric (definición, baseline, MDE)
- Guardrail metrics (lista con thresholds)
- Sample size calculation (fórmula, resultado)
- Test duration (justificación)
- Decision rules (matriz continue/kill/pivot)
- Setup técnico (population, treatment, comparator, randomization)
- Risks y mitigaciones
- Autoevaluación (checklist de validación)
- Ready for (`generar-prd`, `blocked`) con link relativo al siguiente artefacto

Ready for valores (con link relativo al siguiente artefacto):
- `generar-prd`: Experimento diseñado, proceder a PRD con criterios experimentales. Link: `prd.md`
- `blocked`: Experimento no puede diseñarse (data insuficiente, métricas no medibles)

## Autoevaluación

Después de completar el diseño de experimento, valida:

1. Hypothesis articulado correctamente (what, expected, why)
2. Primary metric cumple criterios (sensitivity, proximity, business relevance)
3. Guardrail metrics definidos apropiadamente
4. Sample size calculado correctamente
5. Duración justificada (sample size + mínimo 1 semana)
6. Decision rules claros (continue/kill/pivot)
7. Setup técnico completo (population, treatment, comparator, randomization)
8. Risks identificados con mitigaciones
9. Definición correcta del "Ready for"
10. Documento de salida accionable

Si alguna respuesta es "No", revisa y completa antes de marcar el skill como terminado.

## Referencias

- **Fórmula de Sample Size**: `references/sample-size-formula.md` - Fórmula completa, componentes, consideraciones prácticas
- **Matriz de Decision Rules**: `assets/decision-rules-matrix-template.md` - Template para reglas de decisión de experimentos

## Handoff

Este skill debe ejecutarse después de mapear-casos-uso. El output (experiment design) alimenta directamente a generar-prd, que incorporará los criterios experimentales en el PRD.

**Handoff explícito con `generar-prd`**:
- Si `experiment-design.md` existe, `generar-prd` debe incorporar sus criterios en la sección de Requisitos Experimentales.
- Si no existe, `generar-prd` usa criterios estado-específicos por defecto.

**Ready for generar-prd**: El experimento está completamente diseñado con hypothesis, métricas, sample size, decision rules y setup técnico. generar-prd usará este diseño como base para los criterios experimentales del PRD.

**Ready for blocked**: El experimento no puede diseñarse por falta de data o métricas no medibles. Requiere más contexto o información antes de proceder.
