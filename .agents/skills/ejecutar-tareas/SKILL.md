---
name: ejecutar-tareas
description: >
  Ejecuta el ciclo de tareas del proyecto: lee TODO.txt, toma la próxima
  tarea pendiente, la ejecuta siguiendo su archivo de tarea, la somete
  a revisión dual (subagente independiente + usuario) y commitea.
  Repite hasta que no quedan tareas pendientes.
  Usar cuando se pida ejecutar tareas, continuar con el trabajo, retomar
  el ciclo, avanzar tareas o procesar TODO.txt.
  Sinónimos: ejecutar tarea, correr tareas, avanzar tareas, siguiente
  tarea, procesar TODO, retomar trabajo, ciclo de tareas.
---

# Ejecutar tareas

Ejecuta iterativamente el ciclo de tareas del proyecto: lee el índice, toma la próxima tarea pendiente, la ejecuta, la somete a revisión dual (subagente independiente + usuario) y commitea, hasta que no quedan tareas pendientes.

## Cuándo usar

- Cuando se pida ejecutar, avanzar o continuar con las tareas del proyecto.
- Cuando se quiera procesar `TODO.txt` y ejecutar la próxima tarea pendiente.
- Al iniciar una sesión de trabajo para retomar el ciclo donde se dejó.

## Cuándo no usar

- Cuando se pida crear tareas nuevas: usar el skill `crear-tareas`.
- Cuando se pida commitear sin haber ejecutado una tarea: usar el skill `commit`.
- Cuando no haya tareas pendientes y el usuario no haya solicitado continuar el ciclo.

## Entrada

- `TODO.txt` como índice de tareas del proyecto.
- Archivos de tarea en `docs/tasks/` referenciados desde `TODO.txt`.

## Salida

- Tareas pendientes ejecutadas, revisadas y marcadas como completadas en `TODO.txt` y en su archivo de tarea.
- Un commit por tarea completada.
- `TODO.txt` actualizado con los cambios de estado.
- El changelog del proyecto evaluado actualizado cuando alguna tarea completada produjo un cambio con impacto observable.

## Principios rectores

1. **Una tarea a la vez:** ejecuta una sola tarea pendiente por iteración del ciclo, de principio a fin, antes de tomar la siguiente.
2. **Seguir el archivo de tarea:** cada tarea define su objetivo, procedimiento y criterios de calidad; respétalos como contrato.
3. **Trazabilidad:** marca el estado en `TODO.txt` y en el campo «Estado» del archivo de tarea para que el progreso sea visible sin inspeccionar el repositorio.
4. **Commits atómicos:** un commit por tarea completada, antes de comenzar la siguiente, para que el historial refleje el avance real.
5. **No inventar tareas:** si descubres trabajo nuevo durante la ejecución, dalo de alta con `crear-tareas`; no lo ejecutes directamente.

## Procedimiento

