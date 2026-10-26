---
name: actualizar-artefactos
description: >
  Ejecuta escrituras mecánicas sobre los artefactos del sistema
  (índice de tareas, archivos de tarea, propuestas y épicas, ideas
  persistidas y la promoción de borradores) preservando los formatos
  y escribiendo la forma canónica, para que los consumidores
  deleguen la mutación en lugar de re-describirla.
  Usar cuando un trabajo necesite mutar un artefacto del proyecto
  evaluado con una operación del catálogo.
  Sinónimos: actualizar artefactos, escritura de artefactos,
  mutación mecánica, cambiar estado de una tarea, actualizar el
  índice.
---

# Actualizar artefactos

Instrucciones para que un agente ejecute escrituras mecánicas sobre los artefactos del sistema. El skill recibe la orden delegada (artefacto objetivo, operación y términos) y la resuelve aplicando el documento de reglas del artefacto, que declara su formato, su escritura canónica y cada operación: el agente muta el artefacto directamente, preservando lo que no toca. Es la mitad de escritura del mecanismo de delegación: las consultas corresponden a `consultar-artefactos`.

## Cuándo usar

- Cuando un skill necesite mutar un artefacto del sistema (marcar una línea del índice, cambiar el `## Estado` de una tarea, insertar una sección, registrar un veredicto, mover líneas entre agrupaciones, marcar una idea como procesada, promover borradores) y la mutación sea una operación del catálogo.

## Cuándo no usar

- Para escrituras con juicio (redacción de contenido, reformulación, veredictos): el skill ejecuta mecánica; qué escribir lo decide el consumidor.
- Para consultar los artefactos: eso corresponde a `consultar-artefactos`.
- Para mutaciones no cubiertas por el catálogo: el consumidor edita directamente; la operación puede incorporarse después en el documento de reglas del artefacto.

## Entrada

- La acción delegada del consumidor en términos de dominio («marcar la tarea completada», «registrar el veredicto», «promover los borradores de la propuesta») con las referencias de dominio que la acción pida: la tarea, la propuesta, la épica o la idea por su referencia; nunca una ubicación, marca o sección que el documento de reglas resuelve.

## Salida

- El artefacto mutado en su ubicación. Las operaciones que producen un dato (`encabezado`, `promover`) lo devuelven en formato parseable. Una mutación que no puede ejecutarse falla con diagnóstico, sin escribir.

## Principios rectores

1. **Preservar lo que no se toca:** la mutación reescribe solo lo que la operación declara; sublistas de bloqueantes, comentarios de épica, secciones ajenas y contenido quedan intactos.
2. **La acción es completa:** el consumidor delega la acción y sus referencias de dominio; ubicación, formato y aplicación los resuelve el documento de reglas, y las decisiones (qué estado poner, qué texto escribir) son del consumidor.
3. **Escritura canónica, lectura tolerante:** la forma la fija el documento de reglas aunque la entrada sea una variante histórica (D035).
4. **Promoción sin reescritura:** la promoción mueve archivos, inyecta las secciones que faltan y renumera referencias; no reformula el contenido aprobado (D014).
5. **Contrato único:** dato parseable cuando lo produce; fallo con diagnóstico y sin escribir cuando la mutación no puede ejecutarse, la entrada falta o la invocación es inválida (D035).

## Procedimiento

1. **Recibir la acción delegada** del consumidor: acción de dominio y referencias.
2. **Resolver y operar:** la acción mapea a las operaciones del catálogo (una acción puede componer varias); el documento de reglas del artefacto declara objetivo y literales, y el agente muta el archivo directamente siguiéndolo; el cuerpo de las secciones nuevas lo da el consumidor.
3. **Transmitir el resultado:** un fallo se comunica con su diagnóstico, sin reinterpretarlo.

## Acciones

El consumidor delega la acción de dominio; el gestor la expande a las operaciones del catálogo y resuelve lo que la acción no nombra. Los estados y las secciones se nombran por su concepto en el vocabulario del dominio (`en-revision`, `estado`, `plan`, `borradores`…) y el gestor los traduce a la marca, etiqueta o nombre que declara el documento de reglas.

