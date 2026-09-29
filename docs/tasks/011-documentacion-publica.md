# Generar la documentación pública del producto

## Estado

[ ] Pendiente

## Tipo

documentación

## Objetivo

Producir la documentación orientada al usuario del producto —el
`README.md` del repositorio y la documentación de producto en su
directorio propio— para que un usuario nuevo pueda instalar y usar el
instalador sin leer el código ni la documentación de proceso.

## Dependencias

- 006 (contrato del instalador).
- 008, 009, 010 (implementación).
- 007 (validación de extremo a extremo).

## Entrada

- El comportamiento implementado y verificado por las tareas 008–010:
  `install <paquete> <destino>` con `--force`/`--skip`/`--dry-run`,
  plan inspeccionable, política de colisiones y registro
  `teleprompter-lock.json`.
- El contrato en `docs/instalador.md` y el formato en
  `docs/formato-paquete.md` y `docs/especificacion-paquete.md`.
- El skill `documentar-producto`, que define la estructura del
  directorio de documentación de producto (índice, guías, referencia,
  un documento por funcionalidad, escenarios anclados a la suite).

## Resultado esperado

- `README.md` en la raíz, publicable con el paquete npm: qué es
  Teleprompter, instalación por `npx @nucleoabierto/teleprompter`,
  uso del comando `install` con sus opciones y códigos de salida, y
  enlace a la documentación completa.
- El directorio de documentación de producto según la estructura de
  `documentar-producto` (ubicación decidida en la tarea, separada de
  `docs/`): índice navegable, guía de uso de `install` y referencia
  de la operación (marcas del plan, resolución de colisiones,
  registro, códigos de salida), con los escenarios anclados a
  `test/`.

## Criterios de calidad

- Un usuario nuevo puede instalar y ejecutar el instalador guiándose
  solo por el README.
- La documentación de producto describe el comportamiento que el
  contrato y la suite verifican; nada documenta comportamiento
  inexistente ni funcionalidad fuera de alcance (update, uninstall,
  distribución).
- El README queda incluido en el paquete publicable (`files` de
  `package.json`).

## Procedimiento sugerido

1. Redactar `README.md` a partir del contrato y del uso real del CLI.
2. Crear el directorio de documentación de producto con su índice,
   guía de uso y referencia, anclando los escenarios a la suite.
3. Verificar que cada afirmación de la documentación corresponde a
   comportamiento probado y que el README está en `files`.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
