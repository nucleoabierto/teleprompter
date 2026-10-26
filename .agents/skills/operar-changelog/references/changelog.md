# Reglas del changelog

Reglas del artefacto «changelog»: el registro de versiones del proyecto en formato Keep a Changelog. Hogar y único consumidor: `operar-changelog`.

## Ubicación y literales

- El changelog es `CHANGELOG.md` en la raíz del repositorio del proyecto evaluado.
- Los literales llevan los valores por defecto de la convención; un proyecto que difiere los edita aquí.

## Formato del artefacto

Formato Keep a Changelog:

- `## [Unreleased]` acumula las entradas no liberadas bajo encabezados `### <Categoría>`.
- Las categorías son las seis fijas, en este orden canónico: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
- Una liberación es la sección `## [X.Y.Z] - <fecha>`; una versión retirada lleva ` [YANKED]` al final de su encabezado.
- Las líneas `[<ref>]: <url>` del pie son los enlaces comparativos: `[Unreleased]:`, `[X.Y.Z]:`.
- Las entradas son viñetas `- ` dentro de cada `###`; un cambio que rompe compatibilidad lleva `**Breaking:**` en su línea.

Un changelog recién creado usa esta plantilla:

```markdown
# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/en/2.0.0/)
y el proyecto se adhiere a [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

## Lectura tolerante

El lector tolera el archivo real: changelog con otro nombre, sin sección de no liberados, sin enlaces de pie. La sección de no liberados corre desde `## [Unreleased]` hasta el siguiente `## ` o la primera línea de enlace `[<ref>]:`. El vacío (sección presente sin entradas) es un resultado legítimo, distinto de la ausencia de sección.

## Escritura canónica

Toda escritura produce la forma fija: las seis categorías en su orden canónico, `## [X.Y.Z] - <fecha del día>` al promover, una línea en blanco separando secciones. La mutación es atómica: el archivo se escribe completo o no se toca.

## Operaciones

Una operación que no puede ejecutarse falla sin escribir, con su diagnóstico. Tres situaciones se distinguen siempre: el archivo ausente (fallo en las lecturas, creación en `anotar`), la sección de no liberados ausente o vacía donde la operación la exige (el «nada que liberar» distinguible, equivalente al código de salida `3` del script) y el vacío legítimo como resultado.

### `localizar <directorio>`

Devuelve la ruta del changelog hallado bajo `<directorio>`: primero la ruta de la convención, después las alternativas del formato: `CHANGELOG.md`, `CHANGELOG.txt`, `CHANGELOG.rst`, `CHANGELOG.markdown`, `CHANGELOG`, `Changelog.md`, `changelog.md`, `HISTORY.md`, `HISTORY.txt`, `HISTORY`, `NEWS.md`, `NEWS.txt`, `NEWS` y otras formas comunes, incluidas las variantes en mayúsculas. Sin ninguno: vacío legítimo. Directorio ausente: fallo.

### `volcar`

Devuelve el cuerpo de la sección de no liberados (sus `###` y entradas) recortando las líneas en blanco del principio y del final. Sección vacía: vacío legítimo. Sin sección de no liberados: «nada que liberar». Changelog ausente: fallo.

### `buscar <término>`

Devuelve las líneas de entrada `- ` de los no liberados que contienen la subcadena `<término>` (la referencia al artefacto de una agrupación identifica su entrada); la búsqueda es sensible a mayúsculas. Sin resultados: vacío legítimo. Mismos fallos que `volcar`.

### `anotar <categoría>`

Añade las líneas de entrada dadas por el consumidor al final de la `### <categoría>` de los no liberados:

- La categoría debe ser una de las seis fijas: otro valor es invocación inválida; cada línea no vacía de la entrada debe ser una viñeta `- ` (una entrada vacía o de otra forma se rechaza sin escribir).
- Si la categoría falta en la sección, se crea su `###` en la posición que le da el orden canónico (antes de la primera categoría de rango posterior, o al final de la sección).
- Si el changelog no existe, se crea con la plantilla (sección de no liberados incluida); si existe pero no tiene sección de no liberados, se abre antes de la primera versión liberada (o de la primera línea de enlace del pie).

### `estado`

Devuelve tres líneas parseables:

- `no-liberados: con-entradas|vacio|ausente` (`vacio` es sin entradas aunque haya `###`).
- `ultima-version: X.Y.Z|ninguna` (el primer `## [<dígito>…]` del documento).
- `enlaces: presentes|ausentes` (presentes cuando el pie mantiene la línea `[Unreleased]:` de enlaces comparativos).

Changelog ausente: fallo.

### `bump`

Devuelve el bump semver que proponen las categorías presentes en los no liberados, más la lista de las presentes en orden canónico:

- `bump: major` ante `**Breaking:**` en alguna línea de entrada o la categoría `Removed`.
- `bump: minor` ante `Added`, `Changed` o `Deprecated`.
- `bump: patch` ante `Fixed` o `Security`.
- `bump: ninguno` si no hay categorías.
- `categorias: <lista separada por espacios>|ninguna`.

La propuesta es la señal fuerte bruta: la convención sobre versiones `0.x` y la interfaz pública del proyecto las interpreta el consumidor. Sin sección de no liberados: «nada que liberar».

### `promover <X.Y.Z>`

Promueve los no liberados a `## [X.Y.Z] - <fecha del día>`:

- Exige que la sección `## [Unreleased]` exista. Lee el cuerpo curado dado por el consumidor (si viene vacío, usa el contenido existente de la sección); el «nada que liberar» se decide sobre el cuerpo efectivo resultante: si no contiene ninguna línea de entrada `- `, la operación no libera. Un `Unreleased` vacío con un cuerpo curado que sí trae entradas promueve con normalidad.
- Escribe el cuerpo bajo la nueva sección de versión, abriendo encima una `## [Unreleased]` vacía.
- Cuando el archivo tiene línea `[Unreleased]:` al pie, la actualiza para comparar la nueva versión con `HEAD` y añade `[X.Y.Z]:` inmediatamente debajo de ella (`compare` contra la versión anterior, o `releases/tag` en la primera liberación) derivando la base de la URL y el prefijo de etiqueta de la línea existente (el patrón `…/compare/<prefijo>X.Y.Z...HEAD`). Si esa línea no casa con el patrón, el pie no se toca y se avisa; sin enlaces, no se crean.
- Versión mal formada (no `X.Y.Z`): invocación inválida. Versión que ya existe como sección: fallo. Sin sección de no liberados: «nada que liberar».
- La mutación es atómica: el archivo se escribe completo o no se toca.

### `yank <X.Y.Z>`

Añade ` [YANKED]` al encabezado de la versión sin tocar nada más del archivo. Versión mal formada: invocación inválida; inexistente: fallo; ya marcada: se reporta y no se reescribe.
