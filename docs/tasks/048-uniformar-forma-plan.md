# Uniformar la forma del plan entre constructores

## Estado

[x] Completada

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

## Contexto

- Hallazgo H2 de la revisión 004: `buildPlan` emite
  `{mkdirs, resources, conflicts}`; `buildUpdatePlan` añade
  `upToDate` y `retired`; `buildUninstallPlan` emite `retired` sin
  `upToDate`. Los consumidores normalizan con `?? []`.
- Constructores (`src/plan.js`): `buildPlan` retorna en 43-47;
  `buildUpdatePlan` en 91-93 (cortocircuito `upToDate: true`) y
  189-195; `buildUninstallPlan` en 241-246.
- Consumidores que normalizan: `printPlan` en
  `src/report.js:7` — `[...plan.resources, ...(plan.retired ?? [])]`—
  y `executePlan` en `src/execute.js:80` —mismo patrón—.
  `plan.upToDate` solo se lee en `runUpdate`
  (`src/commands.js:384`), que solo recibe planes de
  `buildUpdatePlan`.
- Tests acoplados a la forma: `test/plan.test.js:612` compara el
  plan `upToDate` completo (ya emite los cinco campos);
  `test/plan.test.js:1019` compara el plan de retirada completo
  —recibirá el campo nuevo—. Ningún test compara la forma de
  `buildPlan`.
- Dominio: `docs/domains/002-instalacion.md` declara hoy tres
  entidades —`Plan`, `UpdatePlan`, `UninstallPlan`— con formas
  distintas; la forma uniforme queda declarada por el sensor de
  cierre.

## Conectividad

Verificada durante la recolección: constructores, consumidores con
`??`, el lector único de `upToDate` y los tests acoplados
confirmados contra el código real. Veredicto: **conectada**.

## Plan técnico

- [x] `buildPlan` emite `upToDate: false` y `retired: []`.
- [x] `buildUninstallPlan` emite `upToDate: false`.
- [x] `buildUpdatePlan` ya cumple; sus literales quedan en el orden
  canónico `{upToDate, mkdirs, resources, conflicts, retired}`.
- [x] Retirar `?? []` de `printPlan` (`src/report.js:7`) y
  `executePlan` (`src/execute.js:80`).
- [x] Correr la suite completa y confirmar el 100 % de cobertura
  en `src/`.

## Desviaciones

- Los fixtures de `test/execute.test.js` que construyen planes
  literales recibieron `retired: []` —la forma declarada exige que
  los planes construidos a mano la cumplan; sin efecto observable—.
- Se añadió el caso «the three plan builders emit the same field
  set» y `buildPlan` al import de `plan.test.js` —materializa la
  verificación de uniformidad prevista en la suite esperada—.

## Decisiones

- `upToDate` va siempre presente con valor neutro `false`: el
  criterio «mismo conjunto de campos» queda verificable
  mecánicamente y `false` es honesto —el cortocircuito por versión
  ya instalada no se pregunta en instalar ni en retirar—. La
  alternativa (`upToDate` solo en update) dejaría conjuntos
  distintos.

## Suite de pruebas esperada

- Regresión completa en verde; `test/plan.test.js:1019` recibe
  `upToDate: false` en su `deepEqual` —declaración de la forma
  nueva, no cambio de comportamiento—.
- Cobertura 100 % en `src/` —los campos nuevos son literales en
  devoluciones ya ejercitadas—.
- La uniformidad queda como expectativa ejecutable: caso que
  compara el conjunto de campos de los tres planes.

## Revisión

- Subagente: 2026-10-26 — Aprueba
- Usuario (ejecución): 2026-10-26 — Aprueba
- Usuario (cierre): 2026-10-26 — Aprueba
