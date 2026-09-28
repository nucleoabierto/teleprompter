---
name: desarrollar-tarea
description: >
  Ejecuta la mitad de ejecución del flujo de desarrollo de una tarea:
  toma una tarea con plan técnico y suite de pruebas esperada ya
  aprobados en su archivo y completa la implementación siguiendo el
  plan, con su registro de desviaciones. Usar cuando la tarea ya está
  planeada —en esta sesión o en una anterior— y hay que desarrollarla.
  Sinónimos: desarrollar tarea, ejecutar tarea de desarrollo,
  implementar tarea, flujo de ejecución.
---

# Desarrollar tarea

Instrucciones para que un agente ejecute la mitad de ejecución del flujo de desarrollo dentro de una tarea: toma una tarea cuyo `## Plan técnico` y `## Suite de pruebas esperada` están aprobados en su archivo —planeada en esta sesión o en otra—, invoca `ejecutar-implementacion` y devuelve el diff con el registro de desviaciones al invocador.

## Cuándo usar

- Cuando una tarea de tipo `desarrollo` o `mantenimiento (refactoring)` ya tiene plan y suite aprobados: en el ciclo, `ejecutar-tareas` la enruta aquí, o la invocación sigue a la de `planear-tarea` en la misma iteración.
- Cuando el usuario pida ejecutar el desarrollo de una tarea ya planeada.

## Cuándo no usar

- Cuando la tarea no tiene `## Plan técnico` y `## Suite de pruebas esperada` aprobados en su archivo: corresponde primero `planear-tarea`.
- Para tareas de otro tipo o sin tipo declarado: no pasan por el pipeline de desarrollo.
- Para revisar la implementación: eso es `revisar-implementacion`, invocado por el ejecutor en su paso de revisión.

## Entrada

- El archivo de la tarea (`docs/tasks/NNN-slug.md`) con `## Plan técnico` y `## Suite de pruebas esperada` aprobados —la planeación es un estado registrado, no un recuerdo de sesión.
- El plan técnico de la épica que agrupa la tarea, si existe, como guía de arquitectura vigente.
- La capacidad interna: `ejecutar-implementacion`.

## Salida

- El diff de los cambios que implementan la tarea, devuelto al invocador.
- El `## Plan técnico` del archivo de la tarea con las acciones marcadas y, si las hubo, la sección `## Desviaciones del plan`.
- O la conclusión de que la tarea no puede ejecutarse —sin plan aprobado, desviación mayor no confirmada—, comunicada al invocador.

## Principios rectores

1. **La entrada se valida, no se presume:** el plan aprobado es el contrato; una tarea sin él no se ejecuta, se deriva a `planear-tarea`.
2. **Las puertas humanas se respetan:** la confirmación de desviaciones mayores pertenece al usuario.
3. **Acotado a una tarea:** no gestiona estado de la tarea en `TODO.txt`, ni revisión dual, ni commit; eso sigue siendo del ejecutor general.

## Procedimiento

1. **Leer el archivo de la tarea** y validar la entrada: `## Plan técnico` y `## Suite de pruebas esperada` presentes y aprobados. Si falta alguna, informar al invocador de que la tarea requiere `planear-tarea` primero y terminar sin ejecutar.
2. **Invocar `ejecutar-implementacion`** con el archivo de la tarea: implementa el plan, marca la checklist, cubre la suite esperada y registra las desviaciones; escala al usuario las que cambian objetivo, alcance o guía de la épica. Si el usuario no confirma una desviación mayor, informar al invocador y terminar.
3. **Devolver el control al invocador** informando del diff producido y de las desviaciones registradas.

## Finalización

El skill ha terminado cuando:

- La ejecución terminó con su diff y su registro de desviaciones, o
- Se informó de que la tarea no puede ejecutarse, con el motivo.

## Referencias

- `.agents/skills/planear-tarea/SKILL.md` — La mitad de planeación del flujo.
- `docs/decisions/D031-flujo-desarrollo-dividido-en-planear-y-ejecutar.md` — La división del flujo que este skill materializa.
