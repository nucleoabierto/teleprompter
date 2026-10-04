#!/usr/bin/env bash
# Escrituras sobre los archivos de ideas persistidas (docs/ideas/).
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito, exit 2 entrada ausente o invocación inválida;
# una mutación ante formato no parseado falla sin escribir.
set -euo pipefail

uso() {
  cat >&2 <<'EOF'
uso: ideas.sh <archivo-de-idea> <operación> [argumentos]
operaciones:
  procesada <destino>   añade «> **Procesada en:** <destino>» al final de la
                        cabecera de la idea; falla si ya está marcada
EOF
  exit 2
}

[ $# -ge 2 ] || uso
f=$1; op=$2; shift 2
[ -f "$f" ] || { echo "ideas.sh: archivo ausente: $f" >&2; exit 2; }

tmp=$(mktemp "${TMPDIR:-/tmp}/ideas.XXXXXX")
trap 'rm -f "$tmp"' EXIT

case "$op" in

  procesada)
    [ $# -ge 1 ] || uso
    destino=$1
    grep -q 'Procesada en' "$f" && { echo "ideas.sh: la idea ya está procesada: $f" >&2; exit 1; }
    if awk -v destino="$destino" '
      { l[NR] = $0; if (!fin && /^## /) fin = NR }
      END {
        limite = fin ? fin : NR + 1
        pos = 0
        for (i = 1; i < limite; i++) if (l[i] ~ /^>/) pos = i
        if (!pos) exit 1
        for (i = 1; i <= NR; i++) {
          print l[i]
          if (i == pos) print "> **Procesada en:** " destino
        }
      }
    ' "$f" > "$tmp"; then
      mv "$tmp" "$f"
    else
      echo "ideas.sh: cabecera no localizada en $f" >&2; exit 1
    fi
    ;;

  *) uso ;;
esac
