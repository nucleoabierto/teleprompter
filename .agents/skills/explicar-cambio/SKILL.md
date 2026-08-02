---
name: explicar-cambio
description: >-
  Escribe un documento de enseñanza con antecedentes, recorrido narrativo,
  mapeo de criterios de aceptación y quiz de autoevaluación para que un humano
  pueda orientar la siguiente iteración de diseño. Salida:
  docs/<dominio>/<TICKET-ID>-explain-change.md (o la variante de PR). Lee docs
  locales, documentación, tareas y diffs de PR o ramas; puntúa el documento
  según explainer-rubric.md. Solo análisis — no publica en el repositorio ni
  reemplaza la revisión de PR. Úsalo para onboarding, discusión de diseño o
  enseñanza de un cambio — no para puertas de comprensión en vivo (usa
  understanding-quiz).
---

# Explicador de cambios

Escribe un documento de enseñanza estructurado en disco y resume la recomendación Ready for en el chat. El lector debe entender el cambio lo suficientemente bien como para orientar la siguiente iteración de diseño, no solo para aprobarlo o rechazarlo.

Solo análisis: sin publicaciones en GitHub, correcciones de código o quizzes de comprensión en vivo. Pon la intención de producto desconocida en Preguntas abiertas en lugar de adivinar. Para revisión de PR, usa [revisar-pr](../revisar-pr/SKILL.md). Para aplicar hallazgos de revisión localmente, usa [implementar-ticket](../implementar-ticket/SKILL.md). Para puertas de comprensión en vivo en el chat, usa [ejecutar-quiz-comprension](../ejecutar-quiz-comprension/SKILL.md).

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas (Fase 0) |
| [explainer-rubric.md](references/explainer-rubric.md) | Puntuación del explicador (1–10) |

## Fase 0 — Resolver entradas

Requerido: `TICKET-ID`. Infierelo desde el PR, la conversación o el archivo de contexto; pregunta si falta.

Elige una fuente o combínalas:

- Local + documentación + PR opcional cuando `CONTEXT-DOC` y/o `DOC-SOURCE` existen; carga el diff del PR cuando `PR-NUMBER` es inferible.
- PR primario cuando el usuario apunta a un PR; infiere `TICKET-ID` desde los metadatos del PR, y carga el brief local y los enlaces de documentación desde el ticket vinculado cuando estén disponibles.
- Diff de rama local cuando el usuario apunta a trabajo no commiteado o solo en rama sin PR; confirma la base del diff según file-discovery.

Si ninguna fuente es clara, pregunta: "¿Explicar desde un brief de contexto local, una spec de documentación, un PR abierto, o un diff de rama local?"

Declara las entradas resueltas en el chat, luego procede.

Escribe el explicador en una de estas rutas:

- Sin PR: `docs/<dominio>/<TICKET-ID>-explain-change.md`
- Con PR: `docs/<dominio>/<TICKET-ID>-pr-<PR-NUMBER>-explain-change.md`

## Fase A — Cargar

1. Lee las fuentes resueltas para el objetivo, criterios de aceptación, objetivos excluidos y restricciones de arquitectura desde docs locales, documentación, tareas y/o el PR según la Fase 0.
2. Cuando un PR o diff de rama local está en alcance, carga el diff completo y el historial de commits vs base (`git log` + `git diff`).
3. Cuando la fuente es solo PR, infiere el objetivo desde el ticket de tareas vinculado desde el PR y el diff; lista los vacíos restantes bajo Preguntas abiertas en el documento.
4. Si no hay diff y no hay contexto de spec después de la Fase 0, detente y pregunta qué fuente cargar.

## Fase B — Construir el explicador

Redacta estas secciones en orden de historia para que la intuición preceda a los detalles:

1. **Antecedentes** — describe qué ya existía (modelos clave, servicios, flags, callers) y cita rutas de archivo.
2. **Objetivo e intuición** — declara un objetivo en lenguaje llano y explica cualquier concepto no obvio en el que se apoya el cambio.
3. **Recorrido narrativo** — recorre el cambio en orden de historia (no archivos alfabéticos). Incrusta snippets mínimos con citas de ruta y explica por qué existe cada paso.
4. **Efectos de segundo orden** — cubre callers, jobs, serializadores, rutas mobile/legacy, límites de auth/PII y feature flags.
5. **Mapeo de criterios de aceptación** — provee un checklist vinculado a los criterios de la fuente proporcionada.
6. **Quiz de autoevaluación** — incluye al menos 5 preguntas y una clave de respuestas en el documento.

Fundamenta cada afirmación en el diff y las fuentes proporcionadas. Si faltan criterios de aceptación después de la Fase A, haz una pregunta enfocada antes de mapear los criterios.

Puntúa y revisa el borrador según [explainer-rubric.md](references/explainer-rubric.md).

## Fase C — Escribir el explicador

Crea `docs/<dominio>/` si es necesario; infiere `<dominio>` desde el ticket.

Escribe las secciones de la Fase B en la ruta de salida de la Fase 0. También incluye:

- Incluye la puntuación del explicador y breve justificación a menos que estés bloqueado antes de escribir.
- Declara Ready for como exactamente uno de `planning-implementation`, `implement-ticket`, `pr-review`, o `blocked`, con justificación (repite en el chat).
- Lista preguntas abiertas solo para elementos sin resolver.

Mantén encabezados y párrafos cortos para que el documento sea escaneable. Revisa en como máximo 2 rondas hasta que el puntaje del explicador alcance ≥ 9; si sigue por debajo de 9, detente y reporta los bloqueos en el chat.

**Secciones requeridas**

1. Antecedentes (sistema existente; cita rutas)
2. Objetivo e intuición
3. Recorrido narrativo (ordenado; snippets + prosa + citas de ruta)
4. Efectos de segundo orden y riesgos
5. Cómo esto mapea a los criterios de aceptación (checklist)
6. Quiz de autoevaluación (5+ preguntas) + clave de respuestas
7. Puntuación del explicador + breve justificación (omítelo solo si se bloquea antes de escribir)
8. Ready for: `planning-implementation` | `implement-ticket` | `pr-review` | `blocked` — exactamente uno + por qué (indícalo también en el chat)
9. Preguntas abiertas (solo elementos sin resolver)
10. Índice de fuentes (slugs de documentos de la fuente + rutas de archivo clave consultadas)

**Autoevaluación antes de terminar**

- El explicador está en disco en la ruta de salida de la Fase 0 con puntaje ≥ 9 (o bloqueos documentados después de 2 rondas).
- La narrativa está en orden de historia, no es una lista de archivos.
- Cada criterio de aceptación está mapeado; el quiz es respondible solo desde el documento.
- Ready for es exactamente uno de `planning-implementation` | `implement-ticket` | `pr-review` | `blocked`.

## Termina cuando

El explicador está en disco en la ruta de salida de la Fase 0 con puntaje ≥ 9 (o bloqueos documentados después de 2 rondas de revisión), y el chat resume el puntaje y Ready for. Un compañero que no ha vivido en la rama puede leer el documento solo y discutir la siguiente iteración de diseño con fluidez.

Termina el mensaje final con este bloque de handoff:

```markdown
## Handoff — change-explainer
- TICKET-ID: …
- Artifact: <ruta del explicador>
- Explainer score: <N>/10
- Ready for: <valor del menú>
- Blockers: <lista o "none">
- Summary: <2–4 oraciones>
```
