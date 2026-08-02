---
name: validar-viabilidad-tecnica
description: >-
  Valida viabilidad técnica de un epic o PRD contra el codebase actual
  identificando deuda técnica bloqueante, construcciones nuevas necesarias y
  precedentes. Salida: docs/<domain>/<EPIC-SLUG>-viability-assessment.md.
  Úsalo cuando el usuario pida validar, evaluar, auditar o revisar viabilidad
  técnica. No lo usas para generar documentación arquitectónica (usar
  generar-arquitectura) ni para dividir epics en tareas (usar dividir-epic).
---

# Validador de Viabilidad Técnica

Valida que un epic o PRD sea factible técnicamente. Identifica deuda técnica bloqueante, componentes faltantes, y construcciones nuevas necesarias. Úsalo como gate entre planificar-desde-prd y dividir-epic.

Solo análisis: no implementa, no modifica código. Detecta riesgos técnicos temprano.

## Fase 0 — Resolver entrada

Requerido: `EPIC-PLAN-RUTA` o `PRD-RUTA`.

Infiere desde:
- Ruta: `docs/**/<EPIC-SLUG>-epic-plan.md` o `docs/**/*prd*.md`
- Contenido pegado: si el usuario pega el plan o PRD
- Epic plan previo: busca el archivo más reciente de `*-epic-plan.md`

Pregunta cuando falta: "¿Qué epic o PRD valido? (ruta del plan o PRD)"

Declara inputs resueltos: épics, AC técnicos, dependencias.

## Fase A — Cargar Epic y Analizar Codebase

1. Lee el plan de épics: qué se construye, tecnologías implicadas, integraciones externas
2. Analiza el codebase actual:
   - `find` por componentes relacionados: "auth*", "payment*", "user*"
   - `grep` por patrones existentes (ej: "JWT", "OAuth", "Queue")
   - Identifica la arquitectura actual (monolito, microservicios, etc.)
3. Mapea **precedentes**: features similares ya implementadas
4. Detecta **deuda técnica conocida**: `TODO`, `FIXME`, `deprecated`, código legacy

## Fase B — Validar Construcciones Nuevas

Para cada epic, pregunta: "¿Existe este componente?"

Usa el template de tabla de componentes: `references/component-analysis-table.md`

Aplica la regla de evaluación del template para clasificar riesgos.

## Fase C — Identificar Deuda Técnica Bloqueante

Para cada epic, identifica **deuda técnica que bloquea**:

```
### Epic: [Nombre]

**Deuda técnica bloqueante**:
- Legacy auth system no soporta 2FA
  - Impacto: Imposible implementar 2FA sin refactor previo
  - Esfuerzo estimado: 1-2 semanas
  - Recomendación: Agregar como epic previo
  
- Database schema sin partition (1B+ rows)
  - Impacto: Queries lentas en nueva feature
  - Esfuerzo: 3-4 semanas
  - Recomendación: Particionar antes del epic principal

**Deuda técnica no bloqueante** (puede dejarse):
- Old logging system (funciona pero deprecated)
- Legacy client SDK (remplazado pero aún en uso)
```

## Fase D — Validar Estimaciones contra Precedentes

Busca features similares ya hechas:

```
### Comparativa: Este epic vs precedentes

**Epic nuevo: "User Profile V2"**
- Estimación: M (4 puntos)

**Precedente 1: "Organization Profile" (hace 6 meses)**
- Complejidad: Similar
- Esfuerzo real: 2 semanas
- Issues encontrados: Schema migration complexity

**Precedente 2: "Team Profile" (hace 2 meses)**
- Complejidad: Idéntica
- Esfuerzo real: 10 días
- Issues: Caching strategy no escala

**Recomendación**:
- Estimación actual: M (4 pts, ~2 semanas)
- Ajuste por deuda: +1 pt por schema complexity
- Estimación revisada: M-L (5 pts, 2.5-3 semanas)
```

## Fase E — Detectar Brechas de Infraestructura

¿Necesita el epic infraestructura nueva?

Usa el template de tabla de infraestructura: `references/infrastructure-analysis-table.md`

Documenta bloqueantes detectados y recomienda ajuste de timeline según el template.

## Fase F — Validar Compatibilidad con Arquitectura Actual

¿Encaja el epic en la arquitectura actual?

