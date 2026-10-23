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
  contenido añadido a mano diverge y se conserva anunciado como `keep`.
  — módulo `test/cli.test.js` («uninstall removes a recorded directory
  whole», «uninstall keeps a recorded directory the user added content
  to»)
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
- Un recurso modificado localmente se conserva: sigue en disco, se
  anuncia como `keep` en el plan y en el resultado, y deja de
  pertenecer al paquete. — módulo `test/cli.test.js`, «uninstall keeps
  a locally modified resource and says so»
- Una ruta registrada insegura o no verificable nunca se borra.
  — módulo `test/cli.test.js`, «uninstall never deletes a recorded
  path that is unsafe or unverifiable»
- Pedir un paquete no instalado —incluido sin registro o con el lock
  ilegible— y cualquier opción ajena al comando son errores de
  invocación. — módulo `test/cli.test.js` («uninstall rejects malformed
  invocations with code 4», «uninstall exits 4 when the package is not
  installed or there is no lock», «uninstall exits 4 on a corrupt lock
  after the warning»)
- `--dry-run` muestra el plan de retirada sin escribir recursos ni
  registro. — módulo `test/cli.test.js`, «uninstall --dry-run shows
  the plan and writes nothing»
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
