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
- [Instalar un paquete](001-instalar-un-paquete.md) — la funcionalidad
  y los escenarios que la suite de pruebas verifica.

## En el repositorio

- [Especificación del formato de paquete](https://github.com/nucleoabierto/teleprompter/blob/master/docs/especificacion-paquete.md)
  — cómo escribir el manifiesto `teleprompter.json` de un paquete
  propio.
- [Documentación de dominio](https://github.com/nucleoabierto/teleprompter/tree/master/docs/domains)
  — el modelo del producto: qué es un paquete y qué es una instalación.
