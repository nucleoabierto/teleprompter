---
name: planificar
description: >
  Produce la épica de un conjunto de trabajo: el documento en
  docs/epics/ que declara objetivo, alcance, piezas y plan técnico
  (guía de arquitectura), y refleja el conjunto como agrupación en
  TODO.txt. Tiene dos modos: en la promoción, invocado por el
  orquestador del flujo de idea a tarea tras materializar los
  borradores de una propuesta, y bajo demanda, para agrupar tareas
  ya creadas.
  Usar cuando haya que dar hogar y dirección técnica a un conjunto
  de tareas, al promover una propuesta o al reunir trabajo existente.
  Sinónimos: planear, planificar épica, crear épica, agrupar
  tareas en épica.
---

# Planificar

Instrucciones para que un agente produzca la épica de un conjunto de trabajo: el documento que declara el objetivo, el alcance, las piezas y la guía de arquitectura del conjunto, reflejado en `TODO.txt` como su agrupación visible. El skill tiene dos modos que comparten un núcleo común y se bifurcan solo en la entrada: el modo promoción, invocado por el orquestador del flujo de idea a tarea como cierre de la planeación tras materializar los borradores de una propuesta, y el modo bajo demanda, para agrupar tareas ya creadas.

## Cuándo usar

- Cuando el flujo de idea a tarea ha promocionado los borradores de una propuesta a tareas y hay que cerrar la planeación asignando el conjunto a una épica nueva o existente (modo promoción).
- Cuando el usuario pide agrupar tareas ya creadas bajo una épica nueva o existente (modo bajo demanda).
- Cuando un conjunto de trabajo en ejecución necesita objetivo explícito o guía de arquitectura y aún no tiene épica.

## Cuándo no usar

- Para una sola tarea o un conjunto trivial que no amerita épica: las tareas se agrupan bajo un encabezado ligero del índice, sin documento de épica.
- Para descomponer una propuesta en borradores: eso corresponde a `refinar-propuesta`.
- Para producir el plan detallado de una tarea individual: eso ocurre en su ejecución, dentro de la guía de la épica.
- Para secuenciar varios conjuntos en el tiempo (nivel *roadmap*): eso corresponde a `planificar-roadmap`.

## Entrada

- **Modo promoción:** la propuesta aprobada en `docs/proposals/NNN-slug/` y las tareas definitivas recién creadas a partir de sus borradores por `crear-tareas`, comunicadas por el orquestador del flujo de idea a tarea.
- **Modo bajo demanda:** una intención de conjunto del usuario y la lista de tareas existentes a agrupar (sus números o archivos en `docs/tasks/`).
- `TODO.txt` como índice actual de tareas.
- `assets/epica.md` como plantilla del documento de épica.

## Salida

- Un documento de épica nuevo en `docs/epics/NNN-slug.md` con estado `Planificada`, o una épica existente actualizada con las piezas nuevas.
- La agrupación correspondiente en `TODO.txt`: un encabezado con el título de la épica, las líneas de las tareas bajo él y un comentario `<!-- épica: docs/epics/NNN-slug.md -->` que enlaza la agrupación con el documento.
- Las líneas de las tareas agrupadas se mueven bajo el encabezado de la épica desde su ubicación anterior (en modo promoción, `## General`; en modo bajo demanda, su sección previa).

## Principios rectores

1. **La épica planea, no ejecuta:** el índice sigue siendo la fuente de la ejecución y del estado de las tareas; la épica es la fuente de verdad del objetivo, el alcance y la guía de arquitectura del conjunto.
2. **El plan técnico es una guía, no un plan detallado:** fija los patrones, las estructuras y las decisiones transversales que las piezas comparten, más el orden de implementación y las dependencias. El detalle de cada pieza se produce en su ejecución.
3. **Planear sobre piezas reales:** la épica se produce con el trabajo ya descompuesto; su plan se basa en las tareas tal como quedaron escritas, no en la intención abstracta.
4. **Puerta humana:** el borrador de la épica se presenta al usuario antes de crear o modificar el archivo; el conjunto no se considera planificado sin esa aprobación.
5. **Épica nueva o existente:** si el conjunto pertenece a un esfuerzo que ya tiene épica, las piezas se añaden a la existente en lugar de crear una paralela.

