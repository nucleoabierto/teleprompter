#!/usr/bin/env bash
# Operaciones sobre el changelog del proyecto evaluado.
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito (incluido el vacío legítimo), exit 2 entrada ausente o
# invocación inválida; exit 1 contenido inválido o destino no hallado.
# exit 3: la sección de no liberados no existe o está vacía donde la
# operación la exige —el «nada que liberar» distinguible.
# Formato: Keep a Changelog —«## [Unreleased]» acumula entradas bajo
# encabezados «### <categoría>», «## [X.Y.Z] - fecha» libera y las
# líneas «[ref]: url» del pie son los enlaces comparativos.
set -euo pipefail

# Convenciones: el instalador escribe los valores del proyecto en
# convenciones.sh; una clave ausente rige por el valor por defecto.
conv="$(dirname "$0")/convenciones.sh"
if [ -f "$conv" ]; then
  . "$conv" 2>/dev/null || { echo "changelog.sh: convenciones malformadas: $conv" >&2; exit 2; }
fi
export ARCHIVO_CHANGELOG=${ARCHIVO_CHANGELOG:-CHANGELOG.md}

uso() {
  cat >&2 <<'EOF'
uso: changelog.sh <objetivo> <operación> [términos]
<objetivo> es la ruta del changelog; en «localizar» es el directorio
donde buscar el archivo.
operaciones:
  localizar            emite la ruta del changelog hallado bajo <objetivo>
                       —CHANGELOG.md y sus alternativas—; salida vacía si
                       no hay ninguno
  volcar               emite el cuerpo de la sección de no liberados;
                       vacío legítimo si está vacía
  buscar <término>     emite las entradas de los no liberados que
                       contienen <término>
  anotar <categoría>   añade las líneas de entrada leídas de stdin bajo su
                       «###» en los no liberados —creando el «###» en el
                       orden canónico si falta—; crea el changelog con su
                       plantilla si no existe
  estado               emite la presencia y vacuidad de los no liberados,
                       la última versión liberada y la presencia de enlaces
  bump                 emite el bump semver que proponen las categorías
                       presentes en los no liberados, y su lista
  promover <X.Y.Z>     promueve los no liberados a «## [X.Y.Z] - hoy»:
                       el cuerpo curado entra por stdin —vacío, se usa el
                       existente—; abre un Unreleased nuevo y actualiza
                       los enlaces del pie cuando los hay
  yank <X.Y.Z>         añade «[YANKED]» al encabezado de la versión
EOF
  exit 2
}

[ $# -ge 2 ] || uso
obj=$1; op=$2; shift 2

orden="Added Changed Deprecated Removed Fixed Security"

plantilla='# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/en/2.0.0/)
y el proyecto se adhiere a [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [Unreleased]'

# Sustituye $obj por $1 solo si difieren, conservando la ausencia de
# salto de línea final del original.
aplicar() {
  tmp=$1
  if [ -s "$obj" ] && [ -n "$(tail -c 1 "$obj")" ]; then
    printf '%s' "$(cat "$tmp")" > "$tmp"
  fi
  if cmp -s "$tmp" "$obj"; then rm -f "$tmp"; else mv "$tmp" "$obj"; fi
}

case "$op" in
  localizar|anotar) ;;
  *) [ -f "$obj" ] || { echo "changelog.sh: archivo ausente: $obj" >&2; exit 2; } ;;
esac
if [ "$op" = "anotar" ] && [ -d "$obj" ]; then
  echo "changelog.sh: el objetivo es un directorio: $obj" >&2
  exit 2
fi

