# Reutilizar los validadores de manifiesto en la carga de colección

## Estado

[ ] Pendiente

## Tipo

mantenimiento (refactoring)

## Objetivo

`loadCollectionManifest` —60 líneas— reimplementa en línea la
mitad de los validadores del contrato de paquete en lugar de
componer la tabla que `VALIDATORS` ya estructura; hacer los
validadores de campo reutilizables para que ambos contratos los
compongan.

## Dependencias

- Ninguna.

## Entrada

- `src/manifest.js`: `VALIDATORS` (87-205) y
  `loadCollectionManifest` (254-313) —duplica `checkFormat`,
  `checkAuthor`, `checkMetadata` y el par
  `description`/`license`—.
- `docs/architecture-reviews/005-complejidad-interna.md` —
  hallazgo H5—.

## Resultado esperado

- Validadores de campo compartidos que ambas cargas compongan
  —una tabla `COLLECTION_VALIDATORS` o funciones nombradas—;
  la colección declara solo sus diferencias: `collection`
  obligatorio, campos de paquete prohibidos, `name` sin
  comparación de directorio, `packages` propio.

## Criterios de calidad

- Mismos mensajes de error y mismos campos aceptados/rechazados
  por contrato.
- `npm test` en verde con el 100 % de cobertura en `src/`.
- Cada regla compartida existe una sola vez.

## Procedimiento sugerido

1. Extraer los validadores duplicados como funciones nombradas
   reutilizables.
2. Componer la validación de colección con ellos más sus
   reglas propias.
3. Correr la suite.

## Notas

- La 057 consume `isPlainObject` —si esta tarea lo deja
  exportado, la 057 lo reutiliza; si no, cada una lo comparte
  donde tenga sentido—.

## Contexto

- **Archivos similares:** el propio `manifest.js` —la tabla
  `VALIDATORS` ya es el patrón: un validador por campo,
  composición en orden, `errors` como sumidero—;
  `loadCollectionManifest` es la segunda composición del
  mismo patrón.
- **Patrones:** los validadores reciben `(manifest, ctx,
  errors)` y nombran el campo que verifican; el orden de la
  tabla es el orden de los errores —observable—;
  `checkKeys`/`checkRelativePath`/`isPlainObject` ya son
  primitivas compartidas internas.
- **Dominio:** `docs/domains/001-paquete.md` ancla
  `checkName`, `checkCollection`, `checkInstallEntry`,
  `checkRequiresEntry`, `checkPersonalization`,
  `checkInstall`, `checkRelativePath`, `VALIDATORS`,
  `TOP_LEVEL_FIELDS`, `SEMVER_RE`, `NAME_RE`,
  `KNOWN_FORMAT`, `loadManifest` y `loadCollectionManifest`
  —los nombres de los validadores de paquete y de las
  primitivas deben seguir existiendo—.
- **Producto:** ningún documento aplica —mensajes y campos
  aceptados/rechazados invariantes—.
- **PRD:** el hito 2 no tiene PRD.
- **Lecciones:** `revision-tecnica-subagente.md` —el revisor
  debe poder ejecutar comandos—.
- **Decisiones:** ninguna aplica directamente —la carga de
  manifiestos es contrato ya decidido; la tarea no lo toca—.
- **Suite:** `test/manifest.test.js` (84 casos) ejerce cada
  mensaje de ambos contratos —formato, nombre, author,
  metadata, description/license, packages, campos
  prohibidos— y `cli.test.js` lo ejerce por integración.

## Conectividad

Verificada durante la recolección: `loadCollectionManifest`
(`manifest.js:254-313`) duplica en línea `checkFormat`
(88-92), `checkAuthor` (152-163), `checkMetadata` (197-201),
el par `description`/`license` (202-205) y la regla kebab de
`checkName` (98-101) sin la comparación de directorio; sus
reglas propias son `collection === true`, los campos de
paquete prohibidos y `packages`. El orden de emisión de
errores es observable y queda fijado por la suite.
Veredicto: **conectada**.

## Plan técnico

- [x] Promover a funciones nombradas del módulo los
  validadores compartidos: `checkFormat`, `checkAuthor`,
  `checkMetadata` (verbatim), la fábrica
  `checkStringField(field)` y `checkNameShape` —la regla
  kebab sola, sin obligatoriedad ni directorio—.
  - Aporta: cada regla existe una vez con su nombre.
- [x] `checkName` —anclado en dominio— conserva su nombre y
  su orden: obligatorio → `checkNameShape` → coincidencia de
  directorio.
  - Contexto: con nombre ya validado como cadena no vacía,
    `checkNameShape` se reduce al brazo kebab —mensajes
    idénticos—.
- [x] `VALIDATORS` referencia las funciones nombradas en las
  mismas posiciones —orden de errores intacto—;
  `checkCollection`, `checkInstall`, `checkRequires`,
  `checkPersonalization` permanecen en línea.
- [x] `COLLECTION_VALIDATORS` compone en el orden de emisión
  actual: `checkCollectionTrue`, `checkPackageFieldsAbsent`,
  `checkFormat`, `checkNameShape`, `checkPackages`,
  `checkAuthor`, `checkMetadata`, `description`/`license` vía
  `checkStringField`.
- [x] `loadContract(dir, knownFields, validators, ctx)`:
  comparte el esqueleto de carga —`readManifestFile`, avisos
  de campos desconocidos, composición, misma forma de
  resultado—; ambas cargas públicas se reducen a una llamada.
- [x] `PACKAGE_ONLY_FIELDS` derivado como
  `TOP_LEVEL_FIELDS ∖ COLLECTION_FIELDS` en lugar de lista
  escrita a mano.
  - Aporta: declara la regla real —los campos del contrato
    de paquete están prohibidos en colección—; un campo nuevo
    de paquete queda prohibido automáticamente.
- [x] Correr la suite completa y confirmar el 100 % en `src/`.

## Decisiones

- `checkNameShape` recibe firma de validador
  `(manifest, ctx, errors)` —uniformidad con la tabla—.
- `isPlainObject` queda privado —la 057 decidirá dónde
  compartirlo en su propio plan, como permite la nota—.
- Los validadores de colección reciben `{ colDir }` por
  simetría aunque ninguno lo usa.
- La mejora va más allá del traslado mecánico: `loadContract`
  unifica el segundo esqueleto duplicado y la derivación de
  `PACKAGE_ONLY_FIELDS` expresa la regla en lugar de
  enumerarla.

## Suite de pruebas esperada

- Regresión completa: los 84 casos de `test/manifest.test.js`
  —cada mensaje de ambos contratos, incluidos orden y campos
  prohibidos— más la integración, en verde sin tocar
  expectativas.
- Cobertura: 100 % en `src/manifest.js` —cada regla ya tiene
  caso—.
- Sin casos nuevos: refactor puro.

## Revisión

- Subagente: 2026-10-29 — Aprueba
- Usuario (ejecución): 2026-10-29 — Aprueba
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
