# analizar-idea Skill Review

## 1. Snapshot

- **Path**: `/Users/gil/projects/factory/.agents/skills/analizar-idea/SKILL.md`
- **Skills root**: `/Users/gil/projects/factory/.agents/skills/`
- **Tipo clasificado**: `workflow-step` — produce un artefacto principal (`idea-analysis.md`) con estructura de fases 0-G, gate de avance y handoff al siguiente skill.
- **Host**: agnóstico — no menciona APIs de entorno específico.
- **Fecha de revisión**: 2026-08-08
- **Contexto**: revisión post-mejora estructural usando `esbozar-idea` como referencia 10/10. Cambios aplicados: gate extraído a `references/gate-guide.md`, ejemplos canónicos añadidos, templates recortados (DRY), `Ready for` reemplazado por `status`/`next` en frontmatter, triggers añadidos a description, "Qué NO va" y "Distinciones clave" añadidos al template.

## 2. Auditoría de name

- **Spec**: minúsculas, guiones, 13 chars (≤64), sin `--`, coincide con directorio — **pass**
- **Token principal es verbo**: "analizar" (infinitivo) — **pass**
- **Verbo coincide con acción principal**: body dice "Analiza preliminarmente una idea de producto" — **pass**
- **Sufijo de etapa**: `-idea` — no es sufijo estándar de los listados (-review, -brief, -plan, -triage) pero es comprensible y específico del dominio de ideas — **partial**
- **No es ambiguo vs hermanos**: `esbozar-idea` vs `analizar-idea` vs `evaluar-alcance-idea` — diferenciación clara por verbo — **pass**
- **Longitud razonable**: 13 chars (< 35) — **pass**

**Name score: 9** — Pass en spec, verbo, ambigüedad y longitud. Un partial en sufijo no estándar (-idea no está en la lista de sufijos canónicos pero es consistente con la cadena de workflow).

**Alineación de acción**: sí — "analizar" coincide con "Analiza preliminarmente una idea".

## 3. Auditoría de description

- **Tercera persona**: sí, sin I/you — **pass**
- **WHAT — capacidades + entregable**: "Analiza preliminarmente una idea de producto definiendo el resultado deseado sin mencionar solución. Evalúa alineación estratégica, urgencia, disponibilidad de recursos y genera recomendación Proceder/Proceder condicional/No proceder. Salida: docs/<domain>/idea/<IDEA-SLUG>/idea-analysis.md." — **pass**
- **WHEN — frases de trigger o etapa**: "Úsalo como gate preliminar de viabilidad antes de evaluar-alcance-idea." — **pass**
- **Palabras clave de trigger**: "analizar, evaluar, validar viabilidad, hacer un gate preliminar, decidir si proceder con una idea" — **pass** (triggers añadidos en esta revisión)
- **Boundary — qué NO hace**: "Solo análisis: no implementa, no aprueba, no evalúa alcance (usa evaluar-alcance-idea). Para implementación usa implementar-plan o implementar-ticket." — **pass**
- **Longitud 1–1024 caracteres**: dentro del rango — **pass**
- **name coincide con directorio**: sí — **pass**
- **Routing test**: para "analizar idea" → win vs `esbozar-idea` (esbozar es pre-formulación, analizar es viabilidad). Para "evaluar viabilidad" → win vs `validar-viabilidad-producto` (boundary aclara: gate preliminar vs aprobación final). Para "gate preliminar" → win, es el único que se declara como gate preliminar. — **pass**
- **No marketing / no vague / no body leakage**: — **pass**

**Description score: 10** — Todas pass, cero hallazgos. Los triggers añadidos mejoran el routing significativamente vs la versión anterior.

**Routing test detallado**:
- Trigger "analizar idea" → win vs [esbozar-idea](../esbozar-idea/SKILL.md) (esbozar = pre-formulación, analizar = viabilidad)
- Trigger "evaluar viabilidad" → win vs [validar-viabilidad-producto](../validar-viabilidad-producto/SKILL.md) (boundary: gate preliminar vs aprobación final)
- Trigger "gate preliminar" → win, único skill que se declara como gate preliminar de viabilidad

