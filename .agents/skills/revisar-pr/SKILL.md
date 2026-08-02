---
name: revisar-pr
description: >-
  Revisa un PR local: carga o genera contexto del ticket, puntúa el cambio y
  escribe docs/<domain>/<TICKET-ID>-pr-<N>-review.md y
  …-pr-<N>-review-comments.md con bloques de comentarios postables en la
  plataforma de control de versiones. Solo análisis — sin correcciones de
  código, publicaciones en la plataforma ni merge. Establece Ready for en
  improve, merge-nits-only o blocked. Úsalo cuando el usuario pida revisar,
  auditar, evaluar o puntuar un PR (checklist de AC, convenciones, hallazgos,
  readiness), y no para aplicar correcciones, publicar en la plataforma ni
  modificar código.
---

# Revisión de PR con contexto

Evalúa un PR local, puntúa el cambio y establece Ready for en `improve`, `merge-nits-only` o `blocked`. Carga o genera contexto y escribe un brief de revisión más bloques de comentarios postables en disco. Un resumen en el chat no es suficiente.

**Solo análisis**: sin correcciones de código, publicaciones en la plataforma de control de versiones ni merge a menos que se solicite explícitamente. Pon la intención de producto desconocida en Preguntas abiertas. Cuando Ready for es `improve`, el autor aplica correcciones localmente vía `pr-improvement`.

## Cuándo usarlo y cuándo no

- **Sí**: el usuario pide evaluar un PR (puntuación, hallazgos, readiness) antes de merge o mejora.
- **No**: el usuario pide aplicar correcciones al PR (`pr-improvement`), publicar comentarios o mezclar.

## Entrada y salida

- **Entrada**: `PR-NUMBER` (string, obligatorio) y `TICKET-SLUG` (string, obligatorio).
- **Salida**: `review-brief` (string, markdown) — brief con puntuación del PR, puntuación del brief, hallazgos ordenados y `Ready for`; se escribe en `docs/<domain>/<TICKET-ID>-pr-<PR-NUMBER>-review.md`. `review-comments` (string, markdown) — bloques de comentarios postables en la plataforma de control de versiones; se escribe en `docs/<domain>/<TICKET-ID>-pr-<PR-NUMBER>-review-comments.md`.

## Convenciones locales

- Trabaja con archivos locales o el chat.
- Sigue el protocolo de descubrimiento de archivos en `.devin/skills/_shared/file-discovery.md` (vía contexto → solicitud directa → invocación) para resolver `PR-NUMBER` y `TICKET-SLUG`.
- Los entregables se escriben en disco bajo `docs/<domain>/` (brief de revisión y archivo de comentarios). El resumen se presenta en el chat.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas |
| [pr-review-inputs-overlay.md](references/pr-review-inputs-overlay.md) | Overlay específico de entradas y fuentes de carga |
| [self-contained-comments.md](../_shared/self-contained-comments.md) | Convención de comentarios y mensajes de commit autocontenidos |

## Fase 0 — Resolver entradas

Requerido: `PR-NUMBER` y `TICKET-SLUG`. Opcional: brief de contexto existente en ruta local.

Declara las entradas resueltas en el chat, luego procede.

## Fase A — Generación de contexto

Carga o genera un brief de contexto puntuado antes de revisar:

1. Busca `docs/**/<TICKET-ID>-context-brief.md` o `docs/**/<TICKET-ID>-research-brief.md`.
2. Si falta o la puntuación del brief < 9: lee y sigue `context-brief` hasta completarlo. Detente si ese skill retorna `blocked`.
3. Si el brief existe con puntuación ≥ 9: cárgalo como `CONTEXT-DOC`; omite regeneración a menos que el usuario pida refrescar.

Registra la ruta del contexto en el chat, luego continúa.

## Fase B — Cargar PR

1. Lee `CONTEXT-DOC` para objetivo, criterios de aceptación, objetivos excluidos y restricciones de arquitectura.
2. Carga el diff completo del PR y el historial de commits de esta rama vs base.
3. Carga hilos de revisión del PR existentes (abiertos y resueltos) para que los hallazgos no dupliquen feedback ya resuelto. Produce hallazgos nuevos desde tu propio pase de rúbrica; omite hilos ya resueltos sin un ángulo nuevo.

Cuando `docs/**/<TICKET-ID>-pr-<PR-NUMBER>-review.md` o `docs/**/<TICKET-ID>-pr-<PR-NUMBER>-review-comments.md` existen de un pase previo, cárgalos solo como contexto y escribe salida fresca para esta revisión.

