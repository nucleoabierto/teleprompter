# Sondear la versión publicada de un origen

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Dado un `source` —repositorio remoto o directorio local—, saber
la versión del paquete que publica sin instalar nada: la que su
`teleprompter.json` declara hoy, incluido el caso de que el origen
sea una colección y el paquete un miembro seleccionado.

## Dependencias

- Ninguna.

## Entrada

- `src/fetch.js`: `fetchRepoTree` (200) —la obtención remota
  completa ya pinnea el commit—.
- `src/commands.js`: `resolveMembers`/`selectUnits` —la
  selección de miembro dentro de un árbol obtenido—.
- `src/manifest.js`: `loadManifest`; `src/collection.js`:
  `isCollectionDir`.
- La traducción `origin`→`source` que la 058 extrajo como
  `sourceOf` —el sondeo recibe el `source` ya resuelto—.

## Resultado esperado

- Una operación de la capa de obtención —`publishedVersion(source,
  io)` o equivalente— que devuelve la versión publicada o el
  fallo, con el idioma de resultado de su capa (D021).
- Cubre los tres orígenes posibles del registro: repositorio
  GitHub, directorio local y —en ambos— colección con miembro
  nombrado.

## Criterios de calidad

- No escribe en el destino ni deja temporales sin limpiar —la
  obtención remota aterriza en temporal y se libera siempre—.
- Un manifiesto remoto malformado o un miembro ausente de la
  colección es un fallo de sondeo, no una excepción.
- `npm test` en verde con el 100 % de cobertura en `src/`.

## Procedimiento sugerido

1. Reutilizar `fetchRepoTree` para el origen remoto —la
   obtención ligera del solo manifiesto queda fuera de alcance
   de la propuesta— y la lectura directa para el local.
2. Componer sobre ella la resolución de unidad —paquete o
   miembro de colección— y la lectura de `version` del
   manifiesto resultante.
3. Correr la suite.

## Contexto

- **Archivos similares:** `src/commands.js` —`obtainPackage`
  (29) ya compone fuente→árbol con `cleanup` y `resolveMembers`/
  `selectUnits` la selección de miembro con reporte; el sondeo
  es la misma composición pero silenciosa y sin instalar—.
- **Patrones:** la capa de obtención devuelve `{ ok: true, … }`
  / `{ ok: false, error }` (D021); los módulos no imprimen
  —quien invoca reporta—.
- **Dominio:** `docs/domains/002-instalacion.md` ancla
  `fetchRepoTree`, `resolveSelection`, `loadManifest` —todos
  se conservan—.
- **Producto:** el PRD 009 fija CU-3 —la versión publicada es
  la misma que una actualización obtendría del mismo origen—.
- **PRD:** `docs/prd/009-revision-desactualizados.md`.
- **Lecciones:** `revision-tecnica-subagente.md` —el revisor
  debe poder ejecutar comandos—.
- **Decisiones:** D021 —idioma de resultado por capa—; D019 —
  el miembro grabado re-resuelve por el índice del árbol
  obtenido—.
- **Suite:** `test/fetch.test.js` ejerce la obtención con
  `spyFetch`; el módulo nuevo necesita casos propios para el
  100 % —fuente local, colección local, remota simple,
  colección remota, manifiesto malformado, miembro ausente y
  limpieza del temporal—.

## Conectividad

Verificada durante la recolección: `obtainPackage`
(`commands.js:29`) compone `source`→`{pkgDir, cleanup, commit}`
reutilizando `fetchRepoTree`; `resolveSelection`
(`collection.js`) es el resolvedor puro del miembro;
`loadManifest` da la `version`. El sondeo es esa composición
sin reporte ni ejecución —no existe hoy como operación
propia—. Veredicto: **conectada**.

## Plan técnico

- [x] `src/probe.js` —módulo nuevo de la capa de obtención,
  idioma `{ ok: true, version }` / `{ ok: false, error }`—
  exporta `publishedVersion(io, source, member)`: `path`
  lee el directorio; `repo` pasa por `fetchRepoTree` con
  `finally` liberando el temporal; colección resuelve el
  miembro vía `resolveSelection`; `loadManifest` da la
  versión o el fallo.
- [x] Errores propagados del `error` de la capa que los
  produce, sin re-etiquetar; `probe.js` no imprime ni toca
  el destino.
- [x] `test/probe.test.js` con los casos declarados y la
  suite completa al 100 %.

## Suite de pruebas esperada

- Casos nuevos: path simple, path colección, repo simple,
  repo colección, manifiesto malformado, miembro ausente,
  colección sin `member`, fallo de obtención con temporal
  liberado.
- Regresión completa en verde —módulo sin consumidores aún—.
- Cobertura 100 % en `src/`.

## Notas

- El mecanismo deliberado es la obtención completa ya existente:
  es la misma fuente que `install`/`update` consultan, así que la
  versión reportada es exactamente la que una actualización
  obtendría —la optimización ligera quedó fuera de alcance—.

## Revisión

- Subagente: 2026-11-03 — Aprueba
- Usuario (ejecución): 2026-11-03 — Aprueba
- Usuario (cierre): 2026-11-03 — Aprueba
