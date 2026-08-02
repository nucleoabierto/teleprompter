---
name: ejecutar-quiz-comprension
description: >-
  Ejecuta una puerta de comprensión en vivo en el chat con 5–10 preguntas
  calificadas contra la fuente y el código. Reprueba la puerta cuando el
  humano falla un tema bloqueante: límites de auth/PII, entry points o flujo
  de datos incorrectos, o criterios de aceptación omitidos. La salida
  permanece solo en el chat — ningún archivo durable. Úsalo cuando el usuario
  pida comprobar, validar, verificar o entender un cambio antes de implementar
  o revisar, o cuando necesite una puerta de comprensión en vivo. No lo uses
  para documentos didácticos en disco (usa explicar-cambio).
---

# Quiz de comprensión

Ejecuta una puerta de comprensión en vivo en el chat. El humano responde preguntas; el agente califica cada respuesta contra la fuente y el código. Para un documento didáctico en disco, usa [explicar-cambio](../explicar-cambio/SKILL.md).

Mantén la salida solo en el chat. Pon la intención de producto desconocida en Preguntas abiertas.

**Temas bloqueantes** — un miss en cualquiera reprueba la puerta:

- Límite de auth o PII
- Entry point o flujo de datos principal incorrecto
- Criterio de aceptación omitido

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas (Fase 0) |
| [quiz-design-rubric.md](references/quiz-design-rubric.md) | Rúbrica de puntuación del diseño del quiz (1–10) |

## Cuándo usarlo y cuándo no

- **Sí**: el usuario pide comprobar en vivo que entiende un cambio antes de implementar o revisar.
- **No**: el usuario pide un explicador, documento didáctico, implementación, revisión de PR o merge; eso corresponde a otros skills.

## Entrada y salida

- **Entrada**: `CONTEXT-DOC-SLUG`, `PR-NUMBER` o diff pegado (string, obligatorio).
- **Salida**: `quiz-result` (string, markdown) — resultado de la puerta en el chat con puntuación del quiz, respuestas calificadas, misses bloqueantes, `pass`/`fail` y `Ready for`.

## Convenciones locales

- Trabaja con archivos locales o el chat.
- Sigue el protocolo de descubrimiento de archivos en `references/file-discovery.md` (vía contexto → solicitud directa → invocación) para resolver `CONTEXT-DOC-SLUG`, `PR-NUMBER` o diff pegado.
- Los entregables se presentan en el chat. Si el usuario solicita guardar, escribe el archivo en la ruta indicada con `write`.

## Fase 0 — Resolver entradas

Requerido: fuente del quiz. Elige la primera que aplique:

1. `CONTEXT-DOC` — local `docs/**/<TICKET-ID>-research-brief.md`
2. `DOC-SOURCE` — URL de documentación del mensaje o ticket de tareas
3. `PR-NUMBER` — mensaje del usuario, URL o PR para la rama actual
4. `LOCAL-DIFF` — diff adjunto del usuario o solicitud de quiz desde cambios de la rama actual

Si ninguna aplica, pregunta: "¿Quiz desde un context brief local, una especificación de documentación, un PR, o el diff de tu rama local?"

La puerta es omisible solo cuando el usuario aprueba explícitamente omitirla. Sin esa aprobación, detente y pregunta si ejecutar el quiz o omitirlo antes de implementar o revisar en su nombre.

Declara la fuente resuelta en el chat, luego procede.

## Fase A — Preparación

1. Lee la fuente resuelta lo suficiente para calificar respuestas: objetivo, criterios de aceptación, objetivos excluidos, entry points, auth/PII, modos de fallo, efectos de segundo orden.
2. Redacta una lista de **5–10** preguntas que cubran al menos:
   - Objetivo y objetivos excluidos del ticket
   - Flujo de datos principal o entry points
   - Flag crítico o límite de auth/PII
   - Un modo de fallo o edge case
   - Un efecto de segundo orden (jobs, serializadores, mobile o legacy)

   Cada pregunta debe ser respondible desde la fuente y el código proporcionados.

3. Para cada pregunta, anota: respuesta esperada corta, puntero de evidencia (ruta de archivo y/o sección de la fuente), y si prueba un tema bloqueante.

   Puntúa el set de preguntas según [quiz-design-rubric.md](references/quiz-design-rubric.md) antes de preguntar.

## Estrategia de fallo

- Si la fuente no existe o no se puede leer, pide el contenido en el chat.
- Si no puedes formular preguntas respondibles, informa los vacíos de la fuente y detente.
- Si el humano no responde una pregunta bloqueante, reprueba la puerta y ofrece un puntero de re-lectura; no reveles la respuesta completa a menos que lo pida.

## Fase B — Preguntar y calificar

1. Pide al humano que responda una pregunta a la vez en el chat. Revela las respuestas esperadas solo después de que respondan.
2. Califica cada respuesta contra la fuente y el código: correct, partial o miss. Cita evidencia en una línea (ruta y/o sección).
3. En una respuesta partial, haz una pregunta de seguimiento enfocada antes de marcarla como miss. Límite: máximo **2** seguimientos en total en todo el quiz.
4. En un miss, da una pista corta que apunte a dónde vive la respuesta en los docs o el código — pega la respuesta completa solo después de que lo intenten de nuevo o lo pidan directamente.
5. Cuando un miss es en un tema bloqueante, reprueba la puerta, detente, y recomienda releer esa área antes de continuar.

## Fase C — Aprobar o reprobar

Reporta en este orden:

1. Puntuación del diseño del quiz (de la Fase A) y breve justificación
2. Preguntas y respuestas calificadas (correct / partial / miss)
3. Misses bloqueantes, si los hay, con punteros de re-lectura
4. Resultado de la puerta: pass o fail (fail cuando cualquier tema bloqueante fue un miss)
5. Ready for: exactamente uno de `implement`, `review` o `neither`, con breve justificación
6. Vacíos a cerrar (ordenados)

Cuando la puerta reprueba, expande la lista de vacíos antes de detenerse:

- Cada miss bloqueante: tema, qué estuvo mal o faltante, y un puntero de re-lectura (ruta de archivo y/o sección de la fuente)
- Partials no bloqueantes que valga la pena cerrar después
- Establece Ready for en `neither` hasta que esas áreas se relean

Basa las calificaciones en evidencia de la fuente y el código. Cuando la intención de producto falte en la fuente, lista el vacío bajo Preguntas abiertas en lugar de calificar contra suposiciones.

Antes de terminar, confirma:

- El set de preguntas puntúa ≥ 9 según [quiz-design-rubric.md](references/quiz-design-rubric.md), o se reportaron vacíos de la fuente después de 2 rondas de revisión.
- Cada tema bloqueante fue probado.
- Cada respuesta esperada cita la fuente o el código, o el vacío está listado bajo Preguntas abiertas.
- En fail: punteros de re-lectura concretos. En pass: una sola recomendación de Ready for.

## Termina cuando

El humano tiene un pass o fail claro, una sola recomendación de Ready for (`implement` | `review` | `neither`), y — en fail — una lista concreta de vacíos con punteros de re-lectura solo desde este chat.
