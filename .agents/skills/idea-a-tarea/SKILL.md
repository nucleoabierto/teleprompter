---
name: idea-a-tarea
description: >
  Orquesta el flujo de idea a tarea de principio a fin: retoma las
  propuestas pendientes de revisión del índice de tareas o las ideas
  persistidas sin procesar o, si no las hay,
  coordina el descubrimiento del problema, la propuesta de forma de
  solución y el refinamiento con borradores, gestiona la decisión
  del usuario (aprobación, cambios o rechazo) y cierra la planeación
  agrupando el conjunto en su épica.
  Usar cuando el usuario traiga una idea suelta, cuando se quiera
  procesar una propuesta pendiente o una idea persistida, o al
  iniciar una sesión para retomar el flujo.
  Sinónimos: orquestar flujo de idea a tarea, procesar idea, retomar
  propuesta, revisar propuesta, procesar idea persistida, flujo de
  idea a tarea.
---

# Idea a tarea

Instrucciones para que un agente orqueste el flujo de idea a tarea: coordina las capacidades `descubrir-problema`, `proponer-forma-solucion` y `refinar-propuesta` en orden, retoma las propuestas pendientes del índice de tareas y las ideas persistidas sin procesar, gestiona la decisión del usuario sobre cada propuesta y cierra la planeación invocando `planificar` tras la promoción de los borradores. Es análogo a `ejecutar-tareas`, pero para el flujo de idea a tarea.

## Cuándo usar

- Cuando el usuario traiga una idea suelta que quiera llevar a tareas.
- Cuando haya propuestas pendientes de revisión en el índice de tareas y el usuario quiera retomar su revisión.
- Cuando haya ideas persistidas sin procesar en el proyecto evaluado —escritas por `lluvia-de-ideas`— y el usuario quiera llevar una al flujo.
- Al iniciar una sesión, si el usuario pide continuar el flujo de idea a tarea.

## Cuándo no usar

- Cuando la solicitud ya viene articulada con objetivo y criterios claros: usar `crear-tareas` en modo independiente.
- Para ejecutar tareas pendientes del índice: eso corresponde a `ejecutar-tareas`.
- Para ejecutar una sola capacidad aislada del flujo (por ejemplo, solo formular un problema sin continuar): invocar esa capacidad directamente.

## Entrada

- El índice de tareas del proyecto evaluado, si existe.
- Las ideas persistidas por `lluvia-de-ideas` en el directorio de ideas de la convención, si las hay.
- Una idea suelta del usuario o un archivo de idea persistida, si no hay propuestas pendientes.
- Las capacidades del flujo: `descubrir-problema`, `proponer-forma-solucion`, `refinar-propuesta`, `crear-tareas` en modo flujo de idea a tarea y `planificar` en modo promoción.

## Salida

- Propuestas procesadas: aprobadas (materializadas en tareas definitivas por `crear-tareas` y agrupadas en su épica o encabezado ligero por `planificar`), devueltas a borrador con cambios o descartadas.
- O una propuesta nueva enviada a revisión, si la idea suelta completó el flujo.
- O la conclusión de que la idea se descartó en una capacidad temprana, comunicada al usuario.

## Principios rectores

1. **Propuestas pendientes primero:** antes de aceptar una idea nueva, se consultan las propuestas en revisión del índice. Una propuesta sin resolver bloquea el inicio de un flujo nuevo: el usuario decide sobre ella antes de seguir.
2. **Las capacidades no se saltan:** el flujo es descubrimiento del problema → propuesta de forma de solución → refinamiento con borradores. Cada capacidad valida con el usuario antes de entregar su salida a la siguiente.
3. **El agente transporta, no resume:** la salida de cada capacidad pasa completa a la siguiente. El orquestador no reformula el problema ni la forma de solución por su cuenta.
4. **La puerta asíncrona se respeta:** cuando `refinar-propuesta` envía la propuesta a revisión, el agente se detiene. La decisión del usuario puede llegar en otra sesión; por eso la primera acción del skill es siempre consultar las propuestas en revisión del índice.
5. **La decisión queda registrada:** la aprobación, los cambios o el rechazo se anotan en la sección de revisión de la propuesta y se reflejan en el índice de tareas. El directorio de la propuesta se conserva siempre, incluso descartada.

## Procedimiento

### 1. Revisar propuestas pendientes

