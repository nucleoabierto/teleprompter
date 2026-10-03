# Actualizar un paquete

`teleprompter update <paquete>` lleva un paquete instalado a la
versión que publica su origen —la registrada en `teleprompter-lock.json`,
o una indicada en la invocación—. Se ejecuta desde la raíz del
repositorio destino.

## Escenarios que la suite verifica

- Un paquete instalado desde un `--path` se actualiza desde ese
  origen sin indicarlo: lo que la versión cambió y sigue intacto se
  sobrescribe, lo nuevo se crea, lo retirado e intacto se elimina, y
  el registro queda a la versión nueva.
- Si la versión entrante coincide con la registrada, responde que el
  paquete ya está en esa versión y no escribe nada.
- Pedir un paquete no instalado, o uno sin origen registrado y sin
  origen explícito, es un error de invocación.
- `--path` o un `user/repo[@ref]` explícito sobrescriben el origen
  registrado y quedan como el nuevo origen; `--ref` cambia solo el
  ref de un origen de repositorio —con `--path` es un error—.
- Una edición local sobre un recurso que la versión también cambió
  se decide caso a caso: la consola interactiva pregunta, `--force`
  sobrescribe, `--skip` conserva, y sin consola la operación aborta
  sin escribir.
- Un recurso retirado por la versión pero modificado localmente se
  decide igual: quitar o conservar —conservarlo mantiene su registro
  previo—.
- Si el mapa cambia de granularidad, el retirado baja a lo
  abandonado: un directorio instalado que la versión nueva declara
  por hijos conserva los hijos entrantes en disco y solo elimina el
  contenido que el mapa nuevo ya no cubre —módulo
  `test/cli.test.js` («update keeps incoming children when the map
  moves from a directory to per-child targets»)—; el caso inverso
  —hijos registrados que colapsan en un directorio entrante—
  reemplaza el subárbol completo («update replaces the subtree
  wholesale when the map collapses children into a directory
  target»).
- `--dry-run` muestra el plan de actualización completo sin escribir
  nada.
- Si el origen publica un paquete con otro nombre, la invocación es
  un error —no se actualiza nada—.

Véase la [referencia de `update`](referencia-update.md) para la
gramática completa y los códigos de salida.
