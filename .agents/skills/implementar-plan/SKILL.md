---
name: implementar-plan
description: >-
  Ejecuta un plan de implementación puntuado localmente paso a paso para un
  ticket dejando solo cambios locales en archivos. Úsalo cuando el usuario
  tenga un plan aprobado (puntuación ≥ 9, Ready for=implement) y pida
  implementar, ejecutar, construir o desarrollar localmente. No lo uses para
  planear, revisar o publicar en el repositorio, ni para "trabajar en ticket"
  o "implementar TASK-XXX" sin un plan — usa el orquestador del workflow en su
  lugar.
---

# Implementación desde plan

Ejecuta un plan de implementación puntuado localmente. El plan es la fuente de verdad para alcance, commits y validación.

**Entrega las notas de implementación** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`. Un resumen en el chat solo no es suficiente.

**No** crees commits de git, hagas push, publiques la rama, ni abras un Pull Request a menos que se te pida explícitamente. El entregable final son los cambios locales en archivos. No inventes criterios de aceptación ni intención de producto — pon las incógnitas en Preguntas abiertas. No reescribas la fuente proporcionada ni añadas docs colaterales. Docs permitidos: comentarios de código solo cuando el código circundante ya los usa; OAS/schema/test fixtures requeridos por el cambio están OK.

Cuando los criterios de aceptación o el alcance no estén claros, reconcilia con el plan y los docs de contexto opcionales; detente y lista elementos sin resolver en Preguntas abiertas en lugar de adivinar la intención de producto. Aparca los descubrimientos fuera de alcance en la sección Seguimientos de las notas.

## Cuándo usarlo y cuándo no

- **Sí**: el usuario tiene un plan de implementación aprobado (puntuación ≥ 9, Ready for=implement) y pide ejecutarlo localmente dejando cambios en archivos.
- **No**: el usuario pide planificar, revisar, o publicar en el repositorio; esas son responsabilidades de otros skills. No lo uses sin un plan aprobado.

## Entrada y salida

- **Entrada**: `PLAN-DOC-SLUG` (string, obligatorio) — plan a ejecutar; `TICKET-SLUG` (string, obligatorio) — ticket de referencia.
- **Salida**: `cambios` (array) — cambios locales aplicados; `notes` (string, markdown) — notas de implementación en chat o archivo; `follow-ups` (array) — seguimientos fuera de alcance.

## Convenciones locales

- Trabaja con archivos locales o el chat.
- Sigue el protocolo de descubrimiento de archivos en `references/file-discovery.md` (vía contexto → solicitud directa → invocación) para resolver `PLAN-DOC-SLUG` y `TICKET-SLUG`. Si el plan no existe o no se proporciona, la vía invocación sugiere `planning-implementation` para generarlo primero.
- Los entregables se presentan en el chat. Si el usuario solicita guardar las notas, escribe el archivo en la ruta indicada con `write`.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas (Fase 0) |
| [implementation-inputs-overlay.md](references/implementation-inputs-overlay.md) | Overlay específico de entradas del plan |
| [plan-gates-overlay.md](references/plan-gates-overlay.md) | Gates de readiness del plan requeridos |
| [implementation-rating-rubric.md](references/implementation-rating-rubric.md) | Rúbrica de puntuación del resultado de implementación (Fase B) |
| [artifact-sections-template.md](../_shared/artifact-sections-template.md) | Patrones comunes para secciones de puntaje, readiness y preguntas abiertas |
| [self-contained-comments.md](../_shared/self-contained-comments.md) | Convención de comentarios y mensajes de commit autocontenidos |

## Fase 0 — Resolver entradas

Requerido: `PLAN-DOC-SLUG` y `TICKET-SLUG`. Opcional: context brief existente en ruta local (evidencia suplementaria; el ticket de la fuente es autoritativo).

Declara las entradas resueltas en el chat, luego procede.

Antes de la Fase A, aplica los gates de readiness del plan según [plan-gates-overlay.md](references/plan-gates-overlay.md). Cuando `PLAN-DOC-SLUG` falta o falla un gate de readiness, detente y sugiere ejecutar `planning-implementation` primero — no improvises codificación ni saltes pasos upstream.

Antes de la Fase A, recomienda [ejecutar-quiz-comprension](../ejecutar-quiz-comprension/SKILL.md) cuando el ticket toque auth/PII, dominios desconocidos o flujo de datos complejo. Procede solo si el usuario aprueba explícitamente saltar el quiz.

## Fase A — Cargar

1. Lee el plan de implementación: objetivo, mapeo de criterios de aceptación, guía de commits, comandos de validación y Preguntas abiertas.
2. Confirma que el working tree está suficientemente limpio para empezar, o nota los cambios locales existentes en el borrador de las notas.
3. Cuando queden Preguntas abiertas en el plan, resuélvelas con el usuario o detente.

## Estrategia de fallo

- Si el plan no existe, no se puede leer o no está aprobado (puntuación < 9), pide al usuario que lo refine o genere con `planning-implementation`.
- Si un comando de validación falla, detente, corrige el fallo y revalida antes de continuar con el siguiente paso.
- Si descubres trabajo fuera de alcance, listalo como `Seguimiento` en las notas; no lo incluyas en cambios.
- Si un paso no puede ejecutarse como está escrito, detente y pide aclaración antes de improvisar.

## Fase B — Implementar y verificar

Ejecuta el trabajo; no escribas el archivo de notas aún. Redacta el contenido de las notas mientras avanzas: cambios aplicados, cobertura de criterios de aceptación, resultados de validación y desviaciones del plan.

1. Ejecuta la guía paso a paso del plan en orden. Aplica cambios locales pequeños, cada paso con el propósito, archivos y tests indicados. No crees commits de git.
2. Después de cada chunk lógico, ejecuta los comandos de validación nombrados y corrige fallos antes de continuar.
3. Sigue las convenciones del proyecto (patrones de linters, abstracciones existentes, estilo de tests). Escribe comentarios de código autocontenidos según [self-contained-comments.md](../_shared/self-contained-comments.md): incorpora el contexto del porqué en el comentario en lugar de remitir a tickets, ADRs, PRDs u otra documentación externa.
4. Pase de convenciones: cita al menos dos rutas de archivos hermanos que la implementación refleja (desde las referencias de convención del plan o una búsqueda fresca en el repo); nota las desviaciones en las notas.
5. Quédate dentro del alcance del plan y recopila seguimientos para las notas.

Ejecuta solo los comandos de validación dirigidos nombrados en el plan. Cuando el usuario pida ejecutar el suite completo de tests, confirma antes de hacerlo.

Elige exactamente un valor Ready for y explica por qué:

- `local-review` — Implementación completa; listo para revisión local
- `fix-locally` — Existen cambios pero la validación falló o quedan gaps en criterios de aceptación
- `blocked` — No se pudo completar; lista bloqueadores

Puntúa el resultado de implementación según [implementation-rating-rubric.md](references/implementation-rating-rubric.md).

## Fase C — Entregar las notas de implementación

**Entrega las notas** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`.

