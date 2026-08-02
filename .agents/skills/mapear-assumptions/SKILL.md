---
name: mapear-assumptions
description: >-
  Mapea assumptions en 4 buckets (desirability, viability, feasibility,
  usability) usando framework de David Bland. Genera matriz 2x2 (risk vs
  evidence) y prioriza assumptions de alto riesgo/baja evidencia. Salida:
  docs/<domain>/initiatives/<PRD-SLUG>/assumption-map.md. Úsalo después de
  capturar-requerimiento para identificar riesgos antes de validar viabilidad.
---

# Mapeador de Assumptions

Mapea assumptions de producto en 4 buckets (desirability, viability, feasibility, usability) usando framework de David Bland. Prioriza assumptions de alto riesgo/baja evidencia para focus discovery.

Solo análisis: no valida, no implementa. Identifica riesgos para probar.

**Condicionalidad**: Este skill es recomendado pero no bloqueante en el workflow de PRD. Para contextos greenfield de bajo riesgo puede omitirse con justificación. Para PRDs con hipótesis significativas (cambio de comportamiento, monetización, regulatory), es obligatorio.

## Referencias

- **Framework de David Bland**: `references/david-bland-framework.md` - 4 buckets, matriz risk vs evidence, guía de aplicación
- **Tipos de experimentos**: `references/experiment-types-by-assumption.md` - Mapping assumption type → experimento sugerido
- **Matriz Risk vs Evidence**: `assets/risk-evidence-matrix-template.md` - Template para graficar assumptions en matriz 2x2
- **Preguntas Abiertas**: `assets/open-questions-template.md` - Template para documentar información faltante

# Mapeador de Assumptions

Mapea assumptions de producto en 4 buckets (desirability, viability, feasibility, usability) usando framework de David Bland. Prioriza assumptions de alto riesgo/baja evidencia para focus discovery.

Solo análisis: no valida, no implementa. Identifica riesgos para probar.

## Fase 0 — Resolver entrada

**Gate de evaluación** — Antes de ejecutar, evalúa si este PRD requiere mapeo de assumptions:
- ¿El PRD involucra cambio de comportamiento del usuario? → Sí
- ¿El PRD involucra monetización o pricing? → Sí
- ¿El PRD involucra regulatory o compliance? → Sí
- ¿El PRD es greenfield de bajo riesgo (dogfooding, internal tool)? → Opcional

IF Opcional Y el usuario no lo pide explícitamente:
  → Omite este skill con justificación documentada
  → Registro de omisión OBLIGATORIO (preserva trazabilidad del proceso):
    - Escribe un stub `docs/<domain>/initiatives/<PRD-SLUG>/assumption-map.md` con header estándar, veredicto "Omitido", razón (ej: "greenfield de bajo riesgo — dogfooding") y Ready for: validar-viabilidad-producto
    - O alternativamente, añade un campo "Pasos omitidos" en `docs/<domain>/initiatives/<PRD-SLUG>/requirements.md` listando la omisión con razón
  → Ready for: validar-viabilidad-producto (sin assumption-map completo, pero con registro de omisión)

Requerido: `REQ-SLUG` o `REQUIREMENTS-RUTA`.

Infiere desde:
- Ruta: `docs/**/initiatives/**/requirements.md`
- Contenido pegado: si usuario pega requerimiento capturado
- Requerimiento previo: busca archivo más reciente de `*-requirements.md`

Pregunta cuando falta: "¿Qué requerimiento analizo? (ruta o slug)"

Declara inputs resueltos: requerimiento leído.

## Fase A — Identificar Assumptions por Bucket

Framework de David Bland (4 buckets): ver `references/david-bland-framework.md` para el framework completo con criterios detallados y métodos de validación.

**Resumen de buckets**:
- **Desirability**: ¿Los usuarios realmente tienen este problema?
- **Viability**: ¿Tiene sentido para el negocio?
- **Feasibility**: ¿Podemos construirlo?
- **Usability**: ¿Pueden usarlo?

Para cada bucket, listar 3-5 assumptions específicos.

**Estrategia de fallo**: Si el requerimiento no tiene suficiente información para identificar assumptions, listar assumptions genéricos basados en el dominio y documentar en Preguntas abiertas.

## Fase B — Evaluar Risk y Evidence

Para cada assumption:

**Risk (Probabilidad de estar equivocado)**:
- **Alto**: Assumption crítico, si falla el feature falla
- **Medio**: Assumption importante pero hay alternativas
- **Bajo**: Assumption secundario, impacto limitado

**Evidence (Cuánta evidencia tenemos)**:
- **Alta**: Data cuantitativa, múltiples validaciones
- **Media**: Algunos datos, validación parcial
- **Baja/Ninguna**: Solo opinión, sin validación

**Estrategia de fallo**: Si no hay información para evaluar risk/evidence de un assumption, marcar como "Medium risk/Low evidence" (default conservador) y documentar en Preguntas abiertas.

