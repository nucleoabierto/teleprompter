# Definir el comportamiento de instalación desde colecciones

## Estado

[x] Completada

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
- Definición acordada con el usuario (2026-10-04) y registrada
  como D019:
  - Selección por nombre con la opción `--package <nombre>`,
    repetible y válida con orígenes `github` (`user/repo[@ref]`)
    y `path`; el nombre es el del manifiesto del paquete —idéntico
    al basename de su directorio por `checkName`— nunca la ruta.
    Valores repetidos se deduplican: la selección es un conjunto.
  - Colección sin `--package` → `install` aborta sin escribir e
    imprime el índice (nombre, versión y descripción por paquete)
    sugiriendo la selección; exit ≠ 0.
  - `--package` con origen no-colección → error; nombre ausente del
    índice → error con la lista de disponibles.
  - Cardinalidad: uno o varios paquetes por flag repetido; cada uno
    se instala como unidad independiente (plan, entrada de lock y
    guía propios). La ejecución es secuencial en el orden de los
    flags; cada unidad es atómica según D005, de modo que un fallo
    en la unidad N deja instaladas y reportadas las N-1 anteriores.
    `--force`/`--skip`/`--dry-run` aplican a todas las unidades.
    Sin comodín «todos» en esta versión.
  - `origin` gana el campo opcional `package: "<nombre>"` cuando el
    paquete vino de colección, en ambos tipos (`github`, `path`);
    `update` re-resuelve nombre → ruta a través del índice, así el
    índice puede reubicar paquetes sin romper orígenes. Locks sin
    `package` siguen válidos. Nombre desaparecido del índice →
    error «el paquete ya no está en la colección».
  - Bordes: nombres duplicados en el índice → colección ambigua
    para la selección (error); entrada del índice que apunta a otra
    colección → error (sin anidamiento); un miembro con manifiesto
    inválido solo falla si se selecciona —en el índice impreso
    aparece marcado, no aborta—, pues la selección resuelve por el
    basename de la ruta, idéntico al nombre; `update` no admite
    `--package` y, ante un origen explícito que sea colección,
    re-resuelve el miembro por el nombre del paquete que se
    actualiza. El código de salida concreto de cada error lo fija
    la implementación (032).

## Revisión

- Subagente: 2026-10-04 — Aprueba
- Usuario: 2026-10-04 — Aprueba
