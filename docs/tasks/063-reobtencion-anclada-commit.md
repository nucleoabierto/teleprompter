# Reobtener el origen anclado al commit registrado

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Dada la entrada del registro de un paquete instalado, producir la
reobtención de exactamente el árbol que la instalación consumió:
el origen `github` se traduce a un `source` cuyo `ref` es el
commit registrado —no el `ref` que el usuario pidió— y el
origen de colección re-resuelve el mismo miembro por su nombre;
la unidad resultante está lista para alimentar el plan de
reproducción.

## Dependencias

- Ninguna.

## Entrada

- `src/origin.js`: `sourceOf` —la traducción origen→source que
  `update` consume resolviendo `origin.ref`—; `originOf`, que
  escribe `commit` cuando la obtención lo produjo.
- `src/fetch.js`: `fetchRepoTree` resuelve `spec.ref` a commit y
  descarga el árbol anclado a él —un SHA completo es un `ref`
  válido para la gramática y para el endpoint.
- `src/commands.js`: `obtainPackage` y `resolveMembers` —la
  obtención y la re-resolución del miembro de colección que
  `update` ya ejecuta (D019).
- `docs/decisions/D014-campo-origin-del-registro.md`: forma del
  `origin` y opcionalidad del campo; el `commit` lo añade la épica
  007 (`docs/tasks/038-registrar-el-commit-en-el-origen.md`).

## Resultado esperado

- Una traducción del `origin` registrado al `source` de
  reproducción: para `type: "github"` con `commit` el spec lleva
  `ref = <commit>`; para `type: "path"` devuelve el directorio
  registrado tal cual —un origen local no tiene anclaje
  posible—.
- Una entrada sin `origin`, un `origin` `github` sin `commit`
  —registros escritos antes de anclar el commit— o un `repo` que no reparsea
  producen el diagnóstico «unidad no reproducible» con su
  motivo, no una obtención aproximada ni un crash.
- La re-resolución del miembro de colección reutiliza el camino
  de `update`: `origin.package` selecciona la unidad en el índice
  del árbol obtenido; un miembro desaparecido de la colección es
  unidad no reproducible con la lista de disponibles.

## Criterios de calidad

- El árbol obtenido es el del commit registrado, verificable
  sobre un origen cuyo `ref` haya avanzado desde la instalación.
- Ninguna traducción produce un origen «aproximado» en silencio:
  sin commit registrado, la unidad no es reproducible.
- `npm test` en verde con el 100 % de cobertura en `src/`.

## Procedimiento sugerido

1. Variante de `sourceOf` para reproducción —mismo archivo,
   `src/origin.js`— que toma solo la entrada registrada: `github`
   exige `commit` y lo fija como `ref` del spec; `path` devuelve el
   directorio; los casos degenerados devuelven el diagnóstico de
   unidad no reproducible en el idioma de resultado de la capa.
2. Componer la obtención por unidad sobre `obtainPackage` +
   `resolveMembers` cuando el árbol es colección, devolviendo el
   `unit.dir` re-resuelto junto al `cleanup` que el llamador
   libera.
3. Pruebas de la traducción (`github` con/sin commit, `path`, repo
   no reparseable, entrada sin origen) y de la re-resolución del
   miembro.

## Notas

- La semántica «sin commit ⇒ no reproducible» es la lectura estricta
  de «el registro declara»: aproximar con el `ref` grabado
  reintroduciría la deriva que la reproducción existe para
  eliminar. Si la revisión prefiere degradar con aviso al `ref`,
  el cambio es local a la traducción.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
