# D006: Política de colisiones interactiva con opciones excluyentes

## Estado

Aceptada

## Contexto

Ante un destino ocupado por contenido no gestionado por la herramienta
hay varias políticas posibles: abortar siempre (Stow, dpkg), preguntar
por recurso (copier, chezmoi, rcm) o resolver por opción de línea de
comandos (`--force-overwrite` de dpkg, `--force` de degit). El
instalador se usa tanto a mano como en automatización, y cada contexto
pide un defecto distinto.

## Decisión

Resolvemos las colisiones interactivamente: en consola interactiva el
instalador pregunta por cada recurso en conflicto si se sobrescribe o
se omite. Sin consola interactiva la operación lista los conflictos y
aborta. Ofrecemos dos opciones mutuamente excluyentes que resuelven
por adelantado: `--force` sobrescribe todas las colisiones y `--skip`
las omite todas; declarar ambas es un error de invocación.

## Justificación

La interacción por recurso es la experiencia reconocible de los
instaladores encuestados y la más segura a mano: cada conflicto se
decide viéndolo. El aborto no interactivo evita que una automatización
sobrescriba en silencio, y las dos opciones excluyentes cubren la
automatización sin ambigüedad. Se descartó la copia de seguridad como
resolución (`backup` de Dotbot, `.lash-backup` de lash) para mantener
mínimo el contrato inicial; puede añadirse si aparece la necesidad. El
contenido nunca se fusiona: la resolución decide por recurso completo.

## Referencias

- `docs/research/2026-09-motores-instalacion.md` — rec. 3 y 4.
- `docs/instalador.md` — sección «Colisiones».
