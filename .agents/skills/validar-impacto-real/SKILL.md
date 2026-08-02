---
name: validar-impacto-real
description: >-
  Compara el impacto predicho en el análisis de impacto con el impacto real
  del código implementado validando que los breaking changes fueron mitigados,
  que los servicios downstream fueron notificados/actualizados y detectando
  efectos secundarios no anticipados para generar
  docs/<domain>/<TICKET-ID>-impact-validation.md con veredicto de validación.
  Úsalo cuando el usuario pida validar, comparar, verificar, revisar, auditar
  o evaluar el impacto real después de implementar-plan. No lo uses para
  predecir impacto antes de implementar — usa predecir-impacto-cambio para
  eso.
---

# Validador de Impacto Real

Compara el impacto predicho en el análisis de impacto con el impacto real del código implementado. Valida mitigaciones y detecta efectos secundarios no anticipados.

Solo análisis: no modifica código. Valida que el impacto real coincide con el predicho.

## Fase 0 — Resolver entrada

Requerido: `PLAN-DOC` (plan de implementación) o `BRANCH` (rama local).

Infiere desde:
- Ruta: `docs/**/<TICKET-ID>-implementation-plan.md`
- Rama local: cambios uncommitted vs origin/main
- Contenido pegado: si el usuario pega el plan

Pregunta cuando falta: "¿Qué cambios analizo? (ruta del plan o rama local)"

Declara inputs resueltos: ticket, archivos modificados, scope.

## Fase A — Cargar Análisis de Impacto Predicho

1. Lee el análisis de impacto predicho: `docs/<domain>/<TICKET-ID>-impact-analysis.md`
2. Extrae:
   - Breaking changes detectados
   - Servicios downstream afectados
   - Riesgo (low/medium/high)
   - Cascade updates identificados
   - Recomendaciones de mitigación

Si el archivo no existe, genera un análisis de impacto predicho primero invocando `predecir-impacto-cambio`.

## Fase B — Analizar Código Implementado

1. Lee el plan o diff de rama: qué se modificó realmente
2. Si hay rama local: ejecuta `git diff origin/main...HEAD`
3. Identifica:
   - Archivos modificados/creados
   - APIs que cambiaron (endpoints, métodos)
   - Schemas que cambiaron (new fields, type changes, deletions)
   - Comportamiento que cambió

## Fase C — Validar Breaking Changes

```
### Validación de Breaking Changes

| Breaking Change Predicho | Estado en Implementación | Mitigación Aplicada | Veredicto |
|---|---|---|---|
| DELETE endpoint `/users/{id}` | Endpoint renombrado a `/users/{id}/deactivate` | Deprecation warning added | ✅ Mitigado |
| Rename field `email` → `email_address` | Field renombrado, backward compat layer added | Support both names temporalmente | ✅ Mitigado |
| Change param type `status: string` → `status: enum` | Cambio implementado sin backward compat | No aplica mitigación | ❌ No mitigado |
| Add required field `phone` (no default) | Campo agregado con default value `null` | Default value added, gradual migration plan | ✅ Mitigado |
```

**Veredicto por breaking change**:
- ✅ **Mitigado**: Se aplicó la mitigación recomendada o una alternativa válida
- ⚠️ **Parcialmente mitigado**: Se aplicó mitigación parcial, riesgo residual
- ❌ **No mitigado**: No se aplicó mitigación, breaking change persiste
- 🟡 **No aplicable**: El breaking change predicho no se implementó

## Fase D — Validar Servicios Downstream

```
### Validación de Servicios Downstream

| Servicio Downstream | Estado de Notificación/Actualización | Veredicto |
|---|---|---|
| Web Frontend | Notificado, actualizado en PR #123 | ✅ Completado |
| Mobile App | No notificado, API contract cambió | ❌ Pendiente |
| Admin Dashboard | Notificado, actualización en progreso | ⚠️ En progreso |
| Documentation | Actualizada en docs/api.md | ✅ Completado |
```

**Veredicto por servicio**:
- ✅ **Completado**: Servicio notificado y actualizado
- ⚠️ **En progreso**: Servicio notificado, actualización en progreso
- ❌ **Pendiente**: Servicio no notificado o no actualizado
- 🟡 **No aplicable**: Servicio no afectado por el cambio

## Fase E — Detectar Efectos Secundarios No Anticipados

```
### Efectos Secundarios No Anticipados

#### Efecto 1: Cambio de timing en async job
**Predicho**: No se predijo efecto en jobs asíncronos
**Real**: El cambio en el schema de User causó que el job `send_welcome_email` falle 5% de las veces debido a race condition
**Severidad**: 🟠 Medio
**Acción requerida**: Agregar retry logic o cambiar orden de operaciones

#### Efecto 2: Nuevo dependency en PricingService
**Predicho**: Se predijo nueva dependencia
**Real**: La dependencia existe pero no se agregó fallback cuando el servicio está down
**Severidad**: 🔴 Alto
**Acción requerida**: Agregar circuit breaker o fallback

#### Efecto 3: Cambio en logging
**Predicho**: No se predijo efecto en logging
**Real**: El cambio redujo el volumen de logs en 30%, afectando monitoreo
**Severidad**: 🟡 Menor
**Acción requerida**: Restaurar logs críticos
```

## Fase G — Generar Veredicto de Validación

```
### Veredicto de Validación de Impacto

**Estado General**: PARTIAL

**Resumen**:
- Breaking changes: 3 predichos → 2 mitigados, 1 no mitigado
- Servicios downstream: 4 afectados → 2 completados, 1 en progreso, 1 pendiente
- Efectos secundarios no anticipados: 3 detectados (1 alto, 1 medio, 1 menor)

**Riesgo Actual**: MEDIUM (breaking change no mitigado + efecto secundario alto)

**Recomendaciones**:
1. Mitigar breaking change de enum: agregar backward compat o rollback
2. Notificar equipo Mobile App del cambio de API contract
3. Agregar fallback para PricingService (efecto secundario alto)
4. Considerar retry logic para race condition en async job

**Ready for**: `needs-fixes` (resolver breaking change no mitigado y efecto secundario alto antes de merge)
```

## Fase H — Escribir Reporte de Validación

Estructura:

1. **Resumen ejecutivo**: Estado de validación, breaking changes mitigados, servicios notificados, efectos no anticipados
2. **Validación de breaking changes**: Tabla con estado y veredicto por cambio
3. **Validación de servicios downstream**: Tabla con estado de notificación/actualización
4. **Efectos secundarios no anticipados**: Lista con severidad y acción requerida
5. **Veredicto de validación**: Estado general, resumen, riesgo actual, recomendaciones
6. **Ready for**: `passed`, `partial`, `failed`, `blocked`

## Salida

Escribe en: `docs/<domain>/<TICKET-ID>-impact-validation.md`

**Secciones requeridas**:
- Resumen ejecutivo
- Validación de breaking changes (tabla)
- Validación de servicios downstream (tabla)
- Efectos secundarios no anticipados (lista)
- Veredicto de validación
- Ready for (`passed`, `partial`, `failed`, `blocked`)

Ready for valores:
- `passed`: Todos los breaking changes mitigados, todos los servicios notificados/actualizados, sin efectos secundarios altos no anticipados
- `partial`: Algunos breaking changes no mitigados o servicios pendientes, pero no bloqueantes
- `failed`: Breaking changes críticos no mitigados o efectos secundarios altos no anticipados
- `blocked`: Breaking changes no mitigables, reconsiderar arquitectura
