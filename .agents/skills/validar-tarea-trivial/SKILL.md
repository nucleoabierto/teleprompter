---
name: validar-tarea-trivial
description: >-
  Valida si un cambio es realmente trivial (1 punto Fibonacci: 0-3 horas)
  calificando para fast-track. Criterios: <5 archivos, <50 líneas neto, mismo
  dominio, migraciones simples permitidas (1 columna, sin breaking changes),
  sin dependencias de features. Salida: `ready-for-fast-track` o
  `full-pipeline`. Úsalo cuando el usuario pida validar, clasificar, estimar o
  determinar si un cambio es trivial al inicio de una tarea. No lo uses para
  revisar cambios implementados (usa revisar-cambio-minimo).
---

# Validador de Tarea Trivial (1 Punto Fibonacci)

Valida si un cambio es realmente trivial (1 punto: 0-3 horas) para fast-track workflow. Aplica criterios objetivos alineados con la escala de estimación Fibonacci.

Solo análisis: no modifica código. Determina pipeline.

## Mapeo a Escala Fibonacci

Este skill valida que un cambio califica como **1 punto Fibonacci (0-3 horas)** según la referencia de estimación del proyecto.

**Lógica de mapeo**:
- Los criterios (<5 archivos, <50 líneas, mismo dominio, migraciones simples, sin dependencias, tests incluidos) se diseñaron para cambios que pueden completarse en 0-3 horas por un dev experimentado
- Si todos los criterios pasan → el cambio es predecible, localizado y bajo riesgo → 1 punto Fibonacci
- Si algún criterio falla → el cambio requiere más tiempo, investigación o coordinación → 2+ puntos

**Referencia**: Ver `_shared/estimation-reference.md` para la tabla completa de puntos Fibonacci (1 = 0-3h, 2 = 3-6h, 3 = 6-12h, etc.)

## Fase 0 — Resolver entrada

Requerido: `TICKET-ID` o `DIFF`.

Infiere desde:
- Ticket ID: busca plan de implementación `docs/**/<TICKET-ID>-implementation-plan.md`
- Rama local: `git diff origin/main...HEAD` para ver cambios
- Contenido pegado: si el usuario pega el plan

Pregunta cuando falta: "¿Qué cambio valido? (ticket ID o rama local)"

Declara inputs resueltos: ticket, cambios encontrados.

## Fase A — Calcular Métricas Objetivas

Para el diff actual, calcula:

```
### Métricas de Scope

| Métrica | Valor | Límite Trivial | Status |
|---|---|---|---|
| Archivos modificados | 3 | <5 | ✅ OK |
| Líneas neto (+ - comentarios) | 42 | <50 | ✅ OK |
| Líneas comentario | 0 | <20 | ✅ OK |
| Cambios de tipo diferente | 1 | <=1 | ✅ OK |
| Nuevas dependencias | 0 | 0 | ✅ OK |
| Migraciones de DB | 1 columna simple | 1 columna simple | ✅ OK |
| Tests modificados | 1 | >=1 | ✅ OK |

**Score Trivial**: 7/7 criterios ✅ → PASS
```

## Fase B — Aplicar Criterios Triviales

Cada criterio:

```
### Criterio 1: Archivos Modificados

**Límite**: < 5 archivos
**Razón**: Menos archivos = menos cambios de contexto para revisor
**Alineación Fibonacci**: 1 punto (0-3 horas) = cambios localizados en pocos archivos

**Evaluación**:
- src/services/payment.py (modificado)
- tests/services/test_payment.py (modificado)
- Total: 2 archivos ✅

**Si falla**: 7 archivos → No es trivial
```

```
### Criterio 2: Líneas Neto

**Límite**: < 50 líneas de código (sin comentarios)
**Razón**: Rápido de entender, bajo riesgo
**Alineación Fibonacci**: 1 punto (0-3 horas) = cambios pequeños y localizados

**Evaluación**:
- Adiciones: 35 líneas
- Deletions: 5 líneas
- Neto: +30 líneas ✅

**Si falla**: +200 líneas → No es trivial
```

```
### Criterio 3: Mismo Dominio/Contexto

**Límite**: Cambios en 1 bounded context máximo
**Razón**: Evita acoplamiento entre dominios
**Alineación Fibonacci**: 1 punto (0-3 horas) = cambios dentro de un solo contexto

**Evaluación**:
- Cambios en: Payment service (1 BC)
- No toca: User, Auth, Notifications
- ✅ OK

**Si falla**: Modifica Payment + Auth + User → No es trivial (múltiples contextos)
```

