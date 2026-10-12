---
name: actualizar-artefactos
description: >
  Ejecuta escrituras mecánicas sobre los artefactos del sistema
  —índice de tareas, archivos de tarea, propuestas y épicas, ideas
  persistidas y la promoción de borradores— preservando los formatos
  y escribiendo la forma canónica, para que los consumidores
  deleguen la mutación en lugar de re-describirla.
  Usar cuando un trabajo necesite mutar un artefacto del proyecto
  evaluado con una operación del catálogo.
  Sinónimos: actualizar artefactos, escritura de artefactos,
  mutación mecánica, cambiar estado de una tarea, actualizar el
  índice.
---

# Actualizar artefactos

Instrucciones para que un agente ejecute escrituras mecánicas sobre los artefactos del sistema. El skill recibe la orden delegada —archivo objetivo, operación y términos— y la ejecuta con los scripts bash propios de `assets/`, que mutan el artefacto preservando lo que no tocan. Es la mitad de escritura del mecanismo de D033: las consultas corresponden a `consultar-artefactos`.

## Cuándo usar

- Cuando un skill necesite mutar un artefacto del sistema —marcar una línea del índice, cambiar el `## Estado` de una tarea, insertar una sección, registrar un veredicto, mover líneas entre agrupaciones, marcar una idea como procesada, promover borradores— y la mutación sea una operación del catálogo.

## Cuándo no usar

- Para escrituras con juicio —redacción de contenido, reformulación, veredictos—: el skill ejecuta mecánica; qué escribir lo decide el consumidor.
- Para consultar los artefactos: eso corresponde a `consultar-artefactos`.
- Para mutaciones no cubiertas por el catálogo: el consumidor edita directamente; la operación puede incorporarse después siguiendo el contrato.

## Entrada

- La acción delegada del consumidor en términos de dominio —«marcar la tarea completada», «registrar el veredicto», «promover los borradores de la propuesta»— con las referencias de dominio que la acción pida: la tarea, la propuesta, la épica o la idea por su referencia; nunca una ubicación, marca o sección que la configuración resuelve.

## Salida

- El artefacto mutado en su ubicación. Las operaciones que producen un dato —`encabezado`, `promover`— lo emiten por stdout en formato parseable. Una mutación que no puede ejecutarse termina con código distinto de cero y diagnóstico en stderr, sin escribir.

## Principios rectores

1. **Preservar lo que no se toca:** las mutaciones reescriben solo lo que la operación declara: sublistas de bloqueo, comentarios de épica, secciones ajenas y contenido quedan intactos.
2. **La acción es completa:** el consumidor delega la acción y sus referencias de dominio; el gestor resuelve ubicación, formato y aplicación —qué artefactos toca un estado, con qué marca y etiqueta— desde `assets/convenciones.sh`; las decisiones —qué estado poner, qué texto escribir— son del consumidor, no del script.
3. **Escritura canónica, lectura tolerante:** `## Estado` se escribe siempre en la forma canónica —línea completa de opciones con la vigente en negrita, marcador y etiqueta incluidos— aunque la entrada sea una variante histórica; `## Desviaciones del plan` y cualquier sección nueva van inmediatamente antes de `## Revisión` (D033).
4. **Falla sin escribir:** ante un formato inesperado —sección ausente, referencia no localizada, línea de opciones no parseada— el script termina con diagnóstico y no modifica el archivo.
5. **Promoción sin reescritura:** la promoción de borradores mueve archivos, inyecta las secciones que faltan y renumera referencias; no reformula el contenido aprobado (D014).
6. **Contrato único:** los mismos canales y códigos que en la lectura: stdout para datos parseables, stderr para diagnósticos, `0` en éxito y `2` en entrada ausente o invocación inválida (D033).

## Procedimiento

