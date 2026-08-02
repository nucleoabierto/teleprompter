---
name: generar-prd
description: >-
  Genera PRD formal consolidando: visión, personas, casos de uso, requisitos
  funcionales, no-funcionales, y CRITERIOS EXPERIMENTALES. Salida:
  docs/<domain>/initiatives/<PRD-SLUG>/prd.md con PRD completo. Criterios
  experimentales son estado-específicos (MVP: signups+surveys, Growth: A/B
  landing, Scale: A/B in-app). Úsalo después de mapear casos para generar PRD
  listo para planificación arquitectónica.
---

# Generador de PRD

Genera PRD formal consolidando: requerimientos capturados, personas, casos de uso, requisitos técnicos, y CRITERIOS EXPERIMENTALES contextualizados al estado del producto.

Solo documentación: no aprueba. Genera documento formal.

## Fase 0 — Resolver entrada

Requerido: `REQ-SLUG` o `USE-CASES-RUTA`.

Infiere desde:
- Ruta: `docs/**/initiatives/**/use-cases.md`
- Contenido pegado: si usuario pega casos de uso
- Previo: busca archivo más reciente de `*-use-cases.md`

Pregunta cuando falta: "¿Qué requerimiento? (ruta o slug)"

Declara inputs resueltos: requerimiento, casos de uso leídos.

## Fase A — Consolidar Visión

Toma del requerimiento y viabilidad:
- Problema de negocio
- Solución propuesta
- Personas afectadas
- Restricciones y timeline

## Fase B — Consolidar Requisitos Funcionales

De casos de uso, extrae:
- **Happy paths**: Workflows principales de cada persona
- **Alternative paths**: Variaciones importantes
- **Edge cases**: Manejo de errores, estados especiales
- **Precondiciones/Postcondiciones**: Estado antes y después

Estructura:
```
### Requisitos Funcionales

**RF-1: Alert Management**
- Sistema debe detectar user inactividad (>7 days)
- Sistema debe generar alerts para personas autorizadas
- Sistema debe respetar user notification preferences
- Sistema debe batching si >1 alert per hour
- Usuarios pueden snooze, dismiss, o action alerts

**RF-2: Re-engagement Flow**
- Sistema debe enviar automated email para inactivos
- Sistema debe track clicks e re-engagement
- CS puede manually trigger re-engage flows
- Metrics visible en dashboard

**RF-3: User Preferences**
- Users controlan notification channels (email, push, in-app)
- Users controlan frequency (immediate, daily digest)
- Users pueden opt-out completamente
```

## Fase C — Consolidar Requisitos No-Funcionales

```
### Requisitos No-Funcionales

**Performance**:
- Alert delivery: < 5 min latency
- Dashboard load: < 2 sec
- Re-engagement email: sent within 1 hour of action

**Reliability**:
- System uptime: 99.5%
- Notification delivery reliability: 99%
- Graceful degradation if notification service down

**Scalability**:
- Handle 10K+ concurrent alerts
- Handle 1M+ notifications per day
- Database: < 100ms query at peak

**Security**:
- User notification preferences encrypted
- No PII in audit logs
- Webhook signature verification

**Compliance**:
- GDPR: users can request deletion of notifications
- SOC2: audit logs of all alert actions
```

## Fase D — Definir Criterios Experimentales (CRÍTICO)

**Gate de no-duplicación**: si `docs/<domain>/initiatives/<PRD-SLUG>/experiment-design.md` existe (generado por `disenar-experimentos`), **referenciarlo** en la sección 7 del PRD en vez de reescribir los criterios. Incluir solo un resumen de 1-2 líneas + link relativo. Los criterios detallados (hypothesis, primary metric, guardrail metrics, decision rules, sample size) viven en `experiment-design.md` — no los dupliques en el PRD. Solo si `experiment-design.md` NO existe (stage MVP con stub "Omitido", o se omitió `disenar-experimentos`), usar los criterios estado-específicos por defecto de abajo.

**Los criterios deben ser apropiados al estado del producto:**

