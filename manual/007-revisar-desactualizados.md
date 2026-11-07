# Revisar desactualizados

`teleprompter outdated [<paquete>]` revisa lo que el origen
registrado de cada paquete instalado publica hoy frente a la
versión instalada —una línea por paquete— sin escribir nada. Se
ejecuta desde la raíz del repositorio destino.

## Comportamiento

- Sin registro responde «no hay paquetes instalados»: es una
  respuesta, no un fallo.
- `al día` cuando el origen no publica nada más reciente que lo
  instalado —misma versión o menor—.
- `desactualizado` cuando el origen publica una versión más
  reciente, con ambas versiones en la línea —orígenes locales y
  remotos por igual—.
- Con nombre, solo la entrada de ese paquete; un nombre no
  instalado es error de invocación.
- Una entrada sin origen registrado —locks anteriores al campo—,
  un origen local desaparecido o un origen remoto inalcanzable
  degradan a `no consultable` con el motivo en la propia línea, sin
  abortar la revisión del resto ni fallar la invocación.
- Un origen de colección se sondea por el miembro grabado, como una
  actualización lo re-resolvería.
- La revisión no escribe nada: ni el destino, ni el registro, ni
  temporales residuales.
- Un registro ilegible o corrupto añade un `aviso:` y responde
  como vacío.
- Argumentos de más o cualquier opción son error de invocación.

Véase la [referencia de `outdated`](referencia-outdated.md) para la
gramática completa y los códigos de salida.
