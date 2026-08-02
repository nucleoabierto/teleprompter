# Revisión local — input overlay

Skill-specific Phase 0 overlay para [revisar-cambios-locales](../SKILL.md). Resolución compartida: [file-discovery.md](./file-discovery.md).

## Requerido

- `TICKET-SLUG`: Inferir de nombre de rama, conversación o diff. Preguntar cuando falta: "¿Qué ticket corresponde a estos cambios? (ej. TASK-881)"
- `DIFF-BASE`: Defaultear a rama default remota. Preguntar cuando el usuario nombre otra base: "¿Cuál es la rama base para el diff? (default: rama default remota)"
- Fuente de contexto (≥ 1): Inferir de Research brief, página de documentación o AC de ticket. Preguntar cuando falta: "¿Qué fuente de contexto debo usar? (brief local, página de documentación, o ticket)"

## Opcional

- `TICKET-REVIEW`: Ruta `docs/**/<TICKET-ID>-ticket-review.md`. Rol cuando está presente: Contexto suplementario de alcance
- Revisión previa: Ruta `docs/**/<TICKET-ID>-local-review.md`. Rol cuando está presente: Contexto solo — escribe salida fresca para esta revisión

## Rutas de salida

- `docs/<domain>/<TICKET-SLUG>-local-review.md`

## Ready for downstream

- `open-pr`: Siguiente paso El usuario abre un PR tras la revisión
- `fix-locally`: Siguiente paso El usuario corrige en la rama antes de abrir PR
- `blocked`: Siguiente paso Detente; lista bloqueadores en el chat

Para revisión de PRs ya abiertos, usa `pr-review`.
