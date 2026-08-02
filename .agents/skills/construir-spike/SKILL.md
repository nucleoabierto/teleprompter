---
name: construir-spike
description: >-
  Construye un spike desechable para responder una pregunta de diseño
  específica. Úsalo cuando el usuario pida investigar, explorar, probar o
  validar una incógnita técnica mediante un boceto desechable. No lo usas para
  hacer visible el comportamiento en runtime (usa construir-demo), implementar
  la feature real, abrir PR ni pulir en producción.
---

# Spike

Produce un spike desechable que responda una sola pregunta de diseño no clara. Trata el resultado como un boceto de dirección, no código mergeable.

**Entregable**: notas del spike en el chat o escritas con `write` si el usuario lo pide. El código del spike queda local y desechable a menos que el usuario pida conservarlo o pulirlo.

Pon la intención de producto desconocida en Preguntas abiertas. Haz una sola pregunta enfocada antes de la Fase A cuando el alcance o la intención sigan sin estar claros. No hagas push, abras un PR, ni trates el spike como la implementación real. Edita el archivo de contexto solo cuando el usuario lo pida.

Persigue una sola pregunta de diseño por spike. Cuando el usuario nombra múltiples preguntas, detente y pregunta cuál spikpear primero; divide el resto en spikes separados.

Usa solo fixtures sintéticos. Detente y pregunta cuando se necesitarían datos reales de clientes, PII, secrets, o credenciales de producción.

Esto no es una demo interactiva. [construir-demo](../construir-demo/SKILL.md) hace visible el comportamiento en runtime mediante una demo standalone.

## Referencias compartidas

- **[file-discovery.md](references/file-discovery.md)**: Resolución de entradas (Fase 0)
- **[spike-outcome-rubric.md](references/spike-outcome-rubric.md)**: Bandas de puntuación de resultados del spike (Fase C)

## Fase 0 — Resolver entradas

Requerido: `TASK-SLUG` o `CONTEXT-DOC-SLUG` — infiere de la conversación o pregunta.

Opcional: documento de triage existente en ruta local (evidencia suplementaria; la tarea de la fuente es autoritativa).

Pregunta de diseño (requerido cuando no es inferible): infiere de la conversación, triage, o revisión de tarea. Pregunta: "¿Qué sola pregunta de diseño debería responder este spike?"

Sigue el protocolo de descubrimiento de archivos en `references/file-discovery.md` (vía contexto → solicitud directa → invocación) para resolver `TASK-SLUG` o `CONTEXT-DOC-SLUG`.

Declara las entradas resueltas en el chat, luego procede.

## Fase A — Plan del spike (mostrar en el chat; esperar aprobación)

1. Nombra la **única** pregunta que el spike debe responder. Ejemplo: "¿Dónde debería vivir la resolución de conflictos de sync?" Rechaza spikes multi-pregunta; divídelos en spikes separados en su lugar.
2. Lista los archivos que tocarás y qué significa "éxito" para el bocacho (demo de comportamiento, test en rojo que pasa en verde en una rama desechable, log output que muestre la decisión).
3. Marca el spike como desechable: sin pulido, sin refactors colaterales, tests mínimos solo si prueban la pregunta.
4. Detente y espera a que el usuario apruebe el plan de la Fase A antes de escribir cualquier código del spike.

## Estrategia de fallo

- Si la fuente no existe o no se puede leer, pide el contenido en el chat.
- Si el usuario no aprueba la Fase A, no escribas código del spike; devuelve el plan para refinar.
- Si la pregunta de diseño se desdibuja en varias, divide en spikes separados y reinicia la Fase A.
- Si la puntuación no sube a ≥ 9 tras 2 rondas, detente y lista los bloqueos restantes.

## Fase B — Ejecutar

Implementa en una rama local desechable o un patch set sin commitear.

Prefiere el cambio más pequeño que responda la pregunta del spike.

Ejecuta solo la validación dirigida necesaria para probar el bocacho. Notas de testing: `./scripts/docker-helper.sh test -m unit` / `cd frontend && npm test -- --filter=<name>` / `./scripts/docker-helper.sh exec api uv run ruff check`. Nunca el suite completo.

## Fase C — Extraer y descartar

**Entrega las notas del spike** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`.

1. Pregunta formulada
2. Qué aprendimos (arquitectura, convenciones, trampas)
3. Enfoque recomendado para la implementación real (outline de bullets)
4. Qué conservar vs reescribir vs eliminar del spike
5. Riesgos / efectos de segundo orden descubiertos
6. Seguimientos (solo descubrimientos fuera de alcance)
7. Puntaje de resultado del spike y justificación breve (omitir solo si bloqueado antes de escribir)
8. Ready for — indica exactamente una acción del menú y la racionalidad en las notas del spike y en el chat
9. Preguntas abiertas (solo ítems sin resolver)

Puntúa las notas del spike según [spike-outcome-rubric.md](references/spike-outcome-rubric.md).

Menú Ready for (elige exactamente uno):

- `planificar-implementacion` — Pregunta respondida; listo para planificar la implementación real.
- `generar-brief-contexto` — El spike descubrió Preguntas abiertas que deben resolverse primero.
- `construir-demo` — Se necesita visibilidad de runtime más allá del boceto (no otro spike).
- `blocked` — Dependencia externa o bloqueador sin resolver.

Luego detente. Quédate dentro de la única pregunta del spike. Aparca los descubrimientos fuera de alcance en Seguimientos, no como código extra. Opcionalmente añade un puntero de una línea a las notas del spike en el context file cuando haya uno en uso.

## Termina cuando

- Las notas del spike están en el chat con puntaje de resultado ≥ 9 (o bloqueos reportados tras 2 rondas).
- Exactamente una recomendación Ready for y guía keep/rewrite/delete para el código del spike.
- Suficiente detalle para que [planificando-implementacion](../planificando-implementacion/SKILL.md) pueda proceder sin re-ejecutar el spike.
- La Fase A fue aprobada antes de escribir cualquier código del spike.
- Exactamente una pregunta de diseño fue respondida.
- Solo se usaron fixtures sintéticos (sin datos reales de clientes, PII, secrets, o credenciales de producción).
