# Revisión de ticket — input overlay

Skill-specific Phase 0 overlay para [ticket-review](../SKILL.md). Resolución compartida: [file-discovery.md](./file-discovery.md).

## Requerido

- `TICKET-SLUG`: Inferir de Mensaje, URL de tu herramienta de gestión de tareas, nombre de rama, nombre de archivo en `docs/`. Preguntar cuando falta: "¿Qué ticket debo revisar? (ej. TASK-881)"

## Opcional

- `CONTEXT-DOC`: Ruta `docs/**/<TICKET-ID>-context-brief.md`. Rol cuando está presente: Contexto suplementario — el ticket de la fuente es autoritativo
- `TICKET-REVIEW` previo: Ruta `docs/**/<TICKET-ID>-ticket-review.md`. Rol cuando está presente: Contexto solo — escribe salida fresca para esta revisión

## Fuentes de carga

Carga el ticket desde tu herramienta de gestión de tareas (vía MCP), documentación de referencia (cuando esté enlazada) o desde una ruta local proporcionada. Cuando existan documentos opcionales, úsalos como evidencia suplementaria. Para manejo de fallos de MCP y reglas de precedencia entre fuentes, ver [file-discovery.md](./file-discovery.md).

## Estrategia de carga

1. Lee el ticket de tu herramienta de gestión de tareas: objetivo, criterios de aceptación, descripción, alcance, dependencias, estimación y notas de testing o QA.
2. Si el ticket tiene enlaces a documentación de referencia (descripción, comentarios, attachments), carga esas páginas vía MCP según el protocolo de descubrimiento en file-discovery.md.
3. Si tiene un epic padre, bloqueado-por / bloqueando, o tickets relacionados (de Referencias), sigue esos enlaces hasta que el grafo de dependencias sea claro.
4. Cuando existan documentos opcionales, intégralos como contexto suplementario aplicando las reglas de precedencia: gestión de tareas gana para AC/alcance, documentación de referencia gana para arquitectura/TDD/intención de diseño, docs locales ganan para estado del codebase.
5. Revisa el codebase: nombra al menos 2 entry-points reales, servicios, rutas, jobs o feature flags que el ticket probablemente toque, y cita rutas de archivo.
6. Pase de convenciones: encuentra ≥2 tickets similares o artefactos de workflow previos, o tickets hermanos en el mismo dominio; cita rutas y nota patrones de estructura y AC.
7. Reporta discrepancias entre fuentes en la sección de Preguntas abiertas de la revisión.

Cuando el ticket no sea accesible o `TICKET-SLUG` no se pueda resolver después de preguntar, detente con Ready for `blocked`. Si MCP falla, sigue el protocolo de manejo de fallos de MCP en file-discovery.md.

## Ready for downstream

- `context-brief`: Siguiente paso Ejecuta `context-brief` para preparar contexto de implementación
- `refine`: Siguiente paso El usuario refina el ticket antes de continuar
- `blocked`: Siguiente paso Dependencia externa o bloqueador sin resolver; lista qué debe cambiar
