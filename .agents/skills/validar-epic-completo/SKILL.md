---
name: validar-epic-completo
description: >-
  Orquesta validación completa de epic ejecutando validar-viabilidad-tecnica,
  generar-arquitectura, generar-estrategia-testing y sugerir-casos-prueba en
  secuencia. Salida: docs/<domain>/<EPIC-SLUG>-complete-validation.md con
  resumen de readiness. Úsalo cuando el usuario pida validar, auditar o
  revisar un epic completamente antes de crear tickets. No lo usas para
  ejecutar validaciones individuales (invocar skills directamente).
---

# Validador de Epic Completo (Orquestador)

Orquestador que valida epic completo: viabilidad técnica, arquitectura, estrategia de testing, casos de prueba. Ejecuta en secuencia y genera reporte de readiness.

**Workflow**:
1. `validar-viabilidad-tecnica` → ¿Es viable técnicamente?
2. `generar-arquitectura` → Diagramas y diseño
3. `generar-estrategia-testing` (ZOMBIE methodology) → Estrategia de testing
4. `sugerir-casos-prueba` → Casos concretos
5. Consolidar en reporte único de readiness

> **Nota sobre ZOMBIE**: ZOMBIE es una metodología de testing para definir estrategia de cobertura. La documentación completa estará disponible en `_shared/zombie-methodology.md` cuando se cree.

Solo análisis: no implementa. Gate de validación antes de crear tickets.

## Fase 0 — Resolver entrada

Requerido: `EPIC-PLAN-RUTA`.

Infiere desde:
- Ruta: `docs/**/<EPIC-SLUG>-epic-plan.md`
- Contenido pegado: si el usuario pega el plan
- Epic plan previo: busca el archivo más reciente

Pregunta cuando falta: "¿Qué epic valido? (ruta del plan)"

Declara inputs resueltos: epic, plan de épics.

## Fase A — Ejecutar Validar Viabilidad Técnica

1. Invoca `validar-viabilidad-tecnica` con el plan
2. Carga resultado: `docs/<domain>/<EPIC-SLUG>-viability-assessment.md`
3. Evalúa:
   - ¿Construcciones nuevas requeridas?
   - ¿Deuda técnica bloqueante?
   - ¿Timeline ajustado por bloqueadores?
4. **Gate**: Si `blocked` → detente, escala

## Fase B — Ejecutar Generar Arquitectura

1. Invoca `generar-arquitectura` con el plan + viabilidad
2. Carga resultado: `docs/<domain>/<EPIC-SLUG>-architecture.md`
3. Valida:
   - ¿Componentes claros?
   - ¿Integraciones documentadas?
   - ¿Escalabilidad considerada?
4. **Gate**: Si `architecture-review` requerido → schedule review

## Fase C — Ejecutar Generar Test Strategy (ZOMBIE methodology)

1. Invoca `generar-estrategia-testing` con arquitectura
2. Carga resultado: `docs/<domain>/<EPIC-SLUG>-test-strategy.md`
3. Extrae:
   - Matriz de criticidad de componentes
   - ZOMBIE strategy para cada componente (ver `_shared/zombie-methodology.md` cuando se cree)
   - Coverage goals (unit/integration/E2E)

## Fase D — Ejecutar Sugerir Test Cases

1. Invoca `sugerir-casos-prueba` con test strategy
2. Carga resultado: `docs/<domain>/<EPIC-SLUG>-test-cases.md`
3. Cuenta:
   - # de test cases sugeridos
   - Cobertura esperada
   - Prioridades

## Fase E — Gate Final de Validación

Antes de consolidar el reporte, pregunta al humano: **¿Go/No-Go para aprobar este epic?**

- Si **No-Go**: Detén el workflow, marca el epic como "Rejected" en el plan de acción y sugiere revisar arquitectura, viabilidad o requisitos antes de continuar.
- Si **Go**: Procede a Fase F para consolidar el reporte.

Este gate asegura que el humano aprueba la validación completa antes de proceder a crear tickets.

## Fase F — Consolidar Readiness Report

