---
name: validar-casos-prueba-implementados
description: >-
  Compara los casos de prueba sugeridos en el análisis de test cases con los
  tests implementados validando cobertura de happy path, edge cases, error
  cases, etc. para identificar gaps de cobertura y generar recomendaciones en
  docs/<domain>/<TICKET-ID>-test-coverage-validation.md con matriz de
  implementación. Úsalo cuando el usuario pida validar, comparar, verificar,
  revisar, auditar o evaluar la cobertura de tests después de
  implementar-plan. No lo uses para sugerir test cases antes de implementar —
  usa sugerir-casos-prueba para eso.
---

# Validador de Test Cases Implementados

Compara los test cases sugeridos con los tests implementados. Valida cobertura y detecta gaps.

Solo análisis: no modifica código. Valida que los tests sugeridos se implementaron.

## Fase 0 — Resolver entrada

Requerido: `PLAN-DOC` (plan de implementación) o `BRANCH` (rama local).

Infiere desde:
- Ruta: `docs/**/<TICKET-ID>-implementation-plan.md`
- Rama local: cambios uncommitted vs origin/main
- Contenido pegado: si el usuario pega el plan

Pregunta cuando falta: "¿Qué cambios analizo? (ruta del plan o rama local)"

Declara inputs resueltos: ticket, archivos modificados, scope.

## Fase A — Cargar Test Cases Sugeridos

1. Lee los test cases sugeridos: `docs/<domain>/<TICKET-ID>-test-cases.md`
2. Extrae:
   - Happy path cases
   - Edge cases
   - Error cases
   - Boundary cases
   - Side effect cases
   - Concurrency cases
   - Integration cases
   - Matriz de cobertura esperada

Si el archivo no existe, genera test cases sugeridos primero invocando `sugerir-casos-prueba`.

## Fase B — Analizar Tests Implementados

1. Busca archivos de tests en el código implementado:
   - `**/*test*.py`, `**/*test*.js`, `**/*test*.ts`, `**/*.test.js`, `**/*.test.ts`
   - `**/tests/**`, `**/__tests__/**`
2. Para cada test case sugerido, busca si existe un test implementado:
   - Busca por nombre de función/método
   - Busca por descripción del test case
   - Busca por assertions similares
3. Clasifica cada test case sugerido:
   - ✅ **Implementado**: Test existe y cubre el caso
   - ⚠️ **Parcialmente implementado**: Test existe pero no cubre completamente el caso
   - ❌ **No implementado**: No existe test para este caso
   - 🟡 **No aplicable**: El caso sugerido no aplica al código implementado

## Fase C — Validar Cobertura por Tipo

