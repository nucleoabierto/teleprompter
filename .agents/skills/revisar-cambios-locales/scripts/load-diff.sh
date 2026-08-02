#!/bin/bash
# load-diff.sh — Carga diff local completo y historial de commits
# Uso: source scripts/load-diff.sh <DIFF-BASE>
# Salida: Variables DIFF_OUTPUT, COMMITS_OUTPUT, COMMIT_COUNT

set -e

DIFF_BASE="${1:-$(git remote show origin | grep 'HEAD branch' | awk '{print $NF}')}"

if [ -z "$DIFF_BASE" ]; then
  echo "Error: No se pudo determinar DIFF-BASE" >&2
  exit 1
fi

# Cargar diff completo
DIFF_OUTPUT=$(git diff "${DIFF_BASE}...HEAD" 2>/dev/null || git diff "${DIFF_BASE}" 2>/dev/null)

# Cargar historial de commits
COMMITS_OUTPUT=$(git log "${DIFF_BASE}..HEAD" --oneline 2>/dev/null || git log "${DIFF_BASE}" --oneline -10 2>/dev/null)

# Contar commits
COMMIT_COUNT=$(echo "$COMMITS_OUTPUT" | wc -l | tr -d ' ')

if [ -z "$DIFF_OUTPUT" ] && [ "$COMMIT_COUNT" -eq 0 ]; then
  echo "Advertencia: No hay diff vs ${DIFF_BASE}" >&2
fi

export DIFF_OUTPUT
export COMMITS_OUTPUT
export COMMIT_COUNT
export DIFF_BASE