```
### Epic Validation Summary

#### Viabilidad Técnica
✅ Viable
- Construcciones nuevas: 2 (Auth service, Payment gateway)
- Deuda técnica bloqueante: 0
- Timeline original: 4 semanas → Ajustado: 5 semanas (+1 infraestructura)

#### Arquitectura
✅ Completa
- Componentes: 5 (API Gateway, Auth, User, Payment, Notifications)
- Integraciones externas: 2 (Stripe, SendGrid)
- Escalabilidad considerada: Database partitioning, caching strategy

#### Testing Strategy (ZOMBIE methodology)
✅ Definida
- Componentes críticos: 3 (Auth, Payment, User)
- Unit test goals: 85%+
- Integration test goals: 75%+
- E2E test goals: 50%+ (critical paths)

#### Test Cases
✅ Sugeridos
- Total: 45 test cases
- Happy path: 6 tests
- Edge cases: 15 tests
- Error cases: 12 tests
- Integration: 6 tests
- Security: 6 tests

#### Readiness Gate
✅ READY FOR TICKETS
- All phases complete
- No blockers detected
- Architecture reviewed and approved
- Testing strategy clear
- Timeline: 5 weeks (coordinated with infrastructure setup)
```

## Fase G — Matriz de Decisión

```
### Decision Matrix: Proceder o No

| Criterio | Status | Acción |
|---|---|---|
| Viabilidad técnica | ✅ Viable | Proceder |
| Bloqueadores detectados | ❌ Ninguno | Proceder |
| Arquitectura clara | ✅ Sí | Proceder |
| Testing strategy | ✅ ZOMBIE methodology completo | Proceder |
| Risk level | 🟠 Medio | Proceder + extra monitoring |
| Timeline viable | ✅ Sí | Proceder |
| Recursos disponibles | ⚠️ Parcial | Verificar staff plan |
| Dependencias externas | ✅ OK | Proceder |

**Veredicto**: ✅ READY FOR EPIC BREAKDOWN → create tickets
```

## Fase H — Generar Plan de Acción (Próximos Pasos)

```
## Próximos Pasos

### Inmediato (esta semana)
1. ✅ Architecture review by tech lead
2. ✅ Infraestructura setup (RabbitMQ, Redis, feature flag service)
3. ✅ Setup test environment (test DB, fixtures)

### Semana siguiente
4. [ ] Ejecutar `dividir-epic` para cada uno de los épics identificados
5. [ ] Crear tickets en tu herramienta de gestión (via `crear-ticket`)
6. [ ] Asignar task a dev team

### Durante implementación
7. [ ] Implementar siguiendo architecture + test strategy
8. [ ] Implementar test cases según matriz
9. [ ] Architecture reviews en PRs

### Post-implementación
10. [ ] Actualizar domain-map via `actualizar-mapeo-contextos`
11. [ ] Retrospectiva y lecciones aprendidas
```

## Fase I — Escribir Reporte de Validación Completo

Estructura:

1. **Resumen ejecutivo**: Viable? Readiness? Timeline?
2. **Validación de viabilidad**: Bloqueadores, timeline ajustado
3. **Validación de arquitectura**: Componentes, integraciones
4. **Validación de testing**: ZOMBIE methodology strategy, coverage goals
5. **Test cases sugeridos**: # y prioritarios
6. **Matriz de readiness**: Todos los criterios
7. **Plan de acción**: Próximos pasos
8. **Riesgos residuales**: Qué monitorear
9. **Recomendaciones**: Cómo proceder
10. **Ready for**: `create-tickets` o `blocked`

## Autoevaluación

Antes de generar el reporte final, verifica que todos los pasos se completaron:

- [ ] Epic plan leído completamente
- [ ] Validar-viabilidad-tecnica ejecutado y resultado cargado
- [ ] Generar-arquitectura ejecutado y resultado cargado
- [ ] Generar-estrategia-testing ejecutado y resultado cargado
- [ ] Sugerir-casos-prueba ejecutado y resultado cargado
- [ ] Gate final de validación ejecutado (pregunta Go/No-Go al humano)
- [ ] Matriz de decisión completada con veredicto
- [ ] Plan de acción generado con próximos pasos
- [ ] Riesgos residuales identificados

Si algún item no está completado, vuelve a la fase correspondiente antes de continuar.

## Salida

Escribe en: `docs/<domain>/<EPIC-SLUG>-complete-validation.md`

**Secciones requeridas**:
- Resumen ejecutivo de readiness
- Hallazgos de viabilidad técnica
- Hallazgos de arquitectura
- Hallazgos de testing (ZOMBIE methodology)
- Hallazgos de test cases
- Matriz de decisión (proceder/no proceder)
- Plan de acción (próximos pasos)
- Riesgos residuales
- Recomendaciones finales
- Ready for (`create-tickets`, `blocked`, `architecture-review`, `high-risk`)

Ready for valores:
- `create-tickets`: Epic completamente validado, listo para crear tickets
- `blocked`: Bloqueadores críticos detectados, resolver antes de continuar
- `architecture-review`: Requiere revisión de arquitecto antes de proceder
- `high-risk`: Viable pero riesgo alto, proceder con extra caution
- `spike`: Unknowns técnicos, necesita spike exploratorio primero
