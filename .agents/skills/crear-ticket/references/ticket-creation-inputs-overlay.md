# Creación de ticket — input overlay

Skill-specific Phase 0 overlay para [crear-ticket](../SKILL.md). Resolución compartida: [file-discovery.md](./file-discovery.md).

## Requerido

- `INPUT`: Inferir de Mensaje, ruta de archivo local, URL de documentación, o contexto de conversación. Preguntar cuando falta: "¿Qué idea, brief, notas o ruta de archivo debo convertir en ticket?"

## Opcional

- `CONTEXT-DOC`: Ruta `docs/**/<slug>-*.md` (brief, investigación, notas). Rol cuando está presente: Contexto suplementario — el INPUT es autoritativo
- `TICKET-HERMANO`: Ruta `docs/**/<slug>-ticket.md` o ticket en herramienta de gestión. Rol cuando está presente: Pase de convenciones — estructura, estilo de AC y límites de alcance
- `DESIGN-DOC`: URL o ruta de documento de diseño. Rol cuando está presente: Restricciones de diseño y TDD

## Fuentes de carga

Carga el INPUT desde el chat, archivos locales, documentación (vía MCP) o herramientas de gestión. Cuando existan documentos opcionales, úsalos como evidencia suplementaria. Para manejo de fallos de MCP y reglas de precedencia entre fuentes, ver [file-discovery.md](./file-discovery.md).

## Estrategia de carga

1. Resuelve el INPUT desde el mensaje del usuario, ruta de archivo local, URL de documentación, o contexto de conversación.
2. Cuando el INPUT cite una página de documentación, fétchala con el MCP de documentación disponible.
3. Cuando un gap de producto bloquee la redacción, haz una pregunta enfocada antes de proceder.
4. Resuelve el equipo desde el INPUT (no asumas un default). También resuelve el proyecto, epic padre y tickets relacionados.
5. Busca duplicados o casi-duplicados: primero en documentos locales, luego en herramienta de gestión vía MCP si está disponible.
6. Cuando el INPUT cite un design doc, página de documentación, investigación, epic padre, o discusión de PR, lee esas fuentes y extrae restricciones.
7. Opcionalmente revisa el codebase solo lo suficiente para nombrar entry points reales (controladores, servicios, jobs, flags, rutas). Cita rutas.
8. Pase de convenciones: encuentra ≥2 borradores de ticket similares o artefactos de workflow bajo `docs/**/` (por ejemplo `…-ticket-review.md`, `…-research-brief.md`) o tickets hermanos en el mismo dominio. Cita rutas y adapta la estructura del borrador, estilo de AC y límites de alcance.

Declara las entradas resueltas en el chat, luego procede a la Fase A.

## Ready for downstream

- `context-brief`: Siguiente paso Ejecuta `context-brief` para preparar contexto de implementación cuando el ticket existe
- `export-to-tool`: Siguiente paso El borrador está listo para exportar a una herramienta de gestión específica
- `blocked`: Siguiente paso INPUT faltante, Preguntas abiertas sin resolver, o ticket duplicado encontrado
