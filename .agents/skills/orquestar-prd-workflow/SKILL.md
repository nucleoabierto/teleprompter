---
name: orquestar-prd-workflow
description: >-
  Orquesta el workflow completo de PRD (evaluar-alcance-idea →
  priorizar-roadmap → evaluar-conectividad-tecnica → capturar-requerimiento →
  validar-viabilidad-producto → definir-usuarios → mapear-casos-uso →
  generar-prd) con gates de go/no-go y loop de procesamiento para múltiples
  funcionalidades. Genera uno o múltiples PRDs listos para planificación
  arquitectónica. Úsalo cuando el usuario pida crear, generar, desarrollar,
  idear o implementar PRDs desde una idea bruta, o definir el producto
  requirements document de una funcionalidad nueva. No lo usas para ejecutar
  skills individuales del workflow ni para planificar epics (usa
  orquestar-epic-workflow).
---

# Orquestador de Workflow PRD

Orquestador que ejecuta workflow completo: Idea bruta → Uno o múltiples PRDs formales. Coordina 7 skills en secuencia con gates de validación, loop de procesamiento para múltiples funcionalidades, y ramas opcionales de investigación (features puente, spike, demo) cuando el gate de conectividad, viabilidad o los casos de uso lo requieren.

**Workflow**:
0. `analizar-idea` (opcional) → Gate preliminar de viabilidad
0.5. **Reconstrucción de estado** (Fase 0.5) → Lee `workflow-state.md` para reanudar tras interrupción
1. `evaluar-alcance-idea` [GATE] → Múltiples funcionalidades vs funcionalidad única
2. `priorizar-roadmap` [GATE] → Priorizar funcionalidades o features puente
3. `evaluar-conectividad-tecnica` [GATE] → Conectado vs desconectado
4. `capturar-requerimiento` → Requirements structured
4.5. `mapear-assumptions` (recomendado) → Assumptions mapeados en 4 buckets
4.5.5. `construir-spike` (gate de feasibility) → Spike por assumptions de feasibility de riesgo alto
5. `validar-viabilidad-producto` [GATE] → Go/No-Go/Conditional Go
5.5. `construir-spike` (opcional) → Spike por Conditional Go por riesgo técnico
6. `definir-usuarios` → Personas
7. `mapear-casos-uso` → Use cases
7.5. `construir-demo` (opcional) → Visibilidad de flujos complejos
7.6. `disenar-experimentos` (condicional al stage) → Diseño de experimento
8. `generar-prd` → PRD formal
9. Loop: ¿Hay más funcionalidades? → Sí: seleccionar siguiente, repetir desde paso 3
10. Consolidate results → PRDs listos
11. Generar `roadmap.md` consolidado del dominio → Punto de entrada navegable

Diagrama completo: [references/flow-diagram.md](references/flow-diagram.md).

Solo orquestación: no ejecuta skills directamente. Coordina y reporta. Siguiente eslabón de la cadena: `orquestar-epic-workflow/SKILL.md` (para cada PRD generado).

## Cuándo usarlo y cuándo no

- **Sí**: el usuario pide crear, generar, desarrollar, idear o implementar PRDs desde una idea bruta, o definir el producto requirements document de una funcionalidad nueva.
- **No**: el usuario pide ejecutar skills individuales del workflow (invoca el skill hijo directamente), planificar epics desde un PRD (usa `orquestar-epic-workflow`), o implementar tickets (usa `implementar-ticket`).

## Entrada y salida

