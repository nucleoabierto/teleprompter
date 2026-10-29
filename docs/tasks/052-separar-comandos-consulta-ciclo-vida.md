# Separar los comandos de consulta del ciclo de vida

## Estado

[ ] Pendiente

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

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
