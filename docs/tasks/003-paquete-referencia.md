# Empaquetar un par de skills como paquete de referencia

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Crear un paquete conforme al formato definido a partir de una
configuración mínima —los skills `crear-tareas` y `ejecutar-tareas`,
que interactúan solo entre sí— para validar el formato como prueba de
concepto.

## Dependencias

- 002.

## Entrada

- El formato de paquete definido por la tarea 002.
- Los skills `crear-tareas` y `ejecutar-tareas` de `.agents/skills/`.

## Resultado esperado

- Un directorio de paquete de ejemplo en el repositorio que contiene
  solo esos dos skills, con manifiesto completo y conforme al
  contrato.

## Criterios de calidad

- El paquete contiene únicamente los dos skills elegidos, completos con
  sus archivos de referencia y plantillas.
- El paquete cumple el contrato del manifiesto sin campos inventados ni
  omitidos.
- El ejercicio deja registrada en las notas de la tarea al menos una
  decisión práctica del formato, ya sea un acierto o una fricción.

## Procedimiento sugerido

1. Aplicar la estructura del formato a los dos skills elegidos.
2. Rellenar el manifiesto con el caso real.
3. Anotar las fricciones encontradas; si alguna revela un defecto del
   formato, ajustarlo y registrar la corrección.

## Notas

- Los dos skills forman una configuración autocontenida:
  `ejecutar-tareas` consume lo que `crear-tareas` produce en
  `TODO.txt` y `docs/tasks/`; bastan entre sí como prueba de concepto
  de una configuración trasladable.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
