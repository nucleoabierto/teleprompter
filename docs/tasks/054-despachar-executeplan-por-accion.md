# Despachar executePlan por acción

## Estado

[ ] Pendiente

## Tipo

mantenimiento (refactoring)

## Objetivo

Sacar la resolución de la acción y sus cuatro ramas del bucle
único de `executePlan` —68 líneas con indentación máxima 6— a un
`actionOf(entry)` y manejadores por acción, declarando la guarda
de escritura y el respaldo previo una vez por rama.

## Dependencias

- Ninguna.

## Entrada

- `src/execute.js`: `ACTION`/`REMOVAL_RESOLUTION` (18-29) y el
  bucle de `executePlan` (83-134).
- `docs/architecture-reviews/005-complejidad-interna.md` —
  hallazgo H4—.

## Resultado esperado

- `actionOf` como operación propia que decide `create`,
  `overwrite`, `remove`, `identical`, `keep`/`skip` por entrada.
- Un manejador por acción —o tabla de despacho—; `executePlan`
  se lee como mkdirs + bucle que delega.

## Criterios de calidad

- Orden de `applied` observable idéntico —la entrada `overwrite`
  se empuja antes de copiar; un respaldo ya hecho se reporta
  aunque la retirada falle—.
- La defensa de escritura (`resolvesUnder`) no cambia.
- `npm test` en verde con el 100 % de cobertura en `src/`.

## Procedimiento sugerido

1. Extraer `actionOf` con la lógica `ACTION`/`REMOVAL_RESOLUTION`.
2. Dar a cada acción su manejador con su guarda y su respaldo.
3. Correr la suite.

## Notas

- El vocabulario de retirada (`remove`/`keep` ↔
  `overwrite`/`skip`) se traduce en tres sitios —observación del
  informe—; si la extracción naturalmente lo unifica, bienvenido,
  pero no es requisito.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
