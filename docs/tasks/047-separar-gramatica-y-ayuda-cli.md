# Separar gramática y ayuda de la capa de invocación

## Estado

[ ] Pendiente

## Tipo

mantenimiento (refactoring)

## Objetivo

Devolver a `src/cli.js` su rol declarado de capa de invocación
delgada —parsear, despachar y mapear a códigos— moviendo la
gramática (`parseArgs`, `splitArgs`, las tablas de opciones) y la
ayuda (`USAGE`, `HELP`, `showHelp`) a módulos propios, y
evaluando el hogar de la presentación pura (`printPlan`,
`printGuide`, `showList`, `showCheck`, `reportBackup`,
`DRIFT_MARKS`) y de las reglas de «plan ejecutable» y
nomenclatura del respaldo (`checkGuideDestination`,
`checkBackupDestination`, `backupName`), que hoy mezclan dominio
con invocación.

## Dependencias

- Ninguna —sugerida tras la 046 para mover menos código—.

## Entrada

- `docs/architecture-reviews/004-arquitectura-general.md` —
  hallazgo H1.
- `src/cli.js` — 904 líneas repartidas entre gramática (~120),
  ayuda (~90), presentación (~140), orquestación y reglas de
  dominio.
- La suite ejerce `main` inyectando `io`; la nueva frontera debe
  conservar esa inyección sin tocar los tests en su superficie.

## Resultado esperado

- `cli.js` contiene solo la invocación: `parseArgs`/despacho (o
  la llamada al módulo de gramática), `main` y el mapeo a
  códigos; cada preocupación separada tiene su módulo con nombre
  de dominio.
- La ayuda y la gramática no importan nada del dominio que no
  necesiten; la inyección de `io` se conserva.

## Criterios de calidad

- Comportamiento observable idéntico —mismos mensajes, códigos y
  gramática aceptada—.
- `npm test` en verde con el 100 % de cobertura exigido en `src/`
  —los módulos nuevos entran en la exigencia—.

## Procedimiento sugerido

1. Extraer gramática + tablas + `HELP`/`USAGE`/`showHelp` a un
   módulo (p. ej. `usage.js`/`args.js`).
2. Evaluar y separar la presentación pura si el volumen lo
   justifica.
3. Reubicar las reglas de dominio en su módulo concepto o
   justificar su estancia.
4. Correr la suite.

## Notas

- Derivada de la revisión de arquitectura
  (`docs/architecture-reviews/004-arquitectura-general.md`).

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