- **Entrada**: `IDEA-DESCRIPCION` (string, obligatorio) — descripción breve o completa de la idea.
- **Scope** (opcional): `single` (default) | `library` | `batch` — no aplica aquí; el orquestador procesa múltiples funcionalidades internamente vía loop.
- **Salida**: `docs/<domain>/initiatives/<PRD-SLUG>/prd-workflow-summary.md` con resumen del workflow, PRDs generados, artefactos por funcionalidad, quality checklist y `Ready for: planificar-epics | workflow-complete | needs-review`.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas compartida (Fase 0) |
| [workflow-catalog.md](references/workflow-catalog.md) | Cadenas de skills y rutas de artefactos |
| [orchestrator-pattern.md](references/orchestrator-pattern.md) | Template canónico para orquestadores |
| [state-reconstruction.md](references/state-reconstruction.md) | Formato de `workflow-state.md`, tabla canónica pasos→artefactos, patrón de skip-check |
| [artifact-catalog.md](references/artifact-catalog.md) | Inventario canónico de artefactos por funcionalidad y de roadmap |
| [operational-notes.md](references/operational-notes.md) | Reanudación tras interrupción, timings, criterios experimentales por estado |
| [flow-diagram.md](references/flow-diagram.md) | Diagrama de flujo del workflow |
| [parallel-subagents.md](references/parallel-subagents.md) | Protocolo de sub-agentes en paralelo |

## Protocolo de delegación

Para cada fase, delega a un agente hijo cuando el host soporte delegación de subagentes:

1. El agente hijo lee el `SKILL.md` completo del skill hijo antes de actuar.
2. El agente hijo ejecuta solo las fases de ese skill y no inicia el siguiente paso del workflow.
3. El agente hijo termina su mensaje final con el bloque de handoff definido abajo.

### Plantilla de prompt por fase

```text
Estás ejecutando una fase de orquestar-prd-workflow.

IDEA-DESCRIPCION: <descripción>
FUNCIONALIDAD-SLUG: <slug o null>
Artefactos previos: <lista rutas de handoffs previos>

1. Lee y sigue exactamente: <ruta absoluta o relativa al repo del SKILL.md hijo>
2. Escribe el artefacto de salida del skill en la ruta que especifica.
3. Termina con el bloque Handoff definido en orquestar-prd-workflow/SKILL.md.
```

### Handoff block template

Cada skill hijo debe terminar su mensaje final con:

```markdown
## Handoff — <nombre-fase>
- IDEA-SLUG: …
- FUNCIONALIDAD-SLUG: … (o null)
- Artefacto: <ruta o "none">
- Ready for / Siguiente paso: <valor del menú del skill>
- Bloqueadores: <lista o "none">
- Resumen: <2–4 oraciones>
```

### Perfiles de delegación por fase

Cuando el host soporte elegir un perfil de delegación, prefiere:

- **Fase Pre-A**: `analizar-idea/SKILL.md` → analysis / general (análisis preliminar)
- **Fase A**: `evaluar-alcance-idea/SKILL.md` → analysis / general (análisis de alcance)
- **Fase B**: `priorizar-roadmap/SKILL.md` → analysis / general (priorización RICE)
- **Fase C**: `evaluar-conectividad-tecnica/SKILL.md` → explore / general (exploración de codebase)
- **Fase D**: `capturar-requerimiento/SKILL.md` → analysis / general (estructuración de requerimiento)
- **Fase D.5**: `mapear-assumptions/SKILL.md` → analysis / general (mapeo de assumptions)
- **Fase D.5.5 / E.5**: `construir-spike/SKILL.md` → explore / general (spike desechable)
- **Fase E**: `validar-viabilidad-producto/SKILL.md` → analysis / general (validación de viabilidad)
- **Fase F**: `definir-usuarios/SKILL.md` → analysis / general (definición de personas)
- **Fase G**: `mapear-casos-uso/SKILL.md` → analysis / general (mapeo de casos de uso)
- **Fase G.5**: `construir-demo/SKILL.md` → explore / general (demo interactivo)
- **Fase G.6**: `disenar-experimentos/SKILL.md` → analysis / general (diseño de experimento)
- **Fase H**: `generar-prd/SKILL.md` → analysis / general (generación de PRD)

En hosts sin delegación de subagentes, ejecuta cada `SKILL.md` hijo inline en la misma sesión. Ejecuta las fases secuencialmente; incluso cuando el host soporte subagentes paralelos, espera cada handoff hijo antes de iniciar el siguiente paso.

