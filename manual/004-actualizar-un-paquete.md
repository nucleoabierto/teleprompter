# Actualizar un paquete

El usuario ejecuta `teleprompter update <paquete>` desde la raíz del
repositorio destino para llevar un paquete instalado a la versión que
publica su origen —el registrado en `teleprompter-lock.json`, o uno
indicado en la invocación—. El ciclo de vida de la instalación está
definido en el [dominio de
instalación](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/002-instalacion.md)
y la resolución de las colisiones, en el [dominio de resolución de
conflictos](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/004-resolucion-conflictos.md).

## Comportamiento

- **Una actualización decide recurso a recurso:** lo que la versión
  cambió y sigue intacto se sobrescribe, lo nuevo se crea, lo
  retirado e intacto se elimina, y el registro pasa a la versión
  nueva.
- **Un paquete instalado desde un `--path` se actualiza desde ese
  origen sin indicarlo.**
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
  sin escribir tras listar cada colisión con su diff.
- **Un recurso retirado por la versión pero modificado localmente se
  decide igual:** quitar o conservar —conservarlo mantiene su
  registro previo—, con el diff mostrando el contenido local que se
  retiraría.
- **Una colisión decidida a favor de la versión respalda el contenido
  previo:** sobrescribir una edición local o quitar un retirado
  modificado se copia a `.teleprompter/backups/<operación>/`, con la
  versión registrada que se desplaza en el nombre del directorio, y
  lo anuncia con `respaldo:`; conservar no genera copia.
- **Un directorio que la versión nueva declara como archivos sueltos
  conserva los que llegan** y solo elimina el contenido que la nueva
  forma ya no cubre; el caso inverso —archivos registrados que
  colapsan en un directorio entrante— reemplaza el subárbol completo.
- **`--dry-run` muestra el plan de actualización completo sin
  escribir nada.**
- **El origen remoto registrado refresca su commit con el de la
  obtención efectiva:** el registro siempre dice qué árbol produjo
  la instalación vigente.
- **Un origen que publica un paquete con otro nombre es error de
  invocación** —no se actualiza nada—.

Véase la [referencia de `update`](referencia-update.md) para la
gramática completa y los códigos de salida.
