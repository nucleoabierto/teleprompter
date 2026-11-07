# Actualizar un paquete

El usuario ejecuta `teleprompter update <paquete>` desde la raíz del
repositorio destino para llevar un paquete instalado a la versión que
publica su origen —la registrada en `teleprompter-lock.json`, o una
indicada en la invocación—. El ciclo de vida de la instalación y la
resolución de las divergencias están definidos en el [dominio de
instalación](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/002-instalacion.md)
y el [dominio de resolución de conflictos](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/004-resolucion-conflictos.md).

## Comportamiento

- **Un paquete instalado desde un `--path` se actualiza desde ese
  origen sin indicarlo:** lo que la versión cambió y sigue intacto se
  sobrescribe, lo nuevo se crea, lo retirado e intacto se elimina, y
  el registro queda a la versión nueva.
- **Una versión entrante igual a la registrada responde que el
  paquete ya está en esa versión** y no escribe nada.
- **Pedir un paquete no instalado, o uno sin origen registrado y sin
  origen explícito, es un error de invocación.**
- **`--path` o un `user/repo[@ref]` explícito sobrescriben el origen
  registrado** y quedan como el nuevo origen; `--ref` cambia solo el
  ref de un origen de repositorio —con `--path` es un error—.
- **Una edición local sobre un recurso que la versión también cambió
  se decide caso a caso:** la consola interactiva pregunta mostrando
  antes el diff entre el destino y la versión entrante, `--force`
  sobrescribe, `--skip` conserva, y sin consola la operación aborta
  sin escribir tras listar cada conflicto con su diff.
- **Un recurso retirado por la versión pero modificado localmente se
  decide igual:** quitar o conservar —conservarlo mantiene su
  registro previo—, con el diff mostrando el contenido local que se
  retiraría.
- **Una colisión decidida a favor de la versión respalda el contenido
  previo:** sobrescribir una edición local o quitar un retirado
  modificado se copia a `.teleprompter/backups/<operación>/`, con la
  versión registrada que se desplaza en el nombre del directorio, y
  lo anuncia con `respaldo:`; conservar no genera copia.
- **Un mapa que cambia de granularidad baja el retirado a lo
  abandonado:** un directorio instalado que la versión nueva declara
  por hijos conserva los hijos entrantes en disco y solo elimina el
  contenido que el mapa nuevo ya no cubre; el caso inverso —hijos
  registrados que colapsan en un directorio entrante— reemplaza el
  subárbol completo.
- **`--dry-run` muestra el plan de actualización completo sin
  escribir nada.**
- **El origen remoto registrado refresca su commit con el de la
  obtención efectiva:** el registro siempre dice qué árbol produjo
  la instalación vigente.
- **Un origen que publica un paquete con otro nombre es error de
  invocación** —no se actualiza nada—.

Véase la [referencia de `update`](referencia-update.md) para la
gramática completa y los códigos de salida.
