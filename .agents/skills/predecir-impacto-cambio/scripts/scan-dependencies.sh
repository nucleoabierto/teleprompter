#!/bin/bash
# Script para automatizar mapeo de dependencias
# Uso: ./scripts/scan-dependencies.sh <function-name> <source-dir>

set -e

FUNCTION_NAME=${1:-"get_user"}
SOURCE_DIR=${2:-"src/"}

echo "=== Escaneando dependencias para: $FUNCTION_NAME ==="
echo "Directorio fuente: $SOURCE_DIR"
echo ""

# 1. Buscar qué servicios usan la función
echo "1. Servicios que usan '$FUNCTION_NAME':"
grep -r "def $FUNCTION_NAME" "$SOURCE_DIR" || echo "  No se encontró definición de función"
echo ""

# 2. Buscar llamadas a la función
echo "2. Llamadas a '$FUNCTION_NAME':"
grep -r "$FUNCTION_NAME(" "$SOURCE_DIR" --include="*.py" --include="*.js" --include="*.ts" || echo "  No se encontraron llamadas"
echo ""

# 3. Buscar clases de servicio
echo "3. Clases de servicio encontradas:"
grep -r "class.*Service" "$SOURCE_DIR" --include="*.py" || echo "  No se encontraron clases Service"
echo ""

# 4. Buscar imports del módulo (si se especifica)
MODULE_NAME=$(echo "$FUNCTION_NAME" | sed 's/_.*$//')
echo "4. Imports relacionados con '$MODULE_NAME':"
grep -r "from.*$MODULE_NAME import\|$MODULE_NAME\." "$SOURCE_DIR" --include="*.py" || echo "  No se encontraron imports"
echo ""

# 5. Generar grafo de dependencias simple
echo "5. Grafo de dependencias:"
echo "   Buscando patrones de uso..."
DEPENDENCIES=$(grep -r "$FUNCTION_NAME" "$SOURCE_DIR" --include="*.py" -l | head -10)
if [ -n "$DEPENDENCIES" ]; then
    echo "   $FUNCTION_NAME"
    for dep in $DEPENDENCIES; do
        echo "       ↓ usado por"
        echo "   $(basename $dep)"
    done
else
    echo "   No se detectaron dependencias directas"
fi
echo ""

echo "=== Escaneo completado ==="
