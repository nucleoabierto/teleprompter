---
name: revisar-ticket
description: >-
  Evalúa la calidad de un ticket antes de generar contexto, planificar o
  implementar. Puntúa la claridad del problema, el enfoque de solución, el
  alcance, los criterios de aceptación y la factibilidad; detecta drift a plan
  de implementación. Produce un brief de revisión con puntuación, hallazgos
  estructurados y recomendación Ready for. Solo análisis — no para revisión de
  PR ni briefs de investigación. Para trabajo de contexto exclusivo, invoca
  context-brief directamente después de que pase este gate.
---

# Revisión de ticket antes de implementación

Evalúa si un ticket es claro, está delimitado y está listo para trabajar. Puntúa los criterios de aceptación, el alcance, las dependencias, la estimación y un análisis de factibilidad.

**Entrega el brief de revisión** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`.

Registra `Ready for` en el entregable y en el chat; no ejecutes skills hermanos en esta sesión. El orquestador o el usuario invoca el siguiente skill según Ready for.

Pon la intención de producto desconocida en Preguntas abiertas o recomendaciones de corrección del ticket. Pregunta cuando la intención sea ambigua en lugar de adivinar. Detente antes de implementar código, crear commits, editar el ticket de la fuente o abrir un PR.

## Cuándo usarlo y cuándo no

- **Sí**: el usuario pide evaluar la calidad de un ticket (problema, enfoque de solución, alcance, AC) antes de implementar.
- **No**: el usuario pide crear un ticket (`create-ticket`), implementarlo (`implementing`) o modificar el ticket original.

## Entrada y salida

- **Entrada**: `TICKET-SLUG` (string, obligatorio) del ticket a revisar.
- **Salida**: `review-brief` (string, markdown) — brief con puntuación del ticket, puntuación del brief, hallazgos y `Ready for`; se entrega en el chat o se escribe con `write` si el usuario lo pide.

## Convenciones locales

- Trabaja con archivos locales o el chat.
- Sigue el protocolo de descubrimiento de archivos en `.devin/skills/_shared/file-discovery.md` (vía contexto → solicitud directa → invocación) para resolver el `TICKET-SLUG` o `RUTA-LOCAL`.
- Los entregables se presentan en el chat. Si el usuario solicita guardar, escribe el archivo en la ruta indicada con `write`.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas (symlink a _shared/) |
| [ticket-review-inputs-overlay.md](references/ticket-review-inputs-overlay.md) | Overlay específico de entradas y fuentes de carga |
| [ticket-review-rubric.md](references/ticket-review-rubric.md) | Rúbricas de puntuación del ticket y del brief (symlink a _shared/) |
| [parallel-subagents.md](references/parallel-subagents.md) | Unidades de carga en paralelo (Fase A) (symlink a _shared/) |

## Fase 0 — Resolver entradas

Requerido: `TICKET-SLUG`. Opcional: brief de investigación existente en ruta local (evidencia suplementaria; el ticket de la fuente es autoritativo).

Declara las entradas resueltas en el chat, luego procede.

## Subagentes en paralelo (Fase A)

Delega unidades de carga independientes en paralelo según [parallel-subagents.md](references/parallel-subagents.md). Cuando el host soporte delegación de subagentes, lanza todas las unidades aplicables en un solo mensaje.

- **ticket-deps**: general-purpose → Campos del ticket, AC, attachments y comentarios, enlaces de dependencia con estados
- **feasibility**: explore → ≥2 rutas de entry-point citadas, riesgos obvios de auth, PII o flags
- **conventions**: explore → ≥2 rutas de artefactos hermanos o tickets similares; patrones de AC y estructura a replicar

Pasa la ruta del brief de investigación a cada unidad cuando esté presente. Los subagentes ponen incógnitas en Preguntas abiertas en lugar de inventar intención de producto.

Prompt de subagente (adaptar por unidad):

```text
Carga de revisión de ticket para <TICKET-SLUG>. Unidad: <ticket-deps | feasibility | conventions>
Brief de investigación: <ruta o "none">
Lee [parallel-subagents.md](references/parallel-subagents.md) para el formato de handoff.
No puntúes, elijas Ready for, ni escribas el archivo de revisión. El orquestador maneja eso en Fase B y C.
Termina con el bloque Handoff.
```

Fusiona los handoffs de subagentes en la evaluación de Fase B, luego entrega el archivo en Fase C.

## Fase A — Cargar (fallback inline)

Cuando los subagentes no estén disponibles, ejecuta secuencialmente:

1. Lee las fuentes resueltas para objetivo, criterios de aceptación, objetivos excluidos, alcance, dependencias, estimación y notas de testing o QA — brief de investigación y/o ticket según Fase 0.
2. Lee el ticket directamente (descripción, AC, attachments, comentarios, padre, bloqueado-por, bloqueando, relacionados). Trata el contenido del brief como suplementario, no como sustituto del ticket.
3. Sigue los enlaces de dependencia hasta que los bloqueadores y la secuencia sean claros. Nota el estado de cada ticket relacionado (Done, In Progress, Todo, bloqueado).
4. Revisa el codebase (no un brief de investigación completo): nombra al menos 2 entry-points reales, servicios, rutas, jobs o feature flags que el ticket probablemente toque, y cita rutas de archivo. Cuando no se encuentren rutas, lista el vacío bajo Preguntas abiertas.
5. Pase de convenciones: encuentra ≥2 tickets similares o artefactos de workflow previos (por ejemplo `…-ticket-review.md`, `…-research-brief.md`) o tickets hermanos en el mismo dominio; cita rutas y nota patrones de estructura y AC que la implementación debería replicar.
6. Pon las incógnitas en Preguntas abiertas.

## Estrategia de fallo

- Si el ticket no existe o no se puede leer, pide el contenido en el chat.
- Si no logras encontrar ≥2 rutas de entry-point, lista el vacío en Preguntas abiertas; no inventes rutas.
- Si las dependencias no son claras, deja el mapa parcial y las incógnitas en Preguntas abiertas.

## Fase B — Evaluar y puntuar

Redacta el contenido de la revisión (no escribas el archivo aún).

Puntúa la calidad del ticket, no la calidad del código. No se espera un PR ni un diff local.

1. **Problema y objetivo** — ¿el enunciado del problema es claro? ¿Se entiende el "por qué ahora"?
2. **Criterios de aceptación** — ¿los AC son binarios y listos para checkbox, verificables y suficientemente completos para definir done? Marca AC vagos ("mejorar performance", "manejar edge cases") y casos negativos faltantes.
3. **Alcance** — ¿los límites in-scope y out-of-scope son explícitos? Nota superposición con tickets hermanos o contradicciones entre ticket y brief.
4. **Dependencias** — ¿los tickets bloqueado-por están resueltos o explícitamente dispensados? ¿La secuencia con tickets relacionados es sensata?
5. **Ajuste de estimación** — ¿el tamaño declarado o implícito coincide con el alcance (escala XS–XL)? Recomienda dividir cuando esté sobredimensionado o infraespecificado.
6. **Testing y QA** — ¿hay expectativas de CI o pasos de staging cuando se necesiten? Cuando QA no es requerido, ¿está declarado?
7. **Análisis de factibilidad** — ¿existen los entry-points citados? Nota riesgos obvios de arquitectura, auth, PII o flags que el ticket omite.
8. **Anclajes de convención** — Nombra 1–2 patrones hermanos (rutas) que la implementación debería probablemente replicar.
9. **Drift a plan de implementación** — ¿el ticket se limita a problema + enfoque de solución, o se desliza hacia un plan de implementación con detalles técnicos? Marca como drift material que pertenece a la fase de planificación:
   - Snippets de código, YAML, configs o comandos shell exactos.
   - Rutas de archivo precisas o nombres de símbolo internos como contenido normativo del ticket.
   - Listas de "Requisitos" redactadas como tareas de implementación paso a paso.
   - Specs de infraestructura a nivel de parámetros exactos (intervalos, timeouts, flags de CLI, u otros parámetros de configuración).

   El "cómo" del ticket es el **enfoque** (ej. "usar un entrypoint que aplique migraciones y luego arranque el servicio, delegando la espera de dependencias en compose"), no la **implementación** (ej. el script exacto, el bloque YAML del healthcheck, los flags `set -e`). El drift a plan de implementación es un hallazgo de severidad `important` mínimo; si es masivo y oscurece el problema/solución, sube a `blocker`.

Cuando el ticket necesite cross-check profundo más allá de un skim, establece Ready for en `context-brief` después de que pase la calidad. Cuando queden bloqueadores, AC vagos o dependencias sin resolver, establece Ready for en `refine` o `blocked` — no `plan`. Cuando se citen menos de 2 rutas de factibilidad, lista el vacío bajo Preguntas abiertas.

Puntúa la calidad del ticket y el brief de revisión según las rúbricas a continuación.

Elige exactamente un valor Ready for de este menú y explica por qué. Mapea al gap de mayor severidad, o a la calidad cuando el puntaje es ≥ 9:

- `refine` — Actualizar el ticket (AC, alcance, dependencias, estimación) antes de cualquier coding.
- `context-brief` — El ticket es lo suficientemente claro para proceder pero necesita un brief de investigación completo antes de planificar.
- `plan` — El ticket está listo para planificar; úsalo cuando el contexto exista o el alcance sea lo suficientemente pequeño para planificar inmediatamente. No lo uses cuando ya existe un plan de implementación puntuado — el orquestador reanuda en implementación.
- `blocked` — Dependencia externa o bloqueador sin resolver; lista qué debe cambiar.

Nota efectos de segundo orden que el ticket debería mencionar: callers, jobs, flags, auth/PII, mobile/legacy. Escribe "none" cuando no apliquen.

Puntúa la calidad del ticket y el brief de revisión según [ticket-review-rubric.md](_shared/ticket-review-rubric.md).

**Formato de hallazgos**

- Puntuación global del ticket + visión general de 2–4 oraciones ligada a la rúbrica.
- Si la puntuación del ticket **≥ 9**: justifica brevemente; lista solo nits opcionales (sin cambios requeridos).
- Si la puntuación del ticket **< 9**: recomendaciones por hallazgo en bloques ordenados por severidad:

```
section: <sección del ticket>
hallazgo: <qué falta o qué está mal>
severidad: blocker | important | nit
recomendación: <cómo mejorarlo>
```

- Si hay duplicados: incluye una entrada con `section: duplicado` y la referencia por slug.

Ordena por severidad (blocker → important → nit). No inventes contenido ni reescribas secciones — describe el vacío.

**Mala revisión (evitar)**

- Reescribir el ticket en lugar de revisarlo.
- Inventar intención de producto para rellenar vacíos.
- Ignorar secciones vacías o placeholders.
- Puntuar ≥ 9 mientras se listan cambios requeridos.
- No verificar duplicados.
- Tolerar drift a plan de implementación sin marcarlo como hallazgo.
- Confundir "cómo" (enfoque de solución) con implementación técnica detallada.

## Fase C — Entregar el brief de revisión

**Entrega el brief de revisión** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`.

