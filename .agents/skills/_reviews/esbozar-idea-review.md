# Revisión: esbozar-idea

- Skill: `esbozar-idea`
- Tipo: `workflow-step`
- Skills root: `.agents/skills/`
- Fecha: 2026-08-02
- Revisor: revisar-skills (scope single)

## Snapshot

- **name**: `esbozar-idea` — coincide con directorio, minúsculas, guiones, sin `--`, ≤64 chars. Verbo infinitivo `esbozar` + sustantivo `idea`, alineado con la convención del repo (`analizar-idea`, `capturar-requerimiento`, `generar-prd`).
- **description**: 811 chars (≤1024). WHAT (chat interactivo que esboza y pule una idea bruta en un esbozo ligero para el Workflow 1) + WHEN (idea muy verde/vaga no lista para `analizar-idea`) + Boundary (no evalúa viabilidad, no estructura requerimientos, no divide alcance, no genera PRD) + trigger keywords (esbozar, dar forma a, pulir, redactar, aclarar). Tercera persona, sin I/you.
- **Layout**: `SKILL.md` + `assets/` (esbozo-template.md, open-questions-template.md). Sin `references/` ni `scripts/` (no aplica — el skill no carga contexto externo ni usa helpers ejecutables).
- **Tipo justificación**: `workflow-step` — produce un artefacto principal en disco (`docs/drafts/<IDEA-SLUG>/esbozo.md`) con estructura Fase 0–D. No es `chat-gate` (escribe a disco), no es `orchestrator` (no enruta a skills hijos con puertas inter-paso), no es `composite`.

## Auditoría de resource-layout

| Fila                                                                  | Estado | Evidencia                                                                                 |
|-----------------------------------------------------------------------|--------|-------------------------------------------------------------------------------------------|
| SKILL.md requerido                                                    | pass   | presente                                                                                  |
| references/ para docs suplementarios                                  | n/a    | el skill no carga docs externos; el único doc suplementario es el template (asset)        |
| assets/ para templates                                                | pass   | `esbozo-template.md` + `open-questions-template.md`                                       |
| Links desde SKILL.md vía `references/` o `assets/` (no `../_shared/`) | pass   | tras fix: referencias a `assets/esbozo-template.md` y `assets/open-questions-template.md` |
| Sin rúbricas largas inlineadas                                        | pass   | templates en `assets/`, no inline                                                         |

**Hallazgo resuelto (blocker → fixed)**: el SKILL.md referenciaba `../_shared/open-questions-template.md` directamente, lo cual viola el resource-layout-guide (links desde SKILL.md deben pasar por `references/` o `assets/` del skill). Corregido copiando `open-questions-template.md` a `assets/` (patrón de `analizar-idea`) y actualizando las dos referencias en el cuerpo.

## Auditoría de DRY & assets

| Fila                                           | Estado | Evidencia                                                    |
|------------------------------------------------|--------|--------------------------------------------------------------|
| Sin duplicación de contenido largo en SKILL.md | pass   | templates externalizados en `assets/`                        |
| Divulgación progresiva                         | pass   | rúbrica de gate y template de artefacto en assets, no inline |
| Assets enlazados desde SKILL.md                | pass   | ambos assets referenciados                                   |
| Sin assets huérfanos                           | pass   | ambos assets usados                                          |

Nota DRY: `open-questions-template.md` se copia desde `_shared/` (mismo patrón que `analizar-idea/assets/open-questions-template.md`). Es la convención del repo para exponer docs compartidos vía `assets/` del skill. No se penaliza — sigue el patrón establecido por el skill hermano inmediato.

## Auditoría de escritura directa

| Fila                                            | Estado | Evidencia                                                                                                            |
|-------------------------------------------------|--------|----------------------------------------------------------------------------------------------------------------------|
| Sin voz pasiva vaga ("se hace", "es manejado")  | pass   | verbos imperativos: Infiere, Pregunta, Conduce, Haz, Consolida, Verifica                                             |
| Sin "I/you"                                     | pass   | tercera persona                                                                                                      |
| Fronteras concretas (qué no hace)               | pass   | "Cuándo usarlo y cuándo no" + reglas "No soluciónices / No evalúes viabilidad / No dividas alcance / No profundices" |
| Ruta de desconocidos (Preguntas abiertas / ask) | pass   | Fase 0 pide si falta input; Fase B marca "necesita reformulación"; Fase D `bloqueado`; sección Preguntas Abiertas    |

## Dimensiones (1–10)

