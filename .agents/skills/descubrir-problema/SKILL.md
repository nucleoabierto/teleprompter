---
name: descubrir-problema
description: >
  Transforma una idea suelta en un problema formulado con su oportunidad
  de mejora, sin proponer solución, mediante un diálogo interactivo con
  el usuario. Primera capacidad del flujo de idea a tarea.
  Usar cuando se tenga una idea suelta que necesite enmarcarse como
  problema antes de pensar en soluciones, o como primera capacidad del
  flujo de idea a tarea.
  Sinónimos: descubrir problema, formular problema, enmarcar problema,
  definir el problema, fase de descubrimiento.
---

# Descubrir el problema

Instrucciones para que un agente transforme una idea suelta en un problema formulado con su oportunidad de mejora, sin proponer solución. Es la primera capacidad del flujo de idea a tarea: su salida alimenta la capacidad de propuesta de forma de solución.

## Cuándo usar

- Cuando el usuario traiga una idea suelta que aún no está formulada como problema.
- Cuando durante la ejecución de otra tarea se descubra una idea que merece pasar por el flujo de idea a tarea.
- Como primera capacidad del flujo de idea a tarea, invocada por el orquestador del flujo.

## Cuándo no usar

- Cuando el usuario traiga una solicitud ya articulada con objetivo y criterios claros: usar `crear-tareas` en modo independiente.
- Para proponer la forma de la solución: esa es la capacidad siguiente del flujo, que toma la salida de este skill.
- Para investigar un tema con evidencia externa: usar `investigar`. El descubrimiento del problema dialoga con el usuario; si se detecta necesidad de evidencia externa, se registra como investigación de apoyo pendiente, no se ejecuta aquí.

## Entrada

- Una idea suelta del usuario o descubierta durante la ejecución de otra tarea.
- El contexto del proyecto necesario para dialogar con conocimiento: visión del proyecto, sistema de tareas y documentación relevante.

## Salida

- Un enunciado del problema: de dos a tres párrafos, libre de lenguaje de solución.
- Una oportunidad de mejora: por qué vale la pena resolverlo, qué beneficio aporta y qué alternativas existentes supera.
- La salida se presenta al usuario en la conversación; no se crea ningún archivo en esta capacidad. El material pasa a la capacidad siguiente del flujo.

## Principios rectores

1. **Problema sin solución:** el enunciado describe qué ocurre hoy, a quién afecta y qué cuesta, sin mencionar cómo se resolvería. Si la idea llega formulada como solución («añadir un botón que…»), el diálogo la deshace hasta el problema subyacente.
2. **Diálogo antes que formulario:** el descubrimiento es una conversación interactiva, no una plantilla que el agente rellena en solitario. El agente pregunta, escucha y reformula.
3. **Escepticismo constructivo:** el agente evalúa si el problema es real y si las alternativas existentes ya lo resuelven. Si no lo son, lo dice: es mejor descartar una idea en esta capacidad que arrastrarla hasta tareas.
4. **Validación explícita:** la capacidad no termina hasta que el usuario confirma que el problema está correctamente enmarcado. El agente no decide solo.
5. **Salida mínima:** se produce solo problema + oportunidad. La forma de solución, las alternativas descartadas y los borradores pertenecen a las capacidades siguientes.

## Procedimiento

### 1. Explorar la idea

1. **Escuchar la idea** tal como la trae el usuario o el contexto donde se descubrió.
2. **Dialogar para identificar el problema.** Preguntar qué situación actual motiva la idea, a quién afecta, con qué frecuencia ocurre y qué consecuencias tiene no resolverla. Ver `references/guia-dialogo.md` para preguntas guía y señales de que el problema aún no está identificado.
3. **Deshacer el lenguaje de solución** si la idea llega formulada como solución. Preguntar qué haría posible o qué dejaría de ocurrir si eso existiera, hasta llegar al problema subyacente.

### 2. Evaluar el problema

4. **Comprobar que el problema es real.** Verificar con el usuario que la situación descrita existe y no es una suposición. Si el agente duda de que sea real, lo plantea explícitamente.
5. **Explorar las alternativas existentes.** Preguntar cómo se resuelve hoy ese problema: procesos manuales, herramientas, convenciones o la propia tolerancia al problema. Un problema que ya tiene una alternativa suficiente puede no merecer el esfuerzo.
6. **Valorar el beneficio.** Estimar con el usuario qué mejora aportaría resolverlo: tiempo ahorrado, errores evitados, capacidad nueva. Si el beneficio es marginal, decirlo.

### 3. Formular

7. **Redactar el problema** en dos o tres párrafos: situación actual, a quién afecta y qué cuesta o impide. Verificar contra `references/guia-dialogo.md` que no contiene lenguaje de solución.
8. **Redactar la oportunidad** en un párrafo: por qué vale la pena resolverlo, qué beneficio aporta y qué alternativas existentes supera.
9. **Revisar la redacción y pulir mecánicamente** el borrador. Si el arnés lo permite, invocar `revisar-redaccion` en modo preventivo y, con su salida, `pulir-escritura` en modo preventivo; de lo contrario, realizar el equivalente manualmente.

### 4. Validar con el usuario

10. **Presentar el problema y la oportunidad** al usuario y preguntar si el enmarcado es correcto. Si el arnés no permite el diálogo interactivo, presentar el enunciado con las suposiciones declaradas explícitamente, para que el usuario las corrija cuando pueda.
11. **Si el usuario pide cambios,** ajustar y repetir desde el paso correspondiente.
12. **Si el usuario aprueba,** entregar la salida (problema + oportunidad) a quien invocó el skill: el usuario, para continuar con la capacidad de propuesta de forma de solución, o el orquestador del flujo de idea a tarea.
13. **Si el usuario descarta la idea** —o si la evaluación muestra que el problema no es real o ya está resuelto y el usuario acepta esa conclusión—, terminar sin salida.

## Formato de salida

```markdown
## Problema

[De dos a tres párrafos. Situación actual, a quién afecta, qué cuesta o
impide. Sin lenguaje de solución.]

## Oportunidad

[Un párrafo. Por qué vale la pena resolverlo, qué beneficio aporta y qué
alternativas existentes supera.]
```

## Finalización

El skill ha terminado cuando ocurre una de estas dos cosas:

- El usuario ha validado el enunciado del problema y la oportunidad, y la salida se ha entregado a la capacidad siguiente del flujo.
- La idea se ha descartado —porque el problema no es real, ya está resuelto por las alternativas existentes o el usuario decide no continuar— y se ha comunicado la conclusión.

## Referencias

- `references/guia-dialogo.md` — Preguntas guía para el diálogo, señales de que el problema aún no está identificado y lista de verificación de lenguaje de solución. Leer antes de iniciar el diálogo y al redactar el enunciado.
