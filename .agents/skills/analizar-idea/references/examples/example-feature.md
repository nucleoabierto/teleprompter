---
idea_slug: notificaciones-push
domain: reportes
date: 2026-08-05
skill: analizar-idea
level: feature
input: "estaría bueno que la gente reciba un aviso cuando su reporte está listo"
status: ready
next: evaluar-alcance-idea
---

# Descripción narrativa: notificaciones-push

## Problema

El usuario que genera reportes en la plataforma vive un flujo roto desde el momento en que arranca un reporte. La generación toma suficiente tiempo como para que no pueda quedarse esperando en la página: cierra la pestaña o se va a otra cosa, y el reporte queda corriendo de fondo. A partir de ahí, el ciclo del reporte deja de estar monitoreado en la plataforma y pasa a estar sostenido por la memoria del usuario. Ese es el problema de fondo: la plataforma inicia el trabajo pero no cierra el ciclo; el cierre queda delegado al usuario, que tiene que recordarlo, volver y revisar.

Esa delegación se manifiesta en tres síntomas concretos que se repiten cada vez que alguien genera un reporte:

- **Olvido**: el usuario inicia un reporte, se va a otra tarea, y no vuelve a revisar. El reporte termina y queda listo sin que nadie lo sepa. El trabajo que dependía de ese reporte, otra persona esperándolo, una decisión que lo necesitaba, un envío programado, se atrasa porque el eslabón que avisaba que ya estaba disponible no existe.
- **Revisión compulsiva**: el usuario sabe que olvidar le cuesta, así que cae en el extremo opuesto y revisa demasiado seguido. Abre la plataforma, comprueba, generalmente el proceso no terminó, vuelve a su tarea, vuelve a interrumpirse. El costo no es solo el tiempo de cada comprobación: es la atención fragmentada, el hilo de la tarea actual que se rompe cada vez.
- **Incertidumbre**: cuando un reporte demora más de lo esperado, el usuario no tiene forma de distinguir si sigue corriendo normalmente, si falló, o si terminó y él no se enteró. Revisar no resuelve la incertidumbre, solo confirma el estado en ese instante, no informa lo que pasó mientras no miraba.

El workaround actual es exclusivamente manual: el usuario mantiene un hilo mental abierto ("tengo que acordarme de revisar el reporte") y lo gestiona a costa de su atención. No hay mecanismo en la plataforma que cierre el ciclo por él. El costo agregado no es trivial: atención drenada de la tarea actual, dependencias que se atrasan por falta de aviso, y una fricción menor pero constante que el usuario aprende a tolerar y deja de reportar como problema.

## Resultado

El estado final deseado es uno en el que el ciclo del reporte se cierra sin intervención del usuario. El usuario arranca un reporte y suelta el asunto: no tiene que recordarlo, no tiene que revisar, no tiene que mantener ningún hilo mental abierto. Sigue con otro trabajo con la confianza de que la plataforma le avisará en el momento justo en que el reporte esté listo, y que ese aviso lo conducirá de vuelta al resultado sin que tenga que recordar dónde lo arrancó ni cómo llegar a él.

El flujo del usuario después del cambio es lineal y sin sobresaltos: inicia el reporte, se va a otra cosa, en algún momento recibe un aviso oportuno que le dice que su reporte ya está disponible, y retoma desde el aviso hasta el resultado terminado. La diferencia con hoy no es que el usuario haga algo nuevo; es que deja de tener que revisar, recordar, mantener el ciclo abierto.

Lo que deja de pasar es observable y específico:

- El reporte ya no queda "listo y esperando" sin que el usuario lo sepa.
- El usuario ya no interrumpe su tarea actual para comprobar un estado que no cambió.
- La incertidumbre sobre "¿sigue, falló, o terminó?" desaparece para el caso de "terminó": el aviso es la respuesta.
- Las dependencias ya no se atrasan por falta de aviso de que el reporte está disponible.

Las señales de que el resultado se alcanzó son medibles sin mirar la implementación: los usuarios reportan no tener que revisar manualmente, el tiempo entre "reporte listo" y "usuario retoma el reporte" baja, los usuarios se animan a iniciar más reportes en paralelo porque confían en que se les avisará, y el feedback sobre "no sé si mi reporte terminó" desaparece del radar.

## Solución