1. **Recibir la acción delegada:** el consumidor indica la acción de dominio y sus referencias.
2. **Resolver ubicación, formato y aplicación:** la acción mapea a las operaciones del catálogo; el objetivo —el artefacto a mutar— sale de `assets/convenciones.sh` salvo que sea la referencia de dominio pasada; las marcas, etiquetas de estado, nombres de sección y formatos de línea salen de la misma configuración. Un `convenciones.sh` malformado hace fallar el script con diagnóstico antes de tocar nada.
3. **Ejecutar el script** de `assets/` correspondiente a cada operación de la expansión —una acción puede componer varias—; el cuerpo de las secciones nuevas entra por `stdin`.
4. **Transmitir el resultado al consumidor:** un código de salida distinto de cero se comunica con su diagnóstico, sin reinterpretarlo.

## Acciones

El consumidor delega la acción de dominio; el gestor la expande a las operaciones del catálogo y resuelve lo que la acción no nombra. Los estados se nombran en el vocabulario del dominio —`pendiente`, `en-progreso`, `en-revision`, `completada`, `bloqueada`, `borrador`, `pendiente-de-revision`, `aprobada`, `descartada`, `planificada`— y el gestor los traduce a la marca y la etiqueta configuradas. Las secciones se nombran por su concepto —`estado`, `revision`, `dependencias`, `plan`, `suite`, `contexto`, `conectividad`, `desviaciones`, `borradores`, `piezas`— y el gestor las traduce al nombre configurado.

- «marcar la tarea `<ref>` como `<estado>`»: `marcar` sobre el índice con la marca configurada del estado y `estado` sobre el archivo de la tarea con su etiqueta —las dos mutaciones que el estado implica—.
- «declarar la tarea `<ref>` bloqueada por `<refs>`»: la misma acción de estado con `bloqueada`, pasando los bloqueantes a `marcar`.
- «dar de alta la tarea `<ref>` «`<título>`» bajo `<agrupación>`»: compone la línea con el formato configurado —marca pendiente, referencia, título— y `añadir`; `<agrupación>` `general` o `propuestas` denota las secciones fijas, otro texto casa con un encabezado.
- «dar de alta la propuesta `<dir>` «`<título>`» (`<n>` borradores)»: compone la línea de propuesta en revisión con el formato configurado —marca de propuesta, directorio, título y cuenta— y `añadir` sobre la sección de propuestas.
- «retirar `<ref>` del índice»: `retirar`.
- «mover `<ref>` bajo `<agrupación>`»: `mover`.
- «recolocar `<ref>` `antes-de`|`después-de` `<ref2>`|`final`»: `recolocar`.
- «retirar la agrupación `<ref>`»: `retirar-grupo`.
- «crear la agrupación «`<título>`» [con épica `<ref>`]»: `encabezado`; emite el encabezado creado.
- «inicializar el índice»: `inicializar`.
- «cambiar el estado de `<ref>` a `<estado>`»: `estado` sobre el documento indicado —la propuesta, la épica u otro documento con línea de estado—.
- «marcar la opción `<estado>` del estado de `<ref>`»: `marcar-opcion` —el estado acumulativo de las épicas—.
- «registrar el veredicto `<autor>` `<veredicto>` en `<ref>`»: compone la línea con el formato configurado —autor, fecha de hoy, veredicto— y `registrar-revision`.
- «insertar la sección `<concepto>` en `<ref>` con el cuerpo dado»: `insertar-seccion` con el cuerpo por `stdin`.
- «añadir la línea `<línea>` a la sección `<concepto>` de `<ref>`»: `añadir-linea`.
- «marcar completado el ítem `<texto>` de la sección `<concepto>` de `<ref>`»: `marcar-item`.
- «sustituir el ítem `<texto>` de la sección `<concepto>` de `<ref>` por el cuerpo dado»: `sustituir-item` con el cuerpo por `stdin`.
- «marcar la idea `<ref>` procesada en `<destino>`»: `procesada`.
- «promover los borradores de la propuesta `<dir>`»: `promover`, resolviendo el directorio de tareas y el índice de la configuración; emite la correspondencia `MM→NNN→ruta` por borrador.

## Catálogo de operaciones

