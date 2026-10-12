#!/usr/bin/env bash
# Operaciones sobre el registro de experiencias del proyecto.
# Contrato D033: stdout solo datos parseables, stderr diagnósticos,
# exit 0 éxito (incluido el vacío legítimo), exit 2 entrada ausente.
# Las lecturas exigen el registro; las escrituras lo crean si falta.
# Lectura tolerante (una entrada empieza en «- Id:» y los campos pueden
# ir envueltos); escritura canónica: un campo por línea, sin envolver.
set -euo pipefail

# Convenciones: el instalador escribe los valores del proyecto en
# convenciones.sh; una clave ausente rige por el valor por defecto.
conv="$(dirname "$0")/convenciones.sh"
if [ -f "$conv" ]; then
  . "$conv" 2>/dev/null || { echo "experiencias.sh: convenciones malformadas: $conv" >&2; exit 2; }
fi
export CAMPOS_EXPERIENCIA=${CAMPOS_EXPERIENCIA:-'Id Tarea Esperado Obtenido Corrección'}
export CAMPO_ESTADO_EXPERIENCIA=${CAMPO_ESTADO_EXPERIENCIA:-Estado}
export ESTADO_EXPERIENCIA_PENDIENTE=${ESTADO_EXPERIENCIA_PENDIENTE:-pendiente}
export ESTADO_EXPERIENCIA_CONSOLIDADA=${ESTADO_EXPERIENCIA_CONSOLIDADA:-consolidada}
campo_id=${CAMPOS_EXPERIENCIA%% *}
# Formas escapadas para interpolar en regex (grep -E, awk match/~/sub, sed BRE).
esc_re() { printf '%s' "$1" | sed 's/[][\.*^$/]/\\&/g'; }
campo_id_re=$(esc_re "$campo_id")

uso() {
  cat >&2 <<'EOF'
uso: experiencias.sh <registro> <operación> [términos]
operaciones:
  id [ocupado…]                 emite un Id único AAAAMMDDTHHMMSS, distinto de los
                                del registro y de los <ocupado> dados
  listar [pendiente|consolidada]
                                entradas del registro, tal como están escritas;
                                con <estado>, solo las de ese estado
  por-tarea <ref>               entradas cuyo campo Tarea contiene <ref>
  anexar                        añade al final la entrada leída de stdin —líneas
                                «- Id:», «  Tarea:», «  Esperado:», «  Obtenido:»
                                y «  Corrección:»— fijando «  Estado: pendiente»;
                                crea el registro con su cabecera si no existe
  marcar <id>…                  cambia «Estado: pendiente» a «consolidada» solo
                                en las entradas de los Id dados
EOF
  exit 2
}

