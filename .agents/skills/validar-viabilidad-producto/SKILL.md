---
name: validar-viabilidad-producto
description: >-
  Valida viabilidad de un requerimiento de producto: alineación con visión,
  demanda real, recursos disponibles, riesgo negocio. Salida:
  docs/<domain>/initiatives/<PRD-SLUG>/product-viability.md con go/no-go. Gate
  de aprobación antes de proceder a definir usuarios. Úsalo para decidir si
  invertir tiempo en PRD o rechazar idea.
---

# Validador de Viabilidad de Producto

Valida si un requerimiento de producto es viable: estrategia, demanda, recursos, riesgo. Gate de go/no-go antes de gastar tiempo en PRD completo.

Solo análisis: no aprueba finalmente. Genera recomendación para stakeholders.

## Fase 0 — Resolver entrada

Requerido: `REQ-SLUG` o `REQUIREMENTS-RUTA`.

Infiere desde:
- Ruta: `docs/**/initiatives/**/requirements.md`
- Contenido pegado: si usuario pega requerimiento capturado
- Requerimiento previo: busca archivo más reciente de `*-requirements.md`
- Existente: busca `docs/**/initiatives/**/product-viability.md` para reanudar/actualizar una validación previa

Pregunta cuando falta: "¿Qué requerimiento valido? (ruta o slug)"

Declara inputs resueltos: requerimiento, restricciones leídas.

## Fase A — Validar Alineación Estratégica

¿Encaja con visión/roadmap de producto?

```
### Criterios de Alineación

1. **Visión de Producto**
   - ¿Esta feature es consistent con dirección de producto?
   - ¿Mueve un norte explícito de la compañía?
   
   Ejemplo ✅: "Retención de usuarios es core de Q3 roadmap"
   Ejemplo ❌: "Nice-to-have, no en roadmap"

2. **Core vs Nice-to-Have**
   - Core: Resuelve pain point crítico, users pagan por esto
   - Nice-to-have: Feature agradable pero no crítica
   
   Veredicto: ¿En cuál categoría cae?

3. **Oportunidad vs Distracción**
   - ¿Esta feature mantiene foco o lo dispersa?
   - ¿Hay feature más importante compitiendo por recursos?
   
   Análisis: Comparar contra roadmap actual
```

## Fase B — Validar Demanda Real

¿Hay evidencia de que usuarios realmente necesitan esto?

```
### Validación de Demanda

**Para MVP o Early Stage** (< 1000 usuarios, < 3 meses):
- ✅ Feedback directo de usuarios (mínimo 5-10)
- ✅ Support tickets mencionando este problema
- ✅ Churn analysis (¿causa de abandono?)
- ✅ User interviews (cualitativo)
- ❌ NO usar: A/B tests (muestra muy pequeña), Surveys (sesgadas)

**Para Growth Stage** (1K-10K usuarios, 3-12 meses):
- ✅ Support tickets + trending
- ✅ Surveys con mínimo 50 respuestas
- ✅ Telemetría (users clicking "request feature"?)
- ✅ NPS/CSAT comments mencionando pain point
- ⚠️ A/B test landing page si es risky

**Para Scale** (10K+ usuarios, 1+ años):
- ✅ A/B tests con landing page
- ✅ Cohort analysis (retención impact)
- ✅ Surveys con 100+ respuestas
- ✅ Competitive analysis (market size)

**Matriz: Estado × Validación**

| Estado | Mínimo Evidencia | Deseable |
|--------|-----------------|----------|
| MVP | 5+ user interviews | + Support tickets |
| Growth | Support tickets + 50 surveys | + Telemetría |
| Scale | A/B landing page | + Cohort analysis |
```

## Fase C — Validar Recursos

¿Tenemos recursos para hacerlo bien?

```
### Checklist de Recursos

**Equipo**:
- Backend devs: ¿Cantidad? ¿Disponibilidad?
- Frontend devs: ¿Cantidad? ¿Disponibilidad?
- QA: ¿Existe? ¿Puede hacer testing?
- Product: ¿Owner asignado? ¿Tiempo disponible?

**Tiempo**:
- Estimación inicial: [Pedir a architects]
- Timeline requerido: [De requerimiento]
- Buffer: ¿Hay margen? (típico: +30%)
- Competencia: ¿Hay features más importantes?

**Infraestructura**:
- ¿Necesita new tech stack? (aprobado?)
- ¿Integración con sistemas existentes? (documentado?)
- ¿Cambios de DB schema? (reversible?)

**Veredicto**:
- ✅ Recursos suficientes
- ⚠️ Resources tight (factible pero riesgoso)
- ❌ Recursos insuficientes (rechazar o postpone)
```

## Fase D — Validar Riesgo de Negocio

¿Cuál es el downside si falla?

