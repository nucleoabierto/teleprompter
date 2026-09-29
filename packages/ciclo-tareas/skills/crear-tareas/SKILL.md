---
name: crear-tareas
description: >
  Crea tareas definitivas en docs/tasks/ y las registra en TODO.txt
  a partir de una solicitud articulada del usuario.
  Usar cuando el usuario pida crear tareas o cuando se descubran
  nuevas tareas durante la ejecución de otra tarea.
  Sinónimos: crear tarea, registrar tarea, añadir tarea, dar de alta
  tarea.
---

# Crear tareas

Instrucciones para que un agente cree tareas definitivas en `docs/tasks/` y las registre en `TODO.txt` a partir de una solicitud articulada.

## Cuándo usar

- Cuando el usuario pide crear una o varias tareas.
- Cuando se descubren nuevas tareas durante la ejecución de otra tarea.

## Cuándo no usar

- Para acciones triviales que no necesitan seguimiento.
- Cuando el usuario pide explícitamente no crear tarea.
- Para redactar borradores o propuestas: este skill solo produce tareas definitivas.

## Entrada

- La solicitud del usuario, que puede describir una o varias tareas, articulada con objetivo, resultado esperado y al menos un criterio de calidad. Si la entrada es una solicitud sin articular, se descompone en tareas antes de crear.
- `TODO.txt` como índice actual de tareas.
- `assets/task.txt` como plantilla de tarea definitiva.

## Salida

- Uno o varios archivos de tarea en `docs/tasks/` siguiendo la plantilla, con estado inicial `[ ]` y la sección Revisión con los marcadores sin rellenar.
- Entradas correspondientes añadidas a `TODO.txt`, bajo la agrupación correspondiente cuando la tienen y en `## General` en caso contrario.

## Principios rectores

1. **Una tarea, un archivo:** cada tarea produce un archivo en `docs/tasks/` siguiendo la plantilla y una línea en `TODO.txt`.
2. **Validación antes de crear:** la descomposición se presenta al usuario antes de generar archivos.

## Procedimiento

### 1. Descomposición

1. **Descomponer la solicitud** del usuario en tareas. Cada tarea debe tener: título breve, tipo (para el enrutado de `ejecutar-tareas`; la lista es abierta y extensible), objetivo conciso, dependencias si las hay, resultado esperado y criterios de calidad verificables.
2. **Presentar al usuario** un resumen de las tareas propuestas antes de generar los archivos: para cada tarea, título, tipo, objetivo y dependencias. Si el usuario solicita cambios, ajustar y repetir. Si rechaza la descomposición, no crear archivos y terminar.
3. **Crear cada tarea** siguiendo el núcleo común.

### 2. Núcleo común

4. **Determinar el siguiente número de tarea** consultando `TODO.txt` y `docs/tasks/`. Si `TODO.txt` no existe, crearlo con la estructura del proyecto antes de continuar.
5. **Crear cada archivo de tarea** en `docs/tasks/` usando `assets/task.txt`, con estado inicial `[ ]` y la sección Revisión con los marcadores de la plantilla sin rellenar.
6. **Añadir las entradas a `TODO.txt`** con el formato `- [ ] docs/tasks/NNN-identificador.md — título breve`, donde el identificador es una versión en kebab-case del título. El destino es la agrupación correspondiente si la tarea pertenece a una agrupación existente, o la sección `## General` si es una tarea suelta sin agrupación propia; si la sección no existe, crearla antes de la primera agrupación. Si el destino no está claro, inferirlo del contexto de la solicitud y, si aun así hay duda, preguntar al usuario.
7. **Informar al usuario** de las tareas creadas.

## Finalización

El skill ha terminado cuando:

- Los archivos de tarea están creados en `docs/tasks/` con sus entradas en `TODO.txt`.
- El usuario aprobó la descomposición antes de la creación.

## Referencias

- `assets/task.txt` — Plantilla de tarea definitiva. Leer antes de crear archivos de tarea.
