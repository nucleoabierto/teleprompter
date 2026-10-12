#!/usr/bin/env bash
# Escrituras sobre un archivo de tarea, propuesta o épica.
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito, exit 2 entrada ausente o invocación inválida;
# una mutación ante formato no parseado falla sin escribir.
# ## Estado se escribe siempre en la forma canónica: línea completa de
# opciones con la vigente en negrita, marcador y etiqueta incluidos.
set -euo pipefail

# Convenciones: el instalador escribe los valores del proyecto en
# convenciones.sh; una clave ausente rige por el valor por defecto.
conv="$(dirname "$0")/convenciones.sh"
if [ -f "$conv" ]; then
  . "$conv" 2>/dev/null || { echo "tarea.sh: convenciones malformadas: $conv" >&2; exit 2; }
fi
export MARCA_PENDIENTE=${MARCA_PENDIENTE:-" "}
export MARCA_EN_PROGRESO=${MARCA_EN_PROGRESO:-"~"}
export MARCA_EN_REVISION=${MARCA_EN_REVISION:-r}
export MARCA_COMPLETADA=${MARCA_COMPLETADA:-x}
export MARCA_BLOQUEADA=${MARCA_BLOQUEADA:-"!"}
export MARCA_PROPUESTA=${MARCA_PROPUESTA:-p}
export MARCA_APROBADA=${MARCA_APROBADA:-a}
export MARCA_DESCARTADA=${MARCA_DESCARTADA:-d}
export ESTADO_PENDIENTE=${ESTADO_PENDIENTE:-Pendiente}
export ESTADO_EN_PROGRESO=${ESTADO_EN_PROGRESO:-En progreso}
export ESTADO_EN_REVISION=${ESTADO_EN_REVISION:-En revisión}
export ESTADO_COMPLETADA=${ESTADO_COMPLETADA:-Completada}
export ESTADO_BLOQUEADA=${ESTADO_BLOQUEADA:-Bloqueada}
export ESTADO_BORRADOR=${ESTADO_BORRADOR:-Borrador}
export ESTADO_PENDIENTE_REVISION=${ESTADO_PENDIENTE_REVISION:-Pendiente de revisión}
export ESTADO_APROBADA=${ESTADO_APROBADA:-Aprobada}
export ESTADO_DESCARTADA=${ESTADO_DESCARTADA:-Descartada}
export SECCION_ESTADO=${SECCION_ESTADO:-Estado}
export SECCION_REVISION=${SECCION_REVISION:-Revisión}
export SECCION_DESVIACIONES=${SECCION_DESVIACIONES:-Desviaciones del plan}
export MARCADOR_FECHA=${MARCADOR_FECHA:-'[fecha]'}
rev_re=$(printf '%s' "$SECCION_REVISION" | sed 's/[][\.*^$/]/\\&/g')

uso() {
  cat >&2 <<'EOF'
uso: tarea.sh <archivo> <operación> [argumentos]
operaciones:
  estado <etiqueta>              escribe ## Estado en forma canónica con la
                                 opción <etiqueta> vigente (tareas y propuestas;
                                 tolera las variantes históricas)
  marcar-opcion <etiqueta>       marca «[x]» la opción <etiqueta> de la línea de
                                 opciones sin tocar las demás (épicas)
  insertar-seccion <título>      inserta «## <título>» con el cuerpo leído de
                                 stdin, antes de «## Desviaciones del plan» si
                                 existe o de «## Revisión»
  registrar-revision <línea>     registra «- Autor: fecha — veredicto» en
                                 ## Revisión: rellena el placeholder del autor
                                 o añade la línea al final de la sección
  añadir-linea <sección> <línea> añade la línea al final de la sección indicada
  marcar-item <sección> <texto>  marca «[x]» los ítems de checklist de la
                                 sección que contienen <texto>
  sustituir-item <sección> <texto>
                                 sustituye el ítem de checklist que contiene
                                 <texto> —con sus sub-bullets— por el contenido
                                 leído de stdin
EOF
  exit 2
}

