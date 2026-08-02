---
name: priorizar-roadmap
description: >-
  Prioriza funcionalidades o features puente usando metodología RICE (Reach,
  Impact, Confidence, Effort). Genera roadmap priorizado con ranking y
  recomendación de implementación. Salida: feature-prioritization.md. Úsalo
  después de evaluar-alcance-idea o evaluar-conectividad-tecnica.
---

# Priorizador de Roadmap

Prioriza funcionalidades o features puente usando metodología RICE (Reach, Impact, Confidence, Effort). Genera roadmap priorizado con ranking claro y recomendación de implementación basada en valor vs esfuerzo.

Solo análisis y planificación: no implementa, no modifica código. Prepara el roadmap para selección de siguiente item.

## Fase 0 — Resolver entrada

Requerido: `SCOPE-ROADMAP-RUTA` o `BRIDGE-ROADMAP-RUTA`.

Infiere desde:
- Ruta: `docs/**/idea/*-scope-roadmap.md` (para funcionalidades)
- Ruta: `docs/**/initiatives/**/bridge-roadmap.md` (para features puente)
- Contenido pegado: si el usuario pega el roadmap

Pregunta cuando falta: "¿Qué roadmap priorizo? (ruta del scope-roadmap o bridge-roadmap)"

Declara inputs resueltos: roadmap leído.

## Fase A — Leer Roadmap

Lee el roadmap y extrae:
- Lista de funcionalidades o features puente
- Alcance de cada item
- Value proposition de cada item
- Timeline estimado de cada item
- Dependencias entre items

**Short-circuit N=1 (path lite)**: si `scope-roadmap.md` declara "funcionalidad única" (N=1 item priorizable), la priorización es trivial — un solo item no se ranquea. En ese caso, emite un **stub** en vez del roadmap ranqueado completo:

```
# Feature Prioritization: <IDEA-SLUG>
## Veredicto: Funcionalidad única — sin priorización
- Items totales: 1
- Items priorizables: 1
- Score RICE registrado como sanity check: <score> (Reach=<r>, Impact=<i>, Confidence=<c>, Effort=<e>)
- Justificación del sanity check: <1-2 líneas>
- Ready for: evaluar-conectividad-tecnica
```

Calcula el score RICE del único item como sanity check (para trazabilidad), pero **no** generes tabla de roadmap ranqueado ni matriz de dependencias. Salta a Fase E (Ready for) y Fase G (gate). Esto reduce ceremonia para MVPs dogfooding/internal donde N=1 es común.

## Fase B — Calcular Score RICE

Para cada item del roadmap, calcula score RICE:

**RICE = (Reach × Impact × Confidence) / Effort**

**Reach (Alcance)**:
- Cuántos usuarios impactará este item en un periodo (ej: 1 mes)
- Escala: 1 (pocos usuarios) a 10 (muchos usuarios)
- Ejemplo: "Alertas de inactividad" → Reach: 8 (impacta 80% de usuarios activos)

**Impact (Impacto)**:
- Cuánto impacto tendrá en el objetivo principal (ej: retención, revenue)
- Escala: 0.25 (mínimo) a 3 (masivo)
- Ejemplo: "Alertas de inactividad" → Impact: 2 (alto impacto en retención)

**Confidence (Confianza)**:
- Qué tan confiado estamos en las estimaciones de Reach e Impact
- Escala: 50% (baja confianza) a 100% (alta confianza)
- Ejemplo: "Alertas de inactividad" → Confidence: 80% (data histórica disponible)

**Effort (Esfuerzo)**:
- Cuánto esfuerzo requerirá este item (en persona-meses)
- Escala: 1 (poco esfuerzo) a 10 (mucho esfuerzo)
- Ejemplo: "Alertas de inactividad" → Effort: 3 (2-3 semanas)

**Cálculo de ejemplo**:
- RICE = (8 × 2 × 0.8) / 3 = 12.8 / 3 = 4.27

## Fase C — Ajustar por Dependencias