**Secciones requeridas**

1. Referencia del plan (ruta al plan de implementación y puntuación del plan)
2. Cambios aplicados (archivos modificados por paso; nota desviaciones del plan)
3. Cobertura de criterios de aceptación (cada criterio: cubierto / parcial / no cubierto, más evidencia)
4. Resultados de validación (comandos ejecutados y pass/fail)
5. Seguimientos (descubrimientos fuera de alcance; items solo en chat no aplicados como cambios)
6. Puntuación de implementación y breve justificación (omítelo solo si se bloquea antes de escribir) — ver [artifact-sections-template.md](../_shared/artifact-sections-template.md)
7. Ready for: `local-review` | `fix-locally` | `blocked` — exactamente una opción y por qué (también decláralo en el chat) — ver [artifact-sections-template.md](../_shared/artifact-sections-template.md)
8. Preguntas abiertas / bloqueadores (solo elementos sin resolver) — ver [artifact-sections-template.md](../_shared/artifact-sections-template.md)

Mantén las notas fáciles de leer con encabezados, párrafos cortos y tablas cuando sea útil.

Revisa las notas en como máximo 2 rondas hasta que la puntuación de implementación sea ≥ 9, o documenta los bloqueadores honestamente cuando la implementación no pueda alcanzar 9. Cuando esté bloqueado, detente y reporta.

**Autoevaluación antes de terminar**

- Cada paso del plan coincide con los cambios locales aplicados, o las desviaciones están documentadas.
- Los criterios de aceptación del plan están cubiertos, o los gaps son explícitos.
- Los comandos de validación nombrados están registrados con resultados.
- Ready for es exactamente una opción del menú con justificación.
- Los Seguimientos (si los hay) se listan solo en las notas — no como cambios, commits, Pull Requests ni docs colaterales.
- No se ha creado ningún commit de git, push ni publicación en el repositorio ni en otro lugar compartido.

## Termina cuando

Las notas de implementación resumen los cambios, seguimientos y preguntas abiertas, la puntuación de implementación es ≥ 9 (o los bloqueadores están documentados), los cambios locales ejecutan la guía del plan, los comandos de validación nombrados están en verde, y Ready for está establecido. Un compañero podría revisar localmente o corregir los gaps restantes sin releer el diff completo.

Termina el mensaje final con este bloque de handoff:

```markdown
## Handoff — implementing
- TICKET-SLUG: …
- PLAN-DOC-SLUG: …
- Puntuación de implementación: <N>/10
- Ready for: <valor del menú>
- Bloqueadores: <lista o "none">
- Resumen: <2–4 oraciones>
```
