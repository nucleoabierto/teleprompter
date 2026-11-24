# Dependencias de orígenes externos

## Estado

[x] Completada

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

## Contexto

- Archivos similares:
  - `src/dependencies.js` — el resolvedor que la tarea extiende:
    `resolveSet(rootDir, units)` hoy es síncrono, construye el
    índice del árbol obtenido (`memberIndex`), acumula demandas
    `{from, range}` por nombre, detecta ciclos por camino y
    devuelve `{name, dir}` por miembro de índice o `{dir}` para
    la raíz standalone. Una entrada con `origin` necesita
    obtención —la función pasa a ser asíncrona y a recibir el
    `io` del llamador—; sus unidades devueltas tendrán que
    portar el origen propio, no solo el directorio.
  - `src/commands.js` — `obtainPackage` es la obtención
    compartida (path o `fetchRepoTree` anclada a commit,
    `{pkgDir, cleanup, commit}`); `resolveMembers`/`selectUnits`
    traducen nombre→miembro de colección con su vocabulario de
    error; `checkVerified` con `expectedName` produce
    `el origen publica "Y", no "X"` —el mismo veredicto que una
    dependencia externa exige sobre el `package` declarado—;
    `installUnit` compone hoy `originOf(source, commit)` con el
    origen de la invocación para todas las unidades: la unidad
    externa necesita portar su propio origen —ya en forma de
    lock o como `{source, commit}`—; `obtainRecordedUnit` es la
    referencia del patrón «obtener unidad anclada + cleanup que
    el llamador libera».
  - `src/origin.js` — `originOf` compone la forma del lock
    (`{type:'github',repo,ref?,commit?}` o `{type:'path',path}`
    absoluta); `parseRepoSpec`/`isValidRef` de `src/fetch.js`
    son la gramática `o/r[@ref]` que el campo `origin` de la
    entrada debe reutilizar.
  - `src/fetch.js` — `fetchRepoTree` descarga anclada al commit
    resuelto con su vocabulario de fallos (`WHY`) y devuelve
    `cleanup`; el `io.fetch` inyectable es el punto de
    inyección del arnés.
  - `src/manifest.js` — `checkDependencyEntry` y
    `OBJECT_KEYS.dependenciesEntry` ganan el campo `origin`;
    el spec declara «sin origen = miembro del mismo árbol».
  - `test/cli.test.js` — `spyFetch`/`remoteOk`/`remotePkg`/
    `repoTarball` son el arnés de obtención remota: el espía
    enruta `/commits/` al SHA y el resto al tarball; una
    variante enrutada por repo cubre varios orígenes.
  - `test/dependencies.test.js` — el arnés del resolvedor a
    extender con orígenes externos.
  - `manual/referencia-install.md`, `manual/001-…`,
    `manual/005-…` — las páginas que la tarea 065 ya tocó y
    que describen el conjunto a ampliar.
- Patrones:
  - Toda obtención es anclada a commit: la referencia se
    resuelve primero (`resolveCommit`), el tarball se descarga
    del SHA —un SHA completo se toma por resuelto sin consulta—
    y el `commit` se registra en el lock.
  - El `cleanup` del árbol obtenido pertenece al llamador y se
    libera en `finally` —los árboles externos deben vivir
    hasta que la instalación del conjunto termina: el
    resolvedor acumula cleanups que `runInstall` libera con el
    suyo.
  - Idiomas por capa (D021): el resolvedor devuelve
    `{ok, units} | {ok: false, errors}`; el comando emite por
    `err` y mapea a `EXIT_*` —un fallo de obtención dentro del
    conjunto es diagnóstico del conjunto (código 2), no el
    `EXIT_FETCH` de la invocación.
  - El lock registra `origin` por unidad (D014): la unidad
    externa escribe su propio `{repo, ref?, commit, package?}`
    —`reinstall` la reproduce anclada por `obtainRecordedUnit`
    sin cambios.
  - Verificación por unidad intacta: cada unidad externa pasa
    por `verifyPackage`/`installUnit` como las demás.
- Dominio:
  - `docs/domains/002-instalacion.md` — «conjunto resuelto»
    amplía su definición a varios árboles: la identidad del
    grafo sigue siendo el nombre de la pieza, ahora con
    conflicto entre orígenes distintos del mismo nombre;
    «commit resuelto» y «unidad no reproducible» ya gobiernan
    la obtención por unidad.
  - `docs/domains/001-paquete.md` — «entrada dependencies»
    gana el campo `origin` sin redefinir la gramática.
