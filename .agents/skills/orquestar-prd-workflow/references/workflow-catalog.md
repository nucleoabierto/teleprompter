# Catálogo de workflow

Índice compartido de skills, rutas de artefactos y orden de llamada típico para la biblioteca de workflows de tickets y PR. Expuesto vía `references/workflow-catalog.md` (symlink a `<skills-root>/_shared/workflow-catalog.md`).

Para resolución de entradas (Fase 0, tiers de contexto, orden de inferencia, descubrimiento de documentación), ver [file-discovery.md](./file-discovery.md).

## Workflow de PRD orquestado

Entrada por defecto para trabajo de descubrimiento de producto de extremo a extremo: `.devin/skills/orquestar-prd-workflow/SKILL.md`. Ejecuta skills en orden con gates de Go/No-Go y ramas opcionales (análisis preliminar, división de alcance, features puente, mapeo de assumptions, spike técnico, demo interactivo, diseño de experimentos condicional al stage, loop de múltiples funcionalidades, roadmap consolidado).

Invocables solos cuando los artefactos ya existen:

- **Análisis preliminar** → `analizar-idea` → `…-idea-analysis.md`
  - Rol: Gate inicial con outcome-driven discovery (opcional, paso 0 del orquestador)
- **Alcance** → `evaluar-alcance-idea` → `…-scope-roadmap.md`
  - Rol: Divide ideas complejas en funcionalidades individuales
- **Priorización** → `priorizar-roadmap` → `…-prioritized-roadmap.md`
  - Rol: Priorización basada en RICE
- **Conectividad** → `evaluar-conectividad-tecnica` → `…-prerequisites-assessment.md` + `…-bridge-roadmap.md`
  - Rol: Evalúa prerequisitos y genera features puente
- **Requerimiento** → `capturar-requerimiento` → `…-requirements.md`
  - Rol: Estructura la idea en documento formal
- **Assumptions** → `mapear-assumptions` → `…-assumption-map.md`
  - Rol: Mapea assumptions usando framework David Bland (recomendado, no bloqueante)
- **Viabilidad producto** → `validar-viabilidad-producto` → `…-viability.md`
  - Rol: Gate de viabilidad de negocio
- **Usuarios** → `definir-usuarios` → `…-personas.md`
  - Rol: Define personas primarias y secundarias
- **Casos de uso** → `mapear-casos-uso` → `…-use-cases.md`
  - Rol: Mapea happy path, alternativos, edge cases
- **Experimentos** → `disenar-experimentos` → `…-experiment-design.md`
  - Rol: Diseña setup riguroso de experimento (condicional al stage: Growth/Scale sí, MVP omite)
- **PRD** → `generar-prd` → `…-prd.md`
  - Rol: Genera PRD formal con criterios experimentales

## Workflow de epics orquestado

Entrada por defecto para trabajo de planificación de epics de extremo a extremo: `.devin/skills/orquestar-epic-workflow/SKILL.md`. Ejecuta skills en orden con gates de Go/No-Go y ramas opcionales (priorización de epics, conectividad por epic, spike técnico, loop de múltiples epics).

Invocables solos cuando los artefactos ya existen:

- **Planificar epics** → `planificar-epics` → `…-epic-plan.md`
  - Rol: Transforma PRD en estructura de epics
- **Priorizar epics** → `priorizar-epics` → `…-epic-prioritization.md`
  - Rol: Priorización de epics basada en RICE
- **Conectividad epic** → `evaluar-conectividad-epic` → `…-prerequisites-assessment.md` + `…-bridge-roadmap.md`
  - Rol: Evalúa prerequisitos por epic y genera features puente
- **Dividir epic** → `dividir-epic` → `…-tasks.md`
  - Rol: Divide epic en tareas atómicas
- **TRD** → `generar-trd` → `…-trd.md`
  - Rol: Especifica requisitos técnicos
- **Viabilidad técnica** → `validar-viabilidad-tecnica` → `…-viability-assessment.md`
  - Rol: Valida viabilidad técnica contra codebase
- **Arquitectura** → `generar-arquitectura` → `…-architecture.md`
  - Rol: Genera documentación arquitectónica visual
- **Testing strategy** → `generar-estrategia-testing` → `…-test-strategy.md`
  - Rol: Genera estrategia de testing (ZOMBIE)
- **Test cases** → `sugerir-casos-prueba` → `…-test-cases.md`
  - Rol: Sugiere casos de prueba a nivel de epic
- **Validación completa** → `validar-epic-completo` → `…-complete-validation.md`
  - Rol: Orquesta validación completa de epic
