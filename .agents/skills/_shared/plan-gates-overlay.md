# Implementación desde plan — overlay de entradas

Overlay específico de Fase 0 para el skill `implementing`. Resolución compartida: [file-discovery.md](./file-discovery.md).

## Requerido

- `TICKET-SLUG`: Inferir desde Mensaje, URL de tu herramienta de gestión de tareas, nombre de rama, stem de filename en `docs/`. Preguntar cuando falta: "¿Qué ticket debo usar? (ej. TASK-881)"
- `PLAN-DOC-SLUG`: Inferir desde `docs/**/<TICKET-SLUG>-implementation-plan.md`. Preguntar cuando falta: "No se encontró plan de implementación para `<TICKET-SLUG>`. Usa el orquestador del workflow o `planning-implementation` cuando el contexto ya existe."

## Gates de readiness del plan

Lee `PLAN-DOC-SLUG` antes de la Fase A. Detente y pregunta cómo proceder cuando cualquier gate falle:

- **Puntuación del plan**: Condición de paso ≥ 9 en el archivo del plan. Cuando falla: Detente y usa `planning-implementation` — no improvises codificación
- **Ready for**: Condición de paso `implement`. Cuando falla: Reporta el valor Ready for del plan y pregunta si replanificar o desbloquear
- **Preguntas abiertas**: Condición de paso Ninguna sin resolver en el plan. Cuando falla: Resuelve con el usuario o detente

## Opcional

- `CONTEXT-DOC-SLUG`: Ruta `docs/**/<TICKET-SLUG>-research-brief.md`. Rol cuando está presente: Reconciliación de AC cuando el plan es ambiguo
- `TICKET-REVIEW`: Ruta `docs/**/<TICKET-SLUG>-ticket-review.md`. Rol cuando está presente: Contexto suplementario de AC
- `TRIAGE-DOC`: Ruta `docs/**/<TICKET-SLUG>-ticket-work-triage.md`. Rol cuando está presente: Alcance Primary/Secondary al reconciliar pasos del plan

Cuando los bloqueadores fuercen un cambio de alcance, detente y pregunta en lugar de editar los archivos del plan o contexto a menos que el usuario lo solicite.
