# Triage — PR <num>: <título>

## Estado

- fecha: <aaaa-mm-dd>
- PR: #<num> — <url>
- head triagiado: <sha>
- ronda: <1 para el documento nuevo; incrementa al acumular sobre el anterior>

## Resumen

- hilos triagiados en esta ronda: <n>
  - corregir: <n>
  - responder: <n>
  - aplazar: <n>
- preguntas abiertas: <n>

## Entradas por hilo

- `<archivo o superficie>:<línea o tema>` — «<fragmento del comentario del revisor>» (@<autor>)
  - hilo: <el `node_id` de GraphQL —`PRRT_…` para hilos de línea, `PRR_…` para cuerpos de review, `IC_…` para la conversación—; nunca el `id` numérico de REST, que no casa con la recarga GraphQL. Es la clave de deduplicación y lo que `mejorar-pr` necesita para responder o resolver>
  - visto: <fecha ISO del último comentario del hilo al triagiar —en superficies sin hilo (`PRR_…`, `IC_…`), la del propio ítem o de su última edición—; junto con `estado:` forma el par que detecta la actividad posterior>
  - estado: <`abierto` o `resuelto` —el estado del hilo en la plataforma; las superficies sin resolución (`PRR_…`, `IC_…`) registran siempre `abierto`—; es un campo vivo: `mejorar-pr` lo actualiza al anotar la entrada —ejecutada u omitida—; con `visto:` forma el par que detecta la actividad posterior —comentarios más recientes o reapertura>
  - veredicto: <corregir | responder | aplazar>
  - severidad: <blocker | important | nit>
  - propuesta: <corrección concreta citando el código y la regla o intención del comentario; respuesta redactada si el veredicto es responder; ausente si es aplazar —la respuesta de aplazamiento la redacta `mejorar-pr` a partir de la `razón`>
  - razón: <obligatoria cuando el veredicto es aplazar; se omite en otro caso>
  - ronda: <número de la ronda de triage en que entró la entrada —1 en el documento nuevo; en un triage acumulado, la ronda en que cada hilo se clasificó>
  - resultado: <lo escribe `mejorar-pr` al ejecutar la entrada —`corregido en <sha>`, `respondido`, `aplazado` con la referencia si se registró tarea, `resuelto en plataforma`, `omitido — <motivo>` o, no terminal, `aplicado en <sha> — pendiente de push y respuesta`—; la anotación compone los efectos cuando hay más de uno —`corregido en <sha>; respuesta omitida`— y toda anotación —de ejecución o de omisión— deja `visto:` y `estado:` al día con la plataforma; la entrada nace sin este sub-ítem>

## Preguntas abiertas

- `<archivo o superficie>:<línea o tema>` — «<fragmento del comentario del revisor>» (@<autor>)
  - hilo: <identificador de plataforma —mismo formato que las entradas; hace reconocible y deduplicable la pregunta en rondas posteriores>
  - visto: <mismo campo que las entradas —fecha ISO del último comentario del hilo al registrar la pregunta>
  - estado: <mismo campo que las entradas —`abierto` o `resuelto` al registrarla>
  - pregunta: <qué haría falta para decidir el veredicto —solo si el hilo no tiene intención clara; nunca una suposición>
  - resultado: <`promovida a entrada` cuando el usuario resolvió la ambigüedad en `mejorar-pr`, u `omitido — <motivo>` cuando la pregunta se declinó o su hilo apareció resuelto; nace sin este sub-ítem y toda anotación deja (`visto:`, `estado:`) al día con la plataforma>
