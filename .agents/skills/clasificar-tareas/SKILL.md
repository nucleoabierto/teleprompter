---
name: clasificar-tareas
description: >-
  Clasifica los ítems de trabajo de un ticket o context brief en Primary vs
  Secondary y elige un próximo paso. Úsalo cuando el usuario pida dividir,
  triage, priorizar o categorizar un ticket en trabajo prioritario/secundario
  antes de implementar. No implementa código, ni revisa ni crea tickets.
---

# Clasificación de trabajo antes de la implementación

Clasifica el trabajo antes de la implementación. La fuente es un documento context brief (`CONTEXT-DOC-SLUG`) o un ticket (`TICKET-SLUG`) en el chat o archivo local. Si el usuario proporciona un slug, intenta leerlo primero como context brief; si no se encuentra, intenta como ticket.

**No** implementes código, crees commits, ni abras un Pull Request en este paso. No inventes intención de producto — pon las incógnitas en Preguntas abiertas. No expandas el alcance más allá de la fuente proporcionada. No inventes servicios, rutas, jobs, o feature flags que no estén en el repo o la fuente.

**Entrega la clasificación** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`.

## Cuándo usarlo y cuándo no

- **Sí**: el usuario necesita dividir un ticket/brief en ítems de trabajo y elegir un único próximo paso antes de implementar.
- **No**: el usuario pide implementar, revisar o crear un ticket; eso corresponde a otros skills.

## Entrada y salida

- **Entrada**: `TICKET-SLUG` o `CONTEXT-DOC-SLUG` (string, obligatorio) del brief o ticket.
- **Salida**: `tasks` (string, markdown) — clasificación con Primary/Secondary, deps, próximo paso y puntuación; se entrega en el chat o se escribe con `write` si el usuario lo pide.

## Convenciones locales

- Trabaja con archivos locales o el chat.
- Sigue el protocolo de descubrimiento de archivos en `references/file-discovery.md` (vía contexto → solicitud directa → invocación) para resolver `TICKET-SLUG` o `CONTEXT-DOC-SLUG`.
- Los entregables se presentan en el chat. Si el usuario solicita guardar, escribe el archivo en la ruta indicada con `write`.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas (Fase 0) |
| [tasks-triage-rubric.md](references/tasks-triage-rubric.md) | Rúbrica de puntuación de la clasificación |
| [parallel-subagents.md](references/parallel-subagents.md) | Protocolo de sub-agentes en paralelo (si aplica) |

## Fase 0 — Resolver entradas

Requerido: `TICKET-SLUG` o `CONTEXT-DOC-SLUG`. Opcional: documento de contexto existente en ruta local (evidencia suplementaria; el ticket de la fuente es autoritativo).

Declara las entradas resueltas en el chat, luego procede.

## Fase A — Cargar

1. Lee la fuente proporcionada para objetivo, criterios de aceptación, objetivos excluidos, riesgos y cualquier outline sugerido.
2. Si la fuente es un ticket (sin context file), haz una **verificación cruzada con el codebase**: nombra entry points reales, servicios, rutas, jobs, o feature flags probablemente involucrados, y cita rutas de archivo. Mínimo: cita **al menos 2 rutas reales**, o lista el vacío bajo Preguntas abiertas.
3. Pon las incógnitas en Preguntas abiertas — no inventes intención de producto.

## Estrategia de fallo

- Si la fuente no existe ni como context brief ni como ticket, pide el contenido en el chat.
- Si no logras encontrar ≥2 rutas reales en un ticket sin context file, lista el vacío en Preguntas abiertas.
- Si todas las tareas parecen Primary, detente y pide aclaración de prioridades antes de clasificar.

## Fase B — Clasificar y puntuar

1. Divide cada ítem de trabajo concreto en:
    - **Primary** — requiere juicio: diseño, lógica de dominio, límites de auth/PII, contratos de API, decisiones de arquitectura. Ejemplo: dónde debería vivir la resolución de conflictos; si un flag controla una ruta de sync. Para cada ítem Primary anota: **por qué requiere juicio**, **archivos/áreas probablemente tocados**, y **riesgo si se equivoca** (auth/PII, contrato de API, arquitectura, o datos).
    - **Secondary** — preparación/apalancamiento: mapas del codebase, plomería de fixtures, limpieza de lint/tipos con spec clara, docs, scaffolding de tests una vez que se conoce la forma. Ejemplo: listar callers de un servicio; añadir una factory una vez que se decide la forma del modelo. Para cada ítem Secondary anota: **por qué no requiere juicio**, **sync vs background OK**, y **qué Primary desbloquea**.
2. Para cada ítem, anota dependencias (qué debe terminar antes de que el trabajo primary pueda empezar).
3. Pon las incógnitas en Preguntas abiertas.

**Mala clasificación (evitar)**

- Etiquetar todo como Primary.
- Llamar algo Secondary cuando todavía requiere juicio de producto o arquitectura.
- Un "próximo paso" que es una lista en lugar de una acción.

**Próximo paso recomendado** — elige **exactamente uno** de este menú y di por qué. La elección debe mapear al ítem Primary de mayor riesgo sin resolver, o a Preguntas abiertas si hay bloqueos:

- `resolve-questions` — Resolver Preguntas abiertas con un humano antes de codificar
- `construir-spike` — Spike desechable para una pregunta de diseño (ejecutar [construir-spike](../construir-spike/SKILL.md))
- `construir-demo` — Harness temporal para observar comportamiento difícil de seguir (ejecutar [construir-demo](../construir-demo/SKILL.md))
- `planificar-implementacion` — La división Primary/Secondary es clara; planificar la implementación (ejecutar [planificar-implementacion](../planificar-implementacion/SKILL.md))
- `blocked` — Detenerse por bloqueos (listarlos)

Anota también **efectos de segundo orden** para ese próximo paso (callers, jobs, flags, auth/PII, mobile/legacy) — incluso si el próximo paso es spike, demo, o detenerse. Escribe "none" cuando no apliquen.

Puntúa la clasificación según [tasks-triage-rubric.md](references/tasks-triage-rubric.md).

## Fase C — Entregar la clasificación

**Entrega la clasificación** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`.

