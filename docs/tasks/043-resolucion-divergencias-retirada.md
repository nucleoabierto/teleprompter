# Resolución de divergencias en la retirada

## Estado

[ ] Pendiente | [~] En progreso | [r] En revisión | **[x] Completada** | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

Convertir los recursos registrados con deriva en decisiones del flujo de
desinstalación, con la misma política de conflictos del resto del
producto: en consola interactiva se pregunta por cada uno mostrando el
diff del contenido local que se retiraría, `--force` los retira todos,
`--skip` los conserva todos y, sin consola ni flags, se listan con su
diff y la operación aborta sin escribir. Una divergencia decidida a
retirar se respalda antes de borrarse; una conservada queda en disco y
fuera del registro del paquete retirado.

## Dependencias

- 042.

## Entrada

- `src/cli.js` — `settleConflicts` y su superficie de anuncio
  (listado no interactivo y pregunta interactiva), `parseArgs` con
  `--force`/`--skip` mutuamente excluyentes.
- `src/diff.js` — `diffResource` ya trata un conflicto `removal` como
  lado entrante vacío: el contenido local se muestra como retirado.
- `src/plan.js` y `src/drift.js` — los conflictos `removal` del plan de
  actualización (`remove`/`keep`, D016) como modelo de la decisión.
- `src/execute.js` — `backupConflict`: la copia previa al paso
  destructivo en `.teleprompter/backups/<operación>/`.
- `test/` — las coberturas de conflicto de `update` como modelo.

## Resultado esperado

- Un recurso registrado modificado localmente se anuncia con el diff del
  contenido local que se retiraría y se decide quitar o conservar —
  interactiva, `--force`, `--skip` o aborto con listado según el
  contexto de invocación.
- Una divergencia decidida a retirar se respalda en
  `.teleprompter/backups/` antes de borrarse y el resultado lo anuncia
  con `respaldo:`.
- Conservar deja el recurso en disco y fuera del registro: deja de
  pertenecer al paquete retirado sin que el registro mienta.
- Un directorio registrado con contenido local no registrado diverge y
  recibe el mismo tratamiento —decisión, no borrado a ciegas—.
- El plan de retirada se sigue presentando completo antes de decidir ni
  borrar nada.

## Criterios de calidad

- La política aplicada es la de conflictos del producto (D006): mismas
  superficies, mismas flags y misma exclusión mutua.
- El diff anunciado corresponde al contenido local real que se
  retiraría; los intactos no producen anuncio.
- El respaldo precede a todo borrado decidido, como en `install` y
  `update`.
- El registro queda coherente en cualquier combinación de decisiones:
  lo retirado deja de constar y lo conservado queda sin paquete dueño.
- `npm test` en verde con el 100 % de cobertura exigido en `src/`.

## Procedimiento sugerido

1. Pasar los conservados-por-deriva del plan de retirada a conflictos
   `removal` —el borrador 01 ya los clasifica— y engancharlos a
   `settleConflicts` con el diff local como lado retirado.
2. Resolver `remove`/`keep` por respuesta y por flag, con las mismas
   reglas de exclusión y de aborto no interactivo.
3. Respaldar el contenido divergente decidido a retirar antes de
   borrarlo, reutilizando la mecánica de respaldo.
4. Cubrir la suite: cada superficie de decisión, respaldo de lo
   retirado, conservación y registro resultante.

## Contexto


- Archivos similares:
  - `src/plan.js` — `buildUninstallPlan` ya clasifica la deriva de cada entrada registrada; su marca `keep` es la costura a convertir en `conflict`/`removal`. `classifyRemoval` es el modelo de la degradación: intacto → `retire`, ausente → sale, divergente → `{status: 'conflict', removal: true}`.
  - `src/cli.js` — `settleConflicts` ya implementa la política entera sobre `plan.conflicts`: `--force`/`--skip` deciden, consola interactiva pregunta con el diff antes («¿quitar?» para `removal`), sin consola lista con diff y aborta; los `removal` se reportan `remove`/`keep`. `checkBackupDestination`, `backupName` y `reportBackup` son el preflight, el nombre y el anuncio del respaldo. `runUninstall` tiene el hueco entre `printPlan` y el corte de `--dry-run` donde la maquinaria se engancha.
  - `src/diff.js` — `diffResource` trata `resource.removal === true` como lado entrante vacío sin tocar `pkgDir`: todo el contenido local se muestra como retirado.
  - `src/execute.js` — `REMOVAL_RESOLUTION` traduce `overwrite`/`skip` a `remove`/`keep`; con `backupRoot` y `status === 'conflict'` el paso `remove` respalda antes con `backupConflict`, y el respaldo hecho se reporta aunque el borrado falle.
  - `test/cli.test.js` — las coberturas de conflicto `removal` de `update` (pregunta con diff, `--force`/`--skip`, respaldo con nombre `-<pkg>@<ver>`, listado y aborto no interactivo, `respaldo:` en el informe) son el modelo de la suite.
