#!/usr/bin/env bash
# Escrituras sobre el índice de tareas (TODO.md).
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito, exit 2 entrada ausente o invocación inválida;
# una mutación ante formato no parseado falla sin escribir.
set -euo pipefail

# Convenciones: el instalador escribe los valores del proyecto en
# convenciones.sh; una clave ausente rige por el valor por defecto.
conv="$(dirname "$0")/convenciones.sh"
if [ -f "$conv" ]; then
  . "$conv" 2>/dev/null || { echo "todo.sh: convenciones malformadas: $conv" >&2; exit 2; }
fi
export MARCA_PENDIENTE=${MARCA_PENDIENTE:-" "}
export MARCA_EN_PROGRESO=${MARCA_EN_PROGRESO:-"~"}
export MARCA_EN_REVISION=${MARCA_EN_REVISION:-r}
export MARCA_COMPLETADA=${MARCA_COMPLETADA:-x}
export MARCA_BLOQUEADA=${MARCA_BLOQUEADA:-"!"}
export MARCA_PROPUESTA=${MARCA_PROPUESTA:-p}
export SECCION_GENERAL=${SECCION_GENERAL:-General}
export SECCION_PROPUESTAS=${SECCION_PROPUESTAS:-Propuestas en revisión}
export SECCION_PROPUESTAS_CORTA=${SECCION_PROPUESTAS%% *}
export SECCION_HITO=${SECCION_HITO:-Hito}
export COMENTARIO_EPICA=${COMENTARIO_EPICA:-épica}
export FORMATO_BLOQUEANTE=${FORMATO_BLOQUEANTE:-'  - [ ] %s'}
export DIR_TAREAS=${DIR_TAREAS:-docs/tasks}
export ANCHO_NUMERACION=${ANCHO_NUMERACION:-3}
export ESTADO_PENDIENTE=${ESTADO_PENDIENTE:-Pendiente}
export ESTADO_EN_PROGRESO=${ESTADO_EN_PROGRESO:-En progreso}
export ESTADO_EN_REVISION=${ESTADO_EN_REVISION:-En revisión}
export ESTADO_COMPLETADA=${ESTADO_COMPLETADA:-Completada}
export ESTADO_BLOQUEADA=${ESTADO_BLOQUEADA:-Bloqueada}

uso() {
  cat >&2 <<'EOF'
uso: todo.sh <índice> <operación> [argumentos]
operaciones:
  marcar <ref> <marca> [bloqueante…]   marca la línea que contiene <ref>; la marca «!»
                                     reemplaza la sublista con los bloqueantes dados
                                     y otra marca la retira
  añadir <sección> <línea>             añade la línea al final de la sección: «general»,
                                     «propuestas» o texto del encabezado; crea la
                                     sección si falta (General al inicio de las
                                     agrupaciones, Propuestas al final)
  retirar <ref>                        elimina la línea que contiene <ref> con su sublista
  mover <ref> <encabezado>             mueve la línea (con su sublista) bajo el encabezado
                                     que contiene <encabezado>
  recolocar <ref> <pos> [ref2]         recoloca el bloque —grupo entero o línea con su
                                     sublista— que contiene <ref>: «antes-de» o
                                     «después-de» <ref2>, o «final» (antes de la
                                     sección de propuestas)
  retirar-grupo <ref>                  elimina el encabezado que contiene <ref> con su
                                     comentario de épica y todas sus líneas
  encabezado <título> [épica]          crea «## Hito N: título» con el siguiente N, al
                                     final de las agrupaciones; con <épica> añade el
                                     comentario de enlace; devuelve el encabezado creado
  inicializar                          crea el índice con la estructura de la convención
EOF
  exit 2
}

