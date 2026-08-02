# Comandos Git Estándar

Comandos git frecuentes para análisis de cambios:

## Ver cambios

```bash
git diff origin/main          # Cambios vs main
git diff --stat               # Resumen de archivos cambiados
git log --oneline -10         # Últimos commits
git status                    # Estado actual
```

## Ver archivos modificados

```bash
git diff --name-only origin/main    # Solo nombres de archivos
git diff --cached                   # Cambios staged
git ls-files -m                     # Archivos modificados
```

## Ver cambios en archivo específico

```bash
git diff origin/main -- path/to/file
git show HEAD:path/to/file          # Ver archivo en commit específico
```

## Branch info

```bash
git branch --show-current           # Nombre de rama actual
git rev-parse --short HEAD          # Commit hash corto
```