1. **Leer `TODO.txt`** para obtener el índice de tareas. Cada línea tiene el formato `- [estado] docs/tasks/NNN-slug.md — título`, donde el estado es `[ ]` pendiente, `[~]` en progreso, `[r]` en revisión, `[x]` completada o `[!]` bloqueada. Las líneas `[p]` de la sección «Propuestas en revisión» no son tareas: son propuestas del flujo de idea a tarea que esperan la decisión del usuario; si hay alguna, informar al usuario y derivar su procesamiento a `idea-a-tarea` antes de tomar la próxima tarea pendiente, en lugar de ignorarlas.
2. **Identificar la próxima tarea pendiente** (`[ ]`) que no esté bloqueada. Si hay una tarea ya en progreso (`[~]`), retomarla en lugar de empezar una nueva.
3. **Si no hay tareas pendientes**, preguntar al usuario qué hacer y, si propone trabajo nuevo, usar el skill `crear-tareas` para darlo de alta. Terminar el ciclo.
4. **Marcar la tarea como en progreso** cambiando `[ ]` a `[~]` tanto en `TODO.txt` como en el campo «Estado» del archivo de tarea, antes de empezar a trabajar. Esto evita que otra sesión tome la misma tarea.
5. **Leer el archivo de tarea** referenciado y seguir su objetivo, procedimiento y criterios de calidad. Si el procedimiento sugiere validación con el usuario, pedir confirmación antes de continuar.
   - **Consultar las lecciones aplicables:** invocar el skill `consultar-lecciones` con una descripción de la tarea (archivos que tocará, comandos o palabras clave) para traer las notas correspondientes al contexto.
   - **Consultar la épica del conjunto:** si la tarea figura en `TODO.txt` bajo un encabezado con comentario `<!-- épica: docs/epics/NNN-slug.md -->`, leer ese documento: su plan técnico es la guía de arquitectura que la ejecución debe respetar. El plan detallado de la tarea se elabora al ejecutarla, dentro de esa guía.
   - **Enrutar por tipo:** con las consultas anteriores hechas, si la tarea declara un `Tipo` con especialista registrado en la sección «Enrutado por tipo», invocar ese skill para ejecutar la tarea. Si no declara tipo o el tipo no tiene especialista, ejecutarla directamente con el comportamiento general. El ejecutor no conoce las fases del dominio: solo lee el tipo y delega. La única excepción es el estado de planeación que el propio registro declare —hoy, las secciones de plan aprobado en el archivo de la tarea—, que el ejecutor consulta para elegir entre los puntos de entrada del tipo.
6. **Si durante la ejecución se descubren nuevas tareas**, usar el skill `crear-tareas` para darlas de alta. No ejecutarlas dentro de la iteración actual; se procesarán en iteraciones posteriores del ciclo.
7. **Si la tarea no se puede realizar porque depende de otra aún no completada**, marcarla como bloqueada `[!]` en `TODO.txt` y, debajo de esa línea, crear una sublista con las tareas bloqueantes. Pasar a la siguiente tarea pendiente no bloqueada.
8. **Al terminar la tarea**, marcarla como en revisión `[r]` en `TODO.txt` y en el campo «Estado» del archivo de tarea. No marcarla como completada todavía.
9. **Lanzar un subagente independiente para revisión técnica.** El subagente arranca con contexto aislado: recibe el archivo de tarea (objetivo y criterios de calidad) y la ubicación de los cambios —árbol de trabajo sin commitear o rango de commits— para reconstruir el diff por sí mismo, pero no el razonamiento del agente ejecutor. Su rol es adversarial: verificar cada criterio de calidad contra el diff, buscar problemas no previstos, y **cotejar el diff contra las lecciones aprendidas**: consulta `docs/lessons/README.md`, identifica las notas cuyos disparadores coincidan con los archivos y acciones del cambio, las lee y verifica que el diff no repite errores ya aprendidos —aunque el ejecutor las haya aplicado bien, la revisión confirma independientemente. Produce un informe con un veredicto: aprueba o solicita cambios. Si la tarea se enrutó al sub-flujo de desarrollo —tipo `desarrollo` o `mantenimiento (refactoring)`—, la revisión técnica se realiza invocando `revisar-implementacion` en lugar del subagente genérico.
10. **Si el subagente solicita cambios**, corregir los problemas detectados y repetir desde el paso 8.
11. **Si el subagente aprueba**, presentar el informe de revisión y un resumen del trabajo al usuario para aprobación final.
12. **Si el usuario solicita cambios**, corregir y repetir desde el paso 8.
13. **Si el usuario aprueba**, marcar la tarea como completada `[x]` en `TODO.txt` y en el campo «Estado» del archivo de tarea. Registrar la revisión en el campo «Revisión» del archivo de tarea con el formato: `Subagente: [fecha] — Aprueba` y `Usuario: [fecha] — Aprueba`.
14. **Si el usuario hizo correcciones durante la tarea**, invocar el skill `registrar-experiencias` para anotarlas en `EXPERIENCIAS.md` antes de commitear. Si no hubo correcciones, no se registra nada.
15. **Si la tarea se enrutó al sub-flujo de desarrollo** —tipo `desarrollo` o `mantenimiento (refactoring)`—, invocar el skill `documentar-dominio` con la ubicación de los cambios de la tarea —árbol de trabajo sin commitear—: evalúa si el cambio altera conceptos, invariantes o fronteras del dominio y actualiza `docs/domains/` solo si procede. En el mismo punto, invocar `documentar-producto` con la misma ubicación de los cambios: evalúa si el cambio altera funcionalidades, flujos o referencia de uso y actualiza el directorio de documentación de producto solo si procede. Si el diff introdujo una decisión estructural implícita que merece registro, invocar también `decisiones-diseno`. Si `documentar-dominio` reporta divergencia estructural, comunicar la recomendación de `revisar-arquitectura` al usuario; no ejecutarla dentro de la iteración.
16. **Invocar el skill `mantener-changelog` con la ubicación de los cambios de la tarea —árbol de trabajo sin commitear—, cualquiera que sea su tipo:** evalúa si el cambio tiene impacto observable para el consumidor del producto y, cuando lo tiene, registra la entrada en la sección de no liberados del changelog del proyecto evaluado —fusionándola con la de la agrupación de la tarea cuando existe—; en caso contrario emite «sin entrada». Es el mismo punto del cierre que los sensores de documentación del paso anterior, con la diferencia de que corre para todo tipo de tarea: cualquier tarea puede producir un cambio observable para el consumidor.
17. **Commitear la tarea completada** usando el skill `commit` antes de comenzar la siguiente. El commit debe registrar los cambios de la tarea y la actualización de estado en `TODO.txt`.
18. **Volver al paso 1** y repetir el ciclo hasta que no queden tareas pendientes no bloqueadas.
19. **Si no quedan tareas pendientes**, preguntar al usuario qué hacer y, si propone trabajo nuevo, usar el skill `crear-tareas`. Terminar el ciclo.

