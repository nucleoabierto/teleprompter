# Reobtener el origen anclado al commit registrado

## Estado

[r] En revisión

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

## Contexto

- Archivos similares:
  - `src/origin.js` — `sourceOf` traduce el `origin` registrado al
    `source` que `update` reobtiene; la traducción anclada al
    commit es su variante hermana en el mismo archivo.
  - `src/probe.js` — `publishedVersion` y `resolveUnit` son el
    modelo más cercano de «obtener la unidad de un origen
    registrado»: fetch inyectado por `io`, `cleanup` que el
    llamador libera en `finally` y colección re-resuelta por
    nombre con el vocabulario `{ ok, error }`.
  - `src/commands.js` — `obtainPackage` y `resolveMembers`: la
    obtención y la re-resolución del miembro que `update` ejecuta
    hoy (D019); `updateSource` muestra cómo la capa de invocación
    envuelve `sourceOf` y valida la ruta local existente.
  - `test/fetch.test.js` y `test/cli.test.js` — `spyFetch`,
    `remoteOk` y `RESOLVED` ejercen la remota sin red; `run`,
    `tmp`, `writePkg` y `writeCollection` arman destinos y
    colecciones de prueba.
- Patrones:
  - Idiomas de resultado por capa (D021): el dominio devuelve
    `{ ok, … }` / `{ ok: false, error }`; la capa de invocación
    (`sourceOf`, `resolveMembers`) emite motivos por `err` y
    devuelve `{ source }` / `{ code: EXIT_* }`.
  - `originOf` escribe `commit` solo cuando la obtención lo
    produjo; un SHA completo es un `ref` válido para la gramática
    y `resolveCommit` lo toma por resuelto sin consulta, así que
    anclar el `ref` del spec al `commit` registrado reproduce
    exactamente el árbol instalado.
  - El resultado de la obtención porta `cleanup` junto al
    `pkgDir`; el llamador lo libera en `finally` pase lo que pase.
  - El lock es dato no confiable: `isValidOrigin` ya garantiza
    `type` conocido y `repo`/`commit` string, pero un `repo` que
    no reparsea por la gramática sigue siendo posible —diagnóstico,
    no crash—.
  - Cada función exportada lleva un comentario de diseño que
    explica el porqué, no el qué.
- Dominio:
  - `docs/domains/002-instalacion.md` — «commit resuelto»: `ref`
    expresa la intención y `commit` dice qué árbol produjo la
    instalación; la actualización re-resuelve el miembro por su
    nombre en el índice del árbol recién obtenido.
  - `docs/domains/003-registro.md` — el `origin` del lock:
    `{type:'github',repo,ref?,commit}` o `{type:'path',path}` con
    `package` para miembros de colección; `commit` es opcional
    porque los locks previos no lo llevan.
- Producto: ninguna aplica — `reinstall` no existe aún en el
  manual; su documentación corresponde a la tarea 064.
- PRD: `docs/prd/010-reproduccion-destino.md` — «Anclaje»: cada
  unidad se reinstala desde el commit que su origen registró, no
  de lo que publica hoy; CU-3: entrada sin origen, `github` sin
  commit, ruta local desaparecida o miembro disuelto abortan
  antes de escribir, con su motivo.
- Lecciones:
  - `revision-tecnica-subagente.md` — la revisión técnica corre
    con un subagente capaz de ejecutar comandos (aplica al paso
    de revisión del ciclo).
  - `documentacion-viva.md` — nada de detalle histórico puntual
    en los documentos vivos (aplica a los sensores de cierre).
- Decisiones:
  - D005 — la obtención del conjunto precede al plan; una unidad
    no obtenible aborta sin escribir.
  - D014 — la forma del `origin` y la opcionalidad del campo
    `commit` en locks anteriores.
  - D019 — `origin.package` registra el nombre, no la ruta: la
    colección re-resuelve el mismo miembro en el árbol nuevo; un
    nombre ausente es error con la lista de disponibles.
  - D021 — la «unidad no reproducible» se expresa en el idioma
    de resultado de su capa.

## Conectividad

Conectada. Todo lo que la tarea asume existe en el codebase:
`sourceOf` y `originOf` en `src/origin.js` —este último ya
escribe `commit`—, `fetchRepoTree` en `src/fetch.js` anclado al
commit resuelto y con un SHA completo como `ref` válido sin
consulta, `obtainPackage` y `resolveMembers` en
`src/commands.js` como camino de obtención y re-resolución que
`update` ejecuta, `isValidOrigin` en `src/lock.js` admitiendo
`commit` y `package` opcionales, y la inyección de
`io.fetch`/`io.tmpBase` con el arnés de pruebas (`spyFetch`,
`remoteOk`) para ejercer la remota sin red.

