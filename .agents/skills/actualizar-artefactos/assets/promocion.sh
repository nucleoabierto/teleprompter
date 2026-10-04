#!/usr/bin/env bash
# Promoción de borradores a tareas definitivas:
# mueve los MM-slug.md de docs/proposals/NNN-slug/ a docs/tasks/NNN-slug.md,
# inyecta ## Estado (forma canónica) y ## Revisión, renumera las dependencias
# «Borrador MM» y actualiza el índice ## Borradores de propuesta.md.
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito, exit 2 entrada ausente o invocación inválida;
# ninguna escritura ocurre si la validación previa falla.
set -euo pipefail

uso() {
  cat >&2 <<'EOF'
uso: promocion.sh <dir-propuesta> promover <dir-tareas> <índice>
promueve los borradores MM-slug.md del directorio a docs/tasks/NNN-slug.md,
con numeración continua tras el máximo del directorio de tareas y del índice;
devuelve una línea por borrador promovido: MM<TAB>NNN<TAB>ruta nueva.
El cambio de estado de propuesta.md y la retirada de su línea del índice
son órdenes aparte que delega el consumidor.
EOF
  exit 2
}

[ $# -ge 2 ] || uso
dir=$1; op=$2; shift 2
[ "$op" = "promover" ] || uso
[ $# -ge 2 ] || uso
tareas_dir=$1; indice=$2

[ -d "$dir" ] || { echo "promocion.sh: directorio ausente: $dir" >&2; exit 2; }
prop="$dir/propuesta.md"
[ -f "$prop" ] || { echo "promocion.sh: sin propuesta.md en $dir" >&2; exit 2; }
[ -d "$tareas_dir" ] || { echo "promocion.sh: directorio de tareas ausente: $tareas_dir" >&2; exit 2; }
[ -f "$indice" ] || { echo "promocion.sh: índice ausente: $indice" >&2; exit 2; }

# borradores ordenados
drafts=()
while IFS= read -r d; do drafts+=("$d"); done < <(find "$dir" -maxdepth 1 -name '[0-9][0-9]-*.md' -print | sort)
[ "${#drafts[@]}" -gt 0 ] || { echo "promocion.sh: sin borradores en $dir" >&2; exit 1; }

# base de numeración: máximo del directorio de tareas y del índice
# (en el índice las líneas referencian la ruta tal como la usa el proyecto;
# casamos por el nombre del directorio de tareas)
tareas_base=$(basename "$tareas_dir")
maxd=$(find "$tareas_dir" -maxdepth 1 -name '[0-9]*' -print |
       sed -n 's|.*/\([0-9][0-9]*\).*|\1|p' | sort -n | tail -1)
maxi=$(grep -oE "$tareas_base/[0-9]+" "$indice" | grep -oE '[0-9]+' | sort -n | tail -1 || true)
base=$(( 10#${maxd:-0} > 10#${maxi:-0} ? 10#${maxd:-0} : 10#${maxi:-0} ))

# mapa MM -> NNN (arrays indexados: compatible con bash 3.2)
mms=(); nnns=()
n=$base
for d in "${drafts[@]}"; do
  mm=$(basename "$d" | cut -d- -f1)
  n=$((n + 1))
  mms+=("$mm"); nnns+=("$(printf '%03d' "$n")")
done
mapa_str=""
for i in "${!mms[@]}"; do mapa_str="$mapa_str ${mms[$i]}=${nnns[$i]}"; done
mapa_get() {
  local i
  for i in "${!mms[@]}"; do
    [ "${mms[$i]}" = "$1" ] && { printf '%s' "${nnns[$i]}"; return 0; }
  done
  return 1
}

# validación previa: toda referencia «Borrador MM» de los borradores y todo
# MM-slug.md del índice de propuesta.md deben resolver a una tarea asignada
fallo=0
for d in "${drafts[@]}"; do
  while IFS= read -r ref; do
    num=$(printf '%s' "$ref" | grep -oE '[0-9]+' | tail -1)
    num=$(printf '%02d' "$((10#$num))")
    if ! mapa_get "$num" >/dev/null; then
      echo "promocion.sh: dependencia no resoluble en $d: $ref" >&2; fallo=1
    fi
  done < <(awk '/^## Dependencias/ { d=1; next } /^## / { d=0 } d' "$d" | grep -oE 'Borrador[[:space:]]+[0-9]+' || true)
done
while IFS= read -r ref; do
  mm=$(printf '%s' "$ref" | cut -d- -f1 | tr -d '`')
  [ -f "$dir/$ref" ] || { echo "promocion.sh: borrador del índice ausente: $dir/$ref" >&2; fallo=1; }
  if ! mapa_get "$mm" >/dev/null && [ -f "$dir/$ref" ]; then
    echo "promocion.sh: borrador sin serie válida: $ref" >&2; fallo=1
  fi
done < <(awk '/^## Borradores/ { d=1; next } /^## / { d=0 } d' "$prop" | grep -oE '`[0-9][0-9]-[^`[:space:]]*\.md' | sed 's/`//g' || true)

# los borradores deben tener secciones donde inyectar y no traerlas ya
for d in "${drafts[@]}"; do
  grep -q '^## ' "$d" || { echo "promocion.sh: borrador sin secciones ##: $d" >&2; fallo=1; }
  if grep -q '^## Estado' "$d"; then echo "promocion.sh: el borrador ya trae ## Estado: $d" >&2; fallo=1; fi
  if grep -q '^## Revisión' "$d"; then echo "promocion.sh: el borrador ya trae ## Revisión: $d" >&2; fallo=1; fi
done
[ "$fallo" -eq 0 ] || exit 1

# aviso: un borrador del directorio no listado en el índice se promueve igual,
# pero su línea no existe para actualizarla
for d in "${drafts[@]}"; do
  base_d=$(basename "$d")
  grep -qF "$base_d" "$prop" || echo "promocion.sh: borrador no listado en el índice de $prop: $base_d" >&2
done

# promoción de cada borrador
ESTADO='**[ ] Pendiente** | [~] En progreso | [r] En revisión | [x] Completada | [!] Bloqueada'
REV='## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]'

for d in "${drafts[@]}"; do
  mm=$(basename "$d" | cut -d- -f1)
  nnn=$(mapa_get "$mm")
  slug=$(basename "$d" | sed "s/^${mm}-//")
  destino="$tareas_dir/$nnn-$slug"
  EST="$ESTADO" REVB="$REV" awk -v mapa_str="$mapa_str" '
    BEGIN {
      estado = ENVIRON["EST"]; rev = ENVIRON["REVB"]
      m = split(mapa_str, pares, " ")
      for (i = 1; i <= m; i++) if (pares[i] != "") {
        split(pares[i], kv, "="); mapa[kv[1]] = kv[2]
      }
      inyectado = 0
    }
    !inyectado && /^## / {
      print "## Estado"; print ""; print estado; print ""
      inyectado = 1
    }
    /^## Dependencias/ { dentro = 1; print; next }
    /^## / { dentro = 0 }
    dentro {
      resto = $0; linea = ""
      while (match(resto, /Borrador[[:space:]]+0*[0-9]+/)) {
        tok = substr(resto, RSTART, RLENGTH)
        num = tok; gsub(/[^0-9]/, "", num)
        num = sprintf("%02d", num + 0)
        rep = (num in mapa) ? mapa[num] : tok
        linea = linea substr(resto, 1, RSTART - 1) rep
        resto = substr(resto, RSTART + RLENGTH)
      }
      print linea resto; next
    }
    { print }
    END { print ""; print rev }
  ' "$d" > "$destino"
  rm "$d"
  printf '%s\t%s\t%s\n' "$mm" "$nnn" "$destino"
done

# índice de propuesta.md: cada borrador apunta a su tarea definitiva
tmp=$(mktemp "${TMPDIR:-/tmp}/promocion.XXXXXX")
trap 'rm -f "$tmp"' EXIT
awk -v mapa_str="$mapa_str" -v dir_tareas="$tareas_dir" '
  BEGIN {
    m = split(mapa_str, pares, " ")
    for (i = 1; i <= m; i++) if (pares[i] != "") {
      split(pares[i], kv, "="); mapa[kv[1]] = kv[2]
    }
  }
  /^## Borradores/ { dentro = 1 }
  /^## / && !/^## Borradores/ { dentro = 0 }
  dentro && index($0, "- `") == 1 {
    linea = $0
    if (match(linea, /`[0-9][0-9]-[^`]*\.md`/)) {
      tok = substr(linea, RSTART + 1, RLENGTH - 2)
      mm = substr(tok, 1, 2)
      if (mm in mapa) {
        slug = tok; sub(/^[0-9][0-9]-/, "", slug); sub(/\.md$/, "", slug)
        rep = dir_tareas "/" mapa[mm] "-" slug ".md"
        linea = substr(linea, 1, RSTART) rep substr(linea, RSTART + RLENGTH - 1)
      }
    }
    resto = linea; linea = ""
    while (match(resto, /depende de [0-9]+/)) {
      tok = substr(resto, RSTART, RLENGTH)
      num = tok; gsub(/[^0-9]/, "", num)
      num = sprintf("%02d", num + 0)
      rep = (num in mapa) ? "depende de " mapa[num] : tok
      linea = linea substr(resto, 1, RSTART - 1) rep
      resto = substr(resto, RSTART + RLENGTH)
    }
    print linea resto; next
  }
  { print }
' "$prop" > "$tmp" && mv "$tmp" "$prop"
