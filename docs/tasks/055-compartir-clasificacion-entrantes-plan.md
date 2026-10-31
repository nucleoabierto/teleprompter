# Compartir la clasificación de entrantes entre los constructores de plan

## Estado

[x] En revisión

## Tipo

mantenimiento (refactoring)

## Objetivo

`buildUpdatePlan` —109 líneas, la función más grande de `src/`—
repite en su clasificación de entrantes el esqueleto de
`buildPlan` con otra condición de sobrescritura; extraer el
esqueleto compartido parametrizado por esa regla, y las
retiradas como operación propia.

## Dependencias

- Ninguna.

## Entrada

- `src/plan.js`: `buildPlan` (18-50) y `buildUpdatePlan`
  (90-198) —entrantes 121-140, retiradas 145-190—.
- `docs/architecture-reviews/005-complejidad-interna.md` —
  hallazgo H3—.

## Resultado esperado

- Un clasificador de entrante compartido —ausente →
  `create`/`conflict` con guarda, igual → `identical`,
  registrado-intacto y permitido → clase que sobrescribe, si no
  → `conflict`, con la rebaja por `resolvesUnder`—
  parametrizado por la regla `managed-update`/`update`.
- Las retiradas de `buildUpdatePlan` como operación propia
  (`plannedRemovals` o equivalente).

## Criterios de calidad

- Planes producidos idénticos —marcas `managed-update`/`update`
  conservadas, semántica de `ancestorDrift` y `uncoveredUnits`
  intacta—.
- `npm test` en verde con el 100 % de cobertura en `src/`.
- El esqueleto de clasificación existe una sola vez.

## Procedimiento sugerido

1. Extraer el clasificador compartido y migrar `buildPlan`.
2. Migrar `buildUpdatePlan` y extraer las retiradas.
3. Correr la suite.

## Notas

- La forma compartida exige criterio: la diferencia
  `managed-update`/`update` es vocabulario del dominio, no un
  detalle a borrar.

## Contexto

- **Archivos similares:** `src/drift.js` —sus clasificadores
  (`classifyResource`, `uncoveredUnits`) ya son operaciones
  nombradas que `plan.js` consume—; la tabla `EXECUTE` de la
  054 como precedente reciente de parametrizar la regla que
  cambia.
- **Patrones:** el módulo comenta el porqué de cada marca en
  cabeceras sobre los constructores; las primitivas de rutas
  (`canonTarget`, `hasEntry`, `isWithin`, `resolvesUnder`) se
  importan de `paths.js`; los constructores devuelven la
  misma forma de plan —`upToDate`, `mkdirs`, `resources`,
  `conflicts` por filtro, `retired`—.
- **Dominio:** `docs/domains/002-instalacion.md` ancla
  `buildPlan`, `buildUpdatePlan`, `buildUninstallPlan`,
  `resolveConflicts`, `semverAtLeast` y `recordedHash` —este
  último es el closure interno de `buildUpdatePlan`, debe
  seguir existiendo con ese nombre—;
  `docs/domains/003-registro.md` ancla la expresión
  `recorded.get(target) === destHash` en `plan.js` —la regla
  de propiedad de install, debe conservarse—.
- **Producto:** ningún documento aplica —planes producidos
  idénticos por definición de la tarea—.
- **PRD:** el hito 2 no tiene PRD.
- **Lecciones:** `revision-tecnica-subagente.md` —el revisor
  debe poder ejecutar comandos—.
- **Decisiones:** D005 —el plan decide todo antes de
  escribir—; D015 —update y retirada son operaciones del
  ciclo de vida—.
- **Suite:** `test/plan.test.js` (67 casos) ejerce cada
  marca —`managed-update`, downgrade a conflicto por
  cadena que escapa y por versión, retiradas, unidades
  abandonadas, guía reemplazada—; `test/cli.test.js` lo
  ejerce por integración en update y uninstall.

## Conectividad

