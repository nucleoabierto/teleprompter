#!/usr/bin/env bash
# Consultas al índice de tareas (TODO.txt).
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito (incluido el vacío legítimo), exit 2 entrada ausente.
set -euo pipefail

uso() {
  cat >&2 <<'EOF'
uso: todo.sh <indice> <operación> [argumentos]
operaciones:
  siguiente                  primera línea en curso ([~] o [r]); si no hay, primera pendiente
  por-estado <marca>         líneas de tarea con la marca indicada ( , ~, r, x, !)
  propuestas                 líneas de propuestas [p]
  grupos                     encabezados ## con su épica enlazada: encabezado<TAB>épica
  estado-grupo <texto>       conteo por estado bajo el encabezado que contiene <texto>
  siguiente-hito             siguiente número de la serie «## Hito N»
  inventario <dir-epicas>    líneas abiertas: épicas, grupos del índice y tareas sueltas
EOF
  exit 2
}

[ $# -ge 2 ] || uso
indice=$1; op=$2; shift 2
[ -f "$indice" ] || { echo "todo.sh: índice ausente: $indice" >&2; exit 2; }

case "$op" in

  siguiente)
    awk '
      /^- \[[~r]\] / { print; encontro=1; exit }
      /^- \[ \] / && !pendiente { pendiente=$0 }
      END { if (!encontro && pendiente) print pendiente }
    ' "$indice"
    ;;

  por-estado)
    [ $# -ge 1 ] || uso
    awk -v m="$1" 'index($0, "- [" m "] ") == 1' "$indice"
    ;;

  propuestas)
    awk 'index($0, "- [p] ") == 1' "$indice"
    ;;

  grupos)
    awk '
      /^## / {
        if (enc != "") print enc "\t" epica
        enc = substr($0, 4); epica = ""
        next
      }
      /<!-- épica:/ {
        linea = $0
        sub(/.*épica:[[:space:]]*/, "", linea)
        sub(/[[:space:]]*-->.*/, "", linea)
        epica = linea
      }
      END { if (enc != "") print enc "\t" epica }
    ' "$indice"
    ;;

  estado-grupo)
    [ $# -ge 1 ] || uso
    awk -v buscado="$*" '
      /^## / { dentro = (index($0, buscado) > 0); next }
      dentro && index($0, "- [") == 1 && substr($0, 5, 1) == "]" {
        cuenta[substr($0, 4, 1)]++
      }
      END { for (m in cuenta) print m "\t" cuenta[m] }
    ' "$indice" | sort
    ;;

  siguiente-hito)
    awk '/^## Hito [0-9]+/ { n = $3 + 0; if (n > max) max = n } END { print max + 1 }' "$indice"
    ;;

  inventario)
    [ $# -ge 1 ] || uso
    epicas=$1
    [ -d "$epicas" ] || { echo "todo.sh: directorio de épicas ausente: $epicas" >&2; exit 2; }
    for f in "$epicas"/*.md; do
      [ -e "$f" ] || continue
      estado=$(awk '/^## Estado/ { getline; while ($0 ~ /^[[:space:]]*$/) getline; print; exit }' "$f")
      case "$estado" in
        *"[x] Completada"*) e=completada ;;
        *"[x] Planificada"*) e=planificada ;;
        *) e=otro ;;
      esac
      printf 'epica\t%s\t%s\n' "$f" "$e"
    done
    awk '
      /^## / {
        if (enc != "") print "grupo\t" enc "\t" epica
        enc = substr($0, 4); epica = ""; sueltas = (enc == "General")
        next
      }
      /<!-- épica:/ {
        linea = $0
        sub(/.*épica:[[:space:]]*/, "", linea)
        sub(/[[:space:]]*-->.*/, "", linea)
        epica = linea
      }
      sueltas && index($0, "- [") == 1 && substr($0, 5, 1) == "]" && substr($0, 4, 1) != "x" {
        print "suelta\t" $0
      }
      END { if (enc != "") print "grupo\t" enc "\t" epica }
    ' "$indice"
    ;;

  *) uso ;;
esac
