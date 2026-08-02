#!/bin/bash
# find-convention-siblings.sh — Encuentra archivos hermanos para pase de convenciones
# Uso: source scripts/find-convention-siblings.sh <FILE-PATH>
# Salida: Variable SIBLING_FILES (array de rutas hermanas)

set -e

FILE_PATH="$1"

if [ -z "$FILE_PATH" ]; then
  echo "Error: Se requiere FILE-PATH" >&2
  exit 1
fi

if [ ! -f "$FILE_PATH" ]; then
  echo "Error: El archivo no existe: $FILE_PATH" >&2
  exit 1
fi

# Obtener directorio y extensión
DIR=$(dirname "$FILE_PATH")
BASE=$(basename "$FILE_PATH")
EXT="${BASE##*.}"
NAME="${BASE%.*}"

# Encontrar archivos hermanos (mismo directorio, misma extensión, diferente nombre)
SIBLING_FILES=()
while IFS= read -r -d '' sibling; do
  if [ "$(basename "$sibling")" != "$BASE" ]; then
    SIBLING_FILES+=("$sibling")
  fi
done < <(find "$DIR" -maxdepth 1 -type f -name "*.$EXT" -print0)

# Ordenar alfabéticamente
IFS=$'\n' SIBLING_FILES=($(sort <<<"${SIBLING_FILES[*]}"))

export SIBLING_FILES
export SIBLING_COUNT=${#SIBLING_FILES[@]}

if [ "$SIBLING_COUNT" -eq 0 ]; then
  echo "Advertencia: No se encontraron archivos hermanos para $FILE_PATH" >&2
fi
