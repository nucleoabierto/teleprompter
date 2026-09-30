# Registrar el origen de la instalación en el registro

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

El registro recuerda de dónde vino cada instalación —el repositorio
`user/repo` con el ref usado o la ruta local de `--path`— para que
una operación posterior pueda reobtener el paquete sin pedir el
origen de nuevo.

## Dependencias

- Ninguna.

## Entrada

- `writeLock` y `readLock` en `src/lock.js`, el contrato del registro
  en `docs/instalador.md` («El registro») y la decisión D007 que lo
  fija.
- Las formas de origen que `install` ya acepta: `user/repo[@ref]` y
  `--path` (`src/cli.js`, `src/fetch.js`).

## Resultado esperado

- Cada entrada de paquete del registro registra su origen de
  instalación en un formato documentado: repositorio remoto con su
  ref, o ruta local.
- El campo es parte del contrato del lock documentado en
  `docs/instalador.md`; registros escritos antes de este cambio —sin
  origen— siguen siendo válidos y se tratan como «origen
  desconocido».
- La validación del lock (`isValidLock`) admite el campo sin exigirlo
  en entradas antiguas.

## Criterios de calidad

- Una instalación remota registra `user/repo` y el ref efectivo; una
  instalación `--path` registra la ruta.
- Los locks anteriores sin el campo no se consideran corruptos ni
  pierden sus entradas.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Definir en la planeación la forma del campo `origin` (o el nombre
   que se fije) y documentarlo en el contrato del registro.
2. Extender `writeLock` para persistirlo y `isValidLock` para
   admitirlo como opcional.
3. Extender la suite: instalación remota con y sin ref, instalación
   local, lock preexistente sin origen.
4. Actualizar la documentación del contrato.

## Notas

- Extender el contrato del registro es una consecuencia de D007 que
  puede merecer su propio registro de decisión; lo evalúa la
  revisión de la tarea.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
