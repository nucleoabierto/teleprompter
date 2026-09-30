# El comando `update`

## Tipo

desarrollo

## Objetivo

`teleprompter update` lleva un paquete instalado a la versión que
publica su origen —el registrado en la instalación o el que la
invocación indique—, presenta el plan de actualización completo y lo
ejecuta tras resolver las decisiones por recurso.

## Dependencias

- Borrador 01 (origen registrado) y Borrador 02 (plan de
  actualización).

## Entrada

- La gramática del CLI en `src/cli.js` y el flujo completo de
  `install` —obtención remota, verificación, plan, resolución
  interactiva, ejecución, registro— como molde del que `update` es
  hermano.
- El origen registrado en el lock (Borrador 01) y el plan de
  actualización (Borrador 02).

## Resultado esperado

- `teleprompter update <paquete>` reobtiene el paquete desde su
  origen registrado; una especificación explícita —`user/repo[@ref]`
  o `--path`— sobrescribe el origen registrado. La gramática exacta
  la fija la planeación.
- Si el paquete no está instalado o su origen no está registrado ni
  se indica, la respuesta es un error de invocación claro.
- El plan de actualización se presenta completo antes de escribir;
  los recursos cambiados con edición local se resuelven con la misma
  política que las colisiones —interactiva, `--force`, `--skip`,
  aborto sin consola— en el vocabulario que la planeación fije.
- La ejecución escribe los recursos y actualiza el registro a la
  versión nueva; `install` queda intacto e idempotente.
- `docs/instalador.md`, `README.md`, `manual/` y el dominio de
  instalación reflejan el comando.

## Criterios de calidad

- Actualizar un paquete con deriva muestra la clasificación real:
  lo intacto avanza sin preguntar, lo editado se decide caso a caso.
- Sin consola interactiva y con decisiones pendientes, la operación
  informa y aborta sin escribir, como `install`.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Fijar en la planeación la gramática de `update` —cómo se nombra
   el paquete y cómo se sobrescribe el origen— coherente con la del
   resto del CLI.
2. Implementar el flujo reutilizando obtención, verificación y
   ejecución del molde de `install`, con el plan de actualización.
3. Extender la suite: actualización limpia, con ediciones locales,
   interactiva y con `--force`/`--skip`, sin consola, origen no
   registrado, misma versión, paquete no instalado.
4. Actualizar la documentación del producto y del contrato.