[ $# -ge 2 ] || uso
f=$1; op=$2; shift 2
[ -f "$f" ] || { echo "tarea.sh: archivo ausente: $f" >&2; exit 2; }

tmp=$(mktemp "${TMPDIR:-/tmp}/tarea.XXXXXX")
trap 'rm -f "$tmp"' EXIT

case "$op" in

  estado)
    [ $# -ge 1 ] || uso
    etiqueta=$1
    linea=$(awk -v s="$SECCION_ESTADO" 'index($0, "## " s) == 1 { while ((getline) > 0 && $0 ~ /^[[:space:]]*$/) ; print; exit }' "$f")
    [ -n "$linea" ] || { echo "tarea.sh: ## $SECCION_ESTADO vacío o ausente en $f" >&2; exit 1; }
    if [[ "$linea" == *"|"* ]]; then
      # línea de opciones: conservar marcadores y etiquetas, activar la pedida
      nueva=$(printf '%s' "$linea" | tr '|' '\n' | awk -v etq="$etiqueta" '
        BEGIN {
          canon[ENVIRON["ESTADO_PENDIENTE"]] = ENVIRON["MARCA_PENDIENTE"]
          canon[ENVIRON["ESTADO_EN_PROGRESO"]] = ENVIRON["MARCA_EN_PROGRESO"]
          canon[ENVIRON["ESTADO_EN_REVISION"]] = ENVIRON["MARCA_EN_REVISION"]
          canon[ENVIRON["ESTADO_COMPLETADA"]] = ENVIRON["MARCA_COMPLETADA"]
          canon[ENVIRON["ESTADO_BLOQUEADA"]] = ENVIRON["MARCA_BLOQUEADA"]
          canon[ENVIRON["ESTADO_BORRADOR"]] = ENVIRON["MARCA_PENDIENTE"]
          canon[ENVIRON["ESTADO_PENDIENTE_REVISION"]] = ENVIRON["MARCA_PROPUESTA"]
          canon[ENVIRON["ESTADO_APROBADA"]] = ENVIRON["MARCA_APROBADA"]
          canon[ENVIRON["ESTADO_DESCARTADA"]] = ENVIRON["MARCA_DESCARTADA"]
        }
        {
          op = $0
          gsub(/\*\*/, "", op)
          sub(/^[[:space:]]+/, "", op); sub(/[[:space:]]+$/, "", op)
          if (op !~ /^\[.\]/) exit 1
          marca = substr(op, 2, 1)
          etiq = substr(op, 5)
          sub(/^[[:space:]]+/, "", etiq); sub(/[[:space:]]+$/, "", etiq)
          if (etiq in canon) marca = canon[etiq]
          if (etiq == etq) { activa = NR; }
          salida[NR] = "[" marca "] " etiq
        }
        END {
          if (NR == 0 || activa == 0) exit 1
          for (i = 1; i <= NR; i++) {
            s = salida[i]
            if (i == activa) s = "**" s "**"
            printf "%s%s", s, (i < NR ? " | " : "\n")
          }
        }
      ') || { echo "tarea.sh: opción «$etiqueta» no encontrada en $f: $linea" >&2; exit 1; }
    else
      # forma suelta: el conjunto de opciones lo decide la etiqueta existente
      actual=$(printf '%s' "$linea" | sed -E 's/\*\*//g; s/^[[:space:]]+//; s/^ *\[.\] *//; s/[[:space:]]+$//')
      case "$actual" in
        "$ESTADO_PENDIENTE"|"$ESTADO_EN_PROGRESO"|"$ESTADO_EN_REVISION"|"$ESTADO_COMPLETADA"|"$ESTADO_BLOQUEADA")
          opciones="[$MARCA_PENDIENTE] $ESTADO_PENDIENTE | [$MARCA_EN_PROGRESO] $ESTADO_EN_PROGRESO | [$MARCA_EN_REVISION] $ESTADO_EN_REVISION | [$MARCA_COMPLETADA] $ESTADO_COMPLETADA | [$MARCA_BLOQUEADA] $ESTADO_BLOQUEADA" ;;
        "$ESTADO_BORRADOR"|"$ESTADO_PENDIENTE_REVISION"|"$ESTADO_APROBADA"|"$ESTADO_DESCARTADA")
          opciones="[$MARCA_PENDIENTE] $ESTADO_BORRADOR | [$MARCA_PROPUESTA] $ESTADO_PENDIENTE_REVISION | [$MARCA_APROBADA] $ESTADO_APROBADA | [$MARCA_DESCARTADA] $ESTADO_DESCARTADA" ;;
        *) echo "tarea.sh: ## $SECCION_ESTADO no parseado en $f: $linea" >&2; exit 1 ;;
      esac
      nueva=$(printf '%s' "$opciones" | tr '|' '\n' | awk -v etq="$etiqueta" '
        {
          op = $0; sub(/^[[:space:]]+/, "", op); sub(/[[:space:]]+$/, "", op)
          etiq = substr(op, 5); sub(/^[[:space:]]+/, "", etiq); sub(/[[:space:]]+$/, "", etiq)
          if (etiq == etq) activa = NR
          salida[NR] = op
        }
        END {
          if (activa == 0) exit 1
          for (i = 1; i <= NR; i++) {
            s = salida[i]
            if (i == activa) s = "**" s "**"
            printf "%s%s", s, (i < NR ? " | " : "\n")
          }
        }
      ') || { echo "tarea.sh: opción «$etiqueta» no válida para $f" >&2; exit 1; }
    fi
    awk -v nueva="$nueva" -v s="$SECCION_ESTADO" '
      index($0, "## " s) == 1 { imprime = 1; print; next }
      imprime && /^[[:space:]]*$/ { print; next }
      imprime { print nueva; imprime = 0; next }
      { print }
    ' "$f" > "$tmp" && mv "$tmp" "$f"
    ;;

  marcar-opcion)
    [ $# -ge 1 ] || uso
    etiqueta=$1
    linea=$(awk -v s="$SECCION_ESTADO" 'index($0, "## " s) == 1 { while ((getline) > 0 && $0 ~ /^[[:space:]]*$/) ; print; exit }' "$f")
    [ -n "$linea" ] || { echo "tarea.sh: ## $SECCION_ESTADO vacío o ausente en $f" >&2; exit 1; }
    [[ "$linea" == *"|"* ]] || { echo "tarea.sh: ## $SECCION_ESTADO no es línea de opciones en $f: $linea" >&2; exit 1; }
    nueva=$(printf '%s' "$linea" | tr '|' '\n' | awk -v etq="$etiqueta" '
      {
        op = $0
        limpio = op; gsub(/\*\*/, "", limpio)
        sub(/^[[:space:]]+/, "", limpio); sub(/[[:space:]]+$/, "", limpio)
        etiq = limpio; sub(/^ *\[.\] */, "", etiq); sub(/ *$/, "", etiq)
        if (etiq == etq) { sub(/\[.\]/, "[" ENVIRON["MARCA_COMPLETADA"] "]", limpio); hecho = 1 }
        salida[NR] = limpio
      }
      END {
        if (NR == 0 || !hecho) exit 1
        for (i = 1; i <= NR; i++) printf "%s%s", salida[i], (i < NR ? " | " : "\n")
      }
    ') || { echo "tarea.sh: opción «$etiqueta» no encontrada en $f: $linea" >&2; exit 1; }
    awk -v nueva="$nueva" -v s="$SECCION_ESTADO" '
      index($0, "## " s) == 1 { imprime = 1; print; next }
      imprime && /^[[:space:]]*$/ { print; next }
      imprime { print nueva; imprime = 0; next }
      { print }
    ' "$f" > "$tmp" && mv "$tmp" "$f"
    ;;

  insertar-seccion)
    [ $# -ge 1 ] || uso
    titulo=$1
    cuerpo=$(cat)
    [ -n "$cuerpo" ] || { echo "tarea.sh: cuerpo de sección vacío" >&2; exit 2; }
    grep -qxF "## $titulo" "$f" && { echo "tarea.sh: la sección ya existe en $f: $titulo" >&2; exit 1; }
    grep -q "^## ${rev_re}" "$f" || { echo "tarea.sh: sin ## $SECCION_REVISION en $f" >&2; exit 1; }
    CUERPO="$cuerpo" awk -v titulo="$titulo" -v desv="$SECCION_DESVIACIONES" -v rev="$SECCION_REVISION" '
      BEGIN { n = split(ENVIRON["CUERPO"], c, "\n") }
      {
        l[NR] = $0
        if (index($0, "## " desv) == 1 && titulo != desv && !ancla) ancla = NR
        if (index($0, "## " rev) == 1 && !ancla_rev) ancla_rev = NR
      }
      END {
        a = ancla ? ancla : ancla_rev
        for (i = 1; i < a; i++) print l[i]
        if (l[a - 1] != "") print ""
        print "## " titulo; print ""
        for (i = 1; i <= n; i++) print c[i]
        print ""
        for (i = a; i <= NR; i++) print l[i]
      }
    ' "$f" > "$tmp" && mv "$tmp" "$f"
    ;;

  registrar-revision)
    [ $# -ge 1 ] || uso
    linea=$1
    case $linea in
      -\ *) ;;
      *) linea="- $linea" ;;
    esac
    autor=$(printf '%s' "$linea" | sed -n 's/^- \([^:]*\):.*/\1/p')
    [ -n "$autor" ] || { echo "tarea.sh: línea de revisión mal formada: $linea" >&2; exit 2; }
    grep -q "^## ${rev_re}" "$f" || { echo "tarea.sh: sin ## $SECCION_REVISION en $f" >&2; exit 1; }
    if awk -v autor="$autor" -v nueva="$linea" -v rev="$SECCION_REVISION" -v mf="$MARCADOR_FECHA" '
      index($0, "## " rev) == 1 { dentro = 1; print; next }
      /^## / { dentro = 0 }
      dentro && index($0, "- " autor ":") == 1 && index($0, mf) {
        print nueva; hecho = 1; next
      }
      { print }
      END { if (!hecho) exit 1 }
    ' "$f" > "$tmp"; then
      mv "$tmp" "$f"
    else
      # sin placeholder del autor: añadir al final de la sección
      awk -v nueva="$linea" -v rev="$SECCION_REVISION" '
        { l[NR] = $0; if (index($0, "## " rev) == 1) h = NR }
        END {
          fin = NR + 1
          for (i = h + 1; i <= NR; i++) if (l[i] ~ /^## /) { fin = i; break }
          pos = fin
          while (pos > h + 1 && l[pos - 1] ~ /^[[:space:]]*$/) pos--
          for (i = 1; i < pos; i++) print l[i]
          print nueva; print ""
          for (i = fin; i <= NR; i++) print l[i]
        }
      ' "$f" > "$tmp" && mv "$tmp" "$f"
    fi
    ;;

  añadir-linea)
    [ $# -ge 2 ] || uso
    seccion=$1; linea=$2
    if awk -v seccion="$seccion" -v nueva="$linea" '
      { l[NR] = $0; if ($0 == "## " seccion) h = NR }
      END {
        if (!h) exit 1
        fin = NR + 1
        for (i = h + 1; i <= NR; i++) if (l[i] ~ /^## /) { fin = i; break }
        pos = fin
        while (pos > h + 1 && l[pos - 1] ~ /^[[:space:]]*$/) pos--
        for (i = 1; i < pos; i++) print l[i]
        print nueva; print ""
        for (i = fin; i <= NR; i++) print l[i]
      }
    ' "$f" > "$tmp"; then
      mv "$tmp" "$f"
    else
      echo "tarea.sh: sección no localizada en $f: $seccion" >&2; exit 1
    fi
    ;;

  marcar-item)
    [ $# -ge 2 ] || uso
    seccion=$1; texto=$2
    if awk -v seccion="$seccion" -v texto="$texto" '
      $0 == "## " seccion { dentro = 1; print; next }
      /^## / { dentro = 0 }
      dentro && index($0, "- [" ENVIRON["MARCA_PENDIENTE"] "] ") == 1 && index($0, texto) {
        print "- [" ENVIRON["MARCA_COMPLETADA"] "] " substr($0, 7); hecho = 1; next
      }
      dentro && index($0, "- [" ENVIRON["MARCA_COMPLETADA"] "] ") == 1 && index($0, texto) { hecho = 1 }
      { print }
      END { if (!hecho) exit 1 }
    ' "$f" > "$tmp"; then
      mv "$tmp" "$f"
    else
      echo "tarea.sh: ítem no localizado en «$seccion» de $f: $texto" >&2; exit 1
    fi
    ;;

  sustituir-item)
    [ $# -ge 2 ] || uso
    seccion=$1; texto=$2
    contenido=$(cat)
    [ -n "$contenido" ] || { echo "tarea.sh: contenido de sustitución vacío" >&2; exit 2; }
    if CONTENIDO="$contenido" awk -v seccion="$seccion" -v texto="$texto" '
      BEGIN { n = split(ENVIRON["CONTENIDO"], c, "\n") }
      $0 == "## " seccion { dentro = 1; print; next }
      /^## / { dentro = 0 }
      dentro && !hecho && index($0, "- [") == 1 && index($0, texto) {
        for (i = 1; i <= n; i++) print c[i]
        hecho = 1; tragando = 1; next
      }
      tragando && /^[[:space:]]/ { next }
      { tragando = 0; print }
      END { if (!hecho) exit 1 }
    ' "$f" > "$tmp"; then
      mv "$tmp" "$f"
    else
      echo "tarea.sh: ítem no localizado en «$seccion» de $f: $texto" >&2; exit 1
    fi
    ;;

  *) uso ;;
esac
