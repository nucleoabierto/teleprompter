---
name: generar-brief-contexto
description: >-
  Construye un research brief desde un ticket. Úsalo cuando el usuario pida
  preparar el contexto de implementación o revisión de un ticket, y no para
  escribir código, commits o PR. Usa subagentes en paralelo para investigación
  de tareas, documentación y codebase. Escribe el brief en disco o lo entrega
  en chat. No puntúa calidad del ticket (usa ticket-review), no implementa
  código ni abre PR.
---

# Brief de contexto de ticket

Construye el contexto completo desde un ticket para que una sesión posterior pueda implementar o revisar sin re-investigar.

**No** implementes código, crees commits ni abras un Pull Request. No inventes intención de producto — pon las incógnitas en Preguntas abiertas. Nunca incluyas secrets o PII de clientes en el brief; resume en su lugar.

Este skill no puntúa la calidad del ticket. Para claridad de criterios de aceptación, alcance, dependencias y ajuste de estimación, ejecuta [revisar-ticket](../revisar-ticket/SKILL.md) primero.

**Entrega el brief** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`.

## Cuándo usarlo y cuándo no

- **Sí**: el usuario pide preparar contexto a partir de un ticket para implementar o revisar después.
- **No**: el usuario pide implementar directamente, crear commits o abrir Pull Request; eso corresponde a un skill de implementación.

## Entrada y salida

- **Entrada**: `TICKET-SLUG` (string, obligatorio) o ruta de archivo local con el contenido del ticket.
- **Salida**: `brief` (string, markdown) — research brief con las secciones de Fase C; se entrega en el chat o se escribe con `write` si el usuario lo pide.

## Convenciones locales

- Trabaja con archivos locales o el chat.
- Sigue el protocolo de descubrimiento de archivos en `references/file-discovery.md` (vía contexto → solicitud directa → invocación) para resolver el `TICKET-SLUG` o `RUTA-LOCAL`.
- Los entregables se presentan en el chat. Si el usuario solicita guardar, escribe el archivo en la ruta indicada con `write`.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas (Fase 0) |
| [context-inputs-overlay.md](references/context-inputs-overlay.md) | Overlay específico de entradas y fuentes de carga |
| [parallel-subagents.md](references/parallel-subagents.md) | Unidades de carga en paralelo (Fase A) |
| [context-brief-rubric.md](references/context-brief-rubric.md) | Rúbrica de puntuación del brief (Fase B) |
| [context-brief-thresholds.md](references/context-brief-thresholds.md) | Thresholds numéricos para validación |

## Fase 0 — Resolver entradas

Requerido: `TICKET-SLUG`. Opcional: documento de contexto existente en ruta local (evidencia suplementaria; el ticket de la fuente es autoritativo).

Declara las entradas resueltas en el chat, luego procede.

## Subagentes en paralelo (Fase A)

Delega unidades de carga independientes en paralelo según [parallel-subagents.md](references/parallel-subagents.md). Cuando el host soporte delegación de subagentes, lanza todas las unidades aplicables en un solo mensaje.

- **ticket-deps**: general-purpose → Resumen del ticket (objetivo, AC, objetivos excluidos), notas de attachments y comentarios, grafo de epic y dependencias con estados
- **docs**: general-purpose → Restricciones, historia y decisiones desde páginas de documentación vinculadas (omítir si no hay fuente de documentación)
- **codebase**: explore → ≥MIN_ENTRY_POINTS rutas de entry-point, notas de flujo de datos, flags y tests, MIN_CONVENTION_ANCHORS–MAX_CONVENTION_ANCHORS anclajes de convención

Prompt de subagente (adaptar por unidad):

```text
Carga de contexto para ticket <TICKET-SLUG>. Unidad: <ticket-deps | docs | codebase>
Lee references/parallel-subagents.md para el formato de handoff.
<instrucciones específicas de unidad desde items de Fase A de context-brief>
NO escribas el research brief. NO puntúes ni elijas Ready for.
Termina con el bloque Handoff.
```

Después de que las unidades retornen, fusiona los handoffs, luego ejecuta la síntesis de Fase B y la escritura de Fase C. Cuando una unidad reporte bloqueadores, lista los bloqueadores bajo Preguntas abiertas; pregunta al usuario o cita evidencia en lugar de inventar respuestas.

## Fase A — Cargar (fallback inline)

Cuando los subagentes no estén disponibles, ejecuta secuencialmente:

1. Lee el ticket: objetivo, criterios de aceptación, descripción y brechas abiertas.
2. Si tiene un epic padre, bloqueado-por / bloqueando, o tickets relacionados (de Referencias), sigue esos enlaces desde el archivo o contenido proporcionado hasta que el grafo de dependencias sea claro. Resume cada ticket relacionado en 2–4 oraciones (por qué importa para este).

## Estrategia de fallo

- Si el ticket no existe o no se puede leer, pide al usuario que pegue el contenido en el chat.
- Si no logras encontrar ≥MIN_ENTRY_POINTS rutas de entry-point, lista el vacío en Preguntas abiertas; pregunta al usuario las rutas.
- Si las dependencias no son claras, deja el mapa parcial y las incógnitas en Preguntas abiertas.

## Fase B — Investigación y verificación cruzada

Redacta el contenido del brief (no escribas el archivo aún):

1. Verifica cruzadamente el comportamiento actual declarado en el codebase (controladores clave, servicios, rutas, tests, feature flags). Cita rutas de archivo. Mínimo: cita **al menos MIN_ENTRY_POINTS** rutas reales de entry-point, o lista el vacío bajo Preguntas abiertas.
2. Anota explícitamente las preguntas abiertas e incógnitas — prefiere evidencia de la fuente + repo sobre especulación.
3. Nombra **MIN_CONVENTION_ANCHORS–MAX_CONVENTION_ANCHORS anclajes de convención** (patrones hermanos con rutas) que un implementador posterior debería replicar — adaptadores, no un plan completo.

Verifica cruzadamente los criterios de aceptación contra el codebase antes de copiarlos. Incluye estados de dependencia para cada ticket relacionado y objetivos excluidos explícitos. Mantén el outline sugerido solo a alto nivel. Cita una ruta o Pregunta abierta para cada declaración de comportamiento.

Ready for: elige exactamente uno de este menú y explica por qué:

- `clasificar-tareas` — El alcance es grande o difuso; divide Primario vs Secundario antes de planificar
- `planificar-implementacion` — El contexto es suficiente para planificar la implementación
- `construir-spike` — Una pregunta de diseño bloquea un plan seguro
- `blocked` — Dependencia externa o bloqueador sin resolver; lista qué debe cambiar

Puntúa el brief según [context-brief-rubric.md](references/context-brief-rubric.md).

**Mal brief (evitar)**

- Pregunta al usuario la intención del producto antes de llenar incógnitas como hechos.
- Copiar criterios de aceptación sin verificación cruzada con el codebase.
- Mapa de dependencias sin estados (u omitir tickets relacionados).
- Outline sugerido que es un plan completo commit por commit.
- Preguntas abiertas vacías cuando claramente quedan incógnitas.
- Objetivos excluidos faltantes, o declaraciones de comportamiento sin ruta y sin Pregunta abierta.

## Fase C — Escribir el research brief

**Entrega el brief** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`.

