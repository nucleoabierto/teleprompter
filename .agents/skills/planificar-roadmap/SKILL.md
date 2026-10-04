---
name: planificar-roadmap
description: >
  Produce el roadmap del producto: el documento ROADMAP.md en la
  raíz del repositorio que declara las líneas de trabajo —épicas,
  hitos ligeros y tareas sueltas— organizadas en horizontes de
  confianza (Now, Next, Later, No ahora), con justificación de
  posición dentro de los horizontes comprometidos, y refleja esos
  horizontes en TODO.txt. Es el nivel por encima de la épica: decide
  dirección y prioridad, no estado.
  Usar cuando haya que ordenar varias líneas de trabajo abiertas,
  posicionar trabajo suelto respecto a las épicas, o revisar la
  dirección del producto.
  Sinónimos: planear roadmap, planificar roadmap, crear roadmap,
  ordenar líneas de trabajo, secuenciar épicas, priorizar trabajo.
---

# Planificar roadmap

Instrucciones para que un agente produzca el roadmap de un producto: el documento `ROADMAP.md` en la raíz del repositorio que declara las líneas de trabajo abiertas organizadas en horizontes de confianza —Now (comprometido y en vuelo), Next (validado y próximo), Later (dirección sin compromiso) y No ahora (aparcado con su razón)—, con justificación de posición dentro de Now y Next. Es el nivel por encima de la épica: donde la épica da objetivo y guía a un conjunto, el roadmap decide qué conjunto —y qué trabajo suelto— va primero y por qué.

## Cuándo usar

- Cuando el producto tiene varias líneas de trabajo abiertas —épicas planificadas, hitos ligeros, tareas sueltas— sin orden ni dirección declarados.
- Cuando aparece una línea nueva o se cierra una existente y hay que replantear el orden.
- Cuando una decisión cambia el costo relativo entre líneas —por ejemplo, un refactor transversal cuya posición altera el costo de las demás— y el orden declarado hay que revisarlo.
- Cuando `mantener-roadmap` detecta divergencia de dirección al reflejar la ejecución —un horizonte comprometido agotado con sucesores esperando, trabajo comprometido sin línea en el roadmap, una épica completada aún listada—: la replanificación es suya y la puerta humana sigue decidiendo la dirección.

## Cuándo no usar

- Para ordenar las tareas dentro de un conjunto: eso es el plan técnico de la épica, producido por `planificar`.
- Para una sola línea de trabajo: sin varias líneas no hay orden que decidir.
- Para ejecutar el trabajo ordenado: eso corresponde a `ejecutar-tareas` sobre `TODO.txt`.
- Para registrar dependencias duras entre tareas: eso es el marcador de bloqueo `[!]` del índice; el roadmap declara orden preferente justificado, no bloqueos.

## Entrada

- La visión o documento de dirección del producto, si existe, como ancla de la trazabilidad.
- `docs/epics/` y `TODO.txt` como inventario de líneas de trabajo abiertas: épicas planificadas, hitos ligeros y tareas sueltas pendientes.
- `assets/roadmap.md` como plantilla del documento.

## Salida

- `ROADMAP.md` en la raíz del repositorio del producto con las líneas asignadas a su horizonte, la justificación de cada posición en Now y Next, y estado por línea en Now. Es un documento vivo único: se actualiza in situ y su historia la preserva git; no hay serie de roadmaps ni fechas comprometidas.
- `TODO.txt` reflejando los horizontes comprometidos: las líneas de Now y Next aparecen en el índice reordenadas si divergían, sin tocar el estado de ninguna tarea. Later y No ahora viven solo en el roadmap, su hogar natural como documento de dirección; una propuesta `[p]` del índice no es una línea del roadmap hasta que se aprueba y planifica.

## Principios rectores

