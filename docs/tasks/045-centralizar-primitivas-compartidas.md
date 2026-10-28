# Centralizar primitivas compartidas duplicadas

## Estado

[x] Completada

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

## Contexto

- Archivos similares: `src/paths.js` —hogar de las primitivas de
  ruta exportadas (`isSafeRelative`, `isWithin`,
  `recordedChainSafe`), modelo de dónde vive la
  canonicalización—; `src/manifest.js` —exporta `NAME_RE`,
  precedente de primitiva de forma compartida que `cli.js` ya
  importa, y `OBJECT_KEYS` como patrón de conjuntos de claves
  nombrados—; `src/fetch.js` —`specLabel` con sus consumidores
  internos, modelo de rótulo compartido—.
- Patrones: módulos funcionales con exports nombrados; cada
  primitiva lleva un comentario que explica el porqué; las
  constantes de forma van en mayúsculas (`NAME_RE`, `SEMVER_RE`,
  `OBJECT_KEYS`); el dato no confiable —lock, manifiesto— se
  defiende en el lector, así que `safeCollect` de `diff.js`
  quita separadores finales sin `normalize` a propósito:
  normalizar antes de `isSafeRelative` colapsaría segmentos
  `..` del dato registrado.
- Dominio: `docs/domains/001-paquete.md` —seguridad de rutas
  con ancla `isSafeRelative`—; `docs/domains/002-instalacion.md`
  —`recordedChainSafe`/`resolveRecordedPath` y el registro como
  dato no confiable—.
- Producto: ninguna aplica —refactorización con comportamiento
  observable invariante; la referencia no cambia—.
- PRD: ninguno —tarea sin conjunto con PRD—.
- Lecciones: `revision-tecnica-subagente` —la revisión técnica
  irá con un subagente capaz de ejecutar comandos—.
- Decisiones: D003 —la `version` del manifiesto es contrato
  semver explícito; la forma estricta sin ceros iniciales es la
  declarada—; D017 —la versión identifica el contenido;
  `semverAtLeast` sirve al rechazo de downgrades—; D021
  —idiomas de resultado por capa; esta refactorización no crea
  resultados nuevos—.

## Conectividad

**Conectada.** Todo lo que la tarea asume existe con la forma
esperada: `src/paths.js` es el hogar de las primitivas de ruta
exportadas; `src/manifest.js` declara `OBJECT_KEYS` sin
`packagesEntry` y exporta `NAME_RE`, que `cli.js` ya importa
—el mecanismo de primitiva compartida existe—; las cuatro
copias de canonicalización (`plan.js:91`, `paths.js:76-77`,
`manifest.js:121`, `diff.js:234,270`) y las tres formas semver
(`manifest.js:7`, `plan.js:267`, `cli.js:526`) están donde la
revisión las citó; `specLabel` existe en `fetch.js:51` y solo
falta exportarlo —absorbible dentro del alcance—. La suite no
se acopla a internos: ningún test referencia las regex ni las
funciones que se moverán.

## Plan técnico

Las primitivas duplicadas viven dispersas en `src/`: tres regex
de «forma semver» con exigencia distinta, el patrón «quitar
separadores finales» en cuatro sitios con tres variantes —solo
`/` en `manifest.js`, `normalize` + `[/\\]` en `plan.js` y
`paths.js`, y `[/\\]` sin `normalize` en `diff.js`, que es
deliberado: `safeCollect` defiende el dato crudo del lock y
normalizar antes de `isSafeRelative` colapsaría sus segmentos
`..`—, un `new Set` construido por entrada en el validador de
colección y el rótulo `owner/name@ref` reimplementado en
`obtainPackage` cuando `fetch.js` ya lo define. `paths.js` es
el hogar de las primitivas de ruta y `manifest.js` el de las
formas del contrato —`NAME_RE` ya es compartido con `cli.js`—.

- [x] Exportar la forma semver compartida desde `manifest.js`
  y consumirla en `plan.js` y `cli.js`
  - Aporta: los dos lectores de dato no confiable
    —`semverAtLeast` sobre la versión registrada y `backupName`
    sobre el registro— evalúan la forma en un solo sitio,
    junto a `NAME_RE` y `SEMVER_RE`
  - Contexto: la constante compartida es la forma laxa
    `\d+\.\d+\.\d+` que ambos lectores ya usan con texto
    idéntico —exportada con grupos de captura para que
    `semverAtLeast` conserve su parse—; el contrato del
    manifiesto queda más estricto: `SEMVER_RE` sigue
    rechazando ceros iniciales (D003) y no se toca
- [x] Centralizar la canonicalización de targets en
  `paths.js` con dos primitivas y sustituir las cinco copias
  - Aporta: `canonTarget` —`normalize` + quitar `[/\\]`
    finales— da un solo hogar a la comparación de targets
    (`plan.js:91`, `isWithin` en `paths.js:76-77`,
    `manifest.js:121`); `stripTargetSeps` —quitar `[/\\]`
    finales sin normalizar— da nombre a la operación de
    `diff.js:234` y `diff.js:270`
  - Contexto: `diff.js` no debe normalizar —`safeCollect`
    valida el dato registrado tal como vino y `base` es solo
    visual—; la única divergencia que desaparece es la de
    `manifest.js`, que H2 declara objetivo: un target
    terminado en `\` canona igual que en `/`
- [x] Declarar `OBJECT_KEYS.packagesEntry` en `manifest.js`
  y referenciarlo en el validador de colección
  - Aporta: el conjunto `{path}` se evalúa una vez siguiendo
    el patrón declarado; desaparece la asignación por entrada
- [x] Exportar `specLabel` desde `fetch.js` y reutilizarlo en
  `obtainPackage` de `cli.js`
  - Aporta: el rótulo `owner/name@ref` tiene un solo hogar;
    `obteniendo:` usa la misma forma que los diagnósticos de
    fetch, con texto observable idéntico
- [x] Correr la suite completa y confirmar el 100 % de
  cobertura en `src/`
  - Aporta: la aceptación del refactoring es la invariancia
    verificada —misma API pública, mismos mensajes y
    códigos—; la suite existente es la red

## Suite de pruebas esperada

- Regresión completa: la suite existente permanece en verde
  sin tocar expectativas —mismos mensajes, códigos y
  comportamiento ante la misma entrada—; es la especificación
  de la invariancia.
- Cobertura: 100 % en `src/` tras el cambio —las líneas
  nuevas son declaraciones e imports; las eliminadas son
  copias—.
- Un manifiesto cuyos targets solo difieren en el separador
  final —`a/` frente a `a\`— reporta `target duplicado`: el
  caso que la variante de `manifest.js` dejaba escapar y que
  H2 declara corregido. (B)

## Revisión

- Subagente: 2026-10-26 — Aprueba
- Usuario (ejecución): 2026-10-26 — Aprueba
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
