# Extraer informes y predicados compartidos en cli.js

## Estado

[r] En revisión

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

## Contexto

- Archivos similares: `src/cli.js` —los helpers de
  presentación `reportBackup` y la tabla `DRIFT_MARKS` son el
  precedente de informe compartido en la capa de invocación—;
  `src/lock.js` —dueño de la forma del registro: `lockEntry`,
  `lockEntries`, `writeLock` como precedente de concepto del
  registro con hogar propio—; `src/plan.js` —dueño del
  concepto de plan—.
- Patrones: los helpers de presentación viven en `cli.js`
  como funciones locales con comentario que explica el
  porqué; los predicados de dominio viven en el módulo de su
  concepto y se exportan con nombre; las entradas `files[]`
  del registro llevan `action` —`create`, `overwrite`,
  `identical`, `mkdir`, `keep`, `skip`—, donde `skip`
  documenta una decisión que no escribió nada.
- Dominio: `docs/domains/002-instalacion.md` —plan, registro
  y respaldo como conceptos del modelo; anclas `lockEntry`,
  `writeLock`, `classifyResource`—.
- Producto: ninguna aplica —refactorización con comportamiento
  observable invariante—.
- PRD: ninguno —tarea sin conjunto con PRD—.
- Lecciones: `revision-tecnica-subagente` —la revisión técnica
  irá con un subagente capaz de ejecutar comandos—.
- Decisiones: D021 —los conceptos viven en la capa de su
  idioma: el predicado de respaldo es del plan, el de
  «escrito» es del registro—; la entrada de la tarea declara
  el hogar de cada uno.

## Conectividad

**Conectada.** Todo lo que la tarea asume existe con la forma
citada: los nueve bucles `aviso:` son textualmente idénticos
salvo el objeto origen; los dos `catch` de ejecución
(`executeAndReport` y `runUninstall`) son el mismo algoritmo
línea a línea; las tres expresiones `plan.conflicts.some((r)
=> r.resolution === 'overwrite')` están donde la revisión las
citó; los cuatro filtros `skip` —dos en `cli.js`, dos en
`plan.js`— operan todos sobre entradas `files[]` del registro,
así que el predicado pertenece a `lock.js`. Los hogares de
cada concepto existen ya como módulos.

## Plan técnico

`cli.js` concentra los informes de la capa de invocación y
cuatro bloques se repiten —el bucle `aviso:` nueve veces, el
informe de fallo de ejecución dos veces (`executeAndReport` y
`runUninstall`, mismo algoritmo línea a línea), el predicado
«el plan respalda algo» tres veces y el filtro «registrado
como escrito» cuatro veces con dos grafías (`!== 'skip'` y
`=== 'skip'` con `continue`/`return []`)—. Los helpers de
presentación ya viven en `cli.js` (`reportBackup`,
`DRIFT_MARKS`); los predicados de dominio van al módulo de su
concepto —`plan.js` para el plan, `lock.js` para el
registro— (D021).

- [x] Extraer `reportWarnings(out, warnings)` en `cli.js` y
  sustituir los nueve bucles
  - Aporta: el idioma `aviso:` se emite desde un solo sitio;
    los nueve consumidores se reducen a una llamada
- [x] Extraer `reportExecutionFailure(out, err, error,
  actions, backupRoot)` en `cli.js` y unificar los dos `catch`
  - Aporta: el algoritmo «acciones aplicadas → `respaldo:` →
    `error de ejecución` → código 3» evoluciona en un solo
    lugar; el respaldo ya hecho sigue reportándose igual
  - Contexto: el fallback `error instanceof ExecutionError ?
    error.applied : actions` es parte del algoritmo —va
    dentro del helper—
- [x] Declarar `needsBackup(plan)` en `plan.js` y consumirlo
  en `checkBackupDestination`, `executeAndReport` y
  `runUninstall`
  - Aporta: «el plan respalda algo» se evalúa una sola vez,
    en el módulo del concepto
- [x] Declarar `isWritten(f)` en `lock.js` y consumirlo en
  los cuatro filtros —`cli.js` en `list` y `check`, `plan.js`
  en el plan de actualización y el de retirada—
  - Aporta: «el registro escribió el recurso» se evalúa en el
    módulo del registro; las dos grafías convergen
  - Contexto: la semántica exacta es `f.action !== 'skip'`
    —`keep` y `mkdir` cuentan como escritas, igual que hoy—
- [x] Correr la suite completa y confirmar el 100 % de
  cobertura en `src/`
  - Aporta: la aceptación del refactoring es la invariancia
    verificada —mismos textos, orden de emisión y códigos—;
    la suite existente es la red

## Suite de pruebas esperada

- Regresión completa: la suite existente permanece en verde
  sin tocar expectativas —mismos mensajes, orden de emisión y
  códigos—; es la especificación de la invariancia.
- Cobertura: 100 % en `src/` tras el cambio —los predicados e
  informes extraídos ya están ejercitados por los tests de
  `list`, `check`, `install`, `update` y `uninstall` con
  conflictos y fallos a mitad de ejecución—.
- Sin casos nuevos: el refactor no añade comportamiento;
  cualquier test nuevo sería sobre mecánica interna, no sobre
  expectativa del sistema.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