[ $# -ge 2 ] || uso
indice=$1; op=$2; shift 2
if [ "$op" != "inicializar" ]; then
  [ -f "$indice" ] || { echo "todo.sh: índice ausente: $indice" >&2; exit 2; }
fi

tmp=$(mktemp "${TMPDIR:-/tmp}/todo.XXXXXX")
trap 'rm -f "$tmp"' EXIT

# Espacios de la convención tras una mutación: una línea en blanco antes de
# cada encabezado y entre el encabezado (o su comentario de épica) y la
# primera línea de tarea.
normalizar() {
  awk '
    NR > 1 && /^## / && prev != "" { print "" }
    NR > 1 && /^- \[/ && (prev ~ /^## / || prev ~ /^<!--/) { print "" }
    { print; prev = $0 }
  ' "$1"
}

case "$op" in

  marcar)
    [ $# -ge 2 ] || uso
    ref=$1; marca=$2; shift 2
    case "$marca" in "$MARCA_PENDIENTE"|"$MARCA_EN_PROGRESO"|"$MARCA_EN_REVISION"|"$MARCA_COMPLETADA"|"$MARCA_BLOQUEADA") ;; *)
      echo "todo.sh: marca inválida: «$marca»" >&2; exit 2 ;; esac
    bloqs=$(printf '%s\n' "$@")
    if BLOQS="$bloqs" awk -v ref="$ref" -v marca="$marca" '
      BEGIN {
        n = split(ENVIRON["BLOQS"], b, "\n")
        fmt = ENVIRON["FORMATO_BLOQUEANTE"]
        fi = index(fmt, "%s")
        pre = substr(fmt, 1, fi - 1); post = substr(fmt, fi + 2)
      }
      !hecho && index($0, "- [") == 1 && substr($0, 5, 1) == "]" && index($0, ref) {
        print "- [" marca "] " substr($0, 7)
        if (marca == ENVIRON["MARCA_BLOQUEADA"])
          for (i = 1; i <= n; i++) if (b[i] != "") print pre b[i] post
        hecho = 1; tragando = 1; next
      }
      tragando && /^[[:space:]]/ { next }
      { tragando = 0; print }
      END { if (!hecho) exit 1 }
    ' "$indice" > "$tmp"; then
      normalizar "$tmp" > "$tmp.n" && mv "$tmp.n" "$tmp"
      mv "$tmp" "$indice"
    else
      echo "todo.sh: línea no localizada en $indice: $ref" >&2; exit 1
    fi
    ;;

  añadir)
    [ $# -ge 2 ] || uso
    seccion=$1; nueva=$2
    if awk -v seccion="$seccion" -v nueva="$nueva" '
      { l[NR] = $0 }
      END {
        n = NR; h = 0
        if (seccion == "general" || seccion == "propuestas") {
          destino = (seccion == "general") \
            ? "## " ENVIRON["SECCION_GENERAL"] : "## " ENVIRON["SECCION_PROPUESTAS"]
          for (i = 1; i <= n; i++) if (l[i] == destino) { h = i; break }
          if (h == 0) {
            if (seccion == "general") {
              pos = n + 1
              for (i = 1; i <= n; i++) if (l[i] ~ /^## /) { pos = i; break }
              for (i = 1; i < pos; i++) print l[i]
              print destino; print ""; print nueva; print ""
              for (i = pos; i <= n; i++) print l[i]
            } else {
              for (i = 1; i <= n; i++) print l[i]
              if (l[n] != "") print ""
              print destino; print ""; print nueva
            }
            exit 0
          }
        } else {
          for (i = 1; i <= n; i++)
            if (l[i] ~ /^## / && index(l[i], seccion)) { h = i; break }
          if (h == 0) exit 1
        }
        fin = n + 1
        for (i = h + 1; i <= n; i++) if (l[i] ~ /^## /) { fin = i; break }
        pos = fin
        while (pos > h + 1 && l[pos - 1] ~ /^[[:space:]]*$/) pos--
        for (i = 1; i < pos; i++) print l[i]
        if (pos > 1 && l[pos - 1] ~ /^## /) print ""
        print nueva; print ""
        for (i = fin; i <= n; i++) print l[i]
      }
    ' "$indice" > "$tmp"; then
      normalizar "$tmp" > "$tmp.n" && mv "$tmp.n" "$tmp"
      mv "$tmp" "$indice"
    else
      echo "todo.sh: sección no localizada en $indice: $seccion" >&2; exit 1
    fi
    ;;

  retirar)
    [ $# -ge 1 ] || uso
    ref=$1
    if awk -v ref="$ref" '
      !hecho && index($0, "- [") == 1 && substr($0, 5, 1) == "]" && index($0, ref) {
        hecho = 1; tragando = 1; next
      }
      tragando && /^[[:space:]]/ { next }
      { tragando = 0; print }
      END { if (!hecho) exit 1 }
    ' "$indice" > "$tmp"; then
      normalizar "$tmp" > "$tmp.n" && mv "$tmp.n" "$tmp"
      mv "$tmp" "$indice"
    else
      echo "todo.sh: línea no localizada en $indice: $ref" >&2; exit 1
    fi
    ;;

  mover)
    [ $# -ge 2 ] || uso
    ref=$1; enc=$2
    rc=0
    awk -v ref="$ref" -v enc="$enc" '
      { l[NR] = $0 }
      END {
        n = NR; ini = 0
        for (i = 1; i <= n; i++)
          if (substr(l[i], 1, 3) == "- [" && substr(l[i], 5, 1) == "]" && index(l[i], ref)) { ini = i; break }
        if (ini == 0) exit 3
        fin = ini
        while (fin + 1 <= n && l[fin + 1] ~ /^[[:space:]]/ && l[fin + 1] != "") fin++
        nr = 0
        for (i = 1; i <= n; i++) if (i < ini || i > fin) r[++nr] = l[i]
        h = 0
        for (i = 1; i <= nr; i++)
          if (r[i] ~ /^## / && index(r[i], enc)) { h = i; break }
        if (h == 0) exit 4
        fin_b = nr + 1
        for (i = h + 1; i <= nr; i++) if (r[i] ~ /^## /) { fin_b = i; break }
        pos = fin_b
        while (pos > h + 1 && r[pos - 1] ~ /^[[:space:]]*$/) pos--
        for (i = 1; i < pos; i++) print r[i]
        if (pos > 1 && r[pos - 1] ~ /^## /) print ""
        for (j = ini; j <= fin; j++) print l[j]
        print ""
        for (i = fin_b; i <= nr; i++) print r[i]
      }
    ' "$indice" > "$tmp" || rc=$?
    if [ "$rc" -eq 0 ]; then
      normalizar "$tmp" > "$tmp.n" && mv "$tmp.n" "$tmp"
      mv "$tmp" "$indice"
    elif [ "$rc" -eq 4 ]; then
      echo "todo.sh: encabezado no localizado en $indice: $enc" >&2; exit 1
    else
      echo "todo.sh: línea no localizada en $indice: $ref" >&2; exit 1
    fi
    ;;

  recolocar)
    [ $# -ge 2 ] || uso
    ref=$1; pos=$2; ref2=${3:-}
    case "$pos" in antes-de|después-de|final) ;; *) uso ;; esac
    [ "$pos" = "final" ] || [ -n "$ref2" ] || uso
    rc=0
    awk -v ref="$ref" -v pos="$pos" -v ref2="$ref2" '
      { l[NR] = $0 }
      END {
        n = NR; ai = 0; af = 0
        for (i = 1; i <= n; i++)
          if (l[i] ~ /^## / && index(l[i], ref)) {
            ai = i; af = n
            for (j = i + 1; j <= n; j++) if (l[j] ~ /^## /) { af = j - 1; break }
            break
          }
        if (ai == 0)
          for (i = 1; i <= n; i++)
            if (substr(l[i], 1, 3) == "- [" && substr(l[i], 5, 1) == "]" && index(l[i], ref)) {
              ai = i; af = i
              while (af + 1 <= n && l[af + 1] ~ /^[[:space:]]/ && l[af + 1] != "") af++
              break
            }
        if (ai == 0) exit 3
        na = 0
        for (j = ai; j <= af; j++) { a[++na] = l[j]; m[j] = 1 }
        p = 0
        if (pos == "final") {
          p = n + 1
          for (i = 1; i <= n; i++) if (index(l[i], "## " ENVIRON["SECCION_PROPUESTAS_CORTA"]) == 1) { p = i; break }
        } else {
          bi = 0; bf = 0
          for (i = 1; i <= n; i++) if (!m[i] && l[i] ~ /^## / && index(l[i], ref2)) {
            bi = i; bf = n
            for (j = i + 1; j <= n; j++) if (l[j] ~ /^## /) { bf = j - 1; break }
            break
          }
          if (bi == 0)
            for (i = 1; i <= n; i++)
              if (!m[i] && substr(l[i], 1, 3) == "- [" && substr(l[i], 5, 1) == "]" && index(l[i], ref2)) {
                bi = i; bf = i
                while (bf + 1 <= n && l[bf + 1] ~ /^[[:space:]]/ && l[bf + 1] != "") bf++
                break
              }
          if (bi == 0) exit 4
          p = (pos == "antes-de") ? bi : bf + 1
        }
        for (i = 1; i <= n; i++) {
          if (i == p) for (j = 1; j <= na; j++) print a[j]
          if (m[i]) continue
          print l[i]
        }
        if (p == n + 1) for (j = 1; j <= na; j++) print a[j]
      }
    ' "$indice" > "$tmp" || rc=$?
    if [ "$rc" -eq 0 ]; then
      normalizar "$tmp" > "$tmp.n" && mv "$tmp.n" "$tmp"
      mv "$tmp" "$indice"
    elif [ "$rc" -eq 4 ]; then
      echo "todo.sh: referencia de destino no localizada en $indice: $ref2" >&2; exit 1
    else
      echo "todo.sh: bloque no localizado en $indice: $ref" >&2; exit 1
    fi
    ;;

  retirar-grupo)
    [ $# -ge 1 ] || uso
    ref=$1
    if awk -v ref="$ref" '
      !hecho && /^## / && index($0, ref) { hecho = 1; tragando = 1; next }
      tragando && /^## / { tragando = 0 }
      tragando { next }
      { print }
      END { if (!hecho) exit 1 }
    ' "$indice" > "$tmp"; then
      normalizar "$tmp" > "$tmp.n" && mv "$tmp.n" "$tmp"
      mv "$tmp" "$indice"
    else
      echo "todo.sh: grupo no localizado en $indice: $ref" >&2; exit 1
    fi
    ;;

  encabezado)
    [ $# -ge 1 ] || uso
    titulo=$1; epica=${2:-}
    n=$(awk -v h="$SECCION_HITO" '
      index($0, "## " h " ") == 1 {
        resto = substr($0, length(h) + 5)
        if (match(resto, /^[0-9]+/)) { v = substr(resto, 1, RLENGTH) + 0; if (v > m) m = v }
      }
      END { print m + 1 }' "$indice")
    encabezado="## $SECCION_HITO $n: $titulo"
    if awk -v encabezado="$encabezado" -v epica="$epica" '
      { l[NR] = $0 }
      END {
        n = NR; p = n + 1
        for (i = 1; i <= n; i++) if (index(l[i], "## " ENVIRON["SECCION_PROPUESTAS_CORTA"]) == 1) { p = i; break }
        for (i = 1; i < p; i++) print l[i]
        print encabezado
        if (epica != "") print "<!-- " ENVIRON["COMENTARIO_EPICA"] ": " epica " -->"
        print ""
        for (i = p; i <= n; i++) print l[i]
      }
    ' "$indice" > "$tmp"; then
      normalizar "$tmp" > "$tmp.n" && mv "$tmp.n" "$tmp"
      mv "$tmp" "$indice"
      printf '%s\n' "$encabezado"
    else
      echo "todo.sh: no se pudo crear el encabezado en $indice" >&2; exit 1
    fi
    ;;

  inicializar)
    [ -e "$indice" ] && { echo "todo.sh: el índice ya existe: $indice" >&2; exit 1; }
    nnn=$(printf '%*s' "$ANCHO_NUMERACION" '' | tr ' ' 'N')
    lp=$(printf '%s' "$ESTADO_PENDIENTE" | tr 'A-Z' 'a-z')
    lep=$(printf '%s' "$ESTADO_EN_PROGRESO" | tr 'A-Z' 'a-z')
    ler=$(printf '%s' "$ESTADO_EN_REVISION" | tr 'A-Z' 'a-z')
    lc=$(printf '%s' "$ESTADO_COMPLETADA" | tr 'A-Z' 'a-z')
    lb=$(printf '%s' "$ESTADO_BLOQUEADA" | tr 'A-Z' 'a-z')
    cat > "$indice" <<EOF
# TODO

<!-- Índice de tareas. Cada tarea se documenta en un archivo individual en $DIR_TAREAS/.
     Formato de cada línea:
     - [estado] $DIR_TAREAS/${nnn}-slug.md — título breve
       estado: [$MARCA_PENDIENTE] $lp, [$MARCA_EN_PROGRESO] $lep, [$MARCA_EN_REVISION] $ler, [$MARCA_COMPLETADA] $lc, [$MARCA_BLOQUEADA] $lb
     Para tareas bloqueadas, añadir sublista con las tareas bloqueantes.
     Las tareas planificadas se agrupan por hito bajo encabezados
     ## $SECCION_HITO N: título. Las tareas sueltas, sin hito propio, viven en
     la sección ## $SECCION_GENERAL, que precede a los hitos.
     El índice solo contiene trabajo activo: los hitos completados se eliminan.
     Al final del archivo, la sección ## $SECCION_PROPUESTAS lista las
     propuestas del flujo de idea a tarea con el marcador [$MARCA_PROPUESTA].
-->


## $SECCION_GENERAL
EOF
    ;;

  *) uso ;;
esac
