# Tipos de Experimentos por Assumption

Referencia para seleccionar el tipo de experimento apropiado según el tipo de assumption y nivel de risk/evidence.

## Por Tipo de Assumption

### Desirability Assumptions

**Pregunta**: ¿Los usuarios realmente quieren esto?

| Experimento         | Cuándo usar                        | Duración típica | Costo |
|---------------------|------------------------------------|-----------------|-------|
| Customer interviews | Validar problema profundo          | 1-2 semanas     | Bajo  |
| Fake door test      | Validar interés antes de construir | 1-2 semanas     | Bajo  |
| Landing page A/B    | Validar valor de propuesta         | 2-4 semanas     | Medio |
| Concierge MVP       | Validar solución manualmente       | 2-4 semanas     | Medio |
| Wizard of Oz        | Simular backend manualmente        | 1-3 semanas     | Medio |

### Viability Assumptions

**Pregunta**: ¿Tiene sentido para el negocio?

| Experimento                   | Cuándo usar                | Duración típica | Costo |
|-------------------------------|----------------------------|-----------------|-------|
| Pricing test                  | Validar willingness-to-pay | 2-4 semanas     | Medio |
| Willingness-to-pay survey     | Validar rango de precios   | 1 semana        | Bajo  |
| Competitor analysis           | Validar diferenciación     | 1-2 semanas     | Bajo  |
| Unit economics analysis       | Validar rentabilidad       | 1 semana        | Bajo  |
| Pre-sales / Letters of intent | Validar compromiso de pago | 2-6 semanas     | Medio |

### Feasibility Assumptions

**Pregunta**: ¿Podemos construirlo?

| Experimento         | Cuándo usar                                 | Duración típica | Costo |
|---------------------|---------------------------------------------|-----------------|-------|
| Technical spike     | Validar tecnología desconocida              | 1-2 semanas     | Medio |
| Prototype           | Validar arquitectura y UX                   | 1-3 semanas     | Medio |
| Proof of concept    | Validar concepto técnico                    | 1-2 semanas     | Medio |
| Architecture review | Validar integración con sistemas existentes | 1 semana        | Bajo  |
| Load testing        | Validar performance y escalabilidad         | 1 semana        | Medio |

### Usability Assumptions

**Pregunta**: ¿Pueden usarlo?

| Experimento | Cuándo usar | Duración típica | Costo |
| ------------- | ------------- | ----------------- | -------- |
| Usability test | Validar flujo de usuario | 1-2 semanas | Medio |
| Prototype walkthrough | Validar comprensión de UI | 1 semana | Bajo |
| Heuristic evaluation | Validar principios de UX | 1 semana | Bajo |
| A/B testing de UX | Validar diseño específico | 2-4 semanas | Alto |
| Tree testing | Validar arquitectura de información | 1 semana | Bajo |

## Por Nivel de Risk/Evidence

### High Risk / Low Evidence (CRÍTICO)

**Estrategia**: Experimentos rápidos y baratos para validar o invalidar rápidamente

- **Duración**: 1-2 semanas
- **Costo**: Bajo
- **Tipos recomendados**: Customer interviews, fake door tests, technical spikes
- **Objetivo**: Validar o matar la assumption con mínimo inversión

### High Risk / Medium Evidence

**Estrategia**: Experimentos moderados para confirmar con más data

- **Duración**: 2-4 semanas
- **Costo**: Medio
- **Tipos recomendados**: Landing page A/B, prototypes, pricing tests
- **Objetivo**: Confirmar la assumption con evidencia cuantitativa

### Medium Risk / Low Evidence

**Estrategia**: Experimentos ligeros para reducir incertidumbre

- **Duración**: 1 semana
- **Costo**: Bajo
- **Tipos recomendados**: Surveys, competitor analysis, architecture reviews
- **Objetivo**: Reducir incertidumbre sin inversión significativa

## Consideraciones de Selección

**Factores a considerar**:

1. **Stage del producto**: MVP (cualitativo) vs Scale (cuantitativo)
2. **Disponibilidad de usuarios**: ¿Tienes acceso a usuarios reales?
3. **Time pressure**: ¿Necesitas validar rápido?
4. **Recursos disponibles**: ¿Equipo, budget, herramientas?
5. **Tipo de data necesaria**: Cualitativa (insights) vs cuantitativa (métricas)

**Regla general**: Empezar con el experimento más rápido y barato que pueda responder la pregunta crítica. Solo escalar a experimentos más costosos si es necesario.
