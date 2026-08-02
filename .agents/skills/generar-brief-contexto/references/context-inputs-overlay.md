# Brief de contexto — input overlay

Skill-specific Phase 0 overlay para [context-brief](../SKILL.md). Resolución compartida: [file-discovery.md](./file-discovery.md).

## Requerido

- `TICKET-SLUG`: Inferir de Mensaje, URL de tu herramienta de gestión de tareas, nombre de rama, nombre de archivo en `docs/`. Preguntar cuando falta: "¿Qué ticket debo usar? (ej. TASK-881)"

## Opcional

- `TICKET-REVIEW`: Ruta `docs/**/<TICKET-ID>-ticket-review.md`. Rol cuando está presente: Contexto suplementario de AC y alcance
- Notas de spike: Ruta `docs/**/<TICKET-ID>-spike-notes.md`. Rol cuando está presente: Hallazgos técnicos del spike como input de contexto
- Notas de demo: Ruta `docs/**/<TICKET-ID>-demo-notes.md`. Rol cuando está presente: Resultado de demo como input de contexto

## Fuentes de carga

Carga el ticket desde tu herramienta de gestión de tareas (vía MCP), documentación de referencia (cuando esté enlazada) o desde una ruta local proporcionada. Cuando existan documentos opcionales, úsalos como evidencia suplementaria. Para manejo de fallos de MCP y reglas de precedencia entre fuentes, ver [file-discovery.md](./file-discovery.md).

## Estrategia de carga

1. Lee el ticket de tu herramienta de gestión de tareas: objetivo, criterios de aceptación, descripción y brechas abiertas.
2. Si el ticket tiene enlaces a documentación de referencia (descripción, comentarios, attachments), carga esas páginas vía MCP según el protocolo de descubrimiento en file-discovery.md.
3. Si tiene un epic padre, bloqueado-por / bloqueando, o tickets relacionados (de Referencias), sigue esos enlaces hasta que el grafo de dependencias sea claro.
4. Cuando existan documentos opcionales, intégralos como contexto suplementario aplicando las reglas de precedencia: gestión de tareas gana para AC/alcance, documentación de referencia gana para arquitectura/TDD/intención de diseño, docs locales ganan para estado del codebase.
5. Reporta discrepancias entre fuentes en la sección de Preguntas abiertas del brief.

Cuando el ticket no sea accesible o `TICKET-SLUG` no se pueda resolver después de preguntar, detente con Ready for `blocked`. Si MCP falla, sigue el protocolo de manejo de fallos de MCP en file-discovery.md.
