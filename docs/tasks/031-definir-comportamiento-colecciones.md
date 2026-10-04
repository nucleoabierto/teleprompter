# Definir el comportamiento de instalación desde colecciones

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Fijar el comportamiento del consumidor ante una colección: la
gramática de selección (cómo se nombra el paquete dentro del
origen), qué ocurre cuando `install` apunta a una colección sin
selección, si la selección admite varios paquetes, y qué registra el
`origin` para que el ciclo de vida resuelva el mismo paquete. Es la
decisión eje del conjunto: los tareas siguientes la
materializan.

## Dependencias

- Ninguna

## Entrada

- `docs/research/2026-10-seleccion-paquetes-colecciones.md` — la
  evidencia de patrones de selección en herramientas multi-paquete
  (producida durante el refinamiento de esta propuesta).
- `docs/especificacion-paquete.md` y
  `docs/decisions/D002-cardinalidad-repo-paquete.md` — el contrato
  de colección ya fijado.
- Gramática actual del CLI: `install <user/repo[@ref]> [destino] |
  --path <paquete> [destino]` y el resto de subcomandos
  (`manual/referencia-install.md`, `docs/decisions/`).
- Campo `origin` del registro (`docs/decisions/D014`).

## Resultado esperado

- Una definición documentada en el archivo de la tarea (y, si da
  forma al proyecto, registrada con `decisiones-diseno`): sintaxis
  de selección, comportamiento sin selección, cardinalidad de la
  selección y extensión del `origin` para colecciones — para los
  orígenes `github` y `path` por igual.

## Criterios de calidad

- La gramática elegida no ambigua con `ref`/`destino` ni con la
  sintaxis `--path` existente.
- Todo lo definido es verificable con la suite actual de `install`
  extendida; no quedan casos «a interpretar».
- El `origin` propuesto sigue identificando de forma única el
  paquete instalado dentro del repositorio.

## Procedimiento sugerido

1. Evaluar las opciones de la investigación de selección contra la
   gramática y las decisiones vigentes.
2. Acordar con el usuario las piezas abiertas (sintaxis, caso sin
   selección, cardinalidad).
3. Documentar el comportamiento y registrar la decisión si aplica.

## Notas

- La gramática debe cubrir también `--path` a un directorio
  colección local, no solo `user/repo`.
- Preferencias ya expresadas por el usuario durante el
  refinamiento, como punto de partida —no como cierre—: selección
  por nombre vía flag `--package` (el posicional y `@` están
  ocupados por `destino` y `ref`), y ante una colección sin
  selección, error que imprime el índice de paquetes disponibles
  en lugar de selector interactivo.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
