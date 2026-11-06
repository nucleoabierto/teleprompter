# El comando `outdated` de punta a punta

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

`teleprompter outdated [<paquete>]` revisa lo que cada origen
registrado publica frente a lo instalado y presenta la comparación
—una línea por paquete— sin escribir nada: ni el destino, ni
el registro, ni los respaldos.

## Dependencias

- 060 —el sondeo de la versión publicada—.

## Entrada

- `src/usage.js`: gramática y ayuda —`outdated` entra como
  comando de la familia de consultas, sin opciones—.
- `src/cli.js`: el despacho por comando —los comandos de
  consulta viven en `queries.js`; este consulta la red, así que
  su hogar se decide en el plan—.
- `src/commands.js`: `sourceOf` —la traducción origen→source
  que `update` ya consume—.
- `src/lock.js`: `lockEntries` para recorrer el registro.
- `src/plan.js`: `semverAtLeast` o la comparación de versiones
  vigente.

## Resultado esperado

- `outdated` sin argumentos revisa todas las entradas del
  registro; con nombre, solo la del paquete —como `guide`—.
- Por paquete: versión instalada, versión publicada y estado
  —al día, desactualizado o no consultable—. Un origen
  inalcanzable degrada a aviso en su línea sin abortar la
  revisión del resto.
- El registro vacío o corrupto se comporta como en las demás
  consultas —«no hay paquetes instalados» / degradación a
  sin historial con su aviso—.
- Un paquete nombrado que no está instalado es error de uso.
- La ayuda describe el comando: `HELP.outdated` y su entrada en
  `USAGE`.

## Criterios de calidad

- Comportamiento de solo lectura verificable: ninguna escritura
  sobre el destino ni el registro en ningún camino —ni
  temporales residuales—.
- La revisión es secuencial por unidad —la paralelización de
  sondeos queda fuera de alcance—.
- `npm test` en verde con el 100 % de cobertura en `src/`.

## Procedimiento sugerido

1. Gramática: registrar `outdated` en el despacho por comando con
  aridad 0-1, y su entrada en `USAGE` y `HELP`.
2. El comando: leer el registro, filtrar por nombre si se dio,
  traducir cada `origin` vía `sourceOf`, sondear con el borrador
  01, comparar con la versión instalada y presentar.
3. Correr la suite.

## Contexto

- **Archivos similares:** `src/queries.js` —`showGuide`/`showList`/
  `showCheck` fijan el patrón de la familia: leer el lock,
  `reportWarnings`, filtrar por nombre, una línea por paquete,
  códigos de salida—.
- **Patrones:** la consulta devuelve códigos de salida (D021); la
  degradación es `aviso:` o marca por línea, nunca aborto —`check`
  declara «la deriva es información, no un fallo»—.
- **Dominio:** `docs/domains/003-registro.md` ancla `readLock`,
  `lockEntries`, `lockEntry`; `002-instalacion.md` ancla el
  consumo del `origin`.
- **Producto:** PRD 009 CU-1/CU-2 —revisión de todo el registro
  y de un paquete nombrado—.
- **PRD:** `docs/prd/009-revision-desactualizados.md`.
- **Lecciones:** `revision-tecnica-subagente.md` —el revisor debe
  poder ejecutar comandos—.
- **Decisiones:** D021 —códigos de salida en la invocación—;
  D011/D012/D013 —la familia de consultas: subcomando propio,
  sin `destino`, sobre el directorio de trabajo—; D014 —el
  `origin` registrado alcanza para re-sondear—; D019 —el miembro
  se re-resuelve por nombre—; D017 —misma versión es mismo
  contenido: la comparación es por versión—; D003 —la autoridad
  de la versión es el manifiesto—.
- **Suite:** `test/cli.test.js` ejerce las consultas con `run` y
  `spyFetch`; los comandos sin opciones se verifican en las
  baterías de gramática y de ayuda —`outdated` entra en ambas—.

## Conectividad

Verificada durante la recolección: `sourceOf(err, parsed, origin)`
(`commands.js:349`) traduce el origen grabado al `source` —emite
sus motivos por `err`, que el comando puede colectar para
degradar por línea—; `publishedVersion(io, source, member)`
(`probe.js`) sondea la versión —`member` es el nombre del
paquete, como `update` re-resuelve—; `semverAtLeast` (`plan.js`,
privada) es la comparación vigente: `instalada >= publicada` →
al día. `queries.js` es síncrono porque sus consultas son
locales; la asincronía del sondeo no cambia la familia —`main`
ya despacha promesas—. Veredicto: **conectada**.

## Plan técnico

- [x] `src/origin.js` —módulo nuevo— recibe el par
  `originOf`/`sourceOf` que sale de `commands.js`: la traducción
  registro↔source gana un segundo consumidor fuera del módulo
  de comandos con escritura, y el par inverso sigue junto.
- [x] `src/plan.js`: `semverAtLeast` pasa a exportada —la
  comparación de versiones que el plan ya usa—.
- [x] `src/queries.js`: `showOutdated(io, out, err, pkgName)`
  asíncrona —lee el lock, filtra por nombre, por entrada llama
  `sourceOf` con un colector de motivos, sondea
  `publishedVersion`, compara con `semverAtLeast` y presenta
  una línea por paquete; los fallos se degradan en su línea—.
- [x] `src/usage.js`: `COMMAND_OPTIONS.outdated = new Set()` —
  el escáner rechaza toda opción por no declarada—; rama en
  `parseArgs` con aridad 0-1; entradas en `USAGE` y `HELP`.
- [x] `src/cli.js`: despacho `outdated` → `showOutdated`.
- [x] `test/cli.test.js`: casos nuevos del comando + altas en
  las baterías de ayuda y gramática; suite al 100 %.

## Suite de pruebas esperada

- Casos nuevos: registro vacío, nombrado no instalado, al día,
  desactualizado, instalada por encima de la publicada, origen
  sin `origin`, origen local desaparecido, fallo de obtención
  remota, colección con miembro, lock corrupto con su aviso.
- Gramática: `outdated a b`, `outdated --force`,
  `outdated --path x`, `outdated -x` rechazados; `outdated` y
  `outdated <paquete>` aceptados; `help outdated` y
  `outdated --help`.
- Regresión completa en verde; cobertura 100 % en `src/`.

## Notas

- El código de salida cuando algún origen no se pudo consultar lo
  decide el plan: degradar a aviso (como el lock corrupto) es la
  opción por defecto; que sea visible pero no abortivo es lo
  acordado en la propuesta.

## Revisión

- Subagente: 2026-11-06 — Aprueba
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
