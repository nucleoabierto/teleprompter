---
name: sugerir-casos-prueba
description: >-
  Analiza código nuevo o plan de implementación e identifica casos de prueba
---

# Sugeridor de Test Cases

Analiza código e identifica casos de prueba que deberían implementarse. Completa la estrategia ZOMBIE con casos concretos.

Solo documentación: no escribe tests. Sugiere qué testear.

## Fase 0 — Resolver entrada

Requerido: `STRATEGY-DOC` (test strategy) o `IMPLEMENTATION-PLAN`.

Infiere desde:
- Ruta: `docs/**/<EPIC-SLUG>-test-strategy.md` o `<TICKET-ID>-implementation-plan.md`
- Contenido pegado: si el usuario pega la estrategia
- Plan previo: busca el archivo más reciente

Pregunta cuando falta: "¿Para qué genero test cases? (ruta de strategy o plan)"

Declara inputs resueltos: epic/ticket, estrategia leída.

## Fase A — Analizar Función/Componente

Para cada función/método público, identifica:

1. **Entrada**: Qué acepta (tipos, rangos, restricciones)
2. **Salida**: Qué retorna (tipo, rango posible)
3. **Comportamiento**: Qué hace (lógica principal)
4. **Efectos secundarios**: Qué modifica (DB, cache, etc.)
5. **Errores**: Qué puede fallar

> **Referencia de ejemplos**: Consulta `references/test-case-examples-guide.md` para ver todas las secciones de ejemplos disponibles en `assets/test-case-examples.md`.

---

**Nota**: Para las fases B-H, consulta los ejemplos específicos en `assets/test-case-examples.md` según la guía en `references/test-case-examples-guide.md`.

## Fase B — Happy Path Test Case

**Definición**: El caso de uso normal, todo funciona.

**Regla**: 1 test per happy path variation (ej: 4 tiers = 4 tests)

## Fase C — Edge Cases

**Definición**: Casos en límites, valores especiales.

**Casos típicos**:
- Zero value
- Minimum value
- Maximum value
- Rounding edge cases (0.005 → round up/down?)
- Floating point precision

## Fase D — Error Cases

**Definición**: Entradas inválidas, condiciones de error.

**Regla**: 1 test per error path (lista todos los Raises en docstring)

## Fase E — Boundary Cases

**Definición**: Valores justo en límites.

**Enfoque**: Identificar límites definidos (rangos, máximos, mínimos) y testear valores justo en, bajo y sobre esos límites.

## Fase F — Efectos Secundarios

**Definición**: Validar que side effects ocurren.

**Regla**: Mock side effects, assert they occurred

## Fase G — Concurrency/Race Conditions

**Definición**: Comportamiento bajo acceso concurrente.

**Regla**: If función usa estado compartido, test concurrency

## Fase H — Integration Cases

**Definición**: Interacción con otras funciones.

**Regla**: If multiple functions work together, test the combination

## Fase I — Matriz de Cobertura por Caso

**Estructura**: Tabla con columnas: Caso, Tipo, Unit, Integration, E2E, Manual. Resume total de tests por nivel.

> **Plantilla**: Usa `references/coverage-matrix-template.md` como base para la matriz de cobertura.

## Fase J — Escribir Sugerencias de Test Cases

> **Plantilla de salida**: Usa `assets/test-cases-output-template.md` como estructura base para el documento de test cases.

Estructura:

1. **Resumen**: # de test cases por tipo (happy/edge/error/boundary/side-effect/concurrency/integration)
2. **Happy path cases**: 1-3 tests del flujo normal
3. **Edge cases**: Cero, mínimo, máximo, rounding, precision
4. **Error cases**: Para cada Raises en docstring
5. **Boundary cases**: Valores en límites
6. **Side effect cases**: Logging, DB updates, cache changes
7. **Concurrency cases**: Si hay estado compartido
8. **Integration cases**: Con otros componentes
9. **Matriz de cobertura**: Resumen por tipo
10. **Recomendaciones**: Qué es crítico testear
11. **Preguntas abiertas**: Unknowns
12. **Ready for**: `implementation-ready`

## Autoevaluación

Antes de escribir la salida, verifica:

- [ ] Estrategia de test leída completamente
- [ ] Función/componente analizado completamente (entrada, salida, comportamiento, efectos secundarios, errores)
- [ ] Happy path test cases identificados (1 test por variación)
- [ ] Edge cases identificados (zero, mínimo, máximo, rounding, precision)
- [ ] Error cases identificados (1 test por error path)
- [ ] Boundary cases identificados (valores en límites)
- [ ] Side effects validados (logging, DB updates, cache changes)
- [ ] Concurrency cases sugeridos (si hay estado compartido)
- [ ] Integration cases sugeridos (si interactúa con otros componentes)
- [ ] Matriz de cobertura completada
- [ ] Prioridades asignadas (qué es crítico testear)
- [ ] Preguntas abiertas documentadas (unknowns)

Si algún item no está completo, regresa a la fase correspondiente o pregunta al usuario.

## Salida

Escribe en: `docs/<domain>/<TICKET-ID>-test-cases.md`

> **Validación**: Después de escribir, ejecuta `scripts/validate-test-cases-structure.sh <ruta-del-archivo>` para verificar la estructura.

**Secciones requeridas**:
- Resumen de test cases (# por tipo)
- Happy path cases concretos (ejemplos)
- Edge cases concretos
- Error cases concretos
- Boundary cases concretos
- Side effect cases concretos
- Concurrency cases (si aplica)
- Integration cases (si aplica)
- Matriz de cobertura (tipo × nivel)
- Recomendaciones de prioridad
- Preguntas abiertas
- Ready for (`implementation-ready`, `needs-clarification`)

Ready for valores:
- `implementation-ready`: Test cases claros, devs pueden implementar
- `needs-clarification`: Algunos casos ambigüos, aclarar primero
