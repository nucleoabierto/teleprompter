#!/usr/bin/env bash
# Siguiente número de una serie numerada de un directorio:
# tareas y propuestas (NNN), decisiones (DNNN), borradores (MM), ideas (NNN).
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito, exit 2 entrada ausente.
set -euo pipefail

# Convenciones: el instalador escribe los valores del proyecto en
# convenciones.sh; una clave ausente rige por el valor por defecto.
conv="$(dirname "$0")/convenciones.sh"
if [ -f "$conv" ]; then
  . "$conv" 2>/dev/null || { echo "series.sh: convenciones malformadas: $conv" >&2; exit 2; }
fi
export ANCHO_NUMERACION=${ANCHO_NUMERACION:-3}

uso() {
  cat >&2 <<'EOF'
uso: series.sh <directorio> siguiente [prefijo] [ancho]
devuelve el siguiente número de la serie con el formato pedido:
  series.sh docs/tasks siguiente          -> 121
  series.sh docs/decisions siguiente D    -> D034
  series.sh docs/proposals/001-x siguiente "" 2  -> 05
EOF
  exit 2
}

[ $# -ge 2 ] || uso
dir=$1; op=$2; shift 2
[ "$op" = "siguiente" ] || uso
prefijo=${1:-}
ancho=${2:-$ANCHO_NUMERACION}
[ -d "$dir" ] || { echo "series.sh: directorio ausente: $dir" >&2; exit 2; }

max=$(find "$dir" -maxdepth 1 -name "${prefijo}[0-9]*" -print |
      sed -n "s|.*/${prefijo}\([0-9][0-9]*\).*|\1|p" |
      sort -n | tail -1)
printf '%s%0*d\n' "$prefijo" "$ancho" $(( 10#${max:-0} + 1 ))
