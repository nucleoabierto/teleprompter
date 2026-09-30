# Declarar las instrucciones de personalización en el formato de paquete

## Tipo

desarrollo

## Objetivo

Extender el formato de paquete con un campo específico del manifiesto
que apunta al archivo con las instrucciones de personalización. El
contenido del archivo es de formato libre —texto dirigido a un
agente, sin formato impuesto ni validación de contenido—. La
declaración queda especificada para mantenedores y ejercida por el
paquete de referencia.

## Dependencias

- Ninguna: la forma de la declaración está fijada por la propuesta
  y no necesita la investigación del Borrador 01, que solo alimenta
  la entrega.

## Entrada

- La propuesta en `docs/proposals/003-personalizacion-guiada/`.
- La especificación del formato en `docs/especificacion-paquete.md` y
  su contrato en `docs/formato-paquete.md`.
- La validación del manifiesto en `src/manifest.js` y el paquete de
  referencia en `packages/ciclo-tareas/`.

## Resultado esperado

- El manifiesto admite el campo que apunta al archivo de
  instrucciones dentro del paquete, con las validaciones que
  correspondan a una referencia de archivo.
- El contenido del archivo no se valida: cualquier texto del
  mantenedor es válido.
- `docs/especificacion-paquete.md` y `docs/formato-paquete.md`
  documentan la declaración para mantenedores.
- El paquete de referencia declara instrucciones reales de
  personalización de sus propios recursos.

## Criterios de calidad

- Un manifiesto sin el campo sigue siendo válido: la personalización
  es opcional y los paquetes existentes no se invalidan.
- Una declaración que apunta a un archivo inexistente o fuera del
  paquete produce el mismo tipo de error de manifiesto que los campos
  existentes.
- El contenido del archivo nunca produce errores de validación:
  formato libre.
- La especificación documenta qué declara el mantenedor, con la
  misma forma de contrato que el resto del formato.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Fijar el nombre y la forma del campo; si la elección es costosa
   de revertir, registrar la decisión en `docs/decisions/`.
2. Extender la validación del manifiesto y sus pruebas.
3. Actualizar la especificación y el formato para mantenedores.
4. Añadir las instrucciones de personalización reales al paquete de
   referencia `ciclo-tareas`.

## Notas

- Las instrucciones deben quedar materializadas en el destino para
  poder consultarse tras la instalación —el origen remoto es
  temporal—: cómo —recurso instalado, referencia en el registro u
  otra— es parte de lo que esta tarea fija junto a la declaración.
