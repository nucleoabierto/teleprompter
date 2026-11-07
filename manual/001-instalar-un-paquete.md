# Instalar un paquete

El usuario ejecuta `teleprompter <user/repo> [destino]` —o
`teleprompter --path <paquete> [destino]` para un paquete local— para
llevar los recursos de un paquete a un repositorio existente, con el
plan completo visible antes de escribir y un registro de lo instalado.
Qué es un paquete y qué garantiza la instalación están definidos en
el [dominio de paquete](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/001-paquete.md) y
el [dominio de instalación](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/002-instalacion.md).

## Comportamiento

- **El paquete puede venir de un repositorio público de GitHub:**
  `user/repo` descarga el archivo tar por HTTP —sin git— e instala la
  raíz del árbol extraído.
- **`install` es un alias de la forma corta.**
- **El destino por defecto es el directorio de trabajo.**
- **`--path` instala un paquete local sin peticiones HTTP.**
- **La referencia se elige con `@ref` o `--ref`;** declarar ambas es un
  error de invocación. La obtención resuelve la referencia al commit
  exacto y descarga el árbol de ese commit —sin indicación, al que la
  rama por defecto apuntaba en ese momento—.
- **Un repositorio inaccesible o una referencia inexistente abortan
  sin escribir nada.**
- **El plan se presenta antes de escribir, con una marca por recurso.**
  En un destino vacío todo es `create`.
- **Reinstalar es inocuo:** lo que ya coincide se marca `identical` y
  no se escribe.
- **Lo instalado por Teleprompter se actualiza sin preguntar** cuando
  el paquete trae una versión igual o posterior y el destino sigue
  siendo lo que el registro anotó.
- **Lo modificado a mano es una colisión,** aunque el registro lo
  reconozca como instalado.
- **Las colisiones se resuelven una a una en consola interactiva,**
  mostrando antes de cada pregunta el diff entre el contenido del
  destino y el del paquete.
- **Sin consola interactiva ni opciones de resolución, las colisiones
  abortan la operación sin escribir** —cada colisión del listado se
  anuncia con su diff.
- **Una carpeta en colisión muestra el diff solo de sus archivos
  divergentes** —los idénticos no producen salida—.
- **Un enlace en colisión muestra el diff como cambio de su destino.**
- **`--force` y `--skip` resuelven todas las colisiones por
  adelantado,** son mutuamente excluyentes y no emiten diff: resuelven
  sin anunciar.
- **Una colisión resuelta a sobrescribir no pierde el contenido
  previo:** antes de escribir se copia a
  `.teleprompter/backups/<operación>/`, espejo de su ruta —un
  directorio por operación con la fecha UTC y el paquete—.
- **El respaldo se anuncia con `respaldo:`** y solo lo generan las
  colisiones sobrescritas —ni `skip`, ni `create`, ni `identical` ni
  `managed-update`—.
- **`--dry-run` muestra el plan y termina sin escribir ni registrar.**
- **`--dry-run` no entrega la guía.**
- **Un manifiesto inválido aborta sin tocar el destino.**
- **Una precondición incumplida aborta sin escribir;** con
  `create: true` la ruta se crea como parte del plan.
- **Los argumentos ausentes, de más o las rutas que no son
  directorios son error de invocación.**
- **Cada instalación escribe `teleprompter-lock.json`** con los
  recursos instalados, sus acciones y sus hashes, y conserva lo
  registrado por otros paquetes.
- **El registro guarda la procedencia:** el origen remoto declara
  el repositorio con la ref pedida —si la hubo— y el commit exacto
  que la obtención resolvió; el origen local declara la ruta
  absoluta sin commit.
- **Un error a mitad de ejecución informa de lo ya aplicado.**
- **Si el paquete declara personalización, la guía se copia a
  `.teleprompter/<paquete>/` y su contenido se entrega tal cual al
  final del resultado.**
- **[`teleprompter guide [<paquete>]`](referencia-guide.md) relee la
  guía instalada** desde el directorio de trabajo, sin reinstalar ni
  redescargar.
- **`guide` distingue sus fallos:** sin guía que mostrar es un error
  de invocación; el archivo registrado ausente, un error de
  ejecución.

Véase la [referencia de `install`](referencia-install.md) para la
gramática completa y los códigos de salida.