Ajusta el ranking considerando dependencias:
- Items con dependencias no cumplidas se marcan como "Bloqueados"
- Items bloqueados no se priorizan hasta que dependencias se cumplan
- Si hay items con scores similares pero uno desbloquea otros, darle prioridad

## Fase D — Generar Roadmap Priorizado

Usa el template en `assets/prioritized-roadmap-template.md` y rellena con:

**Resumen de priorización**:
- Metodología: RICE (Reach × Impact × Confidence / Effort)
- Items totales: X
- Items bloqueados: Y
- Items priorizables: Z

**Roadmap priorizado**:

Para cada item (ordenado por score RICE descendente):
- **Rank**: #1, #2, #3...
- **Nombre**: Identificador del item
- **Score RICE**: Valor calculado
- **Reach**: [Valor + justificación]
- **Impact**: [Valor + justificación]
- **Confidence**: [Valor + justificación]
- **Effort**: [Valor + justificación]
- **Estado**: Priorizable / Bloqueado
- **Dependencias**: [Lista si aplica]
- **Recomendación**: Implementar ahora / Esperar dependencias

**Recomendación de implementación**:
- Item prioritario: [Item #1]
- Justificación: [Por qué este item]
- Next step: `evaluar-conectividad-tecnica` para este item (verifica prerequisitos antes de capturar el requerimiento)

## Fase E — Definir Ready For

**Si hay items priorizables**:
- `Ready for: evaluar-conectividad-tecnica` con el item más prioritario
- Incluye ruta relativa del siguiente artefacto esperado (ej: `docs/<domain>/initiatives/<PRD-SLUG>/connectivity/prerequisites-assessment.md`)

**Si todos los items están bloqueados**:
- `Ready for: blocked` con lista de dependencias faltantes

**Si la información es insuficiente**:
- `Ready for: blocked` con preguntas abiertas

## Fase G — Gate de Avance Condicionado (Preguntas Abiertas)

**Gate obligatorio.** Después de completar el análisis (Fases A–E) y antes de fijar el `Ready for` y escribir el documento final, ejecuta este gate. El documento **no está completo** hasta que Fase G se ejecuta y se documenta, incluso si todas las preguntas se resolvieron inline durante las Fases B/C/D.

**Principio**: Las preguntas abiertas no bloquean automáticamente el avance, pero el usuario debe ser alertado y tener la opción de responderlas antes de avanzar. El avance es **condicionado**, no automático. La alerta ocurre **antes de** fijar el `Ready for` y avanzar a `evaluar-conectividad-tecnica`.

### Estados de avance

1. **Inventariar preguntas abiertas**: Reúne todas las preguntas generadas durante las Fases B, C y D, clasificadas por severidad (Crítico / Importante / Menor). Incluye también las preguntas que se resolvieron inline durante el análisis — el inventario debe reflejar todo lo que se identificó, con su estado de resolución.

2. **Clasificar el estado de avance**:
   - **Avance bloqueado**: Hay preguntas Críticas sin resolver → `Ready for: bloqueado`
   - **Avance condicionado**: Hay preguntas Importantes sin resolver → `Ready for: evaluar-conectividad-tecnica (condicionado)`. Alerta al usuario con el inventario; ofrece responder ahora o avanzar con default conservador.
   - **Avance libre**: Solo hay preguntas Menores o todas las Críticas/Importantes están resueltas → `Ready for: evaluar-conectividad-tecnica`

3. **Documentar la ejecución del gate**: Con independencia del resultado, añade al documento una subsección "Gate de avance (Fase G)" que registre:
   - Inventario de preguntas identificadas (críticas/importantes/menores) con su estado (resuelta inline / resuelta en gate / pendiente).
   - Si hubo alerta: confirma que se presentó al usuario y qué decidió.
   - Estado final de avance (bloqueado / condicionado / libre) que justifica el `Ready for`.

### Reglas

- **Nunca** omitir la alerta cuando hay preguntas Críticas o Importantes sin resolver.
- **Nunca** marcar `Ready for: evaluar-conectividad-tecnica` (libre) si hay preguntas Importantes o Críticas sin resolver.
- **Nunca** omitir la subsección "Gate de avance (Fase G)" del documento — es la evidencia de que el gate se ejecutó.
- Las preguntas Menores no requieren alerta ni condicionan el avance; se documentan para seguimiento.
- Si todas las preguntas se resolvieron inline durante B/C/D, el gate sigue documentándose (inventario con estado "resuelta inline", avance libre) — el gate no se omite, se registra como ejecutado sin alerta necesaria.

### Ejemplo canónico — Gate con todas resueltas inline

```markdown
## Gate de avance (Fase G)

- **Inventario de preguntas identificadas**:
  - [Importante] ¿Reach debe medirse en usuarios activos o totales? — Estado: resuelta inline
  - [Menor] ¿Escala de Confidence en 50%-100% o 0-100%? — Estado: resuelta inline
- **Alerta al usuario**: No necesaria — todas las Críticas/Importantes se resolvieron inline durante el análisis.
- **Estado final de avance**: Libre — `Ready for: evaluar-conectividad-tecnica`
```

Para el flujo detallado del gate (formato de alerta, manejo de respuestas del usuario, herencia de preguntas pendientes en el siguiente skill, best practices), consultar `_shared/open-questions-template.md` sección "Integración con Ready For — Avance Condicionado".

## Salida

Escribe en: `docs/<domain>/idea/<IDEA-SLUG>/feature-prioritization.md`

**Header requerido** (al inicio del documento):
- Idea slug
- Dominio
- Fecha
- Skill: priorizar-roadmap
- Input: ruta del artefacto fuente (scope-roadmap o bridge-roadmap)

**Secciones requeridas**:
- Header requerido
- Resumen de priorización (metodología, items totales, bloqueados, priorizables)
- Roadmap priorizado (items ordenados por score RICE con desglose)
- Recomendación de implementación
- Notas de escala usadas
- Autoevaluación (checklist de validación)
- Gate de avance (Fase G) — **obligatoria** incluso si todas las preguntas se resolvieron inline
- Ready for

**Notas de escala usadas**:
Documenta las escalas aplicadas para RICE:
- Reach: 1-10 (1 = pocos usuarios, 10 = muchos usuarios)
- Impact: 0.25-3 (0.25 = mínimo, 3 = masivo)
- Confidence: 50%-100% (50% = baja confianza, 100% = alta confianza)
- Effort: 1-10 (1 = poco esfuerzo, 10 = mucho esfuerzo)

**Autoevaluación (checklist de validación)**:
- [ ] Cálculo correcto de scores RICE
- [ ] Justificación adecuada para cada componente (Reach, Impact, Confidence, Effort)
- [ ] Ajuste correcto por dependencias
- [ ] Ranking lógico basado en valor vs esfuerzo
- [ ] Identificación de items bloqueados
- [ ] Recomendación de implementación clara
- [ ] Definición correcta del "Ready for"
- [ ] Documento de salida accionable

Ready for valores:
- `evaluar-conectividad-tecnica`: Roadmap priorizado, proceder a evaluar conectividad del item más prioritario antes de capturar requerimiento
- `blocked`: Todos los items bloqueados o información insuficiente

En la sección Ready for, incluye la ruta relativa del siguiente artefacto esperado (ej: `docs/<domain>/initiatives/<PRD-SLUG>/connectivity/prerequisites-assessment.md`).

## Autoevaluación

Después de completar la priorización, usa el checklist en `references/autoevaluacion-checklist.md` para validar:

1. Cálculo correcto de scores RICE
2. Justificación adecuada para cada componente (Reach, Impact, Confidence, Effort)
3. Ajuste correcto por dependencias
4. Ranking lógico basado en valor vs esfuerzo
5. Identificación de items bloqueados
6. Recomendación de implementación clara
7. Definición correcta del "Ready for"
8. **Path lite**: si N=1, se emitió stub (no roadmap ranqueado) con score RICE como sanity check
9. Documento de salida accionable

Si alguna respuesta es "No", revisa y completa antes de marcar el skill como terminado.