- Producto:
  - `docs/especificacion-paquete.md` — el contrato que gana el
    campo `origin` en la entrada y la advertencia de la nota:
    una ruta local rompe la trasladabilidad del paquete.
  - `manual/referencia-install.md` — la sección «Dependencias
    entre paquetes» declara el cruce de orígenes.
- PRD: `docs/prd/011-dependencias-entre-paquetes.md` — CU-3
  (relación entre orígenes en una invocación); el comportamiento
  esperado declara «origen opcional: sin origen = mismo árbol»,
  obtención «como unidades propias ancladas a commit» y aborto
  del conjunto ante pieza inalcanzable.
- Investigación:
  - `docs/research/2026-11-dependencias-semver-gestores.md` —
    modelo de aserción vigente: la referencia elige el árbol —
    ahora, también el commit— y la restricción valida la
    `version` del manifiesto obtenido.
- Lecciones:
  - `documentacion-viva.md` — spec, manual y dominios sin
    detalle histórico puntual.
  - `revision-tecnica-subagente.md` — la revisión técnica corre
    con un subagente capaz de ejecutar comandos.
- Decisiones:
  - D001 — `origin` es dato declarativo del manifiesto.
  - D002 — el origen externo puede ser paquete o colección; la
    entrada selecciona miembro por nombre.
  - D005 — todo lo obtenido antes de planear, todo lo planeado
    antes de escribir: los árboles externos entran al conjunto
    antes de cualquier plan.
  - D014 — cada unidad registra su propio `origin` en el lock.
  - D017 — la versión del manifiesto obtenido es la que cuenta;
    el commit fija el árbol.
  - D019 — en una colección externa el `package` selecciona el
    miembro por nombre, igual que `--package`.
  - D021 — los fallos del conjunto (origen inaccesible, miembro
    inexistente, conflicto de identidad) salen por `err` con el
    código del conjunto.

## Conectividad

Conectada. Todo lo que la tarea asume del codebase existe con la
forma esperada: el resolvedor del conjunto (`resolveSet` con
índice por nombre, demandas unidas, ciclos por camino, orden
topológico); la obtención anclada a commit (`obtainPackage`/
`fetchRepoTree` con `io.fetch` inyectable, vocabulario de fallos
`WHY`, `cleanup` del llamador); la gramática `o/r[@ref]`
(`parseRepoSpec`/`isValidRef`); la selección por nombre en
colecciones (`resolveMembers`, `describeIndex`); el veredicto
«el origen publica X, no Y» (`checkVerified` con `expectedName`);
la forma del `origin` del lock (`originOf`); la pipeline por
unidad (`installUnit`); y el arnés de obtención remota
(`spyFetch`/`remoteOk`/`repoTarball`).

Los cambios que exige la tarea son su objeto, no precondiciones
ausentes: `resolveSet` pasará a ser asíncrono y a portar `io`
para obtener los árboles externos; las unidades resueltas
portarán su propio origen en forma de lock, con `installUnit`
consumiéndolo; `OBJECT_KEYS.dependenciesEntry` y el validador
ganan el campo `origin` —que exige una forma inequívoca
repositorio-vs-ruta, discriminación que en el CLI resuelven las
flags y en el manifiesto decidirá el plan—; y los cleanups de
los árboles externos se acumulan para liberarlos al terminar.

## Plan técnico

`resolveSet` (tarea 065) resuelve el conjunto dentro del árbol
obtenido —índice por nombre, demandas unidas, ciclos por camino,
orden topológico— y devuelve unidades `{dir, name?}` que
`installUnit` instala componiendo el `origin` de la invocación.
La obtención (`fetchRepoTree`/`obtainPackage`) descarga anclada
a commit con `cleanup` del llamador e `io.fetch` inyectable;
`resolveMembers` selecciona miembros por nombre; `checkVerified`
produce «el origen publica X, no Y». El cambio vuelve
`resolveSet` asíncrono y multi-árbol: cada entrada con `origin`
obtiene su propio árbol, selecciona la pieza y se incorpora al
grafo con la misma deduplicación y orden; la unidad resuelta
porta su `origin` ya en forma de lock.