- «marcar la tarea `<ref>` como `<estado>`»: `marcar` sobre el índice con la marca declarada y `estado` sobre el archivo de la tarea con su etiqueta (las dos mutaciones que el estado implica).
- «declarar la tarea `<ref>` bloqueada por `<refs>`»: la misma acción de estado con `bloqueada`, pasando los bloqueantes a `marcar`.
- «dar de alta la tarea `<ref>` «`<título>`» bajo `<agrupación>`»: `añadir` con la línea compuesta según el formato declarado.
- «dar de alta la propuesta `<dir>` «`<título>`» (`<n>` borradores)»: `añadir` sobre la sección de propuestas con la línea compuesta.
- «retirar `<ref>` del índice»: `retirar`.
- «mover `<ref>` bajo `<agrupación>`»: `mover`.
- «recolocar `<ref>` `antes-de`|`después-de` `<ref2>`|`final`»: `recolocar`.
- «retirar la agrupación `<ref>`»: `retirar-grupo`.
- «crear la agrupación «`<título>`» [con épica `<ref>`]»: `encabezado`; devuelve el encabezado creado.
- «inicializar el índice»: `inicializar`.
- «cambiar el estado de `<ref>` a `<estado>`»: `estado` sobre el documento indicado.
- «marcar la opción `<estado>` del estado de `<ref>`»: `marcar-opcion` (el estado acumulativo de las épicas).
- «registrar el veredicto `<autor>` `<veredicto>` en `<ref>`»: `registrar-revision` con la línea compuesta (autor, fecha de hoy, veredicto).
- «insertar la sección `<concepto>` en `<ref>` con el cuerpo dado»: `insertar-seccion`.
- «añadir la línea `<línea>` a la sección `<concepto>` de `<ref>`»: `añadir-linea`.
- «marcar completado el ítem `<texto>` de la sección `<concepto>` de `<ref>`»: `marcar-item`.
- «sustituir el ítem `<texto>` de la sección `<concepto>` de `<ref>` por el cuerpo dado»: `sustituir-item`.
- «marcar la idea `<ref>` procesada en `<destino>`»: `procesada`.
- «promover los borradores de la propuesta `<dir>`»: `promover`; devuelve la correspondencia `MM→NNN→ruta` por borrador.

## Catálogo de operaciones

Cada operación se resuelve aplicando la sección de su nombre en el documento de reglas que encabeza su grupo (el agente muta el archivo directamente con las herramientas habituales, sin scripts). Las referencias `<ref>` y los `<texto>` casan por subcadena con la línea o el encabezado; conviene pasar la ruta del archivo o el encabezado completo para que sean únicas (las excepciones las declara cada documento). Toda mutación que no puede ejecutarse es fallo con diagnóstico y sin escribir; solo `encabezado` y `promover` devuelven un dato.

### `references/indice-tareas.md`: el índice de tareas (`TODO.md`)

- `marcar <ref> <marca> [bloqueante…]`
- `añadir <sección> <línea>`
- `retirar <ref>`
- `mover <ref> <encabezado>`
- `recolocar <ref> <pos> [ref2]`
- `retirar-grupo <ref>`
- `encabezado <título> [épica]`
- `inicializar`

### `references/tarea.md`: un archivo de tarea, propuesta o épica

Las particularidades de propuestas y épicas las declaran `propuesta.md` y `epica.md` del mismo directorio.

- `estado <etiqueta>`
- `marcar-opcion <etiqueta>`
- `insertar-seccion <título>`
- `registrar-revision <línea>`
- `añadir-linea <sección> <línea>`
- `marcar-item <sección> <texto>`
- `sustituir-item <sección> <texto>`

### `references/idea.md`: un archivo de idea persistida

- `procesada <destino>`

### `references/propuesta.md`: la promoción de borradores

- `promover` (el cambio de estado del `propuesta.md` a aprobada y la retirada de su línea del índice son órdenes aparte, que delega el consumidor).

### Cobertura

Todas las operaciones tienen al menos un skill consumidor. Los artefactos del ciclo aún sin operación delegada figuran en la sección Cobertura de `consultar-artefactos`.

## Finalización

El skill ha terminado cuando el artefacto quedó mutado según la orden (o el consumidor recibió el diagnóstico de la operación fallida).

## Referencias

- `docs/decisions/D035-reglas-declarativas-por-artefacto.md`: el mecanismo de delegación que estas operaciones cumplen y las formas canónicas que escriben.
- `references/`: los documentos de reglas de los artefactos: `indice-tareas.md`, `tarea.md`, `propuesta.md`, `epica.md`, `idea.md`.
- `.agents/skills/consultar-artefactos/SKILL.md`: la mitad de lectura del mecanismo.
