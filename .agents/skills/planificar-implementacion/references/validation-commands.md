# Comandos de validación estandarizados

Comandos de validación para usar en planes de implementación. Nunca ejecutes el suite completo de tests.

## Tests unitarios

```bash
./scripts/docker-helper.sh test -m unit
```

## Tests de frontend

```bash
cd frontend && npm test -- --filter=<name>
```

## Linting de Python (ruff)

```bash
./scripts/docker-helper.sh exec api uv run ruff check
```

## Type checking de Python (typer)

```bash
./scripts/docker-helper.sh exec api uv run ty check
```

## Notas de uso

- Estos comandos deben dirigirse a las áreas específicas que cambiaron en el código
- Reemplaza `<name>` con el nombre específico del test de frontend que deseas ejecutar
- Nunca ejecutes el suite completo de tests; usa comandos dirigidos y específicos
