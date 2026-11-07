# Reescribir las páginas de funcionalidad en lenguaje de usuario

## Estado

[x] Completada

## Tipo

mantenimiento

## Objetivo

Las siete páginas de funcionalidad del manual (`001`–`007`)
describen «escenarios que la suite verifica» y cada viñeta cierra
con el módulo y el título de la prueba que la cubre —información
de implementación, en inglés, dentro de documentación de usuario
en español—. Reescribirlas para que describan qué hace el
producto para quien lo usa, con un criterio uniforme entre ellas
y respecto a las páginas de referencia.

## Dependencias

- Ninguna.

## Entrada

- `manual/001-…-007-*.md` —las páginas a reescribir—.
- `manual/referencia-*.md` —la mecánica detallada ya vive ahí:
  delimita qué pertenece a la página de funcionalidad y qué sobra—.
- `.agents/skills/documentar-producto/` —la convención que
  produjo el formato actual; si la decisión la cambia, el skill
  debe reflejarla—.
- La suite de pruebas —el anclaje actual delata documentación
  obsoleta; su destino lo decide el plan—.

## Resultado esperado

- Las siete páginas reescritas: escenarios en lenguaje de usuario,
  sin citas de módulos ni títulos de prueba en el texto público.
- Decisión documentada sobre el destino de la señal doc↔test:
  comentario invisible, mapa separado o retirada asumida —si
  cambia la convención, con su registro en `decisiones-diseno`—.
- `documentar-producto` actualizado si la convención cambia.
- `004` y `005` alineados al mismo criterio —hoy anclan a medias
  o mezclan audiencias—.

## Criterios de calidad

- Ninguna página pública cita archivos ni títulos de prueba.
- Ningún comportamiento documentado desaparece: cambia el marco
  en que se presenta, no el contenido observable.
- `mkdocs build --strict` en verde.

## Procedimiento sugerido

1. Decidir en el plan la forma de la señal de obsolescencia —
  comentario HTML, mapa doc↔test separado o retirada— y el
  reparto funcionalidad/referencia.
2. Reescribir cada página bajo ese criterio, empezando por las
  más dispares (`004`, `005`).
3. Actualizar el skill si la convención cambia; verificar el
  sitio con `mkdocs build --strict`.

## Notas

- El anclaje a la suite no es una decisión registrada del
  proyecto: viene del skill `documentar-producto`, que cita una
  D024 inexistente aquí —la decisión que tome el plan puede
  registrarla por primera vez—.
- Decidido en la ejecución (2026-11-06): retirada asumida —las
  páginas describen el comportamiento sin persistir la cita; el
  respaldo en la suite se verifica al documentar. El usuario
  descartó registrar la decisión en `docs/decisions`.

## Revisión

- Subagente: 2026-11-06 — Aprueba
- Usuario (ejecución): 2026-11-06 — Aprueba
- Usuario (cierre): 2026-11-06 — Aprueba
