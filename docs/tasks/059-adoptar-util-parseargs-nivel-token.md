# Adoptar util.parseArgs como nivel token del parser

## Estado

[x] Completada

## Tipo

mantenimiento (refactoring)

## Objetivo

`splitArgs` reimplementa a mano el escaneo de opciones que
`node:util` `parseArgs` ya valida —el paquete exige
`node >=22`—; adoptarlo como nivel token y reducir `parseArgs`
al despacho por comando y las reglas cruzadas que son gramática
del dominio.

## Dependencias

- Ninguna.

## Entrada

- `src/usage.js`: `splitArgs` (99-124) y `parseArgs` (143-230).
- `docs/architecture-reviews/005-complejidad-interna.md` —
  hallazgo H8—.

## Resultado esperado

- `util.parseArgs` en modo `strict` como nivel token —opción
  desconocida, valor ausente y repetida no `multiple` fallan
  solos; `--package` acumula—.
- `parseArgs` reducido a despacho por comando, aridades y
  reglas cruzadas —`--force`⊕`--skip`, `--ref`⊕`@ref`,
  `--package` solo en install—.
- Decisión explícita sobre los dos deltas de gramática que el
  parser estándar acepta y la actual rechaza —`--path=x` (forma
  `=`) y `--` terminador—: admitirlos como superset declarado o
  rechazarlos explícitamente.

## Criterios de calidad

- `splitArgs` desaparece; las reglas cruzadas son las únicas
  comprobaciones manuales.
- La decisión de gramática queda documentada —en la tarea o en
  la ayuda si los deltas se admiten—.
- `npm test` en verde con el 100 % de cobertura en `src/` —los
  tests de gramática existentes siguen, o se ajustan a los
  deltas decididos—.

## Procedimiento sugerido

1. Configurar `util.parseArgs` con las opciones vigentes y
   mapear sus errores al idioma `null` de la gramática.
2. Reexpresar cada rama de comando sobre `values`/`positionals`.
3. Decidir los dos deltas, documentarlos y correr la suite.

## Notas

- Librerías de terceros descartadas: el paquete tiene una sola
  dependencia (`tar`) porque se distribuye por `npx`; la stdlib
  cubre el nivel token completo.
- `null` sigue siendo el idioma de «gramática inválida» —los
  errores del parser estándar se mapean a él, no se propagan—.

## Contexto

- **Archivos similares:** `src/fetch.js` —`parseRepoSpec` ya es
  el nivel token del spec y devuelve `null` como idioma de
  rechazo, el mismo que adoptará el escáner estándar—.
- **Patrones:** la gramática se divide en nivel token —
  qué es opción, qué es posicional, qué opción lleva valor—
  y reglas cruzadas —`--force`⊕`--skip`, `--ref`⊕`@ref`,
  aridades por comando—; el parser casero mezclaba ambas.
- **Dominio:** `docs/domains/002-instalacion.md` ancla
  `parseArgs`/`USAGE` en `src/usage.js` —nombres que deben
  sobrevivir—.
- **Producto:** el manual y `USAGE`/`HELP` describen la
  gramática aceptada —si los deltas se admiten como
  superset, la decisión queda documentada en la tarea y la
  ayuda no cambia porque ya no los mencionaba—.
- **PRD:** el hito 2 no tiene PRD.
- **Lecciones:** `revision-tecnica-subagente.md` —el revisor
  debe poder ejecutar comandos—.
- **Decisiones:** ninguna aplica directamente —la gramática
  es contrato de uso ya decidido; los deltas se deciden en
  el plan—.
- **Suite:** `cli.test.js` fija las reglas cruzadas y los
  bordes —desconocida (62), `--force`⊕`--skip` (63),
  `@ref`⊕`--ref` (604), `--ref` inválido (609), duplicada
  `--path a --path b` (620), valor que parece opción
  `--path --force` (620), aridades (51)—.

## Conectividad

Verificada durante la recolección: `splitArgs` (99-124)
reimplementa el escaneo de opciones que `node:util`
`parseArgs` valida en modo `strict` —desconocidas, valores
ausentes, `--opt=valor`— con `package.json` exigiendo
`node >=22`. Las sondas empíricas del scanner estándar
marcan cuatro deltas contra el casero: acepta `--path=x` y
el terminador `--`, rechaza tokens `-x` donde el casero los
trataba como posicionales/valores, y acepta la repetida no
`multiple` última-gana donde el casero y la suite (620) la
rechazan —salvable con `tokens: true`—. El hallazgo H8 de
la revisión 005 corresponde a este estado. Veredicto:
**conectada**.

## Plan técnico

- [x] `OPTION_TYPES` + `COMMAND_OPTIONS`: tabla de tipos y
  conjunto declarado por comando —install todas, update sin
  `package`, uninstall solo flags—; el escáner rechaza lo no
  declarado solo.
- [x] `splitArgs(command, rest)` sobre `node:util` `parseArgs`
  (`strict`, `allowPositionals`, `tokens: true`): `catch`→`null`;
  sobre los tokens, repetida no-`multiple`→`null`; `--force`⊕`--skip`
  sigue en el nivel compartido; devuelve `{ args, flags, values }`.
- [x] `parseArgs` reducido a pre-escaneo intacto + ramas sobre
  `values`/`args` —aridades, `--ref`⊕`@ref`, `--ref`⊕`--path`,
  `isValidRef`, `parseRepoSpec`—.
- [x] Deltas decididos: `--opt=valor` y `--` admitidos como
  superset declarado; `-x` endurecido a error de uso; repetida
  no-`multiple` rechazada vía tokens (la suite lo exige).
- [x] Añadir los casos de los deltas admitidos a la suite y
  correrla completa confirmando el 100 % en `src/`.

## Suite de pruebas esperada

- Regresión completa en `cli.test.js` —gramática 51, 59-64,
  604-620— con `--path a --path b` y `--path --force` aún
  rechazados.
- Casos nuevos para los deltas admitidos: `--path=<dir>` y
  `--` antes del posicional —desviación prevista—.
- Cobertura 100 % en `src/usage.js`.

## Desviaciones

- La suite ganó un caso —`--path=<dir>` y `--` antes del
  posicional— para fijar el superset declarado, como el
  plan preveía.
- La revisión técnica encontró un cuarto delta no previsto:
  el dedup sobre tokens rechazaba también flags booleanos
  repetidos (`--force --force`), que el `Set` casero
  deduplicaba. Corregido eximiendo `type === 'boolean'` del
  rechazo y derivando `BOOLEAN_OPTIONS` de `OPTION_TYPES`
  —paridad restaurada—.

## Revisión

- Subagente: 2026-10-29 — Aprueba
- Usuario (ejecución): 2026-10-29 — Aprueba
- Usuario (cierre): 2026-10-29 — Aprueba