## Fase 0 — Resolver entrada

Requerido: `IDEA-DESCRIPCION`. Resuelve la entrada siguiendo [file-discovery.md](references/file-discovery.md).

Infiere desde:
- Descripción pegada: breve descripción de la idea
- Email/chat snippet: si usuario copia descripción informal
- Contenido breve: "Agregar dark mode", "2FA", "Agregar exportación PDF"

Pregunta cuando falta: "¿Cuál es la idea? (descripción breve o completa)"

Declara inputs resueltos: idea capturada, IDEA-SLUG derivado.

## Fase 0.5 — Reconstrucción de Estado (Resume tras interrupción)

Ejecuta el algoritmo de reconstrucción completo definido en [state-reconstruction.md](references/state-reconstruction.md). Ese archivo contiene: formato de `workflow-state.md`, algoritmo de reconstrucción con verificación cruzada de artefactos, tabla canónica de pasos → artefactos, y el patrón de skip-check que cada fase aplica.

Reporta al usuario:
- Si es ejecución nueva: "Iniciando workflow desde cero para <IDEA-SLUG>."
- Si es reanudación: "Workflow reanudado. Último paso completado: <LAST-STEP>. Funcionalidad en proceso: <CURRENT-FUNC>. Continuando desde: <siguiente fase>."

## Fase Pre-A — Paso 0: Análisis Preliminar (opcional)

Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `analizar-idea` (artefacto: `docs/<domain>/idea/<IDEA-SLUG>/idea-analysis.md`).

```
IF NO existe idea-analysis.md:
  → Invoca: analizar-idea [IDEA-DESCRIPCION]
  → Lee el veredicto (Proceder / Proceder condicional / No proceder)
  → IF No proceder: STOP, Ready for: "blocked"
  → IF Proceder o Proceder condicional:
      → Actualiza workflow-state.md (last-completed-step = analizar-idea)
      → Continúa a Fase A

IF SÍ existe:
  → Actualiza workflow-state.md (registro tardío si no estaba)
  → Continúa directo a Fase A
```

## Fase A — Paso 1: Evaluar Alcance [GATE]

Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `evaluar-alcance-idea` (artefacto: `docs/<domain>/idea/<IDEA-SLUG>/scope-roadmap.md` o legacy `…-scope-roadmap.md`).

```
Invoca: evaluar-alcance-idea [IDEA]

Salida esperada: ver evaluar-alcance-idea/SKILL.md § Salida
Artefacto canónico: docs/<domain>/idea/<IDEA-SLUG>/scope-roadmap.md

IF Múltiples funcionalidades:
  → Actualiza workflow-state.md (last-completed-step = evaluar-alcance-idea)
  → Continúa a Fase B

IF Funcionalidad única:
  → Actualiza workflow-state.md
  → Continúa a Fase B con una sola funcionalidad

IF Information insufficient:
  → STOP, Reporta preguntas abiertas, Ready for: "blocked"
```

## Fase B — Paso 2: Priorizar Roadmap [GATE]

Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `priorizar-roadmap` (artefacto: `docs/<domain>/idea/<IDEA-SLUG>/feature-prioritization.md` o legacy `…-prioritized-roadmap.md`).

```
Invoca: priorizar-roadmap [SCOPE-ROADMAP-RUTA]

Salida esperada: ver priorizar-roadmap/SKILL.md § Salida
Artefacto canónico: docs/<domain>/idea/<IDEA-SLUG>/feature-prioritization.md

IF Hay items priorizables:
  → Selecciona funcionalidad más prioritaria (Rank #1)
  → FUNCIONALIDAD-SLUG = [slug de funcionalidad seleccionada]
  → Actualiza workflow-state.md:
    - last-completed-step = priorizar-roadmap
    - current-functionality = FUNCIONALIDAD-SLUG
  → Continúa a Fase C

IF Todos los items bloqueados:
  → STOP, Reporta dependencias faltantes, Ready for: "blocked"

IF Information insufficient:
  → STOP, Reporta preguntas abiertas, Ready for: "blocked"
```