```
### Criterios Experimentales (ESTADO-ESPECÍFICOS)

## IF MVP (<1000 users, <3 months)

**Métrica de Éxito Primary**:
- Sign-ups de usuarios que solicitan notificaciones: >60%
- Razón: Early adopters indicarán si feature is desirable

**Validación Secundaria**:
- User surveys (5+ users): "Does this solve your problem?"
- In-app usage: Users activando feature within first week
- NO: A/B tests (muestra muy pequeña, falta data)

**Success Threshold**:
- >60% signup opt-in = Feature is desirable
- >70% of opted-in using weekly = Feature is usable
- Negative feedback on 0-1 critical issues = Feature OK

**Timeline**: 2 weeks de observación post-launch

---

## ELIF Growth (1K-10K users, 3-12 months)

**Métrica de Éxito Primary**:
- A/B test landing page: Feature describe vs control
- Conversion rate: users enabling notifications
- Success: >25% conversion rate (p < 0.05)

**Validación Secundaria**:
- Retention increase: users with alerts > users without
- Support tickets reduction: <15% decrease acceptable
- User surveys: 50+ responses on usability

**Experimental Design**:
- Landing page A/B test (2 weeks)
- Cohort retention analysis (4 weeks)
- Surveys (concurrent)

**Success Threshold**:
- >25% conversion in A/B test
- Retention uplift >5% vs control
- No critical UX issues in surveys

**Timeline**: 4-6 weeks

---

## ELSE Scale (10K+ users, 1+ years)

**Métrica de Éxito Primary**:
- In-app A/B test: alerts enabled vs disabled
- Measure: user engagement, retention, NPS
- Success: retention uplift >3%, NPS neutral or positive

**Validación Secundaria**:
- Cohort analysis: age, geography, persona
- Business impact: LTV increase if retention up
- CS impact: ticket reduction (if measurable)

**Experimental Design**:
- In-app holdout: 10% control, 90% treatment
- Duration: 4 weeks minimum
- Segmented by: persona, region, cohort

**Success Threshold**:
- Retention uplift >3% (statistically significant)
- NPS no degradation
- <5% increase in support tickets (if any)

**Timeline**: 4 weeks

---

## GENERAL: Fallback if State Unknown

Usar MVP criteria (conservative). Upgrade después si growth evident.

```

## Fase E — Mapear Métricas de Éxito

```
### Métricas de Éxito (Estado-Específicas)

**North Star Metric** (estado-dependent):
- MVP: Feature adoption (% enabling)
- Growth: Retention lift from feature
- Scale: LTV impact + engagement lift

**Supporting Metrics**:
- Engagement: alerts delivered, actions taken, time-to-action
- Retention: churn reduction in alert-enabled cohort
- Satisfaction: NPS, CSAT for feature
- Technical: latency, reliability, error rates

**Observacion Strategy**:
- MVP: Manual surveys + in-app tracking
- Growth: Telemetría + survey + A/B landing
- Scale: Full cohort analysis + in-app A/B

**Evaluation Timeline** (estado-dependent):
- MVP: 2 weeks post-launch
- Growth: 4-6 weeks (A/B test duration)
- Scale: 4 weeks minimum in-app test
```

## Fase F — Definir Go/No-Go Criteria

**Gate de no-duplicación**: si `product-viability.md` ya definió condiciones de "Conditional Go" (sección 7 de ese artefacto), **no reescribir** esas condiciones en el PRD. Referenciar `product-viability.md` §7. El PRD solo declara los criterios Go/No-Go **post-release** (medición del éxito del MVP/release), no las condiciones de aprobación previa que ya viven en `product-viability.md`.

```
### Go/No-Go Decision Criteria

**Go Criteria**:
- (MVP) >60% adoption, no critical issues
- (Growth) >25% A/B conversion, retention neutral/positive
- (Scale) >3% retention uplift, NPS no degradation

**No-Go Criteria**:
- (MVP) <30% adoption after 2 weeks
- (Growth) <15% A/B conversion
- (Scale) >5% retention decrease or >10 NPS drop

**Conditional Go**:
- If partially successful but unclear, extend test
- OR pivot: change alert cadence, channels, targeting
- Then re-evaluate in 2 weeks

**Condiciones heredadas de Conditional Go** (si el veredicto de `product-viability.md` fue Conditional Go):
→ Referenciar `product-viability.md` §7. No reescribir las condiciones aquí.
→ Ej: "Ver [product-viability.md](product-viability.md) §7 para las 3 condiciones heredadas (2 de demanda en paralelo, 1 técnica como primera fase)."
```

## Fase G — Escribir PRD Formal

Estructura completa:

