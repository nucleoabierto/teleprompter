---
name: construir-demo
description: >-
  Construye un demo interactivo temporal y autónomo para hacer visible el
  comportamiento en runtime (state machines, sync, edge cases, flujos
  multi-paso) cuando los diffs son insuficientes. Úsalo cuando el usuario pida
  ver, manejar, explorar o validar comportamiento complejo mediante un demo
  ejecutable. No lo usas para responder preguntas de diseño con bocetos (usa
  construir-spike), implementar la feature real ni crear código mergeable.
---

# Harness

Construye un demo interactivo temporal y autónomo que puedas manejar para que la comprensión venga de ver el comportamiento, no solo de los diffs. El demo corre fuera de la app principal — sin rutas de dev, walkthroughs logueados, o harnesses dentro de la app.

Entregables: un artefacto ejecutable (archivo HTML, demo CLI o carpeta de scripts pequeña) y notas del harness en `docs/<domain>/<TICKET-SLUG>-harness-notes.md`. El código del harness queda local y desechable a menos que el usuario pida conservarlo o graduarlo. Pon las incógnitas en Preguntas abiertas antes de la Fase A. Aparca los descubrimientos fuera de alcance en las notas — no en commits. No hagas push, no trates el demo como la feature de producto, ni reescribas el context file a menos que el usuario lo pida explícitamente.

Persigue un solo objetivo de visibilidad por demo. Divide las solicitudes multi-objetivo en demos separadas.

Usa solo fixtures sintéticos — nunca datos reales de clientes, IDs reales de clientes, PII, credenciales de producción, ni capturas de producción con PII en fixtures, seeds, logs, o output del demo.

Los tests automatizados (pytest, rspec, etc.) son para aserciones automatizadas, no para aprendizaje visual paso a paso. Ver [demo-mediums.md](references/demo-mediums.md) para los medios permitidos.

Esto no es un spike. [construir-spike](../construir-spike/SKILL.md) responde una pregunta de diseño con un boceto desechable. Un demo interactivo hace visible el comportamiento en tiempo de ejecución manejándolo. Ninguno produce código de implementación mergeable — pliega las decisiones validadas en trabajo de producción vía [planificar-implementacion](../planificar-implementacion/SKILL.md) o un [construir-spike](../construir-spike/SKILL.md) posterior.

## Cuándo usarlo y cuándo no

- **Sí**: el usuario necesita ver un comportamiento difícil de inferir a partir de diffs o logs (sync, state machines, edge cases, migraciones multi-paso).
- **No**: el usuario quiere una feature real, un demo pulido, un fix de producción, o cualquier cambio que deba persistir sin aprobación explícita.

## Entrada y salida

- **Entrada**: `TICKET-SLUG` o `CONTEXT-DOC-SLUG` (string, obligatorio) — ticket o brief en chat/archivo local.
- **Salida**: `harness-notes` (string, markdown) — notas del harness con comportamientos confirmados, sorpresas, implicaciones y decisión de conservar/eliminar; se entrega en el chat o se escribe con `write` si el usuario lo pide.

## Convenciones locales

- Trabaja con archivos locales o el chat.
- Sigue el protocolo de descubrimiento de archivos en `references/file-discovery.md` (vía contexto → solicitud directa → invocación) para resolver el `TICKET-SLUG` o `CONTEXT-DOC-SLUG`.
- Los entregables se presentan en el chat. Si el usuario solicita guardar, escribe el archivo en la ruta indicada con `write`.

## Referencias compartidas

- **[file-discovery.md](references/file-discovery.md)**: Resolución de entradas (Fase 0)
- **[demo-mediums.md](references/demo-mediums.md)**: Rama lógica/UI, escalera de preferencia de medios, ejemplos de interacciones (Fase A)
- **[demo-outcome-rubric.md](references/demo-outcome-rubric.md)**: Bandas de puntuación de outcome del demo (Fase C)

## Fase 0 — Resolver entradas

Ver [file-discovery.md](references/file-discovery.md).

Requerido: `TICKET-SLUG` — infiere de la conversación o pregunta.

Opcional: `CONTEXT-DOC-SLUG` — brief de investigación local cuando existe en disco.

Opcional: `DOCUMENTACION-SOURCE` — resuelve según [file-discovery.md](references/file-discovery.md).

Objetivo de visibilidad (requerido cuando no sea inferible): infiere de la conversación o una recomendación de triage, o pregunta: "¿Qué único comportamiento debe hacer visible el harness?"

Declara las entradas resueltas en el chat, luego procede. Ruta de salida: `docs/<domain>/<TICKET-SLUG>-harness-notes.md`.

## Fase A — Diseñar qué revelar (mostrar en el chat; esperar aprobación)