El producto que entrega ese resultado es una notificación que llega cuando un reporte termina de generarse. Es un empujón pequeño y oportuno: aparece justo cuando el trabajo está hecho, le dice al usuario que su reporte ya está disponible, y lo lleva de vuelta a él sin que tenga que recordar nada. La experiencia central es la de **soltar y retomar**: el usuario inicia el reporte, se va a otra cosa, y en algún momento recibe el aviso que lo reconduce al resultado terminado. No es algo que el usuario tenga que ir a buscar, es la plataforma la que lo alcanza cuando el trabajo está hecho.

### Forma del producto

El producto es un aviso atado al ciclo de vida del reporte. Aparece en el momento del evento (el reporte termina) y lo acompaña de un camino de regreso al resultado. No es un espacio que el usuario administra, no es una bandeja donde los avisos se acumulan, no es un resumen periódico de actividad. Es puntual y oportuno: un evento, un aviso, un regreso.

Se acopla al flujo de reportes que ya existe como una extensión, no como un espacio nuevo. El usuario ya inicia reportes en la plataforma. Lo que cambia es que ahora la plataforma cierra el ciclo por él en lugar de dejarlo abierto a su memoria. No hay un nuevo lugar al que ir, el aviso llega donde el usuario esté y lo conduce al reporte que ya conoce.

### Fronteras — qué no es

- No es un **centro de notificaciones** ni una **bandeja persistente**: el aviso es puntual y atado al evento, no un espacio que el usuario administra ni donde los avisos se acumulan para revisar después.
- No es un **digest ni un resumen periódico**: el aviso llega en el momento del evento, no de forma agregada o programada.
- No es un **sistema de notificaciones para otros eventos**: el alcance es el ciclo de vida del reporte (terminó), no un mecanismo general para avisar cualquier cosa de la plataforma.
- No es un **sistema de mensajería entre usuarios**: el aviso va de la plataforma al usuario que arrancó el reporte, no entre personas.
- No es un **monitor de estado del reporte en vivo**: el aviso informa el evento de finalización, no reporta progreso intermedio mientras el reporte se genera.

### Comportamientos clave del producto

Estos son los comportamientos que el producto debe entregar, descritos en términos de experiencia. Cada uno es una unidad de producto que un análisis downstream puede expandir y descomponer.

1. **Reaccionar al cierre del ciclo del reporte**: el producto se activa cuando un reporte termina de generarse. No es algo que el usuario dispara, es algo que la plataforma detecta y dispara el aviso.
2. **Dirigir el aviso al usuario correcto**: el aviso llega a quien arrancó el reporte, no a cualquiera. El producto sabe a quién pertenece cada reporte en curso.
3. **Entregar el aviso en el momento del evento**: el aviso es oportuno: llega cuando el reporte termina, no minutos después, no agrupado con otros. La oportunidad es parte del valor.
4. **Conducir de vuelta al reporte**: el aviso no solo informa, lleva al usuario al reporte terminado. Hay un camino desde el aviso hasta el resultado, sin que el usuario tenga que navegar manualmente.
5. **Informar qué reporte y qué estado**: el aviso identifica de qué reporte se trata y que está listo. El usuario no tiene que adivinar a qué reporte corresponde el aviso.

### Escenarios y variantes

El comportamiento central tiene variantes que el producto necesita resolver. Cada una es una decisión de producto que el análisis posterior debe trabajar:

- **Reporte de falla**: si el reporte falla en lugar de terminar bien, ¿el usuario recibe un aviso de fallo, o solo se le avisa de los éxitos? Hoy la incertidumbre incluye "no sé si falló". El producto puede resolverla o dejarla abierta.
- **Muchos reportes terminando cerca**: si un usuario arranca varios reportes y varios terminan en poco tiempo, ¿llega un aviso por cada uno, o se agrupan para evitar ruido? La oportunidad compite con la saturación.
- **Usuario ausente de la plataforma**: si el usuario cerró sesión o no está en la plataforma cuando el reporte termina, ¿el aviso espera a que vuelva, o lo alcanza por un canal externo (email)? Esto define el alcance del canal.
- **Usuario ya volvió por su cuenta**: si el usuario ya está viendo el reporte terminado cuando el aviso iba a llegar, ¿el aviso se suprime, o llega igual y se vuelve ruido?
- **Reporte cancelado por el usuario**: si el usuario cancela el reporte antes de que termine, ¿llega algún aviso, o el silencio es lo correcto?

