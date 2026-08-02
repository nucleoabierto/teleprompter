---
name: revisar-cambios-locales
description: >-
  Revisa cambios locales de rama contra la rama base antes de abrir un PR
  explicando resultados en chat (puntuación, estado de AC, hallazgos, Ready
  for) y opcionalmente escribiendo
  docs/<domain>/<TICKET-SLUG>-local-review.md. Úsalo cuando el usuario pida
  revisar, auditar, evaluar o validar cambios locales después de implementar
  pero antes de abrir un PR. No lo uses para PRs abiertos — usa pr-review para
  eso. No hace push, abre PR ni publica en la plataforma de código.
---

# Revisión local antes de PR

Revisa cambios locales de rama contra la rama base. Explica resultados en chat y opcionalmente escribe un brief de revisión durable en disco.

**No** hagas push, abras un PR, publiques en la plataforma de código ni apliques correcciones de código a menos que se te pida explícitamente. Pon la intención de producto desconocida en Preguntas abiertas; no la inventes.

Para un PR abierto, usa [revisar-pr](../revisar-pr/SKILL.md) en su lugar.

## Cuándo usarlo y cuándo no

- **Sí**: el usuario ha completado la implementación localmente y quiere revisar antes de abrir un PR.
- **No**: ya existe un PR abierto; para eso usa `pr-review`.

## Entrada y salida

- **Entrada**: `TICKET-SLUG` (string, obligatorio) o `CONTEXT-DOC-SLUG` (string, opcional) — ticket o brief en chat/archivo local.
- **Salida**: `review-summary` (string, markdown) — resumen en chat con puntuación, estado de AC, hallazgos y Ready for; opcionalmente `review-brief` (string, markdown) — brief completo en disco.

## Convenciones locales

- Trabaja con archivos locales o el chat.
- Sigue el protocolo de descubrimiento de archivos en `.devin/skills/_shared/file-discovery.md` (vía contexto → solicitud directa → invocación) para resolver `TICKET-SLUG` o `CONTEXT-DOC-SLUG`.
- El resumen se entrega en el chat. Si el usuario solicita guardar, escribe el archivo en la ruta indicada con `write`.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas (Fase 0) |
| [local-review-inputs-overlay.md](references/local-review-inputs-overlay.md) | Overlay específico de entradas para Fase 0 |
| [local-review-rubric.md](references/local-review-rubric.md) | Rúbrica de puntuación |
| [self-contained-comments.md](../_shared/self-contained-comments.md) | Convención de comentarios y mensajes de commit autocontenidos |

## Fase 0 — Resolver entradas

Sigue [local-review-inputs-overlay.md](references/local-review-inputs-overlay.md) para resolución de entradas específica de este skill.

Declara las entradas resueltas en el chat, luego procede. Ruta de salida opcional: `docs/<domain>/<TICKET-SLUG>-local-review.md`.

## Fase A — Cargar

1. Lee las fuentes resueltas para objetivo, criterios de aceptación, objetivos excluidos y restricciones de arquitectura.
2. Carga el diff local completo y el historial de commits vs `DIFF-BASE` usando `scripts/load-diff.sh`. Incluye cambios sin commitear que el usuario dice que están en alcance.
3. Si no hay diff vs `DIFF-BASE`, detente y reporta que no hay nada listo para revisar.

## Estrategia de fallo

- Si la fuente no existe o no se puede leer, pide el contenido en el chat.
- Si no hay diff vs la base, reporta que no hay cambios para revisar.
- Si no puedes acceder al diff local, reporta el bloqueo en Preguntas abiertas; no inventes hallazgos.

## Fase B — Revisar

Sigue [local-review-rubric.md](references/local-review-rubric.md) para puntuación.

Ejecuta el checklist completo de AC antes de puntuar. Cuando la intención de producto o diseño sea poco clara, agrega Preguntas abiertas en lugar de adivinar.

Marca como hallazgo los comentarios de código o mensajes de commit que dependan de referencias efímeras a artefactos del workflow (tickets, ADRs, PRDs, epics, TRDs) según [self-contained-comments.md](../_shared/self-contained-comments.md). El código y el historial deben ser legibles sin esa documentación.

