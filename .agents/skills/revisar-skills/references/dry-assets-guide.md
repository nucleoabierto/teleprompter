# Guía de DRY & assets

Rúbrica de auditoría para divulgación progresiva, carpetas de assets alineadas con la spec, y duplicación interna en el skill bajo revisión. Reglas de layout: [resource-layout-guide.md](./resource-layout-guide.md). Checklist: [audit-checklists.md](./audit-checklists.md#auditoría-de-dry--assets). Impacto en puntuación: dimensión 3 en [scoring-rubric.md](./scoring-rubric.md).

## Layout de assets

- **`references/`** — Docs suplementarios cargados bajo demanda (rúbricas, checklists, guías de proceso, gates)
  - Evitar: Pegar rúbricas largas o fases-subproceso completas inline en `SKILL.md`
- **`references/examples/`** — Ejemplos canónicos del artefacto de salida (un archivo por ejemplo)
  - Evitar: Inlinear ejemplos completos del artefacto en `SKILL.md` o en `assets/`
- **`assets/`** — Templates, schemas, archivos estáticos que el agente copia o rellena
  - Evitar: Bloques de ejemplo grandes que pertenecen a un template
- **`scripts/`** — Helpers ejecutables (validadores, generadores)
  - Evitar: One-liners de shell repetidos en prosa cuando un script aplica

## Scan requerido en toda revisión

1. **Inventario** — lista cada archivo bajo `references/`, `assets/`, y `scripts/` (incluye subdirectorios como `references/examples/`; o documenta ninguno).
2. **Accesibilidad** — cada archivo en el inventario está enlazado desde `SKILL.md` o desde un doc `references/` enlazado (un salto).
3. **Claridad de rol** — cada asset enlazado tiene un rol declarado en la tabla de referencias o en la lista de carga de Fase A (sin archivos huérfanos).
4. **Inline vs externo** — marca rúbricas, checklists, templates, o tablas de gate pegadas en `SKILL.md` cuando un archivo `references/` aplica.
5. **Fases-subproceso** — marca fases del skill que son subprocesos completos (>30 líneas con reglas propias) inlineadas en `SKILL.md` cuando deberían extraerse a `references/` con un resumen operativo.
6. **Duplicación intra-skill** — grep por números de threshold repetidos, filas de checklist, o bloques de fase en `SKILL.md` y refs bundled; nota si hay un archivo canónico.
7. **Duplicación en skill hijo** — para tipos `composite`/`orchestrator`, marca checklists de Fase A/B/C de skills hijos copiados en el cuerpo del padre.
8. **Candidatos extract-shared** — nota contenido duplicado vs hermanos o vs `<skills-root>/_shared/` que debería ser canónico + symlinkeado.

Registra hallazgos en la sección DRY & assets audit de la revisión. Lista candidatos extract-shared con ruta canónica propuesta y consumidores, o `none`.

## Score DRY & assets (1–10)

Puntúa por separado de name y description. Aplica primero el gate de uso, luego cobertura de filas del checklist.

Gate de uso: ¿están los assets bundled en las carpetas correctas, enlazados, y libres de duplicación dañina?

- **pass** — Hasta 10
- **partial** (contenido inline menor o un bloque duplicado con fix obvio) — Hasta 8
- **fail** (rúbricas grandes inlineadas, refs huérfanas/faltantes, o tablas de gate duplicadas sin owner canónico) — ≤ 6

### Matriz de score

- **10**: Gate pass; todas las filas del checklist pasan; cada archivo del inventario tiene un rol declarado
- **9**: Gate pass; todas las filas pasan excepto exactamente una partial en wording de rol u `scripts/` opcional ausente cuando no aplica
- **8**: Gate pass o partial; un candidato extract-shared documentado o una sección thin inline
- **7**: Gate partial; múltiples filas partial pero handoff aún claro
- **5–6**: Gate fail, o 2+ filas missing, o composite/orchestrator duplica fases hijas
- **1–4**: Sin divulgación progresiva cuando el skill tiene contenido de referencia grande; links de assets rotos

### Interacción con Ready for

- Score < 8 con candidatos extract-shared → prefiere `extract-shared` cuando el cuerpo y el routing están OK.
- Score < 8 con rúbricas/checklists inlineados → `revise-skill` con fixes de mover a `references/` listados.