- [x] Extender el contrato: `OBJECT_KEYS.dependenciesEntry`
  gana `origin`; el validador exige objeto con exactamente
  `repo` —spec `o/r[@ref]` válido por `parseRepoSpec`— o
  `path` —string no vacío—
  - Aporta: la referencia defectuosa es manifiesto inválido
    antes de obtener nada; la forma inequívoca
    repositorio-vs-ruta —ambigua como string suelto, pues
    `foo/bar` vale de ambos modos— queda fijada por el formato
    y espeja el `type` del `origin` del lock
  - Contexto: el spec documenta «sin `origin` = miembro del
    mismo árbol», la advertencia de la nota —`path` ata el
    paquete a una disposición del filesystem, resuelta relativa
    al paquete declarante— y que nombrar el propio origen por
    `o/r` trae el árbol que la ref publica hoy, no el servido:
    el mismo conjunto se expresa sin origen, sin especial-casado
- [x] Volver `resolveSet` asíncrono con `io`
  (`resolveSet(io, rootDir, units)`): una entrada con `origin`
  obtiene su árbol —`fetchRepoTree` para `repo`, directorio
  existente para `path`— anclado a commit; los árboles externos
  se acumulan en `cleanups` que el resultado devuelve y
  `runInstall` libera en `finally`; ante error, los ya obtenidos
  se liberan al instante
  - Aporta: D005 a nivel de obtención —todo lo traído antes de
    planear; ningún temporal queda huérfano
  - Contexto: caché por clave de origen —dos piezas que declaran
    el mismo `repo@ref` se obtienen una sola vez—
- [x] Resolución de la unidad externa: colección externa → la
  pieza se resuelve por nombre en su índice (ausente →
  inalcanzable, `package` = nombre de índice); paquete único →
  su `manifest.name` debe igualar `package` —si no, diagnóstico
  «el origen publica "Y", no "X"»—; sus propias `dependencies`
  se recorren dentro de su árbol —el índice de miembros es por
  árbol y la recursión porta la raíz de cada unidad—
  - Aporta: el grafo atraviesa orígenes transitivamente con las
    mismas reglas en cada árbol
  - Contexto: la identidad del grafo sigue siendo el nombre
    —mismo nombre desde orígenes distintos aborta con
    diagnóstico de conflicto de identidad—; el camino del ciclo
    muestra `nombre` o `nombre@origen` para que
    `a@o1 → b@o2 → a@o1` sea legible
- [x] La unidad externa porta su `origin` ya en forma de lock
  —`{type:'github',repo,ref?,commit}` más `package` si es
  miembro de colección, o `{type:'path',path}`—; `installUnit`
  usa `unit.origin` cuando viene y compone el de la invocación
  cuando no
  - Aporta: cada pieza registra su procedencia real;
    `reinstall` la reproduce anclada a su commit por
    `obtainRecordedUnit` sin cambios
- [x] Integración en `runInstall`: `await resolveSet(io, pkgDir,
  selected.units)`, los errores del conjunto salen por `err` con
  «conjunto no instalable» y código 2 —incluida la obtención
  fallida, que es diagnóstico del conjunto, no `EXIT_FETCH`—;
  `finally` libera el cleanup propio y los del conjunto
  - Aporta: el punto de integración no cambia de lugar; la
    firma nueva solo toca al único llamador
- [x] Documentación viva: spec (campo `origin`, advertencias
  `path` y auto-origen), `referencia-install` (el conjunto cruza
  orígenes; cada unidad con su origen en el registro), dominio
  001 (`origin` en la entrada) y 002 (conjunto multi-árbol,
  conflicto de identidad, unidad con origen propio)
  - Aporta: contrato, referencia y dominio coherentes con el
    código en el mismo cambio
- [x] Pruebas de la suite esperada: contrato en
  `manifest.test.js`, unidad del resolvedor en
  `dependencies.test.js`, comando con `run`/`spyFetch` enrutado
  por repo y e2e con origen `path`
  - Aporta: cubre la suite sin red, con cobertura total en
    `src/`

## Suite de pruebas esperada

- `origin: {"repo": "o/r"}` y `{"repo": "o/r@ref"}` —ref con
  ramas, SHA, `cli/v2`— validan; `{"path": "dir"}` valida
  (CU-3; O)
- `origin` con `repo` y `path` a la vez, sin ninguna, que no es
  objeto, o con campo desconocido invalida (CU-3; I)
- `repo` malformado —sin `/`, `@` vacío, ref con `..` o
  espacio— invalida (CU-3; I)
- Dependencia con `repo` se obtiene anclada a commit, instala
  antes que su dependiente y registra `origin` propio
  `{type:'github', repo, ref?, commit}` (CU-3; O)
- Dependencia a miembro de colección externa se selecciona por
  nombre y registra `origin.package` (CU-3; O)
