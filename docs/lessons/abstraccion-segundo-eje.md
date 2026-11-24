# Abstracción al crecer a un segundo eje

## Lecciones

- **Al extender un resolvedor o recorrido a un segundo eje, elevar
  la abstracción en vez de anidar ramas en el bucle existente.**
  Cuando `resolveSet` pasó de un árbol a varios orígenes, el
  multi-árbol se injertó ramificando dentro de `visit`: el origen
  quedó representado tres veces (parámetros sueltos `tree`/`key`/
  `label`/`treeOrigin` y campos `ext.*`), seis mapas paralelos se
  indexaron por el mismo nombre y la selección de miembro por
  índice se duplicó en dos ramas. La abstracción correcta —`site`
  (árbol + identidad de origen + `lockOrigin`) y `piece` (estado,
  manifiesto, directorio, origen por nombre)— colapsa los
  parámetros, fusiona los mapas y deja `visit` en guardias,
  despacho y cierre topológico. El síntoma a detectar temprano es
  un parámetro posicional que siempre viaja con otros tres.
  Disparadores: `src/dependencies.js`, resolvedor, orígenes,
  recorrido, `visit`, mapas paralelos, `site`, `piece`, refactor
  Origen: 20261123T181059