- Patrones:
  - La política de conflictos es única (D006): `settleConflicts` es el único lugar donde se decide; los comandos solo la invocan entre el plan impreso y el corte de `--dry-run`.
  - Plan completo y visible antes de escribir (D005): el preflight del respaldo corre antes del corte del dry-run, igual que `checkGuideDestination`/`checkBackupDestination` en `update`.
  - El respaldo precede al paso destructivo y vive bajo `.teleprompter/backups/<estampa>-<pkg>@<versión>`; la versión se interpola solo si tiene forma semver.
  - Vocabulario interno `overwrite`/`skip` en la resolución, producto `remove`/`keep` en el anuncio (D016).
  - El lock es dato no confiable: una ruta registrada insegura degrada a conflicto; forzarla a `remove` falla en la guarda de ejecución, nunca borra fuera.
- Dominio: `docs/domains/002-instalacion.md` — el concepto Plan de retirada ya declara que `keep` es un estado de plan a la espera de esta política; las entidades y la operación `uninstall` cambian con la degradación.
- Producto: `manual/referencia-uninstall.md`, `manual/006-desinstalar-un-paquete.md` y `manual/guia-de-uso.md` — la superficie del comando gana `--force`/`--skip` y las superficies de decisión.
- PRD: `docs/prd/008-desinstalacion-paquetes.md` — CU-2 «Decidir sobre recursos modificados»: anuncio con diff del contenido que se retiraría, decisión quitar/conservar con respaldo previo, listado con diff y aborto sin consola, `--force`/`--skip` excluyentes y lo conservado fuera del registro.
- Lecciones: `revision-tecnica-subagente` — la revisión técnica se lanza con un subagente que puede ejecutar comandos.
- Decisiones:
  - D005 — plan completo antes de escribir; aborto total si no es ejecutable —incluido el preflight del respaldo—.
  - D006 — política de colisiones: mismas superficies, mismas flags, misma exclusión mutua que el resto del producto.
  - D015 — el divergente degrada a conflicto `removal`: `overwrite` significa quitar, `skip` conservar.
  - D016 — vocabulario `remove`/`keep` en la superficie de decisión.

## Conectividad


**Veredicto: conectada.**

Todo lo que la tarea asume existe con la forma esperada:
`settleConflicts` (`src/cli.js`) ya ejecuta la política completa sobre
`plan.conflicts` —flags, pregunta «¿quitar?» con diff previo, listado
con diff y aborto— y reporta los `removal` como `remove`/`keep`;
`diffResource` (`src/diff.js`) trata `removal === true` como lado
entrante vacío sin leer `pkgDir`; `executePlan` (`src/execute.js`)
traduce las resoluciones con `REMOVAL_RESOLUTION` y respalda el paso
`remove` cuando llega `backupRoot` y la entrada es `conflict`;
`checkBackupDestination` y `reportBackup` (`src/cli.js`) son
reutilizables sin cambios. La pieza que falta es absorbible por la
propia tarea: `backupName` recibe un manifiesto del que solo usa el
nombre —`uninstall` no tiene manifiesto— y `parseArgs` rechaza hoy
`--force`/`--skip` en `uninstall`; ambos ajustes entran en el alcance.

## Plan técnico


La tarea 042 dejó la costura deliberada: `buildUninstallPlan` marca lo
divergente `keep` —estado de plan, no decisión— y `runUninstall` no
llama a `settleConflicts`. Toda la maquinaria de decisión ya existe y
trata los conflictos `removal` como caso propio: `settleConflicts`
pregunta «¿quitar?» con diff previo, reporta `remove`/`keep` y lista
con diff en no interactivo; `diffResource` muestra el lado entrante
vacío sin tocar `pkgDir`; `executePlan` traduce `overwrite`→`remove`,
`skip`→`keep` y respalda lo `conflict` antes de borrar. El cambio es
cablear, no construir.