Estas variantes son decisiones de experiencia que definen la forma final del producto. Dejarlas abiertas en esta etapa es correcto, pero identificarlas aquí permite que el análisis posterior las trabaje de forma explícita en lugar de descubrirlas tarde.

### Beneficiarios

- **Primario: el usuario que genera reportes**: deja de revisar, libera la atención que le dedicaba a mantener el hilo abierto, y puede concentrarse en otro trabajo con la confianza de que el aviso lo alcanzará.
- **Secundario: quien depende del reporte**: la persona o proceso que esperaba el reporte deja de atrasarse por falta de aviso de que ya está disponible.
- **Secundario: la organización**: menos fricción acumulada en cada ciclo de reporte, más capacidad de correr reportes en paralelo sin sobrecarga mental.

## Suposiciones y dependencias

- La generación de reportes toma suficiente tiempo para que revisar manualmente sea una fricción real. Confirmado por feedback recurrente en los últimos 2 ciclos.
- El usuario que arranca un reporte es identificable por la plataforma (la plataforma sabe quién inició cada reporte).
- El evento "reporte terminado" es detectable por la plataforma (el ciclo de vida del reporte ya distingue "en curso" de "terminado").
- La frecuencia de uso de reportes es lo suficientemente alta como para que la fricción acumulada justifique el feature.
- El canal de notificación (email vs push in-app vs ambos) no está decidido.

## Decisiones diferidas al análisis posterior

- Canal concreto de notificación (email, push in-app, ambos, o combinación por contexto).
- Comportamiento ante reporte que falla (¿aviso de fallo o silencio?).
- Comportamiento ante múltiples reportes terminando cerca (¿un aviso por evento o agrupación?).
- Comportamiento ante usuario ausente (¿canal externo o espera?).
- Comportamiento ante usuario que ya volvió por su cuenta (¿supresión o aviso igual?).
- Preferencias del usuario (¿puede silenciar, opt-out, elegir canal?).
- Si el producto incluye o no un estado visible del reporte "en curso" más allá del aviso de finalización.

## Gate de avance

- **Inventario de preguntas identificadas**:
  - [Crítica] ¿El producto conecta el problema y el estado final?: Estado: resuelta (la notificación conecta el revisar manual con el aviso automático al terminar).
  - [Crítica] ¿El producto se describe en términos de experiencia, no de implementación?: Estado: resuelta (la narrativa describe recibir un aviso y volver al reporte sin stack ni canal concreto).
  - [Importante] ¿El beneficiario está claro?: Estado: resuelta (primario: usuario que genera reportes; secundarios: dependiente y organización).
  - [Importante] ¿La idea contiene múltiples funcionalidades?: Estado: resuelta (es una sola funcionalidad: notificar al terminar. Las variantes son decisiones de la misma funcionalidad, no funcionalidades separadas; la sospecha de un "centro de notificaciones" más amplio se documenta como frontera, no como división).
  - [Importante] ¿El aviso debe ser email, push in-app, o ambos?: Estado: resuelta (el resultado no especifica canal).
  - [Menor] ¿Frecuencia de reportes lo suficientemente alta para justificar notificaciones?: Estado: resuelta (feedback recurrente lo confirma).
- **¿Alertae al usuario?**: No. Todas las preguntas Críticas/Importantes se resolvieron durante el análisis.
- **Estado final de avance**: Libre (`status: ready`, `next: evaluar-alcance-idea`)

## Preguntas Abiertas (resueltas/pendientes)

### Resueltas

- **Pregunta**: ¿El aviso debe ser email, push in-app, o ambos?
- **Impacto**: Define el alcance del canal de notificación.
- **Severidad**: Importante
- **Propuesta**: El resultado no especifica canal.
- **Estado**: Resuelta (se delega a análisis posterior).

- **Pregunta**: ¿Frecuencia de reportes lo suficientemente alta para justificar notificaciones?
- **Impacto**: No bloquea la descripción.
- **Severidad**: Menor
- **Propuesta**: Revisar en analisis posterior.
- **Estado**: Resuelta (feedback recurrente lo confirma; se hereda como observación).