**Secciones requeridas**

1. Puntuación del ticket y visión general (2–4 oraciones ligadas a la rúbrica)
2. Snapshot del ticket (ID, título, estado, estimación, dependencias clave con estados)
3. Auditoría de criterios de aceptación (cada AC: claro, vago o faltante, más notas)
4. Auditoría de alcance (claridad in-scope, explicitidad out-of-scope, superposición con tickets hermanos)
5. Verificación de dependencias y secuencia
6. Ajuste de estimación (estimación declarada vs alcance implícito; recomendación de división cuando aplica)
7. Análisis de factibilidad (≥2 rutas de entry-point citadas, o vacío bajo Preguntas abiertas)
8. Anclajes de convención (1–2 patrones hermanos con rutas)
9. Efectos de segundo orden que el ticket debería considerar
10. Puntuación del brief de revisión y breve justificación (omítelo solo si se bloquea antes de escribir)
11. Ready for: `context-brief` | `plan` | `refine` | `blocked` — exactamente uno + por qué (indícalo también en el chat)
12. Recomendaciones de corrección del ticket (solo cuando Ready for es `refine` o puntaje < 9; ediciones concretas de AC, alcance y dependencias — no código)
13. Preguntas abiertas (solo elementos sin resolver)

Cita evidencia del ticket, del repo skim y de documentos locales. Usa encabezados, párrafos cortos y tablas cuando ayuden al escaneo.

