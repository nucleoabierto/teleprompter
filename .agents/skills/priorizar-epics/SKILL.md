---
name: priorizar-epics
description: >-
  Prioriza epics dentro de un plan de epics usando metodología RICE (Reach,
  Impact, Confidence, Effort). Genera roadmap priorizado con ranking y
  recomendación de implementación. Úsalo después de planificar-epics cuando
  hay múltiples epics y necesitas decidir cuál implementar primero. No lo usas
  para priorizar funcionalidades (usar priorizar-roadmap) ni para dividir
  epics en tareas (usar dividir-epic).
---

# Priorizar Epics

Prioriza epics dentro de un plan de epics usando metodología RICE (Reach, Impact, Confidence, Effort). Genera roadmap priorizado con ranking y recomendación de implementación. Úsalo después de planificar-epics cuando hay múltiples epics y necesitas decidir cuál implementar primero. No lo usas para priorizar funcionalidades (usar priorizar-roadmap) ni para dividir epics en tareas (usar dividir-epic).

## Input

- Ruta al documento de plan de epics: `docs/<domain>/initiatives/<PRD-SLUG>/epics/epic-plan.md`
- (Opcional) Contexto del negocio: restricciones de recursos, timeline, objetivos estratégicos

## Output

- Documento de priorización: `docs/<domain>/initiatives/<PRD-SLUG>/epic-prioritization.md` con:
  - Tabla de epics con scores RICE calculados
  - Ranking basado en valor vs esfuerzo
  - Ajustes por dependencias (epics bloqueados)
  - Recomendación de implementación (qué epic primero, cuáles en paralelo, cuáles después)
  - `Ready for: seleccionar-epic`

## Fases

### Fase A: Cargar y analizar plan de epics
- Leer `docs/<domain>/initiatives/<PRD-SLUG>/epics/epic-plan.md`
- Extraer lista de epics con sus AC, dependencias y estimaciones
- Identificar epics bloqueados por dependencias
- Mapear contexto del negocio si provisto

### Fase B: Calcular scores RICE por epic
Para cada epic:
- **Reach (Alcance)**: Cuántos usuarios/impacto afectará este epic en un periodo (ej: 1000 usuarios/mes, 5% de revenue). Escala: 1-10.
- **Impact (Impacto)**: Qué tan grande es el impacto en el objetivo (ej: masivo=3, alto=2, medio=1, bajo=0.5, mínimo=0.25). Escala: 0.25-3.
- **Confidence (Confianza)**: Qué tan confiado estás en las estimaciones de Reach e Impact (ej: alto=100%, medio=80%, bajo=50%). Escala: 0.5-1.
- **Effort (Esfuerzo)**: Cuánto tiempo/persona-meses requiere (ej: 1 persona-mes=1, 3 persona-meses=3). Escala: 1-10.
- **Score RICE**: (Reach × Impact × Confidence) / Effort

### Fase C: Ajustar por dependencias
- Marcar epics bloqueados como "Blocked until [epic-dependencia]"
- Si un epic bloqueado tiene score alto, considerar desbloquearlo primero implementando la dependencia
- Documentar trade-offs: ¿vale la pena implementar un epic de bajo score para desbloquear uno de alto score?

### Fase D: Generar ranking y recomendación
- Ordenar epics por score RICE descendente
- Agrupar en buckets:
  - **Must-have now**: Score alto, no bloqueado, alineado con objetivos estratégicos
  - **Should-have soon**: Score medio, no bloqueado
  - **Could-have later**: Score bajo, no bloqueado
  - **Won't-have**: Score muy bajo o bloqueado sin claro path de desbloqueo
- Recomendar secuencia de implementación:
  - Qué epic implementar primero
  - Qué epics pueden implementarse en paralelo
  - Qué epics implementar después
  - Qué epics posponer o rechazar

### Fase E: Escribir documento de priorización
Generar `docs/<domain>/initiatives/<PRD-SLUG>/epic-prioritization.md` con:
- Resumen ejecutivo: número de epics, score promedio, epic recomendado primero
- Tabla de epics con scores RICE detallados
- Matriz de dependencias
- Ranking con buckets
- Recomendación de implementación con timeline sugerido
- Trade-offs y riesgos identificados
- `Ready for: seleccionar-epic`

## Referencias

- `_shared/decision-matrix-template.md` - Template para matriz de decisión
- `_shared/dependency-table-template.md` - Template para tabla de dependencias
- `planificar-epics/SKILL.md` - Skill que genera el input de este skill

## Autoevaluación

- ¿Calculaste scores RICE para todos los epics?
- ¿Ajustaste por dependencias y marcaste epics bloqueados?
- ¿Generaste ranking con buckets claros?
- ¿Recomendaste secuencia de implementación con timeline?
- ¿Documentaste trade-offs y riesgos?
- ¿El documento tiene `Ready for: seleccionar-epic`?
