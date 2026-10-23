# `uninstall` retira un paquete instalado intacto

## Estado

[ ] Pendiente | [~] En progreso | [r] En revisión | **[x] Completada** | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

Añadir el subcomando `uninstall <paquete>` al ciclo de vida: desde la
raíz del destino, lee la entrada del paquete en el registro, presenta un
plan de retirada completo antes de borrar —una línea por recurso
registrado—, elimina exactamente lo que la instalación escribió y
reescribe el registro sin la entrada del paquete. Es el camino feliz del
flujo: los recursos registrados con deriva quedan conservados con aviso
a la espera de la política de divergencias del borrador siguiente.

## Dependencias

- Ninguna.

## Entrada

- `src/cli.js` — gramática de comandos, `parseArgs`, el reparto de
  `main`, la ayuda estructurada y `originOf`; `update`, `list`, `check`
  y `guide` ya operan sobre el directorio de trabajo como referencia.
- `src/lock.js` — `readLock`, `lockEntries`, `writeLock` y la forma del
  registro: la guía gestionada de `personalization` figura en `files`
  con su acción y su hash, como cualquier otro recurso.
- `src/plan.js` y `src/drift.js` — el vocabulario de plan y la
  clasificación por deriva (`classifyResource`) para decidir qué
  retirar; `recordedChainSafe` en `src/paths.js` como defensa de rutas
  registradas.
- `src/execute.js` — la eliminación de recursos con la guarda de
  escritura dentro del destino.
- `test/` — las suites de CLI, plan y ejecución como modelo de cobertura.

## Resultado esperado

- `teleprompter uninstall <paquete>` muestra el plan de retirada —una
  línea por cada recurso registrado del paquete— antes de borrar nada,
  y elimina los recursos registrados que siguen intactos, incluida la
  copia gestionada de la guía de personalización.
- Un recurso registrado ya ausente no es un error: la retirada limpia su
  entrada igualmente —afirmar que se quitó lo que ya no existe sería
  falso, pero la entrada del paquete sí se retira—.
- Las entradas `skip` no se retiran —la instalación nunca las escribió—
  ni generan acción; caen con la entrada del paquete.
- Un recurso registrado con deriva se conserva y se anuncia como tal en
  el resultado —la política de divergencias llega en el borrador 02—.
- Terminada la retirada, el registro queda reescrito sin la entrada del
  paquete; si era el último, `packages` queda vacío y el lock se
  conserva.
- Pedir un paquete no instalado, o invocar sin registro, es error de
  invocación (código 4); `--dry-run` muestra el plan de retirada sin
  escribir recursos ni registro.
- `uninstall` figura en la ayuda general y tiene su sinopsis, como el
  resto de comandos.

## Criterios de calidad

- El plan de retirada completo se presenta antes de cualquier borrado;
  un plan no ejecutable aborta sin escribir nada.
- Solo se borran rutas registradas que resuelven dentro del destino; una
  ruta registrada insegura no se toca.
- El registro resultante refleja el estado real: lo borrado deja de
  constar, lo conservado por deriva también sale de la entrada —deja de
  pertenecer al paquete—.
- `npm test` en verde con el 100 % de cobertura exigido en `src/`.

## Procedimiento sugerido

1. Definir el vocabulario del plan de retirada —la marca por recurso y
   su presentación— apoyándose en la clasificación por deriva sobre las
   entradas `files` del paquete.
2. Cablear el subcomando: gramática, reparto en `main`, ayuda y
   `--dry-run`; el paquete se nombra por su clave del registro.
3. Ejecutar la retirada sobre los recursos intactos y reescribir el
   registro sin la entrada, con informe de lo retirado y lo conservado
   por deriva.
4. Cubrir la suite: paquete intacto, recursos ausentes, entradas `skip`,
   guía gestionada, último paquete, paquete no instalado y `--dry-run`.

## Notas

- El nombre `uninstall` casa con `install`; otras opciones (`remove`,
  `uninstall` como alias de otro nombre) se deciden al planear la tarea,
  no aquí.
- Un directorio registrado intacto se retira entero; el que contiene
  contenido no registrado diverge y se conserva hasta el borrador 02.

## Contexto

