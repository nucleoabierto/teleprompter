---
name: crear-ticket
description: >-
  Resuelve entradas desde la conversación o pregunta interactivamente cuando
  faltan. Redacta un borrador de ticket genérico a partir de una fuente (idea,
  brief, notas o seguimiento de PR). Usa subagentes en paralelo para búsqueda
  en herramientas de gestión, documentación y pase de codebase/convention.
  Escribe el borrador en disco en formato markdown genérico exportable a
  cualquier herramienta de gestión de tareas. No crea el ticket en la fuente
  externa a menos que el usuario lo solicite y apruebe explícitamente. Úsalo
  cuando el usuario pide crear o dar forma a un ticket, y no para implementar,
  investigar el codebase o publicar en una fuente externa.
---

# Redactar ticket genérico

Convierte el INPUT en un borrador de ticket genérico que una sesión posterior pueda investigar e implementar sin volver a entrevistar al autor. El entregable es un archivo markdown en disco; un resumen en el chat no es suficiente.

El borrador es agnóstico a la herramienta de gestión: puede exportarse a cualquier sistema de gestión de tareas. No incluye metadatos específicos de una herramienta.

**No guardes el ticket todavía.** Muestra el borrador en el chat primero; si el usuario confirma una ruta, escríbelo con `write`.

## Cuándo usarlo y cuándo no

- **Sí**: el usuario aporta una idea, brief, notas o seguimiento de PR y pide crear un ticket bien formado.
- **No**: el usuario pide implementar directamente, investigar el codebase o publicar el ticket en una fuente externa; eso requiere otro skill.

## Entrada y salida

- **Entrada**: `INPUT` (string, obligatorio) — idea, brief, notas o ruta de archivo a convertir en ticket.
- **Salida**: `draft` (string, markdown) — borrador del ticket en el chat; si el usuario confirma ruta, estructura `ticket` (object) con `title`, `slug`, `content`, `filename`, `path` para escribir con `write`.

## Convenciones locales

- Trabaja con archivos locales o el chat.
- Sigue el protocolo de descubrimiento de archivos en [file-discovery.md](references/file-discovery.md) (vía contexto → solicitud directa → invocación) para resolver el `INPUT` (idea, brief, notas o `RUTA-LOCAL`).
- Los entregables se presentan en el chat. Si el usuario solicita guardar, escribe el archivo en la ruta indicada con `write`.
- El formato de salida es markdown genérico sin dependencias de herramientas específicas.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas (Fase 0) |
| [ticket-creation-inputs-overlay.md](references/ticket-creation-inputs-overlay.md) | Overlay específico de entradas para creación de tickets (Fase 0) |
| [parallel-subagents.md](references/parallel-subagents.md) | Unidades de carga en paralelo (Fase A) |
| [ticket-estimate-scale.md](references/ticket-estimate-scale.md) | Escala de estimación T-shirt y puntos (Fase B) |
| [draft-rating-rubric.md](references/draft-rating-rubric.md) | Rúbrica de puntuación del borrador (Fase B) |
| [ready-for-menu.md](references/ready-for-menu.md) | Menú de estados Ready for (Fase B y C) |
| [export-protocol.md](references/export-protocol.md) | Protocolo de exportación a herramientas de gestión (Fase C) |

## Assets

| Asset | Rol |
|-------|-----|
| [ticket-template.md](assets/ticket-template.md) | Estructura canónica del ticket (Fase B) |

## Fase 0 — Resolver entradas

Sigue el protocolo específico en [ticket-creation-inputs-overlay.md](references/ticket-creation-inputs-overlay.md) para resolver las entradas. Resolución compartida: [file-discovery.md](references/file-discovery.md).

Declara las entradas resueltas en el chat, luego procede a la Fase A.

## Fase A — Recopilar

Delega unidades de carga independientes en paralelo según [parallel-subagents.md](references/parallel-subagents.md). Cuando el host soporte delegación de subagentes, lanza todas las unidades aplicables en un solo mensaje.

