#!/usr/bin/env bash
# Consultas a un archivo de tarea (docs/tasks/NNN-slug.md).
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito (incluido el vacío legítimo), exit 2 entrada ausente.
set -euo pipefail

uso() {
  cat >&2 <<'EOF'
uso: tarea.sh <archivo-de-tarea> <operación>
operaciones:
  estado          estado del campo ## Estado: pendiente, en-progreso, en-revision, completada, bloqueada
  secciones       encabezados ## presentes, en orden
  planeacion      presencia de Contexto, Conectividad, Plan técnico y Suite de pruebas esperada
  dependencias    entradas de la sección ## Dependencias
  checklist       acciones del ## Plan técnico: marca<TAB>texto
                  (marca « » o «x» en checklists, número en listas numeradas históricas)
EOF
  exit 2
}

[ $# -ge 2 ] || uso
f=$1; op=$2; shift 2
[ -f "$f" ] || { echo "tarea.sh: archivo ausente: $f" >&2; exit 2; }

case "$op" in

  estado)
    linea=$(awk '/^## Estado/ { getline; while ($0 ~ /^[[:space:]]*$/) getline; print; exit }' "$f")
    if [ -z "$linea" ]; then
      echo "tarea.sh: ## Estado vacío o ausente en $f" >&2; exit 1
    fi
    # El estado lo da la etiqueta de la opción activa, no el marcador:
    # en la convención de casillas, «x» solo señala la opción vigente.
    etiqueta=""
    if [[ "$linea" != *"|"* ]]; then
      if [[ "$linea" =~ ^\ *(\*\*)?\[.\]\ +(.+)$ ]]; then
        etiqueta="${BASH_REMATCH[2]}"
        etiqueta="${etiqueta//\*\*/}"
        etiqueta="${etiqueta%"${etiqueta##*[![:space:]]}"}"
      fi
    elif [[ "$linea" == *"**"* ]]; then
      activas=$(printf '%s' "$linea" | tr '|' '\n' | grep -cF '**' || true)
      if [ "$activas" -eq 1 ]; then
        etiqueta=$(printf '%s' "$linea" | tr '|' '\n' | grep -F '**' | sed -E 's/\*\*//g; s/^ *\[.\] *//; s/ *$//')
      fi
    else
      no_vacias=$(printf '%s' "$linea" | tr '|' '\n' | grep -E '\[[^ ]' | sed -E 's/^ *\[.\] *//; s/ *$//' || true)
      if [ "$(printf '%s' "$no_vacias" | grep -c .)" -eq 1 ]; then
        etiqueta="$no_vacias"
      fi
    fi
    case "$etiqueta" in
      Pendiente) echo pendiente ;;
      "En progreso") echo en-progreso ;;
      "En revisión") echo en-revision ;;
      Completada) echo completada ;;
      Bloqueada) echo bloqueada ;;
      *) echo "tarea.sh: estado no parseado en $f: $linea" >&2; exit 1 ;;
    esac
    ;;

  secciones)
    awk '/^## / { print substr($0, 4) }' "$f"
    ;;

  planeacion)
    for s in "Contexto" "Conectividad" "Plan técnico" "Suite de pruebas esperada"; do
      if grep -q "^## ${s}$" "$f"; then
        printf '%s\tpresente\n' "$s"
      else
        printf '%s\tausente\n' "$s"
      fi
    done
    ;;

  dependencias)
    awk '
      /^## Dependencias/ { dentro=1; next }
      /^## / { if (dentro) exit }
      dentro && /^- / {
        linea=$0; sub(/^- */, "", linea)
        if (linea !~ /^\[/ && linea !~ /^Ninguna/) print linea
      }
    ' "$f"
    ;;

  checklist)
    awk '
      /^## Plan técnico/ { dentro=1; next }
      /^## / { if (dentro) exit }
      dentro && index($0, "- [") == 1 && substr($0, 5, 1) == "]" {
        print substr($0, 4, 1) "\t" substr($0, 7)
        next
      }
      dentro && /^[0-9]+\. / {
        item = $0; sub(/\..*/, "", item)
        sub(/^[0-9]+\. */, "")
        print item "\t" $0
      }
    ' "$f"
    ;;

  *) uso ;;
esac
