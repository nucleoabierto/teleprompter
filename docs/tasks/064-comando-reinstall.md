# El comando `reinstall` de punta a punta

## Estado

[~] En progreso

## Tipo

desarrollo

## Objetivo

`teleprompter reinstall` recorre el registro del destino, obtiene
cada unidad anclada a su commit registrado, presenta el plan del
conjunto antes de escribir y lo ejecuta con la política de
conflictos y el respaldo vigentes, dejando cada entrada
reescrita como la de una instalación.

## Dependencias

- 063 —la reobtención anclada—.

## Entrada

- `src/usage.js`: gramática —`reinstall` sin argumentos ni
  opciones propias, con `--force`/`--skip`/`--dry-run` como sus
  hermanas de escritura—, `USAGE` y `HELP`.
- `src/cli.js`: el despacho por comando.
- `src/commands.js`: el pipeline compartido —`obtainPackage`,
  `verifyPackage`, `buildPlan`, `settleConflicts`,
  `checkGuideDestination`, `checkBackupDestination`,
  `backupName`, `executePlan`, `installPersonalization`,
  `reportExecutionFailure`— e `installUnit` como referencia de
  relectura del registro por unidad.
- `src/lock.js`: `readLock` y el recorrido de entradas que
  `outdated` ya usa.
- `manual/`: la página de referencia por comando y las guías
  numeradas por flujo.
- `test/`: la suite por módulo y el e2e de comandos.

## Resultado esperado

- `reinstall` sin argumentos reinstala todo el registro; no
  acepta posicionales ni opciones ajenas —la selección parcial
  quedó fuera de alcance—.
- La obtención de todas las unidades precede al plan: una
  unidad no reproducible —origen inalcanzable, `origin` ausente,
  `commit` no registrado, ruta local desaparecida, miembro
  disuelto— se reporta con su motivo y la operación aborta sin
  escribir nada, listando todas las unidades afectadas.
- El plan del conjunto se imprime por unidad antes de las
  decisiones. Por unidad es el plan de instalación sobre el
  árbol anclado: recurso intacto → `identical`, ausente →
  `create`, divergente o ajeno en un target → `conflict`, cuyo
  `overwrite` restaura el contenido declarado —con respaldo— y
  cuyo `skip` lo conserva. Cada divergencia es una sola
  decisión.
- `--dry-run` corta tras el plan sin escribir; la ejecución
  corre unidad a unidad; un fallo a mitad reporta lo aplicado y
  lo pendiente con el idioma de fallo de ejecución vigente; cada
  entrada queda reescrita con su `origin` intacto y
  `installedAt` renovado.
- El registro vacío o corrupto se comporta como en las demás
  operaciones —«no hay paquetes instalados» / degradación con
  aviso—.
- La ayuda describe el comando —`HELP` y `USAGE`— y el manual
  gana su página de referencia y la guía del flujo.

## Criterios de calidad

- Nada se escribe —ni destino, ni registro, ni respaldos— si
  cualquier unidad no es obtenible o el conjunto no es
  ejecutable (D005).
- Una unidad ya conforme se anuncia como tal dentro del
  conjunto, sin acciones.
- `npm test` en verde con el 100 % de cobertura en `src/`, e2e
  del flujo: un registro de dos unidades, una de ellas con
  deriva, que `--force` devuelve al estado declarado, con
  respaldo.

## Procedimiento sugerido

1. Gramática y ayuda en `usage.js`; despacho en `cli.js` hacia un
   `runReinstall` hermano de `runUninstall`.
2. Fase de obtención del conjunto —cada entrada a su unidad
   anclada con la primitiva del borrador 01, acumulando
   diagnósticos— y aborto reportado antes de cualquier plan.
3. Por unidad, el pipeline de instalación compartido con el
   `source` y el `commit` propios de su entrada: verificar,
   planear, decidir, preflight, ejecutar y reescribir el
   registro, con relectura por unidad como en `installUnit`.
4. Página `referencia-reinstall.md` del manual y la guía del
   flujo, con su entrada en la gramática de ayuda.
5. Tests de unidad por camino y el e2e del criterio.