## Fase C — Graficar en Matriz 2x2

Usar template en `assets/risk-evidence-matrix-template.md` para graficar assumptions.

**Matriz Risk vs Evidence** (resumen):

```
                Evidencia Alta    Evidencia Media    Evidencia Baja
Risk Alto        [Test rápido]     [Prioridad 1]      [CRÍTICO - Prioridad 0]
Risk Medio       [Monitorear]      [Prioridad 2]      [Prioridad 1]
Risk Bajo        [De-priorizar]    [Prioridad 3]      [Prioridad 2]
```

**Focus**: High risk / Low evidence (cuadrante crítico)

Para detalles completos de categorías, cuadrantes y acciones, consultar el template.

**Estrategia de fallo**: Si no se puede graficar la matriz por falta de assumptions, generar matriz vacía con placeholders y documentar en Preguntas abiertas.

## Fase D — Priorizar Assumptions y Sugerir Experimentos

Ordenar por:
1. Cuadrante crítico (high risk/low evidence) primero
2. Impacto en éxito del feature
3. Costo de experimento (menor costo primero)

**Top 3-5 assumptions** para focus inmediato.

Para cada assumption priorizado, sugerir experimento usando `references/experiment-types-by-assumption.md` como guía completa.

**Resumen por tipo de assumption**:
- **Desirability**: Customer interviews, fake door test, landing page A/B
- **Viability**: Pricing test, willingness-to-pay survey, competitor analysis
- **Feasibility**: Technical spike, prototype, proof of concept
- **Usability**: Usability test, prototype walkthrough, heuristic evaluation

**Por risk/evidence**:
- **High risk/Low evidence**: Experimento rápido (1-2 semanas)
- **High risk/Medium evidence**: Experimento moderado (2-4 semanas)
- **Medium risk/Low evidence**: Experimento ligero (1 semana)

Para detalles completos de duración, costo y consideraciones por tipo, consultar la referencia.

**Campo `spike-required` (gate de feasibility)**: para cada assumption priorizado, declarar un campo `spike-required: yes/no` que el orquestador (`orquestar-prd-workflow` Fase D.5.5) consume para decidir si dispara `construir-spike` antes de `validar-viabilidad-producto`:

- `spike-required: yes` cuando **bucket = feasibility** Y **risk ∈ {Alto, Medio}** Y **evidence ∈ {Baja, Media}**. En ese caso, añadir también `spike-question:` con la pregunta puntual de feasibility que el spike debe responder (ej: "¿Los agentes destino consumen stdout + archivo de handoff bajo la convención `.agents/`?").
- `spike-required: no` en caso contrario.

Esto frena el problema donde un assumption de feasibility de riesgo medio/baja evidencia queda enterrado porque el veredicto general de `validar-viabilidad-producto` es "Conditional Go" por demanda (no técnico). El orquestador filtra por `spike-required: yes` y dispara el spike antes de comprometer la mecánica en el PRD.

**Estrategia de fallo**: Si no se puede priorizar por falta de información, usar orden default (cuadrante crítico primero) y documentar en Preguntas abiertas.

## Fase G — Gate de Avance Condicionado (Preguntas Abiertas)

**Gate obligatorio.** Después de completar el análisis (Fases A–E) y antes de fijar el `Ready for` y escribir el documento final, ejecuta este gate. El documento **no está completo** hasta que Fase G se ejecuta y se documenta, incluso si todas las preguntas se resolvieron inline durante las Fases A/B/C/D.

**Principio**: Las preguntas abiertas no bloquean automáticamente el avance, pero el usuario debe ser alertado y tener la opción de responderlas antes de avanzar. El avance es **condicionado**, no automático. La alerta ocurre **antes de** fijar el `Ready for` y avanzar a `validar-viabilidad-producto`.

### Estados de avance

1. **Inventariar preguntas abiertas**: Reúne todas las preguntas generadas durante las Fases A, B, C y D, clasificadas por severidad (Crítico / Importante / Menor). Incluye también las preguntas que se resolvieron inline durante el análisis — el inventario debe reflejar todo lo que se identificó, con su estado de resolución.

2. **Clasificar el estado de avance**:
   - **Avance bloqueado**: Hay preguntas Críticas sin resolver → `Ready for: bloqueado`
   - **Avance condicionado**: Hay preguntas Importantes sin resolver → `Ready for: validar-viabilidad-producto (condicionado)`. Alerta al usuario con el inventario; ofrece responder ahora o avanzar con default conservador.
   - **Avance libre**: Solo hay preguntas Menores o todas las Críticas/Importantes están resueltas → `Ready for: validar-viabilidad-producto`

