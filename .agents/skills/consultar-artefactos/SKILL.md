---
name: consultar-artefactos
description: >
  Responde consultas deterministas sobre los artefactos del sistema
  —índice de tareas, archivos de tarea, índices de decisiones y de
  lecciones, ideas persistidas y series numeradas— devolviendo datos
  parseables, para que los consumidores deleguen la lectura de los
  formatos en lugar de re-describirlos.
  Usar cuando un trabajo necesite un dato del estado o la estructura
  de un artefacto del proyecto evaluado cubierto por el catálogo.
  Sinónimos: consultar artefactos, consulta de artefactos, consulta
  mecánica, datos del índice, estado de una tarea.
---

# Consultar artefactos

Instrucciones para que un agente responda consultas deterministas sobre los artefactos del sistema. El skill recibe la orden delegada —archivo objetivo, operación y términos— y la ejecuta con los scripts bash propios de `assets/`, que devuelven los datos por stdout. Es la mitad de lectura del mecanismo de D033: las mutaciones de los artefactos corresponden a otro skill de utilidad.

## Cuándo usar

- Cuando un skill necesite un dato del estado o la estructura de un artefacto del sistema —índice de tareas, archivo de tarea, índice de decisiones o de lecciones, ideas persistidas, series numeradas— y la consulta sea una operación del catálogo.

## Cuándo no usar

- Para lecturas simples que el arnés resuelve directamente (`read`, `grep`, `git`): no se delegan.
- Para consultas que exigen juicio —veredictos, coincidencias semánticas, redacción—: el skill devuelve datos, no interpreta.
- Para mutar los artefactos: las escrituras no entran en el catálogo.

## Entrada

- La consulta delegada del consumidor en términos de dominio —«la próxima pendiente», «el estado de la tarea», «las propuestas en revisión», «el valor de la convención»— con las referencias de dominio que pida; nunca una ubicación, marca o sección que la configuración resuelve.

## Salida

- Los datos de la consulta por stdout, en el formato que cada operación declara. La ausencia del archivo objetivo es un error con diagnóstico; la ausencia de resultados es salida vacía legítima.

## Principios rectores

1. **Datos, nunca síntesis:** las operaciones devuelven lo que el artefacto contiene; la ausencia de archivo o de resultados se reporta como tal, sin fabricar datos.
2. **La orden es completa:** el consumidor delega archivo, operación y términos; no re-describe el formato del artefacto en su propio cuerpo.
3. **Lectura tolerante:** los parsers aceptan las variantes históricas —las convenciones no canónicas de `## Estado`, las posiciones divergentes de las secciones— aunque la escritura siempre produce la forma canónica (D033).
4. **Catálogo abierto:** una consulta mecánica no cubierta la resuelve el consumidor leyendo el artefacto directamente, y puede incorporarse después como operación nueva siguiendo el contrato.
5. **Contrato único:** los scripts reciben la entrada por argumentos, reservan stdout a datos parseables y stderr a diagnósticos, devuelven `0` en éxito —incluido el vacío legítimo— y `2` cuando falta la entrada (D033).

## Procedimiento

1. **Recibir la consulta delegada:** el consumidor indica la consulta de dominio y sus referencias.
2. **Resolver ubicación y operación:** la consulta mapea a la operación del catálogo; el objetivo —el artefacto a consultar— sale de `assets/convenciones.sh` salvo que sea la referencia de dominio pasada. Un `convenciones.sh` malformado hace fallar el script con diagnóstico.
3. **Ejecutar el script** de `assets/` correspondiente a la operación con los argumentos resueltos.
4. **Devolver la salida al consumidor:** stdout es el dato; un código de salida distinto de cero se transmite con su diagnóstico, sin reinterpretarlo.

## Acciones

El consumidor delega la consulta de dominio; el gestor la traduce a la operación del catálogo y resuelve el objetivo desde la configuración.

