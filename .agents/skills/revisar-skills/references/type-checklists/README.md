# Checklists por tipo de skill

Checklists específicos para cada tipo de skill clasificado en `revisar-skills`.

## Sistema de clasificación de tipos

Clasifica el skill en exactamente un tipo primario. Aplica en orden — primer match gana:

1. **`composite`** — Principalmente enruta a skills hijos; cuerpo delgado que evita duplicar fases hijas
   - Checklist: [Composite](./composite.md)

2. **`orchestrator`** — Coordina múltiples pasos/skills con puertas entre ellos
   - Checklist: [Orchestrator](./orchestrator.md)

3. **`chat-gate`** — Entregable chat-only con veredicto pass/fail o readiness
   - Checklist: [Chat-gate](./chat-gate.md)

4. **`exploration`** — Ejecución desechable o riesgosa con stop-and-approve antes de actuar
   - Checklist: [Exploration](./exploration.md)

5. **`guidelines`** — Reglas prescriptivas durante implementación; reglas avoid/prefer, ejemplos, self-check
   - Checklist: [Guidelines](./guidelines.md)

6. **`domain-guide`** — Referencia o guía de convenciones sin estructura prescriptiva; fases opcionales
   - Checklist: [Domain-guide](./domain-guide.md)

7. **`workflow-step`** — Default — un artefacto principal o análisis con Fase 0–C (o equivalente)
   - Checklist: [Workflow-step](./workflow-step.md)

### Tie-breakers

- Si tanto `composite` como `orchestrator` aplican, elige `orchestrator` solo cuando el skill define puertas inter-paso más allá de la delegación.
- Si tanto `guidelines` como `domain-guide` aplican, elige `guidelines` cuando el cuerpo incluye reglas avoid/prefer, ejemplos bueno/malo, o checklist de self-check antes de terminar.
- Si tanto `workflow-step` como `guidelines`/`domain-guide` aplican, elige el tipo guía solo cuando no hay artefacto en disco requerido y no hay Fase C de escritura.

## Checklists por tipo

- [Checklist compartido (todos los tipos)](./shared.md)
- [Composite](./composite.md)
- [Orchestrator](./orchestrator.md)
- [Chat-gate](./chat-gate.md)
- [Exploration](./exploration.md)
- [Guidelines](./guidelines.md)
- [Domain-guide](./domain-guide.md)
- [Workflow-step](./workflow-step.md)

## Uso en revisar-skills

En Phase A del skill de revisión:

1. Clasifica el skill usando la tabla de orden (primer match gana)
2. Aplica tie-breakers si hay ambigüedad
3. Lee el checklist compartido + el checklist del tipo clasificado
4. Registra tipo y justificación de una línea en el snapshot
5. Usa ambos checklists en Phase B para la auditoría de cuerpo
6. Marca filas como pass | partial | missing | n/a con evidencia de una línea
7. Puntúa solo filas donde Requerido es sí o recomendado; omite n/a del tipo sin penalizar
