# Plan de implementación — input overlay

Skill-specific Phase 0 overlay para [planning-implementation](../SKILL.md). Resolución compartida: [file-discovery.md](./file-discovery.md).

## Requerido

- `TICKET-SLUG`: Inferir de Mensaje, URL de tu herramienta de gestión de tareas, nombre de rama, nombre de archivo en `docs/`. Preguntar cuando falta: "¿Qué ticket debo usar? (ej. TASK-881)"
- Fuente de contexto (≥ 1): Inferir de Ver tabla abajo. Preguntar cuando falta: "No encontré research brief para `<TICKET-ID>`. Pega una ruta de doc local, o debo ejecutar `context-brief` primero?"

### Opciones de fuente de contexto

- `CONTEXT-DOC`: Ruta o método de carga `docs/**/<TICKET-ID>-context-brief.md` o ruta del usuario. Rol: Contexto local primario
- Ticket de tu herramienta de gestión de tareas: Ruta o método de carga Ticket desde `TICKET-SLUG`. Rol: AC autoritativos cuando no existe brief local

No planifiques solo desde el ID del ticket a menos que el ticket sea lo suficientemente detallado para mapear criterios de aceptación.

## Opcional

- `TRIAGE-DOC`: Ruta `docs/**/<TICKET-ID>-ticket-work-triage.md`. Rol cuando está presente: División Primario/Secundario — cada ítem Primary debe aparecer en la guía de commits
- `TICKET-REVIEW`: Ruta `docs/**/<TICKET-ID>-ticket-review.md`. Rol cuando está presente: Contexto suplementario de AC y alcance
- Notas de spike: Ruta `docs/**/<TICKET-ID>-spike-notes.md`. Rol cuando está presente: Recomendación keep/rewrite/delete del spike como input de planificación
- Notas de demo: Ruta `docs/**/<TICKET-ID>-demo-notes.md`. Rol cuando está presente: Resultado de demo como input de planificación

Cuando el alcance cambie durante la planificación, detente y pregunta en lugar de editar archivos de contexto o triage a menos que el usuario lo solicite.
