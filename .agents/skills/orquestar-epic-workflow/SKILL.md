---
name: orquestar-epic-workflow
description: >-
  Orquesta el workflow completo de gestión de epics (validación de entrada →
  planificar-epics → priorizar-epics → evaluar-conectividad-epic → divid-epic
  → generar-trd → validar-viabilidad-tecnica → construir-spike [opcional] →
  validar-epic-completo → generar-adr → consolidar validación → loop de
  procesamiento para múltiples epics) con gates de go/no-go y ramas
  opcionales. Genera uno o múltiples epics validados con documentación técnica
  completa. Úsalo cuando el usuario pida crear, generar, desarrollar o
  implementar epics desde un PRD. No lo usas para ejecutar skills individuales
  del workflow.
---

# Orquestar Epic Workflow

Orquesta el workflow completo de gestión de epics (validación de entrada → planificar-epics → priorizar-epics → evaluar-conectividad-epic → divid-epic → generar-trd → validar-viabilidad-tecnica → construir-spike [opcional] → validar-epic-completo → generar-adr → consolidar validación → loop de procesamiento para múltiples epics) con gates de go/no-go y ramas opcionales. Genera uno o múltiples epics validados con documentación técnica completa. Úsalo cuando el usuario pida crear, generar, desarrollar o implementar epics desde un PRD. No lo usas para ejecutar skills individuales del workflow.

## Input

- Ruta al documento PRD: `docs/<domain>/<REQ-SLUG>-prd.md`
- (Opcional) Contexto del negocio: restricciones de recursos, timeline, objetivos estratégicos

## Output

- Summary del workflow: `docs/<domain>/<PRD-SLUG>-epic-workflow-summary.md` con:
  - Resumen de epics generados y validados
  - Matriz de decisión global
  - Plan de acción
  - Estado final del roadmap de epics
  - `Ready for: crear-ticket`

## Fases

### Fase 0: Validación de entrada
- Verificar que el PRD existe en `docs/<domain>/<REQ-SLUG>-prd.md`
- Validar que el PRD tiene `Ready for: planificar-epics`
- Si el PRD no cumple, sugerir ejecutar `orquestar-prd-workflow` primero
- Si el PRD cumple, proceder a Fase 1

### Fase 1: Planificar epics
- Ejecutar `planificar-epics` con el PRD como input
- Verificar que genera `docs/<domain>/initiatives/<PRD-SLUG>/epics/epic-plan.md`
- Extraer lista de epics generados

### Fase 2: Priorizar epics (rama opcional)
- Si hay múltiples epics (≥ 2), ejecutar `priorizar-epics`
- Verificar que genera `docs/<domain>/initiatives/<PRD-SLUG>/epic-prioritization.md`
- Seleccionar el epic más prioritario según el ranking
- Si hay un solo epic, proceder directamente a Fase 3

### Fase 3: Loop de procesamiento de epics
Para cada epic en el roadmap (en orden de priorización):

#### Fase 3A: Evaluar conectividad del epic
- Ejecutar `evaluar-conectividad-epic` con el epic seleccionado
- Verificar que genera `docs/<domain>/<EPIC-SLUG>-prerequisites-assessment.md`
- Si el veredicto es "Desconectado" o "Parcialmente conectado":
  - Verificar que genera `docs/<domain>/<EPIC-SLUG>-bridge-roadmap.md`
  - Preguntar al humano: ¿Implementar bridge roadmap o modificar epic para conectarse?
  - Si el humano elige implementar bridge, marcar epic como "Blocked until bridge implemented" y continuar con siguiente epic
  - Si el humano elige modificar epic, pedir al humano que modifique el epic y repetir Fase 3A
- Si el veredicto es "Conectado", proceder a Fase 3B

#### Fase 3B: Dividir epic
- Ejecutar `dividir-epic` con el epic seleccionado
- Verificar que genera `docs/<domain>/<EPIC-SLUG>-tasks.md`

#### Fase 3C: Generar TRD
- Ejecutar `generar-trd` con el epic seleccionado
- Verificar que genera `docs/<domain>/<EPIC-SLUG>-trd.md`
- **Gate de revisión de TRD**: Preguntar al humano: ¿Go/No-Go para continuar con arquitectura?
  - Si No-Go, detener procesamiento de este epic y preguntar si continuar con siguiente epic
  - Si Go, proceder a Fase 3D

