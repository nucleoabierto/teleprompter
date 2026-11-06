# Revisar desactualizados

`teleprompter outdated [<paquete>]` revisa lo que el origen
registrado de cada paquete instalado publica hoy frente a la
versión instalada —una línea por paquete— sin escribir nada. Se
ejecuta desde la raíz del repositorio destino.

## Escenarios que la suite verifica

- Sin registro responde «no hay paquetes instalados»: es una
  respuesta, no un fallo. — módulo `test/cli.test.js`, «outdated
  answers that nothing is installed when there is no lock»
- `al día` cuando el origen no publica nada más reciente que lo
  instalado —misma versión o menor—. — módulo `test/cli.test.js`
  («outdated reports al día when the origin publishes the installed
  version», «outdated stays al día when the installed version is
  ahead of the published»)
- `desactualizado` cuando el origen publica una versión más
  reciente, con ambas versiones en la línea —orígenes locales y
  remotos por igual—. — módulo `test/cli.test.js` («outdated reports
  desactualizado when the origin publishes a newer version»,
  «outdated reviews a remote origin and degrades its failure to a
  warning»)
- Con nombre, solo la entrada de ese paquete; un nombre no
  instalado es error de invocación. — módulo `test/cli.test.js`,
  «outdated with a name reviews only that package and rejects a
  missing one»
- Una entrada sin origen registrado —locks anteriores al campo—,
  un origen local desaparecido o un origen remoto inalcanzable
  degradan a `no consultable` con el motivo en la propia línea, sin
  abortar la revisión del resto ni fallar la invocación. — módulo
  `test/cli.test.js` («outdated degrades an entry without recorded
  origin to no consultable», «outdated degrades a vanished local
  origin to no consultable», «outdated reviews a remote origin and
  degrades its failure to a warning»)
- Un origen de colección se sondea por el miembro grabado, como una
  actualización lo re-resolvería. — módulo `test/cli.test.js`,
  «outdated probes the recorded member of a collection origin»
- La revisión no escribe nada: ni el destino, ni el registro, ni
  temporales residuales. — módulo `test/cli.test.js`, «outdated
  writes nothing: the destination and the lock stay untouched»
- Un registro ilegible o corrupto añade un `aviso:` y responde
  como vacío. — módulo `test/cli.test.js`, «outdated warns on a
  corrupt lock and answers nothing installed»
- Argumentos de más o cualquier opción son error de invocación.
  — módulo `test/cli.test.js`, «outdated rejects extra arguments
  and any option»

Véase la [referencia de `outdated`](referencia-outdated.md) para la
gramática completa y los códigos de salida.
