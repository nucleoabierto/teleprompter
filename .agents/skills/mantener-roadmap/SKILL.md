---
name: mantener-roadmap
description: >
  Mantiene el roadmap del producto fiel a la ejecución real: al
  cerrar una tarea refleja mecánicamente en las líneas comprometidas
  el estado que declara el índice —en curso, pendiente de arrancar,
  bloqueada—, retira las completadas y, cuando detecta divergencia
  de dirección, dispara la replanificación del roadmap con su
  puerta humana.
  Usar al cerrar una tarea del proyecto evaluado o cuando el
  usuario pida sincronizar el roadmap con la ejecución.
  Sinónimos: mantener roadmap, reflejar ejecución en roadmap,
  sincronizar roadmap, actualizar estado del roadmap, reflector
  del roadmap.
---

# Mantener roadmap

Instrucciones para que un agente mantenga el `ROADMAP.md` del proyecto evaluado fiel a la ejecución real. El roadmap decide la dirección y el índice de tareas la ejecuta: este skill es el reflejo mecánico que mantiene ambos coherentes. Al cerrar una tarea reconstruye el estado real de cada línea comprometida del roadmap desde el índice y las épicas, actualiza el campo «Estado» de cada línea y retira las completadas. Cuando detecta divergencia de dirección —trabajo comprometido sin línea, un horizonte comprometido agotado con sucesores esperando, una épica completada aún listada— invoca `planificar-roadmap`, cuya puerta humana sigue decidiendo la dirección. El skill nunca reordena líneas, cambia horizontes ni reescribe justificaciones.

## Cuándo usar

- Al cerrar una tarea del proyecto evaluado, para reflejar su efecto en el roadmap. Es el sensor del roadmap del ciclo de tareas y corre en el mismo punto de cierre que los demás sensores; sus entradas no dependen del orden en que se invoquen.
- Cuando el usuario pida sincronizar el roadmap con la ejecución real.

## Cuándo no usar

- Para crear el roadmap o replantear la dirección —horizontes, orden y justificaciones—: eso corresponde a `planificar-roadmap`, que este skill invoca cuando detecta divergencia.
- Para cerrar los conjuntos agotados del índice —marcar la épica `Completada` y eliminar la agrupación—: eso corresponde a `cerrar-conjunto`.
- Cuando el proyecto evaluado no tiene roadmap: el skill emite «roadmap ausente» y no crea el documento; crearlo es decidir dirección.

## Entrada

- La tarea recién completada, comunicada por el ciclo de tareas en su punto de cierre, o la solicitud de sincronización del usuario.
- El índice de tareas del proyecto evaluado —`TODO.txt` en la convención; si el proyecto lo ubica en otra parte, esa ubicación es un dato de entrada— como fuente de verdad del estado de ejecución: qué trabajo está comprometido y en qué estado está cada tarea.
- El directorio de épicas del proyecto evaluado —`docs/epics/` en la convención; si el proyecto lo ubica en otra parte, esa ubicación es un dato de entrada— como fuente del estado de las líneas-épica.
- El roadmap del proyecto evaluado: `ROADMAP.md` en la raíz es la convención; si el proyecto lo ubica en otra parte, esa ubicación es un dato de entrada. El formato esperado es el que produce `planificar-roadmap`: horizontes Now, Next, Later y No ahora, con campo «Estado» por línea en Now.

## Salida

- El roadmap reflejado: los campos «Estado» de las líneas de Now actualizados al estado real —`en curso`, `pendiente de arrancar`, `bloqueada por …`— y las líneas completadas retiradas; más la invocación de `planificar-roadmap` cuando se detectó divergencia de dirección.
- O un veredicto explícito sin modificación: «sin cambios» cuando el roadmap ya refleja la realidad, o «roadmap ausente» cuando el proyecto no lo tiene.

## Principios rectores

1. **El índice es la fuente del estado, el roadmap el de la dirección:** el reflejo va en una sola dirección —del estado real de ejecución al campo «Estado» de la línea—; el skill nunca escribe el índice ni decide prioridades.
2. **Reflejo mecánico, no dirección:** el skill actualiza estados y retira líneas completadas; no reordena líneas, no mueve trabajo entre horizontes y no reescribe justificaciones. Todo lo que huele a decisión de dirección es entrada para `planificar-roadmap`, no para este skill.
3. **La divergencia dispara replanificación, no se informa sola:** detectar que la dirección ya no refleja la ejecución invoca `planificar-roadmap`, cuya puerta humana decide; un roadmap divergente sin replanificar es un roadmap que miente.
4. **Sensor con veredicto:** cuando el roadmap ya es fiel emite «sin cambios» y cuando no existe emite «roadmap ausente»; no toca el documento por tocarlo.
5. **Genérico sobre el proyecto evaluado:** las rutas del índice, de las épicas y del roadmap son datos de entrada; el procedimiento es el mismo en cualquier proyecto que use estas convenciones.

