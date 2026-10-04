---
name: cerrar-conjunto
description: >
  Cierra un conjunto de trabajo agotado del índice de tareas del
  proyecto evaluado: cuando la última tarea de una agrupación —épica,
  encabezado ligero o tarea suelta— queda completada, verifica el
  criterio de cierre de la épica contra el resultado real, la marca
  como Completada y elimina la agrupación del índice.
  Usar al cerrar una tarea cuya agrupación puede haberse agotado, o
  cuando el usuario pida cerrar un conjunto de trabajo.
  Sinónimos: cerrar conjunto, cerrar épica, cierre de hito, conjunto
  agotado, limpiar agrupación del índice.
---

# Cerrar conjunto

Instrucciones para que un agente cierre un conjunto de trabajo agotado del índice de tareas del proyecto evaluado. El índice solo contiene trabajo activo: cuando la última tarea de una agrupación queda completada, la agrupación entera sale del índice —encabezado, comentario de enlace a la épica y líneas, o solo la línea cuando se trata de una tarea suelta—. Si la agrupación tiene épica, el cierre verifica primero el criterio de cierre declarado en su documento contra el resultado real y la marca como `Completada`; un criterio incumplido eleva al usuario en lugar de cerrar a ciegas. La trazabilidad de lo completado no vive en el índice: la conservan el archivo de cada tarea, el documento de épica y el historial de git.

## Cuándo usar

- Al cerrar una tarea del proyecto evaluado, para comprobar si su agrupación se agotó con ella. Es el sensor de cierre de conjunto del ciclo de tareas.
- Cuando el usuario pida cerrar una agrupación concreta o repasar el índice en busca de conjuntos agotados.

## Cuándo no usar

- Para reflejar el cierre en el roadmap del producto: este skill no escribe `ROADMAP.md`; ese reflejo corresponde a otro skill del ciclo.
- Para crear una agrupación o su épica: eso corresponde a `planificar`.
- Para replanificar la dirección cuando el trabajo realizado diverge del roadmap: eso corresponde a `planificar-roadmap`.
- Para la limpieza de mantenimiento del índice por tamaño —líneas completadas residuales de antes de este sensor—: ese repaso no verifica criterios de cierre ni toca épicas.

## Entrada

- La tarea recién completada —su archivo en el directorio de tareas o su línea en el índice—, comunicada por el ciclo de tareas en su punto de cierre, o la agrupación concreta indicada por el usuario.
- El índice de tareas del proyecto evaluado: `TODO.txt` en la raíz es la convención; si el proyecto lo ubica en otra parte o usa otro nombre, esa ubicación es un dato de entrada.
- El directorio de épicas del proyecto evaluado —`docs/epics/` en la convención—, cuando la agrupación lo enlaza con el comentario `<!-- épica: docs/epics/NNN-slug.md -->`.
- Las convenciones del índice: los encabezados `##` agrupan tareas; una sección aloja las tareas sueltas sin agrupación —`## General` en la convención—; la sección de propuestas en revisión no contiene tareas.

## Salida

- El conjunto cerrado: la épica marcada `Completada` cuando la agrupación la tiene, y la agrupación —encabezado, comentario de enlace y líneas— eliminada del índice.
- O un veredicto explícito sin modificación: «agrupación no localizada» cuando la línea de la tarea no figura en el índice, «conjunto no agotado» cuando quedan tareas activas en la agrupación, o «criterio de cierre incumplido» elevado al usuario cuando la épica no puede cerrarse.

## Principios rectores

1. **El índice solo contiene trabajo activo:** completada la última tarea de una agrupación, la agrupación entera sale del índice sin intervención del usuario; lo completado queda trazable en los archivos de tarea, en la épica y en el historial de git, no en el índice.
2. **El criterio se verifica, no se recuenta:** las líneas `[x]` son la puerta que detecta el conjunto agotado; el cierre de una épica exige verificar su criterio de cierre declarado contra el resultado real —los artefactos producidos y las condiciones que declara—, no solo el recuento de tareas.
3. **Criterio incumplido es puerta humana:** cuando la verificación falla, cuando el documento de épica enlazado no existe o cuando la verificación no puede resolverse con la evidencia disponible, el skill eleva al usuario con la evidencia y espera su decisión; nunca cierra a ciegas.
4. **El cierre no decide dirección:** el skill no escribe el roadmap ni crea trabajo nuevo; el reflejo del cierre en el roadmap corresponde a otro skill del ciclo y el trabajo descubierto durante la verificación se da de alta con `crear-tareas`.
5. **Genérico sobre el proyecto evaluado:** las rutas del índice, del directorio de épicas y de las tareas son datos de entrada; el procedimiento es el mismo en cualquier proyecto que use estas convenciones.

