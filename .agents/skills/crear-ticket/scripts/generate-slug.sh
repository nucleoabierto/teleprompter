#!/usr/bin/env bash
#
# Generador de slugs kebab-case para tickets.
#
# Este script convierte un título de ticket en un slug kebab-case
# adecuado para nombres de archivo y referencias genéricas.
#
# Uso:
#   ./scripts/generate-slug.sh "Título del ticket"
#   echo "Título del ticket" | ./scripts/generate-slug.sh
#
# Ejemplos:
#   ./scripts/generate-slug.sh "Add user authentication" → add-user-authentication
#   ./scripts/generate-slug.sh "Fix bug in API endpoint" → fix-bug-in-api-endpoint
#   ./scripts/generate-slug.sh "Implement OAuth2 flow" → implement-oauth2-flow
#

set -euo pipefail

# Función para convertir a kebab-case
to_kebab_case() {
    local input="$1"

    # Convertir a minúsculas
    local lower=$(echo "$input" | tr '[:upper:]' '[:lower:]')

    # Reemplazar espacios y caracteres de puntuación con guiones
    local slug=$(echo "$lower" | \
        sed -e 's/[^a-z0-9]/-/g' \
            -e 's/--\+/-/g' \
            -e 's/^-//' \
            -e 's/-$//')

    echo "$slug"
}

# Leer input desde argumento o stdin
if [ $# -eq 0 ]; then
    # Leer desde stdin
    if [ -t 0 ]; then
        echo "Error: Se requiere un título como argumento o via stdin" >&2
        echo "Uso: $0 \"Título del ticket\"" >&2
        echo "     echo \"Título\" | $0" >&2
        exit 1
    fi
    input=$(cat)
else
    input="$1"
fi

# Validar que no esté vacío
if [ -z "$input" ]; then
    echo "Error: El título no puede estar vacío" >&2
    exit 1
fi

# Generar y mostrar el slug
slug=$(to_kebab_case "$input")
echo "$slug"
