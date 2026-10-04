---
name: planear-tarea
description: >
  Ejecuta la mitad de planeación del flujo de desarrollo de una tarea:
  recopila el contexto, evalúa la conectividad con el codebase y
  produce el plan técnico con su suite de pruebas esperada, deteniéndose
  con las secciones aprobadas en el archivo de la tarea. Usar para
  planear una tarea de desarrollo sin ejecutarla —planeación en
  paralelo o incremental— o como entrada del pipeline cuando la tarea
  aún no tiene plan aprobado.
  Sinónimos: planear tarea, planeación de tarea, plan de desarrollo,
  preparar tarea, flujo de planeación.
---

# Planear tarea

Instrucciones para que un agente ejecute la mitad de planeación del flujo de desarrollo dentro de una tarea: recopila el contexto, evalúa la conectividad con el codebase y produce el plan técnico con su suite de pruebas esperada, aprobados por el usuario y registrados en el archivo de la tarea. Se detiene ahí: la ejecución corresponde a `desarrollar-tarea`, que puede ocurrir en la misma iteración o en otra sesión.

## Cuándo usar

- Cuando una tarea de tipo `desarrollo` o `mantenimiento (refactoring)` no tiene `## Plan técnico` y `## Suite de pruebas esperada` aprobados: en el ciclo, `ejecutar-tareas` la enruta aquí.
- Cuando el usuario pida planear una tarea concreta sin ejecutarla —planeación en paralelo de varias tareas o planeación incremental encadenada.
- Cuando una tarea planeada quedó interrumpida y hay que completar las secciones que falten.

## Cuándo no usar

- Para tareas de otro tipo o sin tipo declarado: no pasan por el pipeline de desarrollo.
- Cuando la tarea ya tiene plan y suite aprobados: no se replanifica; corresponde `desarrollar-tarea`.
- Para ejecutar el plan: eso es `desarrollar-tarea`.

## Entrada

- El archivo de la tarea (`docs/tasks/NNN-slug.md`), marcada en progreso por el ejecutor general.
- El plan técnico de la épica que agrupa la tarea, si existe, como guía de arquitectura.
- Los planes aprobados de las tareas de las que esta depende, si las hay —aunque aún no se hayan ejecutado— como base de la planeación.
- Las capacidades internas: `recopilar-contexto`, `evaluar-conectividad` y `planear-implementacion`.

## Salida

- El archivo de la tarea con `## Contexto`, `## Conectividad`, `## Plan técnico` y `## Suite de pruebas esperada` completos y aprobados, listo para `desarrollar-tarea`.
- O la conclusión de que la tarea no puede planearse —desconectada, plan rechazado—, comunicada al invocador.

## Principios rectores

1. **El archivo de la tarea es la fuente de verdad del avance:** cada sección registrada es un estado resumible; una sesión nueva continúa desde las secciones presentes, no de memoria.
2. **Planeación incremental:** una dependencia con plan aprobado pero sin ejecutar se toma como base sólida —el plan describe el mundo en que esta tarea aterrizará—, no como bloqueo; una dependencia sin plan sí bloquea y se comunica.
3. **Las puertas humanas se respetan:** la aprobación del plan pertenece al usuario.
4. **No replanificar:** si las secciones ya existen aprobadas, el skill no produce nada y termina.

## Procedimiento

1. **Leer el archivo de la tarea** y comprobar el estado de planeación con la operación `planeacion` de `consultar-artefactos`: si ya contiene `## Plan técnico` y `## Suite de pruebas esperada` aprobados, informar de que la tarea ya está planeada y terminar sin tocar nada.
2. **Revisar las dependencias declaradas** —la operación `dependencias` de `consultar-artefactos` las devuelve—. Para cada tarea bloqueante: si está ejecutada, nada que hacer; si tiene plan aprobado sin ejecutar, leer su `## Plan técnico` y tratarlo como base asumida —el contexto y la conectividad de esta tarea se recopilan sobre el mundo que ese plan describe—; si no tiene plan aprobado, la dependencia bloquea la planeación: informar al invocador y terminar.
3. **Invocar `recopilar-contexto`** con el archivo de la tarea —y los planes base de las dependencias, si los hay—, que registra `## Contexto`.
4. **Invocar `evaluar-conectividad`**, que registra `## Conectividad`. Si el veredicto es `desconectada`, dar de alta la tarea puente con `crear-tareas`, declararla como dependencia en la tarea actual —`tarea.sh añadir-linea` de `actualizar-artefactos` sobre la sección `## Dependencias`— e informar al invocador —que la marcará `[!]` en `TODO.txt`— sin llegar a planear.
5. **Invocar `planear-implementacion`**, que produce `## Plan técnico` y `## Suite de pruebas esperada` y los somete a la puerta humana. Si el usuario rechaza el plan, informar al invocador y terminar.
6. **Informar al invocador** de que la tarea quedó planeada: secciones aprobadas registradas, lista para `desarrollar-tarea` en esta iteración o en otra sesión.

## Finalización

El skill ha terminado cuando:

- La tarea tiene contexto, conectividad, plan y suite aprobados en su archivo, o
- Se informó de que no puede planearse —ya planeada, dependencia sin plan, desconectada o plan rechazado— con el motivo.

## Referencias

- `.agents/skills/desarrollar-tarea/SKILL.md` — La mitad de ejecución del flujo.
- `docs/decisions/D031-flujo-desarrollo-dividido-en-planear-y-ejecutar.md` — La división del flujo que este skill materializa.