```
### Matriz de Riesgo

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| **Technical risk** | | | |
| New tech unknown | Media | Medio | Spike técnico |
| Legacy code complexity | Alta | Bajo | Refactor previo |
| Integration failure | Baja | Alto | Integration tests |
| **Business risk** | | | |
| User adoption < 20% | Media | Medio | Start with MVP |
| Competitor ships first | Baja | Alto | Acelerar timeline |
| Regulatory compliance | Baja | Crítico | Legal review |
| **Opportunity risk** | | | |
| Feature becomes irrelevant | Baja | Crítico | User validation |
| Market shift | Baja | Alto | Monitor trends |

**Veredicto**: Riesgo total = ¿Aceptable para compañía?
- ✅ Riesgo bajo/manejable
- ⚠️ Riesgo medio (proceder con caution)
- ❌ Riesgo alto (reconsiderar)
```

## Fase E — Generar Veredicto

```
### Go/No-Go Decision Matrix

| Criterio | Status | Weight |
|----------|--------|--------|
| Alineación estratégica | ✅ Aligned | 25% |
| Validación demanda | ✅ Validated (5+ users) | 25% |
| Recursos disponibles | ✅ Suficientes | 25% |
| Riesgo manejable | ✅ Low-Medium | 25% |

**SCORE**: 100% → ✅ GO
**Veredicto**: Proceder a definir usuarios

---

**CASO 2: Partial Go**

| Criterio | Status | Weight |
|----------|--------|--------|
| Alineación estratégica | ✅ Aligned | 25% |
| Validación demanda | ⚠️ Weak (2 users) | 25% |
| Recursos disponibles | ⚠️ Tight (backend only 50%) | 25% |
| Riesgo manejable | ⚠️ Medium | 25% |

**SCORE**: 75% → ⚠️ CONDITIONAL GO
**Veredicto**: Proceder CON:
- Spike técnico (2 semanas)
- Validación adicional (5+ more user interviews)
- Recursos confirmados

---

**CASO 3: No-Go**

| Criterio | Status | Weight |
|----------|--------|--------|
| Alineación estratégica | ❌ Off-roadmap | 25% |
| Validación demanda | ❌ No evidence | 25% |
| Recursos disponibles | ❌ Team fully committed | 25% |
| Riesgo manejable | ❌ High regulatory risk | 25% |

**SCORE**: 0% → ❌ NO-GO
**Veredicto**: Rechazar o Postpone
**Razones**: Off-roadmap, validación débil, recursos no disponibles
```

## Fase F — Escribir Validación

Estructura:

1. **Resumen ejecutivo**: Go/No-Go + rationale
2. **Alineación Estratégica**: ¿Encaja con visión?
3. **Validación de Demanda Real**: Evidencia nivel-apropiada
4. **Disponibilidad de Recursos**: Equipo, tiempo, tech
5. **Análisis de Riesgo**: Técnico, negocio, oportunidad
6. **Veredicto final**: Go/Conditional Go/No-Go
7. **Condiciones (si Conditional)**: Qué debe resolverse
8. **Ready for**: `definir-usuarios` o `blocked` (con ruta relativa del siguiente artefacto)

## Salida

Escribe en: `docs/<domain>/initiatives/<PRD-SLUG>/product-viability.md`

**Header requerido** (al inicio del documento):
- Req slug
- Dominio
- Fecha
- Skill: validar-viabilidad-producto
- Input: ruta del artefacto fuente (requirements.md)
- Stage (MVP/Growth/Scale, cuando aplique)

**Secciones requeridas**:
- Header requerido
- 1. Resumen ejecutivo (Go/No-Go)
- 2. Alineación Estratégica
- 3. Validación de Demanda Real (estado-apropiada)
- 4. Disponibilidad de Recursos
- 5. Matriz de Riesgo
- 6. Veredicto Final (con score)
- 7. Condiciones si Conditional Go
- Autoevaluación (checklist de validación)
- Ready for (`definir-usuarios`, `blocked`, `spike`)

**Autoevaluación (checklist de validación)**:
- [ ] Alineación estratégica evaluada contra visión/roadmap explícito
- [ ] Demanda validada con evidencia apropiada al stage (MVP/Growth/Scale)
- [ ] Recursos (equipo, tiempo, infraestructura) verificados
- [ ] Riesgos técnicos, de negocio y de oportunidad mapeados
- [ ] Score calculado y veredicto (Go/Conditional Go/No-Go) justificado
- [ ] Condiciones de Conditional Go listadas y accionables
- [ ] Ready for definido correctamente
- [ ] Documento de salida accionable para stakeholders

Ready for valores:
- `definir-usuarios`: Go approved, proceder a definir personas
- `blocked`: No-Go o Conditional Go con condiciones críticas no resueltas
- `spike`: Conditional Go, necesita spike técnico primero

En la sección Ready for, incluye la ruta relativa del siguiente artefacto esperado (ej: `docs/<domain>/initiatives/<PRD-SLUG>/personas-mapping.md`).

---

## Nota Importante

**Este es un gate binario**:
- ✅ Go: Procede a PRD (invierte tiempo)
- ❌ No-Go: Rechaza idea sin gastar recursos
- ⚠️ Conditional Go: Resuelve condiciones, luego decide

**Objetivo**: Filtrar ideas temprano, evitar PRDs de features que no deberían hacerse.
