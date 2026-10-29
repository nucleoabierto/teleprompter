# Declarar la forma de ejecución sin lado paquete

## Estado

[x] Completada

## Tipo

mantenimiento (refactoring)

## Objetivo

`executePlan` deja de exigir un `pkgDir` que los planes de
retirada no tienen: la firma declara explícitamente si el plan
tiene lado paquete —parámetro opcional, forma `{ src, dest }` o
vía propia— de modo que un plan de solo retirada no necesite el
truco de pasar `destDir` dos veces.

## Dependencias

- Ninguna.

## Entrada

- `docs/architecture-reviews/004-arquitectura-general.md` —
  hallazgo H5.
- `src/execute.js:69` — firma actual `executePlan(pkgDir,
  destDir, plan, backupRoot)`; las entradas `removal` nunca llevan
  `source`.
- `src/cli.js:730-732` — `runUninstall` pasa `destDir` como
  `pkgDir` con un comentario que admite el truco.

## Resultado esperado

- La ejecución declara por su forma si el plan copia desde un
  paquete o no; `runUninstall` no pasa `destDir` dos veces.
- Las defensas de escritura —guarda de escape por cadena,
  respaldo previo— intactas.

## Criterios de calidad

- Un plan de retirada se ejecuta sin argumento de paquete.
- Comportamiento observable idéntico.
- `npm test` en verde con el 100 % de cobertura exigido en `src/`.

## Procedimiento sugerido

1. Elegir la forma —`pkgDir` opcional, objeto de contexto o vías
   separadas— y documentarla en el plan de la tarea.
2. Ajustar `executePlan` y sus dos consumidores.
3. Correr la suite.

## Notas

- Derivada de la revisión de arquitectura
  (`docs/architecture-reviews/004-arquitectura-general.md`).

## Contexto

- Hallazgo H5 de la revisión 004: `executePlan` exige `pkgDir`
  que el plan de retirada no tiene —`runUninstall` pasa `destDir`
  dos veces con un comentario que admite el truco
  (`src/commands.js:436-438`).
- `pkgDir` solo se lee en `src/execute.js:121`
  (`copyResource(path.join(pkgDir, r.source), dest)`): las
  acciones `create`/`overwrite` son las únicas que tocan el lado
  paquete, y las entradas `removal` nunca llevan `source` —un
  plan de retirada nunca alcanza esa línea—.
- Consumidores: `executeAndReport` (`src/commands.js:281`, install
  y update con `pkgDir` real) y `runUninstall`
  (`src/commands.js:438`, el truco). Los tests de
  `execute.test.js` también llaman a `executePlan` directamente.
- `installPersonalization(pkgDir, destDir, manifest)` conserva su
  firma —siempre tiene lado paquete—.
- Estilo del código: funciones con varios argumentos ya usan
  objetos desestructurados —`executeAndReport(out, err,
  { pkgDir, destDir, lock, ... })`, `installUnit(io, out, err,
  { source, unit, ... })`—.

## Conectividad

Verificada durante la recolección: único punto de uso de `pkgDir`
localizado, ambos consumidores leídos, invariante «acciones de
copia ⇒ lado paquete» confirmada por construcción de los
constructores (`buildUninstallPlan` nunca emite `create`/
`overwrite`). Veredicto: **conectada**.

## Plan técnico

- [x] Firma `executePlan({ src, dest }, plan, backupRoot = null)`;
  el cuerpo lee `path.join(src, r.source)` en la copia.
- [x] `executeAndReport` pasa `{ src: pkgDir, dest: destDir }`.
- [x] `runUninstall` pasa `{ dest: destDir }` y pierde el
  comentario del truco.
- [x] Migrar los llamadores de `test/execute.test.js`.
- [x] Correr la suite completa y confirmar el 100 % de cobertura
  en `src/`.

## Desviaciones

- El test «executePlan refuses a conflict left without
  resolution» perdió su fixture `pkg` al quedar sin uso —el plan
  aborta antes de cualquier copia—; sin efecto.
- La observación adyacente del revisor —`settleConflicts`
  recibía `destDir` dos veces desde `runUninstall`, mismo patrón
  H5— se resolvió en la misma rama a petición del usuario:
  `pkgDir` pasó a parámetro opcional (`= null`) y el llamador de
  retirada lo omite; `diffResource` ya ignoraba `pkgDir` en
  entradas `removal`, que son las únicas que ese plan produce.

## Decisiones

- Forma `{ src, dest }`: la ausencia de `src` declara el plan sin
  lado paquete; sigue el estilo de objetos desestructurados del
  código (`executeAndReport`, `installUnit`). Descartadas:
  `pkgDir = null` posicional —sigue exigiendo el argumento— y
  vías separadas —duplican el bucle—.
- Sin guarda extra para «copia sin `src`»: estado imposible por
  construcción y el fallo queda en la frontera `ExecutionError`.

## Suite de pruebas esperada

- Regresión completa en verde; solo cambian las llamadas a
  `executePlan` en `execute.test.js`, mismas expectativas.
- Cobertura 100 % en `src/` —la firma nueva no añade ramas—.
- Sin casos nuevos: refactor puro.

## Revisión

- Subagente: 2026-10-26 — Aprueba
- Usuario (ejecución): 2026-10-26 — Aprueba
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
