# Matriz de Criticidad - Template

Template para clasificar componentes por nivel de riesgo y prioridad de testing.

## Estructura

```markdown
### Matriz de Criticidad

| Componente     | Criticidad | Por qué                                                  |
|----------------|------------|----------------------------------------------------------|
| [Componente 1] | 🔴 Alto    | [Razón: seguridad, datos sensibles, transacciones, etc.] |
| [Componente 2] | 🔴 Alto    | [Razón]                                                  |
| [Componente 3] | 🟡 Medio   | [Razón: APIs públicas, servicios, performance, etc.]     |
| [Componente 4] | 🟡 Medio   | [Razón]                                                  |
| [Componente 5] | 🟢 Bajo    | [Razón: utilities, helpers, observabilidad, etc.]        |
| [Componente 6] | 🟢 Bajo    | [Razón]                                                  |
```

## Criterios de Clasificación

### 🔴 Alto Riesgo

- Seguridad y autenticación
- Datos sensibles / PII
- Transacciones monetarias
- Lógica de negocio crítica
- Integraciones externas críticas

### 🟡 Medio Riesgo

- APIs públicas
- Servicios core
- Capas de cache
- Performance y consistency
- Features de negocio importantes

### 🟢 Bajo Riesgo

- Utilities y helpers
- Funciones puras sin side effects
- Logging y observabilidad
- Componentes de UI no críticos
- Configuración estática