- Paquete único externo cuyo `name` no casa `package` aborta con
  «el origen publica…» sin escribir (CU-3; E)
- Transitivo entre orígenes: una unidad externa declara a su vez
  dependencias del mismo árbol y de otro origen; el orden
  respeta la cadena completa (CU-3; M)
- Ciclo que cruza orígenes `a@o1 → b@o2 → a@o1` aborta con la
  ruta legible (CU-4; E)
- Conflicto de identidad: mismo nombre pedido desde dos orígenes
  distintos aborta con diagnóstico; mismo nombre y mismo origen
  se deduplica —una sola obtención, una sola instalación—
  (CU-3; M/E)
- Restricciones unidas sobre una pieza externa deben cumplirse
  todas; insatisfecha → conjunto no instalable (CU-7; E)
- Origen inalcanzable (404), miembro ausente del índice externo
  o manifiesto externo inválido abortan el conjunto con
  diagnóstico, sin escribir (CU-6; E)
- `origin: {"path"}` relativo al paquete declarante instala la
  pieza local con `origin.type: 'path'` (CU-3; B)
- `--package` conserva su semántica: solo entran los miembros
  pedidos y su conjunto —externo incluido— (CU-2; I)
- `--dry-run` obtiene los árboles, muestra los planes y no
  escribe nada; los temporales se liberan (regresión del
  comportamiento del plan)
- Cada unidad externa es reproducible por `reinstall` anclada a
  su `commit` registrado (regresión del registro)
- e2e: una dependencia `path` a un paquete hermano se instala
  por el binario real sin red (CU-3; O)

## Desviaciones

- **El conflicto de identidad se comprueba antes de obtener el
  árbol.** Es detectable estáticamente —la clave del origen declarado
  basta—, así que una demanda en conflicto aborta sin descargar el
  origen que nunca se usaría. Mismo resultado que pedía el plan, sin
  el coste de la obtención.
- **`visit` chequea la identidad antes del retorno por deduplicada.**
  Las pruebas expusieron el agujero: una unidad seleccionada que ya
  se había resuelto desde un origen externo retornaba en silencio
  como pieza ya resuelta —el conflicto quedaba indetectado—. Ahora
  el chequeo de origen precede al `state.has` del atajo.
- **Las piezas de un árbol externo heredan el origen de su árbol.**
  Una dependencia sin `origin` declarada dentro de un árbol ajeno
  resuelve en ese árbol —misma regla de «sin origen = mismo árbol»—,
  y la unidad porta el `origin` del árbol donde reside, no el de la
  invocación ni `undefined`.
- **La clave de origen `path` es la ruta resuelta, no la cadena
  declarada** — la revisión técnica lo cazó: la misma cadena `"lib"`
  declarada desde paquetes en directorios distintos apunta a orígenes
  distintos, y clavear por la cadena instalaba la pieza equivocada en
  silencio. Se resuelve contra el directorio del declarante antes de
  clavear —misma corrección en la caché, en el chequeo de identidad
  y en la deduplicación—.
- **La comprobación de `path` se hace dentro de `try`.** `statSync`
  lanza ante más que ENOENT —un padre ilegible abortaba la CLI sin
  diagnóstico y dejaba temporales huérfanos—; ahora cualquier fallo
  de acceso es «no es un directorio» y aborta el conjunto limpio.
- **`origin.path` se rechaza dentro de árboles remotos.** La revisión
  señaló que un `path` declarado por una pieza descargada solo puede
  señalar la extracción efímera: el lock registraría una ruta que el
  cleanup borra y `reinstall` no podría reproducir jamás. `resolveSet`
  recibe ahora el `origin` de la invocación para distinguir raíz
  local de remota, y la declaración aborta con diagnóstico —`path`
  pertenece a árboles locales—. Documentado en spec y manual.

## Revisión

- Subagente: 2026-11-23 — Aprueba, en segunda ronda: la primera
  pidió cambios —la clave `path` por cadena declarada instalaba la
  pieza equivocada, `statSync` sin guardia dejaba excepción y
  temporales, `path` en árbol remoto registraba origen
  irreproducible—, las tres correcciones se aplicaron y
  re-verificaron (véase Desviaciones). Observación residual no
  bloqueante: el diagnóstico de conflicto entre dos `path` muestra
  la cadena declarada —puede leerse tautológico cuando ambas son
  iguales—.
- Usuario (ejecución): 2026-11-23 — Aprueba (PR #30)
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
