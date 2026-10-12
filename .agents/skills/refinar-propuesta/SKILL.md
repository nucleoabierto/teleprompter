---
name: refinar-propuesta
description: >
  Refina una forma de solución validada en borradores de tarea
  revisables y los envía a revisión asíncrona. Tercera capacidad del
  flujo de idea a tarea.
  Usar cuando se tengan validados el problema, la forma de solución,
  las alternativas y el fuera de alcance, para descomponerlos en
  borradores de tarea.
  Sinónimos: refinar propuesta, crear propuesta, borradores de tarea,
  refinamiento con borradores, enviar propuesta a revisión.
---

# Refinar la propuesta con borradores

Instrucciones para que un agente cree la propuesta en su directorio de la serie de propuestas con los borradores de las tareas y la envíe a revisión asíncrona. Es la tercera capacidad del flujo de idea a tarea: toma la salida de `proponer-forma-solucion` y produce la unidad de revisión que, una vez aprobada por el usuario, se materializará en tareas.

## Cuándo usar

- Cuando se tengan el problema, la oportunidad, la forma de solución, las alternativas y el fuera de alcance ya validados con el usuario.
- Como tercera capacidad del flujo de idea a tarea, invocada por el orquestador del flujo.

## Cuándo no usar

- Cuando el problema o la forma de solución aún no están validados: usar `descubrir-problema` o `proponer-forma-solucion` primero.
- Cuando la propuesta ya está aprobada y hay que materializar los borradores en tareas: usar `crear-tareas` en modo flujo de idea a tarea.
- Cuando la solicitud ya viene articulada como tareas y no necesita propuesta: usar `crear-tareas` en modo independiente.

## Entrada

- Problema + oportunidad (salida de `descubrir-problema`) y forma de solución + alternativas + fuera de alcance (salida de `proponer-forma-solucion`), validados por el usuario.
- El directorio de propuestas de la convención (`convencion dir_propuestas` de `consultar-artefactos`), para determinar el siguiente número de la serie.
- El índice de tareas, para dar de alta la propuesta en revisión al terminar.

## Salida

- Un directorio de propuesta nuevo —numerado con la serie de la convención— con el documento de la propuesta en estado `pendiente-de-revision` y un borrador por cada tarea de la descomposición.
- La propuesta dada de alta como en revisión en el índice de tareas.
- El agente se detiene al terminar: la puerta humana asíncrona queda activa.

## Principios rectores

1. **La propuesta es la unidad de revisión:** el documento de la propuesta contiene el enmarcado del problema y la solución más el índice de borradores; el detalle de cada tarea vive en su propio archivo de borrador. Los borradores no tienen ciclo de vida propio: siguen el de la propuesta.
2. **Refinamiento progresivo:** los borradores se crean de uno en uno, iterando cada uno antes de pasar al siguiente. No se generan todos a la vez: cada borrador puede revelar algo que cambie a los siguientes.
3. **La evidencia se resuelve en el refinamiento, nunca como borrador:** si una tarea necesita evidencia externa para definirse —p. ej. mejores prácticas, formatos, comparación de opciones—, se resuelve durante el refinamiento en su forma adecuada: teórica, con `investigar`; o activa, con `prueba-concepto`, que valida la hipótesis con código desechable —un test, un script temporal, un prototipo mínimo—. El documento o la conclusión se referencia en «Investigaciones de apoyo»; los borradores nacen con la evidencia ya incorporada. Un borrador cuyo contenido sea «investigar X» es la señal de que el refinamiento no terminó: la propuesta no va a revisión con su enfoque pendiente de evidencia, porque las tareas que dependen de él nacerían condicionadas a un resultado posterior. El descubrimiento de implementación —el que el ejecutor hace sobre el subsistema al planear— no es esto: vive en el sub-flujo de desarrollo.
4. **Borrador es futura tarea:** cada borrador usa los mismos campos que la plantilla de tarea definitiva (`assets/borrador.md`), sin las secciones de estado ni de revisión, que se añaden al promocionar. Esto permite que `crear-tareas` lo mueva al directorio de tareas de la convención sin reescritura.
5. **La puerta asíncrona bloquea:** tras enviar a revisión, el agente se detiene. No promociona, no ejecuta, no sigue refinando hasta que el usuario decida.

## Procedimiento

### 1. Crear la propuesta

1. **Determinar el siguiente número de propuesta** con la consulta «el siguiente número de la serie» de `consultar-artefactos` sobre el directorio de propuestas de la convención. Si el directorio no existe, crearlo y empezar por el primer número de la serie.
2. **Crear el directorio de la propuesta** bajo el directorio de propuestas, nombrado con el número de la serie y un slug breve derivado del título.
3. **Redactar el documento de la propuesta** siguiendo `assets/propuesta.md` —la plantilla reproduce los nombres convencionales configurables—: problema, oportunidad, forma de solución, solución, alternativas, fuera de alcance e investigaciones de apoyo («Ninguna» si aún no hay). Verificar que hay al menos dos alternativas documentadas. Dejar el estado en `borrador` y la sección de borradores vacía.