## Plan técnico

`src/origin.js` concentra la traducción origen↔fuente:
`originOf` escribe el `origin` del registro —con `commit`
cuando la obtención lo produjo— y `sourceOf` lo traduce de
vuelta al `source` que `update` reobtiene resolviendo
`origin.ref`. La obtención del árbol y la re-resolución del
miembro de colección viven en `src/commands.js`
(`obtainPackage`, `resolveMembers`), con `src/probe.js` como
modelo cercano de obtener la unidad de un origen grabado. El
cambio añade la variante anclada al commit y la composición
por unidad que la tarea 064 consumirá.

- [x] Añadir la traducción de reproducción en `src/origin.js`,
  hermana de `sourceOf`, que toma el nombre de la entrada y su
  `origin`: `path` devuelve el directorio registrado; `github`
  exige `commit` y fija `spec.ref` a él; entrada sin `origin`,
  `github` sin `commit` o `repo` no reparseable → diagnóstico
  «unidad no reproducible» con su motivo por `err` y `{ code }`
  - Aporta: el anclaje vive en un punto —la reproducción no
    puede degradar a «lo publicado hoy»— y los casos degenerados
    hablan el idioma de la capa de invocación (D021)
  - Contexto: a diferencia de `sourceOf`, la variante ignora
    `origin.ref` a propósito —el `ref` grabado expresa intención,
    el `commit` es el ancla («commit resuelto», dominio 002)—;
    un SHA completo pasa la gramática y `resolveCommit` lo toma
    por resuelto sin consulta. Un `commit` presente pero
    malformado lo deja hablar el fetcher: no se duplica
    validación
- [x] Componer en `src/commands.js` la obtención de una unidad
  registrada sobre la traducción nueva, `obtainPackage` y
  `resolveMembers`: una ruta local desaparecida es unidad no
  reproducible; un árbol colección re-resuelve el miembro por
  `origin.package` —con el nombre de la entrada como reserva,
  como `update` hace con `parsed.pkg`— y disuelto → no
  reproducible con la lista de disponibles; el resultado lleva
  el `unit.dir` junto al `cleanup` que el llamador libera, y el
  temporal se libera en todo fallo posterior a la obtención
  - Aporta: la tarea 064 reobtiene cada entrada con una sola
    llamada cuyo resultado ya distingue «no reproducible» de
    «no obtenible», listo para el aborto sin escritura del
    conjunto (D005)
  - Contexto: `obtainPackage` también devuelve el `commit` de
    esta obtención —se descarta: la reescritura conserva el
    commit registrado, no el nuevo—; la disciplina de `cleanup`
    replica el `try/finally` de `runUpdate`
- [x] Pruebas de la traducción y de la composición con el arnés
  existente (`spyFetch`, `remoteOk`, `writeCollection`)
  - Aporta: cubre la suite esperada sin red ni procesos, como el
    resto de las pruebas de obtención

## Suite de pruebas esperada

- Una entrada `github` con `commit` se reobtiene anclada a él:
  la descarga pide el tarball del SHA registrado sin llamada de
  resolución previa, aunque el `ref` grabado apunte a otra cosa
  —el árbol es el del commit, no el del `ref`— («Anclaje»; B)
- Una entrada `path` se reobtiene del directorio registrado tal
  cual, sin consulta remota (CU-1; O)
- Una entrada sin `origin` es unidad no reproducible y declara
  su motivo (CU-3; Z)
- Un `origin` `github` sin `commit` —un registro anterior al
  anclaje— es unidad no reproducible con su motivo, no una
  obtención aproximada (CU-3; E)
- Un `repo` que la gramática no reparsea es unidad no
  reproducible, no un crash (CU-3; E)
- Una ruta local que ya no existe es unidad no reproducible
  (CU-3; B)
- Un árbol colección re-resuelve el mismo miembro por el nombre
  registrado y devuelve su directorio («Anclaje»; O)
- Un origen de colección sin `package` re-resuelve por el
  nombre de la entrada, como `update` (CU-3; I)
- Un miembro disuelto de su colección es unidad no reproducible
  con la lista de disponibles (CU-3; E)
- Un fallo de la obtención remota se reporta con el vocabulario
  de obtención (`error de obtención: …`), distinto del
  diagnóstico de no reproducible (CU-3; I)
- La re-resolución fallida de un miembro libera el directorio
  temporal de la obtención (regresión del ciclo de vida del
  temporal)

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
