# Uniformar la forma del plan entre constructores

## Estado

[~] En progreso

## Tipo

mantenimiento (refactoring)

## Objetivo

Los tres constructores de plan devuelven la misma forma —
`buildPlan` no emite `retired` ni `upToDate`, `buildUpdatePlan`
sí ambos y `buildUninstallPlan` emite `retired` sin
`upToDate`— de modo que ningún consumidor normalice campos
estructurales con `??` y la entidad Plan del dominio tenga una
forma declarada.

## Dependencias

- Ninguna.

## Entrada

- `docs/architecture-reviews/004-arquitectura-general.md` —
  hallazgo H2.
- `src/plan.js` — `buildPlan` (42-46), `buildUpdatePlan`
  (194-201), `buildUninstallPlan` (246-251).
- `src/cli.js:258` y `src/execute.js:80` — los `?? []` que hoy
  toleran la heterogeneidad.
- `docs/domains/002-instalacion.md` — la entidad Plan donde la
  forma queda declarada (el sensor de dominio actualiza si hace
  falta).

## Resultado esperado

- Los tres constructores emiten los mismos campos; `upToDate`
  queda solo donde el concepto existe, o siempre presente con
  valor neutro —la decisión se documenta en el plan de la tarea—.
- Ningún consumidor usa `??` para campos estructurales del plan.

## Criterios de calidad

- Forma uniforme verificable: los tres constructores devuelven el
  mismo conjunto de campos.
- Comportamiento observable idéntico.
- `npm test` en verde con el 100 % de cobertura exigido en `src/`.

## Procedimiento sugerido

1. Decidir la forma canónica (campos siempre presentes).
2. Uniformar los tres constructores.
3. Retirar los `??` de los consumidores.
4. Correr la suite.

## Notas

- Derivada de la revisión de arquitectura
  (`docs/architecture-reviews/004-arquitectura-general.md`).

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
