# Nombrar los predicados de la forma del lock

## Estado

[x] Completada

## Tipo

mantenimiento (refactoring)

## Objetivo

`isValidLock` e `isValidOrigin` apilan condiciones en predicados
anidados y reimplementan la triple comprobación de objeto plano
cuatro veces; compartir `isPlainObject` y dar a cada forma su
predicado nombrado.

## Dependencias

- 056 —comparte la primitiva `isPlainObject`, que hoy vive
  privada en `src/manifest.js:29`; ejecutarla después evita
  decidir su hogar dos veces—.

## Entrada

- `src/lock.js`: `isValidLock` (50-64) e `isValidOrigin`
  (71-82).
- `src/manifest.js:29` —`isPlainObject` privada—.
- `docs/architecture-reviews/005-complejidad-interna.md` —
  hallazgo H6—.

## Resultado esperado

- `isPlainObject` compartido entre `lock.js` y `manifest.js`
  —hogar a decidir en el plan: exportarlo del módulo de
  manifiesto o un hogar de primitivas—.
- Predicados por forma: `isValidPackageEntry`,
  `isValidFileEntry` —la validación se lee como el contrato
  que declara—.

## Criterios de calidad

- El lock acepta y rechaza exactamente lo mismo —es dato no
  confiable, ningún cambio de criterio—.
- `npm test` en verde con el 100 % de cobertura en `src/`.
- La triple comprobación de objeto existe una sola vez.

## Procedimiento sugerido

1. Compartir `isPlainObject`.
2. Extraer los predicados por forma dentro de `isValidLock` e
   `isValidOrigin`.
3. Correr la suite.

## Notas

## Contexto

- **Archivos similares:** `src/paths.js` —el hogar de
  primitivas compartidas ya existente, pero acotado a rutas
  y sistema de archivos—; `src/manifest.js` ya consume la
  triple comprobación vía `isPlainObject` privada.
- **Patrones:** los predicados del lock devuelven booleano
  —a diferencia de los validadores del manifiesto, que
  emiten errores—; las tablas de despacho del código son
  `VALIDATORS` (manifest) y `EXECUTE` (execute, con
  `__proto__: null` por la lección de la 054: una tabla
  normal hereda `Object.prototype` y una clave ajena no cae
  al *fallback*).
- **Dominio:** `docs/domains/003-registro.md` ancla
  `readLock`, `isValidLock`, `writeLock`, `lockEntry`,
  `lockEntries` e `isWritten` en `src/lock.js` —nombres que
  deben seguir existiendo—; el documento fija que el lock
  es dato no confiable, claves incluidas.
- **Producto:** ningún documento aplica —el lock acepta y
  rechaza exactamente lo mismo—.
- **PRD:** el hito 2 no tiene PRD.
- **Lecciones:** `revision-tecnica-subagente.md` —el
  revisor debe poder ejecutar comandos—; la lección
  aplicada de la 054 —tabla de despacho sin prototipo—.
- **Decisiones:** D007 —el lock es la forma autoritativa
  del registro; la tarea no la toca—.
- **Suite:** `test/lock.test.js` ejerce `readLock`/`lockEntry`/
  `lockEntries`/`writeLock` incluidos los casos de claves
  heredadas y `__proto__` propia; `cli.test.js:1256` ejerce
  diez formas de `origin` malformado —tipo desconocido,
  repo/ref/commit/path/package mal tipados— y cada forma
  válida por integración.

## Conectividad

Verificada durante la recolección: la triple comprobación de
objeto plano se reimplementa cinco veces en `src/lock.js`
—`data`, `packages`, cada entrada `p`, cada archivo `f` y
`origin`— y una sexta en `collection.js:13` sin el rechazo
de arrays; el par `(v === undefined || typeof v ===
'string')` se repite cuatro veces en `isValidOrigin` más
una en la entrada de archivo. El hallazgo H6 de la revisión
005 corresponde a este estado. Veredicto: **conectada**.

## Plan técnico

- [x] `src/shape.js` —hogar nuevo de primitivas de forma de
  valor, precedente `paths.js`—: exporta `isPlainObject` e
  `isOptionalString`. `manifest.js` y `collection.js` la
  consumen —esta última elimina la sexta reimplementación,
  equivalente porque un array nunca lleva
  `collection === true`—.
- [x] Predicados por forma en `lock.js`: `isValidFileEntry`,
  `isValidPackageEntry` y `isValidLock` compuesta —la
  validación se lee como el contrato—. `isPlainObject`
  endurece el rechazo de arrays con propiedades forjadas
  —inalcanzable vía `JSON.parse`, endurecimiento sano—.
- [x] `ORIGIN_SHAPES` —tabla de despacho por `type` con
  `__proto__: null`, lección de la 054— más
  `isValidOrigin` orquestador (`isPlainObject` +
  `isOptionalString(o.package)` + despacho con *fallback*
  `false`).
- [x] Correr la suite completa y confirmar el 100 % en
  `src/`.

## Suite de pruebas esperada

- Regresión completa: `test/lock.test.js` y los diez
  orígenes malformados más las formas válidas de
  `cli.test.js`, en verde sin tocar expectativas.
- Cobertura 100 % en `src/` —`{type:'desconocido'}` ya
  ejerce el *fallback* de la tabla—.
- Sin casos nuevos: refactor puro.

## Desviaciones

- La revisión técnica encontró que el despacho por tabla
  coacciona la clave: `type: ['github']` se aceptaba donde
  la igualdad estricta original lo rechazaba —alcanzable
  vía JSON—. Corregido exigiendo `typeof o.type ===
  'string'` antes del despacho, y la suite ganó ese caso en
  el array de orígenes malformados de `cli.test.js` —la
  rama de la guarda no tenía cobertura previa—.

## Revisión

- Subagente: 2026-10-29 — Aprueba
- Usuario (ejecución): 2026-10-29 — Aprueba
- Usuario (cierre): 2026-10-29 — Aprueba