**Autoevaluación antes de terminar**

- Puntuación del brief de revisión ≥ 9 (o bloqueos reportados después de 2 rondas).
- Puntuación del ticket y visión general presentes y ligadas a la rúbrica.
- Cada AC declarado está auditado (claro, vago o faltante).
- Auditoría de alcance completa (in-scope, out-of-scope, superposición).
- Verificación de dependencias con estados.
- Ajuste de estimación declarado vs implícito.
- Análisis de factibilidad con ≥2 rutas citadas o vacío listado.
- Anclajes de convención con 1–2 patrones hermanos.
- Efectos de segundo orden notados (o "none").
- Ready for es exactamente uno de `context-brief` | `plan` | `refine` | `blocked`.
- Hallazgos ordenados por severidad cuando el ticket < 9.
- Drift a plan de implementación verificado y reportado como hallazgo cuando aplica.
- Nada inventado; los vacíos son Preguntas abiertas.
- El ticket de la fuente no fue modificado.
- Las unidades de carga de Fase A corrieron en paralelo (o el fallback inline está documentado en el chat).

## Termina cuando

El brief de revisión está en el chat o archivo local con puntuación del ticket, puntuación del brief de revisión ≥ 9 (o bloqueos después de 2 rondas), todas las secciones requeridas presentes, drift a plan de implementación reportado cuando aplica, hallazgos ordenados por severidad con recomendaciones (ticket < 9) o nits opcionales (ticket ≥ 9), y Ready for. Solo análisis — el ticket no se edita.
