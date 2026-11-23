# Dependencias dentro del mismo origen

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Un paquete declara qué otros paquetes del mismo origen lo completan, e
instalarlo trae consigo el conjunto declarado: los miembros se resuelven
dentro del árbol ya obtenido —mismo commit para todo el conjunto—, se
ordenan de modo que cada dependencia se instale antes que su
dependiente y el conjunto aborta sin escribir cuando la relación es
circular, la pieza no existe o la versión no satisface la restricción.

## Dependencias

- Ninguna.

## Entrada

- `docs/especificacion-paquete.md` — el contrato del manifiesto que
  gana el campo de dependencias.
- `docs/research/2026-11-dependencias-semver-gestores.md` — el modelo
  de aserción y el vocabulario de rangos elegido.
- `src/manifest.js`, `src/collection.js` — la validación del manifiesto
  y la resolución de miembros por nombre dentro del árbol obtenido.
- `src/commands.js` (`runInstall`, `runReinstall`) — el punto del flujo
  donde entra la resolución del conjunto y la maquinaria multi-unidad
  reutilizable: obtener todo antes de planear, abortar el conjunto sin
  escribir, una línea de plan por unidad.
- `src/plan.js` (`semverAtLeast`) — la comparación semver mínima sobre
  la que se apoya la evaluación de rangos.

## Resultado esperado

- `install` de un paquete con `dependencies` instala el paquete y todo
  su conjunto transitivo del mismo origen en una sola invocación, en
  orden de dependencia.
- Un «metapaquete» —paquete de composición cuya única función es
  declarar el conjunto— es válido e instalable.
- Un ciclo, un miembro inexistente o una restricción de versión
  insatisfecha aborta el conjunto antes de escribir nada, con
  diagnóstico legible.

## Criterios de calidad

- El manifiesto gana el campo `dependencies`: lista de entradas
  `{ "package", "version"? }`, documentada en
  `docs/especificacion-paquete.md` junto a `requires`, con las mismas
  reglas de validación (objeto conocido: campos desconocidos = error).
- Cada entrada nombra un miembro del mismo árbol por `package`; la
  ausencia de `version` equivale a «cualquier versión».
- `version` es una restricción semver del conjunto acotado npm —
  `^`, `~`, exacta `x.y.z`, comparadores (`>=`, `<=`, `>`, `<`), `*`—,
  verificada contra la `version` que el manifiesto del miembro
  declara; una restricción malformada invalida el manifiesto.
- `install` deja de ser obligatorio cuando el paquete declara
  `dependencies`: el spec queda coherente para paquetes de composición
  pura.
- La resolución es transitiva dentro del árbol; el conjunto se ordena
  topológicamente (dependencia antes que dependiente) y ese orden
  gobierna verificación, plan y ejecución.
- Un ciclo se detecta en la resolución y aborta el conjunto con la ruta
  legible del bucle (`a → b → a`), antes de cualquier escritura —
  destino, lock o respaldos—.
- Una dependencia sobre un miembro inexistente o una versión que no
  satisface todas las restricciones declaradas sobre la misma pieza
  aborta el conjunto con diagnóstico, sin escribir.
- `--package` conserva su semántica: solo se resuelve lo declarado por
  los miembros seleccionados.
- Cada pieza instalada queda en el lock como una instalación normal
  con el origen del conjunto — `reinstall` la reproduce sin cambios—.
- Suite en verde con cobertura total en `src/`; pruebas de ciclo,
  miembro inexistente, restricción satisfecha e insatisfecha, orden
  del conjunto, metapaquete puro y deduplicación de entradas
  repetidas.
- Documentación viva actualizada: spec, manual (referencia o guía
  según convenga), dominio de instalación y colección si aplica.

## Procedimiento sugerido

1. Extender el spec y `src/manifest.js` con el campo `dependencies` y
   la relajación de `install`; evaluador del conjunto acotado de rangos
   apoyado en la biblioteca `semver` (node-semver, o el fork
   cero-dependencias `@vltpkg/semver`), que además sustituye al
   comparador propio `semverAtLeast`.
2. Resolución del conjunto: tras obtener el árbol, recorrer las
   dependencias declaradas por los miembros seleccionados, verificar
   existencia y versión por miembro, detectar ciclos y producir el
   orden topológico —todo antes de planear.
3. Integración en `runInstall` reutilizando la mecánica multi-unidad:
   todas las unidades resueltas se verifican, planean y ejecutan como
   un conjunto, con la política de conflictos compartida.
4. Pruebas de unidad y de comando por cada criterio; e2e del
   metapaquete; documentación viva.

