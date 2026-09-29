# Formato de paquete de Teleprompter

Define la estructura de un directorio de paquete y el contrato de su
manifiesto. Es la definición interna del formato: deriva de la
investigación de formatos existentes
(`docs/research/2026-09-formatos-manifiesto.md`, citada como «rec. N»)
y sirve de base a la especificación para mantenedores
(`docs/especificacion-paquete.md`), la cara externa autocontenida del
mismo contrato. Cada campo lleva su razón de ser entre paréntesis.

## Unidad de empaquetado

- **Un paquete es un directorio** que contiene un manifiesto
  `teleprompter.json` en su raíz (rec. 4).
- **Un repositorio puede contener un paquete o varios.** Solo hay un
  nombre de archivo que buscar: `teleprompter.json`. Su campo
  `collection` discrimina qué describe:
  - `collection` ausente o `false`: el manifiesto describe un paquete.
  - `collection: true`: el manifiesto describe una colección que lista
    paquetes por ruta (véase «Manifiesto de colección»).
  - Un directorio es una cosa o la otra: la colección es un contenedor
    puro, no es instalable como paquete.
- El paquete es la unidad atómica: tiene identidad y versión propias;
  la colección solo indexa (rec. 3 y 4).

## Estructura del directorio de paquete

```text
mi-paquete/
├── teleprompter.json    # manifiesto (obligatorio)
└── <recursos>           # cualquier archivo o subdirectorio
```

No hay disposición fija para los recursos: el paquete es un directorio
arbitrario cuyos contenidos se instalan donde el mapa de instalación
indique. Las instrucciones de personalización, si existen, son un archivo
o directorio más del paquete; el manifiesto declara su ubicación (rec. 6
y 7).

## Contrato del manifiesto

`teleprompter.json` es JSON puro, sin ejecutar nada (rec. 1). Los campos
siguientes describen un paquete; con `collection: true` el archivo es un
manifiesto de colección con su propio contrato (véase más abajo).

### Campos obligatorios del paquete

- `name` — identificador del paquete. Minúsculas, números y guiones;
  máx. 64 caracteres; no empieza ni termina en guión; coincide con el
  nombre del directorio del paquete (rec. 2).
- `version` — versión semver `x.y.z` del paquete. La autoridad de la
  versión es el manifiesto, no el VCS (rec. 3).
- `install` — mapa de instalación. Lista de entradas
  `{ "source": "...", "target": "..." }` donde `source` es una ruta
  dentro del paquete —un archivo o un directorio, que se instala con
  todo su contenido— y `target` es la ruta relativa a la raíz del
  repositorio destino donde se instala. Ni `source` ni `target` admiten
  rutas absolutas ni `..`: el primero no puede salir del paquete y el
  segundo no puede salir del repositorio destino. Un paquete sin
  `install` o con la lista vacía es inválido: un paquete que no instala
  nada no es un paquete (rec. 6).

### Campos opcionales

- `description` — descripción corta del paquete (metadato de identidad,
  precedente universal: `description` de npm, SKILL.md y `plugin.json`).
- `license` — identificador SPDX o referencia a un archivo de licencia
  (ídem: `license` de npm, SKILL.md y `plugin.json`).
- `author` — objeto `{ "name": "...", "email": "...", "url": "..." }`;
  solo `name` es obligatorio dentro del objeto (ídem: `author` de npm y
  `plugin.json`).
- `requires` — precondiciones del repositorio destino, verificables antes
  de instalar (rec. 5). De momento solo `paths`: una lista de entradas
  `{ "path": "...", "create"?: bool }` sobre rutas relativas a la raíz del
  destino (`path` no admite rutas absolutas ni `..`). Semántica por
  entrada: si la ruta no existe y `create` es
  `false` o está ausente, la instalación aborta; si `create` es `true`,
  el instalador la crea antes de instalar.
- `personalization` — ruta, dentro del paquete, al archivo o directorio
  con las instrucciones de personalización (rec. 7). Declara que existe
  adaptación pendiente sin definir su contenido. Las instrucciones son
  documentación del paquete: no se instalan salvo que también figuren
  en `install`.
- `metadata` — mapa libre clave → valor para datos del autor que el
  instalador no interpreta (rec. 9).
- `format` — identificador de versión del formato
  (`"teleprompter-package@1"`). Opcional; su ausencia equivale a la
  primera versión del formato (rec. 10).

El contrato se mantiene mínimo a propósito: la distribución de paquetes
está fuera de alcance, así que los metadatos de catálogo (`homepage`,
`repository`, `keywords`) no tienen consumidor todavía, y la
personalización guiada (`inputs`), las precondiciones sobre herramientas
(rangos semver en `requires`) y las dependencias entre paquetes se
añadirán cuando su mecanismo exista.
`metadata` absorbe mientras tanto cualquier dato ad hoc del autor.

### Campos desconocidos

Política mixta (rec. 9):

- Nivel superior del manifiesto (de paquete o de colección): el campo
  se ignora y el validador emite un aviso.
- Dentro de un objeto conocido (`author`, `requires`, una entrada de
  `requires.paths`, una entrada de `install`, una entrada de `packages`
  en el manifiesto de colección): el campo desconocido es un error y el
  paquete o la colección no se consideran válidos.

## Manifiesto de colección

Un `teleprompter.json` con `"collection": true` describe una colección.
Sus campos son `name`, `description`, `license`, `author`, `metadata`,
`format` —con la misma semántica que en un paquete, salvo `name`, que
en una colección es cosmético y no debe coincidir con el directorio—
más:

- `collection` — booleano, obligatorio y `true`. Es el discriminador.
- `packages` — lista obligatoria de entradas `{ "path": "..." }` con la
  ruta relativa al directorio de cada paquete; `path` no admite rutas
  absolutas ni `..`. La entrada solo declara la ruta: `name` y `version`
  se leen del manifiesto de cada paquete, sin duplicarlos en el índice
  (rec. 4).

Los campos propios de paquete (`version`, `install`, `requires`,
`personalization`) no aplican a una colección: su presencia es un error.

## Ejemplo

```json
{
  "format": "teleprompter-package@1",
  "name": "ciclo-tareas",
  "version": "1.0.0",
  "description": "Skills del ciclo de tareas del proyecto",
  "license": "MIT",
  "install": [
    {
      "source": "skills/crear-tareas/",
      "target": ".agents/skills/crear-tareas/"
    },
    {
      "source": "skills/ejecutar-tareas/",
      "target": ".agents/skills/ejecutar-tareas/"
    }
  ],
  "requires": {
    "paths": [{ "path": ".agents/skills/", "create": true }]
  },
  "personalization": "PERSONALIZE.md",
  "metadata": { "origin": "teleprompter" }
}
```
