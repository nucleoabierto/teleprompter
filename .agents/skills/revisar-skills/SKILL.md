---
name: revisar-skills
description: >-
  Evalúa un SKILL.md contra las mejores prácticas de diseño de agent skills
  usando un sistema de 6 dimensiones, clasificación de tipos (7 tipos),
  comparación con skills hermanos y referencias especializadas. Escribe la
  revisión en `<skills-root>/_reviews/<skill-name>-review.md`. En scope
  library o batch, delega MÚLTIPLES sub-agentes en paralelo (uno por skill) -
  NUNCA un solo subagente con múltiples skills. Audita naming, description
  routing, resource layout, DRY y assets, escritura directa y convenciones.
  Úsalo cuando el usuario pida revisar, auditar, evaluar, puntuar o mejorar un
  skill, o cuando detectes un SKILL.md creado o modificado y convenga
  verificar su calidad. No lo uses para crear skills desde cero, ejecutar
  tests, desplegar código o realizar tareas de desarrollo generales.
---

# Revisión de skills

Evalúa un SKILL.md contra un sistema estructurado de 6 dimensiones, clasificación de tipos y comparación con skills hermanos.

Compatible con cualquier entorno que cargue skills desde un árbol de directorios (herramientas de desarrollo y agentes compatibles con [agentskills.io](https://agentskills.io/specification)). Si el skill no menciona un entorno específico, trata como agnóstico. Si el skill hardcodea APIs de un entorno específico, marca como acoplamiento en hallazgos.

Escribe cada revisión en `<skills-root>/_reviews/<skill-name>-review.md`. Un resumen en el chat no es suficiente; escribe el archivo de revisión.

Mantén el skill revisado intacto en este paso — no lo modifiques, no crees cambios de versión ni publiques nada — a menos que el usuario lo pida explícitamente.

## Cuándo usarlo y cuándo no

- **Sí**: el usuario pide revisar, auditar, evaluar, puntuar o mejorar un SKILL.md, o cuando detectes un SKILL.md creado o modificado y convenga verificar su calidad.
- **No**: el usuario pide crear skills desde cero, ejecutar tests, desplegar código o realizar tareas de desarrollo generales sin relación con un SKILL.md.

## Entrada y salida

- **Entrada**: `SKILL-PATH` (string, obligatorio) — ruta al `SKILL.md` o al directorio del skill a revisar.
- **Scope** (opcional): `single` (default) | `library` | `batch` — single revisa un skill inline; library revisa todos los subdirectorios bajo skills root; batch revisa una lista explícita del usuario.
- **Exclude** (opcional): lista de nombres de skill a omitir (scope library/batch).
- **Salida**: archivo de revisión en `<skills-root>/_reviews/<skill-name>-review.md` con snapshot, auditorías de name/description/layout/DRY/escritura-directa, 6 dimensiones, overall score, fortalezas, hallazgos, hermanos, review-brief score (Q+C tally), `Ready for` y Preguntas abiertas.

## Convenciones locales

- Trabaja con archivos locales o el chat.
- Sigue el protocolo de descubrimiento de archivos en [file-discovery.md](references/file-discovery.md) para resolver `SKILL-PATH`.
- Crea `_reviews/` bajo skills root si no existe.
- Para scope library o batch, publica un resumen de índice en el chat cuando todos los archivos de revisión estén en disco.

## Referencias compartidas

- **[file-discovery.md](references/file-discovery.md)**: Resolución de entradas (Fase 0)
- **[parallel-subagents.md](references/parallel-subagents.md)**: Protocolo de sub-agentes en paralelo, handoff y oleadas (scope library / batch)
- **[frontmatter-guide.md](references/frontmatter-guide.md)**: Spec de `name` + `description`, carga al inicio
- **[naming-guide.md](references/naming-guide.md)**: Patrones de verbos, léxico, rúbrica de score de name
- **[description-guide.md](references/description-guide.md)**: WHAT + WHEN, triggers, voz, rúbrica de score de description
- **[direct-writing-guide.md](references/direct-writing-guide.md)**: Grep scan, reemplazos vago → directo
- **[resource-layout-guide.md](references/resource-layout-guide.md)**: Layout de spec, reglas de `_shared/` symlink
- **[dry-assets-guide.md](references/dry-assets-guide.md)**: Inventario de assets, divulgación progresiva, rúbrica DRY score
- **[audit-checklists.md](references/audit-checklists.md)**: Tablas canónicas de auditoría Phase B
- **[type-checklists/README.md](references/type-checklists/README.md)**: Checklists de cuerpo por tipo de skill (7 tipos)
- **[scoring-rubric.md](references/scoring-rubric.md)**: Dimensiones, hard caps, approve gates, output contract, review-brief Q/C
- **[library-batch-audit.md](references/library-batch-audit.md)**: Checklist cross-skill (solo scope library/batch)

Compara cada skill contra esas referencias y al menos 2 skills hermanos del mismo tipo.

## Sub-agentes en paralelo (scope library / batch)

**Importante**: Cuando el scope es `library` o `batch` y hay 2+ skills a revisar, DEBES lanzar MÚLTIPLES subagentes en paralelo (determina la calidad de acuerdo al numero de skills a revisar). NUNCA lances un solo subagente que revise todos los archivos secuencialmente.

Delega en paralelo según [parallel-subagents.md](references/parallel-subagents.md):

1. **Orquestador (este agente)**: Fase 0 — resuelve skills root, scope, lista de exclusión, y lista de skills objetivo. Lee las referencias compartidas una vez ([frontmatter-guide.md](references/frontmatter-guide.md) → [dry-assets-guide.md](references/dry-assets-guide.md)).
2. **Lanzamiento en paralelo**: Para CADA skill en la lista objetivo, lanza un subagente separado usando `run_subagent` con `is_background=true`. Lanza hasta 4 subagentes simultáneamente en oleadas. 
   - **ERROR COMÚN**: NO lances un solo subagente con una lista de skills para revisar secuencialmente.
   - **ERROR COMÚN**: NO lances un solo subagente con un prompt que diga "revisa estos 9 skills".
   - **CORRECTO**: Lanza 9 subagentes separados (uno por skill) con prompts individuales.
3. **Un sub-agente por skill**: cada sub-agente corre Fase A → B → C para ese skill solo y escribe `<skills-root>/_reviews/<skill-name>-review.md`.
4. **Orquestador después de todos los handoffs**: espera a que todos los subagentes terminen (`read_subagent` con `block=true`), llena [library-batch-audit.md](references/library-batch-audit.md) y publica el resumen de índice en el chat.

Template de prompt para sub-agente (cada subagente recibe UN skill):

```text
Review ONE agent skill only. Read and follow: <skills-root>/revisar-skills/SKILL.md
Skills root: <path>
Skill to review: <nombre de carpeta o path al SKILL.md>
Scope: single (este skill solo)

IMPORTANTE: Revisa SOLO este skill. No revises otros skills.
Corre Fase A → B → C para este skill solo.
Escribe la revisión en <skills-root>/_reviews/<skill-name>-review.md.
Termina con el bloque Handoff de <skills-root>/_shared/parallel-subagents.md.
```

Ejemplo de implementación correcta (9 skills):
- Lanza subagente 1 con skill-A
- Lanza subagente 2 con skill-B  
- Lanza subagente 3 con skill-C
- ... (continúa hasta skill-9)
- Espera a que los 9 terminen
- Sintetiza resultados

## Errores comunes a evitar

**Incorrecto**: Lanzar un solo subagente con prompt "revisa estos 9 skills: skill-A, skill-B, skill-C..."
**Incorrecto**: Lanzar un solo subagente que itera sobre una lista de skills secuencialmente
**Incorrecto**: Pasar múltiples paths de skills a un solo subagente

**Correcto**: Lanza N subagentes (uno por skill) en paralelo, cada uno con un solo skill asignado

Para scope single (default), corre inline — sin sub-agentes.

## Fase 0 — Resolver entradas

Descubre el skills root — el directorio cuyas subcarpetas contienen un `SKILL.md`. Infiere en este orden:

1. Ruta explícita en el mensaje (path a `SKILL.md` → directorio padre de la carpeta del skill; path a directorio → úsalo como root).
2. Ubicaciones habituales por entorno (primer match gana salvo que el usuario sobreescriba):

   - **Herramientas de desarrollo**: `.cursor/skills/`, `.agents/skills/`, `.claude/skills/`, `.codex/skills/`, `.devin/skills/`
   - **Global**: `~/.cursor/skills/`, `~/.agents/skills/`, `~/.claude/skills/`, `~/.devin/skills/`

3. Si aún es ambiguo, pregunta: "¿Qué directorio de skills debo revisar? (path a la carpeta que contiene las subcarpetas de skills)"

Declara en el chat: skills root resuelto, scope, lista de exclusión (si aplica), y skill(s) objetivo. Luego procede.

Requerido: `SKILL-PATH` (ruta al `SKILL.md` o directorio del skill). Opcional: contenido del skill pegado en el chat si la ruta no existe.

Si scope es single y el path/nombre no es inferible, pregunta: "¿Qué skill debo revisar? (path al SKILL.md o nombre de carpeta del skill)"

## Estrategia de fallo

- Si el archivo no existe o no se puede leer, pide el contenido en el chat.
- Si el usuario no proporciona ni ruta ni contenido, detente con Ready for `blocked`.
- Si las referencias no existen o son ilegibles, continúa con el sistema inline pero documenta la limitación en Preguntas abiertas.
- Si necesitas contar líneas del cuerpo, usa `exec` con `wc -l`.
- Si no puedes clasificar el tipo con [type-checklists/README.md](references/type-checklists/README.md), usa `workflow-step` como default y documenta la ambigüedad en Preguntas abiertas.

**Ejemplo de fallo correcto:**
- Situación: El archivo `SKILL.md` no existe en la ruta proporcionada.
- Acción: Pide el contenido en el chat: "No puedo leer el archivo en esa ruta. Por favor pega el contenido del SKILL.md en el chat."

**Ejemplo de fallo incorrecto:**
- Situación: El archivo `SKILL.md` no existe en la ruta proporcionada.
- Acción incorrecta: Intenta inferir el contenido o continua con un archivo vacío.

## Fase A — Cargar

1. Lee el `SKILL.md` completo bajo revisión (frontmatter + cuerpo).
2. Lee [frontmatter-guide.md](references/frontmatter-guide.md), [naming-guide.md](references/naming-guide.md), [description-guide.md](references/description-guide.md), [direct-writing-guide.md](references/direct-writing-guide.md), [resource-layout-guide.md](references/resource-layout-guide.md) y [dry-assets-guide.md](references/dry-assets-guide.md).
3. Verifica frontmatter según [frontmatter-guide.md](references/frontmatter-guide.md) — `name` coincide con el directorio; longitud `description` ≤ 1024 chars.
4. Marca blockers de layout según [resource-layout-guide.md](references/resource-layout-guide.md).
5. Inventaría assets bundled — lista `references/`, `assets/` y `scripts/` según [dry-assets-guide.md](references/dry-assets-guide.md).
6. Clasifica el tipo de skill (exactamente uno primario). Usa señales observables del cuerpo. Aplica en orden — primer match gana:

   1. **composite**: Principalmente enruta a skills hijos; cuerpo delgado que evita duplicar fases hijas — [Composite](references/type-checklists/composite.md)
   2. **orchestrator**: Coordina múltiples pasos o skills con gates entre ellos — [Orchestrator](references/type-checklists/orchestrator.md)
   3. **chat-gate**: Entregable chat-only (sin path de artefacto requerido); veredicto pass/fail o readiness — [Chat-gate](references/type-checklists/chat-gate.md)
   4. **exploration**: Ejecución desechable o riesgosa con stop-and-approve antes de actuar — [Exploration](references/type-checklists/exploration.md)
   5. **guidelines**: Reglas prescriptivas durante implementación; reglas avoid/prefer, ejemplos, self-check — [Guidelines](references/type-checklists/guidelines.md)
   6. **domain-guide**: Guía de referencia o convenciones sin estructura prescriptiva; fases opcionales — [Domain-guide](references/type-checklists/domain-guide.md)
   7. **workflow-step**: Default — un artefacto principal o análisis con Fase 0–C (o equivalente) — [Workflow-step](references/type-checklists/workflow-step.md)

   Tie-breakers: si tanto `composite` como `orchestrator` aplican, elige `orchestrator` solo cuando el skill define gates inter-paso más allá de la delegación. Si tanto `guidelines` como `domain-guide` aplican, elige `guidelines` cuando el cuerpo incluye reglas avoid/prefer, ejemplos bueno/malo o checklist de self-check antes de terminar. Si tanto `workflow-step` como `guidelines` o `domain-guide` aplican, elige el tipo guía solo cuando no hay artefacto en disco requerido y no hay Fase C de escritura.

   Después de clasificar, lee el checklist compartido de [shared.md](references/type-checklists/shared.md) más el checklist del tipo. Registra tipo y justificación de una línea en el snapshot.

7. Pase de convenciones: lee al menos 2 skills hermanos del mismo tipo dentro del mismo skills root.
8. Nota links de orquestación en `_shared/`, cross-links a hermanos, y candidatos de duplicación intra-skill.

Pon las incógnitas en Preguntas abiertas.

## Fase B — Evaluar y puntuar

Lee [audit-checklists.md](references/audit-checklists.md) y [scoring-rubric.md](references/scoring-rubric.md). Borra el contenido del draft en esta fase — escribe el archivo solo en Fase C.

### Paso 1 — Auditorías de frontmatter

Llena los checklists de name, description, resource layout, DRY & assets y escritura directa en [audit-checklists.md](references/audit-checklists.md). Sigue el formato de output del Contrato de revisión en [scoring-rubric.md](references/scoring-rubric.md) — las auditorías con evidencia larga van como listas, no tablas. Puntúa name, description y DRY & assets por separado (1–10) según sus guías.

### Paso 2 — Auditoría de cuerpo

Puntúa cada fila del [checklist compartido](references/type-checklists/shared.md) más el checklist del tipo clasificado: pass | partial | missing | n/a con evidencia de una línea.
- Puntúa cada fila donde Requerido es sí o recomendado.
- Omite filas marcadas n/a en el checklist de tipo — filas de fase de workflow ausentes que no aplican no se penalizan.
- Usa solo el checklist del tipo clasificado — tipo incorrecto invalida la auditoría de cuerpo.

Nota de herramienta: si el skill hardcodea nombres de herramientas o APIs específicas de una plataforma sin documentar el motivo, marca como important.

### Paso 3 — Comparación con hermanos

Usa el checklist de convenciones en [audit-checklists.md](references/audit-checklists.md). Compara estructura, naming, contenido y patrones de referencia con los ≥ 2 skills hermanos leídos en Fase A.

### Paso 4 — Aplicar hard caps y approve gates

Aplica los hard caps de [scoring-rubric.md](references/scoring-rubric.md) para ajustar dimensiones si es necesario. Verifica approve gates antes de recomendar `approve`.

### Paso 5 — Calcular overall score

Calcula la media aritmética de las 6 dimensiones (un decimal, redondeo half-up). Aplica hard caps antes de mapear a banda usando la tabla de [scoring-rubric.md](references/scoring-rubric.md).

### Paso 6 — Generar hallazgos

Genera hallazgos ordenados por severidad (blocker → important → optional) usando el formato estructurado de [scoring-rubric.md](references/scoring-rubric.md) — sin excepciones, sin free-form `**optional**: …`. Cada hallazgo incluye `file:`, `section/line:`, `impact:`, `evidence:`, `finding:` y `fix:` con oración de reemplazo lista para pegar. Cuando overall ≥ 9, lista mejoras opcionales que no afectan puntuación.

Antes de terminar Fase B, confirma:

- Todas las auditorías llenadas antes de puntuar el cuerpo — usa listas cuando la evidencia supere 50 chars por item (per [direct-writing-guide.md](references/direct-writing-guide.md), sección "Uso de tablas").
- Recomienda `approve` solo cuando los [approve gates](references/scoring-rubric.md) pasan.
- Cita secciones de spec, reglas de guía, o paths de hermanos en cada hallazgo.
- Puntúa skills guidelines y domain-guide contra requisitos de formato de output, no por Fase C ausente cuando el tipo no la requiere.
- Marca acoplamiento de entorno solo cuando bloquea skills no-orchestrator en otros entornos.

### Paso 7 — Hallazgos cross-skill (solo library/batch)

Llena el checklist en [library-batch-audit.md](references/library-batch-audit.md) y publica el resumen de chat index cuando todas las revisiones por skill estén en disco.

## Fase C — Escribir la revisión del skill

Escribe según el Contrato de output de revisión en [scoring-rubric.md](references/scoring-rubric.md). El documento de revisión es un artefacto generado por este skill y debe seguir [direct-writing-guide.md](references/direct-writing-guide.md): voz activa, terminología consistente, sin emojis, párrafos ≤3 oraciones, tablas solo con celdas ≤50 chars, y todo hallazgo en formato estructurado — sin free-form. Confirma que cada item de Verificación de esa sección pasa antes de terminar.

Mejora el archivo de revisión en **como máximo 2** rondas hasta que la puntuación del review-brief sea ≥ 9. Si sigue por debajo de 9 después de 2 rondas, detente e informa los bloqueos.

## Autoevaluación antes de terminar

- Los checklists de [audit-checklists.md](references/audit-checklists.md) están completos con citas concretas.
- Las 6 dimensiones tienen gate, coverage y score asignados.
- La puntuación global y la visión general están presentes y ligadas a la banda de la rúbrica.
- Los hallazgos están ordenados por severidad y citan sección/línea o frase verificada.
- La comparación con hermanos está documentada con patrones vs desviaciones.
- `Ready for` es exactamente uno de los cinco valores y coincide con approve gates.
- No se inventaron hechos sobre el skill; las incógnitas están en Preguntas abiertas.
- No se modificó el skill revisado.
- El review-brief score tiene tally Q1–Q7 + C1–C7 documentado.

## Termina cuando

El archivo de revisión está en disco en `<skills-root>/_reviews/<skill-name>-review.md`, con snapshot del skill, 5 auditorías de frontmatter/layout/DRY/escritura-directa, 9 secciones de auditoría de cuerpo/dimensiones, review-brief score ≥ 9 (o bloqueos reportados tras 2 rondas), hallazgos ordenados por severidad, comparación con hermanos, `Ready for` exactamente uno y Preguntas abiertas solo con incógnitas reales.

Para scope library o batch: cada skill objetivo tiene archivo de revisión en disco, se usaron sub-agentes en paralelo para 2+ skills, y el chat incluye el índice según [library-batch-audit.md](references/library-batch-audit.md).

Termina el mensaje final con este bloque de handoff:

```markdown
## Handoff — revisar-skills
- SKILL-PATH: …
- Skills root: …
- Scope: single | library | batch
- Skill type: <tipo clasificado>
- Dimension scores: <D1>/10, <D2>/10, <D3>/10, <D4>/10, <D5>/10, <D6>/10
- Overall score: <N>/10
- Review-brief score: <N>/10 (Q: <n>/7, C: <n>/7)
- Ready for: <revise-skill | rename-skill | approve | extract-shared | blocked>
- Blockers: <lista o "none">
- Summary: <2–4 oraciones>
```