#### Fase 3D: Validar viabilidad técnica (rama opcional)
- Ejecutar `validar-viabilidad-tecnica` con el epic seleccionado
- Verificar que genera `docs/<domain>/<EPIC-SLUG>-viability-assessment.md`
- Si detecta riesgo técnico no resuelto:
  - Preguntar al humano: ¿Go/No-Go para construir spike?
  - Si Go, ejecutar `construir-spike` para resolver la incógnita técnica
  - Verificar que el spike resuelve la pregunta
  - Si el spike no resuelve la pregunta, marcar epic como "Blocked until technical risk resolved" y continuar con siguiente epic
  - Si el spike resuelve la pregunta, proceder a Fase 3E
- Si no hay riesgo técnico, proceder directamente a Fase 3E

#### Fase 3E: Validar epic completo
- Ejecutar `validar-epic-completo` con el epic seleccionado
- Verificar que genera:
  - `docs/<domain>/<EPIC-SLUG>-viability-assessment.md` (si no se generó antes)
  - `docs/<domain>/<EPIC-SLUG>-architecture.md`
  - `docs/<domain>/<EPIC-SLUG>-test-strategy.md`
  - `docs/<domain>/<EPIC-SLUG>-test-cases.md`
  - `docs/<domain>/<EPIC-SLUG>-complete-validation.md`

#### Fase 3F: Generar ADRs
- Ejecutar `generar-adr` con el TRD del epic
- Verificar que genera ADRs en `docs/<domain>/adr/ADR-001-*.md`

#### Fase 3G: Gate final de validación
- Preguntar al humano: ¿Go/No-Go para aprobar este epic?
  - Si No-Go, marcar epic como "Rejected" y preguntar si continuar con siguiente epic
  - Si Go, marcar epic como "Approved" y proceder a Fase 3H

#### Fase 3H: Verificar más epics
- Verificar si hay más epics pendientes en el roadmap
- Si sí, actualizar estado en `docs/<domain>/<PRD-SLUG>-epic-roadmap-state.md` y repetir desde Fase 3A con siguiente epic
- Si no, proceder a Fase 4

### Fase 4: Consolidar summary
- Generar `docs/<domain>/<PRD-SLUG>-epic-workflow-summary.md` con:
  - Resumen de epics procesados (total, aprobados, rechazados, bloqueados)
  - Matriz de decisión global (por epic: estado, score RICE, veredicto de conectividad, veredicto de viabilidad)
  - Plan de acción: qué epics implementar primero, en qué secuencia, cuáles posponer
  - Estado final del roadmap de epics
  - Recomendaciones y trade-offs identificados
  - `Ready for: crear-ticket`

## Referencias

- `_shared/orchestrator-pattern.md` - Pattern para orquestadores
- `_shared/plan-gates-overlay.md` - Pattern para gates de decisión
- `planificar-epics/SKILL.md` - Skill de planificación de epics
- `priorizar-epics/SKILL.md` - Skill de priorización de epics
- `evaluar-conectividad-epic/SKILL.md` - Skill de evaluación de conectividad
- `dividir-epic/SKILL.md` - Skill de división de epics
- `generar-trd/SKILL.md` - Skill de generación de TRD
- `validar-viabilidad-tecnica/SKILL.md` - Skill de validación de viabilidad técnica
- `construir-spike/SKILL.md` - Skill de construcción de spike
- `validar-epic-completo/SKILL.md` - Skill de validación completa de epic
- `generar-adr/SKILL.md` - Skill de generación de ADRs

## Autoevaluación

- ¿Validaste que el PRD tiene `Ready for: planificar-epics`?
- ¿Ejecutaste `planificar-epics` y verificaste el output?
- ¿Si hay múltiples epics, ejecutaste `priorizar-epics`?
- ¿Para cada epic, ejecutaste el flujo completo (conectividad → dividir → TRD → viabilidad → spike [opcional] → validación → ADR)?
- ¿Aplicaste gates de Go/No-Go en TRD y validación final?
- ¿Si el epic está desconectado, generaste bridge roadmap?
- ¿Si hay riesgo técnico, ejecutaste spike?
- ¿Implementaste loop de procesamiento para múltiples epics?
- ¿Generaste summary consolidado con matriz de decisión global?
- ¿El summary tiene `Ready for: crear-ticket`?