## 4. Auditoría de resource layout

- **Refs bundled usan `references/`, `assets/` bajo skill root**: `references/` contiene `gate-guide.md`, `domain-readme-spec.md`, `examples/`; `assets/` contiene `idea-analysis-template.md`, `decision-matrix-template.md`, `open-questions-template.md` — **pass**
- **Links desde SKILL.md usan `references/` o `assets/`**: todos los links usan paths relativos bajo el skill root — **pass**
- **Sin links directos `../_shared/`**: ningún link a `_shared/` desde SKILL.md — **pass**
- **Divulgación progresiva**: Fase E delega a `assets/decision-matrix-template.md`, Fase G delega a `references/gate-guide.md`, Fase F delega a `assets/idea-analysis-template.md` — **pass**
- **Fases-subproceso completas extraídas**: Fase G (gate con severidad, estados, flujo, reglas — >30 líneas) extraída a `references/gate-guide.md` con resumen operativo en SKILL.md. Fase E (matriz con scoring, umbrales, profile — >30 líneas) delegada a `assets/decision-matrix-template.md` con resumen operativo. — **pass**
- **Archivos de referencia >100 líneas con TOC**: `gate-guide.md` (154 líneas) tiene TOC. `domain-readme-spec.md` (39 líneas) no necesita TOC. — **pass**
- **Archivos de `references/` sin menciones directas a skills específicos**: `gate-guide.md` menciona `evaluar-alcance-idea` como valor de `next` en el gate — consistente con el patrón de [esbozar-idea](../esbozar-idea/SKILL.md) cuyo gate-guide también menciona `analizar-idea` y `evaluar-alcance-idea`. La mención es parte de la lógica del gate (valor del campo `next`), no routing. — **pass**

**Resumen layout**: pass — sin blockers ni findings important.

## 5. Auditoría DRY & assets

### Inventario de assets

| Archivo | Rol |
| ---------- | -------- |
| `assets/idea-analysis-template.md` (92 líneas) | Template del artefacto de salida — frontmatter, secciones, convenciones, "Qué NO va", "Distinciones clave" |
| `assets/decision-matrix-template.md` (110 líneas) | Template de matriz de decisión — scoring, umbrales, profile, ejemplo canónico |
| `assets/open-questions-template.md` (34 líneas) | Template de preguntas abiertas — formato, categorías, delega gate a gate-guide |
| `references/gate-guide.md` (154 líneas) | Fuente única de verdad del gate — severidad, estados, flujo, reglas, ejemplos |
| `references/domain-readme-spec.md` (39 líneas) | Spec del README del dominio — compartido con otros skills del workflow |
| `references/examples/example-proceder.md` (124 líneas) | Ejemplo canónico — caso "Proceder" con `status: ready` |
| `references/examples/example-condicional.md` (138 líneas) | Ejemplo canónico — caso "Proceder condicional" con `status: conditional` |

### Checklist DRY

- **Inventario de assets listado**: sí, 7 archivos en `assets/`, `references/` y `references/examples/` — **pass**
- **Cada archivo del inventario enlazado con rol declarado**: todos enlazados desde SKILL.md o desde idea-analysis-template.md (un salto) — **pass**
- **Rúbricas/checklists/templates largos en carpeta correcta**: gate-guide en `references/`, templates en `assets/`, ejemplos en `references/examples/` — **pass**
- **`assets/` para templates/schemas; `scripts/` cuando aplica**: n/a — no hay scripts ejecutables en este skill — **pass** (n/a)
- **Sin bloques duplicados sin owner canónico**: gate lógica tiene owner canónico único (`gate-guide.md`); matriz tiene owner canónico (`decision-matrix-template.md`); reglas de formato de matriz definidas una vez en `decision-matrix-template.md` — **pass**
- **Composite/orchestrator — fases hijas no copiadas**: n/a — skill es workflow-step — **pass** (n/a)
- **Candidatos extract-shared**: `domain-readme-spec.md` es idéntico entre `analizar-idea/references/` y `evaluar-alcance-idea/references/` — candidato a `_shared/` symlink. Ver hallazgos. — **partial**