1. Nombra el único comportamiento que el harness debe hacer visible (ej. "recorrer la resolución de conflictos", "limpiar el estado de citas a lo largo del tiempo").
2. Elige una rama y un medio según [demo-mediums.md](references/demo-mediums.md) (tabla Rama lógica vs UI + escalera de preferencia).
3. Define 3–5 interacciones según [demo-mediums.md § Interaction examples](references/demo-mediums.md#interaction-examples).
4. Marca el harness como desechable: sin pulido, sin refactors drive-by, sin nuevos tests para el harness mismo. Conecta a rutas de código reales (no un modelo de juguete paralelo). Confirma que el artefacto corre de forma autónoma sin arrancar la app ni loguearse.
5. Detente y espera a que el usuario apruebe el diseño de la Fase A (objetivo + rama + medio + interacciones + ruta del artefacto) antes de construir.

## Estrategia de fallo

- Si la fuente no existe o no se puede leer, pide el contenido en el chat.
- Si no puedes exponer el comportamiento con los peldaños inferiores de la escalera, justifica por qué subes de nivel y espera aprobación.
- Si el usuario no aprueba la Fase A, no pases a construir; devuelve el diseño para refinar.

## Fase B — Construir

Implementa en una branch local desechable o conjunto de parches sin commitear bajo una ruta obvia (ej. `*-harness.html`, un script one-off, o una carpeta pequeña `*-harness/`). Colocalo cerca del código bajo exploración; nombra las rutas para que un lector vea que es temporal (`TASK-XXX-harness.html`, `TASK-XXX-harness/`).

Prohibido en la app principal: rutas de dev, switches `?variant=` en páginas de producción, debug UI con flag, walkthroughs de tests.

Prefiere el artefacto autónomo más pequeño que haga visible el comportamiento:

- Demos lógicos: importa módulos reales del proyecto; el shell interactivo es desechable.
- Demos UI: un archivo HTML (o carpeta pequeña) con JS inline o importado mínimo; extrae lógica del cliente o aproxima DOM/layout con fixtures sintéticos; expone el estado completo en la página después de cada interacción; sin paso de build a menos que el proyecto anfitrión ya tenga uno.

Expone el estado relevante completo después de cada interacción (output de consola, UI renderizada, o una lista de pasos en las notas).

Ejecuta solo la validación dirigida necesaria para probar que el harness corre (`./scripts/docker-helper.sh test -m unit`, linters). Nunca ejecutes el suite completo. Usa esos comandos para checks de regresión en código real, no como la UI del harness.

## Fase C — Capturar la comprensión

Escribe las notas del harness en `docs/<domain>/<TICKET-SLUG>-harness-notes.md` (crea `docs/<domain>/` si es necesario; infiere el dominio del ticket):

1. Objetivo de visibilidad y hallazgos (la respuesta que el harness resolvió)
2. Qué te deja ver/hacer el harness
3. Cómo ejecutarlo — comando exacto, ruta `file://`, o URL de servidor estático para el artefacto autónomo (no URLs de app ni URLs de filtro de tests)
4. Interacciones paso a paso para manejar el harness
5. Comportamientos confirmados al usarlo
6. Sorpresas o bugs encontrados
7. Implicaciones para la implementación real o la revisión
8. Qué conservar vs eliminar vs graduar a una herramienta de debug permanente (default: eliminar)
9. Puntuación del outcome del harness y justificación breve (omite solo si bloqueado antes de escribir)
10. Listo para — elige exactamente una acción del menú abajo y explica por qué (en las notas y en el chat)
11. Preguntas abiertas (solo items sin resolver)

Puntúa las notas del harness según [demo-outcome-rubric.md](references/demo-outcome-rubric.md).

Menú Listo para (elige exactamente una):

- `planificar-implementacion` — El harness resolvió la pregunta de visibilidad; listo para planificar la implementación real.
- `construir-spike` — El harness expuso una pregunta de diseño que necesita un spike enfocado antes de planificar.
- `resolve-questions` — El harness planteó Preguntas abiertas que deben resolverse primero (producto, alcance, o contexto faltante).
- `blocked` — Dependencia externa o bloqueador sin resolver.

Luego detente. Elimina el harness después de capturar a menos que el usuario pida conservarlo o graduarlo. Opcionalmente añade un puntero de una línea a las notas del harness en el context file cuando haya uno en uso.

## Termina cuando

Las notas del harness están en disco en `docs/<domain>/<TICKET-SLUG>-harness-notes.md` con puntuación de outcome ≥ 9 (o bloqueadores reportados después de 2 rondas), exactamente una recomendación Listo para, instrucciones de ejecución para el artefacto autónomo, y suficiente detalle para que [planificar-implementacion](../planificar-implementacion/SKILL.md) pueda proceder sin re-ejecutar el harness.

La Fase A fue aprobada antes de construir. El artefacto es autónomo, ejercita rutas de código reales, usa solo fixtures sintéticos, y expuso el estado después de cada interacción.

## Handoff — harness

```markdown
## Handoff — harness
- TICKET-SLUG: …
- Artefacto: <ruta del artefacto autónomo o "none">
- Notas: docs/<domain>/<TICKET-SLUG>-harness-notes.md
- Outcome: <puntuación 1–10>
- Listo para: <planning-implementation | spike | resolve-questions | blocked>
- Resumen: <2–4 oraciones>
```