## Procedimiento

### 1. Determinar el modo

1. **Si la entrada llega del orquestador del flujo de idea a tarea** tras promocionar borradores, continuar en modo promoción. **Si el usuario pide agrupar tareas existentes**, continuar en modo bajo demanda.

### 2. Reunir las piezas

2. **Identificar las tareas del conjunto.** En modo promoción, son las tareas recién creadas de la propuesta; en modo bajo demanda, son las que el usuario lista.
3. **Leer los archivos de tarea** para extraer objetivos, dependencias y resultados esperados. El plan se construye sobre ese contenido real.
4. **Decidir si el conjunto amerita épica.** Si es trivial (pocas piezas, sin decisiones transversales), informar al usuario y agrupar bajo un encabezado ligero —un `## Hito N: título` sin documento de épica ni comentario de enlace—, moviendo las entradas de las tareas bajo él; terminar. En caso de duda, preguntar al usuario.
5. **Determinar si existe una épica destino.** Revisar `docs/epics/` y los encabezados de `TODO.txt`. Si el conjunto pertenece a una épica existente, el procedimiento actualiza esa épica en lugar de crear una nueva; en caso de duda, preguntar al usuario.

### 3. Redactar el borrador de épica

6. **Redactar el documento** siguiendo `assets/epica.md`:
   - **Objetivo:** el resultado del conjunto, formulado de forma verificable.
   - **Alcance:** qué contiene y qué queda fuera.
   - **Piezas:** la lista de tareas del conjunto, existentes o por crear, con referencia a sus archivos.
   - **Plan técnico:** el orden de implementación derivado de las dependencias entre piezas, las dependencias técnicas y las decisiones transversales ya tomadas (patrones y estructuras que las piezas comparten).
   - **Criterio de cierre:** la condición bajo la que el conjunto se considera completo.
7. **Aplicar revisión de redacción y pulido mecánico en modo preventivo.** Si el arnés lo permite, invocar `revisar-redaccion` y, con su salida, `pulir-escritura`; de lo contrario, realizar el equivalente manualmente.

### 4. Puerta humana

8. **Presentar el borrador al usuario** para aprobación. Si solicita cambios, ajustar y repetir desde el paso 6. Si lo rechaza, no crear ni modificar el documento de épica y terminar. En modo promoción, las entradas de las tareas ya figuran en `## General` desde la promoción; informar de que el conjunto queda sin agrupar.

### 5. Materializar la épica

9. **Si es épica nueva:** asignar el siguiente número disponible en `docs/epics/`, crear `docs/epics/NNN-slug.md` con estado `Planificada` y registrar la aprobación en su sección Revisión.
10. **Si es épica existente:** añadir las piezas nuevas a su lista, actualizar objetivo, alcance o plan técnico solo si el conjunto nuevo lo exige, y registrar la incorporación en su sección Revisión.
11. **Reflejar la agrupación en `TODO.txt`:** crear o reutilizar el encabezado de la épica con el formato de hito (`## Hito N: título de la épica`, donde `N` es el siguiente número de hito del índice) y añadir bajo él el comentario `<!-- épica: docs/epics/NNN-slug.md -->`. Colocar las líneas de las tareas del conjunto bajo ese encabezado, creándolas si aún no existen y moviéndolas desde su ubicación actual si ya figuran en el índice.
12. **Informar al usuario** de la épica creada o actualizada y de la agrupación resultante.

## Finalización

El skill ha terminado cuando:

- El usuario aprobó el borrador de la épica.
- El documento existe en `docs/epics/` (o la épica existente quedó actualizada) con estado `Planificada`.
- `TODO.txt` refleja la agrupación con su encabezado, el comentario de enlace a la épica y las tareas bajo él.

## Referencias

- `assets/epica.md` — Plantilla del documento de épica. Leer antes de redactar el borrador.
- `docs/decisions/D019-epica-como-artefacto-de-planeacion.md` — Formato, ubicación y lugar de la épica en el flujo.
- `docs/decisions/D008-organizacion-por-hitos-en-todo.md` — Convención de encabezados de agrupación en `TODO.txt`.