```
### Criterio 4: Migraciones de DB

**Límite**: Migraciones simples permitidas (1 columna nueva, sin breaking changes)
**Razón**: Migraciones simples pueden completarse en 0-3 horas
**Alineación Fibonacci**: 1 punto (0-3 horas) = permite modificar 1 tabla con 1 columna nueva

**Evaluación**:
- Schema changes: 1 columna nueva agregada (nullable)
- Migration files: 1 migration simple
- ✅ OK

**Si falla**: Migración compleja (múltiples tablas, datos existentes, breaking changes) → No es trivial
```

```
### Criterio 5: Sin Dependencias de Features

**Límite**: No requiere cambios en otros sistemas
**Razón**: Cambio aislado, independiente
**Alineación Fibonacci**: 1 punto (0-3 horas) = sin dependencias de cascade updates

**Evaluación**:
- Requiere cambios en: None
- Puede deployar solo: Yes
- ✅ OK

**Si falla**: Requiere Web Frontend update → No es trivial (no independiente)
```

```
### Criterio 6: Tests Incluidos

**Límite**: >= 1 test case cubierto
**Razón**: Validación básica del cambio
**Alineación Fibonacci**: 1 punto (0-3 horas) = testing básico incluido en el tiempo

**Evaluación**:
- Tests agregados: 3
- Coverage: 90%
- ✅ OK

**Si falla**: Sin nuevos tests → No es trivial (validación insuficiente)
```

## Fase C — Scoring Flexibilidad

Si apenas falla 1-2 criterios, aplica scoring de "casi trivial":

```
### Near-Trivial Cases

**Caso 1**: 6 archivos (límite 5)
- Exceso: +1 archivo
- Impacto: Menor
- Veredicto: MAYBE → Usa criterio de juicio

**Caso 2**: 75 líneas neto (límite 50)
- Exceso: +25 líneas
- Impacto: Moderado
- Veredicto: NO (exceso 50% sobre límite)

**Caso 3**: 2 bounded contexts (límite 1)
- Exceso: +1 BC
- Impacto: Alto (acoplamiento)
- Veredicto: NO definitivo
```

## Fase D — Generar Veredicto

```
### Veredicto: Fast-Track Eligible?

**Opción 1**: TRIVIAL APPROVED (todos criterios pass)
 Pipeline: Fast-track (0-3 horas, 1 punto Fibonacci)
 Steps: Code → Tests → Quick review → Merge

**Opción 2**: TRIVIAL BORDERLINE (1-2 criterios near-fail)
 Pipeline: Standard (user choice)
 Recomendación: Usar standard para caution

**Opción 3**: TRIVIAL REJECTED (multiple criterios fail)
 Pipeline: Full pipeline (7+ pasos)
 Razón: [Listar criterios que fallaron]
```

## Fase E — Escribir Validación de Scope

Estructura:

1. **Resumen**: ¿Es trivial (1 punto)? Veredicto.
2. **Métricas objetivas**: Tabla de valores vs límites
3. **Criterio 1 (Archivos)**: Pass/fail con razón
4. **Criterio 2 (Líneas)**: Pass/fail con razón
5. **Criterio 3 (Dominio)**: Pass/fail con razón
6. **Criterio 4 (Migraciones)**: Pass/fail con razón
7. **Criterio 5 (Dependencias)**: Pass/fail con razón
8. **Criterio 6 (Tests)**: Pass/fail con razón
9. **Scoring final**: Trivial / Borderline / Full pipeline
10. **Recomendación**: Qué pipeline usar
11. **Ready for**: `fast-track` o `full-pipeline`

## Salida

Escribe en: `docs/<domain>/<TICKET-ID>-trivial-validation.md` (o salida en chat)

**Secciones requeridas**:
- Resumen ejecutivo (¿Es trivial?)
- Métricas objetivas (tabla)
- Criterio por criterio (Pass/Fail con razón)
- Scoring final
- Recomendación de pipeline
- Ready for (`fast-track`, `full-pipeline`, `borderline`)

Ready for valores:
- `fast-track`: All criterios pass, use 0-3h pipeline (1 punto Fibonacci)
- `full-pipeline`: 1+ criterios fail, use standard 7+ step pipeline
- `borderline`: 1-2 criterios near-fail, user choice between fast-track + caution or full-pipeline