- **ADRs** → `generar-adr` → `adr/ADR-001-*.md`
  - Rol: Genera Architecture Decision Records

## Workflow de tickets orquestado

Entrada por defecto para trabajo de tickets de extremo a extremo: `.devin/skills/implement-ticket/SKILL.md`. Ejecuta skills en orden vía subagentes y respeta puertas entre fases (review → context → triage → plan → implement).

Invocables solos cuando los artefactos ya existen:

- **Revisión** → `ticket-review` → `…-ticket-review.md`
  - Rol: Puntúa calidad del ticket (AC, alcance, deps, estimación)
- **Contexto** → `context-brief` → `…-research-brief.md`
  - Rol: Reúne información de tarea (codebase, deps, riesgos)
- **Triage** → `tasks-triage` → `…-ticket-work-triage.md`
  - Rol: Divide alcance Primary vs Secondary
- **Plan** → `planning-implementation` → `…-implementation-plan.md`
  - Rol: Plan de implementación commit por commit
- **Implementar** → `implementing` → `…-implementation-report.md` + commits locales
  - Rol: Implementa el plan localmente

## Cadena de workflow de PR

Pasos con alcance PR (también invocables solos). Orden típico: contexto → revisión → correcciones del autor → triage de nuevos threads.

- **Contexto** → `context-brief` → `…-research-brief.md`
  - Rol: Reúne información de tarea
- **Revisión** → `pr-review` → `…-pr-<N>-review.md` + `…-pr-<N>-review-comments.md`
  - Rol: Revisor: aprobar o solicitar cambios (sin correcciones de código)
- **Mejorar** → `pr-improvement` → `…-pr-<N>-improvement-notes.md` + commits locales
  - Rol: Autor: aplica hallazgos de revisión localmente
- **Triage de threads** → (no implementado aún) → `…-pr-<N>-comments-triage.md`
  - Rol: Autor/revisor: solo threads abiertos nuevos

## Ramas de exploración y comprensión

- **Spike** → `spike` → `…-spike-notes.md`
  - Cuándo usar: Diseño o ruta de integración desconocida
- **Demo** → `harness` → `…-demo-notes.md`
  - Cuándo usar: UI o comportamiento necesita prueba visible
- **Quiz** → `understanding-quiz` → chat-only
  - Cuándo usar: Puerta de comprensión antes de implementar o revisar

## Nomenclatura de artefactos (auto-descubrimiento)

### Artefactos de PRD

Dado `IDEA-SLUG` o `PRD-SLUG`, busca en el repo. La fase de idea usa prefijo `<IDEA-SLUG>-` (varias ideas coexisten en `idea/`); la fase de PRD usa carpeta `initiatives/<PRD-SLUG>/` sin prefijo redundante (la carpeta aporta el contexto).

**Fase idea** (`docs/<domain>/idea/`):

- `docs/**/idea/<IDEA-SLUG>-idea-analysis.md` O `docs/**/idea/<IDEA-SLUG>/idea-analysis.md` → Análisis preliminar de idea
- `docs/**/idea/<IDEA-SLUG>-scope-roadmap.md` O `docs/**/idea/<IDEA-SLUG>/scope-roadmap.md` → Roadmap de alcance
- `docs/**/idea/<IDEA-SLUG>-prioritized-roadmap.md` O `docs/**/idea/<IDEA-SLUG>/prioritized-roadmap.md` → Priorización de features (desambigua de `epic-prioritization.md`)
- `docs/**/idea/<IDEA-SLUG>-prd-roadmap-state.md` → Estado final del roadmap PRD

**Fase PRD** (`docs/<domain>/initiatives/<PRD-SLUG>/`):

- `docs/**/initiatives/<PRD-SLUG>/requirements.md` → Requerimiento estructurado
- `docs/**/initiatives/<PRD-SLUG>/assumption-map.md` → Mapa de assumptions
- `docs/**/initiatives/<PRD-SLUG>/product-viability.md` → Viabilidad de producto (desambigua de `technical-viability-assessment.md`)
- `docs/**/initiatives/<PRD-SLUG>/personas-mapping.md` → Mapeo de personas (puntero a personas canónicas)
- `docs/**/initiatives/<PRD-SLUG>/use-cases.md` → Casos de uso
- `docs/**/initiatives/<PRD-SLUG>/experiment-design.md` → Diseño de experimento
- `docs/**/initiatives/<PRD-SLUG>/prd.md` → PRD formal
- `docs/**/initiatives/<PRD-SLUG>/prd-workflow-summary.md` → Summary del workflow PRD

