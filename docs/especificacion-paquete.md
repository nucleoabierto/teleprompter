# Especificación del formato de paquete

Un **paquete** es un directorio de configuración trasladable entre
repositorios: un agente o instalador lo inspecciona, verifica sus
precondiciones y copia sus recursos a las rutas que el manifiesto
declara. Este documento es el contrato completo: quien lo sigue puede
producir un paquete válido sin conocer nada más del sistema.

## Un paquete

Un paquete es un directorio que contiene un manifiesto
`teleprompter.json` en su raíz y cualquier disposición de recursos:

```text
mi-paquete/
├── teleprompter.json    # manifiesto (obligatorio)
└── <recursos>           # archivos y subdirectorios libres
```

No hay disposición fija para los recursos: el manifiesto declara, para
cada origen, dónde se instala en el repositorio destino.

## El manifiesto `teleprompter.json`

El manifiesto es JSON puro: no ejecuta nada. Según el valor del campo
`collection`, el archivo describe un paquete (ausente o `false`) o una
colección (`true`, véase «Colecciones»). Primero el contrato de paquete.

### Campos obligatorios

| Campo | Tipo | Regla |
|---|---|---|
| `name` | string | Identificador del paquete: minúsculas, números y guiones, máx. 64 caracteres, sin guiones al inicio ni al final. Debe coincidir con el nombre del directorio del paquete. |
| `version` | string | Versión semver explícita `x.y.z`. La autoridad de la versión es el manifiesto, no el VCS. |
| `install` | array | Lista no vacía de entradas `{ "source", "target" }`. Véase abajo. Obligatorio salvo que el paquete declare `dependencies` no vacía —un paquete de composición pura no instala recursos propios—. |

Cada entrada de `install` declara una copia:

- `source` — ruta dentro del paquete, relativa a su raíz. Puede ser un
  archivo o un directorio; un directorio se instala con todo su
  contenido.
- `target` — ruta relativa a la raíz del repositorio destino donde se
  instala.

La barra final en `source` y `target` es una convención legible para
marcar directorios, no un requisito del formato.

Ni `source` ni `target` admiten rutas absolutas ni `..`: el origen no
puede salir del paquete y el destino no puede salir del repositorio.
Además, ningún `target` puede ser `teleprompter-lock.json` ni caer
dentro de `.teleprompter/`: son espacios reservados a la herramienta.

### Campos opcionales

| Campo | Tipo | Descripción |
|---|---|---|
| `format` | string | Versión del formato del manifiesto: `"teleprompter-package@1"`. Su ausencia equivale a la primera versión del formato. |
| `description` | string | Descripción corta del paquete. |
| `license` | string | Identificador SPDX (`"MIT"`, `"Apache-2.0"`) o referencia a un archivo de licencia. |
| `author` | object | `{ "name": "...", "email": "...", "url": "..." }`. Solo `name` es obligatorio dentro del objeto. |
| `requires` | object | Precondiciones del repositorio destino, verificables antes de instalar. De momento solo la clave `paths`. |
| `dependencies` | array | Lista —posiblemente vacía— de piezas que completan al paquete, entradas `{ "package", "version"?, "origin"? }`. Véase abajo. |
| `personalization` | string | Ruta dentro del paquete al archivo con las instrucciones de personalización. El archivo debe existir; su contenido es texto libre del mantenedor dirigido a un agente y nunca se valida ni se ejecuta. El instalador lo copia a `.teleprompter/<paquete>/<archivo>` en el destino, entrega su contenido tal cual al final de la instalación y recuerda su ubicación en `teleprompter-lock.json` —consultable después con `teleprompter guide`. |
| `metadata` | object | Mapa libre clave→valor para datos del autor que el instalador no interpreta. |

`requires.paths` es una lista de entradas `{ "path", "create"? }` sobre
rutas relativas a la raíz del destino (`path` no admite rutas absolutas
ni `..`, ni puede caer dentro de `.teleprompter/`):

- Si la ruta no existe y `create` es `false` o está ausente, la
  instalación aborta.
- Si la ruta no existe y `create` es `true`, el instalador la crea
  antes de instalar.

`dependencies` declara las piezas que completan al paquete —una lista
que puede estar vacía: la pieza que no compone nada es la hoja del
grafo—. Cada entrada es un objeto:

- `package` — el nombre de la pieza: un miembro del índice de la
  colección del árbol donde reside, nombrado como en una selección
  `--package`, nunca una ruta. En un origen que no es colección la
  única pieza es el propio paquete, así que `package` debe igualar el
  `name` que su manifiesto declara.
- `version` — opcional; una restricción del vocabulario acotado:
  `^x.y.z`, `~x.y.z`, `x.y.z` exacta, comparadores `>=`, `<=`, `>`, `<`
  —componibles por espacio— o `*`. Su ausencia equivale a cualquier
  versión. La restricción es una aserción: valida la `version` que el
  manifiesto de la pieza obtenida declara; no selecciona entre
  versiones.
- `origin` — opcional; el origen donde reside la pieza, un objeto con
  exactamente una de estas claves:
  - `{ "repo": "owner/repo[@ref]" }` — un repositorio de GitHub, con
    la misma gramática que el argumento posicional de `install`:
    `ref` puede ser rama, etiqueta o commit y admite barras.
  - `{ "path": "ruta" }` — un directorio local, relativo al paquete
    que lo declara. Ata el paquete a una disposición concreta del
    sistema de archivos, así que reduce su portabilidad: es la forma
    de enlazar piezas que aún no se publican, no la de publicar
    paquetes reutilizables. Por eso mismo solo es válida en árboles
    locales: dentro de un árbol obtenido de un repositorio la ruta
    solo podría señalar la extracción efímera —que desaparece tras la
    instalación— y la declaración se rechaza.

  Sin `origin` la entrada nombra una pieza del **mismo árbol** que el
  paquete que la declara —la forma que ya cubre la instalación dentro
  de una colección—. Nombrar el propio origen por `repo` no es lo
  mismo: trae el árbol que esa referencia publica hoy, no el árbol
  servido por la invocación; para depender de una pieza del mismo
  árbol se omite `origin`.