## Fase C — Paso 3: Evaluar Conectividad Técnica [GATE]

Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `evaluar-conectividad-tecnica` (artefacto: `docs/<domain>/initiatives/<PRD-SLUG>/connectivity/prerequisites-assessment.md`).

```
Invoca: evaluar-conectividad-tecnica [FUNCIONALIDAD-SLUG]
Salida esperada: ver evaluar-conectividad-tecnica/SKILL.md § Salida
Artefactos: prerequisites-assessment.md (siempre) + bridge-roadmap.md (solo si desconectado)

IF Conectado (incluye greenfield — veredicto "conectado (greenfield)"):
  → Actualiza state (last-completed-step = evaluar-conectividad-tecnica) → Fase D
IF Desconectado:
  → Lee bridge-roadmap.md → Invoca priorizar-roadmap [BRIDGE-ROADMAP-RUTA]
  → Selecciona feature puente más prioritaria → FUNCIONALIDAD-SLUG = [slug]
  → Actualiza state (current-functionality = FUNCIONALIDAD-SLUG, current-step = evaluar-conectividad-tecnica)
  → Repite Fase C para feature puente
IF Information insufficient: → STOP, Reporta preguntas abiertas, Ready for: "blocked"
```

## Fase D — Paso 4: Capturar Requerimiento

Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `capturar-requerimiento` (artefacto: `docs/<domain>/initiatives/<PRD-SLUG>/requirements.md`).

```
Invoca: capturar-requerimiento [FUNCIONALIDAD-SLUG]

Salida esperada: ver capturar-requerimiento/SKILL.md § Salida
Artefacto canónico: docs/<domain>/initiatives/<PRD-SLUG>/requirements.md

→ Actualiza workflow-state.md (last-completed-step = capturar-requerimiento)
→ Continúa a Fase D.5
```

## Fase D.5 — Paso 4.5: Mapear Assumptions (recomendado)

Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `mapear-assumptions` (artefacto: `docs/<domain>/initiatives/<PRD-SLUG>/assumption-map.md`). Si `mapear-assumptions` está en `skipped-steps` (omisión justificada), skip y continúa a Fase D.5.5.

```
Invoca: mapear-assumptions [FUNCIONALIDAD-SLUG]

Salida esperada: ver mapear-assumptions/SKILL.md § Salida
Artefacto canónico: docs/<domain>/initiatives/<PRD-SLUG>/assumption-map.md

Nota: Este paso es recomendado pero no bloqueante. Si el contexto es
greenfield de bajo riesgo, puede omitirse con justificación.

IF se ejecutó:
  → Actualiza workflow-state.md (last-completed-step = mapear-assumptions)
  → Continúa a Fase D.5.5
IF se omitió con justificación:
  → Actualiza workflow-state.md (añade fila a skipped-steps con la justificación)
  → Continúa a Fase D.5.5 (sin assumptions que filtrar)
```

## Fase D.5.5 — Gate de Spike por Feasibility Assumption

Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `construir-spike (feasibility gate)` (artefacto: `docs/<domain>/initiatives/<PRD-SLUG>/spike-notes.md`). Si `mapear-assumptions` se omitió (no hay `assumption-map.md`, o es stub "Omitido"), skip y continúa a Fase E.

**Propósito**: disparar `construir-spike` para assumptions de feasibility de riesgo medio/alto y evidencia baja/media **antes** de `validar-viabilidad-producto`. Frena el problema donde un assumption de feasibility queda enterrado porque el veredicto general es por demanda.

Precondición: `assumption-map.md` existe y NO es stub "Omitido".

```
1. Leer assumption-map.md
2. Filtrar: bucket=feasibility, risk∈{Alto,Medio}, evidence∈{Baja,Media}, spike-required=yes
3. IF hay matches: → Por cada match, invocar construir-spike con spike-question del assumption
   → Salida: ver construir-spike/SKILL.md § Salida; Artefacto: spike-notes.md por assumption
   → Registrar cada spike en workflow-state.md (completed-steps)
4. IF no hay matches: → Continúa directo a Fase E
5. Registrar decisión en state: completed-steps por spike, o nota "feasibility gate: sin spikes requeridos"
→ Continúa a Fase E
```

