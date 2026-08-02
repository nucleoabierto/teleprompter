# Tabla de Análisis de Infraestructura

Template para análisis de brechas de infraestructura requeridas para un epic o feature.

## Tabla de Infraestructura

| Componente    | Actual     | Necesita         | Esfuerzo | Bloqueante |
|---------------|------------|------------------|----------|------------|
| Database      | PostgreSQL | Redis cache      | 3 días   | No         |
| Message queue | None       | RabbitMQ         | 1 semana | Sí         |
| API Gateway   | Kong       | Kong v2 upgrade  | 2 días   | Sí         |
| Monitoring    | Datadog    | Datadog + custom | 3 días   | No         |
| Feature flags | None       | LaunchDarkly     | 1 semana | Sí         |

## Análisis de Bloqueantes

Contar y documentar los componentes marcados como bloqueantes:

**Bloqueantes detectados**: [N]

- [Componente 1] ([Esfuerzo])
- [Componente 2] ([Esfuerzo])

## Recomendación

Agregar [X] semanas al timeline para setup de infraestructura bloqueante.

## Uso

Evaluar cada componente de infraestructura requerido por el epic. Marcar como "Bloqueante" si el epic no puede implementarse sin ese componente. Estimar esfuerzo real de setup/configuración.
