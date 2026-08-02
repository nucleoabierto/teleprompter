# Rúbrica de puntuación

Dimensiones, hard caps, approve gates y matriz de puntuación para `revisar-skills`.

## Contenido

- [Hard caps (techos duros)](#hard-caps-techos-duros)
- [Approve gates](#approve-gates)
- [Impacto de hallazgos](#impacto-de-hallazgos)
- [Dimensiones (1–10 cada una)](#dimensiones-110-cada-una)
- [Overall skill score](#overall-skill-score)
- [Formato de hallazgos](#formato-de-hallazgos)
- [Ready for (exactamente uno)](#ready-for-exactamente-uno)
- [Contrato de output de revisión](#contrato-de-output-de-revisión)
- [Review brief rating (1–10)](#review-brief-rating-110)

## Hard caps (techos duros)

Thresholds canónicos — cita esta sección en otros lugares; no restablezcas números.

- Fila blocker en auditoría de layout → Dimension 3 ≤ 6; overall ≤ 6
- Metadata score < 7 o description score < 7 → Overall ≤ 7
- Cualquier dimensión ≤ 4 → Overall ≤ 4
- Hallazgo impact blocker → Dimension afectada ≤ 6
- Hallazgo impact important → Dimension afectada ≤ 8 a menos que el gate aún pase con una inferencia documentada
- Tres o más hits fail de escritura directa → Dimension 4 ≤ 6
- Estructura > 500 líneas → Dimension 3 ≤ 7
- Sin estrategia de fallo completa → Dimension 5 ≤ 6
- Responsabilidad agrupada → Dimension 6 ≤ 6

## Approve gates

No recomendar `approve` cuando cualquiera de:

- Metadata score < 8
- Description score < 8
- DRY & assets score < 8
- Estructura score < 8
- Accionabilidad score < 8
- Responsabilidad score < 8
- Overall o dimensión mínima por debajo de banda 9 (ver [Overall skill score](#overall-skill-score))
- Cualquier hallazgo blocker
- Más de 2 hallazgos important
- Auditoría de layout tiene cualquier fila blocker
- Escritura directa tiene cualquier hit fail

Review-brief Q6 falla cuando Ready for es `approve` pero cualquier gate anterior es violado → review-brief score ≤ 6.

## Impacto de hallazgos

Usa blocker y important solo para hallazgos que afectan puntuación. Hallazgos optional no cambian dimensiones.

- **blocker**: Violación de spec, routing roto, sección requerida faltante, o maintainer no puede actuar desde el skill solo
  - ¿Afecta puntuación?: Sí — per [Hard caps](#hard-caps-techos-duros)
- **important**: Revisor debe inferir una vez, colisión con hermano probable, o riesgo de orquestación/handoff si se shipped tal cual
  - ¿Afecta puntuación?: Sí — per [Hard caps](#hard-caps-techos-duros)
- **optional**: Preferencia de wording, sinónimo, alias, o formato; routing y handoff funcionan hoy sin el cambio
  - ¿Afecta puntuación?: No — lista bajo Mejoras opcionales cuando overall ≥ 9

Una fila de checklist es partial cuando el requisito existe pero está incompleto (una inferencia). Missing cuando ausente o vacío.

## Dimensiones (1–10 cada una)

Puntúa el skill bajo revisión (no el doc de revisión). Para cada dimensión registra:

1. Quality gate — pass / partial / fail
2. Coverage — conteo de filas de checklist para esa dimensión
3. Score — desde matriz de score + evidencia de una línea citando gate result y filas

### Dimension 1 — Metadata

#### Gate de calidad

- **Spec name**: ¿Name cumple formato (minúsculas, guiones, ≤64, sin `--`, coincide con directorio)?
  - Pass: Todo cumple
  - Partial: Un elemento falla
  - Fail: Múltiples elementos fallan
- **Spec description**: ¿Description tiene WHAT + WHEN, 1–1024 chars, tercera persona?
  - Pass: Todo cumple
  - Partial: Un elemento falla
  - Fail: Múltiples elementos fallan

#### Matriz de score

- **10**: Pass; Todas las filas = pass; Cero blocker/important
- **9**: Pass; Cero missing; ≤ 1 partial; Cero blocker/important
- **8**: Pass o Partial; Cero filas fail; Cero blocker
- **7**: Partial; Múltiples partial; No blocker
- **5–6**: Fail; Cualquier fila fail; Cualquier blocker
- **1–4**: Fail; Metadata rompe spec; —

### Dimension 2 — Contrato When/How/What

#### Gate de calidad (Dimension 2)

- **When**: ¿Declara cuándo sí y cuándo no usarlo con condiciones concretas?
  - Pass: Condiciones claras positivas y negativas
  - Partial: Condiciones presentes pero ambiguas
  - Fail: Sin condiciones o solo positivas
- **How**: ¿Declara cómo ejecutar (pasos, herramientas, fallback)?
  - Pass: Pasos claros con herramientas y fallback
  - Partial: Pasos presentes pero incompletos
  - Fail: Sin cómo ejecutar
- **What**: ¿Declara qué producir (formato de salida, artefactos, criterios de éxito)?
  - Pass: Output claro con formato y criterios
  - Partial: Output presente pero vago
  - Fail: Sin qué producir

#### Matriz de score (Dimension 2)

- **10**: Pass; Todas las filas = pass; Cero blocker/important
- **9**: Pass; Cero missing; ≤ 1 partial; Cero blocker/important
- **8**: Pass o Partial; Cero filas fail; Cero blocker
- **7**: Partial; Múltiples partial; No blocker
- **5–6**: Fail; Cualquier fila fail; Cualquier blocker
- **1–4**: Fail; Contrato ausente o roto; —

### Dimension 3 — Estructura

#### Gate de calidad (Dimension 3)

- **Tipo match**: ¿El cuerpo coincide con el tipo clasificado?
  - Pass: Todos los elementos esperados presentes
  - Partial: Un elemento tipo presente pero delgado
  - Fail: Forma de tipo incorrecto o sección crítica faltante
- **Longitud**: ¿Cuerpo < 500 líneas?
  - Pass: < 500 líneas
  - Partial: 500–600 líneas
  - Fail: > 600 líneas
- **Navegabilidad**: ¿Fases/headings son skimmables?
  - Pass: Estructura clara con headings
  - Partial: Estructura presente pero confusa
  - Fail: Sin estructura clara

#### Matriz de score (Dimension 3)

- **10**: Pass; Todas las filas = pass; Cero blocker/important
- **9**: Pass; Cero missing; ≤ 1 partial; Cero blocker/important
- **8**: Pass o Partial; Cero filas fail; Cero blocker
- **7**: Partial; Múltiples partial; No blocker
- **5–6**: Fail; Cualquier fila fail; Cualquier blocker
- **1–4**: Fail; Estructura rompe tipo o es inusable; —

### Dimension 4 — Accionabilidad

#### Gate de calidad (Dimension 4)

- **Imperativo**: ¿Los pasos usan verbos imperativos?
  - Pass: Todos los pasos son imperativos
  - Partial: Algunos pasos descriptivos
  - Fail: Pasos vagos o ausentes
- **Inputs explícitos**: ¿Todos los inputs requeridos están declarados?
  - Pass: Todos los inputs declarados
  - Partial: Algunos inputs implícitos
  - Fail: Inputs críticos implícitos
- **Medible**: ¿La evidencia es medible o verificable?
  - Pass: Evidencia clara y medible
  - Partial: Evidencia presente pero subjetiva
  - Fail: Sin evidencia

#### Matriz de score (Dimension 4)

- **10**: Pass; Todas las filas = pass; Cero blocker/important
- **9**: Pass; Cero missing; ≤ 1 partial; Cero blocker/important
- **8**: Pass o Partial; Cero filas fail; Cero blocker
- **7**: Partial; Múltiples partial; No blocker
- **5–6**: Fail; Cualquier fila fail; Cualquier blocker
- **1–4**: Fail; Requiere inferencia no documentada para ejecutar; —

### Dimension 5 — Completitud

#### Gate de calidad (Dimension 5)

- **Done when**: ¿Done when permite actuar sin re-explorar fuentes?
  - Pass: Sí, handoff claro
  - Partial: Sí con un gap documentado
  - Fail: No — gaps bloquean handoff
- **Estrategia de fallo**: ¿Cubre escenarios de error con acciones concretas?
  - Pass: Todos los escenarios cubiertos
  - Partial: Algunos escenarios cubiertos
  - Fail: Sin estrategia de fallo
- **Autoevaluación**: ¿Incluye autoevaluación antes de terminar?
  - Pass: Autoevaluación completa
  - Partial: Autoevaluación parcial
  - Fail: Sin autoevaluación

#### Matriz de score (Dimension 5)

- **10**: Pass; Todas las filas = pass; Cero blocker/important
- **9**: Pass; Cero missing; ≤ 1 partial; Cero blocker/important
- **8**: Pass o Partial; Cero filas fail; Cero blocker
- **7**: Partial; Múltiples partial; No blocker
- **5–6**: Fail; Cualquier fila fail; Cualquier blocker
- **1–4**: Fail; Incompleto o handoff roto; —

### Dimension 6 — Responsabilidad

#### Gate de calidad (Dimension 6)

- **Única**: ¿El skill realiza una sola acción con un verbo clave?
  - Pass: Sí, responsabilidad única
  - Partial: Responsabilidad principal clara con funciones auxiliares mínimas
  - Fail: Múltiples acciones agrupadas
- **Sin anti-patrones**: ¿Evita fregadero de cocina, copia-y-pega, plantilla rígida?
  - Pass: Sí, sin anti-patrones
  - Partial: Un anti-patón menor
  - Fail: Múltiples anti-patrones

#### Matriz de score (Dimension 6)

- **10**: Pass; Todas las filas = pass; Cero blocker/important
- **9**: Pass; Cero missing; ≤ 1 partial; Cero blocker/important
- **8**: Pass o Partial; Cero filas fail; Cero blocker
- **7**: Partial; Múltiples partial; No blocker
- **5–6**: Fail; Cualquier fila fail; Cualquier blocker
- **1–4**: Fail; Responsabilidad agrupada o anti-patrones severos; —

## Overall skill score

Media aritmética de las seis dimensiones, un decimal (redondeo half-up). Aplica [Hard caps](#hard-caps-techos-duros) antes de mapear a banda:

- **10**: Cada dimensión = 10; sin blockers; serviría como anchor de convención de hermanos
- **9**: Dimensión mín ≥ 9; sin blockers de layout; metadata ≥ 9; description ≥ 9; estructura ≥ 9
- **8**: Dimensión mín ≥ 8; a lo sumo una dimensión = 8; sin blockers
- **7**: Dimensión mín ≥ 7; o metadata/description ≥ 8 pero routing ambiguo vs hermanos
- **5–6**: Cualquier dimensión ≤ 6; o cualquier blocker; o 2+ filas missing de checklist de cuerpo para tipo
- **1–4**: Cualquier dimensión ≤ 4; o skill contradice description; o unsafe/misleading invoke path

## Formato de hallazgos

Todo hallazgo (blocker, important u optional) usa este formato — sin excepciones. El free-form `**optional**: …` no es aceptable.

```plain text
file: <frontmatter | SKILL.md body | references/foo.md | assets/bar.md>
section/line: <sección y línea de referencia>
impact: blocker | important | optional
evidence:
  <excerpt mínimo>
finding: <vs spec, description-guide, checklist, o hermano>
fix: <cambio concreto; rewrite de description propuesto cuando relevante>
```

Orden: blocker → important → optional. Cuando overall ≥ 9, pon items opcionales bajo Mejoras opcionales (`impact: optional`); no afectan scores. Para optional, `fix:` sigue siendo una oración de reemplazo lista para pegar — no "sé más directo".

## Ready for (exactamente uno)

- **`revise-skill`**: Blockers en metadata, estructura, contrato o estrategia de fallo; fixes listados
- **`rename-skill`**: Cuerpo y routing OK pero name no representa acción principal; incluye lista de touch de grep
- **`approve`**: Overall ≥ 9 per banda; dimensión mín ≥ 9; metadata ≥ 9; description ≥ 9; estructura ≥ 9; todos [Approve gates](#approve-gates) pasan
- **`extract-shared`**: Skill OK pero contenido de referencia duplicado debería moverse a `<skills-root>/_shared/`
- **`blocked`**: Archivo faltante, ilegible, o propósito indeterminado

Ver [Approve gates](#approve-gates) — no recomendar `approve` cuando cualquier gate falle.

## Contrato de output de revisión

Escribe cada revisión en `<skills-root>/_reviews/<skill-name>-review.md`. Título: `# <skill-name> Skill Review`.

El documento de revisión es un artefacto generado por el skill y debe seguir [direct-writing-guide.md](./direct-writing-guide.md): voz activa, terminología consistente, sin emojis, párrafos ≤3 oraciones, y tablas solo cuando cada celda ≤50 chars y ≤10 filas (per [direct-writing-guide.md](./direct-writing-guide.md#uso-de-tablas)). Las auditorías con evidencia larga van como listas con **bold** + evidencia, no como tablas.

El archivo de revisión debe incluir todas las secciones siguientes. Antes de terminar, confirma que cada item de Verificación pasa — el contrato se satisface cuando un maintainer puede corregir naming, routing, paths, wording vago, y estructura desde el archivo solo sin re-explorar fuentes.

- **1**: Snapshot del skill — Path, skills root, tipo clasificado + justificación de una línea, notas de host si aplica
- **2**: Auditoría de name — Checklist de [audit-checklists.md](audit-checklists.md#auditoría-de-metadata) + name score + alineación de acción + renombre propuesto si score < 8
- **3**: Auditoría de description — Checklist + description score + routing test (≥ 2 frases trigger vs hermanos)
- **4**: Auditoría de resource layout — Checklist como lista (cada fila: **bold** + estado + evidencia) + resumen pass/fail
- **5**: Auditoría DRY & assets — Tabla de inventario (celdas cortas: archivo + rol) + checklist como lista + DRY & assets score (1–10) + candidatos extract-shared (`none` si limpio)
- **6**: Auditoría de escritura directa — Lista de hits grep (un item por hit con `file:` / `line:` / `evidence:` / `veredicto:`) + checklist como lista + rewrites listos para pegar para hits partial/fail
- **7**: Rewrite de description propuesto — Texto completo si description score < 9; sino `none`
- **8**: Anchors de convención de hermanos — ≥ 2 hermanos citados como links relativos a su `SKILL.md` (ej: `[analizar-idea](../analizar-idea/SKILL.md)`) + diferencia de convención específica (no "fases similares")
- **9**: Auditoría de cuerpo — Checklist compartido + ruta de checklist de tipo clasificado citada; cada fila sí/recomendado llenada
- **10**: Puntuación por dimensión + overall — Por dimensión: gate (pass/partial/fail), resumen de cobertura, score; overall = media con [Hard caps](#hard-caps-techos-duros) aplicados. Usa lista, no tabla, cuando la evidencia supere 50 chars por item
- **11**: Fortalezas — Específicas; vs hermanos
- **12**: Hallazgos — blocker/important cuando overall < 9; Mejoras opcionales cuando overall ≥ 9. Todo hallazgo usa [Formato de hallazgos](#formato-de-hallazgos) — sin free-form
- **13**: Score del brief de revisión — X/10 + tally Q1–Q7 y C1–C7
- **14**: Ready for — Exactamente un valor + por qué — per [Ready for](#ready-for-exactamente-uno)
- **15**: Preguntas abiertas — Solo vacíos reales

### Verificación (todos deben pasar)

- Archivo de revisión en disco; review-brief score ≥ 9 (tally Q + C documentado)
- Todas las auditorías llenadas; clasificación de tipo con justificación registrada
- Auditorías con evidencia larga usan listas, no tablas (celdas ≤50 chars per [direct-writing-guide.md](./direct-writing-guide.md#uso-de-tablas))
- Todo hallazgo usa [Formato de hallazgos](#formato-de-hallazgos) — sin free-form `**optional**: …`
- Hermanos citados como links relativos a su `SKILL.md`
- Ready for coincide con el blocker más alto, si no con el important más alto; skill bajo revisión no editado a menos que se pida
- La revisión no requiere un IDE específico para ser accionable
- Approve gates satisfechos cuando Ready for es `approve`

## Review brief rating (1–10)

Puntúa el artefacto de revisión, no el skill. Dos capas: los gates de calidad establecen el techo; los checks de completitud llenan el score. Secciones de output: [Contrato de output de revisión](#contrato-de-output-de-revisión).

### Capa A — Gates de calidad (pass / fail)

- **Q1 Routing**: Auditoría de description documenta ≥ 2 frases trigger, hermano más cercano para cada una, resultado win/lose
- **Q2 Alineación de acción**: Auditoría de name declara alineación de acción sí/no con verbo de acción principal citado
- **Q3 Evidencia de gate**: Cada score de dimensión lista el resultado del quality gate (pass/partial/fail), no solo conteos de filas
- **Q4 Delta de hermanos**: ≥ 2 hermanos citados con diferencia de convención específica (no "fases similares")
- **Q5 Trazabilidad de hallazgos**: Cada hallazgo blocker/important cita sección de spec, regla de guía, o path de hermano
- **Q6 Fit de Ready for**: Ready for coincide con blocker más alto, si no con important más alto; Approve gates pasan cuando valor es `approve`
- **Q7 Escritura directa**: Lista de hits grep presente (un item por hit con `file:` / `line:` / `evidence:` / `veredicto:`); cada hit partial/fail tiene reemplazo directo listo para pegar en hallazgos

Si Q6 falla → review-brief score ≤ 6. Si ≥ 2 de Q1–Q5 o Q7 fallan → techo 7.

### Capa B — Checks de completitud (pass / fail)

- **C1**: Checklist de auditoría de name — cada fila llenada
- **C2**: Checklist de auditoría de description — cada fila llenada
- **C3**: Checklist de resource layout — cada fila llenada
- **C4**: Checklist DRY & assets — cada fila llenada; tabla de inventario presente
- **C5**: Checklist de escritura directa — cada fila llenada
- **C6**: Checklist de cuerpo — cada fila sí/recomendado de compartido + tipo clasificado llenada
- **C7**: Seis scores de dimensión + overall con gate + evidencia de cobertura; DRY & assets score registrado

### Scoring del review brief

1. C = passes de completitud (0–7), Q = passes de calidad (0–7)
2. Raw = Q + C (0–14). Mapeo: 10 → 14; 9 → 13; 8 → 12; 7 → 11; 6 → 10; ≤ 5 → 9 o menor
3. Aplica techos de Capa A
4. Registra X/10 + items Q/C fallidos

Mejora el archivo de revisión en como máximo 2 rondas hasta que review-brief score ≥ 9.