## Fase E — Paso 5: Validar Viabilidad [GATE]

Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `validar-viabilidad-producto` (artefacto: `docs/<domain>/initiatives/<PRD-SLUG>/product-viability.md`).

```
Invoca: validar-viabilidad-producto [FUNCIONALIDAD-SLUG]
Salida esperada: ver validar-viabilidad-producto/SKILL.md § Salida
Artefacto: docs/<domain>/initiatives/<PRD-SLUG>/product-viability.md
Veredicto: Go / Conditional Go / No-Go

IF Go: → Actualiza state (last-completed-step = validar-viabilidad-producto) → Fase F
IF No-Go: → Estado roadmap "Rechazado" → ¿Más funcionalidades? (Fase I) → Si no: STOP, workflow-complete
IF Conditional Go:
  → Lee condiciones en product-viability.md
  → SI riesgo técnico no resuelto: Ejecuta Fase E.5 (spike técnico)
  → SI no técnica: Reporta condiciones, usuario resuelve manualmente → Fase F
```

### Fase E.5 — Spike Técnico (opcional)

Se ejecuta solo cuando Fase E resuelve Conditional Go por riesgo técnico. Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `construir-spike` (artefacto: `docs/<domain>/initiatives/<PRD-SLUG>/spike-notes.md`).

```
Invoca: construir-spike [FUNCIONALIDAD-SLUG, pregunta de diseño extraída de condiciones]
Salida esperada: ver construir-spike/SKILL.md § Salida
Artefacto: spike-notes.md (si el usuario pide conservarlas)

SI Ready for ≠ blocked: → Actualiza state (last-completed-step = construir-spike) → Fase F
SI Ready for = blocked: → Estado roadmap "Bloqueado por riesgo técnico" → ¿Más funcionalidades? (Fase I) → Si no: STOP, workflow-complete
```

## Fase F — Paso 6: Definir Usuarios

Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `definir-usuarios` (artefacto: `docs/<domain>/initiatives/<PRD-SLUG>/personas-mapping.md`).

```
Invoca: definir-usuarios [FUNCIONALIDAD-SLUG]

Salida esperada: ver definir-usuarios/SKILL.md § Salida
Artefacto canónico: docs/<domain>/initiatives/<PRD-SLUG>/personas-mapping.md
  (+ docs/<domain>/personas/<persona>.md canónicas si son nuevas)

→ Actualiza workflow-state.md (last-completed-step = definir-usuarios)
→ Continúa a Fase G
```

## Fase G — Paso 7: Mapear Casos de Uso

Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `mapear-casos-uso` (artefacto: `docs/<domain>/initiatives/<PRD-SLUG>/use-cases.md`).

```
Invoca: mapear-casos-uso [FUNCIONALIDAD-SLUG]

Salida esperada: ver mapear-casos-uso/SKILL.md § Salida
Artefacto canónico: docs/<domain>/initiatives/<PRD-SLUG>/use-cases.md

→ Actualiza workflow-state.md (last-completed-step = mapear-casos-uso)
→ Continúa a Fase G.5 (demo opcional) → Fase G.6 (experimentos condicional)
```

### Fase G.5 — Paso 7.5: Visibilidad de Flujos con Demo (opcional)

Ofrece esta rama cuando la matriz de casos de uso incluye flujos complejos (state machines, sincronización, multi-paso) que conviene validar con el equipo o stakeholders antes de comprometerse al PRD. No bloquea el avance: se ejecuta solo si el usuario la pide o el orquestador detecta alta complejidad en los casos mapeados.

Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `construir-demo` (artefacto: `docs/<domain>/initiatives/<PRD-SLUG>/harness-notes.md`). Si está en `skipped-steps`, skip.