Elige exactamente un valor `Ready for` y explica por qué:

- **`open-pr`**: Puntuación del cambio ≥ 9; todos los AC cumplidos; validación dirigida pasa (o N/A con justificación); sin hallazgos blocker o important.
- **`fix-locally`**: Puntuación del cambio < 9, cualquier hallazgo blocker o important, o validación falló en rutas cambiadas. Corrige en la rama antes de abrir un PR.
- **`blocked`**: No se puede completar la revisión: contexto faltante, sin diff, o Preguntas abiertas que bloquean un veredicto justo.

No recomiendes `open-pr` cuando la validación falló en rutas cambiadas o quedan gaps de AC.

## Fase C — Explicar en chat

**Entrega el resumen** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`.

1. Declara la puntuación del cambio (1–10) y una visión general de 2–4 oraciones.
2. Declara Ready for — exactamente uno de `open-pr` | `fix-locally` | `blocked` — con justificación.
3. Lista cada criterio de aceptación como cumplido, parcial o faltante (una línea cada uno).
4. Lista los hallazgos principales en orden de severidad; cuando la puntuación ≥ 9, declara eso y lista solo nits opcionales (máximo tres).
5. Reporta comandos de validación ejecutados y estado pass/fail, o nota gaps.
6. Lista solo las preguntas abiertas sin resolver.

Para el pase de convenciones en el brief, usa `scripts/find-convention-siblings.sh` para identificar archivos hermanos y comparar patrones.

El resumen en chat es el entregable principal.

## Fase D — Escribir el brief de revisión (opcional)

Si el usuario pide guardar, escribe en `docs/<domain>/<TICKET-SLUG>-local-review.md` (crea `docs/<domain>/` si es necesario).

Usa las secciones requeridas del brief (se listan abajo), más:

- Resumen de diff base y commits (nombre de rama, rama base, conteo de commits, alcance en un párrafo)
- Ready for — exactamente uno de `open-pr` | `fix-locally` | `blocked`

Mejora el brief de revisión en como máximo 2 rondas hasta que la puntuación del brief sea ≥ 9 según la rúbrica. Si sigue por debajo de 9 después de 2 rondas, detente y reporta bloqueos.

**Secciones requeridas del brief**

1. Puntuación del cambio + visión general
2. Resumen de diff base y commits
3. Checklist de criterios de aceptación (cada AC: cumplido / parcial / faltante, más evidencia)
4. Hallazgos por severidad (blocker, important, nit)
5. Estado de validación (comandos ejecutados y pass/fail)
6. Pase de convenciones (≥2 rutas hermanas citadas)
7. Efectos de segundo orden (callers, jobs, flags, auth/PII, mobile/legacy)
8. Puntuación del brief + breve justificación
9. Ready for: `open-pr` | `fix-locally` | `blocked` — exactamente uno + por qué
10. Preguntas abiertas (solo elementos sin resolver)

## Autoevaluación antes de terminar

- El resumen en chat está completo con puntuación, Ready for, estado de AC, hallazgos y validación.
- Si se escribe el brief: puntuación del brief ≥ 9 (o bloqueos documentados después de 2 rondas).
- Ready for es exactamente uno de `open-pr` | `fix-locally` | `blocked`.
- No se ha hecho push, abierto PR ni publicado en la plataforma de código.

## Termina cuando

El humano tiene un resumen accionable en el chat. Opcionalmente, el archivo `docs/<domain>/<TICKET-SLUG>-local-review.md` está en disco con la puntuación del cambio, una puntuación del brief ≥ 9 (o bloqueos documentados), resumen de diff base, checklist de AC, pase de convenciones, estado de validación, Ready for y Preguntas abiertas.

Termina el mensaje final con este bloque de handoff:

```markdown
## Handoff — local-review
- TICKET-SLUG: …
- Puntuación del cambio: <N>/10
- Ready for: <valor del menú>
- Blockers: <lista o "none">
- Summary: <2–4 oraciones>
```