1. **El roadmap decide, el índice ejecuta:** `ROADMAP.md` es la fuente de verdad de prioridad y dirección; `TODO.txt` es la fuente de verdad de ejecución y estado. El índice refleja mecánicamente los horizontes comprometidos (Now y Next), igual que la agrupación por hitos lo es de la épica; Later y No ahora no tienen reflejo en el índice.
2. **Horizontes de confianza, no fechas:** cada línea declara su nivel de compromiso —Now acotado (3-5 líneas) y con estado, Next próximo, Later dirección sin orden interno, No ahora aparcado con razón— porque la confianza comunica más honestidad que una secuencia única y da hogar a lo descartado sin perderlo.
3. **Orden justificado, no solo declarado:** dentro de Now y Next cada línea lleva la razón de su posición —impacto sobre otras líneas, dependencias, costo evitado— porque la justificación es lo que comunica los efectos cruzados y lo que permite revisar el orden cuando cambian las condiciones.
4. **Orden preferente, no bloqueo:** el roadmap posiciona líneas por conveniencia; si una línea no puede empezar sin otra, la dependencia se declara como bloqueo en el índice, no como posición en el roadmap.
5. **Planear sobre líneas reales:** horizonte y orden se deciden leyendo las épicas y las tareas tal como están escritas —sus planes técnicos declaran las interacciones—, no sobre títulos abstractos.
6. **Puerta humana:** el borrador del roadmap se presenta al usuario antes de crear el archivo; la dirección del producto no se considera decidida sin esa aprobación.
7. **Absorbe trabajo suelto:** las líneas no son solo épicas; una tarea suelta o un hito ligero también se posiciona, con la misma justificación.

## Procedimiento

### 1. Reunir las líneas

1. **Inventariar las líneas de trabajo abiertas** con la operación `inventario` de `consultar-artefactos`, que devuelve las épicas con su estado, las agrupaciones del índice —con o sin épica enlazada— y las tareas sueltas no completadas de `## General`.
2. **Leer el contenido real de cada línea:** los planes técnicos de las épicas y los objetivos de las tareas sueltas, buscando las interacciones —qué línea cambia el costo de qué otra, qué formato o estructura asume una forma del sistema que otra línea todavía puede alterar.
3. **Si hay una sola línea abierta**, informar de que no hay orden que decidir y terminar sin crear el documento.

### 2. Redactar el borrador

4. **Asignar cada línea a su horizonte** según el nivel de compromiso: Now para lo decidido y en vuelo (3-5 líneas, con estado), Next para lo validado que sigue, Later para la dirección sin compromiso (temas sin orden) y No ahora para lo aparcado, con la razón. Las propuestas `[p]` del índice no entran: una propuesta no es línea hasta que se aprueba y planifica.
5. **Ordenar Now y Next** por secuencia de ejecución y redactar la justificación de cada posición: qué la hace conveniente ahí y qué pasaría si ocupara otra. Later se agrupa por tema sin orden interno.
6. **Redactar la dirección** a partir de la visión del producto: el objetivo que este conjunto de líneas sirve; toda línea del documento debe remitir a ella.
7. **Aplicar revisión de redacción y pulido mecánico en modo preventivo.** Si el arnés lo permite, invocar `revisar-redaccion` y, con su salida, `pulir-escritura`; de lo contrario, realizar el equivalente manualmente.

### 3. Puerta humana

8. **Presentar el borrador al usuario** para aprobación, con los horizontes, el orden y sus justificaciones. Si solicita cambios, ajustar y repetir. Si lo rechaza, no crear el archivo y terminar.

### 4. Materializar el roadmap

9. **Crear o actualizar `ROADMAP.md`** en la raíz del repositorio siguiendo `assets/roadmap.md`, registrando la aprobación en su sección Revisión con `tarea.sh registrar-revision` de `actualizar-artefactos`. El documento es vivo: una dirección nueva se escribe sobre la anterior, cuya historia queda en git.
10. **Reflejar los horizontes comprometidos en `TODO.txt`:** recolocar las agrupaciones —encabezados de hito y tareas sueltas— para que el orden del índice coincida con el declarado en Now y Next, componiendo la reordenación con `todo.sh recolocar` de `actualizar-artefactos`, que mueve bloques sin tocar el estado de ninguna tarea. Later y No ahora no aparecen en el índice. Si el índice ya coincide, no tocarlo.
11. **Informar al usuario** del roadmap producido y del orden reflejado en el índice.

## Finalización

El skill ha terminado cuando:

- El usuario aprobó los horizontes, el orden y las justificaciones.
- `ROADMAP.md` existe en la raíz con las líneas asignadas a su horizonte y justificadas en Now y Next.
- `TODO.txt` refleja Now y Next sin cambios de estado.

## Referencias

- `assets/roadmap.md` — Plantilla del documento de roadmap. Leer antes de redactar el borrador.
- `docs/decisions/D022-roadmap-como-nivel-de-direccion.md` — El roadmap como artefacto de dirección y su relación con el índice.
- `docs/research/2026-09-documentacion-producto-y-roadmap.md` — El patrón Now/Next/Later, los límites por horizonte y el «No ahora».
- `docs/decisions/D019-epica-como-artefacto-de-planeacion.md` — El nivel inmediatamente inferior y la relación artefacto↔índice que este nivel replica.