## Notas

- Las dependencias externas se prevén como la misma entrada con un
  campo de origen (borrador 02): diseñar el nombre y la forma del
  campo de modo que esa extensión no redefina la gramática.
- La identidad de una dependencia es el `package` nombrado —igual que
  `--package`—; el nombre del dependiente no necesita cualificación
  porque el árbol es un solo origen.
- Un paquete no puede depender de sí mismo: es un ciclo de longitud
  uno y aborta como los demás.
- El conjunto acotado del spec es el vocabulario que el formato
  *declara*; la biblioteca es solo el mecanismo que lo evalúa. Si el
  validador acepta la gramática entera de node-semver o exige el
  subconjunto documentado lo decide el plan —declarar el subconjunto
  mantiene la restricción prerelease fuera como el alcance fija—.

## Contexto

- Archivos similares:
  - `src/manifest.js` — el contrato a extender: la tabla
    `VALIDATORS` compone un validador por campo (`checkRequires`
    es el molde de un campo objeto con lista interna),
    `OBJECT_KEYS` declara los campos conocidos de cada objeto —
    desconocido = error— y `checkInstall` es el punto a relajar
    cuando `dependencies` esté presente.
  - `src/collection.js` — `resolveSelection`/`indexEntries`
    resuelven miembros por nombre dentro del árbol obtenido;
    `describeIndex` carga el manifiesto de cada miembro con
    `loadManifest`, la misma lectura que la resolución del
    conjunto necesita para las restricciones de versión.
  - `src/commands.js` — `selectUnits`/`resolveMembers`/
    `installUnit` son la mecánica multi-unidad actual —unidades
    independientes, secuenciales, relectura del lock por unidad—;
    `runReinstall` es la referencia del conjunto antes que
    escritura: obtener todas las unidades primero, verificar y
    planear cada una, abortar sin efectos cuando una falla;
    `executeAndReport` es el final compartido por unidad.
  - `src/plan.js` — `semverAtLeast` es el comparador propio que
    la biblioteca semver sustituye (investigación 2026-11);
    `buildPlan` itera `manifest.install` directamente —un
    metapaquete sin `install` exige que el plan tolere la lista
    ausente—.
  - `src/verify.js` — `verifyPackage` devuelve el resultado
    estructurado que la fase de plan consume sin revalidar.
  - `test/manifest.test.js` y `test/cli.test.js` — los arneses:
    `pkgWith`/`errorsOf` para el contrato del manifiesto;
    `run(argv, io)`, `writePkg`, `writeCollection`, `spyFetch`
    para los comandos sin red ni procesos.
  - `test/e2e.test.js` — el e2e del binario real con
    `spawnSync` para el metapaquete.
  - `manual/referencia-install.md`, `manual/001-instalar-un-paquete.md`
    y `manual/005-instalar-desde-una-coleccion.md` — las páginas
    que documentan el comportamiento que la tarea altera.
- Patrones:
  - El validador acumula errores y avisos, nunca lanza: cada
    validador de la tabla posee un campo y el orden de la tabla
    es el orden de los errores (`loadContract`).
  - Idiomas de resultado por capa (D021): el dominio devuelve
    objetos discriminados o listas de errores; la invocación
    emite por `err` y devuelve `EXIT_*`.
  - Conjunto antes que escritura (D005): la resolución entera
    del grafo precede a cualquier plan; un conjunto no
    ejecutable aborta sin escribir destino, registro ni
    respaldos.
  - La unidad se instala con la pipeline compartida y el lock
    se relee por unidad —la unidad anterior ya escribió—.
  - Cada función exportada lleva un comentario de diseño que
    explica el porqué; la suite exige cobertura total en `src/`.
  - La biblioteca de rangos es el mecanismo, no el contrato: el
    spec declara el vocabulario acotado y la dependencia nueva
    entra por `package.json` —hoy solo `tar`— con versión fijada.
- Dominio:
  - `docs/domains/001-paquete.md` — los invariantes del
    manifiesto que el campo nuevo respeta (objeto conocido con
    campos desconocidos = error, `version` semver `x.y.z`) y la
    resolución de miembros por nombre.
  - `docs/domains/002-instalacion.md` — «unidad de colección» y
    el plan canónico: la instalación compone unidades
    independientes con el pipeline compartido; el invariante
    D005 del aborto total que la resolución del conjunto
    materializa antes del plan.
  - `docs/domains/003-registro.md` — cada pieza instalada queda
    como una instalación normal con su `origin` (D014).
