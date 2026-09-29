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
| `install` | array | Lista no vacía de entradas `{ "source", "target" }`. Véase abajo. Un paquete sin `install` o con la lista vacía es inválido. |

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

### Campos opcionales

| Campo | Tipo | Descripción |
|---|---|---|
| `format` | string | Versión del formato del manifiesto: `"teleprompter-package@1"`. Su ausencia equivale a la primera versión del formato. |
| `description` | string | Descripción corta del paquete. |
| `license` | string | Identificador SPDX (`"MIT"`, `"Apache-2.0"`) o referencia a un archivo de licencia. |
| `author` | object | `{ "name": "...", "email": "...", "url": "..." }`. Solo `name` es obligatorio dentro del objeto. |
| `requires` | object | Precondiciones del repositorio destino, verificables antes de instalar. De momento solo la clave `paths`. |
| `personalization` | string | Ruta dentro del paquete al archivo o directorio con instrucciones de personalización. Solo declara que existe adaptación pendiente y dónde está documentada; no se instala salvo que también figure en `install`. |
| `metadata` | object | Mapa libre clave→valor para datos del autor que el instalador no interpreta. |

`requires.paths` es una lista de entradas `{ "path", "create"? }` sobre
rutas relativas a la raíz del destino (`path` no admite rutas absolutas
ni `..`):

- Si la ruta no existe y `create` es `false` o está ausente, la
  instalación aborta.
- Si la ruta no existe y `create` es `true`, el instalador la crea
  antes de instalar.

### Campos desconocidos

Política mixta:

- **Nivel superior** del manifiesto (de paquete o de colección): el
  campo desconocido se ignora y el validador emite un aviso.
- **Dentro de un objeto conocido** (`author`, `requires`, una entrada
  de `requires.paths`, una entrada de `install`, una entrada de
  `packages` en una colección): el campo desconocido es un error y el
  manifiesto no es válido.

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
`personalization`) en un manifiesto de colección son un error.

## Ejemplo completo

Estructura de un paquete con tres recursos:

```text
ciclo-tareas/
├── teleprompter.json
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
  "metadata": { "origin": "teleprompter" }
}
```

## Lista de verificación de un paquete válido

1. `teleprompter.json` en la raíz del directorio del paquete, JSON
   válido.
2. `name` en kebab-case, igual al nombre del directorio.
3. `version` semver `x.y.z`.
4. `install` no vacío; cada entrada tiene solo `source` y `target`;
   cada `source` existe dentro del paquete; ninguna ruta es absoluta ni
   contiene `..`.
5. `source` y `personalization` apuntan dentro del paquete; `target` y
   `requires.paths[].path` son relativos a la raíz del destino; ninguna
   de estas rutas es absoluta ni contiene `..`.
6. Los campos opcionales presentes pertenecen al contrato; dentro de
   objetos conocidos no hay campos desconocidos (a nivel superior, un
   campo desconocido solo genera un aviso, no invalida el manifiesto).
7. En una colección: `collection: true`, `packages` con rutas válidas
   y ningún campo propio de paquete.
