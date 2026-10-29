# Descomponer fetchRepoTree y unificar el fallo de GitHub

## Estado

[ ] Pendiente

## Tipo

mantenimiento (refactoring)

## Objetivo

Dividir `fetchRepoTree` —89 líneas que ejecutan cinco fases en
secuencia y repiten `cleanup()` en cinco puntos de retorno— en
operaciones por fase, y centralizar el vocabulario
status→mensaje que `resolveCommit` y la descarga reescriben como
ternarios anidados.

## Dependencias

- Ninguna.

## Entrada

- `src/fetch.js`: `resolveCommit` (60-94), `fetchRepoTree`
  (105-193) y los dos ternarios de clasificación
  (`fetch.js:78-81` y `154-159`).
- `docs/architecture-reviews/005-complejidad-interna.md` —
  hallazgos H1 y H2, agrupados porque reescriben las mismas
  líneas—.

## Resultado esperado

- Un clasificador compartido del fallo de GitHub —función o
  tabla— consumido por `resolveCommit` y por la descarga.
- `fetchRepoTree` como composición legible de sus fases —
  temporal, commit, descarga con *fallback*, límites y cuerpo,
  extracción— con una sola disciplina de limpieza.

## Criterios de calidad

- Mensajes, orden de intentos entre endpoints y semántica de
  limpieza idénticos —incluida la agregación de statuses—.
- `npm test` en verde con el 100 % de cobertura en `src/`.
- El vocabulario de fallo existe una sola vez.

## Procedimiento sugerido

1. Extraer el clasificador status→mensaje y consumirlo en ambos
   sitios.
2. Extraer la descarga con *fallback* y la extracción como
   operaciones propias.
3. Unificar la disciplina de `cleanup` y correr la suite.

## Notas

- La agregación difiere entre sitios —un endpoint vs. dos,
  404/422—: el clasificador compartido debe respetar las reglas
  de cada uno, no forzar una única.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
