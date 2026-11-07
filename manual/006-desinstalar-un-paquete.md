# Desinstalar un paquete

`teleprompter uninstall <paquete>` retira del repositorio los recursos
que un paquete instalado registró —solo lo que la instalación escribió—
y deja el registro sin su entrada. Se ejecuta desde la raíz del
repositorio destino.

## Escenarios

- Un paquete instalado intacto se retira completo: el plan de retirada
  se muestra antes de borrar —una línea por recurso—, los recursos
  desaparecen del destino y el paquete deja de constar en el registro.
- Un directorio registrado intacto se retira entero; el que contiene
  contenido añadido a mano diverge y pasa a decisión —conservado queda
  en disco; decidido a retirar se respalda con su subárbol, contenido
  local incluido—.
- Un recurso registrado ya ausente no es un error: limpia su entrada
  igualmente.
- Las entradas `skip` no se tocan —la instalación nunca las escribió—
  y caen con la entrada del paquete.
- La guía gestionada de personalización se retira con su paquete.
- Con varios paquetes instalados, solo la entrada pedida desaparece
  del registro; si era el último, el lock persiste vacío.
- Un recurso modificado localmente se anuncia con el diff del
  contenido que se retiraría y se decide quitarlo o conservarlo: en
  consola interactiva se pregunta `¿quitar?` por cada divergencia con
  su diff ya mostrado, `--force` las retira todas y `--skip` las
  conserva todas; sin consola ni opciones, se listan con su diff y la
  operación aborta sin escribir.
- Lo decidido a retirar se respalda antes bajo
  `.teleprompter/backups/<estampa>-<paquete>@<versión>` y el resultado
  lo anuncia con `respaldo:`; lo conservado queda en disco y fuera del
  registro.
- En un paquete mixto, lo intacto se retira sin decisión y solo lo
  divergente se decide.
- Una ruta registrada insegura o no verificable es divergencia
  decidible: conservada queda intacta y forzada a retirar falla como
  error de ejecución sin tocar nada fuera del destino.
- Si la raíz de respaldos escapa del destino, el plan se declara no
  ejecutable antes de escribir nada.
- Pedir un paquete no instalado —incluido sin registro o con el lock
  ilegible— y cualquier opción ajena al comando son errores de
  invocación.
- `--dry-run` muestra el plan de retirada sin escribir recursos ni
  registro; con divergencias y sin consola lista sus diffs y aborta,
  y con `--force` resuelve por adelantado y corta sin escribir.
- Un fallo a mitad de la retirada —al borrar o al reescribir el
  registro— reporta lo ya aplicado y sale con error de ejecución.
- Tras la retirada, `list` y `check` describen el destino real: el
  paquete ya no figura en ninguno.

Véase la [referencia de `uninstall`](referencia-uninstall.md) para la
gramática completa y los códigos de salida.
