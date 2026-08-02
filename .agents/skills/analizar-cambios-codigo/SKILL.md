---
name: analizar-cambios-codigo
description: >-
  Orquesta el análisis completo de cambios de código ejecutando
  detectar-documentacion-faltante, predecir-impacto-cambio y
  sugerir-casos-prueba en secuencia para generar un resumen consolidado con
  hallazgos de documentación, impacto y test cases. Úsalo cuando el usuario
  pida analizar, auditar o evaluar cambios de código antes de implementar, o
  como chequeo liviano de epics (alternativa más rápida a
  validar-epic-completo). No lo uses para validar impacto real
  post-implementación — usa validar-impacto-real para eso. Para tickets ya
  implementados localmente, usa revisar-cambios-implementados que además
  valida impacto real vs. predicho.
---

# Analizador de Cambios de Código (Orquestador)

Orquestador que ejecuta análisis completo de código: documentación, impacto, test cases. Genera reporte consolidado con hallazgos.

**Workflow**:
1. `detectar-documentacion-faltante` → Qué documentación falta
2. `predecir-impacto-cambio` → Qué se afecta downstream
3. `sugerir-casos-prueba` → Qué testear para cubrir cambios
4. Consolidar hallazgos en reporte único

Solo análisis: no modifica código. Gate de calidad antes de PR.

## Fase 0 — Resolver entrada

Requerido: `PLAN-DOC` (plan de implementación) o `BRANCH` (rama local).

Infiere desde:
- Ruta: `docs/**/<TICKET-ID>-implementation-plan.md`
- Rama local: cambios uncommitted vs origin/main
- Contenido pegado: si el usuario pega el plan

Pregunta cuando falta: "¿Qué cambios analizo? (ruta del plan o rama local)"

Declara inputs resueltos: ticket, archivos modificados.

## Fase A — Ejecutar Detectar Documentación

1. Invoca `detectar-documentacion-faltante` con entrada
2. Carga resultado: `docs/<domain>/<TICKET-ID>-documentation-gaps.md`
3. Extrae:
   - Gaps críticos (bloquean)
   - Gaps mayores (warnings)
   - Gaps menores (sugerencias)

## Fase B — Ejecutar Predecir Impacto

1. Invoca `predecir-impacto-cambio` con entrada
2. Carga resultado: `docs/<domain>/<TICKET-ID>-impact-analysis.md`
3. Extrae:
   - Breaking changes
   - Riesgo (low/medium/high)
   - Servicios afectados
   - Cascade updates

## Fase C — Ejecutar Sugerir Test Cases

1. Invoca `sugerir-casos-prueba` con entrada
2. Carga resultado: `docs/<domain>/<TICKET-ID>-test-cases.md`
3. Extrae:
   - # de test cases recomendados
   - Prioridad (happy path / edge / error / etc.)
   - Cobertura esperada

## Fase D — Consolidar Hallazgos

```
### Reporte Consolidado

#### Documentación
- Gaps críticos: 2 (docstring de API pública, ADR faltante)
- Gaps mayores: 3 (ejemplos, edge cases)
- Gaps menores: 1 (comentarios mejorados)

#### Impacto
- Breaking changes: 1 (rename API endpoint)
- Riesgo: MEDIUM (requiere cascade updates)
- Servicios afectados: 3 (Web Frontend, Admin, Mobile App)
- Cascade updates: 8 horas

#### Test Cases
- Recomendados: 27 test cases
- Happy path: 4 tests (prioritario)
- Edge cases: 8 tests
- Error cases: 6 tests
- Integration: 2 tests

#### Timeline
- Dokumentación gaps: 2 horas (para resolver)
- Cascade updates: 8 horas
- Test implementation: 4 horas
- Total adicional: 14 horas
```

## Fase E — Generador Checklist de Acción

Crea checklist de qué resolver antes de merge:

```
## Checklist de Acción

### 🔴 Bloqueadores (resolver antes de merge)
- [ ] Add docstring to public API `update_user()`
- [ ] Add ADR for dual-write strategy
- [ ] Update API docs for renamed endpoint
- [ ] Implement security validation for new `bio` field

### 🟠 Mayoría (resolver antes de merge, si es posible)
- [ ] Add example to `calculate_discount()` docstring
- [ ] Document edge cases for null values
- [ ] Add comment explaining complex loop

### 🟡 Menores (puede diferirse post-merge)
- [ ] Improve variable naming in utility function
- [ ] Add trailing docstring example

### ✅ Testing (implementar paralelamente)
- [ ] Happy path tests (4 tests)
- [ ] Edge case tests (8 tests)
- [ ] Error case tests (6 tests)
- [ ] Integration tests (2 tests)
- [ ] Total: 20 test cases

### ✅ Cascade Updates (coordinado con otras equipos)
- [ ] Web Frontend: Update field names (2h)
- [ ] Mobile App: Update API contract (4h, new version)
- [ ] Admin Dashboard: New admin panels (8h)
- [ ] Documentation: Update API docs (2h)

### Timeline
- Can merge after: Bloqueadores + Testing
- Can deploy after: Bloqueadores + Testing + Cascade updates (coordinated)
```

## Fase F — Escribir Reporte Consolidado

Estructura:

1. **Resumen ejecutivo**: # gaps, riesgo, # servicios afectados, timeline
2. **Hallazgos de documentación**: Críticos / Mayores / Menores
3. **Hallazgos de impacto**: Breaking changes, riesgo, servicios, cascade updates
4. **Hallazgos de testing**: # de tests, prioridades
5. **Checklist de acción**: Bloqueadores / Mayores / Menores / Testing / Cascade
6. **Timeline consolidado**: Cuándo está completamente listo
7. **Recomendaciones**: Qué hacer primero
8. **Ready for**: `ready-for-pr`, `needs-fixes`, `high-risk`

## Salida

Escribe en: `docs/<domain>/<TICKET-ID>-code-analysis-summary.md`

**Secciones requeridas**:
- Resumen ejecutivo consolidado
- Hallazgos de documentación
- Hallazgos de impacto
- Hallazgos de testing
- Checklist de acción (bloqueadores/mayores/menores/testing/cascade)
- Timeline consolidado
- Recomendaciones
- Ready for (`ready-for-pr`, `needs-fixes`, `high-risk`, `blocked`)

Ready for valores:
- `ready-for-pr`: Bloqueadores resueltos, testing en paralelo, listo para crear PR
- `needs-fixes`: Hallazgos críticos sin resolver, no crear PR aún
- `high-risk`: Riesgo alto, requiere extra review/testing
- `blocked`: Breaking changes no mitigables, reconsiderar arquitectura
