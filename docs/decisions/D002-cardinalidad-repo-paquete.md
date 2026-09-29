# D002: Un repositorio puede contener uno o varios paquetes

## Estado

Aceptada

## Contexto

La configuración de agentes de un proyecto rara vez es una sola pieza:
este repositorio ya contiene varios skills bajo `.agents/skills/`. El
formato debía decidir si un repositorio aloja un solo paquete o varios,
y cómo el consumidor detecta cuál es el caso sin recorrer el árbol
completo.

## Decisión

Decidimos que el paquete sea un directorio con su `teleprompter.json` y
que un repositorio pueda contener uno o varios. Hay un solo nombre de
archivo que detectar: el campo `collection` del manifiesto discrimina si
describe un paquete (ausente o `false`) o una colección que lista
paquetes por ruta (`true`). Un directorio es una cosa o la otra; las
entradas de la colección solo declaran la ruta del paquete.

## Justificación

Las tres arquitecturas observadas en la investigación son el 1:1
estricto (`pkg.json`, extensiones de VS Code), el escaneo sin índice
(skills.sh incluye cada `SKILL.md` válido) y el índice global
(`marketplace.json` de Claude Code, `workspaces` de npm). El 1:1 no
cubre la realidad del proyecto; el escaneo impide inspeccionar el
contenido de un repositorio sin recorrerlo. El índice de rutas da
detección en O(1) y evita el error que Claude Code documenta como
habitual: duplicar `name` en la entrada y en el manifiesto del plugin,
que desfasan entre sí. En la colección el nombre y la versión se leen
del manifiesto de cada paquete. Preferimos el discriminador por campo a
un segundo nombre de archivo (`teleprompter.collection.json`): un solo
nombre que buscar, un solo esquema que validar, y la consecuencia
asumida es que un directorio no puede ser paquete y colección a la vez
—la colección es un contenedor puro, como `marketplace.json`.

## Referencias

- `docs/research/2026-09-formatos-manifiesto.md` — patrón
  «Cardinalidad repositorio ↔ paquete» y recomendación 4.
- `docs/formato-paquete.md` — el contrato que la decisión fija.