## Enrutado por tipo

Registro de tipos de tarea que tienen skill especialista. Añadir un tipo nuevo solo exige registrarlo aquí; el procedimiento del orquestador no cambia.

- `desarrollo` → dos flujos según el estado de planeación del archivo de la tarea: sin `## Plan técnico` y `## Suite de pruebas esperada` aprobados, skill `planear-tarea` —y si la planeación termina con plan aprobado, la misma iteración continúa con `desarrollar-tarea`; si el usuario rechaza el plan, la tarea no puede ejecutarse y se informa—; con ambas secciones aprobadas, skill `desarrollar-tarea` directamente.
- `mantenimiento (refactoring)` → mismo enrutado con estado que `desarrollo`. El tipo `mantenimiento` cubre el trabajo que preserva el sistema sin añadir capacidad observable y tiene dos perfiles: el perfil `refactoring` —transformaciones de código con comportamiento observable invariante, cuya aceptación exige misma API pública, misma suite en verde y mismo comportamiento— usa el sub-flujo de desarrollo porque su suite es la red que verifica la invariancia; `mantenimiento` a secas —trabajo de proceso sin comportamiento observable— sigue el comportamiento general y no figura en este registro.

## Formato de salida

No hay un formato de salida fijo. El resultado del ciclo es el estado actualizado de `TODO.txt`, los archivos de tarea y el historial de commits. Al terminar cada iteración, informar brevemente al usuario de la tarea completada y de la siguiente que se va a ejecutar.

## Finalización

El skill ha terminado cuando:

- No quedan tareas pendientes `[ ]`, en progreso `[~]` ni en revisión `[r]` en `TODO.txt`.
- Todas las tareas completadas tienen su commit correspondiente.
- Se ha informado al usuario del estado final.
