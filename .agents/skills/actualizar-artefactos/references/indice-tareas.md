# Reglas del índice de tareas

Reglas del artefacto «índice de tareas»: su formato, su lectura tolerante, su escritura canónica y las operaciones del catálogo. Hogar: `actualizar-artefactos`, dueño de la escritura canónica; lo consume también `consultar-artefactos`, que lo referencia como `../actualizar-artefactos/references/indice-tareas.md`.

## Ubicación y literales

- El índice es `TODO.md` en la raíz del repositorio del proyecto evaluado.
- Los archivos de tarea viven en `docs/tasks/`. Las líneas del índice los referencian por esa ruta.
- Los literales de este documento (rutas, marcas, etiquetas, formatos de línea) llevan los valores por defecto de la convención del paquete. Un proyecto que difiere los edita aquí directamente; `PERSONALIZE.md` indica qué documento contiene cada literal.

## Formato del artefacto

El índice es un documento Markdown con esta estructura, en este orden:

1. El título `# TODO`.
2. Un bloque de comentario `<!--`…`-->` que documenta el formato.
3. La sección `## General`, que agrupa las tareas sueltas sin hito.
4. Las agrupaciones planificadas, cada una bajo un encabezado `## Hito N: <título>` (`N` es una serie propia del índice). Una agrupación con épica lleva el comentario de enlace `<!-- épica: <ruta de la épica> -->` en la línea siguiente al encabezado.
5. Al final, la sección `## Propuestas en revisión`, con las propuestas del flujo de idea a tarea.

### Líneas de tarea

Cada tarea es una línea de primer nivel, la viñeta `- [` sin sangría, con la forma:

```
- [<marca>] <referencia> — <título>
```

- `<marca>` es un carácter dentro de la casilla: ` ` pendiente, `~` en progreso, `r` en revisión, `x` completada, `!` bloqueada.
- `<referencia>` es la ruta del archivo de la tarea (`docs/tasks/NNN-slug.md`).
- Una tarea bloqueada lleva una sublista con sus bloqueantes, una línea por cada uno con la forma `  - [ ] <referencia>` (dos espacios de sangría).
- Las líneas de propuesta usan el mismo molde con la marca `p` y la referencia al directorio: `- [p] <dir-propuesta>/ — <título> (<n> borradores)`.

Solo las líneas de primer nivel son entradas del índice: la línea empieza por `- [` y el `]` cae en quinta posición (las líneas sangradas son sublistas de la entrada que las precede). Las operaciones `siguiente` y `propuestas` exigen además el espacio tras `]`; `estado-grupo` e `inventario` aceptan cualquier marca en la casilla. Al referenciar una línea por subcadena, conviene usar la ruta del archivo para que la coincidencia sea única.

### Espaciado canónico

Toda mutación del índice deja el espaciado normalizado: una línea en blanco antes de cada encabezado `## ` cuando la línea anterior no es vacía, y una línea en blanco entre un encabezado (o cualquier línea de comentario `<!--` que le siga) y la primera línea de tarea de su sección.

## Lectura tolerante

Las consultas solo reconocen líneas de primer nivel `- [`…`] `. Las secciones pueden faltar (un índice sin `## Propuestas en revisión` o sin agrupaciones es válido) y el resultado vacío es legítimo, no un error.

## Escritura canónica

Toda escritura produce el formato declarado arriba: la marca dentro de la casilla, el separador ` — `, la sublista de bloqueantes sangrada y el espaciado canónico tras la mutación.

## Operaciones de lectura

Las lecturas devuelven datos parseables: una línea por resultado, campos separados por tabulador. Índice ausente: fallo. Sin resultados: vacío legítimo.

### `siguiente`

La primera línea `- [~]` o `- [r]` del índice, la tarea en curso; si no hay ninguna, la primera `- [ ]`. Se devuelve la línea completa, tal como está escrita. Sin tareas abiertas, vacío legítimo.

### `propuestas`

Las líneas `- [p]` (las propuestas en revisión), completas y en el orden del documento.

### `grupos`

`encabezado<TAB>épica` por cada encabezado `## ` del índice, en orden: el texto tras el `## ` y la ruta del último comentario `<!-- épica: <ruta> -->` de su sección (vacía en los encabezados sin épica enlazada).

### `estado-grupo <texto>`

`marca<TAB>cuenta` por cada marca presente en las líneas de primer nivel `- [·]` de las secciones cuyo encabezado `## ` contiene la subcadena `<texto>` (varias palabras se concatenan con espacio). Las marcas se ordenan con el espacio primero; las propuestas `p` cuentan como una marca más. La agrupación está agotada cuando solo figura la marca `x`. Sin sección que case o sin tareas bajo ella: vacío legítimo.

### `inventario <dir-épicas>`