Los scripts viven en `assets/` y se invocan como `assets/<script>.sh <objetivo> <operación> [términos]`, donde `<objetivo>` es el artefacto a mutar —el índice, el archivo de tarea, la idea o, en `promocion.sh`, el directorio de la propuesta—. Las referencias `<ref>` y los `<texto>` casan por subcadena con la línea o el encabezado; conviene pasar la ruta del archivo o el encabezado completo para que sean únicas. Las excepciones al casamiento por subcadena: en `tarea.sh` el argumento `<sección>` es el título exacto de la sección, sin el `## `, y en `todo.sh añadir` los nombres `general` y `propuestas` denotan las secciones fijas de la convención.

Solo `encabezado` y `promover` emiten un dato por stdout; el resto muta en silencio. El artefacto ausente o la invocación incompleta o inválida terminan con exit `2` —salvo `inicializar`, que exige que el índice no exista— y toda mutación que no puede ejecutarse termina con diagnóstico en stderr y sin escribir.

### `todo.sh` — el índice de tareas (`TODO.md`)

#### `marcar <ref> <marca> [bloqueante…]`

Cambia la marca de la línea de tarea que contiene `<ref>` —solo líneas de primer nivel `- [·]`—. Las marcas válidas son ` ` —un espacio, entre comillas: pendiente—, `~`, `r`, `x` y `!`; otra marca es invocación inválida, exit `2`. Con `!` reemplaza la sublista por los `<bloqueante>` dados, cada uno como `  - [ ] <bloqueante>`; con cualquier otra marca elimina la sublista existente. Línea no localizada: exit `1`.

#### `añadir <sección> <línea>`

Añade `<línea>` al final de la sección indicada. `general` y `propuestas` denotan `## General` y `## Propuestas en revisión` y crean la sección si falta —General al inicio de las agrupaciones, Propuestas al final del archivo—; otro valor casa por subcadena con un encabezado `## ` existente y no crea nada. Sección no localizada: exit `1`.

#### `retirar <ref>`

Elimina la línea de tarea que contiene `<ref>` con su sublista. Línea no localizada: exit `1`.

#### `mover <ref> <encabezado>`

Mueve la línea de tarea —con su sublista— al final de la agrupación cuyo encabezado `## ` contiene `<encabezado>`. Línea no localizada: exit `1`; encabezado no localizado: exit `1`, con diagnóstico propio para cada caso.

#### `recolocar <ref> <pos> [ref2]`

Recoloca el bloque que contiene `<ref>` —el grupo entero si casa con un encabezado `## `, la línea con su sublista si casa con una línea de tarea—: `antes-de` o `después-de` del bloque `<ref2>` —otro encabezado u otra línea, fuera del bloque movido—, o `final`, que lo deja antes de la sección de propuestas —al final del archivo si no la hay—. Cualquier reordenación se compone de recolocaciones. `<pos>` distinta o `<ref2>` ausente cuando se exige: invocación inválida, exit `2`. Bloque no localizado o destino no localizado: exit `1`, con diagnóstico propio para cada caso.

#### `retirar-grupo <ref>`

Elimina el encabezado `## ` que contiene `<ref>` con su comentario de épica y todas sus líneas. Grupo no localizado: exit `1`.

#### `encabezado <título> [épica]`

Crea `## Hito N: <título>` con el siguiente número de la serie, al final de las agrupaciones —antes de la sección de propuestas— y, si se pasa `<épica>`, con el comentario `<!-- épica: <épica> -->` bajo el encabezado. Emite por stdout el encabezado creado.

#### `inicializar`

Crea el índice con la estructura de la convención —cabecera, comentario de formato y `## General`—. El archivo no debe existir: si existe, exit `1` sin tocarlo.

### `tarea.sh` — un archivo de tarea, propuesta o épica

#### `estado <etiqueta>`

Escribe `## Estado` en forma canónica —la línea completa de opciones con la vigente en negrita— activando la opción `<etiqueta>`. Sobre una línea de opciones conserva las opciones existentes; sobre la forma suelta reconstruye la línea con el juego de opciones que indica la etiqueta vigente —el de tareas o el de propuestas—. `## Estado` ausente o vacío, línea de opciones no parseada, forma suelta no reconocida o `<etiqueta>` fuera del juego de opciones: exit `1`.

#### `marcar-opcion <etiqueta>`

