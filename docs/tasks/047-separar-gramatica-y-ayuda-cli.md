# Separar gramática y ayuda de la capa de invocación

## Estado

[x] Completada

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

## Contexto

- Archivos similares: `src/prompt.js` —módulo pequeño de la
  capa de invocación (la pregunta interactiva), precedente de
  hogar propio para una preocupación de la invocación—;
  `src/diff.js` —módulo de presentación pura con su tabla de
  idioma—; `src/lock.js` —concepto con hogar único exportando
  predicados—.
- Patrones: módulos funcionales por preocupación; la gramática
  solo depende de `parseRepoSpec`, `isValidRef` y `HELP`; los
  emisores puros no tocan `fs` ni el dominio; los comandos
  (`showGuide`, `showList`, `showCheck`, `run*`) leen `io` y
  devuelven códigos `EXIT_*`; la superficie pública de
  `cli.js` son `main` y los seis `EXIT_*` —los tres archivos
  de test y `bin/teleprompter.js` los importan—.
- Dominio: `docs/domains/002-instalacion.md` —los comandos del
  ciclo de vida con sus anclas; la división propuesta respeta
  el lenguaje ubicuo—.
- Producto: ninguna aplica —comportamiento observable
  invariante—.
- PRD: ninguno —tarea sin conjunto con PRD—.
- Lecciones: `revision-tecnica-subagente` —la revisión técnica
  irá con un subagente capaz de ejecutar comandos—.
- Decisiones: D021 —la invocación mapea a códigos de salida;
  `checkGuideDestination`, `checkBackupDestination` y
  `backupName` emiten `err` y devuelven códigos: son reglas de
  la invocación, no del dominio, y su hogar sigue siendo la
  capa de comandos—.

## Conectividad

**Conectada.** Todo lo que la tarea asume existe: la gramática
es independiente del dominio salvo `parseRepoSpec`/`isValidRef`
(fetch.js); la ayuda no importa nada del dominio; los emisores
puros no usan `fs`; cada comando ya es una función `run*`/
`show*` desconectable que `main` despacha; la suite ejerce
`main` con `io` inyectado e importa `main` + `EXIT_*` de
`cli.js` —preservable por re-exportación—. Nada falta crear
fuera del alcance de la tarea.

## Plan técnico

`cli.js` (915 líneas) mezcla cuatro preocupaciones: gramática,
ayuda, emisores puros y comandos con su orquestación. `main`
es ya la invocación delgada —inyecta `io`, parsea, despacha y
devuelve el código—; el plan reparte el resto por
preocupación con nombre de dominio.

- [x] Crear `src/exits.js` con los seis `EXIT_*` y
  re-exportarlos desde `cli.js`
  - Aporta: los módulos nuevos consumen los códigos sin
    importar de `cli.js` —sin ciclo—; la superficie pública
    `import { EXIT_* } from './cli.js'` se conserva
- [x] Crear `src/usage.js` con `USAGE`, `HELP`, las tablas de
  opciones, `splitArgs`, `parseArgs` y `showHelp`
  - Aporta: gramática y su documentación juntas —`parseArgs`
    ya consulta `HELP`—; solo importa `parseRepoSpec`/
    `isValidRef` de `fetch.js`
- [x] Crear `src/report.js` con `printPlan`, `printGuide`,
  `DRIFT_MARKS`, `reportBackup`, `reportWarnings` y
  `reportExecutionFailure`
  - Aporta: la presentación sin `fs` ni dominio tiene hogar;
    `reportExecutionFailure` importa `ExecutionError` de
    `execute.js` y `EXIT_EXECUTION` de `exits.js`
- [x] Crear `src/commands.js` con los comandos y sus
  colaboradores: `showGuide`, `showList`, `showCheck`,
  `obtainPackage`, `checkVerified`, `settleConflicts`,
  `checkGuideDestination`, `checkBackupDestination`,
  `backupName`, `executeAndReport`, `runInstall`,
  `installUnit`, `selectUnits`, `isDir`, `originOf`,
  `runUpdate`, `runUninstall`
  - Aporta: la capa de comandos queda como unidad cohesiva;
    exporta solo las seis funciones que `main` despacha
  - Contexto: las reglas de pre-flight emiten `err` y mapean
    a códigos —idioma de invocación (D021), su hogar es esta
    capa—
- [x] Reducir `cli.js` a re-exports de `EXIT_*` + `main`
  - Aporta: la invocación vuelve a ser delgada —~40 líneas—
    sin tocar la API pública
- [x] Correr la suite completa y confirmar el 100 % de
  cobertura —los módulos nuevos entran en la exigencia—
  - Aporta: invariancia verificada; la suite no cambia

## Suite de pruebas esperada

- Regresión completa: la suite existente permanece en verde
  sin tocar expectativas ni imports —`main` y `EXIT_*` siguen
  saliendo de `cli.js`—.
- Cobertura: 100 % en `src/` incluidos `exits.js`,
  `usage.js`, `report.js` y `commands.js`.
- Sin casos nuevos: refactor puro, sin comportamiento nuevo.

## Revisión

- Subagente: 2026-10-26 — Aprueba
- Usuario (ejecución): 2026-10-26 — Aprueba
- Usuario (cierre): 2026-10-26 — Aprueba
