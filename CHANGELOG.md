# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/en/2.0.0/)
y el proyecto se adhiere a [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

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

[Unreleased]: https://github.com/nucleoabierto/teleprompter/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/nucleoabierto/teleprompter/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/nucleoabierto/teleprompter/releases/tag/v0.1.1
