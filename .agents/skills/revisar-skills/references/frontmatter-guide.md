# Guía de frontmatter de skills

Referencia compartida para los campos YAML `name` y `description` en el frontmatter de agent skills. Rúbricas de auditoría y autoría por campo:

- [naming-guide.md](./naming-guide.md) — patrones de verbos, léxico, alineación de acción
- [description-guide.md](./description-guide.md) — WHAT + WHEN, triggers, voz, routing tests

## Carga al inicio

Los agentes cargan solo `name` y `description` (~100 tokens cada uno) antes de la activación. El cuerpo completo del `SKILL.md` se carga al invocar.

- **`name`**: ID estable; verbo inicial debe coincidir con acción principal; debe coincidir con directorio
- **`description`**: API de routing — WHAT + WHEN + triggers + fronteras

Un buen `name` con un `description` débil igual falla el routing. Corrige primero el `description` para precisión de triggers; renombra cuando el verbo o etapa engaña a humanos, slash commands u orquestradores.

## Restricciones de spec

- **`name`**: 1–64 chars; solo `a-z`, `0-9`, `-`; debe coincidir con directorio padre; sin guiones iniciales/finales/consecutivos
- **`description`**: 1–1024 chars; no vacío; tercera persona recomendada

Campos opcionales (cuando aplica): `allowed-tools`, `triggers`, `argument-hint`.

Ejemplos de `name`: válido `revisar-skills`, `plan-ticket-implementation`; inválido `ReviewSkill`, `-review`, `review--skill`, nombre ≠ directorio.

## Regla de prioridad

Un `description` que falla el routing test hace que el skill sea invisible para el orquestrador o para la selección automática, aunque el cuerpo sea perfecto. Prioriza la corrección del `description` antes de cualquier otra mejora.
