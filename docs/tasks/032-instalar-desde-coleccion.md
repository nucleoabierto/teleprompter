# Instalar el paquete seleccionado de una colección

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Materializar el paso nuevo de `install`: cuando el origen —local
(`--path`) o remoto (`user/repo`)— describe una colección, el CLI
acepta la selección definida en la tarea 031, resuelve el manifiesto
de colección a los paquetes elegidos e instala cada uno con el
pipeline existente. Deja de rechazarse el manifiesto de colección
como «no instalable».

## Dependencias

- Tarea 031 — el comportamiento definido: gramática de selección,
  caso sin selección y cardinalidad.

## Entrada

- `src/manifest.js` — validación del manifiesto; hoy rechaza
  `collection: true` como instalable.
- `src/cli.js`, `src/fetch.js` — gramática del CLI y obtención: el
  tarball del repo completo ya se extrae en local, así que las rutas
  del índice resuelven dentro del árbol descargado.
- `src/plan.js`, `src/execute.js` — pipeline de instalación que ya
  instala un paquete a la vez.
- Definición de la tarea 031.

## Resultado esperado

- `install` acepta un origen de colección con la selección
  documentada e instala el/los paquete(s) elegido(s) como una
  instalación normal: plan completo, resolución de colisiones,
  registro en el lock.
- El comportamiento sin selección y los errores del índice (rutas
  inexistentes, paquetes inválidos) responden como se definió.

## Criterios de calidad

- Instalar desde una colección local (`--path`) y remota produce el
  mismo resultado que instalar cada paquete por separado: mismos
  targets, mismo plan por paquete, mismo registro.
- Un índice con rutas inválidas o un paquete mal formado aborta con
  error claro sin escribir nada.
- La suite cubre: colección válida, sin selección, selección de uno
  y de varios, selección inexistente, índice inválido.

## Procedimiento sugerido

1. Planear la implementación (sub-flujo de desarrollo: contexto,
   plan técnico, suite esperada).
2. Extender la resolución del origen: detectar colección, aplicar
   selección, producir la lista de paquetes a instalar.
3. Iterar el pipeline por paquete seleccionado, agregando planes.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