[ $# -ge 2 ] || uso
f=$1; op=$2; shift 2

# id es auxiliar de escritura y anexar crea el registro: el resto lo exige.
if [ "$op" != "id" ] && [ "$op" != "anexar" ]; then
  [ -f "$f" ] || { echo "experiencias.sh: archivo ausente: $f" >&2; exit 2; }
fi

cabecera='# Experiencias

<!-- Registro append-only de las correcciones que el usuario hace al agente
     durante la ejecución de tareas. Cada entrada documenta la brecha entre
     el resultado esperado y el obtenido.

     Las entradas nunca se editan ni se borran. Gestionado por el skill
     destilar-lecciones. -->'

case "$op" in

  id)
    intentos=0
    while :; do
      cand=$(date +%Y%m%dT%H%M%S)
      colision=0
      for o in "$@"; do [ "$cand" = "$o" ] && colision=1; done
      if [ "$colision" -eq 0 ] && [ -f "$f" ] && grep -qE "^- ${campo_id_re}:[[:space:]]+${cand}[[:space:]]*$" "$f"; then
        colision=1
      fi
      [ "$colision" -eq 0 ] && break
      intentos=$((intentos + 1))
      if [ "$intentos" -ge 10 ]; then
        echo "experiencias.sh: no se pudo generar un Id único tras $intentos intentos" >&2
        exit 1
      fi
      sleep 1
    done
    echo "$cand"
    ;;

  listar)
    estado="${1:-}"
    case "$estado" in
      ""|"$ESTADO_EXPERIENCIA_PENDIENTE"|"$ESTADO_EXPERIENCIA_CONSOLIDADA") ;;
      *) echo "experiencias.sh: estado no reconocido: $estado" >&2; uso ;;
    esac
    awk -v estado="$estado" '
      function esc(s) { gsub(/[][\\.*^$]/, "\\\\&", s); return s }
      BEGIN {
        split(ENVIRON["CAMPOS_EXPERIENCIA"], campos, " ")
        re_id = "^- " esc(campos[1]) ":"
        est = ENVIRON["CAMPO_ESTADO_EXPERIENCIA"]
        re_est = ".*" esc(est) ":[[:space:]]*"
      }
      function volcar() {
        sub(/\n+$/, "", bloque)
        if (estado == "" || e == estado) {
          if (emitida) printf "\n"
          printf "%s\n", bloque
          emitida = 1
        }
      }
      $0 ~ re_id {
        if (bloque != "") volcar()
        bloque = $0 "\n"; e = ""; abierto = 0
        next
      }
      bloque != "" {
        if ($0 ~ "^[[:space:]]+" esc(est) ":") {
          if (e == "") {
            e = $0; sub(re_est, "", e); sub(/[[:space:]]*$/, "", e)
            abierto = (e == "")
          }
        } else if ($0 ~ /^[[:space:]]*[A-Za-zÁÉÍÓÚÑáéíóúñ][A-Za-zÁÉÍÓÚÑáéíóúñ]*:/) {
          abierto = 0
        } else if (abierto && $0 ~ /[^[:space:]]/) {
          e = $0; gsub(/^[[:space:]]+|[[:space:]]+$/, "", e); abierto = 0
        }
        bloque = bloque $0 "\n"
      }
      END { if (bloque != "") volcar() }
    ' "$f"
    ;;

  por-tarea)
    [ $# -ge 1 ] || uso
    ref=$1
    awk -v ref="$ref" '
      function esc(s) { gsub(/[][\\.*^$]/, "\\\\&", s); return s }
      BEGIN {
        split(ENVIRON["CAMPOS_EXPERIENCIA"], campos, " ")
        re_id = "^- " esc(campos[1]) ":"
        re_t = "^[[:space:]]+" esc(campos[2]) ":"
        re_tv = ".*" esc(campos[2]) ":[[:space:]]*"
      }
      function volcar() {
        sub(/\n+$/, "", bloque)
        if (index(t, ref) > 0) {
          if (emitida) printf "\n"
          printf "%s\n", bloque
          emitida = 1
        }
      }
      $0 ~ re_id {
        if (bloque != "") volcar()
        bloque = $0 "\n"; t = ""; abierto = 0
        next
      }
      bloque != "" {
        if ($0 ~ re_t) {
          if (t == "") {
            t = $0; sub(re_tv, "", t); sub(/[[:space:]]*$/, "", t)
            abierto = 1
          }
        } else if ($0 ~ /^[[:space:]]*[A-Za-zÁÉÍÓÚÑáéíóúñ][A-Za-zÁÉÍÓÚÑáéíóúñ]*:/) {
          abierto = 0
        } else if (abierto && $0 ~ /[^[:space:]]/) {
          v = $0; gsub(/^[[:space:]]+|[[:space:]]+$/, "", v); t = t v
        }
        bloque = bloque $0 "\n"
      }
      END { if (bloque != "") volcar() }
    ' "$f"
    ;;

  anexar)
    entrada=$(cat)
    if ! printf '%s\n' "$entrada" | awk '
      function esc(s) { gsub(/[][\\.*^$]/, "\\\\&", s); return s }
      { lineas[NR] = $0 }
      END {
        n = NR
        while (n > 0 && lineas[n] ~ /^[[:space:]]*$/) n--
        if (n != 5) exit 1
        split(ENVIRON["CAMPOS_EXPERIENCIA"], campos, " ")
        if (lineas[1] !~ "^- " esc(campos[1]) ": [0-9]{8}T[0-9]{6}$") exit 1
        for (i = 2; i <= 5; i++) {
          if (lineas[i] !~ "^  " esc(campos[i]) ": .+") exit 1
        }
      }
    '; then
      cat >&2 <<'EOF'
