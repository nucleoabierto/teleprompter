#!/usr/bin/env bash
# Consultas al índice de tareas (TODO.md).
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito (incluido el vacío legítimo), exit 2 entrada ausente.
set -euo pipefail

# Convenciones: el instalador escribe los valores del proyecto en
# convenciones.sh; una clave ausente rige por el valor por defecto.
conv="$(dirname "$0")/convenciones.sh"
if [ -f "$conv" ]; then
  . "$conv" 2>/dev/null || { echo "todo.sh: convenciones malformadas: $conv" >&2; exit 2; }
fi
export MARCA_PENDIENTE=${MARCA_PENDIENTE:-" "}
export MARCA_EN_PROGRESO="${MARCA_EN_PROGRESO:-"~"}"
export MARCA_EN_REVISION=${MARCA_EN_REVISION:-r}
export MARCA_COMPLETADA=${MARCA_COMPLETADA:-x}
export MARCA_PROPUESTA=${MARCA_PROPUESTA:-p}
export COMENTARIO_EPICA=${COMENTARIO_EPICA:-épica}
export SECCION_GENERAL=${SECCION_GENERAL:-General}
export SECCION_ESTADO=${SECCION_ESTADO:-Estado}
export ESTADO_COMPLETADA=${ESTADO_COMPLETADA:-Completada}
export ESTADO_PLANIFICADA=${ESTADO_PLANIFICADA:-Planificada}

uso() {
  cat >&2 <<'EOF'
uso: todo.sh <indice> <operación> [argumentos]
operaciones:
  siguiente                  primera línea en curso ([~] o [r]); si no hay, primera pendiente
  propuestas                 líneas de propuestas [p]
  grupos                     encabezados ## con su épica enlazada: encabezado<TAB>épica
  estado-grupo <texto>       conteo por estado bajo el encabezado que contiene <texto>
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
      index($0, "- [" ENVIRON["MARCA_EN_PROGRESO"] "] ") == 1 ||
        index($0, "- [" ENVIRON["MARCA_EN_REVISION"] "] ") == 1 { print; encontro=1; exit }
      index($0, "- [" ENVIRON["MARCA_PENDIENTE"] "] ") == 1 && !pendiente { pendiente=$0 }
      END { if (!encontro && pendiente) print pendiente }
    ' "$indice"
    ;;

  propuestas)
    awk 'index($0, "- [" ENVIRON["MARCA_PROPUESTA"] "] ") == 1' "$indice"
    ;;

  grupos)
    awk '
      /^## / {
        if (enc != "") print enc "\t" epica
        enc = substr($0, 4); epica = ""
        next
      }
      index($0, "<!-- " ENVIRON["COMENTARIO_EPICA"] ":") {
        linea = substr($0, index($0, ENVIRON["COMENTARIO_EPICA"] ":") \
          + length(ENVIRON["COMENTARIO_EPICA"]) + 1)
        sub(/^[[:space:]]+/, "", linea)
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

  inventario)
    [ $# -ge 1 ] || uso
    epicas=$1
    [ -d "$epicas" ] || { echo "todo.sh: directorio de épicas ausente: $epicas" >&2; exit 2; }
    for f in "$epicas"/*.md; do
      [ -e "$f" ] || continue
      estado=$(awk -v s="$SECCION_ESTADO" 'index($0, "## " s) == 1 { getline; while ($0 ~ /^[[:space:]]*$/) getline; print; exit }' "$f")
      case "$estado" in
        *"[$MARCA_COMPLETADA] $ESTADO_COMPLETADA"*) e=completada ;;
        *"[$MARCA_COMPLETADA] $ESTADO_PLANIFICADA"*) e=planificada ;;
        *) e=otro ;;
      esac
      printf 'epica\t%s\t%s\n' "$f" "$e"
    done
    awk '
      /^## / {
        if (enc != "") print "grupo\t" enc "\t" epica
        enc = substr($0, 4); epica = ""; sueltas = (enc == ENVIRON["SECCION_GENERAL"])
        next
      }
      index($0, "<!-- " ENVIRON["COMENTARIO_EPICA"] ":") {
        linea = substr($0, index($0, ENVIRON["COMENTARIO_EPICA"] ":") \
          + length(ENVIRON["COMENTARIO_EPICA"]) + 1)
        sub(/^[[:space:]]+/, "", linea)
        sub(/[[:space:]]*-->.*/, "", linea)
        epica = linea
      }
      sueltas && index($0, "- [") == 1 && substr($0, 5, 1) == "]" && substr($0, 4, 1) != ENVIRON["MARCA_COMPLETADA"] {
        print "suelta\t" $0
      }
      END { if (enc != "") print "grupo\t" enc "\t" epica }
    ' "$indice"
    ;;

  *) uso ;;
esac
