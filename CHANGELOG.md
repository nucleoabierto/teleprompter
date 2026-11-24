# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/en/2.0.0/)
y el proyecto se adhiere a [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `install` instala también las piezas del mismo origen que el manifiesto declara en `dependencies`: el conjunto se resuelve transitivamente dentro del árbol obtenido —existencia, unión de restricciones de versión sobre cada pieza, ciclos con la ruta legible—, se ordena dependencia antes que dependiente y aborta entero sin escribir cuando es irresoluble; el campo admite una lista vacía y hace válido al paquete de composición pura sin `install` (docs/epics/011-dependencias-entre-paquetes.md).
- La entrada de `dependencies` admite `origin` —`{ "repo": "o/r[@ref]" }` o `{ "path": "ruta" }`, relativa al paquete declarante y solo en árboles locales—: el conjunto se resuelve transitivamente a través de todos los orígenes involucrados —cada árbol externo se obtiene antes de verificar y planear, anclado a su commit resuelto—, selecciona miembros de colecciones ajenas por nombre, detecta ciclos que cruzan orígenes y conflictos de identidad nombre×origen, y registra cada unidad con su propio `origin` en el lock, reproducible por `reinstall` (docs/epics/011-dependencias-entre-paquetes.md).
- `reinstall` reinstala todo lo que el registro declara: reobtiene cada paquete anclado al `commit` que su `origin` registró —el árbol exacto que la instalación consumió, con re-resolución del miembro en colecciones—, muestra el plan del conjunto por unidad antes de decidir, resuelve las divergencias con la política compartida (`--force`/`--skip`, interactiva o listado con aborto) y reescribe cada entrada como una instalación —`origin` intacto, `installedAt` renovado—; una unidad ya conforme se anuncia sin acciones y una no reproducible se diagnostica con su motivo, sin escribir nada hasta que el conjunto entero se muestra ejecutable (docs/epics/010-reproduccion-destino.md).

## [0.6.0] - 2026-11-06

### Added

- `outdated [<paquete>]` revisa qué versión publica hoy el origen registrado de cada paquete instalado frente a la instalada —una línea por paquete: `al día`, `desactualizado` con ambas versiones o `no consultable` con el motivo— sin escribir nada; los orígenes que no responden degradan a su línea sin abortar la revisión (docs/epics/009-revision-desactualizados.md).
- `uninstall <paquete>` retira los recursos que un paquete instalado registró, con el plan visible antes de borrar, decisión sobre lo modificado a mano y respaldo en `.teleprompter/backups/` (docs/epics/008-desinstalacion-paquetes.md).

### Fixed

- `update` y `guide` ya no resuelven nombres heredados de `Object.prototype` —`__proto__`, `constructor` y afines— como paquetes instalados: responden «no está instalado», mientras una entrada propia con ese nombre sigue siendo legible (docs/tasks/044-guarda-propiedad-propia-lecturas-lock.md).
- La validación del manifiesto detecta como target duplicado dos entradas que solo difieren en el separador final —`a/` y `a\` canona igual—: la comparación de targets usa ya la misma forma canónica en todo el producto (docs/tasks/045-centralizar-primitivas-compartidas.md).

## [0.5.0] - 2026-10-23

### Added

- El comando `help` y la opción `--help` consultan la ayuda del CLI —la general, con la sinopsis de cada comando, opciones y ejemplos, o la del comando indicado— y la invocación inválida emite ahora esa ayuda estructurada por stderr en lugar de una línea `uso:` monolítica (docs/tasks/039-mejorar-ayuda-cli.md).
- La gestión de conflictos anuncia cada colisión con el diff unificado entre el contenido del destino y el del paquete —antes de la pregunta interactiva y en el listado no interactivo, archivo a archivo cuando el recurso es una carpeta—, y un conflicto resuelto a sobrescribir —en `install` o `update`, incluido un retirado decidido a favor de la versión— conserva el contenido previo en `.teleprompter/backups/<operación>/`, espejo de su ruta, con anuncio `respaldo:` —gestión de conflictos (docs/tasks/040-respaldar-conflictos-sobrescritos.md, docs/tasks/041-mostrar-diff-archivos-conflicto.md).

### Changed

- La obtención remota resuelve la referencia pedida al commit exacto, descarga el árbol de ese commit y lo registra en el origen del lock: la instalación queda anclada a un árbol concreto en lugar de a la rama móvil y su procedencia es consultable —pin de obtención remota (docs/epics/007-pin-de-obtencion-remota.md).

## [0.4.0] - 2026-10-12

### Changed

- La obtención remota tiene presupuestos y diagnósticos propios:
  cada endpoint agota un tiempo máximo (60 s por defecto) y la
  descarga está limitada en tamaño (50 MB), con error específico en
  ambos casos; el mensaje de obtención distingue «no encontrados»
  (404), «error de servidor» (5xx) y «acceso denegado o límite de
  peticiones» (401/403), y un fallo del sistema de archivos al crear
  el directorio temporal deja de propagar como error inesperado.

## [0.3.0] - 2026-10-04

### Added

- `install` acepta repositorios multi-paquete —colecciones—: con
  `--package <nombre>` (repetible) instala los paquetes elegidos del
  índice; sin selección imprime el índice y aborta. Cada paquete
  instalado es una unidad independiente del ciclo de vida y el
  registro guarda su `origin` con el nombre elegido para que
  `update` lo re-resuelva.

## [0.2.1] - 2026-10-04

### Fixed

- `install` y `update` registran en `teleprompter-lock.json` los
  recursos `identical` —ya presentes con el mismo contenido— con su
  acción y su hash, así que `check` y `list` los cubren y dejan de
  quedar desregistrados
  (docs/tasks/030-registrar-targets-identical-en-el-lock.md).
- `update` ya no destruye los hijos entrantes cuando el mapa de
  instalación cambia de granularidad: un target directorio
  registrado que es ancestro de targets de la versión nueva se
  expande en unidades de retirado en lugar de eliminarse entero
  (docs/tasks/029-retiro-directorio-padre-destruye-targets-hijos.md).

## [0.2.0] - 2026-10-02

### Added

- Instalación desde repositorios de GitHub: `install <usuario/repo[@ref]>`.
- Ciclo de vida del paquete instalado: `guide` consulta la guía de
  personalización, `list` lista los paquetes instalados, `check`
  verifica la deriva de los recursos y `update` actualiza desde el
  origen registrado.
- Campo `personalization` del manifiesto: la guía del paquete se copia
  al namespace gestionado `.teleprompter/<paquete>/` y se retira con su
  paquete.
- El registro `teleprompter-lock.json` guarda el `origin` de cada
  instalación (GitHub o ruta local).
- Documentación pública del producto en `manual/`.

## [0.1.1] - 2026-10-02

Primera versión disponible del paquete. Instalador declarativo que lleva
un paquete local (`teleprompter.json` + recursos) a un repositorio
destino:

### Added

- Subcomando `install <paquete> <destino>` para instalar desde ruta
  local.
- Plan de instalación completo calculado antes de escribir, con
  resolución de colisiones vía `--force`/`--skip` y aborto total si el
  plan no es ejecutable.
- Registro de la instalación en `teleprompter-lock.json` con recursos,
  acciones y hashes.
- Especificación pública del formato de paquete y paquete de referencia
  `ciclo-tareas`.

[Unreleased]: https://github.com/nucleoabierto/teleprompter/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/nucleoabierto/teleprompter/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/nucleoabierto/teleprompter/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/nucleoabierto/teleprompter/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/nucleoabierto/teleprompter/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/nucleoabierto/teleprompter/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/nucleoabierto/teleprompter/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/nucleoabierto/teleprompter/releases/tag/v0.1.1