**Secciones requeridas**

1. Resumen de la fuente (objetivo, AC, non-goals)
2. Ítems Primary (por qué requiere juicio, archivos/áreas, riesgo si se equivoca, deps)
3. Ítems Secondary (por qué no requiere juicio, sync/background, qué Primary desbloquea)
4. Orden de dependencias (qué preparación Secondary debe terminar antes de que el trabajo Primary pueda empezar)
5. Qué haría incorrecto a Primary (1–3 falsificadores)
6. Puntuación de la clasificación + breve justificación (omítelo solo si se bloquea antes de escribir)
7. Ready for: `resolve-questions` | `construir-spike` | `construir-demo` | `planificar-implementacion` | `blocked` — nombra exactamente una opción, justifica la elección y nota efectos de segundo orden para ese paso (también decláralo en el chat)
8. Preguntas abiertas

Prefiere evidencia sobre especulación. Usa encabezados y párrafos cortos para que el archivo sea fácil de leer.

**Autoevaluación antes de terminar**

- Puntuación de la clasificación ≥ 9 (o bloqueos reportados después de 2 rondas).
- Exactamente un próximo paso es recomendado, mapeado al ítem Primary de mayor riesgo.
- Cada ítem Primary tiene por qué requiere juicio / archivos / riesgo.
- Cada ítem Secondary tiene por qué no requiere juicio / qué Primary desbloquea.
- Preguntas abiertas solo contiene elementos sin resolver.

## Termina cuando

La clasificación puntúa ≥ 9 (o los bloqueos se reportan después de 2 rondas), la división Primary/Secondary es correcta en juicio, y exactamente un próximo paso es recomendado con efectos de segundo orden anotados.

Termina el mensaje final con este bloque de handoff:

```markdown
## Handoff — tasks-triage
- TICKET-SLUG: …
- CONTEXT-DOC-SLUG: … (o "none")
- Puntuación de clasificación: <N>/10
- Ready for: <valor del menú>
- Bloqueadores: <lista o "none">
- Resumen: <2–4 oraciones>
```