- Producto:
  - `docs/especificacion-paquete.md` — el contrato que gana
    `dependencies` junto a `requires` y la relajación de
    `install` para paquetes de composición.
  - `manual/referencia-install.md` y
    `manual/001-instalar-un-paquete.md` — el comportamiento de
    `install` que el conjunto resuelto cambia.
  - `manual/005-instalar-desde-una-coleccion.md` — la selección
    por `--package` cuya semántica se conserva.
- PRD: `docs/prd/011-dependencias-entre-paquetes.md` — CU-1
  (producto completo en una invocación), CU-2 (solo la pieza
  pedida con su conjunto), CU-4 (bucle → aborto con la ruta
  legible), CU-5 (versión insatisfecha → aborto), CU-6 (pieza
  inalcanzable → aborto con diagnóstico), CU-7 (varias piezas
  exigen rangos sobre la misma: la obtenida cumple todos).
  CU-3 —entre orígenes— pertenece a la tarea 066.
- Investigación:
  - `docs/research/2026-11-dependencias-semver-gestores.md` —
    la restricción es aserción, no selección: la referencia elige
    el árbol y el rango valida la `version` del manifiesto
    obtenido; vocabulario acotado npm (`^`, `~`, exacta,
    comparadores, `*`); unión de restricciones sobre la misma
    unidad; prereleases fuera; evaluación sobre la biblioteca
    `semver` (o el fork `@vltpkg/semver`), que sustituye a
    `semverAtLeast`.
- Lecciones:
  - `documentacion-viva.md` — spec, manual y dominios sin
    detalle histórico puntual.
  - `revision-tecnica-subagente.md` — la revisión técnica corre
    con un subagente capaz de ejecutar comandos (aplica al paso
    de revisión del ciclo).
- Decisiones:
  - D001 — manifiesto JSON puro: `dependencies` es dato
    declarativo, nada ejecutable.
  - D002 — un origen es paquete o colección; la dependencia
    nombra miembros del mismo árbol, no colecciones.
  - D003 — la autoridad de la versión es el manifiesto: el rango
    valida contra la `version` declarada del miembro.
  - D005 — plan completo antes de escribir y aborto total del
    conjunto.
  - D006 — las colisiones del conjunto las decide la política
    compartida.
  - D014 — cada pieza registra su `origin` en el lock; el
    conjunto comparte el origen de la invocación.
  - D019 — `--package` sigue siendo la selección: solo se
    resuelve lo declarado por los miembros pedidos.
  - D021 — los fallos de resolución (ciclo, inexistente,
    insatisfecha) se expresan en el idioma de su capa.

## Conectividad

Parcialmente conectada. Todo lo que la tarea asume del codebase
existe con la forma esperada: la tabla `VALIDATORS` con
`checkRequires` como molde del campo objeto y `OBJECT_KEYS` para
los campos conocidos, `checkInstall` como punto de la relajación;
la resolución de miembros por nombre (`resolveSelection`,
`indexEntries`) y la carga de manifiestos de miembros
(`describeIndex`) en `src/collection.js`; la mecánica
multi-unidad y del conjunto —`selectUnits`, `resolveMembers`,
`installUnit`, el obtener-verificar-planear-antes-de-escribir de
`runReinstall`, `settleConflicts`, los preflights de guía y
respaldo, `executeAndReport`— en `src/commands.js`;
`verifyPackage` con su resultado estructurado; y los arneses de
prueba (`pkgWith`/`errorsOf`, `run`/`writePkg`/`writeCollection`/
`spyFetch`, el e2e con `spawnSync`).

Dos vacíos, ambos absorbibles dentro del alcance de la tarea:

- La biblioteca semver no está en el codebase —`package.json`
  solo declara `tar`—: la tarea la introduce como dependencia
  con versión fijada y sustituye `semverAtLeast`, como el plan
  de la épica ya decidió.
- `buildPlan` itera `manifest.install` sin tolerar su ausencia:
  el metapaquete exige que el plan admita la lista ausente —un
  ajuste local del constructor, no infraestructura nueva—.

## Plan técnico

`src/manifest.js` valida el manifiesto con una tabla de un
validador por campo —`install` es hoy obligatorio y no vacío— y
`OBJECT_KEYS` fija los campos conocidos de cada objeto. La
obtención trae el árbol una vez; `selectUnits`/`resolveMembers`
traducen la selección a directorios que `installUnit` instala
en secuencia con la pipeline compartida, y `runReinstall` ya
materializa el patrón «conjunto antes que escritura». El cambio
añade el campo `dependencies`, una resolución del conjunto
transitivo dentro del árbol —existencia, unión de
restricciones, ciclos, orden topológico— antes de cualquier
plan, y su integración en `runInstall`; los rangos se evalúan
con la biblioteca `semver`, que sustituye al comparador propio.

