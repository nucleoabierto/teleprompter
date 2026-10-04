# Manual de Teleprompter

Documentación de usuario del instalador Teleprompter. Para una primera
instalación, empezar por la guía de uso.

El sitio se construye con [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/):
`pipx install mkdocs-material` y `mkdocs serve` para previsualizarlo o
`mkdocs build --strict` para verificarlo.

## Guías

- [Guía de uso](guia-de-uso.md) — instalar un paquete paso a paso, con
  el paquete de referencia del repositorio como ejemplo.

## Referencia

- [Referencia de `install`](referencia-install.md) — la operación
  completa: fases, marcas del plan, resolución de colisiones, registro
  y códigos de salida.
- [Referencia de `guide`](referencia-guide.md) — consultar las
  instrucciones de personalización de los paquetes instalados.
- [Referencia de `list`](referencia-list.md) — listar los paquetes
  instalados con su versión, fecha y recursos.
- [Referencia de `check`](referencia-check.md) — verificar el estado
  de los recursos instalados: intactos, modificados, ausentes o no
  verificables.
- [Referencia de `update`](referencia-update.md) — actualizar un
  paquete instalado a la versión que publica su origen.

## Funcionalidades

- [001 — Instalar un paquete](001-instalar-un-paquete.md) — qué hace
  `install` y los escenarios que la suite de pruebas verifica.
- [002 — Listar los paquetes instalados](002-listar-paquetes-instalados.md)
  — qué muestra `list` y los escenarios que la suite verifica.
- [003 — Verificar el estado de los recursos instalados](003-verificar-recursos-instalados.md)
  — qué informa `check` y los escenarios que la suite verifica.
- [004 — Actualizar un paquete](004-actualizar-un-paquete.md) — qué
  hace `update` y los escenarios que la suite verifica.

## Documentos relacionados

- [docs/domains/](../docs/domains/README.md) — el modelo del producto:
  qué es un paquete y qué es una instalación.
- [docs/especificacion-paquete.md](../docs/especificacion-paquete.md) —
  cómo escribir el manifiesto `teleprompter.json` de un paquete propio.
