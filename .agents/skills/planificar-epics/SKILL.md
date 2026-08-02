---
name: planificar-epics
description: >-
  Lee un PRD y genera una estructura de epics con dependencias, criterios de
  aceptación y secuencia de implementación. Salida:
  docs/<domain>/initiatives/<PRD-SLUG>/epics/epic-plan.md. Úsalo cuando el
  usuario pida planificar, diseñar, estructurar o descomponer iniciativas
  grandes en epics. No lo usas para dividir epics en tareas atómicas (usar
  dividir-epic) ni para validar viabilidad técnica específica (usar
  validar-viabilidad-tecnica).
---

# Planificador desde PRD

Lee un PRD y estructura epics con criterios de aceptación, dependencias y secuencia de implementación recomendada. Salida: documento de plan de epics listo para atomic task breakdown.

Solo análisis: no crea tickets en tu herramienta de gestión, no implementa. Úsalo al inicio de iniciativas grandes para mapear trabajo.

## Fase 0 — Resolver entrada

Requerido: `PRD-SOURCE`. Infierelo desde:
- Ruta local: `docs/**/*prd*.md`, `docs/**/iniciativa*.md`
- Contenido pegado: si el usuario pega el PRD completo en chat
- URL: si la documentación está en tu herramienta de documentación de referencia

Pregunta cuando falta: "¿Dónde está el PRD? (ruta local, URL, o pega el contenido)"

Declara inputs resueltos antes de proceder.

## Fase A — Validar PRD

Verifica que el PRD contenga:
- ✅ Objetivo de negocio claro
- ✅ Usuario/persona objetivo
- ✅ Criterios de éxito (métricas, KPIs)
- ✅ Restricciones conocidas (tiempo, recursos, tech debt)
- ✅ Alcance explícito (qué SÍ, qué NO)
- ✅ `Ready for: planificar-epics` (indica que el PRD está validado y listo para planificación de epics)

Si el PRD no tiene `Ready for: planificar-epics`, sugiere ejecutar `orquestar-prd-workflow` primero para generar un PRD validado.

Si faltan elementos críticos: detente y lista brechas en Preguntas abiertas. No continúes sin objetivo claro.

### Consumo del veredicto condicional (D4)

Lee `docs/<domain>/initiatives/<PRD-SLUG>/product-viability.md` si existe. Si el veredicto fue **Conditional Go**:

- Surfacar las condiciones heredadas (referenciadas en `product-viability.md` §7) como **riesgos/open questions** en el epic plan.
- Mapear cada condición a un **epic-level risk o prerequisite**. Ej: "Condición: 5+ user interviews valida A1/A2" → "Riesgo del Epic de distribución: si las interviews revelan que A1/A2 fallan, el epic de distribución se pausa."
- Las condiciones técnicas (ej: "spike de handoff antes de comprometer la mecánica") se mapean como prerequisitos del epic correspondiente.
- Las condiciones de demanda (ej: "5+ user interviews antes de Fase 5") se mapean como riesgos del epic de distribución/lanzamiento.

Esto asegura que el epic plan no ignore los riesgos residuales que el WF1 ya identificó.

## Fase B — Analizar Codebase para Viabilidad

**Paso 0 (nuevo) — Consumir artefacto de conectividad de WF1**: lee `docs/<domain>/initiatives/<PRD-SLUG>/connectivity/prerequisites-assessment.md` si existe (generado por `evaluar-conectividad-tecnica` en el Workflow 1). Esto evita rehacer el análisis de codebase que WF1 ya hizo.

- Si el assessment dice **greenfield** → skip del grep por arquitecturas existentes; usar el assessment como input directo. Los pasos 1-3 de abajo se skipan (no hay arquitecturas existentes que greppear). Solo anota los componentes a crear (paso 4) usando el assessment.
- Si el assessment dice **conectado** o **desconectado** → usar el assessment como punto de partida. Complementar con grep específico del epic (no rehacer el escaneo completo de auth/DB/APIs/servicios/frontend/monitoring — el assessment ya lo tiene). Solo grep por features similares al epic específico (paso 3).
- Si el assessment **no existe** (PRD legacy sin WF1) → ejecuta los pasos 1-4 completos como antes.

1. Identifica 2-3 arquitecturas existentes que el PRD tocará (búsqueda `grep` por dominio/feature) — **skip si greenfield**
2. Detecta **deuda técnica conocida** que bloquee features (ej. legacy auth, monolith refactor pending) — **skip si greenfield**
3. Busca **precedentes**: features similares ya implementadas — **skip si greenfield**
4. Anota **riesgos técnicos**: si el PRD requiere componentes no existentes, lista construcciones nuevas necesarias (usa el assessment de conectividad como input)

