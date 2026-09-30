# Paquete

## Propósito

El formato declarativo en que se describe una pieza transferible de
configuración —qué contiene, dónde va cada recurso y qué exige el
destino— para que una instalación sea inspectable y repetible.

## Referencia del modelo

- **Lenguaje ubicuo:**
  - **Paquete:** un directorio con un manifiesto `teleprompter.json`
    cuyo `name` coincide con el nombre del directorio.
    - Ancla: `checkName` en `src/manifest.js`; `packages/ciclo-tareas/`
    - Origen: épica `docs/epics/001-formato-paquete.md`
  - **Manifiesto:** el JSON `teleprompter.json` con `name`, `version`,
    `install` obligatorios y `format`, `description`, `license`,
    `author`, `requires`, `personalization`, `metadata`, `collection`
    opcionales.
    - Ancla: `TOP_LEVEL_FIELDS` y `VALIDATORS` en `src/manifest.js`;
      contrato en `docs/especificacion-paquete.md`
  - **Colección:** un manifiesto con `collection: true` describe un
    conjunto de paquetes y no es instalable.
    - Ancla: `checkCollection` en `src/manifest.js`
  - **Entrada install:** par `source` (ruta dentro del paquete que debe
    existir) → `target` (ruta relativa dentro del destino).
    - Ancla: `checkInstallEntry` en `src/manifest.js`
  - **Precondición:** entrada `requires.paths` con `path` obligatorio y
    `create` booleano opcional; `create: true` difiere la creación de
    la ruta al plan en lugar de abortar.
    - Ancla: `checkRequiresEntry` en `src/manifest.js` y
      `checkRequires` en `src/requires.js`
  - **Ruta segura:** ruta relativa sin segmentos `..`, ni absoluta
    POSIX, ni absoluta Windows (`C:\`) ni UNC (`\\`).
    - Ancla: `isSafeRelative` en `src/paths.js`
  - **Guía de personalización:** el archivo que `personalization`
    declara —debe existir dentro del paquete y ser un archivo—; su
    contenido es texto libre del mantenedor dirigido a un agente,
    nunca validado ni ejecutado.
    - Ancla: `checkPersonalization` en `src/manifest.js`; origen:
      épica `docs/epics/003-personalizacion-guiada.md`
- **Entidades / estado:**
  - El paquete es inmutable y sin estado: existe como directorio con
    archivos más su manifiesto. La versión es semver explícita `x.y.z`
    sin prefijos ni rangos.
    - Ancla: `SEMVER_RE` en `src/manifest.js`
- **Invariantes:**
  - Toda ruta del manifiesto es una ruta segura —nada puede escribirse
    fuera de la raíz de destino ni leerse fuera del paquete.
    - Ancla: `checkRelativePath` en `src/manifest.js`
  - `name` es kebab-case, ≤64 caracteres, e igual al directorio que lo
    contiene. Ancla: `NAME_RE` en `src/manifest.js`
  - `install` es una lista no vacía de entradas bien formadas cuyo
    `source` existe. Ancla: `checkInstall` en `src/manifest.js`
  - `format`, si está presente, vale `teleprompter-package@1`.
    Ancla: `KNOWN_FORMAT` en `src/manifest.js`
  - Ningún `target` es `teleprompter-lock.json` ni cae dentro de
    `.teleprompter/`: son espacios reservados a la herramienta.
    Ancla: `checkInstall` en `src/manifest.js`; D010
- **Operaciones:**
  - Cargar y validar el manifiesto de un directorio de paquete:
    `loadManifest` en `src/manifest.js` —devuelve errores, avisos y el
    manifiesto; nunca lanza.

## Explicación del dominio

- **Fronteras:**
  - Dentro: la forma del manifiesto, la seguridad de rutas y las
    precondiciones declaradas.
  - Fuera: qué se hace con un paquete válido (dominio de instalación)
    y el contenido de las instrucciones de personalización, que el
    formato solo referencia.
  - Relaciones: la instalación consume el resultado de la validación
    del paquete sin revalidarlo.
- **Decisiones relevantes:**
  - `docs/decisions/D001–D004` — manifiesto JSON puro, cardinalidad,
    semver explícita, mapa `install`.
  - `docs/decisions/D010` — `.teleprompter/` como namespace gestionado
    para la guía de personalización.

## Estado de salud

- Última revisión: 2026-09-29
- Divergencias conocidas: Ninguna
