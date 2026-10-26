# Reglas del archivo de tarea

Reglas del artefacto «archivo de tarea»: su formato, su lectura tolerante, su escritura canónica y las operaciones del catálogo. Las mecánicas de este documento (`## Estado`, secciones, `## Revisión`) son las mismas que rigen las propuestas y las épicas; los documentos `propuesta.md` y `epica.md` de este mismo directorio declaran solo lo que difiere. Hogar: `actualizar-artefactos`; lo consume también `consultar-artefactos` por referencia cruzada: `../actualizar-artefactos/references/tarea.md`.

## Ubicación y literales

- Un archivo por tarea en `docs/tasks/`, nombrado `NNN-slug.md` —serie continua: el mayor `NNN` de los archivos del directorio, más uno, a tres dígitos—.
- Los literales de este documento llevan los valores por defecto de la convención; un proyecto que difiere los edita aquí.

## Formato del artefacto

Un documento Markdown con título `# ` y secciones `## `. Las secciones relevantes:

- `## Estado`: el estado del documento.
- `## Dependencias`: las tareas de las que depende.
- `## Contexto`, `## Conectividad`, `## Plan técnico`, `## Suite de pruebas esperada`: las secciones de la planeación.
- `## Desviaciones del plan`: cuando existe, inmediatamente antes de `## Revisión`.
- `## Revisión`: los veredictos; es siempre la última sección del archivo.

### `## Estado`

La forma canónica es una sola línea con el estado vigente, sin negritas:

```
[r] En revisión
```

Los juegos de estados válidos son el de las tareas (`Pendiente`, `En progreso`, `En revisión`, `Completada`, `Bloqueada`), el de las propuestas (`Borrador`, `Pendiente de revisión`, `Aprobada`, `Descartada`) y el acumulativo de las épicas (ver `epica.md`).

El marcador corresponde siempre a la etiqueta: ` ` Pendiente, `~` En progreso, `r` En revisión, `x` Completada, `!` Bloqueada y, para las propuestas, ` ` Borrador, `p` Pendiente de revisión, `a` Aprobada, `d` Descartada.

### `## Revisión`

Los veredictos son líneas `- <Autor>: <fecha> — <veredicto>`. La plantilla deja placeholders por actor: `- Subagente: [fecha] — [Aprueba | Solicita cambios]`, `- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]` y `- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]`. Registrar un veredicto rellena el placeholder del mismo autor o añade la línea al final.

### `## Dependencias`

Una viñeta `- <referencia>` por dependencia, o la línea `- Ninguna.` / `- Ninguna` cuando no hay. Las viñetas de checklist `- [·]` no son dependencias.

### `## Plan técnico`

Las acciones del plan son ítems de checklist `- [ ] <acción>` que se marcan `- [x]` al verificarse. La forma histórica aceptada en lectura es la lista numerada `N. <acción>`.

## Lectura tolerante

El `## Estado` admite las variantes históricas además de la canónica:

- **Línea de opciones con la vigente en negrita completa** (la canónica anterior): `[ ] Pendiente | **[~] En progreso** | …`.
- **Línea de opciones con la casilla activa marcada,** sin negrita: `[ ] Pendiente | [x] En progreso | …`.
- **Negrita solo en la etiqueta:** `[ ] **Pendiente** | …`.

El estado lo da siempre la **etiqueta** de la opción vigente, no el marcador: en la convención de casillas, `x` solo señala la opción activa (`[x] En revisión` resuelve `en-revision`, no `completada`).

Las demás secciones se localizan por **prefijo** (una línea que empieza por `## <nombre>` casa la sección aunque el encabezado continúe) y su contenido corre hasta el siguiente `## ` o el fin del archivo. Las excepciones que exigen el encabezado exacto `## <nombre>`: `planeacion`, `añadir-linea`, `marcar-item` y `sustituir-item`, además de la comprobación de duplicado de `insertar-seccion`.

## Escritura canónica

`## Estado` se escribe siempre en la forma canónica (la línea única del estado vigente) aunque la entrada sea una variante histórica. Las secciones nuevas se insertan antes de `## Desviaciones del plan` si existe (salvo que la sección nueva sea esa misma) o, en su defecto, antes de `## Revisión`.