**DRY & assets score: 9** — Gate pass; todas las filas pasan excepto una partial (candidato extract-shared para domain-readme-spec.md).

**Candidatos extract-shared**:
- `domain-readme-spec.md` — ruta canónica propuesta: `<skills-root>/_shared/domain-readme-spec.md`; consumidores: `analizar-idea`, `evaluar-alcance-idea` (y potencialmente otros skills del workflow que actualizan el README).

## 6. Auditoría de escritura directa

### Grep scan

- file: SKILL.md
  line: 100
  evidence: "¿Riesgo técnico manejable?"
  veredicto: pass — "manejable" es término de dominio (manageable risk), no instrucción vaga "maneja"

- file: SKILL.md
  line: 150
  evidence: "evalúa el inventario de preguntas abiertas"
  veredicto: pass — "inventario" es sustantivo (inventory), no verbo "invent"; false positive del grep

- file: SKILL.md
  line: 152
  evidence: "registre inventario de preguntas"
  veredicto: pass — false positive, "inventario" = sustantivo

- file: SKILL.md
  line: 188
  evidence: "inventario de preguntas, evidencia de alerta"
  veredicto: pass — false positive

- file: assets/idea-analysis-template.md
  line: 42
  evidence: "inventario de preguntas identificadas"
  veredicto: pass — false positive

- file: references/gate-guide.md
  line: 26
  evidence: "Impacto significativo pero manejable"
  veredicto: pass — término de dominio

- file: references/gate-guide.md
  line: 48
  evidence: "Presenta el inventario de preguntas"
  veredicto: pass — false positive

- file: references/gate-guide.md
  line: 64
  evidence: "el inventario refleja"
  veredicto: pass — false positive

- file: references/gate-guide.md
  line: 70
  evidence: "alertar al usuario con el inventario"
  veredicto: pass — false positive

- file: references/gate-guide.md
  line: 77
  evidence: "inventario con estado, evidencia de alerta"
  veredicto: pass — false positive

- file: references/gate-guide.md
  line: 152
  evidence: "El inventario lista todas las preguntas"
  veredicto: pass — false positive

- file: references/domain-readme-spec.md
  line: 7
  evidence: "`evaluar-alcance-idea`, `definir-usuarios`, `generar-prd`, etc."
  veredicto: partial — "etc." con lista abierta; podría listar el conjunto cerrado de skills del workflow o referenciar el workflow-catalog

### Checklist de escritura directa

- **Grep scan corrido; cada hit listado individualmente**: sí, 12 hits listados arriba — **pass**
- **Cero veredictos fail en líneas de manejo de gaps**: cero fails — **pass**
- **Ruta de desconocidos**: Preguntas abiertas + gate de avance condicionado en Fase G — **pass**
- **Pasos de Fase B usan verbos imperativos**: "Extrae", "Evalúa", "Verifica" — **pass**
- **Fronteras nombran acción excluida con sustituto**: "no implementa (usa implementar-plan)", "no aprueba (usa validar-viabilidad-producto)", "no evalúa alcance (usa evaluar-alcance-idea)" — **pass**
- **Description usa verbos específicos**: "Analiza", "Evalúa", "genera" — **pass**

**Rewrite para hit partial** (domain-readme-spec.md line 7):
```text
`analizar-idea` (primer skill del Workflow 0) es responsable de crear el README si no existe. Los skills posteriores (`evaluar-alcance-idea`, `definir-usuarios`, `mapear-casos-uso`, `generar-prd`, `planificar-epics`) actualizan la tabla de "Puntos de entrada" y el árbol de estructura conforme generan nuevos artefactos.
```

## 7. Rewrite de description propuesto

`none` — description score = 10.

## 8. Anchors de convención de hermanos