```
### Validación de Cobertura por Tipo

#### Happy Path
| Test Case Sugerido | Test Implementado | Estado | Archivo |
|---|---|---|---|
| Login con credenciales válidas | `test_login_valid_credentials` | ✅ Implementado | tests/auth_test.py |
| Login con 2FA enabled | `test_login_with_2fa` | ✅ Implementado | tests/auth_test.py |
| Login con remember me | `test_login_remember_me` | ❌ No implementado | - |
| Login con rate limit | `test_login_rate_limit` | ⚠️ Parcial | tests/auth_test.py (falta assertion de rate limit) |

**Resumen Happy Path**: 3/4 (75%) - 1 faltante, 1 parcial

#### Edge Cases
| Test Case Sugerido | Test Implementado | Estado | Archivo |
|---|---|---|---|
| Usuario con email vacío | `test_user_empty_email` | ✅ Implementado | tests/user_test.py |
| Usuario con email inválido | `test_user_invalid_email` | ✅ Implementado | tests/user_test.py |
| Usuario con bio de 500 chars | `test_user_bio_max_length` | ❌ No implementado | - |
| Usuario con bio de 501 chars | `test_user_bio_exceeds_max` | ❌ No implementado | - |
| Usuario con bio con HTML | `test_user_bio_html_escape` | ❌ No implementado | - |

**Resumen Edge Cases**: 2/5 (40%) - 3 faltantes

#### Error Cases
| Test Case Sugerido | Test Implementado | Estado | Archivo |
|---|---|---|---|
| Login con password incorrecto | `test_login_wrong_password` | ✅ Implementado | tests/auth_test.py |
| Login con usuario inexistente | `test_login_nonexistent_user` | ✅ Implementado | tests/auth_test.py |
| Login con cuenta bloqueada | `test_login_blocked_account` | ❌ No implementado | - |
| Login con token expirado | `test_login_expired_token` | ✅ Implementado | tests/auth_test.py |
| Login con token inválido | `test_login_invalid_token` | ✅ Implementado | tests/auth_test.py |
| Login con cuenta eliminada | `test_login_deleted_account` | ❌ No implementado | - |

**Resumen Error Cases**: 4/6 (67%) - 2 faltantes

#### Boundary Cases
| Test Case Sugerido | Test Implementado | Estado | Archivo |
|---|---|---|---|
| Usuario con edad mínima (18) | `test_user_min_age` | ✅ Implementado | tests/user_test.py |
| Usuario con edad máxima (120) | `test_user_max_age` | ✅ Implementado | tests/user_test.py |
| Usuario con edad 17 (justo bajo) | `test_user_age_just_under` | ❌ No implementado | - |
| Usuario con edad 121 (justo sobre) | `test_user_age_just_over` | ❌ No implementado | - |
| Usuario con edad 0 | `test_user_age_zero` | ⚠️ Parcial | tests/user_test.py (falta validation check) |

**Resumen Boundary Cases**: 2/5 (40%) - 2 faltantes, 1 parcial

#### Side Effects
| Test Case Sugerido | Test Implementado | Estado | Archivo |
|---|---|---|---|
| Login envía email de notificación | `test_login_sends_email` | ✅ Implementado | tests/auth_test.py |
| Login actualiza last_login | `test_login_updates_last_login` | ✅ Implementado | tests/auth_test.py |
| Login incrementa contador de intentos | `test_login_increments_attempt_count` | ❌ No implementado | - |

**Resumen Side Effects**: 2/3 (67%) - 1 faltante

#### Concurrency
| Test Case Sugerido | Test Implementado | Estado | Archivo |
|---|---|---|---|
| Login concurrente mismo usuario | `test_concurrent_login_same_user` | ❌ No implementado | - |
| Login concurrente usuarios diferentes | `test_concurrent_login_different_users` | ❌ No implementado | - |

**Resumen Concurrency**: 0/2 (0%) - 2 faltantes

#### Integration
| Test Case Sugerido | Test Implementado | Estado | Archivo |
|---|---|---|---|
| Login + creación de sesión | `test_login_creates_session` | ✅ Implementado | tests/integration/auth_test.py |
| Login + actualización de perfil | `test_login_updates_profile` | ✅ Implementado | tests/integration/auth_test.py |

**Resumen Integration**: 2/2 (100%) - todos implementados
```

## Fase D — Generar Matriz de Cobertura

```
### Matriz de Cobertura de Tests

| Tipo | Sugeridos | Implementados | % Cobertura | Estado |
|---|---|---|---|---|
| Happy Path | 4 | 3 | 75% | ⚠️ |
| Edge Cases | 5 | 2 | 40% | ❌ |
| Error Cases | 6 | 4 | 67% | ⚠️ |
| Boundary Cases | 5 | 2 | 40% | ❌ |
| Side Effects | 3 | 2 | 67% | ⚠️ |
| Concurrency | 2 | 0 | 0% | ❌ |
| Integration | 2 | 2 | 100% | ✅ |
| **Total** | **27** | **15** | **56%** | **⚠️** |

**Estado General**: INSUFICIENTE (cobertura < 70%)

**Tests Críticos Faltantes**:
- Login con cuenta bloqueada (error case - alta prioridad)
- Usuario con bio de 500/501 chars (edge case - XSS risk)
- Usuario con bio con HTML (edge case - XSS risk)
- Login concurrente mismo usuario (concurrency - race condition risk)
```