- Archivos similares:
  - `src/cli.js` — `runUpdate` es el modelo de comando que opera sobre el registro del directorio de trabajo: `readLock`, `lockEntry` por nombre, error de invocación si no está instalado, `printPlan`, flags, corte de `--dry-run` y reporte; `showCheck`/`showList` recorren `lockEntries`. `parseArgs`/`splitArgs`, `USAGE` y `HELP` son los puntos de la gramática a extender.
  - `src/lock.js` — `readLock`/`lockEntry`/`lockEntries` y la forma de la entrada: `files[]` con `{target, action, sha256?}` —la guía gestionada figura como una entrada más con acción `create`/`overwrite` y el campo `personalization` la repite—; `writeLock` fusiona por paquete y escribe atómico (tmp + rename), pero hoy no existe función que retire una entrada.
  - `src/drift.js` — `classifyResource(destDir, {target, sha256})` → `intact`/`modified`/`missing`/`unverifiable`: la clasificación que decide qué se retira; revalida con `recordedChainSafe` antes de leer.
  - `src/plan.js` — `classifyRemoval` es el modelo de retirada de una entrada registrada: intacta → `retire`, ausente → sale del plan, divergente → conflicto `removal`; `canon` normaliza targets con separador final incluido.
  - `src/execute.js` — `executePlan` aplica la acción `remove` con la guarda `resolvesUnder` sobre la cadena padre y `fs.rmSync` recursivo; `backupConflict` existe para los pasos destructivos (lo cablea la tarea 043).
  - `test/cli.test.js` — `run(argv, io)` con io inyectado y el fixture `installed(...)` fijan el escenario de comandos sobre el lock; es el modelo de cobertura.
- Patrones:
  - Los comandos del ciclo de vida sobre lo instalado operan en `io.cwd` sin destino posicional (`guide`, `list`, `check`, `update`).
  - Salida en español por `out`/`err`; errores de invocación código 4, de plan 2, de ejecución 3.
  - Plan completo y visible antes de escribir (D005): `printPlan` imprime `  <marca, 15 columnas><target>`.
  - El lock es dato no confiable: toda ruta registrada se revalida; `recordedChainSafe` basta para operaciones hoja-atómicas como `rm`/`lstat`.
  - Reescritura atómica del lock: temporal + renombrado, como `writeLock`; el resto de entradas se preserva tal cual.
- Dominio: `docs/domains/002-instalacion.md` — el dominio del ciclo de vida: registro, plan, deriva, ejecución; la retirada lo extiende.
- Producto: `manual/` — `guia-de-uso.md`, `index.md` y las referencias por comando fijan la forma de la referencia nueva; `referencia-list.md` y `referencia-check.md` describen el estado posterior a la retirada.
- PRD: `docs/prd/008-desinstalacion-paquetes.md` — CU-1 «Retirar un paquete instalado» con sus variantes: el recurso ya ausente limpia su entrada, la guía gestionada se retira, las entradas `skip` no se tocan, pedir un paquete no instalado o invocar sin registro es error de invocación, `--dry-run` no escribe.
- Lecciones: `revision-tecnica-subagente` — la revisión técnica se lanza con un subagente que puede ejecutar comandos. `documentacion-viva` — los documentos nuevos no registran acciones puntuales históricas.
- Decisiones:
  - D005 — plan completo antes de escribir, aborto total si no es ejecutable.
  - D006 — política de colisiones: la resolución de divergencias es la tarea 043; aquí lo divergente solo se conserva con aviso.
  - D007 — el registro es la base de propiedad: solo lo registrado se retira.
  - D013 — `classifyResource` y las marcas de deriva que `check` ya expone.
  - D014 — el `origin` del resto de entradas se preserva intacto en la reescritura.
  - D015 — política de retirados: intacto se elimina, ausente sale en silencio, divergente degrada a decisión —el modelo que 043 completará—.
  - D016 — `remove`/`keep` como vocabulario de ejecución; comando propio sobre el cwd que nombra el paquete por el lock.

## Conectividad

**Veredicto: conectada.**

Todo lo que la tarea asume existe con la forma esperada: la gramática
y el reparto de comandos viven en `parseArgs`/`main` de `src/cli.js`
con `update` como precedente de operación sobre el lock del cwd; el
registro se lee con `readLock`/`lockEntry` y la entrada trae `files[]`
con acción y hash —la guía gestionada incluida—; `classifyResource`
clasifica la deriva por recurso y `recordedChainSafe` revalida las
rutas registradas; la eliminación con guarda de escritura ya existe
en `executePlan` como acción `remove`. La única pieza ausente —una
reescritura del lock que retire la entrada del paquete, porque
`writeLock` solo fusiona— es absorbible dentro del alcance de la
tarea como variante de la escritura atómica existente.

## Plan técnico

`cli.js` reparte comandos sobre `argv`; los del ciclo de vida (`update`, `list`, `check`, `guide`) operan sobre el lock de `io.cwd` sin destino posicional. El lock guarda por paquete `files[]` con `{target, action, sha256?}` —la guía gestionada y los `skip` incluidos—. `classifyResource` clasifica la deriva por recurso con defensa de rutas registradas, y `executePlan` ya aplica `remove` con la guarda de escritura. El plan de retirada usa la misma forma que el de `update`, así que «divergente se conserva» cambiará a «conflicto `removal`» en la 043 sin tocar la ejecución.

