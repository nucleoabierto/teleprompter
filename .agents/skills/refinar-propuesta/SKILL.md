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

Instrucciones para que un agente cree la propuesta en `docs/proposals/NNN-slug/` con los borradores de las tareas y la envíe a revisión asíncrona. Es la tercera capacidad del flujo de idea a tarea: toma la salida de `proponer-forma-solucion` y produce la unidad de revisión que, una vez aprobada por el usuario, se materializará en tareas.

## Cuándo usar

- Cuando se tengan el problema, la oportunidad, la forma de solución, las alternativas y el fuera de alcance ya validados con el usuario.
- Como tercera capacidad del flujo de idea a tarea, invocada por el orquestador del flujo.

## Cuándo no usar

- Cuando el problema o la forma de solución aún no están validados: usar `descubrir-problema` o `proponer-forma-solucion` primero.
- Cuando la propuesta ya está aprobada y hay que materializar los borradores en tareas: usar `crear-tareas` en modo flujo de idea a tarea.
- Cuando la solicitud ya viene articulada como tareas y no necesita propuesta: usar `crear-tareas` en modo independiente.

## Entrada

- Problema + oportunidad (salida de `descubrir-problema`) y forma de solución + alternativas + fuera de alcance (salida de `proponer-forma-solucion`), validados por el usuario.
- `docs/proposals/` como directorio de propuestas, para determinar el siguiente número disponible.
- `TODO.txt`, para añadir la línea de propuesta en revisión al terminar.

## Salida

- Un directorio `docs/proposals/NNN-slug/` con `propuesta.md` en estado `[p]` Pendiente de revisión y un borrador `MM-titulo.md` por cada tarea de la descomposición.
- Una línea en la sección «Propuestas en revisión» de `TODO.txt` con el marcador `[p]`.
- El agente se detiene al terminar: la puerta humana asíncrona queda activa.

## Principios rectores

1. **La propuesta es la unidad de revisión:** `propuesta.md` contiene el enmarcado del problema y la solución más el índice de borradores; el detalle de cada tarea vive en su propio archivo `MM-titulo.md`. Los borradores no tienen ciclo de vida propio: siguen el de la propuesta.
2. **Refinamiento progresivo:** los borradores se crean de uno en uno, iterando cada uno antes de pasar al siguiente. No se generan todos a la vez: cada borrador puede revelar algo que cambie a los siguientes.
3. **Investigar antes de redactar:** si un borrador requiere evidencia externa para definirse con calidad, se invoca `investigar` durante el refinamiento y se referencia en «Investigaciones de apoyo».
4. **Borrador es futura tarea:** cada borrador usa los mismos campos que la plantilla de tarea definitiva (`assets/borrador.md`), sin Estado ni Revisión, que se añaden al promocionar. Esto permite que `crear-tareas` lo mueva a `docs/tasks/` sin reescritura.
5. **La puerta asíncrona bloquea:** tras enviar a revisión, el agente se detiene. No promociona, no ejecuta, no sigue refinando hasta que el usuario decida.

## Procedimiento

### 1. Crear la propuesta

1. **Determinar el siguiente número de propuesta.** Listar `docs/proposals/` y tomar el número siguiente al más alto existente, con formato `NNN`. Si el directorio no existe, crearlo y empezar en `001`.
2. **Crear el directorio `docs/proposals/NNN-slug/`** con un slug breve derivado del título.
3. **Redactar `propuesta.md`** siguiendo `assets/propuesta.md`: problema, oportunidad, forma de solución, solución, alternativas, fuera de alcance e investigaciones de apoyo («Ninguna» si aún no hay). Verificar que hay al menos dos alternativas documentadas. Dejar el estado en `[ ]` Borrador y la sección Borradores vacía.

### 2. Descomponer en borradores

4. **Descomponer la forma de solución en tareas.** Cada borrador debe ser ejecutable de forma independiente por `ejecutar-tareas`: objetivo claro, entrada suficiente, criterios de calidad verificables, procedimiento sugerido.
5. **Investigar cuando haga falta.** Si un borrador necesita evidencia externa (mejores prácticas, formatos, comparación de opciones), invocar `investigar` antes de redactarlo y añadir la referencia a «Investigaciones de apoyo» de `propuesta.md`.
6. **Crear los borradores de uno en uno.** Por cada tarea, crear `MM-titulo.md` (numeración de dos dígitos: `01`, `02`, …) siguiendo `assets/borrador.md`, iterar el contenido hasta que sea sólido y solo entonces pasar al siguiente. Las dependencias se expresan como «Borrador NN» cuando apuntan a otro borrador de la misma propuesta y por su número de tarea («035») cuando apuntan a una tarea existente.
7. **Actualizar el índice de `propuesta.md`** a medida que se añade cada borrador: `- \`MM-titulo.md\` — título breve (depende de MM, si aplica)`.
8. **Revisar la redacción y pulir mecánicamente** `propuesta.md` y cada borrador antes de enviar a revisión. Si el arnés lo permite, invocar `revisar-redaccion` en modo preventivo y, con su salida, `pulir-escritura` en modo preventivo; de lo contrario, realizar el equivalente manualmente.

### 3. Enviar a revisión

9. **Cambiar el estado de `propuesta.md`** a `[p]` Pendiente de revisión.
10. **Añadir la línea a `TODO.txt`** en la sección «Propuestas en revisión» (al final del archivo, después de los hitos; crear la sección si no existe): `- [p] docs/proposals/NNN-slug/ — título (N borradores)`.
11. **Informar al usuario** de que la propuesta espera revisión y **detenerse**. La puerta humana asíncrona queda activa.

### Ciclo de vida posterior

Estas transiciones no las ejecuta este skill; se describen para contexto:

- **Aprobación:** el usuario aprueba y se registra la decisión en el campo Revisión de `propuesta.md`. Entonces `crear-tareas`, en modo flujo de idea a tarea, promociona los borradores a tareas definitivas y la propuesta pasa a `[a]` Aprobada; a continuación `planificar` agrupa el conjunto en su épica o encabezado ligero, cerrando la planeación del flujo.
- **Cambios solicitados:** se retira la línea `[p]` de `TODO.txt`, se actualiza la propuesta y los borradores, se vuelve a `[ ]` Borrador y se reenvía a revisión.
- **Rechazo:** se elimina la línea de `TODO.txt` y la propuesta pasa a `[d]` Descartada. El directorio se conserva para trazabilidad.

## Formato de salida

- `docs/proposals/NNN-slug/propuesta.md` según `assets/propuesta.md`, con estado `[p]`.
- `docs/proposals/NNN-slug/MM-titulo.md` por cada borrador, según `assets/borrador.md`, sin Estado ni Revisión.
- Línea `[p]` en la sección «Propuestas en revisión» de `TODO.txt`.

## Finalización

El skill ha terminado cuando:

- `propuesta.md` está completo con el índice de todos los borradores.
- Cada borrador existe como archivo `MM-titulo.md` con los campos de la plantilla de tarea, sin Estado ni Revisión.
- La propuesta está en estado `[p]` y su línea figura en la sección «Propuestas en revisión» de `TODO.txt`.
- El agente se ha detenido a la espera de la decisión del usuario.

## Referencias

- `assets/propuesta.md` — Plantilla de `propuesta.md`. Leer al crear la propuesta.
- `assets/borrador.md` — Plantilla de cada borrador `MM-titulo.md`. Leer al crear cada borrador.
