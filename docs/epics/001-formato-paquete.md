# Formato de paquete

## Estado

[x] Completada

## Objetivo

El producto tiene un formato declarativo para describir configuración
de agentes como trasladable —estructura del paquete y contrato del
manifiesto—, validado con un paquete de referencia real y especificado
para mantenedores.

## Alcance

- **Dentro:** investigación de formatos existentes, definición de la
  estructura del paquete y el contrato del manifiesto, paquete de
  referencia con los skills del ciclo de tareas, especificación para
  mantenedores.
- **Fuera:** el mecanismo de instalación, el contenido de las
  instrucciones de personalización, la distribución de paquetes y la
  lógica de actualización entre versiones.

## Piezas

- [x] docs/tasks/001-investigar-formatos-manifiesto.md — Investigar
  formatos de manifiesto existentes
- [x] docs/tasks/002-definir-formato-paquete.md — Definir el formato de
  paquete
- [x] docs/tasks/003-paquete-referencia.md — Empaquetar un par de
  skills como paquete de referencia
- [x] docs/tasks/004-especificar-formato.md — Especificar el formato de
  paquete para mantenedores

## Plan técnico

La épica produce artefactos declarativos, no código: sus entregables son
documentos —la investigación, el formato definido, el paquete de
ejemplo y la especificación— que fijan el contrato sobre el que se
construirá el instalador.

- **Orden:** investigación, definición, paquete de referencia,
  especificación.
- **Dependencias:** la definición consume las conclusiones de la
  investigación; el paquete de referencia aplica el formato definido; la
  especificación incorpora las fricciones que aquel revele.
- **Decisiones transversales:** el paquete de referencia se acota a los
  skills `crear-tareas` y `ejecutar-tareas` como prueba de concepto; las
  decisiones del formato que sean costosas de revertir se registran en
  `docs/decisions/`.

## Criterio de cierre

Existe una especificación del formato de paquete en `docs/` y un
paquete de referencia conforme a ella en el repositorio.

## Revisión

- Usuario: 2026-09-28 — Aprueba
