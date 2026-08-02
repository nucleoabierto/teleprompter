---
name: revisar-cambio-minimo
description: >-
  Revisión rápida de cambios mínimos (1 punto Fibonacci: 0-3 horas) con
  checklist simplificado. Valida: funcionalidad, tests, documentación básica,
  sin breaking changes. Salida: OK para merge o recomendaciones. Úsalo después
  de validar-tarea-trivial para fast-track approvals (5-10 min vs 30-60 min).
---

# Quick Review para Cambios Mínimos (1 Punto Fibonacci)

Revisión rápida (5-10 minutos) de cambios mínimos (1 punto: 0-3 horas). Checklist simplificado vs revisión completa.

Solo análisis: valida cambio es trivial-safe, no comprehensive review.

## Mapeo a Escala Fibonacci

Este skill asume que el cambio ya fue validado como **1 punto Fibonacci (0-3 horas)** por `validar-tarea-trivial`.

**Lógica de mapeo**:
- `validar-tarea-trivial` aplica criterios objetivos (<5 archivos, <50 líneas, mismo dominio, sin migraciones, sin dependencias, tests incluidos)
- Si todos los criterios pasan → el cambio es predecible, localizado y bajo riesgo → 1 punto Fibonacci
- Este skill ejecuta un checklist rápido (5-10 min) para validar que la implementación cumple con los criterios de calidad básicos para cambios de 1 punto

**Referencia**: Ver `_shared/estimation-reference.md` para la tabla completa de puntos Fibonacci (1 = 0-3h, 2 = 3-6h, 3 = 6-12h, etc.)

## Fase 0 — Resolver entrada

Requerido: `TICKET-ID` o `PR-NUMBER`.

Infiere desde:
- Ticket ID: busca plan `docs/**/<TICKET-ID>-implementation-plan.md`
- PR number: busca diff en rama local
- Contenido pegado: si usuario pega plan

Pregunta cuando falta: "¿Qué revisiono? (ticket ID o PR number)"

Declara inputs resueltos: ticket, cambios.

**PRECONDICIÓN**: Este skill asume que `validar-tarea-trivial` ya pasó con OK.

## Fase A — Validar Que Es Realmente Trivial

```
### Pre-flight Check

- ¿Ya validado como trivial? 
  - Sí: Proceder
  - No: Ejecutar validar-tarea-trivial primero

Si cambio creció (más líneas/archivos de lo planeado):
- Recalcular: ¿Sigue siendo trivial?
- Si NO: Cambiar a full pipeline review
```

## Fase B — Checklist Rápido (Trivial)

### ✅ Funcionalidad (2 minutos)

```python
def test_quick_review_functionality():
    """Trivial changes (1 punto): validate core logic works."""
    
    # 1. ¿El cambio hace lo que promete?
    # Lee el plan de implementación
    # Mira 3-5 puntos de cambio key
    # ¿Lógica correcta? 
    assert implementation_matches_plan
    
    # 2. ¿No hay lógica obviamente rota?
    # Quick scan para obvious bugs
    # Off-by-one errors
    # Null pointer exceptions
    # Infinite loops
    assert no_obvious_bugs
    
    # 3. ¿Tests verdes?
    # Run: pytest (solo archivos tocados)
    assert all_tests_pass
```

### ✅ Testing (2 minutos)

```
## Testing Checklist (Trivial)

- [ ] At least 1 new test added (for coverage)
- [ ] Existing tests still pass
- [ ] No test code duplicated unnecessarily
- [ ] Test name is descriptive (not test_foo())

**Skip for Trivial**:
- ❌ Edge case analysis (covered by full review later)
- ❌ Performance benchmarking
- ❌ Integration test matrix
- ❌ Security penetration testing
```

### ✅ Documentación Básica (1 minuto)

```
## Documentation Checklist (Trivial)

- [ ] Docstring added if new public function
  - Only required: description + example
  - Can skip: detailed Args/Returns/Raises for simple functions

- [ ] Comments where logic is non-obvious
  - If <10 lines and straightforward: skip comments
  - If logic has trick: add comment
  - Comentarios autocontenidos: sin referencias efímeras a tickets, ADRs, PRDs, epics o TRDs — el comentario debe explicar el porqué por sí mismo

- [ ] No obvious TODO/FIXME markers
  - If marked: acceptable for trivial

- [ ] API changes documented (if any)
  - If renamed method: at least 1-liner comment
  - If new API: doc minimal requirement
```

### ✅ No Breaking Changes (2 minutos)

```
## Breaking Changes Checklist (Trivial)

- [ ] No removed endpoints / methods
- [ ] No renamed fields that break schema
- [ ] No type changes that cause 422 errors
- [ ] No required field added without default
- [ ] No behavior changes in stable APIs

**If detected**: Change is NOT trivial, escalate to full review
```

### ✅ Security Basic (1 minuto)

```
## Security Checklist (Trivial)

- [ ] No hardcoded secrets (passwords, API keys)
- [ ] No obvious SQL injection (if DB query)
- [ ] No obvious XSS (if rendering HTML)
- [ ] No auth bypass (if touching auth)

**If detected**: Stop, security review required
```

