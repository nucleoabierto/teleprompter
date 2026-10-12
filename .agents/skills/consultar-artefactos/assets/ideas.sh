#!/usr/bin/env bash
# Consultas al directorio de ideas persistidas (docs/ideas/).
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito (incluido el vacío legítimo), exit 2 entrada ausente.
set -euo pipefail

# Convenciones: el instalador escribe los valores del proyecto en
# convenciones.sh; una clave ausente rige por el valor por defecto.
conv="$(dirname "$0")/convenciones.sh"
if [ -f "$conv" ]; then
  . "$conv" 2>/dev/null || { echo "ideas.sh: convenciones malformadas: $conv" >&2; exit 2; }
fi
export CAMPO_PROCESADA=${CAMPO_PROCESADA:-'> **Procesada en:** %s'}
export CAMPO_ORDEN_IDEA=${CAMPO_ORDEN_IDEA:-'**Orden sugerido:**'}

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

marca_p=${CAMPO_PROCESADA%%%s*}
orden_re=$(printf '%s' "$CAMPO_ORDEN_IDEA" | sed 's/[][\.*^$/]/\\&/g')
for f in "$dir"/*.md; do
  [ -e "$f" ] || continue
  grep -qF "$marca_p" "$f" && continue
  orden=$(sed -n "s/.*${orden_re} *\([0-9][0-9]*\).*/\1/p" "$f" | head -1)
  titulo=$(sed -n 's/^# //p' "$f" | head -1)
  printf '%s\t%s\t%s\n' "${orden:-999}" "$f" "$titulo"
done | sort -t"$(printf '\t')" -k1,1n | awk -F'\t' 'BEGIN{OFS="\t"} { if ($1 == 999) $1 = ""; print }'
