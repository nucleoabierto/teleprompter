# Revisión de PR — input overlay

Skill-specific Phase 0 overlay para [pr-review](../SKILL.md). Resolución compartida: [file-discovery.md](./file-discovery.md).

## Requerido

- `PR-NUMBER`: Inferir de Mensaje, URL de GitHub, rama actual. Preguntar cuando falta: "¿Qué número de PR debo revisar?"
- `TICKET-SLUG`: Inferir de Metadata del PR, nombre de rama, nombre de archivo en `docs/`. Preguntar cuando falta: "¿Qué ticket corresponde a este PR? (ej. TASK-881)"
- Fuente de contexto (≥ 1): Inferir de Research brief o ticket de tu herramienta de gestión de tareas. Preguntar cuando falta: "Pega una ruta de doc local, o trabajaré solo desde el ticket."

## Opcional

- `TICKET-REVIEW`: Ruta `docs/**/<TICKET-ID>-ticket-review.md`. Rol cuando está presente: Contexto suplementario de alcance
- Revisión previa: Ruta `docs/**/<TICKET-ID>-pr-<PR-NUMBER>-review.md` o `…-review-comments.md`. Rol cuando está presente: Contexto solo — escribe salida fresca para esta revisión

## Rutas de salida

- `docs/<domain>/<TICKET-ID>-pr-<PR-NUMBER>-review.md`
- `docs/<domain>/<TICKET-ID>-pr-<PR-NUMBER>-review-comments.md`

## Ready for downstream

- `merge-nits-only`: Siguiente paso El compañero publica la revisión en GitHub cuando esté listo
- `improve`: Siguiente paso El autor aplica correcciones localmente vía `pr-improvement`
- `blocked`: Siguiente paso Detente; lista bloqueadores en el chat

Para triage de hilos de revisión existentes, usa `comments-triage`.