- [esbozar-idea](../esbozar-idea/SKILL.md) — referencia 10/10. Diferencia de convención: esbozar-idea usa `level: producto | feature` para distinguir tipos de idea; analizar-idea no necesita `level` pero añade `profile: full | lite` como señal ortogonal para el orquestador. Ambos usan `status`/`next` en frontmatter del artefacto, gate-guide en `references/`, y ejemplos canónicos en `references/examples/`.

- [evaluar-alcance-idea](../evaluar-alcance-idea/SKILL.md) — hermano inmediato downstream. Diferencia de convención: evaluar-alcance-idea aún usa "Ready for" en lugar de `status`/`next` en frontmatter, y su `open-questions-template.md` aún tiene la versión bloatada (236 líneas) con el gate duplicado. analizar-idea ahora sirve como anchor de convención mejorada para evaluar-alcance-idea.

## 9. Auditoría de cuerpo

### Checklist compartido (todos los tipos)

- **Propósito de apertura — audiencia y tarea en un párrafo**: "Combina análisis preliminar de viabilidad con definición de resultado deseado. Evalúa rápidamente si la idea merece inversión y define el resultado sin mencionar la solución." — **pass**
- **Fronteras — acciones excluidas concretas o skills hermanos**: "Cuándo usarlo y cuándo no" + boundary en description — **pass**
- **Ruta de desconocidos — Preguntas abiertas y/o ask antes de proceder**: Fase G gate + Preguntas Abiertas section — **pass**
- **Links de recursos — `references/foo.md`, no `../_shared/`**: todos los links usan paths relativos bajo skill root — **pass**
- **Desacoplamiento de referencias — `references/` sin menciones directas a skills específicos**: gate-guide menciona `evaluar-alcance-idea` como valor de `next` — consistente con esbozar-idea — **pass**
- **Links a skills hermanos cuando está en una cadena de workflow**: SKILL.md enlaza `esbozar-idea` (upstream), `evaluar-alcance-idea` (downstream), `validar-viabilidad-producto`, `implementar-plan`, `implementar-ticket` — **pass**

### Checklist workflow-step

Referencia: [type-checklists/workflow-step.md](../revisar-skills/references/type-checklists/workflow-step.md)

**Requerido**:
- **Fase 0 — Resolver entradas**: presente, declara `IDEA-DESCRIPCION` requerido, infiere desde múltiples fuentes — **pass**
- **Fase A — Cargar contexto**: Fase A define resultado deseado (carga el contexto de la idea); Fase 0 también lee artefacto upstream si existe — **pass**
- **Fase B — Procesar/analizar**: Fases B-D evalúan alineación, urgencia, recursos — **pass**
- **Fase C — Escribir artefacto**: Fase F escribe análisis preliminar usando template — **pass**
- **Estrategia de fallo en cada fase**: Fases B, C, D tienen estrategias de fallo explícitas con defaults conservadores — **pass**
- **Done when claro con entregables**: Checklist de salida + Salida section con path y template — **pass**

**Recomendado**:
- **Referencias compartidas relevantes**: `domain-readme-spec.md` compartido con evaluar-alcance-idea — **pass**
- **Autoevaluación antes de terminar**: Checklist de salida con 13 ítems en dos secciones (contenido + formato) — **pass**
- **Handoff estructurado**: Gate con `status`/`next` en frontmatter del artefacto — **pass**
- **Fases-subproceso completas extraídas a `references/`**: Fase G → gate-guide, Fase E → decision-matrix-template — **pass**
- **Ejemplos canónicos del artefacto en `references/examples/`**: example-proceder.md + example-condicional.md — **pass**
- **Archivos de referencia >100 líneas con TOC**: gate-guide.md (154 líneas) tiene TOC — **pass**

## 10. Puntuación por dimensión + overall

### Dimension 1 — Metadata
- **Gate**: pass — Spec name pass, Spec description pass
- **Cobertura**: 6/6 filas name (1 partial: sufijo no estándar), 9/9 filas description (0 partials)
- **Score: 9** — Pass; 1 partial en sufijo no estándar; cero blocker/important