- [x] Añadir `semver` a las dependencias (`^7.8.6`, publicada
  2026-11-02) y reimplementar `semverAtLeast` sobre ella
  conservando «argumento inválido → falso»
  - Aporta: un solo evaluador semver sirve a los rangos y a la
    comparación de downgrade; los llamadores (`plan.js`,
    `queries.js`) no cambian su contrato
  - Contexto: `semver.gte` lanza ante entradas inválidas —el
    envoltorio conserva el `false` que el comparador propio
    devolvía—
- [x] Extender el contrato del manifiesto con `dependencies`:
  campo en `TOP_LEVEL_FIELDS`, entrada en `OBJECT_KEYS`
  (`{ "package", "version"? }`), validador en la tabla con el
  molde de `checkRequires` —lista de objetos posiblemente
  vacía, `package` con la forma de nombre del miembro,
  `version` restringida al vocabulario acotado: `^`, `~`,
  exacta `x.y.z`, comparadores `>=`/`<=`/`>`/`<` y `*`,
  componibles por espacio
  - Aporta: la declaración defectuosa es manifiesto inválido
    antes de cualquier resolución; el spec —no la biblioteca—
    fija la gramática declarada
  - Contexto: `version` se evalúa con la biblioteca, pero la
    restricción al conjunto acotado la da el validador
    —`validRange` acepta más—; `origin` lo añade la 066 a la
    entrada sin redefinir la gramática
- [x] Relajar `install`: se exige salvo que `dependencies`
  declare una lista no vacía; presente, `install` conserva
  todas sus reglas
  - Aporta: el metapaquete es válido sin abrir la puerta a
    paquetes que no declaran nada —`install` ausente con
    `dependencies: []` sigue siendo inválido—
- [x] Tolerar `install` ausente en los constructores del plan:
  la lista ausente vale `[]` en `buildPlan`/`buildUpdatePlan`
  - Aporta: el metapaquete verificado produce un plan sin
    recursos —solo `mkdirs` de `requires` con `create`, si los
    hay— en lugar de romper en la iteración del mapa
- [x] Crear el resolvedor del conjunto (`src/dependencies.js`):
  dada la raíz del árbol y las unidades seleccionadas, recorre
  las `dependencies` transitivas —cada entrada nombra un
  miembro por su nombre en el índice de la colección, la misma
  lectura basename→ruta que `resolveSelection` usa; en un
  origen no colección el único miembro es el propio paquete—,
  carga el manifiesto de cada miembro para leer `version` y sus
  propias `dependencies`, une las restricciones sobre la misma
  pieza, detecta ciclos con la ruta legible (`a → b → a`) y
  devuelve el orden topológico —dependencia antes que
  dependiente— o los errores del conjunto
  - Aporta: la novedad del dominio queda en un módulo propio
    con el idioma de su capa —`{ ok, units } | { ok: false,
    errors }`— que la 066 extiende con orígenes ajenos sin
    rehacerlo
  - Contexto: la identidad del grafo es el nombre del miembro
    —entradas repetidas se deduplican, restricciones se
    acumulan—; la pieza sin dependencias —campo ausente o
    `[]`— es el caso base: el grafo de un conjunto válido es
    acíclico y toda cadena termina en una hoja; un miembro cuyo
    manifiesto no carga es pieza inalcanzable con diagnóstico,
    como un nombre duplicado en el índice
- [x] Integrar la resolución en `runInstall`: tras
  `selectUnits` el resolvedor expande el conjunto; sus errores
  salen por `err` y abortan con el código de plan no ejecutable
  —antes de verificar unidad alguna—; el conjunto ordenado
  recorre `installUnit` en orden
  - Aporta: ciclo, pieza inexistente o restricción insatisfecha
    abortan sin escribir (D005 a nivel de conjunto); la
    ejecución por unidad con su relectura del lock no cambia
  - Contexto: `installUnit` ya registra `origin.package` en
    unidades con nombre —la dependencia resuelta se registra
    como una pieza seleccionada y `reinstall` la reproduce—;
    el código es el del plan no ejecutable (2), coherente con
    las precondiciones incumplidas de `requires`
- [x] Documentación viva: el spec gana `dependencies` —forma,
  lista vacía admitida, vocabulario, resolución del mismo
  origen, autodependencia como ciclo, relajación de `install`—;
  el manual declara el conjunto (referencia `install`, guía
  001; 005 conserva `--package`); dominios 001 (campo nuevo) y
  002 (resolución como fase) se actualizan
  - Aporta: contrato, referencia y dominio quedan coherentes
    con el código en el mismo cambio
