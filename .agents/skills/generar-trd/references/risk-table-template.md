# Template de Tabla de Riesgos

Template para documentar riesgos técnicos y sus mitigaciones.

## Formato

```markdown
## Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|--------|-----------|
| [Descripción del riesgo] | [Baja/Media/Alta] | [Bajo/Medio/Alto] | [Descripción de la mitigación] |
```

## Ejemplo

| Riesgo                            | Probabilidad | Impacto | Mitigación                                         |
|-----------------------------------|--------------|---------|----------------------------------------------------|
| Schema migration toma > 5min      | Media        | Alto    | Test migration en staging, backfill async          |
| External API auth falla           | Baja         | Alto    | Mock en tests, fallback a cached                   |
| Concurrency bug en rol assignment | Baja         | Alto    | Lock table durante role change, test multithreaded |

## Guía de uso

- **Probabilidad**: Baja, Media, Alta
- **Impacto**: Bajo, Medio, Alto
- **Mitigación**: Acciones concretas para prevenir o mitigar el riesgo