### Dimension 2 — Contrato When/How/What
- **Gate**: pass — When pass, How pass, What pass
- **Cobertura**: 5/5 filas (0 partials)
- **Score: 10** — Pass; todas las filas pass; cero hallazgos

### Dimension 3 — Estructura
- **Gate**: pass — Tipo match pass, Longitud pass (201 < 500), Navegabilidad pass
- **Cobertura**: 7/7 filas layout (0 partials), 6/6 requerido workflow-step (0 partials), 6/6 recomendado workflow-step (0 partials)
- **Score: 10** — Pass; todas las filas pass; cero hallazgos

### Dimension 4 — Accionabilidad
- **Gate**: pass — Imperativo pass, Inputs explícitos pass, Medible pass
- **Cobertura**: verbos imperativos en todas las fases, `IDEA-DESCRIPCION` declarado, evidencia medible (matriz con scores)
- **Score: 10** — Pass; todas las filas pass; cero hallazgos

### Dimension 5 — Completitud
- **Gate**: pass — Done when pass, Estrategia de fallo pass, Autoevaluación pass
- **Cobertura**: done when claro (checklist + salida), estrategias de fallo en Fases B/C/D, autoevaluación con 13 ítems
- **Score: 10** — Pass; todas las filas pass; cero hallazgos

### Dimension 6 — Responsabilidad
- **Gate**: pass — Única pass, Sin anti-patrones pass
- **Cobertura**: una sola acción (analizar viabilidad preliminar), sin fregadero de cocina, sin copia-y-pega
- **Score: 10** — Pass; todas las filas pass; cero hallazgos

### Overall skill score

Media aritmética: (9 + 10 + 10 + 10 + 10 + 10) / 6 = 9.83 → **10** (redondeo half-up con hard caps aplicados: sin blockers, dimensión mín = 9 ≥ 9, metadata ≥ 9, description ≥ 10, estructura ≥ 10).

**Hard caps verificados**:
- Sin fila blocker en layout → ok
- Metadata score 9 ≥ 7 → ok
- Description score 10 ≥ 7 → ok
- Sin dimensión ≤ 4 → ok
- Sin hallazgos blocker → ok
- Sin hallazgos important → ok
- Cero hits fail de escritura directa → ok
- Estructura 201 < 500 líneas → ok
- Estrategia de fallo completa → ok
- Responsabilidad única → ok

**Approve gates verificados**:
- Metadata 9 ≥ 8 → ok
- Description 10 ≥ 8 → ok
- DRY & assets 9 ≥ 8 → ok
- Estructura 10 ≥ 8 → ok
- Accionabilidad 10 ≥ 8 → ok
- Responsabilidad 10 ≥ 8 → ok
- Dimensión mín 9 ≥ 9 → ok
- Sin hallazgos blocker → ok
- 0 hallazgos important (≤ 2) → ok
- Sin filas blocker en layout → ok
- Sin hits fail en escritura directa → ok

## 11. Fortalezas

- **Gate extraído a fuente única de verdad**: `references/gate-guide.md` elimina la duplicación que existía entre SKILL.md Fase G y `open-questions-template.md` (antes ~120 líneas duplicadas). Patrón idéntico al de [esbozar-idea](../esbozar-idea/SKILL.md).
- **Ejemplos canónicos completos**: dos ejemplos en `references/examples/` cubren los dos veredictos principales (Proceder con `status: ready` y Proceder condicional con `status: conditional`), incluyendo gate documentado, matriz de decisión y preguntas abiertas. El agente puede ver el output esperado sin inferir.
- **`status`/`next` en frontmatter**: reemplaza el "Ready for" del body por señales estructuradas en frontmatter, consistente con esbozar-idea. Facilita el parsing por orquestadores.
- **"Qué NO va" y "Distinciones clave"**: el template ahora incluye secciones que previenen over-production del agente y aclaran pares de conceptos fáciles de confundir. Patrón tomado de esbozar-idea.
- **Templates recortados**: `open-questions-template.md` de 236 → 34 líneas (-86%), `decision-matrix-template.md` de 221 → 110 líneas (-50%). Eliminado contenido de skills ajenos.
- **Triggers explícitos en description**: "analizar, evaluar, validar viabilidad, hacer un gate preliminar, decidir si proceder" mejora el routing vs la versión anterior que no tenía triggers.

