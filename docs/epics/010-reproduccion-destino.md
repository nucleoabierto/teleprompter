# Reproducción del destino: reinstalar lo que el registro declara

## Estado

[x] Planificada | [ ] Completada

## Objetivo

`teleprompter reinstall` devuelve el destino al estado que el
registro declara —cada unidad reinstalada desde su origen
anclada al commit registrado— verificable en una sola
invocación con el plan del conjunto antes de escribir.

## Alcance

- **Dentro:** el comando, su gramática y ayuda, la reobtención
  de orígenes anclada al commit registrado —remoto, local y
  miembro de colección—, el plan del conjunto por unidad con el
  vocabulario de instalación, las divergencias por la política
  de conflictos con respaldo, el aborto sin escritura ante
  unidades no reproducibles, la página de referencia y la guía
  del flujo en el manual.
- **Fuera:** selección parcial del registro, re-resolución a lo
  publicado —actualización en lote, parte pendiente de la idea
  008—, preservación de personalizaciones, registro como
  manifiesto importable de otro repositorio, re-ejecución de la
  personalización, retirada de targets registrados que el
  manifiesto no declara —entradas alteradas a mano—.

## Piezas

- [ ] docs/tasks/063-reobtencion-anclada-commit.md — Reobtener
  el origen anclado al commit registrado
- [ ] docs/tasks/064-comando-reinstall.md — El comando
  `reinstall` de punta a punta

## Plan técnico

- **Orden:** 063 → 064.
- **Dependencias:** 064 compone la reobtención anclada de 063
  sobre cada entrada del registro.
- **Decisiones transversales:** el plan de reproducción coincide
  con el de instalación —a commit fijo el manifiesto obtenido es
  el que instaló, así que intacto→`identical`, ausente→`create`,
  divergente o ajeno→`conflict`, sin marcas nuevas ni
  retirados—; la obtención de todo el conjunto precede al plan
  y una unidad no obtenible aborta sin escribir (D005); la
  traducción `origin`→`source` anclada al `commit` grabado es
  hermana de `sourceOf` (D014); el pipeline compartido con
  `install` —verificar, planear, decidir, preflight, ejecutar,
  reescribir el registro— con relectura por unidad; idiomas de
  resultado por capa (D021).

## Criterio de cierre

Una sola invocación devuelve el destino al estado declarado por
todo el registro —restaurando la deriva con respaldo,
recreando lo ausente y dejando lo intacto— con el plan del
conjunto visible antes de escribir y aborto sin efectos ante
cualquier unidad no reproducible; `check` no reporta deriva
tras una reproducción con `--force`.

## Revisión

- Usuario: 2026-11-09 — Aprueba
