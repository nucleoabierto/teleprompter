---
name: crear-tareas
description: >
  Crea tareas definitivas en docs/tasks/ y las registra en TODO.txt.
  Tiene dos modos: el modo independiente crea tareas de forma
  interactiva desde una solicitud articulada, y el modo flujo de idea
  a tarea promociona los borradores aprobados de una propuesta.
  Usar cuando el usuario pida crear tareas, cuando se descubran nuevas
  tareas durante la ejecución de otra tarea, o cuando una propuesta
  haya sido aprobada.
  Sinónimos: crear tarea, registrar tarea, añadir tarea, dar de alta
  tarea, promocionar borradores.
---

# Crear tareas

Instrucciones para que un agente cree tareas definitivas en `docs/tasks/` y las registre en `TODO.txt`. El skill tiene dos modos que comparten un núcleo común y se bifurcan solo en la entrada.

## Cuándo usar

- Cuando el usuario pide crear una o varias tareas (modo independiente).
- Cuando se descubren nuevas tareas durante la ejecución de otra tarea (modo independiente).
- Cuando una propuesta en `docs/proposals/` ha sido aprobada por el usuario y hay que materializar sus borradores en tareas (modo flujo de idea a tarea).

## Cuándo no usar

- Para acciones triviales que no necesitan seguimiento.
- Cuando el usuario pide explícitamente no crear tarea.
- Para crear borradores de una propuesta: eso corresponde a `refinar-propuesta`, tercera capacidad del flujo de idea a tarea.

## Entrada

- **Modo independiente:** la solicitud del usuario, que puede describir una o varias tareas, articulada con objetivo, resultado esperado y al menos un criterio de calidad. Si la entrada es una solicitud sin articular, se descompone en tareas antes de crear.
- **Modo flujo de idea a tarea:** un directorio `docs/proposals/NNN-slug/` con `propuesta.md` en estado `[p]` Pendiente de revisión cuya aprobación el usuario ya comunicó, y sus borradores `MM-titulo.md`.
- `TODO.txt` como índice actual de tareas.
- `assets/task.txt` como plantilla de tarea definitiva.

## Salida

- Uno o varios archivos de tarea en `docs/tasks/` siguiendo la plantilla, con estado inicial `[ ]` y la sección Revisión con los marcadores sin rellenar.
- Entradas correspondientes añadidas a `TODO.txt`, bajo la agrupación correspondiente cuando la tienen y en `## General` en caso contrario.
- En modo flujo de idea a tarea, además: `propuesta.md` en estado `[a]` Aprobada con su índice de borradores actualizado a las tareas definitivas y la línea `[p]` retirada de la sección «Propuestas en revisión» de `TODO.txt`. Las entradas de las tareas quedan en `## General`; la agrupación del conjunto la produce el orquestador del flujo invocando `planificar`.

## Principios rectores

1. **Núcleo común:** ambos modos producen lo mismo —archivos en `docs/tasks/` y líneas en `TODO.txt`—. La diferencia está solo en la entrada; la estructura del skill se organiza alrededor del núcleo, no de los modos.
2. **El modo independiente es autónomo:** sigue operando por sí solo, sin depender del flujo de idea a tarea.
3. **Promoción sin reescritura:** en modo flujo de idea a tarea, el borrador ya tiene los campos de la plantilla de tarea; la promoción lo mueve y añade Estado y Revisión, no lo reformula.
4. **Validación antes de crear:** en modo independiente, la descomposición se presenta al usuario antes de generar archivos; en modo flujo de idea a tarea, la validación ya ocurrió en la puerta de aprobación de la propuesta.

## Procedimiento

### 1. Determinar el modo

1. **Leer la entrada.** Si es una solicitud articulada del usuario o una tarea descubierta durante la ejecución, continuar en modo independiente. Si es una propuesta aprobada (directorio `docs/proposals/NNN-slug/` con `propuesta.md` en `[p]` y la aprobación comunicada por el usuario), continuar en modo flujo de idea a tarea.

### 2a. Modo independiente