## Notas

- A commit fijo, el manifiesto obtenido es el que produjo la
  instalación: el plan de reproducción coincide con el plan de
  instalación y no hay retirados reales. El caso «registrado
  pero ya no traído» solo existe si la entrada fue alterada a
  mano; tras la reescritura esos targets quedan fuera del
  registro, intactos en disco y ya no gestionados —fuera de
  alcance—.
- El nombre `reinstall` fue decisión de la revisión: instalar
  otra vez lo declarado. `reproduce` y extender `install` sin
  espec quedaron como alternativas —la primera sugiere una
  operación distinta de instalar, la segunda sobrecarga la
  gramática del alias implícito—. La expectativa de
  `reinstall <paquete>` por paralelismo con `uninstall` se
  cierra con la gramática: no acepta posicionales.
- La guía gestionada vive fuera de `manifest.install`, así que
  el plan de recursos no la ve: conforme exige, además del plan
  sin trabajo, que el registro diga la verdad contra el disco —
  cada recurso del plan registrado en `files`, cada entrada
  escrita intacta (`classifyResource`), la `version` igual a la
  del manifiesto verificado, el campo `personalization` igual al
  target declarado y la guía íntegra ahí—. Un registro mentiroso
  —`files` vaciado, versión o campo caído o manipulado, entrada
  de archivo huérfana— o una deriva hacen a la unidad no
  conforme y la reescritura lo cura; las versiones del chequeo
  ancladas solo al disco o al campo registrado anunciaban
  «conforme» frente a un registro que mentía —defectos que dos
  rondas de revisión detectaron y esta forma cerró—.
- La guía restaurada es territorio gestionado: se materializa
  sin decisión en cada ejecución —también bajo `--skip`, que
  solo conserva los recursos en conflicto—, como en `install` y
  `update`. La referencia y la guía 008 lo declaran para que la
  lectura «skip lo conserva todo» no engañe.
- La verificación del conjunto acumula sus fallos igual que la
  obtención —varios manifiestos inválidos se listan de una
  vez— y el nombre publicado se contrasta con el vocabulario
  vigente de `checkVerified` («el origen publica "X", no "Y"»),
  no con una línea propia.

## Contexto

- Archivos similares:
  - `src/commands.js` — `runUninstall` es el `run*` hermano que
    opera sobre el lock del directorio de trabajo sin destino;
    `installUnit` es la referencia de pipeline por unidad con
    relectura del registro; `obtainRecordedUnit` (tarea 063) es
    la primitiva de reobtención anclada que esta tarea compone
    por entrada; `executeAndReport` es el final compartido
    —ejecutar, guía, `writeLock`, informe— que reescribe la
    entrada con `origin` intacto e `installedAt` renovado.
  - `src/usage.js` — la gramática por comando: `COMMAND_OPTIONS`
    con el set propio (`uninstall` declara `force`/`skip`/
    `dry-run`; `reinstall` sin posicionales sigue el molde de
    `outdated` con ese set), entradas `HELP` y líneas de `USAGE`.
  - `src/cli.js` — una línea de despacho por comando hacia su
    `run*`.
  - `src/queries.js` — `showOutdated`/`showList` muestran el
    recorrido de `lockEntries` y el idioma «no hay paquetes
    instalados» del registro vacío.
  - `test/cli.test.js` — el arnés `run(argv, io)`, `tmp`,
    `writePkg`, `writeCollection`, `spyFetch`, `remoteOk` y
    `RESOLVED` ejercen comandos y remota sin red ni procesos.
  - `test/e2e.test.js` — el e2e con el binario real:
    `destWithPriorWork` arma un destino con trabajo previo y la
    aserción corre sobre `spawnSync`.
  - `manual/referencia-uninstall.md` y
    `manual/006-desinstalar-un-paquete.md` — los modelos de la
    página de referencia (sinopsis, «Qué hace», tabla de errores)
    y de la guía numerada por flujo («Comportamiento»); su alta
    en `mkdocs.yml` nav y `manual/index.md`.