**Secciones requeridas**

1. Resumen del ticket (objetivo, criterios de aceptación, objetivos excluidos)
2. Mapa de epic / dependencias (tabla o grafo de bullets; estado de cada ticket relacionado)
3. Notas de producto e historia (por qué ahora, intentos previos, resoluciones de brechas importantes; incluye decisiones de documentación cuando sea relevante)
4. Estado actual del codebase (entry points, flujo de datos, flags relevantes, tests existentes; incluye los MIN_CONVENTION_ANCHORS–MAX_CONVENTION_ANCHORS anclajes de convención con rutas)
5. Brechas vs criterios de aceptación (qué falta o está mal hoy)
6. Riesgos y efectos de segundo orden (auth, PII, performance, API mobile/legacy, jobs)
7. Preguntas abiertas (solo elementos sin resolver)
8. Outline de implementación sugerido (solo alto nivel; no un plan completo)
9. Puntuación del brief + breve justificación (omítelo solo si se bloquea antes de escribir)
10. Ready for: elige exactamente uno del menú de Fase B (ver arriba) + por qué (indícalo también en el chat)
11. Índice de fuentes (slugs de documentos de la fuente + rutas de archivo clave consultadas)

Mantenlo escaneable (encabezados, párrafos cortos, tablas cuando ayuden).

**Autoevaluación antes de terminar**

- El brief está en el chat o archivo local.
- Las unidades de carga de Fase A corrieron en paralelo (o el fallback inline está documentado en el chat).
- Puntuación del brief ≥ MIN_BRIEF_SCORE (o bloqueos reportados después de 2 rondas).
- Un compañero podría implementar o revisar solo desde este archivo sin re-consultar la fuente para el contexto base.
- Al menos MIN_ENTRY_POINTS rutas reales de entry-point fueron citadas, o el vacío está listado bajo Preguntas abiertas.
- Cada declaración sobre el comportamiento actual cita una ruta o está marcada como Pregunta abierta.
- Los objetivos excluidos y riesgos son explícitos; el outline es solo de alto nivel; hay MIN_CONVENTION_ANCHORS–MAX_CONVENTION_ANCHORS anclajes de convención.
- Ready for es exactamente uno de `clasificar-tareas` | `planificar-implementacion` | `construir-spike` | `blocked`.

## Termina cuando

El brief está en el chat o archivo local con puntuación ≥ MIN_BRIEF_SCORE (o bloqueos después de 2 rondas), una sola recomendación Ready for, y suficiente detalle para entender el problema, decisiones previas, estado actual del código y trabajo restante sin re-consultar la fuente o re-explorar el repo para el contexto base.

Termina el mensaje final con este bloque de handoff:

```markdown
## Handoff — context-brief
- Scope: contexto completo del ticket para implementación o revisión
- TICKET-SLUG: …
- Artifact: <ruta del brief o "chat">
- Hallazgos: <resumen estructurado del objetivo, dependencias, estado actual del codebase y brechas>
- Rutas / URLs citadas: <lista de rutas de archivo clave consultadas o "none">
- Preguntas abiertas: <lista de incógnitas sin resolver o "none">
- Brief score: <N>/10
- Ready for: <valor del menú>
- Blockers: <lista o "none">
- Summary: <2–4 oraciones>
```
