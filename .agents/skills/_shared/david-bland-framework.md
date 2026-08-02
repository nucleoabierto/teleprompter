# Framework de David Bland: Assumption Mapping

Framework de 4 buckets para identificar y priorizar assumptions en producto development, popularizado en "Testing Business Ideas".

## Los 4 Buckets

### 1. Desirability (¿Clientes quieren esto?)

**Pregunta clave**: ¿Los usuarios realmente tienen este problema?

**Criterios de evaluación**:

- ¿Los usuarios realmente tienen este problema?
- ¿Les importa suficiente para pagar/usar?
- ¿Es pain point crítico o nice-to-have?
- ¿Es un "must-have" o "nice-to-have"?

**Cómo validar**:

- Customer interviews
- Fake door tests
- Landing page A/B tests
- Surveys de intención de compra

### 2. Viability (¿Tiene sentido para el negocio?)

**Pregunta clave**: ¿Puede monetizarse y sostenerse?

**Criterios de evaluación**:

- ¿Puede monetizarse?
- ¿Encaja con modelo de negocio?
- ¿Cumple requisitos legales/compliance?
- ¿ROI positivo a largo plazo?

**Cómo validar**:

- Pricing tests
- Willingness-to-pay surveys
- Competitor analysis
- Unit economics analysis

### 3. Feasibility (¿Podemos construirlo?)

**Pregunta clave**: ¿Tenemos capacidad técnica y recursos?

**Criterios de evaluación**:

- ¿Tenemos tech stack necesario?
- ¿Es factible con recursos actuales?
- ¿Dependencias externas disponibles?
- ¿Timeline realista?

**Cómo validar**:

- Technical spikes
- Prototypes
- Proof of concepts
- Architecture reviews

### 4. Usability (¿Pueden usarlo?)

**Pregunta clave**: ¿Es usable sin manual o entrenamiento?

**Criterios de evaluación**:

- ¿Es usable sin manual?
- ¿Workflow es intuitivo?
- ¿Learning curve aceptable?
- ¿Accesibilidad adecuada?

**Cómo validar**:

- Usability tests
- Prototype walkthroughs
- Heuristic evaluations
- A/B testing de UX

## Matriz Risk vs Evidence

```text
                Evidencia Alta    Evidencia Media    Evidencia Baja
Risk Alto        [Test rápido]     [Prioridad 1]      [CRÍTICO - Prioridad 0]
Risk Medio       [Monitorear]      [Prioridad 2]      [Prioridad 1]
Risk Bajo        [De-priorizar]    [Prioridad 3]      [Prioridad 2]
```

**Focus prioritario**: High risk / Low evidence (cuadrante crítico)

## Categorías de Risk

**Alto**: Assumption crítico, si falla el feature falla completamente
**Medio**: Assumption importante pero hay alternativas o mitigaciones
**Bajo**: Assumption secundario, impacto limitado si falla

## Categorías de Evidence

**Alta**: Data cuantitativa, múltiples validaciones, experimentos controlados
**Media**: Algunos datos, validación parcial, evidencia cualitativa
**Baja/Ninguna**: Solo opinión, sin validación, assumptions no probados

## Aplicación en Workflow

1. **Identificar assumptions**: Listar 3-5 assumptions por bucket
2. **Evaluar risk/evidence**: Clasificar cada assumption
3. **Graficar en matriz**: Ubicar en cuadrante correspondiente
4. **Priorizar**: Focus en high risk/low evidence primero
5. **Diseñar experimentos**: Elegir método de validación apropiado

## Referencias

- Bland, David J. "Testing Business Ideas: A Practical Approach to Rapid Discovery"
- Original framework: IDEO's desirability/viability/feasibility lens + usability