- Patrones:
  - Idiomas de resultado por capa (D021): la capa de invocación
    emite por `err` y devuelve `{ code: EXIT_* }`; el dominio
    devuelve `{ ok, … }`/`{ ok: false }`.
  - Un comando sobre el lock del directorio de trabajo no toma
    destino ni posicionales; la gramática lo rechaza con `null`
    → `EXIT_USAGE` y ayuda por stderr.
  - El lock es dato no confiable: se recorre con `lockEntries`,
    nunca `lock.packages`; corrupto degrada a aviso, no a crash.
  - Conjunto antes que escritura (D005): la obtención de todas
    las unidades precede al plan; una no obtenible aborta sin
    escribir nada —ni recursos, ni registro, ni respaldos—.
  - El plan de reproducción es el plan de instalación sobre el
    árbol anclado: intacto→`identical`, ausente→`create`,
    divergente→`conflict`; sin retirados.
  - La política de conflictos es la compartida (D006):
    `settleConflicts` con `--force`/`--skip`/interactivo/listado
    y aborto; lo restaurado se respalda con `backupName` bajo
    `.teleprompter/backups/`; una divergencia es una decisión.
  - El registro se relee por unidad —como `installUnit`— porque
    la unidad anterior ya escribió su entrada.
  - Cada función exportada lleva un comentario de diseño que
    explica el porqué, no el qué.
- Dominio:
  - `docs/domains/002-instalacion.md` — «unidad no reproducible»
    y «reobtener la unidad registrada» declaran el anclaje y los
    casos degenerados; el invariante D005 del aborto total.
  - `docs/domains/003-registro.md` — la forma del `origin` que la
    reescritura conserva y el lock como dato no confiable.
  - `docs/domains/004-resolucion-conflictos.md` — la política que
    decide las divergencias de la reproducción.
- Producto:
  - `manual/referencia-uninstall.md` — el molde de la página de
    referencia nueva (`referencia-reinstall.md`).
  - `manual/006-desinstalar-un-paquete.md` — el molde de la guía
    del flujo con escenarios respaldados por la suite.
- PRD: `docs/prd/010-reproduccion-destino.md` — CU-1 declara el
  plan del conjunto por unidad, la unidad conforme anunciada y
  una decisión por divergencia; CU-2 el modo solo-plan; CU-3 el
  aborto con las unidades no reproducibles listadas con motivo.
  El comportamiento esperado fija conjunto antes que escritura,
  anclaje al commit registrado y registro vacío/corrupto como en
  las demás operaciones.
- Lecciones:
  - `revision-tecnica-subagente.md` — la revisión técnica corre
    con un subagente capaz de ejecutar comandos (aplica al paso
    de revisión del ciclo).
  - `documentacion-viva.md` — nada de detalle histórico puntual
    en los documentos vivos (aplica a las páginas del manual).
- Decisiones:
  - D005 — plan completo antes de escribir; aborto sin efectos.
  - D006 — la política de colisiones compartida.
  - D014 — la forma del `origin` y su opcionalidad en locks
    anteriores.
  - D019 — `origin.package` re-resuelve el miembro por nombre.
  - D021 — la «unidad no reproducible» y los fallos se expresan
    en el idioma de su capa.

## Conectividad

Conectada. Todo lo que la tarea asume existe en el codebase:
`obtainRecordedUnit` en `src/commands.js` —la primitiva de
reobtención anclada que la 063 fusionó—, el pipeline compartido
completo (`verifyPackage`, `buildPlan`, `settleConflicts`,
`checkGuideDestination`, `checkBackupDestination`, `backupName`,
`executePlan`, `installPersonalization`, `reportExecutionFailure`)
y `installUnit` como referencia de relectura por unidad;
`readLock` y `lockEntries` en `src/lock.js` para el recorrido del
registro; la gramática por comando en `src/usage.js` con los sets
de `COMMAND_OPTIONS`, `HELP` y `USAGE`, y el despacho en
`src/cli.js`; el arnés de pruebas (`run`, `tmp`, `writePkg`,
`writeCollection`, `spyFetch`, `remoteOk`, `RESOLVED`) y el e2e
del binario real; y la estructura del manual con sus páginas de
referencia, guías numeradas y alta en `mkdocs.yml` e `index.md`.