## Fase E — Generar Recomendaciones

```
### Recomendaciones de Prioridad

#### 🔴 Alta Prioridad (implementar antes de merge)
- [ ] Implementar test para login con cuenta bloqueada (error case)
- [ ] Implementar tests para bio con HTML y max length (edge cases - XSS risk)
- [ ] Implementar test para login concurrente mismo usuario (concurrency - race condition)

#### 🟠 Media Prioridad (implementar antes de merge si es posible)
- [ ] Implementar test para login con remember me (happy path)
- [ ] Completar test para login con rate limit (agregar assertion)
- [ ] Implementar tests para boundary cases de edad (justo bajo/sobre)
- [ ] Completar test para edad 0 (agregar validation check)

#### 🟡 Baja Prioridad (puede diferirse post-merge)
- [ ] Implementar test para login con cuenta eliminada (error case)
- [ ] Implementar test para login incrementa contador de intentos (side effect)
- [ ] Implementar test para login concurrente usuarios diferentes (concurrency)

#### ✅ Ya Implementados (no requiere acción)
- [x] Login con credenciales válidas
- [x] Login con 2FA enabled
- [x] Usuario con email vacío
- [x] Usuario con email inválido
- [x] Login con password incorrecto
- [x] Login con usuario inexistente
- [x] Login con token expirado
- [x] Login con token inválido
- [x] Usuario con edad mínima/máxima
- [x] Login envía email de notificación
- [x] Login actualiza last_login
- [x] Login + creación de sesión
- [x] Login + actualización de perfil
```

## Fase F — Generar Veredicto de Validación

```
### Veredicto de Validación de Test Coverage

**Estado General**: INSUFICIENTE

**Resumen**:
- Test cases sugeridos: 27
- Tests implementados: 15 (56%)
- Tests críticos faltantes: 3 (alta prioridad)
- Cobertura por tipo: Happy Path 75%, Edge Cases 40%, Error Cases 67%, Boundary Cases 40%, Side Effects 67%, Concurrency 0%, Integration 100%

**Riesgo Actual**: MEDIUM (falta cobertura de edge cases de XSS y concurrency)

**Recomendaciones**:
1. Implementar tests críticos de alta prioridad antes de merge (3 tests)
2. Mejorar cobertura de edge cases y boundary cases (5 tests)
3. Considerar agregar tests de concurrency si hay estado compartido (2 tests)

**Ready for**: `needs-fixes` (implementar tests críticos de alta prioridad antes de merge)
```

## Fase G — Escribir Reporte de Validación

Estructura:

1. **Resumen ejecutivo**: Estado de validación, % cobertura, tests críticos faltantes
2. **Validación por tipo**: Tablas por tipo (happy/edge/error/boundary/side-effect/concurrency/integration)
3. **Matriz de cobertura**: Resumen por tipo con % y estado
4. **Tests críticos faltantes**: Lista con prioridad y riesgo
5. **Recomendaciones de prioridad**: Checklist por prioridad (alta/media/baja)
6. **Veredicto de validación**: Estado general, resumen, riesgo actual, recomendaciones
7. **Ready for**: `passed`, `insufficient`, `critical`, `blocked`

## Salida

Escribe en: `docs/<domain>/<TICKET-ID>-test-coverage-validation.md`

**Secciones requeridas**:
- Resumen ejecutivo
- Validación por tipo (tablas)
- Matriz de cobertura
- Tests críticos faltantes
- Recomendaciones de prioridad
- Veredicto de validación
- Ready for (`passed`, `insufficient`, `critical`, `blocked`)

Ready for valores:
- `passed`: Cobertura ≥ 80%, todos los tests críticos implementados
- `insufficient`: Cobertura 60-79% o algunos tests críticos faltantes
- `critical`: Cobertura < 60% o tests críticos de seguridad faltantes
- `blocked`: Sin tests implementados para cambios críticos
