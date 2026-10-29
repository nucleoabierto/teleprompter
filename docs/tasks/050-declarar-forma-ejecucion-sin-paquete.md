# Declarar la forma de ejecución sin lado paquete

## Estado

[~] En progreso

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

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
