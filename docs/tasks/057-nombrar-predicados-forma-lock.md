# Nombrar los predicados de la forma del lock

## Estado

[ ] Pendiente

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

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