2. **Descomponer la solicitud** del usuario en tareas. Cada tarea debe tener: título breve, tipo (para el enrutado de `ejecutar-tareas`; la lista es abierta y extensible), objetivo conciso, dependencias si las hay, resultado esperado y criterios de calidad verificables.
3. **Presentar al usuario** un resumen de las tareas propuestas antes de generar los archivos: para cada tarea, título, tipo, objetivo y dependencias. Si el usuario solicita cambios, ajustar y repetir. Si rechaza la propuesta, no crear archivos y terminar.
4. **Crear cada tarea** siguiendo el núcleo común.

### 2b. Modo flujo de idea a tarea

5. **Verificar la propuesta:** `propuesta.md` en estado `[p]`, aprobación del usuario comunicada y borradores `MM-titulo.md` presentes. Si alguna condición falla, detenerse e informar al usuario sin modificar archivos. Si todo es correcto, registrar la decisión en el campo Revisión de `propuesta.md`.
6. **Promocionar cada borrador en orden de numeración.** Por cada `MM-titulo.md`:
   - Aplicar revisión de redacción y pulido mecánico en modo preventivo. Si el arnés lo permite, invocar `revisar-redaccion` y, con su salida, `pulir-escritura`; de lo contrario, realizar el equivalente manualmente.
   - Asignar el siguiente número de tarea disponible y mover el archivo a `docs/tasks/NNN-slug.md`.
   - Añadir la sección Estado con `[ ]` Pendiente y la sección Revisión con los marcadores de la plantilla sin rellenar.
   - Renumerar las dependencias: cada «Borrador NN» pasa al número de tarea definitivo que le correspondió —verificar que ya tiene número asignado—; las dependencias a tareas existentes (números de tarea) se conservan.
7. **Actualizar el índice de `propuesta.md`** para que cada línea apunte a la tarea definitiva: `- docs/tasks/NNN-slug.md — título breve`.
8. **Cambiar el estado de `propuesta.md`** a `[a]` Aprobada y eliminar su línea de la sección «Propuestas en revisión» de `TODO.txt`.

### 3. Núcleo común

En modo flujo de idea a tarea, la promoción del paso 6 ya realizó el equivalente de los pasos 9 y 10; continuar en el paso 11, que registra las entradas en `## General` a la espera de que el orquestador del flujo las agrupe invocando `planificar`.

9. **Determinar el siguiente número de tarea** consultando `TODO.txt` y `docs/tasks/`. Si `TODO.txt` no existe, crearlo con la estructura del proyecto antes de continuar.
10. **Crear cada archivo de tarea** en `docs/tasks/` usando `assets/task.txt`, con estado inicial `[ ]` y la sección Revisión con los marcadores de la plantilla sin rellenar.
11. **Añadir las entradas a `TODO.txt`** con el formato `- [ ] docs/tasks/NNN-identificador.md — título breve`, donde el identificador es una versión en kebab-case del título. El destino es la agrupación correspondiente si la tarea pertenece a trabajo planificado —épica o encabezado ligero—, o la sección `## General` si es una tarea suelta sin agrupación propia; si la sección no existe, crearla antes de la primera agrupación. Si el destino no está claro, inferirlo del contexto de la solicitud o la propuesta y, si aun así hay duda, preguntar al usuario.
12. **Informar al usuario** de las tareas creadas. En modo flujo de idea a tarea, indicar que las entradas quedaron en `## General` a la espera de la agrupación: si el skill no fue invocado por el orquestador del flujo, ofrecer invocar `planificar` en modo promoción para cerrar la planeación del conjunto.

## Finalización

El skill ha terminado cuando:

- Los archivos de tarea están creados en `docs/tasks/` con sus entradas en `TODO.txt`.
- En modo independiente, el usuario aprobó la descomposición antes de la creación.
- En modo flujo de idea a tarea, la propuesta quedó en estado `[a]`, con su índice apuntando a las tareas definitivas y su línea `[p]` retirada de `TODO.txt`.

## Referencias

- `assets/task.txt` — Plantilla de tarea definitiva. Leer antes de crear archivos de tarea.