- [x] `buildUninstallPlan(destDir, record)` en `src/plan.js` —por cada entrada `files[]` que no sea `skip`: `classifyResource` → `intact`→`retire`, `missing`→sale del plan en silencio, `modified`/`unverifiable`→`keep`. El plan conserva la forma de siempre (`mkdirs` vacío, `resources` en orden registrado, `conflicts` por filtro —vacío aquí—, `retired` vacío).
  - Aporta: la pieza del dominio y la costura de la 043 —un día `keep` pasa a `conflict`/`removal` y `settleConflicts` lo recoge sin más cambios—.
  - Contexto: `keep` es estado de plan, no resolución; los ausentes salen sin marca como en el plan de `update` (D015); la guía gestionada se trata como un recurso más, sin la excepción `replacedGuide` de D015 que era propia de `update`.
- [x] `keep` en el mapa de acciones de `executePlan` (`keep → keep`) —la rama `else` ya publica la acción sin tocar el disco—.
  - Aporta: el resultado anuncia lo conservado por deriva con el vocabulario de D016.
- [x] `removeLockEntry(destDir, lock, name)` en `src/lock.js` —reescritura atómica del registro sin la entrada: extraer el bloque tmp+rename de `writeLock` a un auxiliar compartido y componer `packages` sin la clave—.
  - Aporta: el registro deja de afirmar el paquete retirado; el lock persiste aunque `packages` quede vacío.
- [x] Gramática, ayuda y `runUninstall` en `src/cli.js` —`uninstall <paquete> [--dry-run]` con exactamente un posicional; `--path`/`--ref`/`--package` y `--force`/`--skip` → invocación inválida; línea en `USAGE`, entrada `HELP.uninstall`, reparto en `main`. El flujo: `readLock` → `lockEntry` (ausente → código 4) → `buildUninstallPlan` → `printPlan` «plan de retirada:» → `settleConflicts` (no-op hoy, es la costura) → corte `--dry-run` → `executePlan` + `removeLockEntry` + reporte `resultado:`/`desinstalado: <pkg>@<ver>`, con informe de lo aplicado ante `ExecutionError`.
  - Aporta: la superficie completa y el flujo D005 —plan visible antes de borrar, nada escrito si no se ejecuta—.
  - Contexto: `--force`/`--skip` se rechazan porque su semántica —decidir divergencias— llega con la 043; aceptarlas como no-ops ocultaría intención. `uninstall` es el nombre pareja de `install`; `remove` ya es acción de ejecución.
- [x] Cobertura de la suite hasta el 100 % exigido en `src/`.
  - Aporta: el criterio de calidad de la tarea.

## Suite de pruebas esperada

Todas las expectativas trazan a CU-1 del PRD del conjunto.

- Un paquete con recursos intactos: el plan muestra `retire` por recurso, los archivos desaparecen, el lock queda sin la entrada y reporta `desinstalado: <pkg>@<ver>`. (CU-1, O)
- Un directorio registrado intacto se retira entero —y el que contiene contenido no registrado diverge y se conserva—. (CU-1, B)
- Un recurso registrado ya ausente no genera acción ni error; la entrada del paquete se retira igual. (CU-1, B)
- Una entrada `skip` no se toca ni produce acción; cae con la entrada del paquete. (CU-1, B)
- La guía gestionada registrada se retira con su paquete. (CU-1, O)
- Con varios paquetes instalados, solo la entrada pedida desaparece del lock. (CU-1, M)
- Si era el último paquete, el lock persiste con `packages` vacío. (CU-1, Z)
- Un recurso modificado se conserva: sigue en disco, el plan y el resultado lo anuncian `keep`, y la entrada del paquete se retira. (CU-1, B)
- Una entrada sin hash o con ruta insegura nunca se borra —`keep` en el plan, archivo intacto—. (CU-1, E)
- Sin argumento, con argumentos extra, con `--path`/`--ref`/`--package`/`--force`/`--skip`, o paquete no instalado —incluido sin registro y con lock corrupto—: error de invocación (4). (CU-1, E)
- `--dry-run` muestra el plan completo sin escribir recursos ni registro. (CU-1, I)
- `uninstall --help` y `help uninstall` muestran la sinopsis; el comando figura en la ayuda general. (CU-1, I)
- Un fallo a mitad de retirada reporta lo ya aplicado y sale con código 3. (CU-1, E)
- Tras `uninstall`, `list` no lo muestra y `check` no lo reporta. (CU-1, criterio de cierre)

## Desviaciones del plan

- **`settleConflicts` no se cablea en `runUninstall`:** el plan lo
  incluía como costura no-op, pero con `conflicts` siempre vacío el
  call dejaba una rama de código muerto (`unresolved !== null` jamás
  se cumple) incompatible con la cobertura exigida. Se retiró: la
  costura real para la 043 vive en la forma del plan —`conflicts`
  por filtro y entradas `conflict`/`removal`— y en `executePlan`,
  que ya traduce `removal` a `remove`/`keep`; cablear la resolución
  es una línea del diff de la 043.

## Revisión

- Subagente: 2026-10-23 — Aprueba
- Usuario (ejecución): 2026-10-23 — Aprueba
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
