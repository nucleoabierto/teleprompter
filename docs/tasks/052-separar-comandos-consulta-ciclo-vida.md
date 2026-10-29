# Separar los comandos de consulta del ciclo de vida

## Estado

[r] En revisión

## Tipo

mantenimiento (refactoring)

## Objetivo

Separar los comandos de solo lectura del registro —`showGuide`,
`showList`, `showCheck`— de los comandos del ciclo de vida que
escriben —`runInstall`, `runUpdate`, `runUninstall` y sus
colaboradores— en `src/commands.js`, moviéndolos a un módulo
propio de consulta; evaluar y justificar si la división por
flujo de escritura aporta o fragmenta los colaboradores
compartidos.

## Dependencias

- Ninguna —sugerida tras la 047, que asentó `commands.js`—.

## Entrada

- `src/commands.js` (~594 líneas): los tres comandos de
  consulta (~150) y los tres de ciclo de vida con sus
  colaboradores compartidos —`settleConflicts`,
  `executeAndReport`, `backupName`, las pre-flight—.
- `docs/decisions/D011`, `D012`, `D013` —`guide`, `list` y
  `check` nacieron como subcomandos de consulta separados—.

## Resultado esperado

- Un módulo de consulta (p. ej. `queries.js`) con los tres
  comandos de solo lectura y sus emisores privados;
  `commands.js` queda con el ciclo de vida.
- La división por flujo de escritura evaluada: si se aplica,
  los colaboradores compartidos tienen hogar declarado; si
  no, la decisión queda justificada en las notas.

## Criterios de calidad

- Comportamiento observable idéntico —mismos mensajes,
  códigos y orden de emisión—.
- `npm test` en verde con el 100 % de cobertura en `src/`.
- Ningún colaborador compartido queda duplicado.

## Procedimiento sugerido

1. Extraer los tres comandos de consulta a su módulo.
2. Evaluar la división por flujo y registrar la decisión.
3. Correr la suite.

## Notas

- Surgida de la revisión de la tarea 047: `commands.js` es
  una unidad cohesiva pero la frontera consulta/ciclo de vida
  es real en el dominio.

## Contexto

- `src/commands.js` (589 líneas) mezcla dos preocupaciones: los
  tres comandos de consulta —`showGuide` (31-74), `showList`
  (84-105), `showCheck` (113-131), ~100 líneas— y el ciclo de
  vida —`obtainPackage` a `runInstall` (136-589), ~450 líneas—.
- Las consultas son autónomas: no llaman a ningún colaborador
  privado del ciclo de vida; solo comparten imports de dominio e
  informe —`readLock`/`lockEntry`/`lockEntries`/`isWritten`
  (`lock.js`), `resolveRecordedPath` (`paths.js`),
  `classifyResource` (`drift.js`), `printGuide`/`DRIFT_MARKS`/
  `reportWarnings` (`report.js`), `EXIT_*` (`exits.js`)—.
- Imports exclusivos de las consultas en `commands.js`:
  `lockEntries`, `isWritten`, `resolveRecordedPath`,
  `classifyResource`, `DRIFT_MARKS`. `printGuide` es compartido
  —`executeAndReport` lo usa en `commands.js:297`— y `fs` también
  —`commands.js:288,450`—.
- División por flujo de escritura evaluada: los colaboradores
  privados son transversales —`settleConflicts` y
  `checkBackupDestination` los llaman los tres flujos;
  `obtainPackage`, `checkVerified`, `checkGuideDestination`,
  `backupName`, `executeAndReport`, `isDir`, `originOf` y
  `resolveMembers`, dos—; separar `install`/`update`/`uninstall`
  exigiría un módulo de ayudantes compartidas o duplicación.
- `guide`, `list` y `check` nacieron como decisiones separadas
  (D011, D012, D013): la frontera consulta/ciclo de vida es del
  dominio, no cosmética.
- Superficie pública: ningún test importa `commands.js` —la
  suite ejerce `main` en `cli.js`; el despacho queda idéntico—.

## Conectividad

Verificada durante la recolección: grafo de llamadas completo de
los 12 colaboradores privados, imports exclusivos/compartidos
cruzados símbolo a símbolo, y superficie pública confirmada —
`main` + `EXIT_*` desde `cli.js`, sin imports directos desde
tests—. Veredicto: **conectada**.

## Plan técnico

- [x] Crear `src/queries.js` con `showGuide`, `showList` y
  `showCheck`, con sus comentarios intactos; importa `fs`,
  `readLock`/`lockEntry`/`lockEntries`/`isWritten`,
  `resolveRecordedPath`, `classifyResource`,
  `printGuide`/`DRIFT_MARKS`/`reportWarnings` y
  `EXIT_OK`/`EXIT_USAGE`/`EXIT_EXECUTION`.
- [x] `commands.js` queda con el ciclo de vida; salen de sus
  imports `lockEntries`, `isWritten`, `resolveRecordedPath`,
  `classifyResource` y `DRIFT_MARKS` —`printGuide` y `fs` quedan
  porque `executeAndReport`/`isDir` los usan—.
- [x] `cli.js` importa las consultas desde `queries.js`; el
  despacho no cambia.
- [x] Correr la suite completa y confirmar el 100 % de cobertura
  en `src/`.

## Decisiones

- `queries.js` como nombre: el sugerido por la tarea, nombra la
  preocupación —consultas de solo lectura del registro—.
- No dividir por flujo de escritura: los colaboradores privados
  son transversales —`settleConflicts`/`checkBackupDestination`
  en los tres flujos, ocho más en dos—; separar
  `install`/`update`/`uninstall` exigiría un módulo de ayudantes
  compartidas y fragmentaría lo cohesivo sin ganar frontera de
  dominio. La división consulta/ciclo de vida, en cambio, no
  mueve ningún colaborador compartido.

## Desviaciones

- El plan enumeraba cinco símbolos exclusivos a retirar de los
  imports de `commands.js`; el revisor detectó un sexto —
  `EXIT_EXECUTION`, cuyos únicos usos vivían en `showGuide`— y
  quedó retirado tras la corrección.

## Suite de pruebas esperada

- Regresión completa: la suite permanece en verde sin tocar
  expectativas ni imports —`main` y `EXIT_*` siguen saliendo de
  `cli.js`—.
- Cobertura: 100 % en `src/` incluido `queries.js` —las
  consultas ya se ejercen vía `main`—.
- Sin casos nuevos: refactor puro.

## Revisión

- Subagente: 2026-10-29 — Aprueba
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
