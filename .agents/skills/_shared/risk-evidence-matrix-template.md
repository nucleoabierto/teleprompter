# Template: Matriz Risk vs Evidence

Template para graficar assumptions en matriz 2x2 de risk vs evidence.

## Estructura de la Matriz

```text
                Evidencia Alta    Evidencia Media    Evidencia Baja
Risk Alto        [Test rápido]     [Prioridad 1]      [CRÍTICO - Prioridad 0]
Risk Medio       [Monitorear]      [Prioridad 2]      [Prioridad 1]
Risk Bajo        [De-priorizar]    [Prioridad 3]      [Prioridad 2]
```

## Categorías de Risk

**Alto**: Assumption crítico, si falla el feature falla completamente

- Impacto directo en éxito del feature
- No hay alternativas viables
- Fallo sería costoso o irreversible

**Medio**: Assumption importante pero hay alternativas o mitigaciones

- Impacto significativo pero manejable
- Existen workarounds o alternativas
- Fallo puede mitigarse con cambios

**Bajo**: Assumption secundario, impacto limitado si falla

- Impacto menor en éxito del feature
- Muchas alternativas disponibles
- Fallo no es crítico para timeline

## Categorías de Evidence

**Alta**: Data cuantitativa, múltiples validaciones, experimentos controlados

- Data cuantitativa robusta
- Múltiples fuentes de validación
- Experimentos controlados completados
- Consistencia across segmentos

**Media**: Algunos datos, validación parcial, evidencia cualitativa

- Data cualitativa o limitada
- Validación parcial o en contexto específico
- Evidencia anecdótica pero consistente
- Un solo experimento o validación

**Baja/Ninguna**: Solo opinión, sin validación, assumptions no probados

- Solo opinión o suposición
- Sin data de validación
- Assumptions no probados
- Evidencia contradictoria

## Cuadrantes y Acciones

### CRÍTICO - Prioridad 0 (High Risk / Low Evidence)

**Acción inmediata**: Experimento rápido (1-2 semanas)
**Objetivo**: Validar o invalidar ASAP
**Costo**: Bajo
**Ejemplos**: Customer interviews, fake door tests, technical spikes

### Prioridad 1 (High Risk / Medium Evidence OR Medium Risk / Low Evidence)

**Acción**: Experimento moderado (2-4 semanas) o monitoreo
**Objetivo**: Confirmar con más data o reducir incertidumbre
**Costo**: Medio
**Ejemplos**: Landing page A/B, prototypes, surveys

### Prioridad 2 (Medium Risk / Medium Evidence OR Low Risk / Low Evidence)

**Acción**: Monitoreo o experimento ligero (1 semana)
**Objetivo**: Mantener awareness, validar cuando sea posible
**Costo**: Bajo
**Ejemplos**: Competitor analysis, architecture reviews, heuristic evaluation

### Prioridad 3 (Low Risk / High Evidence)

**Acción**: De-priorizar o monitoreo pasivo
**Objetivo**: No requiere acción inmediata
**Costo**: Ninguno
**Ejemplos**: Documentar, revisar periódicamente

## Cómo Usar este Template

1. **Listar assumptions**: Identificar 3-5 assumptions por bucket
2. **Evaluar risk**: Clasificar cada assumption como Alto/Medio/Bajo
3. **Evaluar evidence**: Clasificar cada assumption como Alta/Media/Baja
4. **Graficar**: Ubicar cada assumption en el cuadrante correspondiente
5. **Priorizar**: Focus en cuadrante CRÍTICO primero, luego Prioridad 1
6. **Documentar**: Para cada assumption priorizado, definir acción y timeline

## Ejemplo de Uso

```text
Assumption: "Los usuarios quieren notificaciones push para eventos importantes"
Risk: Alto (feature crítico para engagement)
Evidence: Baja (solo anecdótico, sin data)
Cuadrante: CRÍTICO - Prioridad 0
Acción: Fake door test (1 semana)
```

## Consideraciones

- **Contexto matters**: El mismo assumption puede tener diferente risk en diferentes contextos
- **Iteración**: Re-evaluar evidence después de cada experimento
- **Trade-offs**: A veces es aceptable proceder con risk medio si el upside es alto
- **Conservatism**: Cuando hay duda, clasificar como risk más alto para ser conservador