Pone `[x]` a la opción `<etiqueta>` de la línea de opciones sin cambiar la marca de las demás —la línea queda escrita sin negritas—, para el `## Estado` acumulativo de las épicas (`[x] Planificada | [x] Completada`). `## Estado` ausente o vacío, o en forma suelta: exit `1`; opción no encontrada: exit `1`.

#### `insertar-seccion <título>`

Lee el cuerpo de `stdin` e inserta `## <título>` seguido del cuerpo, antes de `## Desviaciones del plan` si existe —salvo que la sección nueva sea esa misma— o, en su defecto, antes de `## Revisión`. `stdin` vacío: exit `2`; la sección ya existe o falta `## Revisión`: exit `1`.

#### `registrar-revision <línea>`

Registra `<línea>` en `## Revisión` con la forma `- Autor: fecha — veredicto` —el `- ` inicial puede omitirse; el script lo añade—: rellena el placeholder `- Autor: [fecha] — …` del mismo autor si existe o añade la línea al final de la sección. `<línea>` sin `Autor:` reconocible: exit `2`; `## Revisión` ausente: exit `1`.

#### `añadir-linea <sección> <línea>`

Añade `<línea>` al final de `## <sección>` —coincidencia exacta del título—. Sección no localizada: exit `1`.

#### `marcar-item <sección> <texto>`

Marca `[x]` todos los ítems `- [ ]` de `## <sección>` que contienen `<texto>`; idempotente sobre ítems ya marcados. Ningún ítem casado: exit `1`.

#### `sustituir-item <sección> <texto>`

Sustituye el primer ítem `- [·]` de `## <sección>` que contiene `<texto>` —con sus sub-bullets— por el contenido leído de `stdin` —la replanificación del `## Plan técnico`—. `stdin` vacío: exit `2`; ítem no localizado: exit `1`.

### `ideas.sh` — un archivo de idea persistida

#### `procesada <destino>`

Añade `> **Procesada en:** <destino>` tras la última línea `>` de la cabecera —antes de la primera sección `## `—. Idea ya marcada o cabecera sin líneas `>`: exit `1`.

### `promocion.sh` — la promoción de borradores

#### `promover <dir-tareas> <índice>`

Invocada sobre el directorio de la propuesta: mueve cada `MM-slug.md` a `<dir-tareas>/NNN-slug.md` con numeración continua tras el máximo del directorio de tareas y del índice, inyecta `## Estado` en forma canónica y `## Revisión` con sus placeholders, renumera las dependencias «Borrador MM» de `## Dependencias` y actualiza el índice `## Borradores` de `propuesta.md` —la referencia al archivo y los «depende de N»—. Emite por stdout una línea `MM<TAB>NNN<TAB>ruta` por borrador promovido.

La validación precede a cualquier escritura: una dependencia «Borrador MM» no resoluble, un borrador del índice ausente o sin serie válida, un borrador sin secciones `## ` o uno que ya trae `## Estado` o `## Revisión` abortan la promoción entera con exit `1` sin tocar nada; un borrador del directorio no listado en el índice solo avisa por stderr y se promueve igual. Directorio de la propuesta, `propuesta.md`, directorio de tareas o índice ausentes: exit `2`; directorio sin borradores: exit `1`. El cambio de estado de `propuesta.md` a `[a]` y la retirada de su línea `[p]` del índice son órdenes aparte (`tarea.sh estado` y `todo.sh retirar`).

### Cobertura

Todas las operaciones tienen al menos un skill consumidor. Los artefactos del ciclo aún sin operación delegada figuran en la sección Cobertura de `consultar-artefactos`.

## Finalización

El skill ha terminado cuando el artefacto quedó mutado según la orden —o el consumidor recibió el diagnóstico de la operación fallida—.

## Referencias

- `docs/decisions/D033-pasos-mecanicos-skills-utilidad-scripts.md` — El mecanismo de delegación, el contrato de los scripts y las formas canónicas que estas operaciones escriben.
- `.agents/skills/consultar-artefactos/SKILL.md` — La mitad de lectura del mecanismo.
