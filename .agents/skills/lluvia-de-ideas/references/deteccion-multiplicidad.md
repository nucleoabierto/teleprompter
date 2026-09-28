# Detección de multiplicidad

Guía para distinguir si una propuesta describe una idea única o un conjunto de ideas distinguibles. Los criterios son una lista abierta y extensible: cualquier descomposición que el agente pueda defender ante el usuario con un criterio explícito cuenta; estos son los ya observados.

## Criterios

- **Líneas de funcionalidad independientes:** cada línea podría construirse y entregar valor por sí sola, aunque se solapen en diseño. Señal: la propuesta enumera capacidades que responden a problemas distintos.
- **Flujos de usuario separables:** la propuesta describe escenarios de uso que no comparten el mismo momento ni la misma necesidad («organizar por contexto» frente a «saber qué toca hoy»).
- **Iteraciones o fases con valor propio:** la propuesta describe una trayectoria donde cada paso ya es una entrega útil, no una dependencia técnica pura.
- **Épicas implícitas:** una línea de la propuesta es ella misma un conjunto de trabajo con frontera propia —varias tareas coordinables bajo un objetivo— y no una acción.
- **Problemas distintos:** prueba de fuego transversal: si cada candidata se formula como problema sin mencionar a las demás y el enunciado se sostiene solo, son ideas separadas; si una no se entiende sin la otra, son una sola.

## Cómo proponer la descomposición

- Nombrar cada idea candidata con una frase que declare su problema propio.
- Declarar el criterio que las separa, no solo la lista: «comparten objeto pero no problema» es una justificación; «son tres cosas» no.
- Sugerir orden solo cuando haya una razón: la idea que estructura a las demás primero, la que desbloquea más después. Si el orden es indiferente, decirlo.

## Ejemplo de referencia

Caso guía: «quiero una lista de tareas en el navegador, con varias listas para organizar por contexto, fechas y vista de hoy, y que pueda exportarse o compartirse». La descripción se descompone en tres ideas distinguibles:

- **Listas múltiples** — organizar por contexto (línea de funcionalidad propia; su problema se formula sin mencionar fechas ni portabilidad).
- **Planificación temporal** — cuándo toca cada cosa (problema distinto: el tiempo, no el contexto).
- **Portabilidad y compartir** — la lista fuera de un solo navegador (problema distinto: propiedad y traslado de los datos).

Las tres comparten el mismo objeto —la lista— pero no el problema; cada una se sostiene como enunciado independiente y cada una condiciona a las demás en el orden de ejecución, que es exactamente lo que la sección «Tensión que introduce en el roadmap» de cada archivo registra.
