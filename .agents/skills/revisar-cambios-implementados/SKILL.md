---
name: revisar-cambios-implementados
description: >-
  Orquestador que ejecuta análisis post-implementación de cambios de código:
  detecta documentación faltante, valida impacto real vs predicho, valida test
  cases implementados. Ejecuta detectar-documentacion-faltante →
  validar-impacto-real → validar-casos-prueba-implementados en secuencia y
  genera resumen consolidado. Úsalo después de revisar-cambios-locales como
  gate de calidad final antes de crear PR.
---

# Revisor de Cambios Implementados (Orquestador)

Orquestador que ejecuta análisis completo de código post-implementación: documentación, validación de impacto real, validación de test cases. Genera reporte consolidado con hallazgos.

**Workflow**:
1. `detectar-documentacion-faltante` → Qué documentación falta en el código implementado
2. `validar-impacto-real` → Validar que el impacto real coincide con el predicho
3. `validar-casos-prueba-implementados` → Validar que los tests sugeridos se implementaron
4. Consolidar hallazgos en reporte único

Solo análisis: no modifica código. Gate de calidad final antes de PR.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [phase0-plan-branch-input.md](references/phase0-plan-branch-input.md) ↗️ | Resolución de entrada (symlink a _shared/) |
| [git-commands.md](../_shared/git-commands.md) ↗️ | Comandos git estándar para análisis de cambios |
| [orchestrator-pattern.md](../_shared/orchestrator-pattern.md) ↗️ | Template canónico para orquestadores |
| [action-checklist-template.md](assets/action-checklist-template.md) | Template de checklist de acción |
| [consolidated-report-template.md](assets/consolidated-report-template.md) | Template de reporte consolidado |

## Fase 0 — Resolver entrada

Ver [phase0-plan-branch-input.md](references/phase0-plan-branch-input.md) para el patrón de resolución de entrada.

## Fase A — Ejecutar Detectar Documentación

1. Invoca `detectar-documentacion-faltante` con entrada
2. Carga resultado: `docs/<domain>/<TICKET-ID>-documentation-gaps.md`
3. Extrae:
   - Gaps críticos (bloquean)
   - Gaps mayores (warnings)
   - Gaps menores (sugerencias)

## Fase B — Ejecutar Validar Impacto Real

1. Invoca `validar-impacto-real` con entrada
2. Carga resultado: `docs/<domain>/<TICKET-ID>-impact-validation.md`
3. Extrae:
   - Estado de validación (passed/partial/failed)
   - Breaking changes mitigados vs no mitigados
   - Servicios downstream notificados vs pendientes
   - Efectos secundarios no anticipados

## Fase C — Ejecutar Validar Test Cases Implementados

1. Invoca `validar-casos-prueba-implementados` con entrada
2. Carga resultado: `docs/<domain>/<TICKET-ID>-test-coverage-validation.md`
3. Extrae:
   - % de test cases sugeridos implementados
   - Gaps de cobertura por tipo (happy/edge/error/boundary)
   - Tests críticos faltantes
   - Recomendaciones de prioridad

## Fase D — Consolidar Hallazgos

```
### Reporte Consolidado Post-Implementación

#### Documentación
- Gaps críticos: 2 (docstring de API pública, ADR faltante)
- Gaps mayores: 3 (ejemplos, edge cases)
- Gaps menores: 1 (comentarios mejorados)

#### Validación de Impacto
- Estado: PARTIAL (breaking changes mitigados, servicios pendientes)
- Breaking changes predichos: 3 → Mitigados: 2, No mitigados: 1
- Servicios downstream afectados: 3 → Notificados: 2, Pendientes: 1
- Efectos secundarios no anticipados: 1 (cambio de timing en async job)

#### Test Coverage
- Test cases sugeridos: 27 → Implementados: 18 (67%)
- Happy path: 4/4 (100%) ✅
- Edge cases: 5/8 (63%) ⚠️
- Error cases: 4/6 (67%) ⚠️
- Boundary cases: 3/5 (60%) ⚠️
- Integration: 2/2 (100%) ✅
- Tests críticos faltantes: 3 (edge cases de boundary values)
```

## Fase E — Generar Checklist de Acción

Crea checklist de qué resolver antes de merge usando el template [action-checklist-template.md](assets/action-checklist-template.md).

Ejemplo de estructura:

```
## Checklist de Acción Post-Implementación

### 🔴 Bloqueadores (resolver antes de merge)
- [ ] Add docstring to public API `update_user()`
- [ ] Add ADR for dual-write strategy
- [ ] Mitigate breaking change: rename API endpoint (add backward compat)
- [ ] Notify Mobile App team of API contract change

### 🟠 Mayoría (resolver antes de merge, si es posible)
- [ ] Add example to `calculate_discount()` docstring
- [ ] Document edge cases for null values
- [ ] Add comment explaining complex loop
- [ ] Implement missing edge case tests (3 tests)

### 🟡 Menores (puede diferirse post-merge)
- [ ] Improve variable naming in utility function
- [ ] Add trailing docstring example
- [ ] Implement remaining boundary tests (2 tests)

### ✅ Testing (implementar paralelamente)
- [ ] Happy path tests: 4/4 ✅
- [ ] Edge case tests: 5/8 ⚠️ (faltan 3)
- [ ] Error case tests: 4/6 ⚠️ (faltan 2)
- [ ] Boundary tests: 3/5 ⚠️ (faltan 2)
- [ ] Integration tests: 2/2 ✅

### ✅ Cascade Updates (coordinado con otras equipos)
- [ ] Web Frontend: Notificado ✅
- [ ] Mobile App: Pendiente de notificación
- [ ] Admin Dashboard: Notificado ✅
- [ ] Documentation: Actualizada ✅

### Timeline
- Can merge after: Bloqueadores + Tests críticos
- Can deploy after: Bloqueadores + Tests críticos + Cascade updates (coordinated)
```

## Fase F — Escribir Reporte Consolidado

Usa el template [consolidated-report-template.md](assets/consolidated-report-template.md) como estructura base.

Estructura:

1. **Resumen ejecutivo**: # gaps, estado de validación de impacto, % test coverage, timeline
2. **Hallazgos de documentación**: Críticos / Mayores / Menores
3. **Hallazgos de validación de impacto**: Estado, breaking changes mitigados, servicios notificados, efectos no anticipados
4. **Hallazgos de test coverage**: % implementado, gaps por tipo, tests críticos faltantes
5. **Checklist de acción**: Bloqueadores / Mayores / Menores / Testing / Cascade
6. **Timeline consolidado**: Cuándo está completamente listo
7. **Recomendaciones**: Qué hacer primero
8. **Ready for**: `ready-for-pr`, `needs-fixes`, `high-risk`

## Salida

Escribe en: `docs/<domain>/<TICKET-ID>-code-analysis-summary.md`

**Secciones requeridas**:
- Resumen ejecutivo consolidado
- Hallazgos de documentación
- Hallazgos de validación de impacto
- Hallazgos de test coverage
- Checklist de acción (bloqueadores/mayores/menores/testing/cascade)
- Timeline consolidado
- Recomendaciones
- Ready for (`ready-for-pr`, `needs-fixes`, `high-risk`, `blocked`)

Ready for valores:
- `ready-for-pr`: Bloqueadores resueltos, impacto validado, tests críticos implementados, listo para crear PR
- `needs-fixes`: Hallazgos críticos sin resolver, no crear PR aún
- `high-risk`: Impacto no validado o efectos secundarios no anticipados, requiere extra review/testing
- `blocked`: Breaking changes no mitigados, reconsiderar arquitectura