3. **Documentar la ejecución del gate**: Con independencia del resultado, añade al documento una subsección "Gate de avance (Fase G)" que registre:
   - Inventario de preguntas identificadas (críticas/importantes/menores) con su estado (resuelta inline / resuelta en gate / pendiente).
   - Si hubo alerta: confirma que se presentó al usuario y qué decidió.
   - Estado final de avance (bloqueado / condicionado / libre) que justifica el `Ready for`.

### Reglas

- **Nunca** omitir la alerta cuando hay preguntas Críticas o Importantes sin resolver.
- **Nunca** marcar `Ready for: validar-viabilidad-producto` (libre) si hay preguntas Importantes o Críticas sin resolver.
- **Nunca** omitir la subsección "Gate de avance (Fase G)" del documento — es la evidencia de que el gate se ejecutó.
- Las preguntas Menores no requieren alerta ni condicionan el avance; se documentan para seguimiento.
- Si todas las preguntas se resolvieron inline durante A/B/C/D, el gate sigue documentándose (inventario con estado "resuelta inline", avance libre) — el gate no se omite, se registra como ejecutado sin alerta necesaria.

### Ejemplo canónico — Gate con todas resueltas inline

```markdown
## Gate de avance (Fase G)

- **Inventario de preguntas identificadas**:
  - [Importante] ¿Hay evidencia de demanda real para el bucket desirability? — Estado: resuelta inline
  - [Menor] ¿Timeline del experimento sugerido en semanas o días? — Estado: resuelta inline
- **Alerta al usuario**: No necesaria — todas las Críticas/Importantes se resolvieron inline durante el análisis.
- **Estado final de avance**: Libre — `Ready for: validar-viabilidad-producto`
```

Para el flujo detallado del gate (formato de alerta, manejo de respuestas del usuario, herencia de preguntas pendientes en el siguiente skill, best practices), consultar `_shared/open-questions-template.md` sección "Integración con Ready For — Avance Condicionado".

## Fase E — Escribir Assumption Map

Estructura:

1. **Resumen ejecutivo**: Total assumptions, por bucket, críticos identificados
2. **Assumptions por bucket**: Lista completa con risk/evidence
3. **Matriz 2x2**: Visualización de risk vs evidence
4. **Assumptions priorizados**: Top 3-5 con orden, cada uno con campo `spike-required: yes/no` (y `spike-question:` cuando `yes`)
5. **Plan de experimentos**: Por assumption priorizado, tipo y timeline sugerido
6. **Ready for**: `validar-viabilidad-producto`

## Salida

Escribe en: `docs/<domain>/initiatives/<PRD-SLUG>/assumption-map.md`

**Header requerido** (al inicio del documento):
- [Req slug]
- Dominio
- Fecha
- Skill: mapear-assumptions
- Input: ruta del artefacto fuente

**Secciones requeridas**:
- Header requerido (al inicio del documento)
- Resumen ejecutivo (total assumptions, distribución por bucket)
- Assumptions por bucket (desirability, viability, feasibility, usability)
- Matriz 2x2 (risk vs evidence)
- Assumptions priorizados (top 3-5) con campo `spike-required: yes/no` por assumption (y `spike-question:` cuando `yes`)
- Plan de experimentos (tipo, timeline, por assumption)
- Autoevaluación (checklist de validación)
- Gate de avance (Fase G) — **obligatoria** incluso si todas las preguntas se resolvieron inline
- Ready for (`validar-viabilidad-producto`, `blocked`) con link relativo al siguiente artefacto

Ready for valores (con link relativo al siguiente artefacto):
- `validar-viabilidad-producto`: Assumptions mapeados, proceder a validación de viabilidad. Link: `product-viability.md`
- `blocked`: Assumptions críticos no identificados, necesita más contexto

## Autoevaluación

Después de completar el mapeo de assumptions, valida:

1. Assumptions identificados en los 4 buckets
2. Risk evaluado correctamente (alto/medio/bajo)
3. Evidence evaluada correctamente (alta/media/baja)
4. Matriz 2x2 generada correctamente
5. Assumptions priorizados por cuadrante crítico
6. Experimentos sugeridos apropiados por tipo
7. Plan de experimentos accionable
8. **Campo `spike-required` declarado por assumption priorizado** (y `spike-question:` cuando `yes`) — el orquestador lo consume para disparar spikes de feasibility antes de `validar-viabilidad-producto`
9. Definición correcta del "Ready for"
10. Documento de salida accionable

Si alguna respuesta es "No", revisa y completa antes de marcar el skill como terminado.

## Preguntas Abiertas

Documenta cualquier información faltante que requiera aclaración:

- Si el requerimiento no tiene suficiente información para identificar assumptions específicos
- Si no hay data o evidencia para evaluar risk/evidence
- Si el dominio del requerimiento es desconocido para el framework de David Bland
- Si no se pueden sugerir experimentos apropiados por falta de contexto

Estas preguntas deben resolverse antes de proceder a validar-viabilidad-producto.