### 2. Descomponer en borradores

4. **Descomponer la forma de solución en tareas.** Cada borrador debe ser ejecutable de forma independiente por `ejecutar-tareas`: objetivo claro, entrada suficiente, criterios de calidad verificables, procedimiento sugerido.
5. **Resolver la evidencia antes de redactar.** Si la descomposición revela que una tarea necesita evidencia externa (p. ej. mejores prácticas, formatos, comparación de opciones), resolverla antes de redactar el borrador afectado, en su forma adecuada: teórica con `investigar`, o activa con `prueba-concepto`; referenciar el resultado en «Investigaciones de apoyo» de la propuesta. Si la evidencia cambia la forma de solución, actualizar el documento de la propuesta y los borradores ya creados antes de continuar. Ningún borrador es una investigación: si el instinto es crear un borrador de investigación, la evidencia se resuelve ahora, durante el refinamiento. Las puertas humanas son las de cada skill: `investigar` pausa el refinamiento hasta que el usuario apruebe el documento; `prueba-concepto` informa su conclusión, que entra en la propuesta y queda cubierta por la revisión de esta. Si el usuario rechaza el resultado, la descomposición se replantea con lo aprendido o la propuesta continúa sin esa evidencia, declarándolo en «Investigaciones de apoyo».
6. **Crear los borradores de uno en uno.** Por cada tarea, crear el archivo del borrador —numerado con la serie de borradores de la convención— siguiendo `assets/borrador.md`, iterar el contenido hasta que sea sólido y solo entonces pasar al siguiente. Las dependencias se expresan por la referencia del borrador cuando apuntan a otro borrador de la misma propuesta y por su número («035») cuando apuntan a una tarea existente.
7. **Actualizar el índice de borradores de la propuesta** a medida que se añade cada uno, con la forma de línea que la plantilla declara: referencia al archivo, título breve y dependencia cuando aplica.
8. **Revisar la redacción y pulir mecánicamente** el documento de la propuesta y cada borrador antes de enviar a revisión. Si el arnés lo permite, invocar `revisar-redaccion` en modo preventivo y, con su salida, `pulir-escritura` en modo preventivo; de lo contrario, realizar el equivalente manualmente.

### 3. Enviar a revisión

9. **Cambiar el estado de la propuesta** a `pendiente-de-revision` con la acción «cambiar el estado de `<ref>` a `<estado>`» de `actualizar-artefactos`.
10. **Dar de alta la propuesta en el índice** con la acción «dar de alta la propuesta `<dir>` «`<título>`» (`<n>` borradores)» de `actualizar-artefactos`, que la registra como en revisión y compone la línea con el formato configurado.
11. **Informar al usuario** de que la propuesta espera revisión y **detenerse**. La puerta humana asíncrona queda activa.

### Ciclo de vida posterior

Estas transiciones no las ejecuta este skill; se describen para contexto:

- **Aprobación:** el usuario aprueba y se registra la decisión en la sección de revisión de la propuesta. Entonces `crear-tareas`, en modo flujo de idea a tarea, promociona los borradores a tareas definitivas y la propuesta pasa a `aprobada`; a continuación `planificar` agrupa el conjunto en su épica o encabezado ligero, cerrando la planeación del flujo.
- **Cambios solicitados:** se retira la propuesta del índice, se actualiza la propuesta y los borradores, se vuelve al estado `borrador` y se reenvía a revisión.
- **Rechazo:** se retira la propuesta del índice y pasa a `descartada`. El directorio se conserva para trazabilidad.

## Formato de salida

- El documento de la propuesta en su directorio, según `assets/propuesta.md`, con estado `pendiente-de-revision`.
- Un archivo de borrador por tarea en el mismo directorio, según `assets/borrador.md`, sin las secciones de estado ni de revisión.
- La propuesta registrada en el índice como en revisión.

## Finalización

El skill ha terminado cuando:

- El documento de la propuesta está completo con el índice de todos los borradores.
- Cada borrador existe como archivo en el directorio de la propuesta con los campos de la plantilla de tarea, sin las secciones de estado ni de revisión.
- La propuesta está en estado `pendiente-de-revision` y figura en el índice como en revisión.
- El agente se ha detenido a la espera de la decisión del usuario.

## Referencias

- `assets/propuesta.md` — Plantilla del documento de la propuesta; reproduce los nombres convencionales configurables. Leer al crear la propuesta.
- `assets/borrador.md` — Plantilla de cada borrador; reproduce los nombres convencionales configurables. Leer al crear cada borrador.