## Fase C — Ir/No-Ir

```
### Decision Matrix

| Check | Pass? | Acción |
|---|---|---|
| Funcionalidad | ✅ | Continuar |
| Tests verdes | ✅ | Continuar |
| Documentación básica | ✅ | Continuar |
| No breaking changes | ✅ | Continuar |
| Security básico | ✅ | ✅ APPROVE |

Si CUALQUIER check falla:
- ❌ → Flag issue y rechazar merge (no auto-approve)
```

## Fase D — Generar Veredicto Rápido

```
### Quick Review Veredicto

**Opción 1: ✅ APPROVE FOR MERGE (5 min review)**
- Todos los checks pass
- Cambio es seguro (1 punto: 0-3 horas)
- Proceder con merge inmediato

**Opción 2: 🟠 REQUEST MINOR CHANGES (3 checks pass, 1 needs fix)**
- Ej: Agregar 1 test, docstring mínimo
- Dev puede fix en <30 min
- Después: re-review (2 min) + approve

**Opción 3: ❌ ESCALATE TO FULL REVIEW (1+ checks fail)**
- Funcionalidad unclear
- Breaking changes detectados
- Security concerns
- Cambio creció de scope
- Use full `revisar-pr` pipeline
```

## Fase E — Escribir Resultado Rápido

Estructura (muy breve):

1. **Veredicto**: ✅ Approve / 🟠 Minor Changes / ❌ Escalate
2. **Checklist results**: Tabla rápida de pass/fail
3. **Issues detectados**: Si hay
4. **Recomendaciones**: Si hay
5. **Ready for**: `merge` o `needs-fixes` o `full-review`

## Salida

Output: Chat directo o file `docs/<domain>/<TICKET-ID>-quick-review.md` (opcional)

**Secciones requeridas**:
- Veredicto (Approve / Minor changes / Escalate)
- Quick checklist results
- Issues si hay
- Recomendaciones si hay
- Ready for (`merge`, `needs-minor-fixes`, `full-review`)

Ready for valores:
- `merge`: ✅ Approve, safe to merge
- `needs-minor-fixes`: 🟠 Request small fixes, then re-review (2 min) and merge
- `full-review`: ❌ Escalate to complete `revisar-pr`, not trivial anymore
- `blocked`: ❌ Stop, security or major issue detected

## Timing Expectations

```
### Trivial Review Timeline

**vs Full Review**:
- Quick review (trivial): 5-10 minutos
- Full review: 30-60 minutos
- Savings: 20-50 minutos por PR

**Cadence**:
- Fast-track: code → tests → quick-review → merge (0-3 horas total, 1 punto Fibonacci)
- Full pipeline: code → tests → full-review → improvements → merge (3-7 días)

**Cuando usar cada una**:
- Quick review: Después de validar-tarea-trivial passa
- Full review: Todos los demás casos (cambios grandes, risky, new features)
```

## Ejemplos

### Ejemplo 1: Approved for Merge (Trivial)

```markdown
## Quick Review: APPROVED ✅

**Change**: Fix typo en error message
**Scope**: 1 file, 1 line changed
**Time**: 3 min review

### Checklist
- ✅ Funcionalidad: Typo fix is correct
- ✅ Tests: No test change needed (comment only)
- ✅ Docs: No docs change needed
- ✅ Breaking: No breaking change
- ✅ Security: N/A (comment)

→ **MERGE APPROVED**
```

### Ejemplo 2: Minor Changes Needed

```markdown
## Quick Review: MINOR CHANGES NEEDED 🟠

**Change**: Add discount calculation method
**Scope**: 1 file, 42 lines added
**Time**: 4 min review

### Checklist
- ✅ Funcionalidad: Logic correct
- ✅ Tests: 2 tests added, all pass
- 🟠 Docs: Missing docstring on public method
- ✅ Breaking: No breaking change
- ✅ Security: N/A

### Requested Changes
1. Add docstring to `calculate_discount()` (2-line minimum)
   ```python
   def calculate_discount(price: float, tier: str) -> float:
       """Calculate price with tier-based discount."""
   ```

→ **Request 1 minor fix, then re-review (2 min) + merge**
```

### Ejemplo 3: Escalate to Full Review

```markdown
## Quick Review: ESCALATE ❌

**Change**: Refactor user authentication
**Scope**: 5 files, 180 lines changed
**Time**: 5 min review

### Checklist
- ⚠️ Funcionalidad: Complex changes, hard to validate quickly
- ✅ Tests: 8 tests added, all pass
- 🔴 Docs: Missing ADR for auth strategy change
- 🔴 Breaking: Potential breaking change to login endpoint
- ✅ Security: Looks OK, but needs expert review

### Issues
1. This change exceeds 1 punto Fibonacci (5 files, 180 lines)
2. Breaking changes to public API detected
3. Auth changes need architecture review
4. ADR required

→ **NOT trivial (1 punto), use full revisar-pr pipeline**
```
