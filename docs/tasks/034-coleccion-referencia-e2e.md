# Colección de referencia e instalación de extremo a extremo

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Crear una colección de referencia real —análoga al paquete
`ciclo-tareas`— y validar el flujo completo de extremo a extremo:
seleccionar e instalar un paquete de la colección, consultar su
guía y actualizarlo. La colección de referencia sirve a la vez de
ejemplo documentado para mantenedores.

## Dependencias

- Tarea 032 — la instalación desde colección materializada.
- Tarea 033 — `origin` y ciclo de vida por paquete.

## Entrada

- `packages/ciclo-tareas/` — el paquete de referencia existente;
  este propio repositorio es candidato natural a alojar la
  colección de referencia (varios paquetes propios bajo
  `packages/`).
- `docs/especificacion-paquete.md` — el contrato del manifiesto de
  colección.
- El comportamiento definido en la tarea 031.

## Resultado esperado

- Una colección de referencia publicable con su `teleprompter.json`
  de colección y al menos dos paquetes, conforme a la
  especificación.
- Verificación e2e documentada: instalación con selección,
  comportamiento sin selección, `guide` sobre el paquete instalado
  y `update` resolviendo el mismo paquete.

## Criterios de calidad

- El manifiesto de colección pasa la validación del propio
  instalador (la misma puerta que aplica a cualquier colección).
- La sesión e2e reproduce el resultado esperado de la tarea 032 sin
  pasos manuales fuera de lo documentado.

## Procedimiento sugerido

1. Diseñar la colección de referencia (qué paquetes agrupa y con
   qué contenido) y validarla con el usuario.
2. Crear el manifiesto y los paquetes miembro.
3. Ejecutar el flujo e2e contra un destino real y registrar el
   resultado.

## Notas

- Si el repositorio propio se convierte en colección, la raíz gana
  un `teleprompter.json` con `collection: true` —decisión con
  efecto sobre cómo se instala este repo; confirmar con el usuario
  antes de adoptarla.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