## Plan técnico

`reinstall` es el cuarto comando del ciclo de vida sobre el lock
del directorio de trabajo —sin destino ni posicionales—. Compone
la reobtención anclada de la 063 (`obtainRecordedUnit`) por
entrada del registro y corre, por unidad, el pipeline compartido
de instalación —verificar, planear, decidir, preflight, ejecutar,
reescribir— en una estructura de conjunto: obtener todo, planear
e imprimir todo, decidir y preflight todo, ejecutar unidad a
unidad. Nada se escribe si cualquier unidad no es reproducible,
no es obtenible o el conjunto no es ejecutable (D005).

- [x] Gramática de `reinstall` en `src/usage.js`: set propio en
  `COMMAND_OPTIONS` (`force`, `skip`, `dry-run`), rama de
  `parseArgs` que exige cero posicionales, entrada en `HELP` y
  línea en `USAGE` con las listas de opciones actualizadas
  - Aporta: el comando existe en la superficie y su gramática
    cierra la selección parcial —fuera de alcance— igual que sus
    hermanas
  - Contexto: `COMMAND_OPTIONS` indexa por comando; la rama
    sigue el molde de `uninstall` pero exige `args.length === 0`
- [x] Despacho en `src/cli.js` hacia `runReinstall`
  - Aporta: una línea conecta la gramática con el ciclo de vida
- [x] `runReinstall` en `src/commands.js` — fase de obtención
  del conjunto: recorre `lockEntries` aplicando
  `obtainRecordedUnit` por entrada y acumulando unidades
  obtenidas y diagnósticos; cualquier fallo aborta tras
  intentar todas —con las unidades afectadas listadas—
  liberando los temporales; registro vacío responde «no hay
  paquetes instalados»
  - Aporta: materializa «conjunto antes que escritura»: la
    obtención completa precede a todo lo demás y los temporales
    se liberan en cualquier camino
  - Contexto: la primitiva ya distingue «no reproducible»
    (`EXIT_USAGE`) de «no obtenible» (`EXIT_FETCH`) por su
    canal; el listado acumula ambos motivos por `err` y el
    retorno usa el primer código de fallo
- [x] `runReinstall` — fase de plan del conjunto: por unidad,
  `verifyPackage`+`checkVerified` y `buildPlan` sobre el lock
  leído una vez; una unidad conforme —todo `identical`, sin
  conflictos ni altas— se anuncia como tal sin plan ni fases
  siguientes; el resto imprime su plan etiquetado por unidad;
  un manifiesto inválido aborta el conjunto
  - Aporta: los planes se imprimen completos antes de cualquier
    decisión, como el PRD declara; la conforme sale del camino
    con su anuncio
  - Contexto: `printPlan` hoy no nombra la unidad —la etiqueta
    (en el título o en una línea previa) es la pieza que el
    conjunto exige para que el usuario sepa qué unidad mira
- [x] `runReinstall` — fase de decisión y preflight: por unidad
  no conforme, `settleConflicts` → `checkGuideDestination` →
  `checkBackupDestination`, y después el corte `--dry-run`;
  cualquier no ejecutable aborta antes de la primera escritura
  - Aporta: cada divergencia es una sola decisión con la
    política compartida y el conjunto se prueba ejecutable
    completo antes de escribir
- [x] `runReinstall` — fase de ejecución por unidad: relee el
  lock por unidad (disciplina de `installUnit`), ejecuta con
  `executeAndReport` pasando el `entry.origin` registrado y un
  verbo propio (`reinstalado`); un fallo a mitad reporta lo
  aplicado y las unidades pendientes; `finally` libera los
  temporales
  - Aporta: cada unidad termina como una instalación —misma
    reescritura con `origin` intacto e `installedAt` renovado,
    mismo informe, respaldo incluido— y `check` queda sin
    deriva tras un `--force`
  - Contexto: `writeLock` recibe `entry.origin` verbatim para
    conservar `commit` y `package`; la unidad conforme no se
    reescribe —su entrada ya es veraz
