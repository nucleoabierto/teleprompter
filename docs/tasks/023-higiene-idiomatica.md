# Higiene idiomática: error de ejecución tipado y nits

## Estado

[x] Completada

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

## Contexto

- **Archivos similares:**
  - `src/execute.js` — `executePlan` captura cualquier error del
    try y le anexa `applied`; el informe de acciones aplicadas lo
    lee `executeAndReport` en `src/cli.js` (tras 021 hay un solo
    lector, no dos).
  - `src/cli.js` — `isDir` (doble syscall) y el lector de
    `error.applied` dentro del `catch` de `executeAndReport`.
  - `src/manifest.js` — `checkInstall` escribe `.some()` como
    `seen.has([...seen].find(...))` en la detección de targets
    anidados.
  - `test/execute.test.js` — ejerce `executePlan` por importación
    dinámica y afirma mensajes de error con `assert.throws`.
- **Patrones:**
  - Módulos ESM de funciones exportadas; `cli.js` consume el dominio
    por resultados estructurados o errores, nunca por forma interna
    —el error tipado encaja en ese patrón—.
  - Comentarios de bloque en inglés con el porqué; early returns.
  - `npm test` exige cobertura 100 % sobre `src/`.
- **Lecciones:**
  - `docs/lessons/` no existe: ninguna nota aplica.
  - `EXPERIENCIAS.md` (20260930T010326): la revisión técnica se lanza
    con un subagente capaz de ejecutar `git` y `npm test`.
- **Decisiones:**
  - D005 — un plan no ejecutable aborta sin escribir; el informe de
    acciones aplicadas existe para hacer visible el estado parcial
    cuando la ejecución misma falla, no el plan.
  - H8/H9 de la revisión 002 son la entrada completa: los tres puntos
    son independientes entre sí.

## Conectividad

**Veredicto: conectada.**

Los tres puntos existen donde la revisión los ubicó y ninguno
presupone infraestructura nueva: `execute.js` posee el throw,
`cli.js` el único lector de `error.applied` (tras 021) y `isDir`, y
`manifest.js` la comprobación. La suite ya ejerce todos los caminos
afectados —informe de acciones aplicadas, rutas no directorio,
targets anidados—, así que la invariancia queda cubierta.

## Plan técnico

**Subsistema.** Tres puntos de idiomatismo independientes: (a)
`executePlan` muta el error capturado (`error.applied = applied`)
para transportar las acciones ya aplicadas, y `executeAndReport` lo
lee —estado comunicado mutando un `Error` ajeno—; (b) `isDir` en
`cli.js` hace `existsSync`+`statSync` —doble syscall y ventana
TOCTOU—; (c) `manifest.js` escribe un `.some()` como
`seen.has([...seen].find(...))`.

- [x] Introducir `ExecutionError extends Error` en `src/execute.js`
  —constructor `(applied, cause)` con `super(cause.message,
  { cause })` y `this.applied`—, envolver en él cualquier error que
  `executePlan` capture y adaptar `executeAndReport` a
  `error instanceof ExecutionError ? error.applied : actions`
  - Aporta: el contrato «el fallo de ejecución lleva lo ya aplicado»
    queda declarado en un tipo propio y `error.applied` desaparece
  - Contexto: el mensaje queda `cause.message`, así que
    `assert.throws` por regex y «error de ejecución: …» no cambian;
    el fallback a `actions` cubre los fallos posteriores a
    `executePlan` (`installPersonalization`, `writeLock`) igual que
    hoy
- [x] Reescribir `isDir` como `try { return fs.statSync(p).isDirectory() } catch { return false }`
  - Aporta: una sola syscall y sin ventana TOCTOU
- [x] Reescribir la comprobación de target anidado como
  `[...seen].some((o) => t.startsWith(`${o}/`))`
  - Aporta: la forma idiomática dice lo que hace
- [x] Añadir una prueba en `test/execute.test.js` que fije el
  contrato: el error lanzado por `executePlan` es `ExecutionError` y
  lleva `applied` y `cause`
  - Aporta: documenta el tipo nuevo; las aserciones existentes no se
    tocan

## Suite de pruebas esperada

Casos de uso: (1) un plan que falla a mitad de ejecución informa de
lo ya aplicado, (2) la invocación exige directorios, (3) el
manifiesto detecta targets duplicados, anidados y reservados.

- Regresión: el informe de acciones aplicadas ante fallo, las rutas
  no directorio y los targets duplicados/anidados/reservados —la
  suite existente los cubre, sin anotar letra— casos 1, 2 y 3.
- El fallo de ejecución produce un error tipado que transporta las
  acciones aplicadas y la causa original (I) — caso 1.

## Desviaciones del plan

Sin desviaciones. La prueba nueva usa un conflicto sin resolver como
segundo recurso —fallo determinista tras una acción aplicada— en
lugar de un archivo de solo lectura, que `copyOver` borra antes de
copiar y por tanto no falla.

## Revisión

- Subagente: 2026-10-01 — Aprueba
- Usuario: 2026-10-01 — Aprueba