```
Invoca: construir-demo [FUNCIONALIDAD-SLUG, usando use-cases.md como contexto]

Salida esperada: ver construir-demo/SKILL.md § Salida
Artefacto: docs/<domain>/initiatives/<PRD-SLUG>/harness-notes.md

IF se ejecutó: añade construir-demo a completed-steps
IF se omitió: añade construir-demo a skipped-steps

→ Continúa a Fase G.6
```

## Fase G.6 — Paso 7.6: Diseñar Experimentos (condicional)

Verifica el stage del producto (de `personas-mapping.md` o `product-viability.md`).

Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `disenar-experimentos` (artefacto: `docs/<domain>/initiatives/<PRD-SLUG>/experiment-design.md`). Si está en `skipped-steps` (stage MVP o ya omitido), skip.

```
IF Stage = Growth (1K-10K users) o Scale (10K+ users):
  → Invoca: disenar-experimentos [FUNCIONALIDAD-SLUG]
  → Salida esperada: ver disenar-experimentos/SKILL.md § Salida
  → Artefacto: docs/<domain>/initiatives/<PRD-SLUG>/experiment-design.md
  → Actualiza workflow-state.md (last-completed-step = disenar-experimentos)
  → Continúa a Fase H

IF Stage = MVP (<1000 users):
  → OMITE este paso (A/B tests no apropiados para MVP)
  → generar-prd usará criterios experimentales simplificados estado-específicos
  → Actualiza workflow-state.md (disenar-experimentos marcado como omitido en skipped-steps)
  → Continúa directo a Fase H
```

## Fase H — Paso 8: Generar PRD (FINAL)

Aplica skip-check de [state-reconstruction.md](references/state-reconstruction.md) para paso `generar-prd` (artefacto: `docs/<domain>/initiatives/<PRD-SLUG>/prd.md`).

```
Invoca: generar-prd [FUNCIONALIDAD-SLUG]

Salida esperada: ver generar-prd/SKILL.md § Salida
Artefacto canónico: docs/<domain>/initiatives/<PRD-SLUG>/prd.md
Ready for del PRD: planificar-epics

→ Actualiza workflow-state.md (last-completed-step = generar-prd)
→ Continúa a Fase I (loop de procesamiento)
```

## Fase I — Paso 9: Loop de Procesamiento [GATE]

Lee `docs/<domain>/idea/<IDEA-SLUG>/feature-prioritization.md` (o legacy `…-prioritized-roadmap.md`).

```
IF hay funcionalidades con estado "Pendiente" o "En progreso":
  → Estado actual en roadmap: "Completado"
  → Selecciona siguiente Rank sin completar → FUNCIONALIDAD-SLUG = [slug]
  → Actualiza state: current-functionality=FUNCIONALIDAD-SLUG, current-step=evaluar-conectividad-tecnica,
    last-completed-step=null (reinicia; pasos previos quedan en completed-steps con su columna Functionality)
  → Repite desde Fase C

IF no hay más funcionalidades:
  → Estado actual en roadmap: "Completado"
  → Genera docs/<domain>/idea/<IDEA-SLUG>/prd-roadmap-state.md con estado final
  → Actualiza state: current-step=consolidar-resultados, last-completed-step=loop-de-procesamiento
  → Continúa a Fase J
```

## Fase J — Consolidar Resultados

Verifica el inventario completo de artefactos contra [artifact-catalog.md](references/artifact-catalog.md). Marca `prd.md` como Main Deliverable por cada funcionalidad procesada.

→ Continúa a Fase K

## Fase K — Generar Roadmap Consolidado del Dominio

Genera o actualiza `docs/<domain>/roadmap.md` consolidando: visión del dominio, stage (MVP/Growth/Scale), tabla de features (PRDs) con scores RICE y estado, desglose de epics por PRD (si existen), cadencia de dependencias, próximos pasos, riesgos residuales. Este archivo es el punto de entrada navegable del dominio; el detalle vive en los archivos por iniciativa/idea enlazados desde cada fila.

## Fase K.1 — Gate de Cierre (verificar artefactos de cierre)

