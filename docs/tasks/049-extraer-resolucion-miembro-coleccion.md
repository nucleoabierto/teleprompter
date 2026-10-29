# Extraer la resolución de miembro de colección compartida

## Estado

[~] En progreso

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

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
