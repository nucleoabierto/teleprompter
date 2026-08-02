---
name: planificar-implementacion
description: >-
  Genera un plan de implementación puntuado a partir de un context brief y un
  ticket. Úsalo cuando el usuario pida planificar cómo implementar un ticket
  antes de escribir código, y no para implementar, revisar o publicar en el
  repositorio. Después de generar el plan, invoca predecir-impacto-cambio y
  sugerir-casos-prueba en paralelo para análisis pre-implementación.
---

# Plan de implementación de ticket

Genera un plan de implementación puntuado commit por commit a partir del context brief `CONTEXT-DOC-SLUG` y el ticket `TICKET-SLUG`. El plan es el insumo del skill `implementing`; no ejecuta código ni crea cambios persistentes (no commits, no push).

**No** escribas código de producto, crees commits ni abras un PR en este paso. No inventes criterios de aceptación ni intención de producto. No reescribas la fuente proporcionada.

**Entrega el plan** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`.

## Cuándo usarlo y cuándo no

- **Sí**: el usuario tiene un context brief y un ticket y pide generar un plan de implementación antes de codificar.
- **No**: el usuario pide implementar el código (`implementing`), revisar, o publicar en el repositorio; esas son responsabilidades de otros skills.

## Entrada y salida

- **Entrada**: `CONTEXT-DOC-SLUG` (string, obligatorio) y `TICKET-SLUG` (string, obligatorio) — brief y ticket a planificar.
- **Salida**: `plan` (string, markdown) — plan de implementación con guía paso a paso, comandos de validación y puntuación; `plan-path` (string, opcional) — ruta donde guardar el plan si el usuario lo pide.

## Convenciones locales

- Trabaja con archivos locales o el chat.
- Sigue el protocolo de descubrimiento de archivos en `.devin/skills/_shared/file-discovery.md` (vía contexto → solicitud directa → invocación) para resolver `CONTEXT-DOC-SLUG` y `TICKET-SLUG`.
- El plan se entrega en el chat. Si el usuario solicita guardar, escribe el archivo en la ruta indicada con `write`.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas (Fase 0) |
| [plan-inputs-overlay.md](references/plan-inputs-overlay.md) | Overlay específico de entradas y fuentes de contexto |
| [parallel-subagents.md](references/parallel-subagents.md) | Unidades de carga en paralelo (Fase A) |
| [plan-implementation-rubric.md](references/plan-implementation-rubric.md) | Rúbrica de puntuación del plan |
| [validation-commands.md](references/validation-commands.md) | Comandos de validación estandarizados |
| [zombie-methodology.md](references/zombie-methodology.md) | Metodología ZOMBIE de testing |
| [self-contained-comments.md](../_shared/self-contained-comments.md) | Convención de comentarios y mensajes de commit autocontenidos |

## Fase 0 — Resolver entradas

Requerido: `CONTEXT-DOC-SLUG` y `TICKET-SLUG`. Opcional: documento de triage existente en ruta local (evidencia suplementaria; el ticket de la fuente es autoritativo).

Declara las entradas resueltas en el chat, luego procede.

## Subagentes en paralelo (Fase A)

Delega unidades de carga independientes en paralelo según [parallel-subagents.md](references/parallel-subagents.md). Cuando el host soporte delegación de subagentes, lanza todas las unidades aplicables en un solo mensaje.

- **context-load**: general-purpose → Resumen del context brief (objetivo, AC, objetivos excluidos, riesgos, restricciones de arquitectura)
- **ticket-deps**: general-purpose → Campos del ticket, AC, attachments y comentarios, enlaces de dependencia con estados
- **conventions**: explore → ≥2 rutas de artefactos hermanos o patrones similares; adaptación del plan para que el código nuevo se vea nativo

Pasa la ruta del context brief y el ticket a cada unidad. Los subagentes ponen incógnitas en Preguntas abiertas en lugar de inventar intención de producto.

Prompt de subagente (adaptar por unidad):

```text
Carga de planificación para <CONTEXT-DOC-SLUG> y <TICKET-SLUG>. Unidad: <context-load | ticket-deps | conventions>
Lee references/parallel-subagents.md para el formato de handoff.
No puntúes, elijas Ready for, ni escribas el archivo de plan. El orquestador maneja eso en Fase B y C.
Termina con el bloque Handoff.
```

Fusiona los handoffs de subagentes en la planificación de Fase B, luego entrega el archivo en Fase C.

## Fase A — Cargar (fallback inline)

Cuando los subagentes no estén disponibles, ejecuta secuencialmente:

1. Lee la fuente proporcionada para objetivo, criterios de aceptación, objetivos excluidos, riesgos y cualquier restricción de arquitectura.
2. Lee el ticket `TICKET-SLUG` para confirmar el alcance y las dependencias.
3. Cuando triage existe, verifica que cada ítem Primary aparezca en la guía de commits y secuencia la preparación Secondary antes de los pasos Primary dependientes.
4. Pon las incógnitas en Preguntas abiertas — no inventes intención de producto.

## Estrategia de fallo

- Si el context brief o ticket no existe o no se puede leer, pide el contenido en el chat.
- Si no logras encontrar ≥2 rutas de entry-point, lista el vacío en Preguntas abiertas; no inventes rutas.
- Si la puntuación no sube a ≥ 9 tras 2 rondas, detente y lista los bloqueos restantes.

## Fase B — Planificar y puntuar

Redacta el contenido del plan en el chat (no escribas el archivo aún):

1. Mapea cada criterio de aceptación a un paso del plan (tabla o checklist).
2. Para cada paso mayor, lista efectos de segundo orden (callers, jobs, flags, auth/PII, serializadores, mobile/legacy). Integra el hardening en el plan.
3. Pase de convenciones: encuentra 2–3 archivos/patrones similares en el repo y adapta el plan para que el código nuevo se vea nativo de este codebase.
4. Produce una guía paso a paso (commits pequeños y revisables; cada commit tiene propósito + archivos + tests). Aplica ZOMBIES mientras redactas el orden de tests en Fase B; escribe descripciones de tests en lenguaje plano en el plan — no etiquetes tests con letras ZOMBIES ni menciones ZOMBIES en la guía de commits. Redacta mensajes de commit autocontenidos según [self-contained-comments.md](../_shared/self-contained-comments.md): describe el cambio y su motivación sin mencionar el ticket ni la tarea que los originó.
5. Nombra los comandos de validación según [validation-commands.md](references/validation-commands.md). Nunca el suite completo.

Cuando las Preguntas abiertas bloqueen la codificación segura, establece Ready for en `spike`, `context-brief`, o `blocked` y lista qué debe resolverse primero. Deja las ideas fuera de alcance en Preguntas abiertas en lugar de agregar docs extra.

Elige exactamente un valor Ready for y explica por qué. Mapea al gap de mayor severidad, o a readiness cuando el plan es sólido:

- `implement` — El plan está listo para `implementing`
- `spike` — Una pregunta de diseño todavía bloquea una guía de commits segura; ejecutar `spike`
- `context-brief` — El contexto está obsoleto o es muy delgado; ejecutar `context-brief`
- `blocked` — Dependencia externa o bloqueador sin resolver; lista qué debe cambiar

Puntúa el plan según [plan-implementation-rubric.md](references/plan-implementation-rubric.md).

## Fase C — Entregar el plan

**Entrega el plan** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`.