Las líneas de trabajo abiertas. Primero `epica<TAB>ruta<TAB>estado` por cada `*.md` del directorio de épicas: `completada` cuando su `## Estado` lleva `[x] Completada`, `planificada` cuando lleva `[x] Planificada` y `otro` en cualquier otro caso (la comprobación de `completada` precede a la de `planificada` porque las épicas acumulan marcas). Después, en el orden del recorrido del índice: `suelta<TAB>línea` por cada tarea no completada (marca distinta de `x`, línea completa) bajo `## General`, y `grupo<TAB>encabezado<TAB>épica` por cada encabezado `## `, emitido al cerrar su sección. Directorio de épicas ausente: fallo.

## Operaciones de escritura

Las mutaciones reescriben solo lo que la operación declara (sublistas de bloqueantes, comentarios de épica, secciones ajenas y contenido quedan intactos) y normalizan el espaciado. Una mutación que no puede ejecutarse falla sin escribir, con el diagnóstico correspondiente.

### `marcar <ref> <marca> [bloqueante…]`

Cambia la marca de la línea de tarea de primer nivel que contiene `<ref>`, conservando todo lo que sigue a la casilla. Las marcas válidas son ` `, `~`, `r`, `x` y `!`: otra marca es invocación inválida. Con `!` se reemplaza la sublista por una línea `  - [ ] <bloqueante>` por cada bloqueante dado; con cualquier otra marca se elimina la sublista existente (las líneas sangradas que la siguen). Línea no localizada: fallo.

### `añadir <sección> <línea>`

Añade `<línea>` al final de la sección indicada. Los nombres `general` y `propuestas` denotan las secciones fijas `## General` y `## Propuestas en revisión` y las crean si faltan (`## General` antes del primer encabezado `## ` existente, `## Propuestas en revisión` al final del archivo); otro valor casa por subcadena con un encabezado `## ` existente y no crea nada. Sección no localizada: fallo.

### `retirar <ref>`

Elimina la línea de tarea que contiene `<ref>` con su sublista. Línea no localizada: fallo.

### `mover <ref> <encabezado>`

Mueve la línea de tarea, con su sublista, al final de la agrupación cuyo encabezado `## ` contiene `<encabezado>`. Línea no localizada y encabezado no localizado son fallos con diagnóstico propio.

### `recolocar <ref> <pos> [ref2]`

Recoloca el bloque que contiene `<ref>`: el grupo entero (encabezado, comentario de épica y líneas hasta la siguiente `## `) si `<ref>` casa con un encabezado, o la línea de tarea con su sublista si casa con una línea (si `<ref>` casa con ambos, el encabezado gana). `<pos>` es `antes-de` u `después-de` del bloque `<ref2>` (otro encabezado u otra línea, fuera del bloque movido), o `final`, que lo deja inmediatamente antes de la sección de propuestas (al final del archivo si no la hay); la sección de propuestas se localiza por el prefijo `## Propuestas`. `<pos>` distinta o `<ref2>` ausente cuando se exige: invocación inválida. Bloque no localizado o destino no localizado: fallos con diagnóstico propio. Cualquier reordenación se compone de recolocaciones.

### `retirar-grupo <ref>`

Elimina el encabezado `## ` que contiene `<ref>` con su comentario de épica y todas sus líneas, hasta la línea anterior al siguiente `## `. Grupo no localizado: fallo.

### `encabezado <título> [épica]`

Crea `## Hito N: <título>` con el siguiente número de la serie (el mayor `N` de los encabezados `## Hito ` existentes, más uno), al final de las agrupaciones (antes de la sección de propuestas, localizada por el prefijo `## Propuestas`) y, si se pasa `<épica>`, con el comentario `<!-- épica: <ruta> -->` bajo el encabezado. Devuelve el encabezado creado.

### `inicializar`

Crea el índice con la estructura de la convención. El archivo no debe existir: si existe, fallo sin tocarlo. El contenido exacto que se escribe es:

```markdown
# TODO

<!-- Índice de tareas. Cada tarea se documenta en un archivo individual en docs/tasks/.
     Formato de cada línea:
     - [estado] docs/tasks/NNN-slug.md — título breve
       estado: [ ] pendiente, [~] en progreso, [r] en revisión, [x] completada, [!] bloqueada
     Para tareas bloqueadas, añadir sublista con las tareas bloqueantes.
     Las tareas planificadas se agrupan por hito bajo encabezados
     ## Hito N: título. Las tareas sueltas, sin hito propio, viven en
     la sección ## General, que precede a los hitos.
     El índice solo contiene trabajo activo: los hitos completados se eliminan.
     Al final del archivo, la sección ## Propuestas en revisión lista las
     propuestas del flujo de idea a tarea con el marcador [p].
-->


## General
```

El `NNN` del comentario es el ancho de la numeración (tres letras `N`) y las etiquetas de estado van en minúsculas.
