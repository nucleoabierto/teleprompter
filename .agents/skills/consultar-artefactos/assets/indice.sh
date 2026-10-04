#!/usr/bin/env bash
# Coincidencia léxica por disparadores en índices con el formato del proyecto
# (docs/decisions/README.md, docs/lessons/README.md): entradas «- archivo.md»
# con sub-bullets «- Disparadores:», «- Resumen:» y «- Estado:» opcional.
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito (incluido el vacío legítimo), exit 2 entrada ausente.
set -euo pipefail

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
  /<!--/ { encom=1; next }
  /-->/ { encom=0; next }
  encom { next }
  /^- [^ ]/ { evaluar(); entrada=$2; disp=""; resumen=""; estado=""; next }
  /^  - Disparadores:/ { disp=$0; next }
  /^  - Resumen:/ { resumen=$0; sub(/^  - Resumen:[[:space:]]*/, "", resumen); next }
  /^  - Estado:/ { estado=$0; sub(/^  - Estado:[[:space:]]*/, "", estado); next }
  END { evaluar() }
' "$f"
