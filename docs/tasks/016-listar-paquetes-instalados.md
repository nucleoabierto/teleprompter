# Listar los paquetes instalados

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Una consulta del CLI muestra los paquetes instalados en el repositorio
destino —nombre, versión, fecha de instalación y recursos escritos—
leyendo el registro, en lenguaje de producto y sin que el usuario abra
`teleprompter-lock.json`.

## Dependencias

- Ninguna.

## Entrada

- La gramática del CLI en `src/cli.js` y el patrón de consulta sobre el
  directorio de trabajo que la tarea 015 introdujo con `guide` (D011).
- `readLock` en `src/lock.js` y el contrato del registro en
  `docs/instalador.md` («El registro»).
- La suite de consulta en `test/cli.test.js` como modelo de pruebas.

## Resultado esperado

- `teleprompter list` (o el nombre que la planeación fije) muestra una
  entrada por paquete instalado con nombre, versión, fecha y recursos
  registrados; sin opciones ni argumento de destino.
- Sin instalaciones registradas, la respuesta lo dice en lugar de
  fallar ni quedar vacía; un registro corrupto se trata como el resto
  de lecturas del lock.
- `docs/instalador.md`, `README.md`, `manual/` y el dominio de
  instalación reflejan la consulta.

## Criterios de calidad

- La consulta responde nombre, versión, fecha y recursos por paquete
  sin exponer hashes ni acciones internas.
- El comportamiento no depende del origen con que se instaló (remoto o
  `--path`): lee solo el registro del directorio de trabajo.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Fijar en la planeación el nombre del comando, su gramática y el
   formato de salida, coherentes con `guide`.
2. Implementar la consulta leyendo el registro.
3. Extender la suite: listado con uno y varios paquetes, destino sin
   instalaciones, registro corrupto, rechazo de opciones y argumentos.
4. Actualizar la documentación del producto y del contrato.

## Notas

- El campo `personalization` del registro puede señalarse por paquete
  si aporta al usuario saber que hay guía consultable; lo decide la
  planeación.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
