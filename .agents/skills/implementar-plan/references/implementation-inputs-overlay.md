# Implementación desde plan — input overlay

Skill-specific Phase 0 overlay para [implementar-plan](../SKILL.md). Resolución compartida: [file-discovery.md](./file-discovery.md). Gates de readiness del plan: [plan-gates-overlay.md](./plan-gates-overlay.md).

## Requerido

- `TICKET-SLUG`: Inferir de Mensaje, URL de tu herramienta de gestión de tareas, nombre de rama, nombre de archivo en `docs/`. Preguntar cuando falta: "¿Qué ticket debo usar? (ej. TASK-881)"
- `PLAN-DOC`: Inferir de `docs/**/<TICKET-ID>-implementation-plan.md`. Preguntar cuando falta: "No encontré plan de implementación para `<TICKET-ID>`. Usa `planning-implementation` primero — no improvises codificación."

## Opcional

- `CONTEXT-DOC`: Ruta `docs/**/<TICKET-ID>-context-brief.md`. Rol cuando está presente: Reconciliación de AC cuando el plan es ambiguo
- `TICKET-REVIEW`: Ruta `docs/**/<TICKET-ID>-ticket-review.md`. Rol cuando está presente: Contexto suplementario de AC
- `TRIAGE-DOC`: Ruta `docs/**/<TICKET-ID>-ticket-work-triage.md`. Rol cuando está presente: Alcance Primario/Secundario al reconciliar pasos del plan

Cuando los bloqueadores fuercen un cambio de alcance, detente y pregunta en lugar de editar el plan o archivos de contexto a menos que el usuario lo solicite.

## Antes de implementar

Recomienda ejecutar `ejecutar-quiz-comprension` cuando el ticket toque auth/PII, dominios desconocidos o flujo de datos complejo. Procede solo si el usuario aprueba explícitamente saltar el quiz.