```
### Análisis de compatibilidad arquitectónica

**Arquitectura actual**: Monolito Rails + React frontend

**Epic propuesto**: "Integrar Stripe payment processor"
- Requiere: Webhook handling, idempotency, reconciliation
- Compatible con monolito: ✅ Sí, agregar módulo payment
- Escalabilidad: ⚠️ Monolito crecerá 15% en código
- Alternativa: Microservicio separado (riesgo más alto)

**Recomendación**: Implementar como módulo en monolito actual, considerar microservicio en v2.
```

## Fase G — Validar Limitaciones Técnicas Conocidas

¿Hay limitaciones del sistema que afecten?

Usa el template de tabla de riesgos: `references/risk-table-template.md`

Documenta limitaciones técnicas como riesgos con su mitigación y esfuerzo.

## Fase H — Escribir Validación de Viabilidad

Estructura:

1. **Resumen ejecutivo**: Epic es viable. Bloqueadores: 0 críticos, 2 mayores. Timeline ajustado: +3 semanas.
2. **Construcciones nuevas vs reutilización**: Tabla de componentes
3. **Deuda técnica bloqueante**: Lista priorizada
4. **Comparativa con precedentes**: Estimaciones ajustadas
5. **Infraestructura requerida**: Setup timeline
6. **Compatibilidad arquitectónica**: Encaja o requiere refactor
7. **Limitaciones técnicas**: Mitigaciones necesarias
8. **Riesgos técnicos**: Alto/Medio/Bajo y mitigation
9. **Recomendaciones prácticas**: Qué hacer antes de empezar
10. **Timeline impacto**: Original vs ajustado con bloqueadores
11. **Preguntas abiertas**: Clarificaciones técnicas necesarias
12. **Ready for**: `dividir-epic` (viable), `blocked` (no viable), `spike` (unknowns)

## Salida

Escribe en: `docs/<domain>/<EPIC-SLUG>-viability-assessment.md`

**Secciones requeridas**:
- Resumen ejecutivo
- Construcciones nuevas identificadas
- Deuda técnica bloqueante (priorizada)
- Comparativa con precedentes
- Infraestructura requerida
- Compatibilidad arquitectónica
- Limitaciones técnicas y mitigaciones
- Riesgos técnicos
- Recomendaciones accionables
- Timeline impacto (original vs ajustado)
- Preguntas abiertas
- Ready for (`dividir-epic`, `spike`, `blocked`)

Ready for valores:
- `dividir-epic`: Epic es viable, proceder a desglose de tareas
- `spike`: Unknowns técnicos, necesita spike exploratorio primero
- `blocked`: Deuda técnica bloqueante imposible de resolver, epic no viable ahora

## Autoevaluación

Después de completar la validación de viabilidad, responde estas preguntas:

1. **¿Identifiqué todos los componentes requeridos?**
   - [ ] Sí, cada epic tiene su tabla de componentes completa
   - [ ] No, faltan componentes por identificar

2. **¿Documenté la deuda técnica bloqueante?**
   - [ ] Sí, lista priorizada con impacto y esfuerzo
   - [ ] No, deuda técnica no documentada o incompleta

3. **¿Validé estimaciones contra precedentes?**
   - [ ] Sí, comparé con features similares y ajusté estimaciones
   - [ ] No, no encontré precedentes o no ajusté estimaciones

4. **¿Detecté brechas de infraestructura?**
   - [ ] Sí, tabla completa con bloqueantes identificados
   - [ ] No, infraestructura no evaluada

5. **¿Validé compatibilidad arquitectónica?**
   - [ ] Sí, analicé encaje en arquitectura actual
   - [ ] No, compatibilidad no evaluada

6. **¿Documenté riesgos técnicos con mitigación?**
   - [ ] Sí, tabla de riesgos completa con acciones concretas
   - [ ] No, riesgos no documentados o sin mitigación

7. **¿El "Ready for" es correcto?**
   - [ ] `dividir-epic`: Epic viable sin bloqueadores críticos
   - [ ] `spike`: Unknowns técnicos requieren investigación
   - [ ] `blocked`: Deuda técnica bloqueante imposible de resolver

8. **¿El documento de salida es accionable?**
   - [ ] Sí, contiene recomendaciones prácticas y timeline ajustado
   - [ ] No, falta claridad en next steps

Si alguna respuesta es "No", revisa y completa antes de marcar el skill como terminado.
