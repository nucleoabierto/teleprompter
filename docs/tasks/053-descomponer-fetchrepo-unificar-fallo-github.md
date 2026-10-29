# Descomponer fetchRepoTree y unificar el fallo de GitHub

## Estado

[x] Completada

## Tipo

mantenimiento (refactoring)

## Objetivo

Dividir `fetchRepoTree` —89 líneas que ejecutan cinco fases en
secuencia y repiten `cleanup()` en cinco puntos de retorno— en
operaciones por fase, y centralizar el vocabulario
status→mensaje que `resolveCommit` y la descarga reescriben como
ternarios anidados.

## Dependencias

- Ninguna.

## Entrada

- `src/fetch.js`: `resolveCommit` (60-94), `fetchRepoTree`
  (105-193) y los dos ternarios de clasificación
  (`fetch.js:78-81` y `154-159`).
- `docs/architecture-reviews/005-complejidad-interna.md` —
  hallazgos H1 y H2, agrupados porque reescriben las mismas
  líneas—.

## Resultado esperado

- Un clasificador compartido del fallo de GitHub —función o
  tabla— consumido por `resolveCommit` y por la descarga.
- `fetchRepoTree` como composición legible de sus fases —
  temporal, commit, descarga con *fallback*, límites y cuerpo,
  extracción— con una sola disciplina de limpieza.

## Criterios de calidad

- Mensajes, orden de intentos entre endpoints y semántica de
  limpieza idénticos —incluida la agregación de statuses—.
- `npm test` en verde con el 100 % de cobertura en `src/`.
- El vocabulario de fallo existe una sola vez.

## Procedimiento sugerido

1. Extraer el clasificador status→mensaje y consumirlo en ambos
   sitios.
2. Extraer la descarga con *fallback* y la extracción como
   operaciones propias.
3. Unificar la disciplina de `cleanup` y correr la suite.

## Notas

- La agregación difiere entre sitios —un endpoint vs. dos,
  404/422—: el clasificador compartido debe respetar las reglas
  de cada uno, no forzar una única.

## Contexto

- **Archivos similares:** `src/fetch.js` mismo —sus helpers
  pequeños (`isFullSha`, `isAbort`, `specLabel`, `repoUrls`)
  son el modelo de extracción—; `src/verify.js` y
  `src/paths.js` (`resolveRecordedPath`) como referencia del
  idioma de resultado discriminado de la capa.
- **Patrones:** el módulo habla `{ ok: true, … }` /
  `{ ok: false, error }` (D021); los errores se componen
  `${why}: ${specLabel(spec)}`; los comentarios de cabecera
  explican el porqué de cada operación.
- **Dominio:** `docs/domains/002-instalacion.md` —el concepto
  «commit resuelto» ancla en `resolveCommit` y `repoUrls`;
  los símbolos citados deben seguir existiendo con ese nombre—.
- **Producto:** ningún documento aplica —el comportamiento
  observable (mensajes, resultados) es invariante por
  definición de la tarea—.
- **PRD:** el hito 2 no tiene PRD —saneamiento sin
  comportamiento nuevo—.
- **Lecciones:** ninguna aplica —los disparadores del índice
  no cubren `src/fetch.js` ni esta clase de refactor—.
- **Decisiones:** D021 —la capa de fetch conserva su idioma
  `{ ok, error }`; la extracción no unifica ni cambia
  resultados—.
- **Suite:** `test/fetch.test.js` ejerce cada rama de
  clasificación —404/422, 401/403, 5xx, timeouts, agregación
  de dos endpoints— e importa solo `parseRepoSpec` y
  `fetchRepoTree`: la superficie pública a conservar.

## Conectividad

Verificada durante la recolección: los dos ternarios de
clasificación (`fetch.js:78-81`, `154-159`), las cinco fases de
`fetchRepoTree` y los cinco puntos de `cleanup` existen tal como
la tarea los describe; `specLabel` e `isAbort` ya son
primitivas compartidas internas; la suite
(`test/fetch.test.js`, 27 casos) ejerce cada rama de
clasificación incluida la agregación de endpoints; la
superficie pública es `parseRepoSpec`, `fetchRepoTree`,
`specLabel` e `isValidRef`. Veredicto: **conectada**.

## Plan técnico

- [x] Extraer el vocabulario del fallo de GitHub: constantes de
  mensaje compartidas, dos clasificadores de guardas planas —
  `statusWhy(s)` (un status) y `statusesWhy(statuses)`
  (agregación)— y el helper del mensaje de timeout.
  - Aporta: «por qué falló GitHub» evoluciona en un solo lugar;
    la anidación de ternarios desaparece.
  - Contexto: la precedencia difiere por diseño —en la
    agregación un 5xx domina sobre not-found y «no encontrado»
    exige que todos respondan 404; los tests lo fijan—.
- [x] Consumir los clasificadores en `resolveCommit` y en el
  fallo de descarga.
  - Aporta: ambos sitios producen el vocabulario desde la misma
    fuente —mensajes idénticos—.
- [x] Extraer `downloadArchive` —el bucle de endpoints con
  *fallback*, la clasificación agregada y las dos comprobaciones
  de tamaño— devolviendo `{ok, body}` o `{ok:false, error}`.
  - Aporta: la fase de descarga queda nombrada; la orquestación
    solo la compone.
- [x] Extraer `extractArchive` —escritura del tarball, `mkdir`,
  `extract`, borrado—.
  - Aporta: la última fase nombrada.
- [x] Unificar la limpieza con un `fail(error)` que llama
  `cleanup()` y devuelve `{ok:false, error}`.
  - Aporta: un solo punto de limpieza en lugar de cinco.
  - Contexto: los errores anteriores al temporal —sin fetch,
    sin dir— no llevan `: specLabel`; los posteriores sí.
    `fail` no añade nada —recibe el error completo—.
- [x] Correr la suite completa y confirmar el 100 % en `src/`.

## Decisiones

- Dos clasificadores separados —`statusWhy`/`statusesWhy`—
  porque las reglas de agregación son propias de cada sitio:
  forzar una única regla cambiaría el diagnóstico.
- `fail` como closure sobre `cleanup` en lugar de
  reestructurar con try/finally: conserva el idioma de retorno
  sin envolturas.

## Desviaciones del plan

- La suite esperada decía «sin casos nuevos»; la extracción de
  `statusesWhy` expuso que el fallback «respuesta inesperada»
  del lado descarga nunca se ejercía —antes vivía en la cola
  del ternario—: se añadió el caso `spyFetch([commitResponse(),
  { ok: false }])` que lo cubre.

## Suite de pruebas esperada

- Regresión completa: los 27 casos de `test/fetch.test.js`
  permanecen en verde sin tocar expectativas —ejercen cada
  clasificación (404/422, 401/403, 5xx, timeouts totales y
  parciales, sin status), los límites de tamaño, el temporal,
  la extracción y la resolución—.
- Cobertura: 100 % en `src/fetch.js` —los clasificadores
  nuevos quedan cubiertos por los tests de diagnóstico
  existentes—.
- Sin casos nuevos: refactor puro.

## Revisión

- Subagente: 2026-10-29 — Aprueba
- Usuario (ejecución): 2026-10-29 — Aprueba
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
