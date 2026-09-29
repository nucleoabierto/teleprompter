# Especificar el formato de paquete para mantenedores

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Escribir la especificación legible del formato de paquete, dirigida a
quien mantenga paquetes sin conocer el producto por dentro.

## Dependencias

- 002 y 003.

## Entrada

- El formato definido por la tarea 002 y las fricciones registradas por
  la tarea 003.

## Resultado esperado

- Un documento de especificación en `docs/` que describe la estructura
  del paquete, el contrato del manifiesto campo a campo y un ejemplo
  completo.

## Criterios de calidad

- Un lector puede producir un paquete válido siguiendo solo la
  especificación.
- El documento refleja el formato ya validado por el paquete de
  referencia, no una versión anterior.

## Procedimiento sugerido

1. Redactar la especificación a partir del contrato definido.
2. Incorporar las correcciones que reveló el paquete de referencia.
3. Usar el paquete de referencia como ejemplo de la especificación.

## Contexto

- Archivos similares:
  - `docs/formato-paquete.md` — la definición interna del formato; la
    especificación la traduce a un documento autocontenido para
    mantenedores de paquetes.
  - `packages/ciclo-tareas/` — el paquete de referencia real, ejemplo
    de la especificación.
  - `docs/tasks/003-paquete-referencia.md` — sus «Fricciones y
    decisiones del formato» son la corrección que el procedimiento
    pide incorporar.
  - `docs/decisions/` (D001–D004) — las decisiones que la
    especificación materializa.
- Patrones:
  - Documentos en Markdown con líneas envueltas, encabezados ATX y
    secciones nombradas en español.
  - La especificación no cita la investigación («rec. N»): el lector
    no la conoce; el `docs/formato-paquete.md` queda como la versión
    interna con trazabilidad.
- Lecciones: ninguna aplica (`docs/lessons/` no existe todavía).
- Decisiones: D001–D004 vigentes.

## Conectividad

Veredicto: **conectada**.

Todo lo que la tarea asume existe: el contrato definitivo
(`docs/formato-paquete.md`), el paquete de referencia conforme y
validado (`packages/ciclo-tareas/`) y las fricciones que la
especificación debe incorporar (registradas en la tarea 003). La
tarea produce un documento nuevo en `docs/`; no requiere capacidades
ausentes.

## Plan técnico

El subsistema afectado es `docs/`: la especificación es un documento
nuevo, autocontenido, dirigido a quien mantiene paquetes sin conocer
Teleprompter por dentro.

- [x] Redactar `docs/especificacion-paquete.md`: estructura del
  directorio de paquete, contrato del manifiesto campo a campo con sus
  reglas de validación, el discriminador `collection` para repositorios
  multi-paquete, política de campos desconocidos y ejemplo completo —
  el `teleprompter.json` real de `packages/ciclo-tareas/`
  - Aporta: el documento que permite producir un paquete válido sin
    otra lectura.
  - Contexto: sin citas «rec. N» ni referencias a la investigación; el
    lector no la conoce. No incorpora las fricciones de la 003: eran
    artefacto de derivar la PoC desde skills existentes, no un problema
    del mantenedor que escribe desde cero.
- [x] Enlazar ambos documentos: una línea en `docs/formato-paquete.md`
  remitiendo a la especificación como la cara externa del formato
  - Aporta: los dos documentos quedan relacionados sin duplicar hechos.

## Suite de pruebas esperada

Casos de uso: (UC1) un mantenedor produce un paquete válido siguiendo
solo la especificación; (UC2) la especificación coincide con el
formato validado.

- Todo campo del contrato (obligatorios, opcionales, colección,
  desconocidos) está documentado con su regla de validación — UC1
  (O/M)
- La especificación no diverge de `docs/formato-paquete.md` — UC2 (B)
- El ejemplo es el manifiesto real de `packages/ciclo-tareas/` —
  UC2 (I)
- Sin referencias internas del proyecto (investigación, decisiones,
  tareas) en el cuerpo de la especificación — UC1 (B)

## Revisión

- Subagente: 2026-09-28 — Aprueba
- Usuario: 2026-09-28 — Aprueba