- **ticket-tool**: general-purpose → Equipo, proyecto, epic padre, duplicados/casi-duplicados, tickets relacionados (usar MCP de la herramienta disponible)
- **docs**: general-purpose → Restricciones desde páginas de documentación/TDD citadas (omítir si no hay)
- **codebase-conventions**: explore → Rutas de entry-point opcionales; ≥2 artefactos hermanos de draft/research para estructura

Prompt de subagente (adaptar por unidad):

```text
Carga de redacción de ticket para: <problema de una línea desde INPUT>. Unidad: <ticket-tool | docs | codebase-conventions>
Resumen de INPUT: <pegar desde Fase 0>
Lee [parallel-subagents.md](references/parallel-subagents.md) para el formato de handoff.
NO escribas el archivo de borrador ni elijas Ready for.
Termina con el bloque Handoff.
```

Cuando los subagentes no estén disponibles, ejecuta las mismas unidades secuencialmente:

1. Resuelve el equipo desde el INPUT (no asumas un default). También resuelve el proyecto, epic padre y tickets relacionados. Busca primero documentos locales para duplicados o cuasi-duplicados. Si hay MCP de una herramienta de gestión disponible, úsalo para buscar duplicados.
2. Cuando el INPUT cite un design doc, página de documentación, investigación, epic padre, o discusión de PR, lee esas fuentes (documentación MCP para URLs de documentación) y extrae restricciones. Pon la intención faltante en Preguntas abiertas.
3. Opcionalmente revisa el codebase solo lo suficiente para nombrar entry points reales (controladores, servicios, jobs, flags, rutas). Cita rutas. Pon las incógnitas en Preguntas abiertas.
4. Pase de convenciones: encuentra ≥2 borradores de ticket similares o artefactos de workflow bajo `docs/**/` (por ejemplo `…-ticket-review.md`, `…-research-brief.md`) o tickets hermanos en el mismo dominio. Cita rutas y adapta la estructura del borrador, estilo de AC y límites de alcance para que coincidan.

Fusiona los handoffs de subagentes (o resultados inline), luego ejecuta la Fase B.

## Estrategia de fallo

- Si el INPUT está vacío o es ambiguo, pide aclaración en el chat antes de seguir.
- Si no puedes determinar el proyecto o epic, propón un proyecto genérico de marcador y listalo en Preguntas abiertas; pregunta al usuario.
- Si el usuario no confirma ruta de guardado, no escribas el archivo.
- Si la puntuación no sube a ≥ 9 tras 2 rondas, detente e informa los bloqueos restantes.
- Si un MCP de herramienta de gestión falla con error de autenticación, conexión o tool-not-found, detén la fase actual e informa al usuario que instale, autentique o habilite el MCP antes de continuar. Pregunta al usuario el contenido del ticket.

## Fase B — Redactar

Muestra el borrador en el chat antes de escribir a disco.

**Título:** imperativo, específico y buscable. Prefiere el resultado o el cambio.

**Descripción** — incluye solo secciones que tengan contenido real. Omite las vacías. Nunca dejes stubs de placeholder.

Sigue la estructura canónica en [ticket-template.md](assets/ticket-template.md) para las secciones requeridas y opcionales.

**Reglas de redacción**

- Prefiere evidencia sobre especulación; cita rutas y URLs.
- Pon cada incógnita en Preguntas abiertas; pregunta al usuario las respuestas.
- El out-of-scope explícito vence a la prosa larga.
- Enlaza documentos relacionados por slug o ID genérico (no usar formatos específicos de herramienta).
- Mantenlo escaneable: encabezados, párrafos cortos, tablas cuando sean útiles.
- Nunca incluyas secrets o PII de clientes; resume en su lugar.
- Nunca dejes líneas de template vacías.

**Estimación** — propone un valor usando [ticket-estimate-scale.md](references/ticket-estimate-scale.md) y muestra la T-shirt size correspondiente en el borrador. La estimación es independiente de la herramienta de gestión.

**Puntúa y revisa el borrador según la rúbrica en [draft-rating-rubric.md](references/draft-rating-rubric.md).**