1. **Executive Summary**: Qué se construye, por qué, metrics de éxito
2. **Problem Statement**: El problema de negocio
3. **Personas**: Quiénes son los usuarios, motivaciones
4. **Use Cases**: Workflows principales y alternativas
5. **Requisitos Funcionales**: Feature-by-feature
6. **Requisitos No-Funcionales**: Performance, security, compliance
7. **Requisitos Experimentales** (ESTADO-ESPECÍFICOS):
   - Métrica primaria de éxito
   - Validación secundaria
   - Criterios go/no-go
   - Timeline de evaluación
   - **Gate de no-duplicación**: si `experiment-design.md` existe, **referenciarlo** (1-2 líneas de resumen + link) en vez de reescribir los criterios. Si no existe, usar criterios estado-específicos por defecto (ver Fase D).
8. **Out of Scope**: Qué NO se hace
9. **Timeline**: Restricción de timeline (NO descomponer en fases de implementación — eso es job de `planificar-epics`). Ver Fase H.
10. **Recursos**: Equipo asignado
11. **Riesgos y Mitigaciones**: **Referenciar** `product-viability.md` §5 (matriz de riesgo) + `assumption-map.md` (assumptions críticos). No reescribir la matriz. Añadir solo riesgos nuevos no cubiertos upstream.
12. **Sign-off**: Aprobaciones necesarias

**Flexibilidad según stage**:
- MVP: "Requisitos Experimentales", "Métricas de éxito" y "Go/No-Go criteria" pueden integrarse en Executive Summary cuando son simples (criterios cualitativos, dogfooding). No se requieren secciones separadas.
- Growth/Scale: Estas secciones DEBEN ser separadas con detalle completo (A/B test design, sample size, decision rules).
- Si `experiment-design.md` existe (de `disenar-experimentos`), **referenciarlo** en la sección de Requisitos Experimentales (no reescribir).
- Si no existe, usar criterios estado-específicos por defecto (ver Fase D).

## Salida

Escribe en: `docs/<domain>/initiatives/<PRD-SLUG>/prd.md`

**Header requerido** (al inicio del PRD):
- Req slug
- Dominio
- Fecha
- Skill: generar-prd
- Stage (MVP/Growth/Scale)
- Inputs: rutas de use-cases.md, personas-mapping.md, product-viability.md, requirements.md

**Secciones requeridas**:
- Executive Summary (1 pág)
- Problem Statement
- Personas y use cases (ref a documentos previos)
- Requisitos Funcionales (numbered)
- Requisitos No-Funcionales
- **Requisitos Experimentales (CRITICAL)**: Estado-específicos con métricas, criterios, timeline
- Metrics de éxito (con thresholds)
- Go/No-Go decision criteria
- Out of Scope
- Timeline
- Recursos
- Riesgos
- Sign-off
- Ready for: `planificar-epics` (architecture planning)

**Manejo de artefactos fuente faltantes**:
- `assumption-map.md`: opcional. Si existe, referenciar en Personas/Use Cases. Si no, omitir.
- `experiment-design.md`: opcional. Si existe, **referenciarlo** en Requisitos Experimentales (no reescribir). Si no, usar criterios estado-específicos.
- `personas-mapping.md`: referenciar en vez de `personas.md` (modelo de personas canónicas).

Ready for valores:
- `planificar-epics`: PRD aprobado, proceder a planificación arquitectónica
- `needs-review`: PRD completo pero necesita sign-off ejecutivo
- `blocked`: Criterios experimentales insuficientes, aclarar primero

### README de la iniciativa (índice del PRD)

Como último skill del workflow de PRD, este skill es responsable de crear o actualizar el índice de la iniciativa en `docs/<domain>/initiatives/<PRD-SLUG>/README.md`.

**Si no existe** `docs/<domain>/initiatives/<PRD-SLUG>/README.md`:
- Créalo como índice de la iniciativa con enlaces a todos los artefactos generados.

**Si existe** `docs/<domain>/initiatives/<PRD-SLUG>/README.md`:
- Actualízalo con el enlace al PRD recién generado y cualquier artefacto nuevo.

**README de iniciativa** (`docs/<domain>/initiatives/<PRD-SLUG>/README.md`):

Secciones requeridas:
1. Título y descripción de la iniciativa (PRD-SLUG + 1 oración)
2. Tabla de artefactos del PRD por fase:
   | Fase | Artefacto | Descripción |
   |---|---|---|
   | Requerimiento | requirements.md | ... |
   | Viabilidad | product-viability.md | ... |
   | Usuarios | personas-mapping.md | ... |
   | Casos de uso | use-cases.md | ... |
   | PRD | prd.md | ... |