1. **Consultar el índice de tareas** del proyecto evaluado con la consulta «las propuestas en revisión» de `consultar-artefactos`.
2. **Si hay varias,** procesarlas de una en una, en el orden en que figuran.
3. **Por cada propuesta pendiente,** leer el documento de la propuesta y sus borradores, y presentar el resumen al usuario para que decida: aprobar, solicitar cambios o rechazar.
4. **Si el usuario aprueba:** comunicar la aprobación e invocar `crear-tareas` en modo flujo de idea a tarea, que registra la decisión en la sección de revisión de la propuesta al verificarla, promueve los borradores a tareas definitivas y registra sus entradas en el índice. A continuación, invocar `planificar` en modo promoción con la propuesta y las tareas recién creadas: asigna el conjunto a una épica nueva o existente —o a un encabezado ligero si el conjunto no amerita épica— y coloca las entradas bajo la agrupación resultante. La épica es el último artefacto de la planeación: con ella el flujo queda cerrado. Si el usuario rechaza el borrador de épica, las tareas quedan sueltas, sin agrupar: informar de ello y considerar la propuesta procesada.
5. **Si el usuario solicita cambios:** retirar la propuesta del índice con la acción «retirar `<ref>` del índice» de `actualizar-artefactos`, registrar el veredicto del usuario —solicita cambios— con «registrar el veredicto», aplicar los cambios a la propuesta y sus borradores, devolverla al estado `borrador` con «cambiar el estado de `<ref>` a `<estado>`» y reenviarla a revisión siguiendo la sección 3 de `refinar-propuesta` (de nuevo pendiente de revisión y dada de alta en el índice).
6. **Si el usuario rechaza:** retirar la propuesta del índice, cambiar su estado a `descartada` y registrar el veredicto del usuario —rechaza—, con las acciones de `actualizar-artefactos`. El directorio se conserva para trazabilidad.
7. **Si no hay propuestas pendientes,** consultar «las ideas sin procesar» del proyecto evaluado con `consultar-artefactos`, que las devuelve con el «Requiere» de cada cabecera para decidir el orden de procesamiento: una idea cuyo requisito sigue sin procesar se presenta después. Si las hay, presentar al usuario la siguiente y preguntar si quiere procesarla; su «Problema» y «Qué desbloquea» son la entrada de `descubrir-problema` en la sección 2. Si el usuario no quiere procesar ninguna y no trae una idea nueva, informar y terminar.

### 2. Coordinar el flujo con una idea nueva

8. **Invocar `descubrir-problema`** con la idea suelta o con el contenido del archivo de idea elegido. Si la idea se descarta en esta capacidad, comunicar la conclusión y terminar.
9. **Invocar `proponer-forma-solucion`** con el problema y la oportunidad validados. Si la categoría resulta fuera de alcance o el usuario decide no continuar, comunicar la conclusión y terminar.
10. **Invocar `refinar-propuesta`** con el material validado: problema, oportunidad, forma de solución, alternativas y fuera de alcance. El skill crea la propuesta y sus borradores y la envía a revisión.
11. **Si la idea venía de una idea persistida,** marcarla procesada con la acción «marcar la idea `<ref>` procesada en `<destino>`» de `actualizar-artefactos`, pasando la referencia de la propuesta creada, para que no vuelva a presentarse como pendiente.
12. **Detenerse.** La propuesta queda pendiente de revisión en el índice a la espera de la decisión del usuario, que se procesará en el paso 1 de una invocación posterior de este skill.

## Formato de salida

No hay un formato de salida fijo. El resultado del flujo es el estado de las propuestas, las tareas definitivas materializadas y las líneas actualizadas del índice de tareas.

## Finalización

El skill ha terminado cuando:

- No quedan propuestas en revisión sin procesar en el índice: cada una fue aprobada, promocionada y agrupada bajo su épica o encabezado (o con sus tareas sueltas si se rechazó el borrador de épica), devuelta a revisión con cambios o marcada como `descartada`.
- Si el usuario trajo una idea nueva, esta recorrió las tres capacidades del flujo y terminó en propuesta enviada a revisión, o se descartó en una capacidad temprana con la conclusión comunicada.

## Referencias

- `docs/decisions/D013-mecanismo-borradores-reflejo-todo.md` — Ciclo de vida de la propuesta y su marcador en el índice de tareas.
- `docs/decisions/D015-extension-de-d001-para-indice-de-propuestas.md` — El índice como índice de tareas y de propuestas en revisión.