experiencias.sh: la entrada no cumple la forma canónica; se esperaba:
- Id: AAAAMMDDTHHMMSS
  Tarea: <texto>
  Esperado: <texto>
  Obtenido: <texto>
  Corrección: <texto>
EOF
      exit 1
    fi
    nuevo_id=$(printf '%s\n' "$entrada" | head -1 | sed "s/^- ${campo_id_re}: //")
    if [ -f "$f" ] && grep -qE "^- ${campo_id_re}:[[:space:]]+${nuevo_id}[[:space:]]*$" "$f"; then
      echo "experiencias.sh: Id duplicado: $nuevo_id" >&2
      exit 1
    fi
    if [ ! -s "$f" ]; then
      printf '%s\n' "$cabecera" > "$f"
    fi
    # Una línea en blanco separa la entrada de lo que ya hay escrito.
    if [ -s "$f" ]; then
      case "$(tail -c 2 "$f" | wc -l | tr -d ' ')" in
        2) : ;;
        1) printf '\n' >> "$f" ;;
        0) printf '\n\n' >> "$f" ;;
      esac
    fi
    printf '%s\n  %s: %s\n' "$entrada" "$CAMPO_ESTADO_EXPERIENCIA" "$ESTADO_EXPERIENCIA_PENDIENTE" >> "$f"
    ;;

  marcar)
    [ $# -ge 1 ] || uso
    tmp=$(mktemp "${TMPDIR:-/tmp}/experiencias.XXXXXX")
    rc=0
    awk -v lista="$*" '
      function esc(s) { gsub(/[][\\.*^$]/, "\\\\&", s); return s }
      function cerrar() {
        if (toca && !hecho) {
          printf "experiencias.sh: %s no se marcó (sin campo %s)\n", cur, est > "/dev/stderr"
          fallos++
        }
      }
      BEGIN {
        m = split(lista, a, " ")
        for (i = 1; i <= m; i++) pend[a[i]] = 1
        split(ENVIRON["CAMPOS_EXPERIENCIA"], campos, " ")
        re_id = "^- " esc(campos[1]) ":"
        re_idv = "^- " esc(campos[1]) ":[[:space:]]*"
        est = ENVIRON["CAMPO_ESTADO_EXPERIENCIA"]
        re_est = ".*" esc(est) ":[[:space:]]*"
        re_estln = "^[[:space:]]+" esc(est) ":[[:space:]]*"
        ep = ENVIRON["ESTADO_EXPERIENCIA_PENDIENTE"]
        ec = ENVIRON["ESTADO_EXPERIENCIA_CONSOLIDADA"]
        cur = ""; toca = 0; hecho = 0; fallos = 0
      }
      $0 ~ re_id {
        cerrar()
        cur = $0; sub(re_idv, "", cur); sub(/[[:space:]]*$/, "", cur)
        toca = (cur in pend)
        if (toca) delete pend[cur]
        hecho = 0
      }
      toca && !hecho && $0 ~ re_estln {
        v = $0; sub(re_est, "", v); sub(/[[:space:]]*$/, "", v)
        hecho = 1
        if (v == ep) {
          rep = est ": " ec; gsub(/[&\\]/, "\\\\&", rep)
          sub(esc(est) ":.*", rep)
          cambios++
        } else {
          printf "experiencias.sh: %s no se marcó (%s: %s)\n", cur, est, v > "/dev/stderr"
          fallos++
        }
      }
      { print }
      END {
        cerrar()
        for (id in pend) {
          printf "experiencias.sh: Id no encontrado: %s\n", id > "/dev/stderr"
          fallos++
        }
        exit(fallos > 0)
      }
    ' "$f" > "$tmp" || rc=1
    # awk añade un salto al final; recortarlo si el original no lo tenía.
    if [ -s "$f" ] && [ -n "$(tail -c 1 "$f")" ]; then
      printf '%s' "$(cat "$tmp")" > "$tmp"
    fi
    if cmp -s "$tmp" "$f"; then
      rm -f "$tmp"
    else
      mv "$tmp" "$f"
    fi
    exit $rc
    ;;

  *) uso ;;
esac
