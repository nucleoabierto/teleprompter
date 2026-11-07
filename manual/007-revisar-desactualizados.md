# Revisar desactualizados

El usuario ejecuta `teleprompter outdated [<paquete>]` desde la
raíz del repositorio destino para revisar lo que el origen
registrado de cada paquete instalado publica hoy frente a la
versión instalada —una línea por paquete— sin escribir nada. Qué
contiene el registro está definido en el [dominio del
registro](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/003-registro.md).

## Comportamiento

- **Sin instalaciones registradas responde «no hay paquetes
  instalados»:** es una respuesta, no un fallo.
- **`al día` cuando el origen no publica nada más reciente que lo
  instalado** —misma versión o menor—.
- **`desactualizado` cuando el origen publica una versión más
  reciente,** con ambas versiones en la línea —orígenes locales y
  remotos por igual—.
- **Con nombre, solo la entrada de ese paquete;** un nombre no
  instalado es error de invocación.
- **Una entrada sin origen registrado —registros anteriores al
  campo—, un origen local desaparecido o un origen remoto
  inalcanzable degradan a `no consultable`** con el motivo en la
  propia línea, sin que la revisión del resto se detenga ni la
  invocación falle.
- **Un origen de colección se sondea por el miembro registrado,**
  como una actualización lo re-resolvería.
- **La revisión no escribe nada:** ni el destino, ni el registro,
  ni temporales residuales.
- **Un registro ilegible o corrupto añade un `aviso:`** y responde
  lo mismo.
- **Argumentos de más o cualquier opción son error de invocación.**

Véase la [referencia de `outdated`](referencia-outdated.md) para la
gramática completa y los códigos de salida.
