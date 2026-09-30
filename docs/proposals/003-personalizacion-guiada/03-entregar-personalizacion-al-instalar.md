# Entregar las instrucciones al instalar y bajo demanda

## Tipo

desarrollo

## Objetivo

El instalador entrega las instrucciones de personalización declaradas
por el paquete: al terminar una instalación con éxito las presenta
como parte del resultado, y quedan consultables después sobre el
destino ya instalado. La entrega funciona igual con origen remoto y
con `--path`.

## Dependencias

- Borrador 01 — su recomendación informa la forma de la entrega.
- Borrador 02 — fija la declaración que el instalador consume.

## Entrada

- La investigación del Borrador 01 en `docs/research/`.
- La declaración del formato implementada por el Borrador 02.
- El flujo del instalador en `src/cli.js` —la entrega es un paso al
  final del resultado de instalación— y el contrato de
  `docs/instalador.md`.
- El paquete de referencia con instrucciones declaradas.

## Resultado esperado

- Una instalación con éxito de un paquete que declara instrucciones
  presenta su contenido tal cual al final del resultado, tras el
  registro —sin interpretar ni transformar el texto libre del
  mantenedor—; un paquete sin declaración no añade ruido a la
  salida.
- Las instrucciones quedan consultables sobre el destino instalado
  sin reinstalar ni volver a descargar el paquete.
- `--dry-run` no entrega instrucciones como si la instalación se
  hubiera completado —la forma exacta la fija el comportamiento
  documentado—.
- `docs/instalador.md`, `README.md` y `manual/` reflejan la entrega y
  la consulta.

## Criterios de calidad

- La entrega ocurre solo cuando el paquete declara instrucciones y la
  instalación termina con éxito.
- La consulta posterior devuelve el mismo contenido que la entrega
  del momento de instalar.
- El comportamiento es idéntico para origen remoto y `--path`, y la
  consulta posterior no depende de la fuente original.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Actualizar el contrato de `docs/instalador.md` con el paso de
   entrega y la consulta posterior.
2. Implementar la lectura de la declaración y su presentación al
   final de la instalación.
3. Implementar la consulta posterior sobre el destino instalado.
4. Extender la suite: entrega con y sin declaración, consulta,
   equivalencia remoto/local, `--dry-run`.
5. Actualizar `README.md` y `manual/`.

## Notas

- La consulta posterior consume lo que el Borrador 02 dejó
  materializado en el destino; esta tarea decide su invocación
  concreta —subcomando, opción o convención— dentro de la gramática
  del CLI.
