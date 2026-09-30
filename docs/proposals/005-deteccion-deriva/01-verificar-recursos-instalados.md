# Verificar el estado de los recursos instalados

## Tipo

desarrollo

## Objetivo

Una consulta del CLI informa, por paquete instalado, el estado real de
cada recurso registrado —intacto, modificado o ausente— comparando lo
que el registro dice que se escribió con lo que el disco contiene, en
lenguaje de producto.

## Dependencias

- Ninguna (presupone el registro fijado por D007, ya implementado).

## Entrada

- La gramática del CLI en `src/cli.js` y el patrón de consulta sobre
  el directorio de trabajo fijado por `guide` (D011) y `list` (D012).
- `readLock` en `src/lock.js`, `hashPath` en `src/hash.js` y el
  contrato del registro en `docs/instalador.md` («El registro»).
- La suite de consulta en `test/cli.test.js` como modelo de pruebas.

## Resultado esperado

- `teleprompter <consulta>` (nombre fijado en la planeación;
  candidatos: `verify`, `check`, `status`) muestra por cada paquete
  instalado el estado de cada recurso registrado: intacto si el
  contenido coincide con el hash registrado, modificado si difiere,
  ausente si el destino ya no existe.
- Las entradas `skip` del registro —decisiones que no escribieron
  recurso— no se reportan; el informe responde en lenguaje de
  producto sin exponer hashes.
- Sin instalaciones o con todo intacto, la respuesta lo dice en lugar
  de quedar vacía; un registro corrupto se trata como el resto de
  lecturas del lock.
- `docs/instalador.md`, `README.md`, `manual/` y el dominio de
  instalación reflejan la consulta.

## Criterios de calidad

- La clasificación cubre los tres estados y se verifica por recurso:
  contenido idéntico, editado y borrado tras la instalación.
- La consulta opera solo sobre el directorio de trabajo, sin
  argumento de destino ni opciones, como sus hermanas.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Fijar en la planeación el nombre del comando, su gramática y el
   formato del informe, coherentes con `guide` y `list`.
2. Implementar la comparación recomputando `hashPath` sobre cada
   `target` registrado con `sha256` y clasificando el resultado.
3. Extender la suite: todo intacto, recurso modificado, recurso
   ausente, entrada `skip` no reportada, destino sin instalaciones,
   registro corrupto, rechazo de opciones y argumentos.
4. Actualizar la documentación del producto y del contrato.

## Notas

- Los recursos registrados sin `sha256` —válidos según el contrato
  del lock— no tienen referencia contra la que comparar; qué estado
  les corresponde (reportarlos como no verificables u omitirlos) lo
  decide la planeación.
