# Extraer informes y predicados compartidos en cli.js

## Estado

[ ] Pendiente

## Tipo

mantenimiento (refactoring)

## Objetivo

Concentrar en helpers los bloques repetidos de `src/cli.js`: el
bucle de emisión de avisos (nueve copias), el informe de fallo de
ejecución (dos copias idénticas), el predicado «el plan respalda
algo» (tres copias) y «el registro escribió el recurso» (cuatro
copias con dos grafías).

## Dependencias

- Ninguna.

## Entrada

- `docs/architecture-reviews/003-revision-idiomatica.md` —
  hallazgos H4, H5 y H6.
- `src/cli.js` — avisos en 289, 341, 379, 416, 592, 640, 706,
  791 y 830; informe de fallo en 565-573 y 734-741; predicado de
  respaldo en 503, 549 y 725; filtro `skip` en 356 y 389.
- `src/plan.js:160, 240` — el filtro `skip` también vive aquí; el
  predicado compartido debería tener hogar en el módulo del
  concepto, no duplicarse entre capas (D021).
- El hogar de cada predicado merece criterio: el de respaldo es
  del plan, el de «escrito» es del registro.

## Resultado esperado

- Un helper de avisos (`aviso:`) consumido por los nueve sitios.
- Un informe de fallo de ejecución único —acciones aplicadas,
  `respaldo:` y `error de ejecución`— consumido por
  `executeAndReport` y `runUninstall`.
- Predicados nombrados para «el plan respalda algo» y «el
  registro escribió el recurso», cada uno en el módulo de su
  concepto.

## Criterios de calidad

- Cada bloque existe una sola vez; mismos textos, orden de
  emisión y códigos de salida.
- `npm test` en verde con el 100 % de cobertura exigido en `src/`.

## Procedimiento sugerido

1. Extraer el helper de avisos y sustituir los nueve sitios.
2. Extraer el informe de fallo y unificar los dos `catch`.
3. Nombrar los dos predicados en su módulo y sustituir las
   copias.
4. Correr la suite.

## Notas

- Derivada de la revisión idiomática
  (`docs/architecture-reviews/003-revision-idiomatica.md`).

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
