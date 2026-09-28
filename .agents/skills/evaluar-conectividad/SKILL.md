---
name: evaluar-conectividad
description: >
  Evalúa si lo que una tarea de desarrollo asume está conectado
  con el codebase real y produce un veredicto —conectada,
  parcialmente conectada o desconectada— registrado en el archivo
  de la tarea, para que la falta de infraestructura se detecte
  antes de planear.
  Usar en el sub-flujo de desarrollo tras la recopilación de
  contexto y antes de la planeación, o cuando el usuario pida
  evaluar la conectividad de una tarea concreta.
  Sinónimos: evaluar conectividad, gate de conectividad,
  conectividad técnica, veredicto de conectividad.
---

# Evaluar conectividad

Instrucciones para que un agente contraste lo que una tarea de desarrollo asume contra el codebase real y registre un veredicto de conectividad en el archivo de la tarea. La evaluación lee el contexto ya recopilado; no planea ni implementa.

## Cuándo usar

- En el sub-flujo de desarrollo, tras `recopilar-contexto` y antes de `planear-implementacion`, invocado por `planear-tarea`.
- Cuando el usuario pida evaluar la conectividad de una tarea concreta.

## Cuándo no usar

- Antes de recopilar el contexto: el gate se apoya en la sección `## Contexto` de la tarea, no en una exploración propia.
- Para decidir si la tarea está bien formulada o priorizada: eso corresponde al ciclo de tareas y a la revisión del usuario.
- Para tareas que no modifican código: la conectividad técnica evalúa supuestos sobre el codebase.

## Entrada

- El archivo de la tarea (`docs/tasks/NNN-slug.md`) con su objetivo, entrada, resultado esperado y la sección `## Contexto` recopilada por `recopilar-contexto`.
- El codebase del subsistema afectado, ya identificado en el contexto.

## Salida

- Una sección `## Conectividad` agregada al archivo de la tarea, antes de la sección Revisión, con el veredicto (`conectada`, `parcialmente conectada` o `desconectada`) y su justificación breve; si aplica, qué falta y qué tarea puente la desbloquea.
- El veredicto comunicado al invocador, que decide si el sub-flujo continúa o se detiene.

## Principios rectores

1. **Contrastar, no asumir:** el veredicto nace de comparar lo que la tarea necesita con lo que el codebase tiene; una necesidad sin soporte detectado no se presume cubierta.
2. **Sin reexplorar:** la evaluación parte del contexto recopilado; solo abre un archivo adicional cuando el contexto deja una duda concreta sobre la existencia de lo que la tarea asume.
3. **Tres veredictos, un registro:** el resultado es un veredicto con justificación breve en el archivo de la tarea, no un informe paralelo.
4. **Bloquear es un resultado válido:** declarar la tarea desconectada a tiempo es mejor que planear sobre infraestructura inexistente; el bloqueo no es un fracaso del gate sino su propósito.

## Procedimiento

1. **Leer el archivo de la tarea** y su sección `## Contexto` para fijar qué asume la tarea: archivos, módulos, interfaces o patrones que el objetivo presupone.
2. **Contrastar cada supuesto con el codebase:** para cada elemento que la tarea necesita, verificar que existe y tiene la forma que la tarea espera, usando los archivos ya identificados en el contexto.
3. **Emitir el veredicto:**
   - `Conectada`: todo lo que la tarea asume existe en el codebase; el sub-flujo puede continuar a la planeación.
   - `Parcialmente conectada`: falta algo. Si lo que falta es absorbible por la propia tarea —un elemento pequeño que la implementación puede crear dentro de su alcance—, se declara en la justificación y el sub-flujo continúa. Si no lo es, el veredicto registrado es `desconectada`.
   - `Desconectada`: la tarea depende de capacidad base que no existe y no es absorbible; el sub-flujo no debe planear.
4. **Registrar la sección `## Conectividad`** en el archivo de la tarea: el veredicto, la justificación breve y, en los veredictos parcial o desconectado, qué falta.
5. **Si el veredicto es desconectada**, identificar la capacidad base faltante y devolver al invocador la descripción de la tarea puente que la cubriría; el invocador la da de alta con `crear-tareas` y declara la dependencia en la tarea actual.
6. **Informar al invocador** del veredicto y, cuando aplique, de la tarea puente necesaria.

## Finalización

El skill ha terminado cuando:

- El archivo de la tarea contiene la sección `## Conectividad` con el veredicto y su justificación.
- En veredicto desconectada, la tarea puente quedó descrita para que el invocador la registre.
