# Dependencias de orígenes externos

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

La misma entrada de dependencia admite un origen propio: un paquete
declara que lo completa contenido de otro repositorio, el instalador lo
obtiene como una unidad independiente anclada a commit, y el conjunto
—que ahora cruza orígenes— se resuelve, ordena y verifica antes de
escribir, con ciclos y conflictos de identidad detectados en la
resolución.

## Dependencias

- 065.

## Entrada

- `docs/especificacion-paquete.md` — la gramática de `dependencies` del
  borrador 01, que gana el campo de origen.
- `src/origin.js`, `src/fetch.js` — la traducción de orígenes
  (`o/r[@ref]`, `path`) y la obtención remota anclada a commit.
- `src/commands.js`, `src/lock.js` — la resolución del conjunto del
  borrador 01 y la escritura del registro con el origen propio de cada
  unidad.

## Resultado esperado

- Una dependencia con origen se obtiene de ese origen —colección o
  paquete único—, anclada al commit resuelto y verificada como cualquier
  unidad instalada.
- El grafo transitivo puede atravesar orígenes: una dependencia externa
  puede declarar a su vez dependencias —del mismo árbol o de otro
  origen—.
- Cada unidad externa queda en el lock con su origen propio, de modo que
  `reinstall` la reproduce anclada a su commit.

## Criterios de calidad

- La entrada de `dependencies` gana un campo de origen —misma forma de
  referencia que el CLI acepta (`o/r[@ref]`, ruta)— documentado en el
  spec; sin origen sigue significando «miembro del mismo árbol».
- El `package` de la entrada se verifica contra el manifiesto de la
  unidad obtenida —mismo vocabulario de error que la verificación de
  nombre existente (`el origen publica "Y", no "X"`)—; en una colección
  externa, selecciona el miembro por nombre.
- La obtención de unidades externas sigue la regla de conjunto: todo lo
  obtenido antes de planear, todo lo planeado antes de escribir.
- La resolución atraviesa orígenes de forma transitiva y detecta ciclos
  que cruzan orígenes (`a@o1 → b@o2 → a@o1`), abortando con la ruta
  legible antes de escribir.
- La identidad del grafo es el nombre del paquete: una dependencia ya
  resuelta se deduplica y todas las restricciones declaradas sobre ella
  se verifican unidas; dos entradas que nombran el mismo paquete desde
  orígenes distintos abortan con diagnóstico de conflicto.
- Las restricciones de versión se verifican igual que en el mismo
  origen, contra la `version` del manifiesto obtenido; insatisfecha →
  conjunto no ejecutable.
- Una dependencia externa inalcanzable (origen o miembro inexistente,
  manifiesto inválido) aborta el conjunto con diagnóstico por unidad,
  en el vocabulario de las unidades no reproducibles.
- Cada unidad externa queda en el lock como instalación normal con su
  origen registrado (`repo`, `ref`, `commit`, `package` si colección).
- Suite en verde con cobertura total en `src/`; pruebas de colección
  externa, grafo transitivo entre orígenes, ciclo entre orígenes,
  conflicto de identidad, unión de restricciones y unidad
  inalcanzable.
- Documentación viva actualizada: spec (campo de origen), manual,
  dominio de instalación y el de obtención remota si aplica.

## Procedimiento sugerido

1. Extender el spec y el validador con el campo de origen en la entrada
   de dependencia, reutilizando la gramática de orígenes del CLI.
2. Extender la resolución del conjunto: una entrada con origen se
   obtiene como unidad independiente (traducción de origen, obtención
   anclada a commit, verificación de nombre/miembro) y se incorpora al
   grafo con la misma deduplicación y orden.
3. Cierre transitivo: las dependencias de una unidad externa se
   resuelven con las mismas reglas; ciclos y conflictos de identidad se
   detectan sobre el grafo completo.
4. Escritura del lock con el origen propio de cada unidad; pruebas de
   unidad, comando y e2e; documentación viva.

## Notas

- Una dependencia que apunta al mismo origen por su referencia externa
  (p. ej. `o/r` siendo `o/r` el propio árbol) no equivale a una
  dependencia del mismo árbol: traería el commit que el ref publica
  hoy, no el árbol servido. El plan debe decidir si se rechaza, se
  advierte o se resuelve in-tree; la opción segura es documentar que el
  mismo conjunto se expresa sin origen.
- Un `path` como origen dentro de una dependencia ata el paquete a una
  disposición del sistema de archivos: admisible por uniformidad con el
  CLI, pero el spec debe advertir que rompe la trasladabilidad del
  paquete.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