Ejecuta la verificación de cierre completa definida en [artifact-catalog.md](references/artifact-catalog.md) § Verificación de cierre.

```
Artefactos de cierre obligatorios: prd.md (por funcionalidad), prd-roadmap-state.md,
prd-workflow-summary.md, roadmap.md, workflow-state.md (current-step=consolidar-resultados+)

IF todos existen: → Ready for: planificar-epics
IF falta alguno obligatorio: → Genera el faltante antes de cerrar; reporta qué se generó tardíamente
IF falta por omisión justificada: → Verifica registro (stub o campo en summary); si no, genera el registro
```

## Fase K.2 — Reporte de Workflow y Salida

Escribe en: `docs/<domain>/initiatives/<PRD-SLUG>/prd-workflow-summary.md`

**Secciones requeridas**:
- Idea original y objetivo
- Análisis de alcance (múltiples funcionalidades vs única)
- Resumen de procesamiento (totales, generados, rechazados, bloqueados)
- Lista de PRDs generados (con estado: done/pending)
- Artefactos por funcionalidad y de roadmap (referencia a [artifact-catalog.md](references/artifact-catalog.md))
- Criterios experimentales (por PRD)
- Quality checklist por PRD: PRD completo, personas definidas, casos mapeados (happy+alternativa+edge), criterios experimentales estado-específicos, success metrics con thresholds, timeline realista, riesgos documentados
- Siguiente paso: `planificar-epics` para cada PRD; siguiente eslabón: `orquestar-epic-workflow/SKILL.md`
- Ready for: `planificar-epics` | `workflow-complete` | `needs-review`

Ready for valores:
- `planificar-epics`: Workflow completo, uno o múltiples PRDs aprobados y listos
- `workflow-complete`: Workflow completado pero todos los items fueron rechazados/bloqueados
- `needs-review`: PRDs completos pero awaiting sign-off ejecutivo

## Autoevaluación antes de terminar

- ¿Resolviste `IDEA-DESCRIPCION` siguiendo [file-discovery.md](references/file-discovery.md)?
- ¿Ejecutaste Fase 0.5 (reconstrucción de estado) y reportaste reanudación o ejecución nueva?
- ¿Cada fase aplicó el skip-check de [state-reconstruction.md](references/state-reconstruction.md)?
- ¿Cada gate tuvo rama Go/No-Go/Conditional + rama "Information insufficient → blocked"?
- ¿Cada skill hijo fue invocado con delegación (plantilla de prompt + handoff block) cuando el host lo soporta?
- ¿Actualizaste `workflow-state.md` después de cada paso completado?
- ¿Ejecutaste el loop de procesamiento (Fase I) para múltiples funcionalidades?
- ¿Generaste `roadmap.md` consolidado del dominio (Fase K)?
- ¿Verificaste artefactos de cierre obligatorios contra [artifact-catalog.md](references/artifact-catalog.md) (Fase K.1)?
- ¿El `prd-workflow-summary.md` tiene `Ready for: planificar-epics` (o `workflow-complete`/`needs-review`)?
- ¿Enlace al siguiente eslabón (`orquestar-epic-workflow/SKILL.md`) presente en el reporte?

## Termina cuando

El `prd-workflow-summary.md` está en disco, con `Ready for: planificar-epics | workflow-complete | needs-review`, todos los artefactos de cierre obligatorios verificados contra [artifact-catalog.md](references/artifact-catalog.md), `workflow-state.md` refleja el cierre, y el reporte enlaza el siguiente eslabón (`orquestar-epic-workflow/SKILL.md`).

Termina el mensaje final con este bloque de handoff:

```markdown
## Handoff — orquestar-prd-workflow
- IDEA-SLUG: …
- Skills root: …
- PRDs generados: <lista de rutas o "none">
- Ready for: planificar-epics | workflow-complete | needs-review | blocked
- Blockers: <lista o "none">
- Summary: <2–4 oraciones>
- Siguiente eslabón: orquestar-epic-workflow/SKILL.md
```
