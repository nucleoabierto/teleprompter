# Documentation Patterns

## Code Patterns Requiring Documentation

| Patrón               | Requiere                 | Gap si                     |
|----------------------|--------------------------|----------------------------|
| Retry logic          | Comentario + Raises doc  | Sin explicar strategy      |
| Cache invalidation   | Comentario               | Sin mencionar TTL/strategy |
| Rate limiting        | Comentario + Raises doc  | Sin mencionar limits       |
| Circuit breaker      | ADR + comentario         | Sin documentar behavior    |
| Async/await patterns | Comentario               | Sin mencionar threading    |
| SQL queries          | Comentario (si complejo) | Sin índices documentados   |
| Regular expressions  | Comentario + ejemplo     | Sin ejemplo de match       |
| Magic numbers        | Comentario               | Números sin explicación    |
| Type coercion        | Comentario               | Sin explicar conversión    |
| Error handling       | Raises doc               | Sin mencionar fallback     |

## Documentation Requirements by Change Type

| Cambio                      | Requiere             | Gap si                        |
|-----------------------------|----------------------|-------------------------------|
| Nueva dependencia (pip/npm) | README updated       | Sin mencionar en README       |
| Nueva variable env          | .env.example updated | Sin documenting required vars |
| New database schema         | Migration + docs     | Sin script de rollback        |
| New service/API             | README API section   | Sin documentar endpoints      |
| Config changes              | CONFIGURATION.md     | Sin explicar flags            |

## Architectural Decision Pattern

### Patrón detectado: Dual-write strategy

```python
# Write to both cache and DB
cache.set(key, value)
db.insert(key, value)
```

**Gap detected**: Dual-write detected but no ADR linking decision (why both? consistency strategy?)

Buscar en codebase:

- ¿Existe ADR documentando esta decisión?
- ¿Existe comentario explicando por qué?
- ¿Está documentado en architecture.md?

**Recomendación**: Link to ADR-XXX or add comment explaining the pattern