## Procedimiento

1. **Localizar la agrupación de la tarea.** Buscar la línea de la tarea recién completada en el índice e identificar su agrupación —la operación `grupos` de `consultar-artefactos` devuelve cada encabezado `##` con la épica enlazada, vacía en los encabezados ligeros; la sección de tareas sueltas aloja las líneas sin agrupación, donde cada línea es una agrupación de una sola tarea—. Si la línea de la tarea no aparece en el índice, emitir «agrupación no localizada» y terminar sin modificar archivo alguno. En el repaso del índice pedido por el usuario no hay tarea recién completada: recorrer cada agrupación del índice aplicando los pasos 2 a 5 a cada una.
2. **Comprobar si la agrupación se agotó** con la operación `estado-grupo` de `consultar-artefactos`: la agrupación está agotada cuando todos los estados presentes son `x`; para una tarea suelta, cuando ella misma se completó. Si quedan líneas activas, emitir «conjunto no agotado» y terminar sin modificar archivo alguno.
3. **Verificar el criterio de cierre, cuando hay épica.** Leer el documento enlazado por el comentario, extraer su sección «Criterio de cierre» y comprobarla contra el resultado real del conjunto: los artefactos que debía producir y las condiciones que declara, no solo que sus tareas estén completadas. Si el documento enlazado no existe o la verificación no puede resolverse con la evidencia disponible, tratarlo como criterio no verificable.
   - **Criterio cumplido:** continuar en el paso 4.
   - **Criterio incumplido o no verificable:** elevar al usuario con la evidencia —qué condición no se cumple o qué falta para verificarla— y esperar su decisión. Si decide mantener el conjunto abierto, informar de que el trabajo restante se da de alta con `crear-tareas` y terminar sin eliminar nada: el conjunto queda visible en el índice hasta que el usuario lo resuelva. Si decide cerrar igualmente, registrar su decisión en la sección «Revisión» de la épica con `tarea.sh registrar-revision` de `actualizar-artefactos` —siguiendo el formato de sus líneas— y continuar en el paso 4.
4. **Cerrar la épica, cuando la hay.** Marcar «Completada» en la sección «Estado» con `tarea.sh marcar-opcion` de `actualizar-artefactos` —pone `[x]` a esa opción sin tocar la de «Planificada»— y marcar completadas las piezas ejecutadas de su lista con `tarea.sh marcar-item` sobre la sección «Piezas» —esa lista es el registro que queda del conjunto una vez que el índice lo olvida—. Si el conjunto tiene PRD en `docs/prd/`, invocar `mantener-prd` en su modo de cierre: el PRD queda como registro histórico, sin moverse ni reescribirse.
5. **Eliminar la agrupación del índice** con `actualizar-artefactos`: `todo.sh retirar-grupo` borra el encabezado de la agrupación, su comentario de enlace a la épica y todas las líneas de tarea bajo él; para una tarea suelta, `todo.sh retirar` borra solo su línea.
6. **Informar del resultado:** conjunto cerrado —con épica marcada o encabezado ligero disuelto—, conjunto no agotado, o cierre elevado al usuario.

## Finalización

El skill ha terminado cuando se cumple una de las tres ramas:

- **Conjunto no agotado o agrupación no localizada:** se emitió el veredicto y no se modificó archivo alguno.
- **Conjunto cerrado:** la épica quedó marcada `Completada` cuando la agrupación la tenía —con la decisión del usuario registrada si el cierre fue con criterio incumplido— y la agrupación desapareció del índice; el roadmap del producto no se tocó.
- **Cierre elevado:** el usuario recibió la evidencia del criterio incumplido o no verificable y decidió; el índice y la épica solo cambiaron si su decisión fue cerrar.

## Referencias

- `docs/decisions/D017-todo-txt-indice-de-trabajo-activo.md` — El índice contiene solo trabajo activo; los conjuntos completados se eliminan de él.
- `docs/decisions/D019-epica-como-artefacto-de-planeacion.md` — El documento de épica, su criterio de cierre y su relación con la agrupación del índice.
- `docs/decisions/D008-organizacion-por-hitos-en-todo.md` — Convención de encabezados de agrupación en el índice.
