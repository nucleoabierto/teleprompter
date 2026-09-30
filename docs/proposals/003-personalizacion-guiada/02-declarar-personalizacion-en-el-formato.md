# Declarar las instrucciones de personalización en el formato de paquete

## Tipo

desarrollo

## Objetivo

Extender el formato de paquete para que el mantenedor declare las
instrucciones de personalización como contenido distinguido del
manifiesto, con la forma concreta que fije la investigación previa.
La declaración queda especificada para mantenedores y ejercida por el
paquete de referencia.

## Dependencias

- Borrador 01 — fija dónde vive la declaración y con qué forma.

## Entrada

- La investigación del Borrador 01 en `docs/research/`.
- La especificación del formato en `docs/especificacion-paquete.md` y
  su contrato en `docs/formato-paquete.md`.
- La validación del manifiesto en `src/manifest.js` y el paquete de
  referencia en `packages/ciclo-tareas/`.

## Resultado esperado

- El manifiesto admite la declaración de instrucciones de
  personalización en la forma decidida, validada con las reglas que
  correspondan.
- `docs/especificacion-paquete.md` y `docs/formato-paquete.md`
  documentan la declaración para mantenedores.
- El paquete de referencia declara instrucciones reales de
  personalización de sus propios recursos.

## Criterios de calidad

- Un manifiesto sin la declaración sigue siendo válido: la
  personalización es opcional y los paquetes existentes no se
  invalidan.
- Una declaración mal formada produce el mismo tipo de error de
  manifiesto que los campos existentes.
- La especificación documenta qué declara el mantenedor, con la
  misma forma de contrato que el resto del formato.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Fijar la forma de la declaración según la recomendación del
   Borrador 01; si la elección es costosa de revertir, registrar la
   decisión en `docs/decisions/`.
2. Extender la validación del manifiesto y sus pruebas.
3. Actualizar la especificación y el formato para mantenedores.
4. Añadir las instrucciones de personalización reales al paquete de
   referencia `ciclo-tareas`.

## Notas

- Las instrucciones se materializan en el destino para poder
  consultarse tras la instalación (ver nota del Borrador 01); cómo
  —recurso instalado, referencia en el registro u otra— es parte de
  lo que esta tarea fija junto a la declaración.
