# Teleprompter

Instalador de paquetes de configuración para repositorios.

Teleprompter lleva un paquete —un directorio con un manifiesto
`teleprompter.json` y sus recursos— a un repositorio con trabajo
previo: calcula el plan completo antes de escribir nada, resuelve las
colisiones con lo que ya existe y registra la instalación en
`teleprompter-lock.json`.

## Empieza aquí

- [Guía de uso](guia-de-uso.md) — instalar un paquete paso a paso, con
  el paquete de referencia del repositorio como ejemplo.
- [Referencia de `install`](referencia-install.md) — la operación
  completa: fases, marcas del plan, resolución de colisiones, registro
  y códigos de salida.
- [Referencia de `guide`](referencia-guide.md) — consultar las
  instrucciones de personalización de los paquetes instalados.
- [Referencia de `list`](referencia-list.md) — listar los paquetes
  instalados con su versión, fecha y recursos.
- [Referencia de `check`](referencia-check.md) — verificar el estado
  de los recursos instalados.
- [Referencia de `update`](referencia-update.md) — actualizar un
  paquete instalado a la versión que publica su origen.
- [Instalar un paquete](001-instalar-un-paquete.md) — la funcionalidad
  y los escenarios que la suite de pruebas verifica.
- [Listar los paquetes instalados](002-listar-paquetes-instalados.md)
  — la consulta del registro y los escenarios que la suite verifica.
- [Verificar el estado de los recursos instalados](003-verificar-recursos-instalados.md)
  — la verificación de la instalación y los escenarios que la suite
  verifica.
- [Actualizar un paquete](004-actualizar-un-paquete.md) — la
  actualización consciente de la deriva y los escenarios que la
  suite verifica.

## En el repositorio

- [Especificación del formato de paquete](https://github.com/nucleoabierto/teleprompter/blob/master/docs/especificacion-paquete.md)
  — cómo escribir el manifiesto `teleprompter.json` de un paquete
  propio.
- [Documentación de dominio](https://github.com/nucleoabierto/teleprompter/tree/master/docs/domains)
  — el modelo del producto: qué es un paquete y qué es una instalación.