- [x] Degradar la marca `keep` a conflicto `removal` en `buildUninstallPlan` (`src/plan.js`) —el divergente (`modified`/`unverifiable`) emite `{target, status: 'conflict', removal: true}`; el filtro `conflicts` del plan lo recoge sin cambios y el bloque de comentario se reescribe para el modelo final—
  - Aporta: la pieza del dominio —el plan de retirada adopta el modelo de decisión de `update` (D015)— y `plan.conflicts` deja de ser vacío
  - Contexto: la entrada `keep` del mapa `ACTION` de `src/execute.js` queda muerta —ningún plan emite ya estado `keep`—; se elimina en la misma acción (el `keep` como acción sigue llegando por `REMOVAL_RESOLUTION`)
- [x] Enganchar la política en `runUninstall` (`src/cli.js`) —tras `printPlan`: `settleConflicts(io, out, err, parsed.flags, plan, destDir, destDir)`, luego `checkBackupDestination(destDir, plan, err)`, después el corte de `--dry-run`, mismo orden que `update`—
  - Aporta: las tres superficies de decisión de D006 entran en el flujo antes de cualquier escritura; el preflight del respaldo mantiene el aborto total (D005)
  - Contexto: `destDir` hace las veces de `pkgDir` en `settleConflicts`, que los conflictos `removal` nunca leen
- [x] Respaldar lo decidido a retirar —`backupRoot` cuando algún conflicto resolvió `overwrite`, pasado a `executePlan`, y `reportBackup` en el resultado y en el informe de fallo—
  - Aporta: el paso destructivo decidido deja copia bajo `.teleprompter/backups/`, como en `install`/`update`
  - Contexto: `backupName(manifest, lock)` solo usa `manifest.name` —cambia su firma a `(nombre, lock)`; el llamador existente pasa `manifest.name` y `runUninstall` pasa `parsed.pkg`
- [x] Abrir la gramática y la ayuda —`parseArgs` deja de rechazar `--force`/`--skip` en `uninstall` (la exclusión mutua la sigue dando `splitArgs`), `USAGE` lista las flags también para `uninstall` y `HELP.uninstall` documenta la decisión sobre divergencias—
  - Aporta: la superficie completa del comando refleja la política
- [x] Cubrir la suite esperada hasta el 100 % exigido en `src/`

## Suite de pruebas esperada


- Sin consola ni flags, un recurso modificado lista `conflicto sin resolver:` con el diff del contenido local como retirado y aborta con código 2 sin escribir nada —ni recursos, ni respaldos, ni registro—. (CU-2; I)
- En consola, cada divergencia pregunta `¿quitar?` con su diff ya mostrado; «sí» lo retira con respaldo, «no» lo conserva; el resultado anuncia `→ remove`/`→ keep`. (CU-2; I)
- `--force` retira todas las divergencias con respaldo previo bajo `.teleprompter/backups/<estampa>-<pkg>@<ver>` y el resultado anuncia `respaldo:`. (CU-2; M)
- `--skip` las conserva todas, anuncia `→ keep` y no crea respaldo. (CU-2; M)
- Lo conservado queda en disco pero fuera del registro: la entrada del paquete desaparece y `check` no lo reporta. (CU-2; B)
- Un directorio registrado con contenido local no registrado diverge y se decide como cualquier divergencia —no se borra a ciegas—; decidido a retirar, su subárbol se respalda. (CU-2; B)
- Un recurso no verificable —entrada sin hash— es conflicto y se decide, no se conserva en silencio; una ruta registrada insegura forzada a retirar falla como error de ejecución sin tocar nada fuera del destino. (CU-2; E, seguridad)
- `--dry-run` con divergencias no interactivo lista los diffs y aborta sin escribir; con `--force` resuelve por adelantado y corta sin escribir. (CU-1/CU-2; I)
- Paquete mixto: lo intacto figura `retire` y se elimina sin decisión, lo divergente se decide. (CU-1/CU-2; O)
- `--force`/`--skip` aceptados en `uninstall` y mutuamente excluyentes; la ayuda del comando y la general los documentan. (arnés/regresión)
- Raíz de respaldo que escapa del destino → `plan no ejecutable` (2) antes de escribir. (CU-2; E)
- Un borrado decidido que falla tras su respaldo reporta lo aplicado y el `respaldo:` ya hecho, código 3. (CU-2; E)
- Regresión CU-1: paquete intacto sin divergencias se retira sin preguntar; ausentes y `skip` sin acción; `list`/`check` coherentes tras la retirada.
- Unitario del plan: divergente → `conflict`+`removal`, intacto → `retire`, ausente y `skip` sin entrada.
- 100 % de cobertura en `src/`.

## Revisión

- Subagente: 2026-10-26 — Aprueba
- Usuario (ejecución): 2026-10-26 — Aprueba
- Usuario (cierre): 2026-10-26 — Aprueba
