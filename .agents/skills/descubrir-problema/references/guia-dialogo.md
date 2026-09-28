# Guía de diálogo para el descubrimiento del problema

Referencia del skill `descubrir-problema`. Contiene las preguntas guía para el diálogo, las señales de que el problema aún no está identificado y la lista de verificación de lenguaje de solución.

## Preguntas guía

No forman un guion fijo: se eligen según lo que falte por saber. El diálogo termina cuando se puede redactar el enunciado sin suposiciones.

### Identificar el problema

- ¿Qué ocurre hoy que te hace pensar en esta idea?
- ¿Puedes describir la última vez que te topaste con esta situación?
- ¿A quién le afecta? ¿Solo a ti o a más personas?
- ¿Con qué frecuencia ocurre?
- ¿Qué pasa si no se resuelve? ¿Qué cuesta dejarlo como está?

### Deshacer lenguaje de solución

Cuando la idea llega formulada como solución («añadir un botón», «crear un script», «poner un campo»):

- ¿Qué haría posible eso que hoy no es posible?
- ¿Qué dejaría de ocurrir si eso existiera?
- ¿Para qué lo necesitas? ¿Qué intentas conseguir con ello?

Cada respuesta suele acercar un nivel al problema subyacente. Repetir hasta que la respuesta describa una situación, no un artefacto.

### Evaluar si el problema es real

- ¿Esta situación te ha ocurrido de verdad o es una anticipación?
- ¿Tienes un ejemplo concreto reciente?
- ¿Otras personas han reportado o sufrido lo mismo?

### Explorar alternativas existentes

- ¿Cómo lo resuelves hoy, aunque sea de forma imperfecta?
- ¿Hay alguna herramienta, proceso o convención que ya cubra parte de esto?
- ¿Por qué esa alternativa no es suficiente? ¿Qué le falta?

### Valorar el beneficio

- ¿Qué mejoraría de forma concreta si el problema desapareciera?
- ¿Cuánto tiempo, errores o trabajo ahorraría?
- ¿Habilitaría algo que hoy no se puede hacer?

## Señales de que el problema aún no está identificado

- El enunciado menciona un artefacto (botón, script, página, campo, skill) en lugar de una situación.
- No se puede decir a quién afecta ni con qué frecuencia.
- La única alternativa existente que se reconoce es «no hacer nada», sin explorar cómo se resuelve hoy.
- El beneficio se describe con la misma solución («ahorraría tiempo porque el botón lo hace solo») en lugar de medirse sobre la situación actual.
- El usuario responde las preguntas sobre el problema repitiendo la solución propuesta.

## Lista de verificación de lenguaje de solución

Antes de presentar el enunciado al usuario, verificar cada punto:

- [ ] El texto no menciona artefactos concretos: componentes, archivos, comandos, pantallas, skills, scripts, botones, campos.
- [ ] El texto no usa verbos de construcción («crear», «añadir», «implementar», «automatizar») aplicados a un artefacto; sí puede usarlos sobre la situación («crear fricción», «añadir pasos manuales»).
- [ ] El texto describe una situación actual observable, no un estado futuro deseado.
- [ ] El texto no presupone la forma de la solución: no dice «hace falta un X» ni «falta una Y».
- [ ] Un lector que solo lea el problema no podría adivinar qué solución se construirá.

## Ejemplo

**Idea suelta:** «Deberíamos tener un script que genere el índice de lecciones automáticamente.»

**Mal enunciado (con lenguaje de solución):**

> El proyecto necesita un script que genere el índice de lecciones automáticamente. Sin ese script, el índice se desactualiza. Hay que implementarlo para que `docs/lessons/README.md` refleje siempre las notas existentes.

**Buen enunciado (sin lenguaje de solución):**

> El índice de lecciones aprendidas se mantiene a mano: cada vez que se consolida una lección nueva, alguien tiene que acordarse de añadir la entrada correspondiente con sus disparadores y su resumen. En la práctica, esa actualización manual se olvida o se hace de forma inconsistente, y el índice deja de reflejar las lecciones que existen. Como el índice es el punto de entrada para recuperar lecciones aplicables a una tarea, una entrada ausente o incompleta hace que el aprendizaje acumulado no se aproveche.
>
> Afecta a quien ejecuta tareas en el proyecto, porque la recuperación de lecciones depende de que el índice esté completo. Ocurre cada vez que se consolida una lección, y el coste de no resolverlo es trabajo duplicado y errores ya corregidos que vuelven a cometerse.

**Oportunidad:**

> Resolverlo haría que el índice reflejara siempre las lecciones existentes sin depender de la memoria de quien consolida, eliminando una fuente de inconsistencia ya observada. Resolverlo supera a la alternativa actual —la actualización manual— en fiabilidad; esta solo gana en simplicidad de arranque.
