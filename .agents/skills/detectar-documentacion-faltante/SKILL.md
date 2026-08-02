---
name: detectar-documentacion-faltante
description: >-
  Analiza código nuevo y detecta documentación faltante incluyendo docstrings,
  examples, edge cases y decisiones arquitectónicas para generar
  docs/<domain>/<TICKET-ID>-documentation-gaps.md con lista de gaps y
  sugerencias. Úsalo cuando el usuario pida detectar, analizar, revisar,
  auditar o evaluar documentación faltante, o después de implementar-plan
  antes de revisar-cambios-locales. No lo uses para escribir documentación —
  este skill solo detecta gaps que el desarrollador debe resolver.
---

# Detector de Documentación Faltante

Analiza código nuevo y detecta documentación faltante: docstrings, ejemplos, edge cases, decisiones arquitectónicas. Asegura que código esté documentado antes de review.

Solo análisis: no escribe documentación. Lista gaps que dev debe resolver.

## Fase 0 — Resolver entrada

Requerido: `PLAN-DOC` (plan de implementación) o `BRANCH` (rama local).

Infiere desde:
- Ruta: `docs/**/<TICKET-ID>-implementation-plan.md`
- Rama local: cambios uncommitted vs origin/main
- Contenido pegado: si el usuario pega el plan

Pregunta cuando falta: "¿Qué cambios analizo? (ruta del plan o rama local)"

Declara inputs resueltos: ticket, archivos modificados.

## Fase A — Analizar Cambios

1. Lee el plan: qué se implementa, qué componentes se tocan
2. Si hay rama local: ejecuta `git diff origin/main...HEAD` para ver código
3. Ejecuta grep en cambios: busca comentarios `TODO`, `FIXME`, `XXX`
4. Identifica archivos nuevos y modificados

## Fase B — Validar Docstrings (Públicos)

Para cada función/clase pública, verifica:

Ver ejemplos en `assets/docstring-examples.md`:
- ✅ Bien documentado vs ❌ Mal documentado
- ✅ Incompleto (secciones faltantes)

**Gap detected patterns**:
- Función sin docstring (público API)
- Docstring incompleto (missing Args, Returns, Raises, Example)

Usar estándar: `references/python-docstring-standard.md` (Google Style)

## Fase C — Validar Comentarios (Privados)

Para código privado (funciones internas, complejas):

Ver ejemplos en `assets/docstring-examples.md`:
- ✅ Bien comentada vs ❌ Sin comentarios (complejidad oculta)

**Gap detected patterns**:
- Lógica compleja sin comentarios (memoization, algorithms no claros)

## Fase D — Validar Ejemplos (Public APIs)

Ver ejemplos en `assets/docstring-examples.md`:
- ✅ Con ejemplo vs ❌ Sin ejemplo

**Gap detected patterns**:
- Public API sin usage example en docstring

## Fase E — Validar Edge Cases Documentados

Ver ejemplos en `assets/docstring-examples.md`:
- ✅ Con edge cases claros vs ❌ Sin mencionar edge cases

**Gap detected patterns**:
- Edge cases no documentados (empty lists, null values, boundary conditions)

## Fase F — Validar Decisiones Arquitectónicas

Para cambios que requieren decisiones:

Ver patrones en `references/documentation-patterns.md`:
- Patrón detectado: Dual-write strategy y otros patrones arquitectónicos

**Gap detected patterns**:
- Decisiones arquitectónicas sin ADR
- Patrones complejos sin documentación

Buscar en codebase:
- ¿Existe ADR documentando esta decisión?
- ¿Existe comentario explicando por qué?
- ¿Está documentado en architecture.md?

**Recomendación**: Link to ADR-XXX or add comment explaining the pattern

## Fase G — Validar Código No Documentado

Ver tabla completa en `references/documentation-patterns.md`:
- Patrones de código que requieren documentación
- Requisitos por tipo de patrón

**Gap detected patterns**:
- Retry logic sin explicar strategy
- Cache invalidation sin mencionar TTL/strategy
- Rate limiting sin mencionar limits
- Circuit breaker sin documentar behavior
- Async/await patterns sin mencionar threading
- SQL queries sin índices documentados
- Regular expressions sin ejemplo de match
- Magic numbers sin explicación
- Type coercion sin explicar conversión
- Error handling sin mencionar fallback

## Fase H — Validar README/Setup Docs

Para cambios que afecten setup o deployment:

Ver tabla completa en `references/documentation-patterns.md`:
- Requisitos de documentación por tipo de cambio

**Gap detected patterns**:
- Nueva dependencia sin mencionar en README
- Nueva variable env sin documenting required vars
- New database schema sin script de rollback
- New service/API sin documentar endpoints
- Config changes sin explicar flags

## Fase I — Validar Comentarios "TODO/FIXME"

Ver ejemplos en `assets/docstring-examples.md`:
- ✅ Bien formado vs ❌ Mal formado

Los TODO/FIXME deben ser autocontenidos según `../_shared/self-contained-comments.md`: el lector futuro debe entender qué quedó pendiente y por qué sin buscar un ticket, ADR u otra documentación externa. El contexto explicativo es obligatorio; la referencia al ticket es opcional y nunca sustituye a la descripción.

**Gaps detected**:
- TODOs sin descripción de qué queda pendiente → el lector futuro no sabe qué resolver
- FIXMEs sin descripción → misterioso por qué es hack
- TODOs/FIXMEs que solo referencian un ticket, ADR o artefacto del workflow → referencias efímeras que sobreviven al artefacto

**Script helper**: `scripts/scan-todos.sh <file_or_directory>` para detección automatizada

## Fase J — Escribir Reporte de Gaps

Estructura:

1. **Resumen**: N gaps detectados, criticidad (blocker/warning/suggestion)
2. **Gaps críticos** (bloquean merge):
   - Funciones públicas sin docstring
   - Decisiones arquitectónicas sin ADR
   - Edge cases no documentados
3. **Gaps mayores** (warnings):
   - Ejemplos faltantes
   - Comentarios en lógica compleja
   - TODOs sin contexto
4. **Gaps menores** (suggestions):
   - Comentarios mejorados
   - Documentación más clara
5. **Por archivo**: Lista de gaps específicos por archivo
6. **Recomendaciones**: Qué documentar antes de merge
7. **Ready for**: `merge-ready` o `needs-documentation`

## Salida

Escribe en: `docs/<domain>/<TICKET-ID>-documentation-gaps.md`

**Secciones requeridas**:
- Resumen de gaps (crítico/mayor/menor)
- Gaps críticos (deben resolverse)
- Gaps mayores (deberían resolverse)
- Gaps menores (sugerencias)
- Por archivo (qué falta en cada archivo)
- Recomendaciones accionables
- Ready for (`merge-ready`, `needs-documentation`)

Ready for valores:
- `merge-ready`: Sin gaps críticos, documentación aceptable
- `needs-documentation`: Gaps críticos detectados, resolver antes de merge
- `documentation-optional`: Solo gaps menores/sugerencias

## Herramientas Automatizadas

### Escaneo de TODO/FIXME
```bash
./scripts/scan-todos.sh <file_or_directory>
```
Detecta TODOs sin ticket y FIXMEs sin descripción
