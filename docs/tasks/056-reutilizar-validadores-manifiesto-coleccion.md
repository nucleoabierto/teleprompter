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

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