- «la próxima pendiente»: `siguiente` sobre el índice configurado —emite la línea completa de la tarea en curso o la primera pendiente—.
- «las propuestas en revisión»: `propuestas` sobre el índice configurado.
- «las agrupaciones del índice con su épica»: `grupos` sobre el índice configurado.
- «el estado de la agrupación `<texto>`»: `estado-grupo` sobre el índice configurado —la agrupación está agotada cuando solo figura la marca completada—.
- «las líneas de trabajo abiertas»: `inventario` sobre el índice y el directorio de épicas configurados.
- «el estado de la tarea `<ref>`»: `estado` sobre el archivo indicado —la referencia es de dominio: la tarea por su referencia, la propuesta, la épica—.
- «las secciones de `<ref>`»: `secciones` sobre el documento indicado.
- «si la planeación de la tarea `<ref>` está completa»: `planeacion` —cuatro líneas `sección<TAB>presente|ausente` en orden fijo—.
- «las dependencias de la tarea `<ref>`»: `dependencias`.
- «las acciones del plan de `<ref>` con su marca»: `checklist`.
- «las ideas sin procesar»: `pendientes` sobre el directorio de ideas configurado.
- «las lecciones/decisiones que disparan con `<término>…`»: `coincidencias` sobre el índice del dominio correspondiente.
- «el siguiente número de la serie `<directorio>` [prefijo] [ancho]»: `siguiente` —el directorio es referencia de dominio; prefijo y ancho salen de la configuración si la consulta no los da—.
- «el valor de la convención `<clave>`»: `convencion` —las convenciones ajenas a artefactos, como el prefijo de las ramas de tarea o la rama principal—.

## Catálogo de operaciones

Los scripts viven en `assets/` y se invocan como `assets/<script>.sh <objetivo> <operación> [términos]`, donde `<objetivo>` es la ruta del artefacto consultado —un archivo o un directorio, según el script—. stdout queda reservado a los datos parseables —una línea por resultado, campos separados por tabulador— y stderr a los diagnósticos. Una operación sin resultados devuelve `0` sin líneas —el vacío legítimo—; un objetivo ausente sale con `2` y diagnóstico; una invocación mal formada —operación desconocida o argumentos que faltan— imprime el `uso:` por stderr y sale con `2`.

### `todo.sh` — el índice de tareas (`TODO.md`)

`<objetivo>` es la ruta del `TODO.md`. Las operaciones solo reconocen líneas de tarea de nivel superior: la viñeta `- [` sin sangría. Índice ausente: exit `2`.

#### `siguiente`

Emite la primera línea `- [~] ` o `- [r] ` del índice —la tarea en curso—; si no hay ninguna, la primera `- [ ] `. La línea va completa, tal como está escrita. Sin tareas abiertas, salida vacía con exit `0`.

#### `propuestas`

Emite las líneas `- [p] ` —las propuestas en revisión—, completas y en el orden del documento. Sin propuestas, salida vacía con exit `0`.

#### `grupos`

Emite `encabezado<TAB>épica` por cada encabezado `##` del índice, en orden: el texto tras el `## ` y la ruta del último comentario `<!-- épica: <ruta> -->` de su sección —vacía en los encabezados sin épica enlazada—.

#### `estado-grupo <texto>`

Emite `marca<TAB>cuenta` por cada marca presente en las líneas de tarea de las secciones cuyo encabezado `##` contiene la subcadena `<texto>` —varias palabras se concatenan con espacio—, ordenadas por marca con el espacio primero; las propuestas `[p]` cuentan como una marca más. La agrupación está agotada cuando solo figura la marca `x`. Sin sección que case o sin tareas bajo ella, salida vacía con exit `0`; sin `<texto>`, `uso:` y exit `2`.

#### `inventario <dir-épicas>`

Emite las líneas de trabajo abiertas. Primero `epica<TAB>ruta<TAB>estado` por cada `*.md` de `<dir-épicas>` —`completada` o `planificada` según la opción marcada `[x]` en su `## Estado`, `otro` en cualquier otro caso—. Después, en el orden del recorrido del índice: `suelta<TAB>línea` por cada tarea no completada —marca distinta de `x`, línea completa— bajo `## General`, y `grupo<TAB>encabezado<TAB>épica` por cada encabezado `##`, emitido al cerrar su sección. Sin `<dir-épicas>`, `uso:` y exit `2`; directorio de épicas ausente: exit `2`.

### `tarea.sh` — un archivo de tarea (`docs/tasks/NNN-slug.md`)

`<objetivo>` es la ruta del archivo de tarea. Archivo ausente: exit `2`.

#### `estado`

Emite una línea con el estado canónico —`pendiente`, `en-progreso`, `en-revision`, `completada` o `bloqueada`— resolviendo las convenciones históricas del campo `## Estado`: la casilla suelta da la etiqueta que la acompaña —marcada o no—; en la lista de opciones separadas por `|` da la opción en negrita o la única marcada. `## Estado` ausente, vacío, con más de una opción marcada o en una forma no reconocida: diagnóstico y exit `1`.

#### `secciones`

Emite el texto de cada encabezado `##` presente —sin el `## `—, una línea por sección en el orden del documento. Sin secciones, salida vacía con exit `0`.

#### `planeacion`

Emite siempre cuatro líneas `sección<TAB>presente|ausente`, en este orden fijo: `Contexto`, `Conectividad`, `Plan técnico`, `Suite de pruebas esperada`. `presente` exige el encabezado `## <sección>` exacto.

