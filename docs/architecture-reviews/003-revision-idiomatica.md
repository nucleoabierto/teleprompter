# Revisión idiomática del código

- **Fecha:** 2026-10-26
- **Dominio evaluado:** `src/` completo (14 módulos, ~2 650
  líneas) —foco en mejoras idiomáticas de JavaScript/Node y
  consistencia de primitivas—.
- **Intención declarada:** `docs/domains/001-paquete.md` y
  `docs/domains/002-instalacion.md` —módulos funcionales, datos en
  estructuras planas, defensas en el lector—.
- **Decisiones respetadas:** D005, D006, D007, D014, D015, D019.
- **Alcance:** la rúbrica excluye smells de implementación, así que
  esta revisión los evalúa con criterios idiomáticos propios:
  consistencia de primitivas compartidas, duplicación, idioma del
  lenguaje y estilo del proyecto.

## Veredicto por criterio

| Criterio | Veredicto | Evidencia | Confianza |
|----------|-----------|-----------|-----------|
| Primitivas compartidas | Mejorable | la misma micro-lógica se reimplementa en varios módulos con variantes divergentes (H1, H2) | alta |
| Duplicación | Mejorable | tres pares de bloques idénticos en `cli.js` y en `manifest.js` (H3–H6) | alta |
| Idioma JavaScript/Node | Correcto | `Object.hasOwn`, `??`, discriminados `{ ok, reason }`, `for…of`, `Map`/`Set` usados con propiedad | alta |
| Estilo del proyecto | Correcto | comentarios que explican el porqué, verbosidad deliberada homogénea, sin fuga de convenciones | alta |
| Resultados y errores | Mejorable | varios idiomas de fallo coexisten (reportado en la revisión 004, fuera de foco idiomático puro) | media |

## Hallazgos

### H1 — Tres validaciones de forma semver divergentes

- **Criterio o patrón:** primitivas compartidas — el mismo concepto
  («forma semver») se evalúa con tres regex de exigencia distinta.
- **Evidencia:** `SEMVER_RE` estricta
  (`0|[1-9]\d*`) en `src/manifest.js:7`; `^(\d+)\.(\d+)\.(\d+)$` en
  `semverAtLeast` (`src/plan.js:267`) y
  `/^\d+\.\d+\.\d+$/` en `backupName` (`src/cli.js:526`).
- **Objetivo:** una sola primitiva de «forma semver» compartida;
  el manifiesto conserva su exigencia adicional donde el contrato
  la declare, pero los lectores de dato no confiable usan la misma
  forma en todos los sitios.
- **Restricciones:** la validación del manifiesto (contrato del
  paquete) puede quedar más estricta que la de datos leídos; no
  cambiar el comportamiento observable.
- **Validación:** los tres sitios llaman a la misma primitiva;
  la suite sigue en verde.
- **Confianza:** alta.
- **Derivado en:** docs/tasks/045-centralizar-primitivas-compartidas.md

### H2 — Canonicalización de targets reimplementada con variantes

- **Criterio o patrón:** primitivas compartidas — `normalize` +
  quitar separadores finales vive en cuatro sitios, y una de las
  copias diverge: `src/manifest.js:121` quita solo `/` mientras el
  resto quita `[/\\]` (`src/plan.js:91`, `src/paths.js:76-77`,
  `src/diff.js:234`).
- **Evidencia:** `canon` en `src/plan.js:91`; literales repetidos
  en `src/paths.js:isWithin`, `src/diff.js:safeCollect` y
  `src/cli.js` (normalización del target en `diffResource`,
  `src/diff.js:270`); la variante de `manifest.js` no cubre el
  separador de Windows.
- **Objetivo:** una función `canonTarget` (o equivalente) en
  `src/paths.js` —el hogar de las primitivas de ruta— usada por
  todos los consumidores, con la forma `[/\\]` uniforme.
- **Restricciones:** mismo resultado por plataforma; sin cambios
  de comportamiento.
