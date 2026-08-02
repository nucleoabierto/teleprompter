# Composite

Skills que principalmente enrutan a skills hijos; el cuerpo evita duplicar fases hijas.

## Checklist requerido

- Acción principal es delegación — declarada en la apertura
- Links explícitos a cada skill hijo usado
- Orden de delegación — qué hijo corre cuándo
- Cuerpo delgado — Fase A/B/C de hijos no duplicada
- Fase 0 — inputs mínimos para elegir/iniciar hijos
- Fronteras — qué no hace el composite (el hijo lo maneja)

## Checklist recomendado

- Diagrama de workflow o lista de pasos
- Done when cuando el composite produce un handoff doc o resumen de chat

## N/A para este tipo

- Gates entre pasos (usa `orchestrator` si existen puertas inter-paso)
- Fase C write + rúbricas de artefacto (los skills hijos son dueños de los artefactos)

## Anti-patrones

- Cuerpo que duplica fases hijas (indica que debería ser `orchestrator`)
- Sin links a skills hijos
- Mezcla de delegación con implementación directa
