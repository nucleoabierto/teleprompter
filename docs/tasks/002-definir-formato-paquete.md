# Definir el formato de paquete

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Fijar la estructura del directorio de paquete y el contrato del
manifiesto de Teleprompter, registrando las decisiones tomadas.

## Dependencias

- 001.

## Entrada

- El documento de investigación producido por la tarea 001.
- El problema y la forma de solución de la propuesta
  `docs/proposals/001-formato-paquete/propuesta.md`.

## Resultado esperado

- La estructura del directorio de paquete definida: ubicación del
  manifiesto, de los recursos y de las instrucciones de
  personalización.
- El contrato del manifiesto definido: campos obligatorios y
  opcionales, semántica de la versión, mapa de instalación y
  precondiciones del destino.
- Las decisiones costosas de revertir registradas con el mecanismo de
  decisiones de diseño del proyecto.

## Criterios de calidad

- El contrato declara identidad, versión, mapa de instalación,
  precondiciones y presencia de instrucciones de personalización.
- Cada campo tiene una razón de ser trazable al problema o a la
  investigación de apoyo.
- Las decisiones de diseño quedan registradas en `docs/decisions/`.

## Procedimiento sugerido

1. Derivar del documento de investigación los campos candidatos del
   manifiesto.
2. Definir la estructura del directorio del paquete.
3. Redactar el contrato del manifiesto con la semántica de cada campo.
4. Registrar las decisiones de diseño correspondientes.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