- **Validación:** un solo punto de canonicalización; suite en
  verde, incluido un target con `\` final en la validación del
  manifiesto si el idioma lo permite.
- **Confianza:** alta.
- **Derivado en:** docs/tasks/045-centralizar-primitivas-compartidas.md

### H3 — `new Set` construido por iteración en el validador de colección

- **Criterio o patrón:** idioma/estilo — `checkKeys(entry,
  new Set(['path']), …)` se evalúa una vez por entrada en
  `src/manifest.js:282`, cuando `OBJECT_KEYS` existe justo para
  conjuntos reutilizables.
- **Evidencia:** `src/manifest.js:15-20` declara `OBJECT_KEYS` con
  `author`, `requires`, `requiresPath`, `installEntry`;
  `packagesEntry` no se declaró.
- **Objetivo:** `OBJECT_KEYS.packagesEntry` siguiendo el patrón
  declarado y la llamada referenciándolo.
- **Restricciones:** ninguna.
- **Validación:** suite en verde; sin asignación por iteración.
- **Confianza:** alta.
- **Derivado en:** docs/tasks/045-centralizar-primitivas-compartidas.md

### H4 — Bucle de avisos duplicado en cada comando

- **Criterio o patrón:** duplicación — `for (const warning of
  X.warnings) out(`aviso: ${warning}`)` aparece nueve veces en
  `src/cli.js` (avisos del lock en 289, 341, 379, 592, 706, 830;
  de colección en 640 y 791; de verificación en 416).
- **Evidencia:** las líneas citadas.
- **Objetivo:** un helper de presentación
  (`reportWarnings(out, warnings)` o equivalente) que concentre el
  idioma `aviso:`.
- **Restricciones:** mismo texto y orden de emisión.
- **Validación:** nueve sitios → una llamada cada uno; suite en
  verde.
- **Confianza:** alta.
- **Derivado en:** docs/tasks/046-extraer-informes-y-predicados-cli.md

### H5 — Informe de fallo de ejecución duplicado

- **Criterio o patrón:** duplicación — el bloque `catch` de
  `executeAndReport` (`src/cli.js:565-573`) y el de `runUninstall`
  (`src/cli.js:734-741`) son el mismo algoritmo: acciones ya
  aplicadas, `respaldo:` si lo hubo y `error de ejecución` con
  código 3.
- **Evidencia:** ambos bloques, línea a línea equivalentes.
- **Objetivo:** un helper `reportExecutionFailure(out, err, …)`
  —o que `runUninstall` consuma el mismo informe que
  `executeAndReport`— con un solo lugar donde evolucione el
  formato del fallo.
- **Restricciones:** el informe de `uninstall` debe seguir
  reportando el respaldo ya hecho; mismos mensajes.
- **Validación:** un solo bloque; suite en verde (los tests de
  fallo a mitad de ejecución lo cubren).
- **Confianza:** alta.
- **Derivado en:** docs/tasks/046-extraer-informes-y-predicados-cli.md

### H6 — Predicados de dominio reescritos en cada consumidor

- **Criterio o patrón:** primitivas compartidas — dos conceptos
  del dominio se reescriben como literales:
  «el plan respalda algo» (`plan.conflicts.some((r) =>
  r.resolution === 'overwrite')` en `src/cli.js:503, 549, 725`) y
  «el registro escribió el recurso» (`f.action !== 'skip'` en
  `src/cli.js:356, 389` y `src/plan.js:160, 240`, con dos grafías:
  `!==` y `=== … continue/return []`).
- **Evidencia:** las líneas citadas.
- **Objetivo:** predicados nombrados —`needsBackup(plan)` en el
  ámbito del plan, `wroteFile`/`isWritten` en el del registro—
  que den hogar al concepto.
- **Restricciones:** mismas condiciones; sin cambios de
  comportamiento.
- **Validación:** cada concepto evaluado en un solo sitio; suite
  en verde.
- **Confianza:** media-alta —la ubicación del predicado de
  respaldo (cli vs plan) merece criterio en la implementación—.
- **Derivado en:** docs/tasks/046-extraer-informes-y-predicados-cli.md

### H7 — `specLabel` reimplementado en la capa de invocación

- **Criterio o patrón:** duplicación — `src/fetch.js:51` exporta
  el formato `owner/name@ref`, pero `obtainPackage`
  (`src/cli.js:403`) lo reescribe inline.
- **Evidencia:** ambas líneas.
- **Objetivo:** el mensaje de obtención usa la misma primitiva que
  los diagnósticos de fetch —o se justifica por qué difiere—.
- **Restricciones:** mismo texto observable.
- **Validación:** una sola forma del rótulo; suite en verde.
- **Confianza:** alta.
- **Derivado en:** docs/tasks/045-centralizar-primitivas-compartidas.md

## Observaciones menores

- `ACTION.conflict = null` como centinela (`src/execute.js:24`)
  apoya la resolución por `??`: funciona porque el vocabulario de
  resolución (`overwrite`/`skip`) coincide con el de acciones; el
  comentario lo declara. No es defecto, pero si el vocabulario
  diverge algún día la costura falla en silencio —un mapeo
  explícito sería más resistente—.
- El campo del plan se llama `retired` mientras el estado del
  recurso es `retire`: adjetivo y verbo para el mismo concepto.
- `EMPTY()` en `src/lock.js:7` se usa una vez; el literal se
  repite en otros puntos del mismo archivo —unificar o eliminar
  el helper.
