# Template: Matriz de Decisión con Weights

Template para estructurar decisiones de go/no-go con criterios ponderados.

## Estructura Básica

La matriz de scoring va en tabla (celdas cortas ≤50 chars). Las justificaciones van en lista debajo de la tabla, no en celdas — la prosa explicativa supera los 50 chars y degrada la legibilidad de la tabla.

**Reglas de formato (no opcionales)**:

- La tabla tiene **exactamente 4 columnas**: `Criterio | Status | Weight | Score`. No añadas una 5ª columna `Justificación` a la tabla — las justificaciones van en lista debajo.
- `Status` usa **texto**, no emojis: `Pass` / `Partial` / `Fail` (o `Sí` / `Parcial` / `No`). No uses `✅` / `⚠️` / `❌`.

| Criterio | Status | Weight | Score |
| ---------- | -------- | -------- | ------- |
| Criterio 1 | Pass / Partial / Fail | 25% | 25% / 12.5% / 0% |
| Criterio 2 | Pass / Partial / Fail | 25% | 25% / 12.5% / 0% |
| Criterio 3 | Pass / Partial / Fail | 25% | 25% / 12.5% / 0% |
| Criterio 4 | Pass / Partial / Fail | 25% | 25% / 12.5% / 0% |

**Justificaciones** (una por criterio, en lista):

- **Criterio 1**: Por qué este status
- **Criterio 2**: Por qué este status
- **Criterio 3**: Por qué este status
- **Criterio 4**: Por qué este status

**Total Score**: Suma de scores (0-100%)
**Recomendación**: Go / Conditional Go / No-Go

## Sistema de Scoring

### Status Values

**Pass**: Criterio completamente cumplido

- Score: 100% del weight asignado
- Evidencia clara y convincente
- Sin reservas significativas

**Partial**: Criterio parcialmente cumplido

- Score: 50% del weight asignado
- Evidencia incompleta o ambigua
- Requiere aclaración o mitigación

**Fail**: Criterio no cumplido

- Score: 0% del weight asignado
- Evidencia insuficiente o contraria
- Bloquea o requiere cambios significativos

### Weight Assignment

**Weights típicos**:

- **25% cada uno**: Para 4 criterios igualmente importantes
- **30/20/20/30**: Para criterios con diferente importancia
- **40/30/20/10**: Para criterios muy desiguales

**Reglas de weight**:

- Suma debe ser 100%
- Criterios críticos deben tener weight ≥ 25%
- Criterios "nice-to-have" pueden tener weight ≤ 15%

## Umbrales de Decisión

### Go (Proceeder)

**Score**: ≥ 80%
**Condiciones**:

- La mayoría de criterios Pass
- Máximo 1 criterio Partial
- Ningún criterio crítico Fail

**Acción**: Proceder al siguiente paso del workflow

### Conditional Go (Proceeder con condiciones)

**Score**: 50-79%
**Condiciones**:

- Mezcla de Pass y Partial
- 1-2 criterios Fail pero no críticos
- Conditions identificadas y mitigables

**Acción**: Resolver condiciones antes de proceder o proceder con mitigaciones

### No-Go (No proceder)

**Score**: < 50%
**Condiciones**:

- Múltiples criterios Fail
- Al menos 1 criterio crítico Fail
- Score muy bajo (< 25%)

**Acción**: Rechazar idea, posponer, o requerir cambios significativos

## Ejemplos por Contexto

### Para Gates de Discovery (analizar-idea)

| Criterio | Status | Weight | Score |
| ---------- | -------- | -------- | ------- |
| Resultado claro | Pass | 25% | 25% |
| Alineación estratégica | Pass | 25% | 25% |
| Urgencia | Partial | 25% | 12.5% |
| Recursos básicos | Pass | 25% | 25% |

**Justificaciones**:

- **Resultado claro**: Resultado definido sin mencionar solución
- **Alineación estratégica**: Alineado con roadmap Q3
- **Urgencia**: No hay deadline externo pero es importante
- **Recursos básicos**: Equipo disponible, tech stack compatible

**Total**: 87.5% → **Go**

### Para Gates de Viabilidad (validar-viabilidad-producto)

