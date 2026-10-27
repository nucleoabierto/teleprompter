# Centralizar primitivas compartidas duplicadas

## Estado

[ ] Pendiente

## Tipo

mantenimiento (refactoring)

## Objetivo

Dar un solo hogar a las primitivas que hoy se reimplementan en
varios módulos —la comprobación de forma semver, la
canonicalización de targets, el conjunto de claves de una entrada
`packages[]` de colección y el rótulo `owner/name@ref`— de modo
que cada concepto se evalúe en un solo sitio y las variantes
divergentes desaparezcan.

## Dependencias

- Ninguna.

## Entrada

- `docs/architecture-reviews/003-revision-idiomatica.md` —
  hallazgos H1, H2, H3 y H7, con evidencia y validación.
- `src/paths.js` — hogar natural de las primitivas de ruta
  (`canonTarget` iría aquí).
- `src/manifest.js` — `SEMVER_RE` estricta y `OBJECT_KEYS`;
  `src/plan.js:267` y `src/cli.js:526` — las otras dos regex
  semver; `src/fetch.js:51` — `specLabel`.
- D021 — los resultados nuevos imitan el idioma de su capa.

## Resultado esperado

- Una primitiva de «forma semver» compartida, usada por
  `manifest.js`, `plan.js` y `cli.js`; la exigencia del contrato
  del manifiesto puede quedar más estricta, pero los lectores de
  dato usan la misma forma.
- Una función de canonicalización de targets
  (`normalize` + quitar `[/\\]` finales) compartida por `plan.js`,
  `paths.js`, `diff.js` y `manifest.js` —la variante que solo
  quita `/` desaparece—.
- `OBJECT_KEYS.packagesEntry` declarado y usado en
  `loadCollectionManifest`.
- `obtainPackage` reutiliza el rótulo de `fetch.js`.

## Criterios de calidad

- Cada concepto se evalúa en un solo sitio; ninguna copia queda.
- Comportamiento observable idéntico —mismos mensajes y códigos—.
- `npm test` en verde con el 100 % de cobertura exigido en `src/`.

## Procedimiento sugerido

1. Diseñar la primitiva semver compartida y sustituir las tres
   regex.
2. Crear la canonicalización en `paths.js` y sustituir las cuatro
   copias.
3. Declarar `packagesEntry` y usarlo.
4. Reutilizar el rótulo compartido en `obtainPackage`.
5. Correr la suite.

## Notas

- Derivada de la revisión idiomática
  (`docs/architecture-reviews/003-revision-idiomatica.md`).

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
