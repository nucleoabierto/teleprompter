# Desinstalar un paquete

El usuario ejecuta `teleprompter uninstall <paquete>` desde la raíz
del repositorio destino para retirar los recursos que un paquete
instalado registró —solo lo que la instalación escribió— y dejar el
registro sin su entrada. El ciclo de vida de la instalación está
definido en el [dominio de
instalación](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/002-instalacion.md)
y la resolución de las divergencias, en el [dominio de resolución de
conflictos](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/004-resolucion-conflictos.md).

## Comportamiento

- **Un paquete instalado intacto se retira completo:** el plan de
  retirada se muestra antes de borrar —una línea por recurso—, los
  recursos desaparecen del destino y el paquete deja de constar en
  el registro.
- **Un directorio registrado intacto se retira entero;** el que
  contiene contenido añadido a mano diverge y pasa a decisión
  —conservado queda en disco; decidido a retirar se respalda con su
  subárbol, contenido local incluido—.
- **Un recurso registrado ya ausente no es un error:** limpia su
  entrada igualmente.
- **Las entradas `skip` no se tocan** —la instalación nunca las
  escribió— y caen con la entrada del paquete.
- **La guía gestionada de personalización se retira con su paquete.**
- **Con varios paquetes instalados, solo la entrada pedida desaparece
  del registro;** si era el último, el registro persiste vacío.
- **Un recurso modificado localmente se decide con el diff del
  contenido que se retiraría:** quitarlo o conservarlo.
- **En consola interactiva se pregunta `¿quitar?` por cada
  divergencia** con su diff ya mostrado, `--force` las retira todas
  y `--skip` las conserva todas; sin consola ni opciones, se listan
  con su diff y la operación aborta sin escribir.
- **Lo decidido a retirar se respalda antes** bajo
  `.teleprompter/backups/<fecha>-<paquete>@<versión>` y el
  resultado lo anuncia con `respaldo:`; lo conservado queda en disco
  y fuera del registro.
- **En un paquete mixto, lo intacto se retira sin decisión** y solo
  lo divergente se decide.
- **Una ruta registrada insegura o no verificable es divergencia
  decidible:** conservada queda intacta; si se fuerza su retirada,
  la operación falla como error de ejecución sin tocar nada fuera
  del destino.
- **Una raíz de respaldos que escapa del destino declara el plan no
  ejecutable** antes de escribir nada.
- **Pedir un paquete no instalado es error de invocación** —incluso
  cuando no hay registro o este es ilegible—, igual que cualquier
  opción ajena al comando.
- **`--dry-run` muestra el plan de retirada sin escribir recursos ni
  registro;** con divergencias y sin consola lista sus diffs y
  aborta, y con `--force` resuelve por adelantado y corta sin
  escribir.
- **Un fallo a mitad de la retirada —al borrar o al reescribir el
  registro— reporta lo ya aplicado** y sale con error de ejecución.
- **Tras la retirada, `list` y `check` describen el destino real:**
  el paquete ya no figura en ninguno.

Véase la [referencia de `uninstall`](referencia-uninstall.md) para
la gramática completa y los códigos de salida.