## 12. Hallazgos

### Mejoras opcionales (overall ≥ 9)

```
file: references/domain-readme-spec.md
section/line: line 7
impact: optional
evidence:
  "`evaluar-alcance-idea`, `definir-usuarios`, `generar-prd`, etc."
finding:
  "etc." con lista abierta — direct-writing-guide prefiere conjuntos cerrados o referencia a catálogo
fix:
  Reemplazar "etc." por lista cerrada: "`evaluar-alcance-idea`, `definir-usuarios`, `mapear-casos-uso`, `generar-prd`, `planificar-epics`"
```

```
file: references/domain-readme-spec.md
section/line: file-level
impact: optional
evidence:
  domain-readme-spec.md es idéntico entre analizar-idea/references/ y evaluar-alcance-idea/references/
finding:
  Duplicación intra-library de un spec compartido — candidato extract-shared a _shared/ symlink
fix:
  Mover a `<skills-root>/_shared/domain-readme-spec.md` y crear symlink `references/domain-readme-spec.md` → `../_shared/domain-readme-spec.md` en ambos skills
```

## 13. Score del brief de revisión

### Capa A — Gates de calidad

- **Q1 Routing**: pass — 3 frases trigger documentadas con hermano más cercano y resultado win/lose
- **Q2 Alineación de acción**: pass — verbo "analizar" citado, alineación confirmada
- **Q3 Evidencia de gate**: pass — cada dimensión lista gate result (pass/partial/fail) + cobertura
- **Q4 Delta de hermanos**: pass — 2 hermanos citados (esbozar-idea, evaluar-alcance-idea) con diferencia específica
- **Q5 Trazabilidad de hallazgos**: pass — 2 hallazgos optional, cada uno cita sección de spec/guía
- **Q6 Fit de Ready for**: pass — Ready for = approve, approve gates verificados
- **Q7 Escritura directa**: pass — 12 hits listados individualmente con file/line/evidence/veredicto; 1 partial con rewrite listo

### Capa B — Checks de completitud

- **C1**: pass — checklist de name llenado
- **C2**: pass — checklist de description llenado
- **C3**: pass — checklist de resource layout llenado
- **C4**: pass — checklist DRY llenado, tabla de inventario presente
- **C5**: pass — checklist de escritura directa llenado
- **C6**: pass — checklist compartido + workflow-step llenado
- **C7**: pass — 6 scores de dimensión + overall con gate + evidencia

**Review brief score: 10/10** — Q = 7/7, C = 7/7.

## 14. Ready for

**`approve`** — Overall score 10 (media 9.83 redondeada); dimensión mín 9; metadata 9; description 10; estructura 10; todos los approve gates pasan; sin hallazgos blocker; 0 hallazgos important (≤ 2); sin filas blocker en layout; sin hits fail en escritura directa. Los 2 hallazgos optional no afectan scores.

## 15. Preguntas abiertas

- El `_shared/decision-matrix-template.md` (7710 bytes) y `_shared/open-questions-template.md` (11008 bytes) aún contienen las versiones antiguas bloatadas. Otros skills que consumen estos shared templates podrían beneficiarse de las versiones recortadas de analizar-idea. ¿Migrar las versiones mejoradas a `_shared/` o mantener skills-specific?
- `evaluar-alcance-idea` aún usa "Ready for" en lugar de `status`/`next` y tiene el `open-questions-template.md` bloatado (236 líneas). ¿Aplicar las mismas mejoras a evaluar-alcance-idea para consistencia de cadena?
