# Template: Matriz de Decision Rules

Template para definir reglas de decisión en experimentos A/B y gates de producto.

## Estructura Básica

| Resultado Primary | Resultado Guardrails | Decisión | Acción |
| ------------------- | --------------------- | ---------- | -------- |
| Statistically significant ↑ | No degradation | Continue | Implementar feature |
| Statistically significant ↓ | N/A | Kill | Rechazar feature |
| Not significant | N/A | Pivot | Rediseñar experimento |
| Significant ↑ | Guardrail violated | Re-evaluate | Evaluar trade-offs |

## Componentes

### Resultado Primary

**Statistically significant ↑**: Mejora estadísticamente significativa en métrica principal

- p-value < 0.05 (95% confidence)
- Dirección esperada (↑ para mejoras, ↓ para reducciones)
- Magnitud suficiente para ser business-relevant

**Statistically significant ↓**: Deterioro estadísticamente significativo

- p-value < 0.05 en dirección contraria
- Indica efecto negativo no deseado

**Not significant**: Sin evidencia estadística de efecto

- p-value ≥ 0.05
- No se puede rechazar null hypothesis
- Puede ser falta de power o efecto realmente nulo

### Resultado Guardrails

**No degradation**: Guardrail metrics no empeoran significativamente

- Non-inferiority test pasa
- Cambios dentro de thresholds aceptables
- Quality metrics mantienen estándares

**Guardrail violated**: Al menos un guardrail metric falla

- Non-inferiority test falla
- Deterioration metric empeora
- Quality metric cae below threshold

**N/A**: No aplica cuando primary no es significativo

### Decisiones

**Continue**: Proceder con implementación

- Primary mejora significativamente
- Guardrails intactos
- Trade-offs aceptables

**Kill**: Detener iniciativa completamente

- Primary deteriora significativamente
- O guardrails críticos violados
- Riesgos superan beneficios

**Pivot**: Rediseñar y re-testear

- Primary no significativo (inconclusivo)
- Guardrails intactos
- Necesita más data o diferente enfoque

**Re-evaluate**: Analizar trade-offs manualmente

- Primary mejora significativamente
- Guardrails violados pero no críticos
- Requiere juicio humano sobre trade-offs

## Reglas Avanzadas

### Por Tipo de Métrica

**Para conversion metrics**:

- Continue si: ↑ significativo + guardrails OK
- Kill si: ↓ significativo O guardrail crítico violado
- Pivot si: no significativo + power suficiente

**Para revenue metrics**:

- Continue si: ↑ significativo + ROI positivo
- Kill si: ↓ significativo O ROI negativo
- Pivot si: no significativo + sample suficiente

**Para engagement metrics**:

- Continue si: ↑ significativo + churn no sube
- Kill si: ↓ significativo O churn sube significativamente
- Pivot si: no significativo + duración suficiente

### Por Stage del Producto

**MVP stage**:

- Thresholds más liberales (p-value < 0.10)
- Focus en learning vs optimización
- Más tolerancia a guardrail violations temporales

**Growth stage**:

- Thresholds estándar (p-value < 0.05)
- Balance entre learning y optimización
- Guardrails más estrictos

**Scale stage**:

- Thresholds conservadores (p-value < 0.01 para cambios grandes)
- Focus en optimización y protección
- Guardrails muy estrictos

### Por Risk del Experimento

**Low risk experiments**:

- Reglas simplificadas (solo primary metric)
- Decisiones más rápidas
- Menos guardrails requeridos

**High risk experiments**:

- Reglas completas (primary + guardrails)
- Decisiones más conservadoras
- Más guardrails y thresholds estrictos

## Customización por Contexto

### Para Features de Seguridad

**Guardrails críticos**: Security incidents, compliance violations
**Decision**: Kill inmediato si cualquier guardrail de seguridad violado
**No trade-offs**: Seguridad no es negociable

### Para Features de UX

**Guardrails importantes**: Task completion, error rates, satisfaction
**Decision**: Re-evaluate si primary mejora pero UX metrics empeoran
**Trade-offs**: Considerar rollback o redesign si UX impact es severo

### Para Features de Performance

**Guardrails críticos**: Latency, throughput, error rates
**Decision**: Kill si performance degrada beyond threshold
**No trade-offs**: Performance no puede sacrificarse por otras mejoras

## Cómo Usar este Template

1. **Definir primary metric**: Métrica principal que determina éxito
2. **Definir guardrail metrics**: Métricas que protegen contra optimización ciega
3. **Establecer thresholds**: Niveles aceptables para cada metric
4. **Definir significance level**: p-value threshold (típico: 0.05)
5. **Customizar reglas**: Ajustar por contexto (stage, risk, tipo de feature)
6. **Documentar trade-offs**: Para casos Re-evaluate, documentar rationale
7. **Comunicar claramente**: Asegurar que el equipo entienda las reglas

## Ejemplo de Customización

**Contexto**: Feature de checkout en e-commerce (high risk, revenue impact)

| Resultado Primary | Resultado Guardrails | Decision | Rationale |
| ------------------- | --------------------- | ---------- | ----------- |
| Conversion ↑ 5% (p<0.01) | Churn no cambia (p>0.05) | Continue | Mejora clara sin downside |
| Conversion ↑ 2% (p<0.05) | Churn ↑ 1% (p<0.05) | Re-evaluate | Mejora leve pero churn sube - analizar segmentos |
| Conversion no change (p>0.05) | Churn no cambia (p>0.05) | Pivot | Inconclusivo - necesita más sample o diferente enfoque |
| Conversion ↓ 3% (p<0.01) | Churn no cambia (p>0.05) | Kill | Deterioro claro - revertir inmediatamente |

## Errores Comunes

1. **No definir guardrails**: Optimizar ciega de una métrica puede dañar otras
2. **Thresholds muy estrictos**: Hace difícil detectar mejoras reales
3. **Thresholds muy liberales**: Acepta degradaciones que dañan el producto
4. **Ignorar contexto**: Usar mismas reglas para MVP y Scale no es apropiado
5. **No documentar trade-offs**: Decisiones Re-evaluate sin rationale crean confusión