Verificada durante la recolección: los dos esqueletos de
clasificación de entrante (`plan.js:27-42` y `:121-140`)
comparten la forma —ausente→`create`/`conflict` con guarda,
igual→`identical`, sobrescritura propia de cada constructor,
rebaja por `resolvesUnder`— y difieren solo en la regla de
sobrescritura y el normalizador de target; el bloque de
retiradas (`:145-190`) es autocontenido salvo `recorded`,
`shipped`, `recordedFiles` y `recordedByTarget`; `classifyRemoval`
ya es operación propia. Los anclas de dominio existen y la suite
cubre cada rama. Veredicto: **conectada**.

## Plan técnico

- [x] `classifyIncoming(ctx, { source, target })` con
  `ctx = { pkgDir, destDir, updatesAllowed, overwrite }`: el
  esqueleto completo una sola vez —ausente→`create`/`conflict`
  con guarda, igual→`identical`, regla de sobrescritura, rebaja
  por `resolvesUnder`; la puerta `updatesAllowed` va en el
  esqueleto—. `overwrite({ target, destHash, pkgHash })`
  devuelve la marca o `undefined` → `conflict`.
  - Aporta: «cómo se clasifica un entrante» existe una vez;
    cada constructor declara solo su vocabulario.
- [x] `buildPlan` declara `overwrite`:
  `recorded.get(path.normalize(target)) === destHash ? 'managed-update' : undefined`
  —conserva el ancla y su normalizador—.
- [x] `buildUpdatePlan` declara `overwrite`: `recHash` vía
  `recordedHash(canonTarget(target), destHash)` —el closure
  nombrado que el dominio ancla— y devuelve `'update'` si
  `destHash === recHash && pkgHash !== recHash`.
  - Contexto: `recHash` pasa a evaluación perezosa —solo
    cuando `destHash !== pkgHash`—; lecturas puras, plan
    idéntico.
- [x] `plannedRemovals(destDir, manifest, record, shipped,
  recordedFiles, recordedByTarget)` →
  `{ retired, removalConflicts }`: mueve `guideTarget`,
  `replacedGuide`, `shippedArr`, `recordedTargets`, el
  `flatMap` y el reparto `retire`/conflicto; el constructor
  hace `resources.push(...removalConflicts)` preservando el
  orden.
  - Aporta: `buildUpdatePlan` baja a ~50 líneas y las
    retiradas se leen como operación propia.
- [x] Repartir los comentarios de cabecera con su código.
- [x] Correr la suite completa y confirmar el 100 % en `src/`.

## Decisiones

- La diferencia `managed-update`/`update` queda como regla
  parametrizada —vocabulario del dominio, no se unifica—.
- `path.normalize` vs `canonTarget` permanecen por
  llamante —normalizadores distintos, no se tocan—.
- `plannedRemovals` recibe los mapas ya construidos en vez de
  reconstruirlos.
- `updatesAllowed` vive en el esqueleto —en ambos originales
  precede a la regla y solo a ella—.

## Suite de pruebas esperada

- Regresión completa: los 67 casos de `test/plan.test.js`
  —managed-update, downgrades por versión y por escape,
  retiradas intactas/divergentes/ausentes, unidades
  abandonadas, guía reemplazada— más la integración en
  `cli.test.js`, en verde sin tocar expectativas.
- Cobertura: 100 % en `src/plan.js` —cada rama del esqueleto
  y de las retiradas ya tiene caso—.
- Sin casos nuevos: refactor puro.

## Desviaciones

- La suite ganó un caso —`update plan marks update on a
  nested child the version changed under an intact tree`—:
  la evaluación perezosa de `recHash` dejó de consultar
  `recordedHash` para entradas `identical`, y el brazo
  `continue` —saltar directorios intermedios no registrados—
  solo se ejercía por ese camino incidental. El caso nuevo lo
  ejerce por el camino real: un hijo anidado que la versión
  cambia bajo un árbol registrado intacto.

## Revisión

- Subagente: 2026-10-29 — Aprueba
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
