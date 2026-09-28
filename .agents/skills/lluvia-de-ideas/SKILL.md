---
name: lluvia-de-ideas
description: >
  Acompaña al usuario en una conversación de lluvia de ideas: escucha
  la propuesta, detecta si describe una idea única o varias ideas
  distinguibles —funcionalidades, flujos de trabajo, iteraciones o
  épicas implícitas— y genera un archivo por idea en docs/ideas/ del
  proyecto evaluado, listo para alimentar el flujo de idea a tarea.
  Usar cuando el usuario traiga una propuesta rica con varias líneas
  de trabajo posibles, o quiera explorar ideas antes de comprometerlas.
  Sinónimos: lluvia de ideas, brainstorming, tormenta de ideas, tengo
  varias ideas, explorar ideas, descomponer propuesta.
---

# Lluvia de ideas

Instrucciones para que un agente acompañe al usuario en una conversación de lluvia de ideas y convierta el resultado en archivos de idea persistidos en `docs/ideas/` del proyecto evaluado. El skill escucha la propuesta, la madura en diálogo sin convertirla aún en solución, detecta si contiene una idea única o varias ideas distinguibles y —tras confirmación del usuario— escribe un archivo por idea con el formato que el flujo de idea a tarea consume.

## Cuándo usar

- Cuando el usuario traiga una propuesta rica que pueda contener varias líneas de trabajo: varias funcionalidades, flujos de usuario separables o fases con valor propio.
- Cuando el usuario quiera explorar y aparcar ideas antes de llevarlas al flujo de idea a tarea.
- Cuando durante otra conversación emerja una descripción que merece descomponerse en ideas distinguibles.

## Cuándo no usar

- Cuando el usuario traiga una idea única ya acotada que quiera procesar de inmediato: invocar `idea-a-tarea` directamente.
- Cuando la solicitud ya viene articulada con objetivo y criterios claros: usar `crear-tareas` en modo independiente.
- Para formular el problema de una idea concreta: eso corresponde a `descubrir-problema`, primera capacidad del flujo; el archivo de idea le da su entrada, no lo sustituye.
- Para investigar un tema con evidencia externa: usar `investigar`.

## Entrada

- Una propuesta del usuario en lenguaje libre, posiblemente rica y con varias líneas de trabajo implícitas.
- `docs/ideas/` del proyecto evaluado como directorio de destino —se crea en la primera idea si no existe— y `references/formato-idea.md` como plantilla del archivo.
- `references/deteccion-multiplicidad.md` como guía para distinguir idea única de conjunto de ideas.

## Salida

- Un archivo `docs/ideas/NNN-slug.md` por idea confirmada —un solo archivo cuando la propuesta resulta ser una idea única— con el formato de `references/formato-idea.md`.
- Cuando la propuesta produce varias ideas, el conjunto se presenta al usuario con un orden sugerido, que queda persistido en la cabecera de cada archivo («Orden sugerido»), y las referencias cruzadas entre ideas del mismo origen quedan en la sección «Tensión que introduce en el roadmap» de cada archivo.
- O la conclusión de que la propuesta no madura a idea —no hay problema real ni oportunidad—, comunicada sin escribir archivos.

## Principios rectores

1. **Explorar, no comprometer:** la conversación madura la propuesta —qué problema hay detrás, qué desbloquea— sin formular solución ni descomponer en tareas; eso pertenece al flujo de idea a tarea.
2. **Multiplicidad explícita:** la descomposición en varias ideas se propone al usuario con criterios declarados y se escribe solo tras su confirmación; el agente no decide solo cuántas ideas hay.
3. **Un archivo por idea:** cada idea distinguible vive en su propio `NNN-slug.md`; una idea única produce exactamente un archivo. Los archivos de idea son artefactos vivos que se conservan incluso si la idea no se procesa de inmediato.
4. **Entrada del flujo, no suplantación:** el archivo de idea aporta el problema y la oportunidad que `descubrir-problema` necesita para arrancar; no produce propuesta ni borradores.
5. **El usuario manda en la frontera:** si la descomposición sugerida no le convence, se ajusta o se descarta; una propuesta que no madura termina sin escribir archivos.

## Procedimiento

### 1. Escuchar y madurar la propuesta

1. **Escuchar la propuesta** tal como la trae el usuario, sin interrumpir para clasificar.
2. **Dialogar para madurarla:** preguntar qué situación motiva cada línea, a quién afecta y qué haría posible. Como en `descubrir-problema`, deshacer el lenguaje de solución hasta el problema subyacente —pero a nivel de cada línea, no de la propuesta entera.

### 2. Detectar la multiplicidad

3. **Aplicar los criterios de `references/deteccion-multiplicidad.md`** para distinguir una idea única de un conjunto: líneas de funcionalidad independientes, flujos de usuario separables, iteraciones con valor propio, épicas implícitas. La lista es abierta y extensible: cualquier criterio que produzca una descomposición defendible ante el usuario cuenta.
4. **Presentar la lectura al usuario:** una idea única —y por qué— o la descomposición propuesta, con un nombre y una frase por idea y un orden sugerido cuando el conjunto lo tenga (la idea que estructura a las demás primero). Si el usuario pide cambios, ajustar y repetir; si rechaza la multiplicidad, escribir una idea única o terminar sin archivos según decida.

### 3. Escribir los archivos de idea

5. **Crear `docs/ideas/` si no existe** y asignar a cada idea el siguiente número disponible de la serie del directorio (`001`, `002`, …).
6. **Redactar cada archivo** con el formato de `references/formato-idea.md`: cabecera con tipo y fecha, Problema, Qué desbloquea, Flujos de trabajo que se hacen viables, Ventajas como producto y Tensión que introduce en el roadmap. En las ideas del mismo origen, la tensión referencia a las hermanas por su slug y la cabecera declara el «Orden sugerido» confirmado.
7. **Revisar la redacción y pulir mecánicamente** cada archivo. Si el arnés lo permite, invocar `revisar-redaccion` y, con su salida, `pulir-escritura` en modo preventivo; de lo contrario, realizar el equivalente manualmente.
8. **Presentar los archivos al usuario** e informar del encaje: cada idea puede entrar al flujo invocando `idea-a-tarea`, que las consume desde `docs/ideas/` en el orden sugerido.

## Finalización

El skill ha terminado cuando ocurre una de estas dos cosas:

- Los archivos de idea confirmados están escritos en `docs/ideas/` —uno o varios— y el usuario conoce el orden sugerido y cómo procesarlos.
- La propuesta no maduró a idea o el usuario decidió no persistirla, y la conclusión quedó comunicada sin escribir nada.

## Referencias

- `references/formato-idea.md` — Plantilla del archivo de idea. Leer antes de escribir.
- `references/deteccion-multiplicidad.md` — Criterios para distinguir una idea única de un conjunto y un ejemplo de referencia. Leer en el paso 2.