**Secciones requeridas del plan**

1. Mapeo de objetivo y criterios de aceptación
2. Efectos de segundo orden y hardening
3. Referencias de convención (2–3 patrones hermanos con rutas)
4. Guía paso a paso (propósito + archivos + tests por paso)
5. Comandos de validación
6. Puntuación del plan + breve justificación (omítelo cuando se bloquee antes de escribir)
7. Ready for: `implement` | `spike` | `context-brief` | `blocked` — exactamente uno, con por qué (también decláralo en el chat)
8. Preguntas abiertas (solo elementos sin resolver)

Prefiere evidencia de docs de contexto, documentación y rutas de repo. Mantén el archivo fácil de leer con encabezados, párrafos cortos y tablas cuando sea útil.

**Autoevaluación antes de terminar**

- Puntuación del plan ≥ 9 (o bloqueadores reportados después de 2 rondas).
- Cada criterio de aceptación está mapeado a un paso del plan.
- La guía paso a paso es pequeña y revisable.
- Los tests dirigidos por commit siguen el ordenamiento ZOMBIES durante la planificación (ver [zombie-methodology.md](references/zombie-methodology.md)); el plan escrito usa solo descripciones de tests en lenguaje plano.
- Los comandos de validación están nombrados y dirigidos a las áreas cambiadas.
- Ready for es exactamente una acción del menú con justificación.
- Nada de código de producto, commits ni publicaciones en el repositorio ni en otro lugar compartido.

## Termina cuando

El plan puntúa ≥ 9 (o los bloqueadores se reportan después de 2 rondas), contiene las secciones requeridas, y un skill `implementing` posterior podría ejecutarlo sin volver a planificar.

Termina el mensaje final con este bloque de handoff:

```markdown
## Handoff — planning-implementation
- CONTEXT-DOC-SLUG: …
- TICKET-SLUG: …
- Plan score: <N>/10
- Ready for: <valor del menú>
- Blockers: <lista o "none">
- Summary: <2–4 oraciones>
```
