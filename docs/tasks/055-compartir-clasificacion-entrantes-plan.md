# Compartir la clasificación de entrantes entre los constructores de plan

## Estado

[ ] Pendiente

## Tipo

mantenimiento (refactoring)

## Objetivo

`buildUpdatePlan` —109 líneas, la función más grande de `src/`—
repite en su clasificación de entrantes el esqueleto de
`buildPlan` con otra condición de sobrescritura; extraer el
esqueleto compartido parametrizado por esa regla, y las
retiradas como operación propia.

## Dependencias

- Ninguna.

## Entrada

- `src/plan.js`: `buildPlan` (18-50) y `buildUpdatePlan`
  (90-198) —entrantes 121-140, retiradas 145-190—.
- `docs/architecture-reviews/005-complejidad-interna.md` —
  hallazgo H3—.

## Resultado esperado

- Un clasificador de entrante compartido —ausente →
  `create`/`conflict` con guarda, igual → `identical`,
  registrado-intacto y permitido → clase que sobrescribe, si no
  → `conflict`, con la rebaja por `resolvesUnder`—
  parametrizado por la regla `managed-update`/`update`.
- Las retiradas de `buildUpdatePlan` como operación propia
  (`plannedRemovals` o equivalente).

## Criterios de calidad

- Planes producidos idénticos —marcas `managed-update`/`update`
  conservadas, semántica de `ancestorDrift` y `uncoveredUnits`
  intacta—.
- `npm test` en verde con el 100 % de cobertura en `src/`.
- El esqueleto de clasificación existe una sola vez.

## Procedimiento sugerido

1. Extraer el clasificador compartido y migrar `buildPlan`.
2. Migrar `buildUpdatePlan` y extraer las retiradas.
3. Correr la suite.

## Notas

- La forma compartida exige criterio: la diferencia
  `managed-update`/`update` es vocabulario del dominio, no un
  detalle a borrar.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
