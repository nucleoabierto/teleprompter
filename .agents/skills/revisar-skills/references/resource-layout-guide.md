# Guía de layout de recursos

Layout alineado con la spec para skills bajo revisión. Checklist de auditoría: [audit-checklists.md](./audit-checklists.md#auditoría-de-resource-layout). Impacto en puntuación: [scoring-rubric.md](./scoring-rubric.md).

## Layout estándar

| Ubicación                | Rol                                       |
|--------------------------|-------------------------------------------|
| `skill-name/SKILL.md`    | Requerido — instrucciones                 |
| `skill-name/references/` | Docs suplementarios (cargan bajo demanda) |
| `skill-name/assets/`     | Templates, schemas, archivos estáticos    |
| `skill-name/scripts/`    | Helpers ejecutables                       |

## Docs compartidos (`_shared/`)

Las librerías de skills pueden mantener docs canónicos compartidos en `<skills-root>/_shared/<doc>.md`. Aplica las mismas reglas de escritura directa y estilo que en `SKILL.md`.

- **Accesibilidad** — Cada consumidor expone los docs compartidos vía `references/` del skill (symlink o copia)
- **Link desde SKILL.md** — Usa `references/foo.md` — un nivel bajo el root del skill (subdirectorios dentro de `references/` permitidos, ej: `references/examples/foo.md`)
- **Blocker** — Links directos `../_shared/…` desde `SKILL.md`, o links fuera del árbol del skill

Marca violaciones de layout como hallazgos blocker — impacto en puntuación per [audit-checklists.md](./audit-checklists.md#auditoría-de-resource-layout).

## Divulgación progresiva

El contenido de referencia largo pertenece a `references/`, `assets/`, o `scripts/` — no inlinado en `SKILL.md` cuando un archivo separado aplica.

- **Rúbricas, checklists, tablas de gate** → `references/`
- **Templates de documentos, schemas** → `assets/`
- **Scripts de validación, generadores** → `scripts/`
- **Ejemplos canónicos del artefacto de salida** → `references/examples/` (un archivo por ejemplo, referenciado desde `SKILL.md`)
- **Instrucciones cortas de acción (< 30 líneas)** → Puede quedar inline en `SKILL.md`

### Fases como subprocesos

Cuando una fase del skill (Fase A, B, C, etc.) es un subproceso completo con sus propias reglas, pasos y ejemplos, extrae el detalle a `references/` y deja solo un resumen operativo en `SKILL.md`. El resumen operativo declara el objetivo de la fase y enlaza la referencia con una descripción de qué contiene (ej: "5 rondas máx, 3 preguntas núcleo + 6 de enriquecimiento").

- **Fase-subproceso completa** (reglas, pasos, ejemplos, >30 líneas) → `references/`
- **Resumen operativo en SKILL.md** — objetivo + link con descripción breve
- **Gate de fase** — la lógica del gate puede extraerse a `references/` cuando incluye severidad, estados y flujo

## Qué es un blocker de layout

- Links de `SKILL.md` a `../_shared/` directamente (deben pasar por `references/`)
- Archivos en `references/` no enlazados desde ningún lugar (huérfanos)
- Rúbricas de puntuación completas inlineadas en `SKILL.md` (> 50 líneas de contenido de referencia)
- Checklists de auditoría inlineados cuando existe un archivo en `references/` equivalente
- Fase-subproceso completa inlineada en `SKILL.md` cuando supera las 30 líneas y tiene reglas propias

## Qué es un finding important de layout

- Archivo de referencia >100 líneas sin TOC
- Archivo de `references/` que menciona skills específicos por nombre (acoplamiento — el routing vive en `SKILL.md`)
