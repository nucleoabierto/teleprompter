#!/usr/bin/env bash
# Coincidencia léxica por disparadores en índices con el formato del proyecto
# (docs/decisions/README.md, docs/lessons/README.md): entradas «- archivo.md»
# con sub-bullets «- Disparadores:», «- Resumen:» y «- Estado:» opcional.
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito (incluido el vacío legítimo), exit 2 entrada ausente.
set -euo pipefail

# Convenciones: el instalador escribe los valores del proyecto en
# convenciones.sh; una clave ausente rige por el valor por defecto.
conv="$(dirname "$0")/convenciones.sh"
if [ -f "$conv" ]; then
  . "$conv" 2>/dev/null || { echo "indice.sh: convenciones malformadas: $conv" >&2; exit 2; }
fi
export CAMPOS_INDICE_DISPARADORES=${CAMPOS_INDICE_DISPARADORES:-'Disparadores|Resumen|Estado'}

uso() {
  cat >&2 <<'EOF'
uso: indice.sh <indice.md> coincidencias <término> [término…]
devuelve una línea por entrada cuyos disparadores contienen algún término
(insensible a mayúsculas): archivo<TAB>estado<TAB>resumen
EOF
  exit 2
}

[ $# -ge 3 ] || uso
f=$1; op=$2; shift 2
[ "$op" = "coincidencias" ] || uso
[ -f "$f" ] || { echo "indice.sh: índice ausente: $f" >&2; exit 2; }

terminos=$(printf '%s\t' "$@")
awk -v terminos="$terminos" '
  BEGIN { split(ENVIRON["CAMPOS_INDICE_DISPARADORES"], cf, "|") }
  function evaluar(  low, n, i) {
    if (entrada == "") return
    low = tolower(disp)
    n = split(terminos, t, "\t")
    for (i = 1; i <= n; i++)
      if (t[i] != "" && index(low, tolower(t[i])) > 0) {
        print entrada "\t" estado "\t" resumen
        return
      }
  }
  /<!--/ { if ($0 !~ /-->/) encom=1; next }
  /-->/ { encom=0; next }
  encom { next }
  /^- [^ ]/ { evaluar(); entrada=$2; disp=""; resumen=""; estado=""; next }
  index($0, "  - " cf[1] ":") == 1 { disp=$0; next }
  index($0, "  - " cf[2] ":") == 1 {
    resumen = substr($0, length(cf[2]) + 6)
    sub(/^[[:space:]]+/, "", resumen)
    next
  }
  index($0, "  - " cf[3] ":") == 1 {
    estado = substr($0, length(cf[3]) + 6)
    sub(/^[[:space:]]+/, "", estado)
    next
  }
  END { evaluar() }
' "$f"
