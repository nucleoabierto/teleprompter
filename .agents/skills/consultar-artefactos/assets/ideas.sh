#!/usr/bin/env bash
# Consultas al directorio de ideas persistidas (docs/ideas/).
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito (incluido el vacío legítimo), exit 2 entrada ausente.
set -euo pipefail

uso() {
  cat >&2 <<'EOF'
uso: ideas.sh <dir-ideas> pendientes
devuelve una línea por idea sin procesar: orden<TAB>archivo<TAB>título,
ordenadas por «Orden sugerido»; las sin orden van al final, con el campo vacío
EOF
  exit 2
}

[ $# -ge 2 ] || uso
dir=$1; op=$2; shift 2
[ "$op" = "pendientes" ] || uso
[ -d "$dir" ] || { echo "ideas.sh: directorio ausente: $dir" >&2; exit 2; }

for f in "$dir"/*.md; do
  [ -e "$f" ] || continue
  grep -q 'Procesada en' "$f" && continue
  orden=$(sed -n 's/.*\*\*Orden sugerido:\*\* *\([0-9][0-9]*\).*/\1/p' "$f" | head -1)
  titulo=$(sed -n 's/^# //p' "$f" | head -1)
  printf '%s\t%s\t%s\n' "${orden:-999}" "$f" "$titulo"
done | sort -t"$(printf '\t')" -k1,1n | awk -F'\t' 'BEGIN{OFS="\t"} { if ($1 == 999) $1 = ""; print }'