La identidad de una pieza en el grafo es su nombre: entradas que lo
repiten desde el mismo origen se deduplican y unen sus restricciones;
pedir el mismo nombre desde dos orígenes distintos es un conflicto
que aborta el conjunto.

Instalar un paquete instala también su conjunto declarado, resuelto
transitivamente a través de todos los orígenes involucrados: cada
árbol externo se obtiene antes de verificar y planear —el de
`repo` anclado al commit al que la referencia apunta—, las piezas se
ordenan de modo que cada dependencia se instale antes que su
dependiente, las restricciones que varias piezas exigen sobre la
misma pieza deben satisfacerse todas y un ciclo —incluida la
dependencia sobre sí mismo, aunque cruce orígenes—, una pieza
inexistente o inalcanzable, un conflicto de identidad o una versión
insatisfecha abortan la operación antes de escribir nada. Cada pieza
instalada queda en `teleprompter-lock.json` con su propio origen —el
`repo`, `ref` y `commit` resuelto, o la `path` absoluta—, de modo que
`reinstall` la reproduce desde donde realmente vino.

### Campos desconocidos

Política mixta:

- **Nivel superior** del manifiesto (de paquete o de colección): el
  campo desconocido se ignora y el validador emite un aviso.
- **Dentro de un objeto conocido** (`author`, `requires`, una entrada
  de `requires.paths`, una entrada de `install`, una entrada de
  `dependencies`, una entrada de `packages` en una colección): el
  campo desconocido es un error y el manifiesto no es válido.

## Colecciones

Un repositorio puede alojar un paquete o varios. Solo hay un nombre de
archivo que buscar —`teleprompter.json`— y un campo que discrimina qué
describe:

- `collection` ausente o `false` → el manifiesto describe un paquete.
- `collection: true` → el manifiesto describe una **colección**: un
  índice de paquetes por ruta.

Un directorio es una cosa o la otra: la colección es un contenedor
puro, no instalable como paquete. Un manifiesto de colección admite los
campos `name`, `description`, `license`, `author`, `metadata` y
`format` —con la misma semántica que en un paquete, con una excepción:
el `name` de una colección es cosmético y no debe coincidir con el
nombre de ningún directorio— más:

| Campo | Tipo | Regla |
|---|---|---|
| `collection` | boolean | Obligatorio y `true`. Es el discriminador. |
| `packages` | array | Obligatorio. Lista de entradas `{ "path": "..." }` con la ruta relativa al directorio de cada paquete; `path` no admite rutas absolutas ni `..`. |

La entrada solo declara la ruta: el `name` y la `version` de cada
paquete se leen de su propio `teleprompter.json`, nunca del índice.
Los campos propios de paquete (`version`, `install`, `requires`,
`dependencies`, `personalization`) en un manifiesto de colección son
un error.

## Ejemplo completo

Estructura de un paquete con tres recursos:

```text
ciclo-tareas/
├── teleprompter.json
├── PERSONALIZE.md
└── skills/
    ├── crear-tareas/
    ├── ejecutar-tareas/
    └── commit/
```

Su manifiesto:

```json
{
  "format": "teleprompter-package@1",
  "name": "ciclo-tareas",
  "version": "1.0.0",
  "description": "Ciclo de tareas del proyecto: creación, ejecución con revisión dual y commit",
  "license": "MIT",
  "install": [
    {
      "source": "skills/crear-tareas/",
      "target": ".agents/skills/crear-tareas/"
    },
    {
      "source": "skills/ejecutar-tareas/",
      "target": ".agents/skills/ejecutar-tareas/"
    },
    {
      "source": "skills/commit/",
      "target": ".agents/skills/commit/"
    }
  ],
  "requires": {
    "paths": [{ "path": ".agents/skills/", "create": true }]
  },
  "personalization": "PERSONALIZE.md",
  "metadata": { "origin": "teleprompter" }
}
```

## Lista de verificación de un paquete válido

1. `teleprompter.json` en la raíz del directorio del paquete, JSON
   válido.
2. `name` en kebab-case, igual al nombre del directorio.
3. `version` semver `x.y.z`.
4. `install` no vacío —o `dependencies` no vacía en su lugar, para un
   paquete de composición pura—; cada entrada tiene solo `source` y
   `target`; cada `source` existe dentro del paquete; ninguna ruta es
   absoluta ni contiene `..`.
5. `source` y `personalization` apuntan dentro del paquete —
   `personalization` a un archivo existente cuyo enlace no resuelve
   fuera del paquete—; `target` y `requires.paths[].path` son relativos
   a la raíz del destino; ninguna de estas rutas es absoluta ni
   contiene `..`, ningún `target` es `teleprompter-lock.json` y nada
   cae dentro de `.teleprompter/`.
6. Los campos opcionales presentes pertenecen al contrato; dentro de
   objetos conocidos no hay campos desconocidos (a nivel superior, un
   campo desconocido solo genera un aviso, no invalida el manifiesto).
7. En una colección: `collection: true`, `packages` con rutas válidas
   y ningún campo propio de paquete.
