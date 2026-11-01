# Sondear la versión publicada de un origen

## Estado

[ ] Pendiente

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

## Notas

- El mecanismo deliberado es la obtención completa ya existente:
  es la misma fuente que `install`/`update` consultan, así que la
  versión reportada es exactamente la que una actualización
  obtendría —la optimización ligera quedó fuera de alcance—.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