## Fase C — Estructurar Epics

Agrupa requerimientos en **1-7 epics** siguiendo el template en `references/epic-structure-template.md`.

**Número de epics según tipo de PRD**:
- PRD de **funcionalidad única** con fases internas lineales → **1-3 epics** alineados a boundaries de value-delivery naturales (no 1 epic por fase interna). Criterio de split: agrupar fases que juntas entregan valor verificable. Ej: Fases 1-3 (instalador funcional) = Epic 1; Fase 4 (handoff) = Epic 2; Fases 5-6 (distribución + dogfooding) = Epic 3.
- PRD con **múltiples funcionalidades** → 3-7 epics (regla original).

**Reglas de épic:**
- Cada epic debe entregar **valor verificable** (testeable, demostrable). La **independencia de deploy es deseable pero no obligatoria** para features inherentemente secuenciales.
- Si dos epics tienen dependencia fuerte → combínalos o añade "sequential" en orden sugerido.
- Si los epics tienen **dependencia lineal fuerte** (feature inherentemente secuencial), documentar el orden y marcar `sequential` en la matriz de epics. No fuerces independencia artificial.
- Máximo 3-4 semanas por epic (si > L, sugiere dividir).

## Fase D — Mapear Dependencias

Crea una tabla de dependencias siguiendo el template en `references/dependency-table-template.md`.

Detecta **ciclos** (A → B → A): si existen, reestructura o explícita "reconciliation point".

## Fase E — Escribir Plan de Epics

Estructura del documento:

1. **Resumen ejecutivo**: objetivo PRD + # epics + timeline grueso
2. **Matriz de epics**: tabla con todos los epics, AC, deps, riesgos, orden
3. **Secuencia recomendada**: "implementa en orden [1, 2, 3…] o paralelo [A||B, luego C]"
4. **Riesgos y mitigaciones**: deuda técnica conocida, construcciones nuevas, integraciones
5. **Preguntas abiertas**: elementos del PRD no clarificados
6. **Ready for siguiente paso**: `divide-epics` (crear estructura de tareas atómicas) o `blocked` si se necesita validación de PRD primero

## Salida

Escribe en: `docs/<domain>/initiatives/<PRD-SLUG>/epics/epic-plan.md`

**Secciones requeridas**:
- Resumen del PRD leído
- Matriz de epics (tabla)
- Secuencia recomendada con justificación
- Riesgos técnicos identificados
- Preguntas abiertas
- Ready for (`divide-epics` o `blocked`)

Ready for valores:
- `dividir-epic`: Epics está clara, proceder a desglose de tareas atómicas
- `blocked`: Faltan clarificaciones en PRD antes de proceder
- `refine-prd`: PRD necesita refinamiento antes de planificar

## Autoevaluación

Antes de finalizar, verifica:

- [ ] **Inputs completos**: PRD identificado y leído completamente
- [ ] **Validación PRD**: Objetivo, usuario, criterios de éxito, restricciones y alcance están claros
- [ ] **Conditional Go consumido**: si el PRD tiene Conditional Go, las condiciones heredadas se mapearon a riesgos/prerequisitos por epic
- [ ] **Análisis codebase**: Arquitecturas identificadas, deuda técnica detectada, precedentes encontrados (o skip justificado si greenfield — consumió `prerequisites-assessment.md` de WF1)
- [ ] **Epics bien estructurados**: 1-7 epics (1-3 para funcionalidad única, 3-7 para múltiples), cada uno con objetivo, AC, dependencias, riesgos, estimación
- [ ] **Epics con valor verificable**: Cada epic entrega valor testeable/demostrable (independencia de deploy deseable pero no obligatoria para features secuenciales)
- [ ] **Tamaño de epics**: Ningún epic > 4 semanas (L/XL), si los hay, sugiere división
- [ ] **Dependencias mapeadas**: Tabla completa sin ciclos (o con reconciliation points explícitos); dependencias lineales marcadas `sequential`
- [ ] **Secuencia lógica**: Orden recomendado tiene justificación clara
- [ ] **Riesgos documentados**: Riesgos técnicos identificados con mitigaciones
- [ ] **Preguntas abiertas**: Brechas del PRD listadas si existen
- [ ] **Ready for correcto**: Valor apropiado según estado del PRD y epics
- [ ] **Archivo creado**: `docs/<domain>/initiatives/<PRD-SLUG>/epics/epic-plan.md` con todas las secciones requeridas
