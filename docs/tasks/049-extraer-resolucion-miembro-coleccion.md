# Extraer la resolución de miembro de colección compartida

## Estado

[x] Completada

## Tipo

mantenimiento (refactoring)

## Objetivo

Unificar la secuencia «resolver miembro por nombre en una
colección» que hoy se implementa dos veces —en `selectUnits`
para `install` y en el prólogo de `runUpdate`— en una operación
compartida que ambos comandos consuman.

## Dependencias

- Ninguna —sugerida tras la 047, que reorganiza `cli.js`—.

## Entrada

- `docs/architecture-reviews/004-arquitectura-general.md` —
  hallazgo H4.
- `src/cli.js:638-657` — prólogo de colección de `runUpdate`;
  `src/cli.js:782-817` — `selectUnits`; ambos repiten:
  `isCollectionDir` → `loadCollectionManifest` → avisos →
  errores → `resolveSelection` → informe de disponibles.
- `src/collection.js` — hogar natural de la operación extraída o
  de su parte de dominio (el informe queda en la capa, D021).

## Resultado esperado

- Una operación compartida que encapsula la secuencia; las
  diferencias —selección múltiple vs. una, impresión del índice
  sin selección— quedan parametrizadas o en el llamador.
- Los mensajes y códigos de salida se conservan.

## Criterios de calidad

- Una sola implementación de la secuencia de resolución.
- Comportamiento observable idéntico.
- `npm test` en verde con el 100 % de cobertura exigido en `src/`.

## Procedimiento sugerido

1. Extraer la secuencia común a su hogar.
2. Migrar `selectUnits` y el prólogo de `runUpdate`.
3. Correr la suite.

## Notas

- Derivada de la revisión de arquitectura
  (`docs/architecture-reviews/004-arquitectura-general.md`).

## Contexto

- Hallazgo H4 de la revisión 004: la secuencia «resolver miembro
  por nombre en una colección» está duplicada entre el prólogo de
  `runUpdate` y `selectUnits`.
- Copia A — `runUpdate` (`src/commands.js:357-376`): si
  `isCollectionDir` → `loadCollectionManifest` → `reportWarnings`
  → errores del manifiesto (`manifiesto de colección inválido:`,
  EXIT_MANIFEST) → `resolveSelection` con `[parsed.pkg]` → si no
  resuelve: `el paquete "X" ya no está en la colección` +
  `disponibles:` + EXIT_USAGE; si resuelve: `unitDir` +
  `fromCollection`.
- Copia B — `selectUnits` (`src/commands.js:495-530`): si no es
  colección → `--package no aplica` o unidad propia; si lo es →
  misma secuencia de carga/avisos/errores → `names` vacío imprime
  el índice (`describeIndex`) + `selecciona con --package` →
  `resolveSelection` → errores detallados + `disponibles:` →
  `{units}`.
- Diferencias reales: el mensaje de fallo de resolución (uno
  genérico en update vs. los `errors` detallados en install), la
  rama de índice sin selección (solo alcanzable por install), la
  guarda de «no es colección» (selectUnits la convierte en error
  con `--package`; update simplemente no entra) y el número de
  unidades (una vs. varias).
- `collection.js` ya aloja las operaciones de dominio puras —
  `isCollectionDir`, `loadCollectionManifest` (en manifest.js),
  `resolveSelection`, `describeIndex`—; la secuencia emite por
  `out`/`err` y mapea a códigos, así que su hogar es la capa de
  comandos (D021).
- Orden relevante: la comprobación de errores del manifiesto
  precede a la impresión del índice —el índice no se imprime si el
  manifiesto es inválido—, así que la rama de `names` vacío debe
  quedar dentro de la secuencia compartida.

## Conectividad

Verificada durante la recolección: ambas copias leídas íntegras,
diferencias acotadas a mensaje/rama-índice/guarda/aridad, hogar
de la operación decidido por D021. Veredicto: **conectada**.

## Plan técnico

- [x] Extraer `resolveMembers(out, err, rootDir, names,
  onUnresolved)` en `src/commands.js`: carga del manifiesto,
  avisos, errores de manifiesto, índice sin selección,
  `resolveSelection`, `onUnresolved` + `disponibles:`, `{units}`.
- [x] Migrar `selectUnits` a guarda `isCollectionDir` + llamada
  con `onUnresolved` que emite `resolved.errors`.
- [x] Migrar el prólogo de `runUpdate` con `onUnresolved` que
  emite `el paquete "X" ya no está en la colección`.
- [x] Correr la suite completa y confirmar el 100 % de cobertura
  en `src/`.

## Decisiones

- La operación vive en `commands.js`: emite por `out`/`err` y
  devuelve códigos —idioma de invocación (D021); `collection.js`
  ya aloja las operaciones de dominio puras.
- La guarda `isCollectionDir` queda en cada llamador: significa
  error `--package` en install y ausencia del concepto en update.
- La rama de índice sin selección va dentro de la secuencia
  —sacarla invertiría el orden «errores de manifiesto antes que
  índice»; update nunca la alcanza—.
- `onUnresolved` recibe `resolved` y emite el mensaje específico
  antes del `disponibles:` compartido.

## Suite de pruebas esperada

- Regresión completa en verde sin tocar expectativas —los tests de
  colección ya ejercen ambos caminos y sus mensajes—.
- Cobertura 100 % en `src/` —la rama de índice queda cubierta por
  install con colección sin `--package`; la `onUnresolved` de
  update por `ya no está en la colección`—.
- Sin casos nuevos: refactor puro.

## Revisión

- Subagente: 2026-10-26 — Aprueba
- Usuario (ejecución): 2026-10-26 — Aprueba
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