| Criterio               | Status  | Weight | Score |
|------------------------|---------|--------|-------|
| Alineación estratégica | Pass    | 25%    | 25%   |
| Validación demanda     | Partial | 25%    | 12.5% |
| Recursos disponibles   | Pass    | 25%    | 25%   |
| Riesgo manejable       | Partial | 25%    | 12.5% |

**Justificaciones**:

- **Alineación estratégica**: Core de roadmap actual
- **Validación demanda**: Solo 2 user interviews, necesita más
- **Recursos disponibles**: Equipo confirmado para Q3
- **Riesgo manejable**: Riesgo técnico medio, requiere spike

**Total**: 75% → **Conditional Go** (con spike técnico + más user interviews)

### Para Gates de Calidad (revisar-cambios-locales)

| Criterio         | Status  | Weight | Score |
|------------------|---------|--------|-------|
| Funcionalidad    | Pass    | 30%    | 30%   |
| Tests            | Partial | 20%    | 10%   |
| Documentación    | Fail    | 20%    | 0%    |
| Breaking changes | Pass    | 30%    | 30%   |

**Justificaciones**:

- **Funcionalidad**: Implementación correcta de AC
- **Tests**: Tests presentes pero coverage < 80%
- **Documentación**: Docstrings faltantes en funciones nuevas
- **Breaking changes**: Sin breaking changes

**Total**: 70% → **Conditional Go** (agregar docstrings antes de merge)

## Customización por Contexto

### Para Features de Alta Prioridad

**Weights**: Más énfasis en alineación estratégica (35%) y recursos (30%)
**Umbrales**: Go ≥ 75% (más tolerancia a partials dado la prioridad)

### Para Features de Bajo Riesgo

**Weights**: Más énfasis en recursos (40%) y riesgo (30%)
**Umbrales**: Go ≥ 85% (más conservador dado el bajo riesgo)

### Para Features Experimentales

**Weights**: Más énfasis en validación de demanda (35%) y riesgo (35%)
**Umbrales**: Go ≥ 70% (más tolerancia dado el carácter experimental)

## Cómo Usar este Template

1. **Definir criterios**: Identificar 3-5 criterios relevantes para el contexto
2. **Asignar weights**: Distribuir 100% según importancia relativa
3. **Evaluar cada criterio**: Determinar status (Pass/Partial/Fail) con evidencia
4. **Calcular score**: Multiplicar status por weight
5. **Definir umbrales**: Establecer thresholds para Go/Conditional Go/No-Go
6. **Documentar justificación**: Para cada criterio, explicar el status
7. **Generar recomendación**: Basado en score total y condiciones específicas

## Errores Comunes

1. **Weights no suman 100%**: Rompe la lógica del scoring
2. **Criterios vagos**: "Se ve bien" no es un criterio evaluable
3. **Justificaciones insuficientes**: Status sin evidencia no es creíble
4. **Umbrales inapropiados**: Demasiado estrictos o muy liberales para el contexto
5. **Ignorar condiciones**: Score alto pero con bloqueadores críticos debe ser Conditional Go
6. **No revisar periódicamente**: Criterios y weights deben ajustarse según contexto

## Integración con Workflow

**En análisis preliminar**: Gate rápido antes de invertir en evaluación de alcance
**En validación de viabilidad**: Gate formal antes de invertir en PRD
**En revisión de cambios**: Gate de calidad antes de abrir PR
**En revisión de PR**: Gate final antes de merge

## Ejemplo de Customización Completa

**Contexto**: Feature de pagos en e-commerce (alta prioridad, alto riesgo)

| Criterio               | Status  | Weight | Score |
|------------------------|---------|--------|-------|
| Alineación estratégica | Pass    | 35%    | 35%   |
| Validación demanda     | Pass    | 15%    | 15%   |
| Recursos disponibles   | Partial | 30%    | 15%   |
| Riesgo manejable       | Partial | 20%    | 10%   |

**Justificaciones**:

- **Alineación estratégica**: Core de revenue growth initiative
- **Validación demanda**: 50+ merchants interesados en beta
- **Recursos disponibles**: Equipo disponible pero necesita infraestructura
- **Riesgo manejable**: Riesgo compliance alto, requiere legal review

**Total**: 75% → **Conditional Go**
**Condiciones**: Infraestructura + legal review antes de implementación
**Timeline**: 2 semanas para resolver condiciones