case "$op" in

  localizar)
    [ -d "$obj" ] || { echo "changelog.sh: directorio ausente: $obj" >&2; exit 2; }
    for cand in "$ARCHIVO_CHANGELOG" CHANGELOG.md CHANGELOG.txt CHANGELOG.rst CHANGELOG.markdown CHANGELOG Changelog.md changelog.md HISTORY.md HISTORY.txt HISTORY NEWS.md NEWS.txt NEWS; do
      if [ -f "$obj/$cand" ]; then
        printf '%s\n' "$obj/$cand"
        exit 0
      fi
    done
    ;;

  volcar)
    awk '
      /^## \[Unreleased\]/ { en = 1; visto = 1; next }
      en && (/^## / || /^\[[^]]+\]:/) { en = 0 }
      en { cuerpo = cuerpo $0 "\n" }
      END {
        if (!visto) {
          printf "changelog.sh: sin sección de no liberados\n" > "/dev/stderr"
          exit 3
        }
        gsub(/^\n+|\n+$/, "", cuerpo)
        if (cuerpo != "") printf "%s\n", cuerpo
      }' "$obj"
    ;;

  buscar)
    [ $# -ge 1 ] || uso
    awk -v term="$1" '
      /^## \[Unreleased\]/ { en = 1; visto = 1; next }
      en && (/^## / || /^\[[^]]+\]:/) { en = 0 }
      en && /^- / && index($0, term) { print }
      END {
        if (!visto) {
          printf "changelog.sh: sin sección de no liberados\n" > "/dev/stderr"
          exit 3
        }
      }' "$obj"
    ;;

  anotar)
    [ $# -ge 1 ] || uso
    cat=$1
    case " $orden " in
      *" $cat "*) ;;
      *) echo "changelog.sh: categoría no reconocida: $cat" >&2; uso ;;
    esac
    entrada=$(cat)
    if [ -z "$(printf '%s' "$entrada" | tr -d '[:space:]')" ]; then
      echo "changelog.sh: entrada vacía" >&2; exit 1
    fi
    if ! printf '%s\n' "$entrada" | awk 'NF && $0 !~ /^- / { exit 1 }'; then
      echo "changelog.sh: cada línea de la entrada debe empezar por «- »" >&2
      exit 1
    fi
    [ -s "$obj" ] || printf '%s\n' "$plantilla" > "$obj"
    tmp=$(mktemp "${TMPDIR:-/tmp}/changelog.XXXXXX")
    entrada="$entrada" awk -v cat="$cat" -v orden="$orden" '
      BEGIN {
        n = split(orden, c, " ")
        for (i = 1; i <= n; i++) rango[c[i]] = i
        ne = split(ENVIRON["entrada"], el, "\n")
      }
      { L[NR] = $0 }
      END {
        # Localizar la sección de no liberados.
        u_ini = 0
        for (i = 1; i <= NR; i++)
          if (L[i] ~ /^## \[Unreleased\]/) { u_ini = i; break }
        if (u_ini) {
          u_fin = NR + 1
          for (i = u_ini + 1; i <= NR; i++)
            if (L[i] ~ /^## / || L[i] ~ /^\[[^]]+\]:/) { u_fin = i; break }
          cat_ini = 0; sig_cat = 0
          for (i = u_ini + 1; i < u_fin; i++) {
            if (L[i] ~ /^### /) {
              h = L[i]; sub(/^### /, "", h); sub(/[[:space:]]*$/, "", h)
              if (h == cat) cat_ini = i
              else if (rango[h] > rango[cat] && !sig_cat) sig_cat = i
            }
          }
          if (cat_ini) {
            ins = cat_ini + 1
            for (i = cat_ini + 1; i < u_fin; i++) {
              if (L[i] ~ /^### /) break
              if (L[i] ~ /[^[:space:]]/) ins = i + 1
            }
            modo = "en-cat"
          } else if (sig_cat) {
            ins = sig_cat
            while (ins - 1 > u_ini && L[ins-1] ~ /^[[:space:]]*$/) ins--
            modo = "nueva-cat"
          } else {
            ins = u_fin
            while (ins - 1 > u_ini && L[ins-1] ~ /^[[:space:]]*$/) ins--
            modo = "nueva-cat"
          }
        } else {
          ins = NR + 1
          for (i = 1; i <= NR; i++)
            if (L[i] ~ /^## / || L[i] ~ /^\[[^]]+\]:/) { ins = i; break }
          while (ins > 1 && L[ins-1] ~ /^[[:space:]]*$/) ins--
          modo = "nueva-seccion"
        }
        for (i = 1; i < ins; i++) print L[i]
        if (modo == "en-cat") {
          if (L[ins-1] ~ /^#/) print ""
          for (e = 1; e <= ne; e++) print el[e]
        } else {
          if (ins > 1) print ""
          if (modo == "nueva-seccion") { print "## [Unreleased]"; print "" }
          print "### " cat; print ""
          for (e = 1; e <= ne; e++) print el[e]
        }
        j = ins
        while (j <= NR && L[j] ~ /^[[:space:]]*$/) j++
        if (j <= NR) print ""
        for (i = j; i <= NR; i++) print L[i]
      }' "$obj" > "$tmp"
    aplicar "$tmp"
    ;;

  estado)
    awk '
      /^## \[Unreleased\]/ { en = 1; visto = 1; next }
      en && (/^## / || /^\[[^]]+\]:/) { en = 0 }
      en && /^- / { hay = 1 }
      /^## \[[0-9]/ && ultima == "" {
        ultima = $0; sub(/^## \[/, "", ultima); sub(/\].*/, "", ultima)
      }
      /^\[Unreleased\]:/ { enlaces = 1 }
      END {
        if (!visto) print "no-liberados: ausente"
        else if (hay) print "no-liberados: con-entradas"
        else print "no-liberados: vacio"
        print "ultima-version: " (ultima == "" ? "ninguna" : ultima)
        print "enlaces: " (enlaces ? "presentes" : "ausentes")
      }' "$obj"
    ;;

  bump)
    awk -v orden="$orden" '
      BEGIN { n = split(orden, c, " "); for (i = 1; i <= n; i++) es_cat[c[i]] = 1 }
      /^## \[Unreleased\]/ { en = 1; visto = 1; next }
      en && (/^## / || /^\[[^]]+\]:/) { en = 0 }
      en && /^### / {
        h = $0; sub(/^### /, "", h); sub(/[[:space:]]*$/, "", h)
        if (h in es_cat) pres[h] = 1
      }
      en && /^- / && /\*\*Breaking:\*\*/ { brk = 1 }
      END {
        if (!visto) {
          printf "changelog.sh: sin sección de no liberados\n" > "/dev/stderr"
          exit 3
        }
        if (brk || pres["Removed"]) b = "major"
        else if (pres["Added"] || pres["Changed"] || pres["Deprecated"]) b = "minor"
        else if (pres["Fixed"] || pres["Security"]) b = "patch"
        else b = "ninguno"
        print "bump: " b
        for (i = 1; i <= n; i++) if (pres[c[i]]) lista = lista " " c[i]
        sub(/^ /, "", lista)
        print "categorias: " (lista == "" ? "ninguna" : lista)
      }' "$obj"
    ;;

  promover)
    [ $# -ge 1 ] || uso
    ver=$1
    if ! [[ "$ver" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "changelog.sh: versión mal formada: $ver" >&2; uso
    fi
    # La versión no debe existir ya como sección.
    if awk -v ver="$ver" '
      /^## \[/ {
        h = $0; sub(/^## \[/, "", h); sub(/\].*/, "", h)
        if (h == ver) dup = 1
      }
      END { exit !dup }' "$obj"; then
      echo "changelog.sh: la versión ya existe: $ver" >&2; exit 1
    fi
    cuerpo=$(awk '
      /^## \[Unreleased\]/ { en = 1; visto = 1; next }
      en && (/^## / || /^\[[^]]+\]:/) { en = 0 }
      en { cuerpo = cuerpo $0 "\n" }
      END {
        if (!visto) exit 3
        gsub(/^\n+|\n+$/, "", cuerpo)
        printf "%s", cuerpo
      }' "$obj") || {
      echo "changelog.sh: sin sección de no liberados" >&2; exit 3
    }
    curado=$(cat)
    [ -n "$(printf '%s' "$curado" | tr -d '[:space:]')" ] || curado=$cuerpo
    # Vacío = sin entradas, el mismo umbral que «estado».
    printf '%s\n' "$curado" | grep -q '^- ' || {
      echo "changelog.sh: no liberados vacíos, nada que promover" >&2
      exit 3
    }
    prev=$(awk '/^## \[[0-9]/ {
      h = $0; sub(/^## \[/, "", h); sub(/\].*/, "", h)
      print h; exit
    }' "$obj")
    # Enlaces comparativos: base y prefijo de etiqueta se derivan de la
    # línea «[Unreleased]:» existente; si no encaja el patrón
    # «compare/<prefijo>X.Y.Z...HEAD» el pie no se toca —failsafe.
    base=""; pfx=""
    enl=$(grep -m1 '^\[Unreleased\]:' "$obj" || true)
    if [ -n "$enl" ]; then
      url=$(printf '%s\n' "$enl" | sed 's/^[^:]*:[[:space:]]*//')
      ref=${url##*/compare/}; ref=${ref%%...*}
      if [[ "$url" == */compare/*...* ]] && [[ "$ref" =~ ^[^0-9]*[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        base=${url%%/compare/*}
        pfx=${ref%%[0-9]*}
      else
        enl=""
        echo "changelog.sh: enlaces del pie no actualizados (patrón no reconocido)" >&2
      fi
    fi
    fecha=$(date +%F)
    tmp=$(mktemp "${TMPDIR:-/tmp}/changelog.XXXXXX")
    cuerpo="$curado" awk -v ver="$ver" -v fecha="$fecha" '
      /^## \[Unreleased\]/ && !hecho {
        print "## [Unreleased]"; print ""
        print "## [" ver "] - " fecha; print ""
        n = split(ENVIRON["cuerpo"], cl, "\n")
        for (i = 1; i <= n; i++) print cl[i]
        en = 1; hecho = 1; next
      }
      en && (/^## / || /^\[[^]]+\]:/) { print ""; en = 0 }
      !en { print }
    ' "$obj" > "$tmp"
    if [ -n "$enl" ]; then
      awk -v ver="$ver" -v base="$base" -v pfx="$pfx" -v prev="$prev" '
        /^\[Unreleased\]:/ {
          print "[Unreleased]: " base "/compare/" pfx ver "...HEAD"
          if (prev != "")
            print "[" ver "]: " base "/compare/" pfx prev "..." pfx ver
          else
            print "[" ver "]: " base "/releases/tag/" pfx ver
          next
        }
        { print }
      ' "$tmp" > "$tmp.2" && mv "$tmp.2" "$tmp"
    fi
    aplicar "$tmp"
    ;;

  yank)
    [ $# -ge 1 ] || uso
    ver=$1
    if ! [[ "$ver" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "changelog.sh: versión mal formada: $ver" >&2; uso
    fi
    if ! awk -v ver="$ver" '
      /^## \[/ {
        h = $0; sub(/^## \[/, "", h); sub(/\].*/, "", h)
        if (h == ver) encontrada = 1
      }
      END { exit !encontrada }' "$obj"; then
      echo "changelog.sh: versión no encontrada: $ver" >&2; exit 1
    fi
    if awk -v ver="$ver" '
      /^## \[/ && /\[YANKED\]/ {
        h = $0; sub(/^## \[/, "", h); sub(/\].*/, "", h)
        if (h == ver) ya = 1
      }
      END { exit !ya }' "$obj"; then
      echo "changelog.sh: $ver ya está marcada [YANKED]" >&2; exit 0
    fi
    tmp=$(mktemp "${TMPDIR:-/tmp}/changelog.XXXXXX")
    awk -v ver="$ver" '
      /^## \[/ {
        h = $0; sub(/^## \[/, "", h); sub(/\].*/, "", h)
        if (h == ver) $0 = $0 " [YANKED]"
      }
      { print }
    ' "$obj" > "$tmp"
    aplicar "$tmp"
    ;;

  *) uso ;;
esac
