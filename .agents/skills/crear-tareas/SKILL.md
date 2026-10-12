---
name: crear-tareas
description: >
  Crea tareas definitivas en el directorio de tareas de la
  convención y las registra en el índice de tareas.
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

Instrucciones para que un agente cree tareas definitivas en el directorio de tareas y las registre en el índice. El skill tiene dos modos que comparten un núcleo común y se bifurcan solo en la entrada.

## Cuándo usar

- Cuando el usuario pide crear una o varias tareas (modo independiente).
- Cuando se descubren nuevas tareas durante la ejecución de otra tarea (modo independiente).
- Cuando una propuesta ha sido aprobada por el usuario y hay que materializar sus borradores en tareas (modo flujo de idea a tarea).

## Cuándo no usar

- Para acciones triviales que no necesitan seguimiento.
- Cuando el usuario pide explícitamente no crear tarea.
- Para crear borradores de una propuesta: eso corresponde a `refinar-propuesta`, tercera capacidad del flujo de idea a tarea.

## Entrada

- **Modo independiente:** la solicitud del usuario, que puede describir una o varias tareas, articulada con objetivo, resultado esperado y al menos un criterio de calidad. Si la entrada es una solicitud sin articular, se descompone en tareas antes de crear.
- **Modo flujo de idea a tarea:** una propuesta en estado `pendiente-de-revision` cuya aprobación el usuario ya comunicó, con sus borradores.
- El índice de tareas del proyecto.
- `assets/task.md` como plantilla de tarea definitiva.

## Salida

- Uno o varios archivos de tarea en el directorio de tareas de la convención (`convencion dir_tareas` de `consultar-artefactos`) siguiendo la plantilla, con estado inicial `pendiente` y la sección de revisión con los marcadores sin rellenar.
- Entradas correspondientes añadidas al índice, bajo la agrupación correspondiente cuando la tienen y como tareas sueltas en caso contrario.
- En modo flujo de idea a tarea, además: la propuesta en estado `aprobada` con su índice de borradores actualizado a las tareas definitivas y su línea retirada del índice. Las entradas de las tareas quedan sueltas; la agrupación del conjunto la produce el orquestador del flujo invocando `planificar`.

## Principios rectores

1. **Núcleo común:** ambos modos producen lo mismo —archivos de tarea y líneas en el índice—. La diferencia está solo en la entrada; la estructura del skill se organiza alrededor del núcleo, no de los modos.
2. **El modo independiente es autónomo:** sigue operando por sí solo, sin depender del flujo de idea a tarea.
3. **Promoción sin reescritura:** en modo flujo de idea a tarea, el borrador ya tiene los campos de la plantilla de tarea; la promoción lo mueve y le añade las secciones de estado y de revisión, no lo reformula.
4. **Validación antes de crear:** en modo independiente, la descomposición se presenta al usuario antes de generar archivos; en modo flujo de idea a tarea, la validación ya ocurrió en la puerta de aprobación de la propuesta.

## Procedimiento

### 1. Determinar el modo

1. **Leer la entrada.** Si es una solicitud articulada del usuario o una tarea descubierta durante la ejecución, continuar en modo independiente. Si es una propuesta aprobada (en estado `pendiente-de-revision` y la aprobación comunicada por el usuario), continuar en modo flujo de idea a tarea.

### 2a. Modo independiente

2. **Descomponer la solicitud** del usuario en tareas. Cada tarea debe tener: título breve, tipo (para el enrutado de `ejecutar-tareas`; la lista es abierta y extensible), objetivo conciso, dependencias si las hay, resultado esperado y criterios de calidad verificables.
3. **Presentar al usuario** un resumen de las tareas propuestas antes de generar los archivos: para cada tarea, título, tipo, objetivo y dependencias. Si el usuario solicita cambios, ajustar y repetir. Si rechaza la propuesta, no crear archivos y terminar.
4. **Crear cada tarea** siguiendo el núcleo común.

### 2b. Modo flujo de idea a tarea

5. **Verificar la propuesta:** estado `pendiente-de-revision`, aprobación del usuario comunicada y borradores presentes. Si alguna condición falla, detenerse e informar al usuario sin modificar archivos. Si todo es correcto, registrar la decisión en la sección de revisión de la propuesta con la acción «registrar el veredicto» de `actualizar-artefactos`.
6. **Revisar cada borrador en orden de numeración.** Por cada borrador, aplicar revisión de redacción y pulido mecánico en modo preventivo. Si el arnés lo permite, invocar `revisar-redaccion` y, con su salida, `pulir-escritura`; de lo contrario, realizar el equivalente manualmente.
7. **Promocionar los borradores** con la acción «promover los borradores de la propuesta `<dir>`» de `actualizar-artefactos`: mueve cada borrador al directorio de tareas con numeración continua de la serie, inyecta las secciones de estado y de revisión, renumera las dependencias entre borradores y actualiza el índice de la propuesta. Devuelve la correspondencia borrador→tarea→ruta por borrador; una referencia no resoluble aborta la promoción sin escribir.
8. **Cerrar el ciclo de la propuesta:** cambiar su estado a `aprobada` y retirarla del índice, con las acciones de `actualizar-artefactos`.

### 3. Núcleo común

En modo flujo de idea a tarea, la promoción del paso 7 ya realizó el equivalente de los pasos 9 y 10; continuar en el paso 11, que registra las entradas como tareas sueltas a la espera de que el orquestador del flujo las agrupe invocando `planificar`.

9. **Determinar el siguiente número de tarea** con la consulta «el siguiente número de la serie» de `consultar-artefactos` sobre el directorio de tareas de la convención —si el índice referenciara un número mayor, manda el índice—. Si el índice no existe, crearlo con la acción «inicializar el índice» de `actualizar-artefactos` antes de continuar.
10. **Crear cada archivo de tarea** en el directorio de tareas usando `assets/task.md` —la plantilla usa los nombres convencionales configurables—, con estado inicial `pendiente` y la sección de revisión con los marcadores de la plantilla sin rellenar.
11. **Dar de alta las tareas en el índice** con la acción «dar de alta la tarea `<ref>` «`<título>`» bajo `<agrupación>`» de `actualizar-artefactos` —el gestor compone la línea con el formato configurado; la referencia de cada tarea es su archivo, numerado con la serie y un slug en kebab-case del título—. El destino es la agrupación correspondiente si la tarea pertenece a trabajo planificado —épica o encabezado ligero—, o la agrupación de tareas sueltas si no tiene agrupación propia —la operación la crea si falta—. Si el destino no está claro, inferirlo del contexto de la solicitud o la propuesta y, si aun así hay duda, preguntar al usuario.
12. **Informar al usuario** de las tareas creadas. En modo flujo de idea a tarea, indicar que las entradas quedaron como tareas sueltas a la espera de la agrupación: si el skill no fue invocado por el orquestador del flujo, ofrecer invocar `planificar` en modo promoción para cerrar la planeación del conjunto.

## Finalización

El skill ha terminado cuando:

- Los archivos de tarea están creados en el directorio de tareas con sus entradas en el índice.
- En modo independiente, el usuario aprobó la descomposición antes de la creación.
- En modo flujo de idea a tarea, la propuesta quedó en estado `aprobada`, con su índice apuntando a las tareas definitivas y su línea retirada del índice.

## Referencias

- `assets/task.md` — Plantilla de tarea definitiva; reproduce los nombres convencionales configurables. Leer antes de crear archivos de tarea.