- [x] Pruebas de la suite esperada: contrato en
  `manifest.test.js`, unidad del resolvedor en
  `test/dependencies.test.js`, comando con
  `run`/`writeCollection` y e2e del metapaquete
  - Aporta: cubre la suite sin red ni procesos, con cobertura
    total en `src/`

## Suite de pruebas esperada

- `dependencies` con entradas bien formadas valida; `version`
  ausente equivale a cualquier versión (CU-1; O)
- `dependencies: []` es válido —la hoja del grafo puede
  declararlo explícito— y equivale a no declarar dependencias
  (CU-1; Z)
- `dependencies` que no es lista invalida el manifiesto
  (CU-1; Z)
- Entrada que no es objeto, sin `package`, con `package` mal
  formado o con campo desconocido invalida (CU-1; I)
- `version` fuera del vocabulario declarado —texto libre,
  prerelease, parcial `1.2`, composición `||`— invalida aunque
  la biblioteca la aceptaría (CU-5; B)
- Sin `install` con `dependencies` no vacía → válido
  (metapaquete); sin `install` y sin `dependencies` no vacía →
  inválido (CU-1; B)
- Instalar un miembro con una dependencia instala ambas piezas,
  dependencia antes que dependiente, en una invocación
  (CU-1; O)
- Cadena transitiva a→b→c instala en orden de dependencia —toda
  cadena termina en una pieza sin dependencias (CU-1; M)
- Un metapaquete instala su conjunto y queda en el lock como
  instalación sin recursos propios, con el origen compartido
  (CU-1; O)
- Una pieza alcanzada por dos caminos se instala una sola vez;
  entradas repetidas se deduplican (CU-1; M)
- Restricción insatisfecha —`^2` frente a `1.4.0`— aborta sin
  escribir con diagnóstico que nombra pieza, restricción y
  versión hallada (CU-5; E)
- Dos restricciones conjuntamente imposibles —`>=2` y `<2`—
  abortan sin escribir (CU-7; E)
- Ciclo a→b→a aborta sin escribir con la ruta legible;
  autodependencia aborta como ciclo de longitud uno (CU-4; E)
- Dependencia a miembro inexistente aborta sin escribir con
  diagnóstico (CU-6; E)
- `--package` instala solo lo pedido y su conjunto declarado
  (CU-2; I)
- Un paquete que no es colección declara inalcanzable cualquier
  dependencia a otra pieza; sobre sí mismo, ciclo (CU-6; B)
- Miembro con manifiesto inválido = pieza inalcanzable con su
  motivo, no crash (CU-6; E)
- El plan se muestra por unidad antes de escribir y `--dry-run`
  no escribe nada (regresión del comportamiento del plan)
- Cada pieza del conjunto queda en el lock como instalación
  normal reproducible por `reinstall` (regresión del registro)

## Desviaciones

- La verificación del manifiesto de las unidades seleccionadas se
  adelantó a la resolución del conjunto —necesaria para conservar
  «manifiesto inválido → código 1» y para que el resolvedor lea
  manifiestos ya validados—. Efecto: una selección que contiene un
  miembro con manifiesto inválido aborta ahora sin escribir nada,
  donde antes dejaba instaladas las unidades previas. La lectura es
  coherente con D005 a nivel de conjunto —«verificados antes de
  escribir»—; el test de regresión se actualizó a la nueva
  semántica.
- `resolveSet` devuelve la raíz de un origen no colección como
  `{dir}` sin `name`, de modo que `installUnit` no añade
  `origin.package` a un paquete único: el plan pedía preservar el
  origen y el e2e lo fijó.

## Revisión

- Subagente: 2026-11-23 — Aprueba con observaciones. Corregida la
  redacción de `referencia-install.md` (la resolución sigue a la
  validación de manifiestos de la selección, no precede a toda
  verificación). Quedan como menores registradas: el mensaje de
  nombre duplicado en el índice se repite si dos piezas lo demandan,
  y el diagnóstico de pieza inalcanzable no concatena los errores
  que `loadManifest` produjo. Confirmadas como alcance consciente:
  `update`/`reinstall` no revalidan las restricciones declaradas
  (el PRD deja los efectos sobre lo ya instalado fuera) y
  `semverAtLeast` sobre la biblioteca ensancha lo parseable en
  datos del lock no confiables sin efecto en lo que la herramienta
  escribe.
- Usuario (ejecución): 2026-11-23 — Aprueba (PR #29)
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
