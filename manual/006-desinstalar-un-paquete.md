# Desinstalar un paquete

`teleprompter uninstall <paquete>` retira del repositorio los recursos
que un paquete instalado registró —solo lo que la instalación escribió—
y deja el registro sin su entrada. Se ejecuta desde la raíz del
repositorio destino.

## Escenarios que la suite verifica

- Un paquete instalado intacto se retira completo: el plan de retirada
  se muestra antes de borrar —una línea por recurso—, los recursos
  desaparecen del destino y el paquete deja de constar en el registro.
  — módulo `test/cli.test.js`, «uninstall removes an intact installed
  package and its lock entry»
- Un directorio registrado intacto se retira entero; el que contiene
  contenido añadido a mano diverge y pasa a decisión —conservado queda
  en disco; decidido a retirar se respalda con su subárbol, contenido
  local incluido—. — módulo `test/cli.test.js` («uninstall removes a
  recorded directory whole», «uninstall decides a recorded directory
  the user added content to», «uninstall --force backs up a divergent
  directory subtree, local files included»)
- Un recurso registrado ya ausente no es un error: limpia su entrada
  igualmente. — módulo `test/cli.test.js`, «uninstall cleans the entry
  of a resource already gone»
- Las entradas `skip` no se tocan —la instalación nunca las escribió—
  y caen con la entrada del paquete. — módulo `test/cli.test.js`,
  «uninstall does not touch a resource recorded as skipped»
- La guía gestionada de personalización se retira con su paquete.
  — módulo `test/cli.test.js`, «uninstall retires the managed guide
  with its package»
- Con varios paquetes instalados, solo la entrada pedida desaparece
  del registro; si era el último, el lock persiste vacío. — módulo
  `test/cli.test.js` («uninstall removes only the named entry from the
  registry», «uninstall of the last package leaves the lock with empty
  packages»)
- Un recurso modificado localmente se anuncia con el diff del
  contenido que se retiraría y se decide quitarlo o conservarlo: en
  consola interactiva se pregunta `¿quitar?` por cada divergencia con
  su diff ya mostrado, `--force` las retira todas y `--skip` las
  conserva todas; sin consola ni opciones, se listan con su diff y la
  operación aborta sin escribir. — módulo `test/cli.test.js`
  («uninstall lists a divergent resource with its diff and aborts
  without a console», «uninstall asks about removing each divergence
  with its diff shown first», «uninstall --force removes every
  divergence with a backup», «uninstall --skip keeps a locally
  modified resource and says so»)
- Lo decidido a retirar se respalda antes bajo
  `.teleprompter/backups/<estampa>-<paquete>@<versión>` y el resultado
  lo anuncia con `respaldo:`; lo conservado queda en disco y fuera del
  registro. — módulo `test/cli.test.js` («uninstall --force removes
  every divergence with a backup», «uninstall --skip leaves the kept
  resource on disk and out of the registry», «uninstall reports the
  backup already made when a decided removal fails»)
- En un paquete mixto, lo intacto se retira sin decisión y solo lo
  divergente se decide. — módulo `test/cli.test.js`, «uninstall
  retires the intact resources and decides the divergent ones»
- Una ruta registrada insegura o no verificable es divergencia
  decidible: conservada queda intacta y forzada a retirar falla como
  error de ejecución sin tocar nada fuera del destino. — módulo
  `test/cli.test.js` («uninstall never deletes a recorded path that is
  unsafe or unverifiable», «uninstall --force on an unsafe recorded
  path fails as an execution error»)
- Si la raíz de respaldos escapa del destino, el plan se declara no
  ejecutable antes de escribir nada. — módulo `test/cli.test.js`,
  «uninstall aborts the plan when the backup root escapes the
  destination»
- Pedir un paquete no instalado —incluido sin registro o con el lock
  ilegible— y cualquier opción ajena al comando son errores de
  invocación. — módulo `test/cli.test.js` («uninstall rejects malformed
  invocations with code 4», «uninstall exits 4 when the package is not
  installed or there is no lock», «uninstall exits 4 on a corrupt lock
  after the warning»)
- `--dry-run` muestra el plan de retirada sin escribir recursos ni
  registro; con divergencias y sin consola lista sus diffs y aborta,
  y con `--force` resuelve por adelantado y corta sin escribir.
  — módulo `test/cli.test.js` («uninstall --dry-run shows the plan and
  writes nothing», «uninstall --dry-run lists divergences and aborts,
  and resolves ahead with --force»)
- Un fallo a mitad de la retirada —al borrar o al reescribir el
  registro— reporta lo ya aplicado y sale con error de ejecución.
  — módulo `test/cli.test.js` («uninstall reports the applied actions
  when a removal fails midway», «uninstall reports the applied actions
  when the lock rewrite fails»)
- Tras la retirada, `list` y `check` describen el destino real: el
  paquete ya no figura en ninguno. — módulo `test/cli.test.js`, «after
  uninstall, list and check no longer report the package»

Véase la [referencia de `uninstall`](referencia-uninstall.md) para la
gramática completa y los códigos de salida.
