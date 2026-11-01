# El comando `outdated` de punta a punta

## Tipo

desarrollo

## Objetivo

`teleprompter outdated [<paquete>]` revisa lo que cada origen
registrado publica frente a lo instalado y presenta la comparación
—una línea por paquete— sin escribir nada: ni el destino, ni
el registro, ni los respaldos.

## Dependencias

- Borrador 01 —el sondeo de la versión publicada—.

## Entrada

- `src/usage.js`: gramática y ayuda —`outdated` entra como
  comando de la familia de consultas, sin opciones—.
- `src/cli.js`: el despacho por comando —los comandos de
  consulta viven en `queries.js`; este consulta la red, así que
  su hogar se decide en el plan—.
- `src/commands.js`: `sourceOf` —la traducción origen→source
  que `update` ya consume—.
- `src/lock.js`: `lockEntries` para recorrer el registro.
- `src/plan.js`: `semverAtLeast` o la comparación de versiones
  vigente.

## Resultado esperado

- `outdated` sin argumentos revisa todas las entradas del
  registro; con nombre, solo la del paquete —como `guide`—.
- Por paquete: versión instalada, versión publicada y estado
  —al día, desactualizado o no consultable—. Un origen
  inalcanzable degrada a aviso en su línea sin abortar la
  revisión del resto.
- El registro vacío o corrupto se comporta como en las demás
  consultas —«no hay paquetes instalados» / degradación a
  sin historial con su aviso—.
- Un paquete nombrado que no está instalado es error de uso.
- La ayuda describe el comando: `HELP.outdated` y su entrada en
  `USAGE`.

## Criterios de calidad

- Comportamiento de solo lectura verificable: ninguna escritura
  sobre el destino ni el registro en ningún camino —ni
  temporales residuales—.
- La revisión es secuencial por unidad —la paralelización de
  sondeos queda fuera de alcance—.
- `npm test` en verde con el 100 % de cobertura en `src/`.

## Procedimiento sugerido

1. Gramática: registrar `outdated` en el despacho por comando con
  aridad 0-1, y su entrada en `USAGE` y `HELP`.
2. El comando: leer el registro, filtrar por nombre si se dio,
  traducir cada `origin` vía `sourceOf`, sondear con el borrador
  01, comparar con la versión instalada y presentar.
3. Correr la suite.

## Notas

- El código de salida cuando algún origen no se pudo consultar lo
  decide el plan: degradar a aviso (como el lock corrupto) es la
  opción por defecto; que sea visible pero no abortivo es lo
  acordado en la propuesta.