Si el PR es inaccesible o `PR-NUMBER` no se puede resolver después de preguntar, detente con Ready for `blocked`.

## Estrategia de fallo

- Si la fuente no existe o no se puede leer, pide el contenido en el chat.
- Si el PR no se encuentra localmente o no tiene diff accesible, no inventes hallazgos — reporta el bloqueo en Preguntas abiertas.
- Si no logras agrupar archivos temáticamente, lista el vacío y usa una lista de archivos como respaldo.

## Fase C — Revisar

Sigue las secciones requeridas del brief listadas abajo contra el diff del PR y `CONTEXT-DOC`.

**Secciones requeridas del brief:**
1. Puntuación del cambio + visión general
2. Resumen de diff base y commits
3. Checklist de criterios de aceptación (cada AC: cumplido / parcial / faltante, más evidencia)
4. Hallazgos por severidad (blocker, important, nit)
5. Estado de validación (comandos ejecutados y pass/fail)
6. Pase de convenciones (≥2 rutas hermanas citadas)
7. Efectos de segundo orden (callers, jobs, flags, auth/PII, mobile/legacy)
8. Puntuación del brief + breve justificación
9. Ready for: `merge-nits-only` | `improve` | `blocked` — exactamente uno + por qué
10. Preguntas abiertas (solo elementos sin resolver)

Ejecuta el checklist completo de AC antes de puntuar. Cuando la intención de producto o diseño sea poco clara, agrega Preguntas abiertas en lugar de adivinar.

Marca como hallazgo los comentarios de código o mensajes de commit que dependan de referencias efímeras a artefactos del workflow (tickets, ADRs, PRDs, epics, TRDs) según [self-contained-comments.md](../_shared/self-contained-comments.md). El código y el historial deben ser legibles sin esa documentación.

No:

- Recomendar `merge-nits-only` cuando cualquier criterio de aceptación sea parcial o faltante sin listarlo en el brief de revisión.
- Duplicar hallazgos en hilos de revisión ya resueltos a menos que el diff introduzca un ángulo nuevo.
- Etiquetar un hallazgo como `blocker` o `important` sin citar `CONTEXT-DOC`, el diff o una ruta de convención hermana.
- Recomendar `merge-nits-only` cuando se omitió validación dirigida en rutas cambiadas sin una justificación explícita de N/A en el brief.

Elige exactamente un valor `Ready for` y explica por qué:

- **`merge-nits-only`**: Puntuación del cambio ≥ 9; todos los AC cumplidos; sin hallazgos blocker o important. El revisor aprobaría el merge. Nits opcionales (máx 3) pueden notarse pero no bloquean.
- **`improve`**: Puntuación del cambio < 9, o cualquier hallazgo blocker o important. El autor aplica correcciones localmente vía `pr-improvement`.
- **`blocked`**: No se puede completar la revisión: contexto faltante, PR inaccesible, o Preguntas abiertas que bloquean un veredicto justo.

## Fase D — Escribir artefactos

Escribe ambos archivos bajo `docs/<domain>/` (crea la carpeta si es necesario):

1. Brief de revisión — `docs/<domain>/<TICKET-ID>-pr-<PR-NUMBER>-review.md` según las secciones requeridas listadas abajo. Revisa en máximo 2 rondas hasta que la puntuación del brief de revisión sea ≥ 9; si sigue por debajo de 9, detente y reporta bloqueos.

2. Archivo de comentarios — `docs/<domain>/<TICKET-ID>-pr-<PR-NUMBER>-review-comments.md` según la sección Review comments file de la rúbrica.

3. Resumen en chat — puntuación del cambio, Ready for, estado del checklist de AC, conteos de hallazgos por severidad y rutas a ambos archivos.

## Autoevaluación antes de terminar

- El brief de contexto existe con puntuación ≥ 9.
- Ambos artefactos de revisión están en disco con puntuación del brief de revisión ≥ 9 (o bloqueos documentados).
- El chat resume la puntuación, Ready for, estado del checklist de AC y conteos de hallazgos.
- Ready for es exactamente uno de `merge-nits-only`, `improve`, o `blocked`.

## Termina cuando

El brief de contexto existe con puntuación ≥ 9; ambos artefactos de revisión están en disco con puntuación del brief de revisión ≥ 9 (o bloqueos documentados); el chat resume la puntuación y Ready for. El autor puede handoff a `pr-improvement` cuando Ready for es `improve`.