## Operaciones de lectura

Archivo ausente: fallo. Sin resultados: vacío legítimo.

### `estado`

Devuelve el estado canónico (`pendiente`, `en-progreso`, `en-revision`, `completada` o `bloqueada`) resolviendo el `## Estado` con tolerancia:

- La línea de estado es la primera línea no vacía tras el encabezado `## Estado`.
- Sin `|`, forma suelta: la etiqueta es el texto que sigue a la casilla `[·]`, sin negritas ni espacios sobrantes.
- Con `|`: la opción vigente es la única en negrita `**…**`; si ninguna la lleva, la única con casilla no vacía. La etiqueta de esa opción da el estado.
- Sección ausente o vacía, más de una opción activa o etiqueta fuera del juego de las tareas: fallo con diagnóstico.

### `secciones`

El texto de cada encabezado `## ` presente (sin el `## `), una línea por sección en el orden del documento.

### `planeacion`

Cuatro líneas `sección<TAB>presente|ausente` en este orden fijo: `Contexto`, `Conectividad`, `Plan técnico`, `Suite de pruebas esperada`. `presente` exige el encabezado `## <sección>` exacto.

### `dependencias`

Las entradas de `## Dependencias` (hasta el siguiente `## `), una por línea y sin el guion de viñeta; se descartan las viñetas de checklist (`- […]`) y las que empiezan por `Ninguna`. Sin sección o sin entradas: vacío legítimo.

### `checklist`

`marca<TAB>texto` por cada acción de `## Plan técnico`, en el orden en que aparece: en las viñetas `- [·]` la marca es el carácter de la casilla, cualquiera que sea, y el texto lo que sigue; en las listas numeradas históricas `N. texto` la marca es `N`. Sin sección o sin acciones: vacío legítimo.

## Operaciones de escritura

Una mutación que no puede ejecutarse falla sin escribir, con el diagnóstico correspondiente.

### `estado <etiqueta>`

Escribe `## Estado` en forma canónica con el estado `<etiqueta>`: la línea única `[marca] Etiqueta` con el marcador de su etiqueta, sea cual sea la forma de entrada —línea de opciones histórica o forma suelta—.

`## Estado` ausente o vacío, línea de opciones no parseada, forma suelta no reconocida o `<etiqueta>` fuera del juego de opciones: fallo.

### `marcar-opcion <etiqueta>`

Pone `[x]` a la opción `<etiqueta>` de la línea de opciones sin cambiar la marca de las demás (la línea queda escrita sin negritas). Es la forma acumulativa del `## Estado` de las épicas (`[x] Planificada | [x] Completada`). `## Estado` ausente, vacío o en forma suelta: fallo; opción no encontrada: fallo.

### `insertar-seccion <título>`

Inserta `## <título>` seguido del cuerpo dado por el consumidor, antes de `## Desviaciones del plan` si existe (salvo que la sección nueva sea esa misma) o, en su defecto, antes de `## Revisión`. Cuerpo vacío: invocación inválida. La sección ya existe o falta `## Revisión`: fallo.

### `registrar-revision <línea>`

Registra `<línea>` en `## Revisión` con la forma `- <Autor>: <fecha> — <veredicto>` (el `- ` inicial puede omitirse y se añade). Si la sección tiene el placeholder `- <Autor>: [fecha] — …` del mismo autor, se rellena en su lugar; si no, la línea se añade al final de la sección. `<línea>` sin `<Autor>:` reconocible: invocación inválida. `## Revisión` ausente: fallo.

### `añadir-linea <sección> <línea>`

Añade `<línea>` al final de `## <sección>` (coincidencia exacta del título de la sección, sin el `## `). Sección no localizada: fallo.

### `marcar-item <sección> <texto>`

Marca `[x]` todos los ítems `- [ ]` de `## <sección>` que contienen `<texto>`; es idempotente sobre ítems ya marcados. Ningún ítem casado: fallo.

### `sustituir-item <sección> <texto>`

Sustituye el primer ítem `- [·]` de `## <sección>` que contiene `<texto>` (con sus subviñetas, las líneas sangradas que le siguen) por el cuerpo dado por el consumidor. Cuerpo vacío: invocación inválida. Ítem no localizado: fallo.
