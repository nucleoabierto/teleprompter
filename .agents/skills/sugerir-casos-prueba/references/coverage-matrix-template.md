# Matriz de Cobertura - Template

Template para definir objetivos de cobertura de testing por nivel y componente.

## Estructura

```markdown
### Test Coverage Matrix

| Componente     | Unit | Integration | E2E  | Manual                |
|----------------|------|-------------|------|-----------------------|
| [Componente 1] | [X%] | [X%]        | [X%] | [Manual tests needed] |
| [Componente 2] | [X%] | [X%]        | [X%] | [Manual tests needed] |
| [Componente 3] | [X%] | [X%]        | [X%] | [Manual tests needed] |
| [Componente 4] | [X%] | [X%]        | [X%] | [Manual tests needed] |

**Meta por nivel**:
- Unit: 80%+ (rápido, local)
- Integration: 70%+ (real services)
- E2E: 50%+ (critical paths only)
- Manual: Key workflows + UX
```

## Criterios por Nivel

### Unit Tests

- **Objetivo**: 80%+ cobertura
- **Características**: Rápidos (<10ms), ejecución local
- **Scope**: Funciones/clases aisladas
- **Mocks**: Todas las dependencias (DB, API, Cache)

### Integration Tests

- **Objetivo**: 70%+ cobertura
- **Características**: <100ms por test, servicios reales
- **Scope**: Función + dependencias reales (DB, cache)
- **Mocks**: APIs externas solo (Stripe, SendGrid, etc.)

### E2E Tests

- **Objetivo**: 50%+ cobertura
- **Características**: Workflow completo, sistema completo
- **Scope**: UI → API → DB
- **Mocks**: Nada (sistema completo)
- **Count**: Solo critical paths (5-10 tests)

### Manual Tests

- **Scope**: Key workflows + UX
- **Focus**: Flujos que no se pueden automatizar fácilmente
- **Ejemplos**: UX validation, visual testing, exploratory testing