**Personas canónicas** (`docs/<domain>/personas/`):

- `docs/<domain>/personas/<persona>.md` → Personas canónicas compartidas
- `docs/<domain>/personas/README.md` → Índice de personas canónicas

**Conectividad PRD** (`docs/<domain>/initiatives/<PRD-SLUG>/connectivity/`):

- `docs/**/initiatives/<PRD-SLUG>/connectivity/prerequisites-assessment.md` → Assessment de prerequisitos (PRD-level)
- `docs/**/initiatives/<PRD-SLUG>/connectivity/bridge-roadmap.md` → Roadmap de features puente (PRD-level)

### Artefactos de dominio

A nivel de dominio, el punto de entrada navegable consolida visión, stage, features (PRDs) con scores RICE, epics y dependencias. El detalle vive en los archivos por iniciativa/idea enlazados desde cada fila.

- `docs/<domain>/roadmap.md` → Roadmap consolidado del dominio
- `docs/<domain>/README.md` → Índice del dominio

### Artefactos de Epic

Dado `PRD-SLUG` o `EPIC-SLUG`, busca en el repo. Los artefactos de epic viven en `initiatives/<PRD-SLUG>/epics/<EPIC-SLUG>/` sin prefijo redundante (la carpeta aporta el contexto); los de planificación/priorización a nivel PRD en `initiatives/<PRD-SLUG>/`.

**Planificación de epics** (`docs/<domain>/initiatives/<PRD-SLUG>/`):

- `docs/**/initiatives/<PRD-SLUG>/epics/epic-plan.md` → Plan de epics
- `docs/**/initiatives/<PRD-SLUG>/epic-prioritization.md` → Priorización de epics

**Por epic** (`docs/<domain>/initiatives/<PRD-SLUG>/epics/<EPIC-SLUG>/`):

- `docs/**/epics/<EPIC-SLUG>/prerequisites-assessment.md` → Assessment de prerequisitos
- `docs/**/epics/<EPIC-SLUG>/bridge-roadmap.md` → Roadmap de features puente (epic)
- `docs/**/epics/<EPIC-SLUG>/tasks.md` → Tareas del epic
- `docs/**/epics/<EPIC-SLUG>/trd.md` → TRD
- `docs/**/epics/<EPIC-SLUG>/viability-assessment.md` → Viabilidad técnica
- `docs/**/epics/<EPIC-SLUG>/architecture.md` → Arquitectura
- `docs/**/epics/<EPIC-SLUG>/test-strategy.md` → Estrategia de testing
- `docs/**/epics/<EPIC-SLUG>/test-cases.md` → Casos de prueba
- `docs/**/epics/<EPIC-SLUG>/complete-validation.md` → Validación completa
- `docs/**/epics/<EPIC-SLUG>/adr-summary.md` → Índice de ADRs del epic

**ADRs y summary** :

- `docs/**/adr/ADR-001-*.md` → ADRs (numeración global, planos en `adr/`)
- `docs/**/initiatives/<PRD-SLUG>/epic-workflow-summary.md` → Summary del workflow epic
- `docs/**/initiatives/<PRD-SLUG>/epic-roadmap-state.md` → Estado final del roadmap epic

### Artefactos de Ticket

Dado `TICKET-SLUG`, busca en el repo:

- `docs/**/<TICKET-SLUG>-research-brief.md` → `CONTEXT-DOC` por defecto
- `docs/**/<TICKET-SLUG>-ticket-review.md`
- `docs/**/<TICKET-SLUG>-ticket-work-triage.md`
- `docs/**/<TICKET-SLUG>-spike-notes.md`
- `docs/**/<TICKET-SLUG>-demo-notes.md`
- `docs/**/<TICKET-SLUG>-implementation-plan.md`
- `docs/**/<TICKET-SLUG>-implementation-report.md`
- `docs/**/<TICKET-SLUG>-pr-<PR-NUMBER>-review.md`
- `docs/**/<TICKET-SLUG>-pr-<PR-NUMBER>-review-comments.md`
- `docs/**/<TICKET-SLUG>-pr-<PR-NUMBER>-comments-triage.md`
- `docs/**/<TICKET-SLUG>-pr-<PR-NUMBER>-improvement-notes.md`

Cuando múltiples candidatos coincidan, prefiere el tipo de artefacto para el paso de workflow actual (ver las tablas de workflow orquestado, PR y exploración arriba). Si sigue ambiguo, pregunta.