| Dim | Nombre          | Gate | Score | Evidencia                                                                                                |
|-----|-----------------|------|-------|----------------------------------------------------------------------------------------------------------|
| 1   | Metadata        | pass | 9     | name + description cumplen spec; sin blocker/important                                                   |
| 2   | When/How/What   | pass | 9     | When con condiciones +/-; How con Fase 0–D + fallback; What con artefacto + Ready for                    |
| 3   | Estructura      | pass | 9     | workflow-step, 165 líneas body (<500), headings skimmables                                               |
| 4   | Accionabilidad  | pass | 9     | imperativos, input `IDEA-DESCRIPCION` declarado, gate medible (claro/parcial/bloqueado, max 3 rondas)    |
| 5   | Completitud     | pass | 9     | done when (checklist 10 ítems), estrategia de fallo en Fase 0/B/D, autoevaluación                        |
| 6   | Responsabilidad | pass | 9     | acción única (esbozar/pulir idea), sin kitchen-sink (excluye explícitamente viabilidad/alcance/personas) |

**Overall**: 9.0

## Approve gates

- Metadata ≥ 8: 9 ✓
- Description ≥ 8: 9 ✓
- DRY & assets ≥ 8: 9 ✓
- Estructura ≥ 8: 9 ✓
- Accionabilidad ≥ 8: 9 ✓
- Responsabilidad ≥ 8: 9 ✓
- Sin hallazgos blocker: ✓ (el único blocker encontrado se resolvió antes de cerrar)
- ≤ 2 hallazgos important: 0 ✓
- Sin hits fail de escritura directa: ✓

## Fortalezas

- Límite de alcance nítido con `analizar-idea`: formulación interactiva del resultado (este skill) vs análisis de viabilidad (el siguiente). Las reglas "No soluciónices / No evalúes viabilidad / No dividas alcance / No profundices" previenen solapamiento.
- Artefacto temporal en `docs/drafts/` bien justificado: la idea aún no está comprometida con un dominio ni con el flujo 1, y `analizar-idea` produce el durable equivalente.
- Gate de readiness (Fase D) con tres estados (claro/parcial/bloqueado) mapeado a `Ready for`, consistente con el patrón de gate de `analizar-idea` Fase G.
- Lligereza explícita: el template lista qué NO va en el esbozo y a qué skill downstream pertenece cada contenido excluido — evita que el esbozo se infle y pise el flujo 1.

## Hallazgos

Ninguno blocker o important tras el fix. Hallazgos optional:

- **optional**: la línea de `Ready for` en Fase D documenta el path relativo `../../<domain>/idea/<IDEA-SLUG>/idea-analysis.md` (link que usará el artefacto `esbozo.md`, no el SKILL.md). Podría aclararse con una nota "path relativo desde el artefacto" para evitar confusión con links de recursos del SKILL.md. No afecta routing ni handoff.

## Hermanos comparados

- **`analizar-idea`** (workflow-step, downstream inmediato): mismo patrón de Fase 0 + fases A–G + gate de avance + checklist de salida + Preguntas Abiertas. `esbozar-idea` reutiliza el criterio de "resultado válido" de `analizar-idea` Fase A (sin duplicar el análisis de viabilidad), confirmando la frontera. Mismo patrón de copiar `open-questions-template.md` a `assets/`.
- **`capturar-requerimiento`** (workflow-step, estructuración de requerimiento): frontera clara — `esbozar-idea` produce el esbozo ligero pre-flujo, `capturar-requerimiento` estructura el requerimiento formal ya dentro del flujo 1 (con gate de no-solutionización). No hay solapamiento.

## Review-brief

- Q1 (tipo clasificado): workflow-step ✓
- Q2 (metadata válida): ✓
- Q3 (description routing > hermanos): ✓
- Q4 (estructura < 500 líneas): ✓ (165)
- Q5 (sin blocker/important sin resolver): ✓
- Q6 (Ready for consistente con gates): ✓ — approve

**Review-brief score**: 6/6

## Ready for

`approve` — el skill cumple los gates de aprobación. El único blocker (links `../_shared/` desde SKILL.md) se resolvió antes de cerrar la revisión.

## Preguntas Abiertas

Ninguna bloqueante. Opcional: confirmar con el maintainer si el directorio `docs/drafts/` (fuera de `docs/<domain>/`) es aceptable como staging temporal, dado que rompe la convención `docs/<domain>/...` — justificado por ser pre-dominio y temporal, pero es una decisión de producto que conviene validar.
