# Spec: README del dominio (índice)

Especificación de la estructura del índice del dominio en `docs/<domain>/README.md`.

## Responsabilidad

`analizar-idea` (primer skill del Workflow de PRD) es responsable de crear el README si no existe. Los skills posteriores (`evaluar-alcance-idea`, `definir-usuarios`, `generar-prd`, etc.) actualizan la tabla de "Puntos de entrada" y el árbol de estructura conforme generan nuevos artefactos.

## Si no existe `docs/<domain>/README.md`

Créalo con la estructura completa. En la primera ejecución (típicamente `analizar-idea`), muchas secciones tendrán placeholders o enlaces a artefactos que aún no existen (se poblarán conforme avance el workflow).

**Lo que `analizar-idea` aporta en esta primera ejecución**: el único artefacto real es `idea/<IDEA-SLUG>/idea-analysis.md`. La tabla de "Puntos de entrada" incluye esa fila con enlace activo; las demás filas (roadmap, personas, ADRs, PRD, epics) se incluyen como placeholders pendientes. El árbol de estructura muestra `idea/` con contenido y las carpetas restantes (`initiatives/`, `personas/`, `adr/`) marcadas como "(pendiente)".

## Si existe `docs/<domain>/README.md`

- Actualiza la tabla de "Puntos de entrada" con un enlace al artefacto recién generado.
- Actualiza el árbol de estructura si hay nuevos directorios/archivos.

## Estructura requerida (alineada con el ejemplo real)

1. **Título**: `# Dominio: <domain>`
2. **Descripción breve**: 1-2 frases describiendo el dominio.
3. **Tabla de "Puntos de entrada"**: tabla markdown con columnas `Quiero…` | `Ir a` (enlace relativo). Filas típicas:
   - Ver el roadmap consolidado del dominio → `roadmap.md`
   - Conocer a los usuarios (personas) → `personas/README.md`
   - Ver las decisiones arquitectónicas (ADRs) → `adr/README.md`
   - Ver el análisis de la idea original → `idea/<IDEA-SLUG>/idea-analysis.md`
   - Ver el PRD activo → `initiatives/<PRD-SLUG>/README.md`
   - Ver el estado global de los epics del PRD → `initiatives/<PRD-SLUG>/epics-status.md`
4. **Árbol de estructura**: bloque de código `text` mostrando la jerarquía de directorios del dominio (`idea/`, `initiatives/`, `personas/`, `adr/`) con comentarios breves por carpeta sin listar el contenido. Reflejar el estado actual (algunas ramas pueden marcarse como "(pendiente)" si aún no existen).
5. **Convenciones**: sección `## Convenciones` que documenta las convenciones de naming, organización de archivos y formato de slugs usadas en el dominio. Ejemplos:
   - Dominio como carpeta raíz: `docs/<domain>/...`
   - `README.md` como índice en cada carpeta navegable (no `INDEX.md`)
   - Personas canónicas en `personas/` (una por archivo, compartidas entre iniciativas)
   - Roadmap consolidado en `roadmap.md`
   - ADRs planos con numeración global en `adr/`
   - `STATUS.md` por epic
   - Nombres explícitos: `product-viability.md` (producto) vs `technical-viability-assessment.md` (técnica); `epic-prioritization.md` (epics dentro de un PRD) vs `feature-prioritization.md` (features/PRDs entre sí)
   - Formato de slugs: `<IDEA-SLUG>/idea-analysis.md` (subdirectorio)