#### `dependencias`

Emite las entradas de la sección `## Dependencias` —hasta el siguiente `##`—, una por línea y sin el guion de viñeta; descarta las viñetas de checklist (`- […]`) y las que empiezan por `Ninguna`. Sin sección o sin entradas, salida vacía con exit `0`.

#### `checklist`

Emite `marca<TAB>texto` por cada acción de la sección `## Plan técnico`, en el orden en que aparece: en las viñetas `- [·]` la marca es el carácter de la casilla, cualquiera que sea, y el texto lo que sigue; en las listas numeradas históricas `N. texto` la marca es `N`. Sin sección o sin acciones, salida vacía con exit `0`.

### `ideas.sh` — el directorio de ideas persistidas (`docs/ideas/`)

`<objetivo>` es la ruta del directorio de ideas. Directorio ausente: exit `2`.

#### `pendientes`

Emite `orden<TAB>archivo<TAB>título` por cada `*.md` del directorio que no menciona `Procesada en`: `orden` es su «Orden sugerido», `archivo` la ruta del archivo y `título` su primer `# `. Las líneas salen ordenadas por `orden` numérico; las ideas sin orden van al final con el primer campo vacío. Sin pendientes, salida vacía con exit `0`.

### `indice.sh` — los índices de decisiones y de lecciones (`README.md`)

`<objetivo>` es la ruta del `README.md` que hace de índice —entradas `- <archivo>` con sub-viñetas `Disparadores:`, `Resumen:` y `Estado:` opcional—. Índice ausente: exit `2`.

#### `coincidencias <término>…`

Emite `archivo<TAB>estado<TAB>resumen` por cada entrada cuya línea `Disparadores:` contiene algún `<término>` como subcadena, insensible a mayúsculas —una línea por entrada aunque casen varios términos, en el orden del índice—; `estado` va vacío cuando la entrada no declara `- Estado:`. Ignora los bloques de comentario `<!--`…`-->`. Sin término, `uso:` y exit `2`; sin coincidencias, salida vacía con exit `0`.

### `series.sh` — las series numeradas de un directorio

`<objetivo>` es la ruta del directorio de la serie. Directorio ausente: exit `2`.

#### `siguiente [prefijo] [ancho]`

Emite el siguiente número de la serie —el mayor número entre los archivos `<prefijo><dígitos>…` del directorio, más uno— con el formato `<prefijo>` seguido del número rellenado con ceros a `<ancho>` dígitos. `<prefijo>` y `<ancho>` son opcionales; el ancho vale `3` por defecto y se pasa `""` como prefijo cuando solo interesa el ancho. Directorio sin entradas de la serie: emite el primero (`001`, `D001`…). Ejemplos: `121` para `docs/tasks`, `D034` para `docs/decisions` con prefijo `D`, `05` para borradores con ancho `2`.

### `convencion.sh` — las convenciones del proyecto

Se invoca como `assets/convencion.sh <clave>`, sin objetivo: el valor de la convención vive en `assets/convenciones.sh`.

#### `convencion <clave>`

Emite el valor configurado de `<clave>` por stdout —o el valor por defecto del catálogo de `PERSONALIZE.md` si la instalación no lo personaliza—. Es la vía para las convenciones ajenas a un artefacto concreto: el prefijo de las ramas de tarea (`prefijo_rama_tarea`), la rama principal (`rama_principal`) y cualquier clave del catálogo que un consumidor necesite. Clave desconocida o sin valor: diagnóstico y exit `1`; sin `<clave>`, `uso:` y exit `2`.

### Cobertura

- Todas las operaciones tienen al menos un skill consumidor —las publicadas por anticipado no entran en el catálogo: se añaden cuando aparezca su consumidor—.
- Artefactos del ciclo aún sin operación delegada: `ROADMAP.md` —lectura y escritura directas del consumidor—; la sección `## Borradores` de `propuesta.md` —los borradores se listan y tachan a mano, `promocion.sh` solo la actualiza al promover—; las escrituras de los índices `README.md` de `docs/decisions/` y `docs/lessons/` —sus consultas por disparadores ya las cubre `indice.sh`—; y el índice de `docs/domains/` entero —formato distinto, sin lectura ni escritura delegada—. El registro de experiencias y el changelog están cubiertos por `operar-experiencias` y `operar-changelog`.

## Finalización

El skill ha terminado cuando el consumidor recibió los datos de la consulta —o el diagnóstico de la operación fallida— tal como el script los produjo.

## Referencias

- `docs/decisions/D033-pasos-mecanicos-skills-utilidad-scripts.md` — El mecanismo de delegación y el contrato de los scripts que estas operaciones cumplen.
