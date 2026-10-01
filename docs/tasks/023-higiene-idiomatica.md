# Higiene idiomática: error de ejecución tipado y nits

## Estado

[ ] Pendiente

## Tipo

mantenimiento (refactoring)

## Objetivo

Tres puntos menores de idiomatismo JavaScript detectados en la
revisión 002: `executePlan` anexa `error.applied` sobre cualquier
error capturado —incluidos errores de `fs`— para transportar las
acciones ya aplicadas; `isDir` hace `existsSync`+`statSync` (doble
syscall y ventana TOCTOU); y `manifest.js` escribe un `.some()`
como `seen.has([...seen].find(...))`. Poner cada uno en su forma
idiomática sin cambiar comportamiento.

## Dependencias

- 021 (toca las mismas zonas de `cli.js`/`execute.js`; conviene
  ejecutar después para no reescribir código movido)

## Entrada

- `src/execute.js` (catch de `executePlan`, línea ~84)
- `src/cli.js` (`isDir`, línea ~406; lectura de `error.applied`,
  líneas ~388 y ~541)
- `src/manifest.js` (línea ~132)
- `docs/architecture-reviews/002-instalacion-tras-el-ciclo-de-vida.md`
  — hallazgos H8 y H9

## Resultado esperado

- Un tipo propio para el fallo de ejecución —p. ej.
  `class ExecutionError extends Error` con `applied` y `cause`— o un
  contrato equivalente declarado, sustituyendo la mutación del error.
- `isDir` como `try { return fs.statSync(p).isDirectory() } catch {
  return false }`.
- La comprobación de target anidado como `.some()` (o equivalente
  legible).
- Misma API pública y mismo comportamiento observable.

## Criterios de calidad

- `npm test` verde sin tocar aserciones existentes; se permiten
  pruebas nuevas para el tipo de error.
- `error.applied` ya no aparece; el contrato del error de ejecución
  es explícito.
- Cobertura 100 % mantenida.

## Procedimiento sugerido

1. Introducir el error tipado en `execute.js` y adaptar los dos
   lectores de `cli.js`.
2. Reescribir `isDir` y la comprobación de `manifest.js`.
3. Verificar suite y cobertura.

## Notas

- Si 021 cambia la forma del bloque de ejecución, esta tarea se
  adapta a lo que quede —los tres puntos son independientes entre sí.

## Revisión

- Subagente: — 
- Usuario: — 
