# Adoptar util.parseArgs como nivel token del parser

## Estado

[ ] Pendiente

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

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
