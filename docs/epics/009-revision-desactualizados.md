# Revisión de desactualizados: la comparación sin efectos

## Estado

[ ] Planificada | [x] Completada

## Objetivo

`teleprompter outdated [<paquete>]` presenta para cada paquete del
registro la versión instalada frente a la que su origen publica
ahora —al día, desactualizado o no consultable— sin escribir
nada, verificable en una sola invocación.

## Alcance

- **Dentro:** el comando, su gramática y ayuda, el sondeo de
  versión por origen grabado —remoto, local y miembro de
  colección—, la comparación instalada/publicada por línea, la
  degradación de orígenes inalcanzables a aviso.
- **Fuera:** actualización en lote o de lo revisado, diff de
  contenido, paquetes no instalados, programación periódica,
  sondeo ligero del manifiesto, paralelización de sondeos.

## Piezas

- [x] docs/tasks/060-sondeo-version-publicada.md — sondear la
  versión publicada de un origen
- [x] docs/tasks/061-comando-outdated.md — el comando `outdated`
  de punta a punta

## Plan técnico

- **Orden:** 060 → 061.
- **Dependencias:** 061 compone el sondeo de 060 sobre cada
  entrada del registro.
- **Decisiones transversales:** traducción `origin`→`source` vía
  `sourceOf` —la misma operación que `update` consume—;
  obtención completa con `fetchRepoTree`, para que la versión
  reportada sea exactamente la que una actualización obtendría;
  idiomas de resultado por capa (D021); el comando pertenece a la
  familia de consultas pero consulta la red —su hogar lo decide
  su plan—.

## Criterio de cierre

Una sola invocación revisa todo el registro presentando por
paquete instalada/publicada/estado, sin escritura alguna y con
orígenes inalcanzables degradados a aviso; `list` y `check`
describen el destino igual antes y después.

## Revisión

- Usuario: 2026-10-29 — Aprueba