- [x] `manual/referencia-reinstall.md` y la guía numerada del
  flujo (`008-…`), con su alta en `mkdocs.yml` nav e
  `manual/index.md`
  - Aporta: la funcionalidad entra a la documentación de
    producto en sus dos moldes, con escenarios respaldados por
    la suite
  - Contexto: revisar si `manual/guia-de-uso.md` enumera
    comandos y actualizarla si aplica
- [x] Pruebas del flujo en `test/cli.test.js` con el arnés
  vigente y e2e del criterio en `test/e2e.test.js`
  - Aporta: cubre la suite esperada sin red ni procesos, salvo
    el e2e con el binario real

## Suite de pruebas esperada

- `reinstall` no acepta posicionales ni opciones ajenas —la
  selección parcial es error de invocación (gramática; E)
- `help reinstall` y `reinstall --help` describen el comando (I)
- Registro vacío → «no hay paquetes instalados» sin escribir (Z)
- Registro corrupto → aviso y «no hay paquetes instalados» (E)
- Una unidad intacta se anuncia conforme, sin acciones ni
  reescritura (CU-1; O)
- Un recurso borrado a mano reaparece con el contenido declarado
  (CU-1; B)
- Una divergencia con `--force` se restaura y respalda en
  `.teleprompter/backups/` (CU-1; B)
- Una divergencia con `--skip` se conserva y queda registrada
  `skip` (CU-1; B)
- En consola interactiva cada divergencia se pregunta una vez
  con su diff (CU-1; I)
- Divergencias sin consola ni opciones se listan con diff y
  abortan sin escribir (CU-1; E)
- Un registro de dos unidades con deriva restaura todo con
  `--force` y `check` queda sin deriva —e2e del criterio—
  (CU-1; M)
- Los planes de todas las unidades se imprimen antes de la
  primera decisión (CU-1; I)
- `--dry-run` muestra el plan del conjunto y corta sin escribir
  recursos, registro ni respaldo (CU-2; O)
- `--dry-run` con `--force` resuelve por adelantado y corta
  (CU-2; B)
- Entrada sin `origin`, `github` sin `commit`, ruta local
  ausente, `repo` ilegible o miembro disuelto → unidad no
  reproducible con su motivo y aborto sin escritura (CU-3; E)
- Varias unidades no reproducibles se listan todas con su
  motivo (CU-3; M)
- Una unidad no reproducible junto a una obtenible deja también
  a esta sin escribir (CU-3; B)
- Un origen remoto sin respuesta aborta con error de obtención,
  distinto del diagnóstico de no reproducible (CU-3; E)
- La entrada reescrita conserva el `origin` —`repo`, `ref`,
  `commit`, `package`— y renueva `installedAt` (CU-1; B)
- Una unidad de colección se reinstala re-resolviendo el
  miembro registrado (CU-1; B)
- Un fallo a mitad de ejecución reporta lo aplicado y las
  unidades pendientes (CU-1; E)

## Revisión

- Subagente: ronda 1 (2026-11-21) — Solicita cambios: el chequeo
  «conforme» se anclaba al campo `personalization` registrado y
  bendecía una guía ausente que `check` reportaba (re-anclado al
  target declarado más la veracidad del registro contra el
  disco); faltaban el alta en `manual/README.md`, la operación
  en el dominio 002, la fila de precondiciones en la tabla de
  errores y la nota de que `--skip` no cubre la guía gestionada.
  Ronda 2 (2026-11-21) — Solicita cambios: la versión registrada
  tampoco se contrastaba (un origen `path` que subió de versión
  se anunciaba conforme con el lock mintiendo); el caso «`repo`
  ilegible» no se ejercía a nivel comando y las fichas de salud
  de los dominios 002/004 quedaron sin la revisión de la tarea.
  Ronda 3 (2026-11-21) — **Aprueba**: hallazgos menores —la
  entrada de `CHANGELOG.md` se añadió con la corrección—, una
  asimetría `files`→plan conforme a PRD («retirar targets no
  traídos» fuera de alcance, preserva la semántica `keep`) y el
  nombre de unidad interpolado sin escapar, precedente mixto de
  bajo riesgo.
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
