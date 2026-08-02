# Fórmula de Sample Size para A/B Testing

Referencia para calcular el tamaño de muestra requerido en experimentos A/B con métricas binarias (proporciones).

## Fórmula Básica

```text
Sample size = (Z_α + Z_β)² × p × (1-p) / MDE²
```

## Componentes

### MDE (Minimum Detectable Effect)

**Definición**: Mínimo cambio que importa detectar

- **Relativo**: Porcentaje de cambio relativo al baseline (ej: 5%)
- **Absoluto**: Diferencia absoluta en la métrica (ej: 0.5% para baseline de 10%)
- **Cálculo**: MDE_absoluto = baseline × MDE_relativo / 100

**Ejemplo**:

- Baseline CTR: 10%
- MDE relativo: 5%
- MDE absoluto: 10% × 0.05 = 0.5%

### Power (1-β)

**Definición**: Probabilidad de detectar efecto si existe

- **Típico**: 80% (β = 0.20)
- **Alto**: 90% (β = 0.10) - requiere muestra más grande
- **Bajo**: 70% (β = 0.30) - muestra más pequeña, más riesgo de falso negativo

**Z_β values**:

- Power 80% (β=0.20): Z_β = 0.84
- Power 90% (β=0.10): Z_β = 1.28
- Power 70% (β=0.30): Z_β = 0.52

### Significance (α)

**Definición**: Probabilidad de falso positivo (Type I error)

- **Típico**: 5% (α = 0.05)
- **Conservador**: 1% (α = 0.01) - requiere muestra más grande
- **Liberal**: 10% (α = 0.10) - muestra más pequeña, más riesgo de falso positivo

**Z_α values**:

- α = 0.05 (95% confidence): Z_α = 1.96
- α = 0.01 (99% confidence): Z_α = 2.58
- α = 0.10 (90% confidence): Z_α = 1.64

### Baseline (p)

**Definición**: Tasa actual del métrico (proporción)

- **Ejemplos**: CTR actual (10%), conversion rate actual (5%), churn rate actual (2%)
- **Fuente**: Data histórica del período reciente (últimos 30 días)

## Ejemplo de Cálculo

**Escenario**: Test de color de botón para mejorar CTR

**Inputs**:

- Baseline CTR (p): 10% (0.10)
- MDE relativo: 5%
- MDE absoluto: 0.5% (0.005)
- Power: 80% (Z_β = 0.84)
- Significance: 5% (Z_α = 1.96)

**Cálculo**:

```text
Sample size = (1.96 + 0.84)² × 0.10 × (1-0.10) / 0.005²
            = (2.80)² × 0.10 × 0.90 / 0.000025
            = 7.84 × 0.09 / 0.000025
            = 0.7056 / 0.000025
            = 28,224 usuarios por variante
```

**Total sample**: 28,224 × 2 = 56,448 usuarios (control + treatment)

## Consideraciones Prácticas

### Duración del Test

**Mínimo**: 1 semana (capturar variabilidad semanal)
**Máximo**: 4 semanas (evitar seasonality effects)
**Cálculo**: Sample size / tráfico diario

**Ejemplo**:

- Sample requerido: 56,448 usuarios
- Tráfico diario: 5,000 usuarios
- Duración: 56,448 / 5,000 = 11.3 días → redondear a 2 semanas

### Ajustes por Variabilidad

**Si la métrica tiene alta varianza**: Aumentar sample size 20-30%
**Si hay efectos de seasonality**: Extender duración o usar covariates
**Si hay segmentación por usuario**: Calcular sample por segmento

### Alternativas Bayesianas

**Ventajas**: Requieren menos sample, permiten análisis continuo
**Desventajas**: Requieren priors, más complejidad estadística
**Cuándo usar**: Cuando sample es limitado o análisis continuo es crítico

## Herramientas y Calculadoras

**Online calculators**:

- Optimizely Sample Size Calculator
- Evan Miller's Sample Size Calculator
- AB Testguide Calculator

**Librerías estadísticas**:

- Python: `statsmodels.stats.power.NormalIndPower`
- R: `pwr package`
- JavaScript: Various npm packages

## Errores Comunes

1. **MDE demasiado pequeño**: Sample size excesivo, test innecesariamente largo
2. **Power demasiado bajo**: Riesgo alto de falso negativo
3. **Ignorar variabilidad**: Sample insuficiente para métricas volátiles
4. **No considerar business cycles**: Test termina en período atípico
5. **Peeking**: Analizar resultados antes de finalizar el test (infla error tipo I)

## Referencias

- Kohavi, R. et al. "A Practical Guide to A/B Testing"
- Evan Miller. "How Not To Run an A/B Test"
- Optimizely. "Sample Size Calculator and A/B Testing Guide"