3. Tabla de epics (placeholder, se completa en workflow de epics):
   | Epic | Slug | Estado | Artefactos |
   |---|---|---|---|
4. Estructura de cada epic validado (referencia)
5. ADRs relacionados (referencia a `adr/`)
6. Punto de entrada (link a epic-workflow-summary.md o roadmap.md)

Notas:
- Enlazar solo artefactos que EXISTEN. Si `assumption-map.md` o `experiment-design.md` no existen, omitir sus filas.
- Los artefactos de epic (epic-prioritization.md, epic-workflow-summary.md) se agregan cuando se ejecuta el workflow de epics posterior.

---

## Nota Crítica: Criterios Experimentales

**El PRD debe ser específico al ESTADO del producto:**

```
Estado del Producto → Criterios Experimentales Apropiados

MVP (Desembarco inicial)
└─ ¿Quieren esto? → Signups + Surveys (cualitativo)
   └─ NO: A/B tests (muestra: 100 users, varianza: 50%+, invalida)

Growth (Validación de mercado)
└─ ¿Cómo responden? → A/B landing pages + Surveys
   └─ Cohort analysis (retención, engagement)
   └─ A/B in-app cuando estés listo

Scale (Optimización)
└─ ¿Maximizar impacto? → A/B in-app + Cohort analysis
   └─ Full statistical rigor (p < 0.05, N sufficiently large)
   └─ Multi-variate testing si múltiples variables

**Si estado unknown**: Usar MVP criteria (conservative)
```

**Evita estos errores**:
- ❌ A/B test en MVP (muestra insuficiente)
- ❌ Surveys solo en Scale (ineficiente, muestra sesgada)
- ❌ Criterios no-específicos ("users love it" - indefinido)
- ❌ Timeline de evaluación irreal (A/B test 1 semana = insuficiente)
- ❌ **Descomponer la sección 9 (Timeline) en fases de implementación con dependencias** — eso es job de `planificar-epics`. El PRD solo declara la restricción de timeline.
- ❌ **Reescribir** los criterios experimentales, condiciones heredadas o la matriz de riesgo en el PRD — referenciar `experiment-design.md`, `product-viability.md` §7 y §5, y `assumption-map.md`.

## Fase H — Restricción de Timeline (NO decomposition en fases)

**Gate anti-pre-especificación de implementación**: la sección 9 (Timeline) del PRD declara **solo la restricción de timeline**, no la decomposition en fases de implementación. La decomposition en epics/fases es job de `planificar-epics` (Workflow 2).

**Permitido en sección 9**:
- "MVP target: ~3-4 semanas"
- "Buffer: +30%"
- "Observación post-release: +2 semanas"
- Restricciones de timing externas (ej: "antes de Q3 launch")

**NO permitido en sección 9** (va en `planificar-epics`):
- Tabla de fases internas con dependencias (Fase 1 → Fase 2 → Fase 3)
- Duraciones por fase interna (ej: "Fase 1: 3-4 días, Fase 2: 3-4 días")
- Orden de implementación de componentes

**Si el PRD proviene de un `scope-roadmap.md` con fases internas** → referenciarlo: "Ver [scope-roadmap.md](../../idea/<IDEA-SLUG>/scope-roadmap.md) para el desglose interno de fases. La decomposition en epics se realiza en `planificar-epics`."

## Autoevaluación (gate de no-duplicación y timeline)

Antes de finalizar, verifica además:

- [ ] **No-duplicación**: la sección 7 (Requisitos Experimentales) **referencia** `experiment-design.md` (no reescribe los criterios) cuando ese artefacto existe
- [ ] **No-duplicación**: la sección 11 (Riesgos) **referencia** `product-viability.md` §5 y `assumption-map.md` (no reescribe la matriz de riesgo)
- [ ] **No-duplicación**: las condiciones heredadas de Conditional Go **referencian** `product-viability.md` §7 (no se reescriben)
- [ ] **Timeline**: la sección 9 declara solo la restricción de timeline (no descompone en fases de implementación con dependencias — eso es job de `planificar-epics`)

## Workflow posterior

Después de generar el PRD, el siguiente paso es `orquestar-epic-workflow` para cada PRD generado. El README de iniciativa se enriquecerá con:
- `epic-prioritization.md` (priorización RICE de epics)
- `epic-workflow-summary.md` (resumen del workflow de epics)
- `epics/README.md` (plan de epics)
- `epics/<epic-slug>/` (artefactos por epic)