## Procedimiento

1. **Localizar el roadmap.** Buscar `ROADMAP.md` en la raíz del proyecto evaluado, o la ubicación que el proyecto use. Si no existe, emitir «roadmap ausente» y terminar sin crear ni invocar nada.
2. **Reconstruir el estado real de cada línea de Now.** Resolver cada línea del horizonte Now al trabajo que referencia y leer su estado real —las consultas mecánicas se delegan en `consultar-artefactos`: `grupos` resuelve los encabezados y sus épicas enlazadas, `estado-grupo` los estados presentes bajo un encabezado y `estado` el marcador de un archivo de tarea—. Una línea que referencia un documento de épica o un encabezado del índice resuelve a la agrupación entera —la agrupación enlazada a la épica por el comentario `<!-- épica: ruta -->` o las tareas bajo el encabezado ligero—; una línea que referencia un archivo de tarea resuelve a esa tarea concreta, esté suelta en el índice o dentro de una agrupación. El estado se evalúa en el orden de la lista:
   - **Completada:** la épica referenciada está marcada `Completada`, o el trabajo de la línea ya no figura en el índice por haberse cerrado —para una tarea, su archivo declara «Estado» completada—, o todas las líneas de tarea del trabajo están `[x]`.
   - **Bloqueada:** alguna de sus tareas está marcada `[!]`; las bloqueantes se leen de la sublista que el marcador declara en el índice.
   - **En curso:** alguna de sus tareas ya se ejecutó o se está ejecutando —estado `[~]`, `[r]` o `[x]`— sin estar el trabajo completado ni bloqueado.
   - **Pendiente de arrancar:** todas sus tareas siguen pendientes `[ ]`.
   - **Irresoluble:** el trabajo de la línea no se localiza ni en el índice ni en las épicas, o se localiza sin presencia ejecutable ni marca de cierre —una épica planificada cuya agrupación ya no está en el índice, una tarea ausente del índice cuyo archivo no está completada—, o la línea no sigue el formato esperado; se trata como divergencia de dirección, no como estado.
3. **Escribir solo las diferencias.** Actualizar el campo «Estado» de cada línea de Now con el vocabulario canónico —`en curso`, `pendiente de arrancar`, `bloqueada por …` seguido de las bloqueantes— solo cuando el estado real difiera del declarado, y retirar la línea completa —con su «Estado» y su «Justificación»— cuando su trabajo esté completado, renumerando las líneas restantes si el roadmap las enumera: la renumeración es reflejo, no reordenado. No tocar nada más: ni el orden de las líneas, ni los horizontes, ni las justificaciones, ni las secciones sin estado.
4. **Detectar divergencia de dirección.** Tras el reflejo, comprobar si la ejecución diverge de la dirección declarada —los casos esperados son, sin agotar la lista: el horizonte Now quedó vacío teniendo Next líneas pobladas; hay agrupaciones o tareas sueltas comprometidas en el índice sin línea en el roadmap; una épica marcada `Completada` sigue referenciada en cualquier sección; o alguna línea de Now resultó irresoluble en el paso 2. Si hay divergencia, invocar `planificar-roadmap` con las condiciones detectadas como contexto: la decisión de dirección es suya, con su puerta humana.
5. **Informar del resultado:** las líneas actualizadas o retiradas y la divergencia detectada con la replanificación invocada, o el veredicto «sin cambios» o «roadmap ausente».

## Finalización

El skill ha terminado cuando se cumple una de las tres ramas:

- **Sin escritura:** se emitió «sin cambios» o «roadmap ausente» y el documento no se tocó.
- **Reflejado:** los campos «Estado» de Now coinciden con el estado real del índice y las líneas completadas se retiraron, sin tocar orden, horizontes ni justificaciones.
- **Con divergencia:** además del reflejo que procediera, `planificar-roadmap` fue invocado con las condiciones de divergencia detectadas.

## Referencias

- `docs/decisions/D022-roadmap-como-nivel-de-direccion.md` — El roadmap decide y el índice ejecuta; el reflejo entre ambos es mecánico.
- `docs/decisions/D027-roadmap-horizontes-now-next-later.md` — Los horizontes del roadmap; solo Now declara estado por línea.
- `.agents/skills/planificar-roadmap/assets/roadmap.md` — La plantilla del documento: formato de líneas y campo «Estado».