Aplica los gates en orden. Asigna el puntaje más alto cuyos gates todos pasen.

Un borrador debe cumplir estos estándares antes de poder puntuar ≥ 9:

- Problema, Alcance (in/out), Criterios de aceptación y Referencias/deps tienen contenido real (per lista de secciones de Fase B en SKILL.md).
- Cada incógnita está en Preguntas abiertas, no enterrada en prosa de Requisitos.
- La estimación usa [ticket-estimate-scale.md](references/ticket-estimate-scale.md); cuando el alcance no es claro, documenta un rango y prefiere el límite inferior.
- Sin líneas de template vacías o stubs "TBD" en secciones requeridas.

Verificación rápida de 9 vs 8: si un compañero necesitaría una pregunta sustantiva de producto o alcance antes de investigación, puntúa ≤ 8. Si solo redacción o un nit menor de ruta permanece, puntúa ≥ 9.

Mejora el borrador en **como máximo 2** rondas de revisión hasta que la puntuación sea ≥ 9. Si sigue por debajo de 9 después de 2 rondas, detente e informa los bloqueos en lugar de iterar indefinidamente.

**Propuesta de metadatos (genéricos)**

Los metadatos son independientes de la herramienta de gestión y pueden mapearse a cualquier sistema:

- Proyecto / área
- Epic padre (referencia por ID o slug genérico)
- Estimación (puntos + T-shirt size)
- Prioridad (cuando se conozca y sea útil)
- Relaciones: bloqueadoPor / bloquea / relacionadoCon cuando hay una cadena de dependencia real (referencia por ID o slug de ticket)
- Etiquetas (labels) solo cuando se conozcan y sean útiles

**Ready for:** elige exactamente uno del menú en [ready-for-menu.md](references/ready-for-menu.md) y explica por qué.

## Fase C — Escribir archivo local

1. Muestra el borrador en el chat y confirma con el usuario.
2. Si el usuario pide guardar, determina la ruta de archivo indicada.
3. Escribe el borrador en el archivo indicado con `write`, incluyendo:
   - `title`: el título redactado
   - `slug`: `<kebab-slug>` derivado del título (sin prefijo de herramienta específica)
   - `content`: el markdown completo del borrador
   - `filename`: `<slug>.md`
   - `path`: la ruta del archivo indicada por el usuario
4. Incluye la puntuación del borrador y justificación breve en el archivo (omítir solo si está bloqueado antes de escribir).
5. Da un resumen corto en el chat para confirmar el objetivo y alcance del ticket.
6. Recomienda exactamente un Ready for con justificación (también decláralo en el chat) según el menú en [ready-for-menu.md](references/ready-for-menu.md).

### Protocolo de exportación

Sigue el protocolo en [export-protocol.md](references/export-protocol.md) cuando el usuario solicite exportar el borrador a una herramienta de gestión.

**Autoevaluación antes de terminar**

- Problema, Alcance (in/out), Criterios de aceptación, y Referencias/deps están presentes con contenido real.
- No quedan líneas de template vacías ni stubs de placeholder.
- Cada incógnita está en Preguntas abiertas; nada inventado como intención de producto.
- Las secciones opcionales aparecen solo cuando la puerta estricta del INPUT de Fase B se cumple.
- Sin secrets o PII de clientes; resumido si hace falta.
- Puntuación del borrador ≥ 9, o bloqueadores reportados después de 2 rondas.
- Ready for es exactamente una acción de menú con justificación.
- El borrador es agnóstico a herramientas específicas; no contiene metadatos o formatos exclusivos de ninguna herramienta.
- El slug no incluye prefijos de herramienta específica (ej: sin prefijos tipo `ABC-123`).

## Termina cuando

El borrador está en disco con puntuación ≥ 9 (o bloqueadores después de 2 rondas), exactamente una recomendación Ready for, y suficiente detalle para que alguien más pueda iniciar investigación o implementación sin re-entrevistar al autor. El borrador es un markdown genérico exportable a cualquier herramienta de gestión.
