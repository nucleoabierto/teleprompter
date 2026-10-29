# Instalación

## Propósito

Llevar un paquete válido a un repositorio con trabajo previo sin
pisarlo: verificar, presentar un plan completo antes de escribir,
resolver colisiones con una política declarada y dejar registro de lo
instalado.

## Referencia del modelo

- **Lenguaje ubicuo:**
  - **Plan:** la lista completa de acciones calculada antes de tocar
    el destino; incluye los `mkdir` de las precondiciones con
    `create: true` y una entrada por recurso con su marca.
    - Ancla: `buildPlan` en `src/plan.js`; contrato en
      `docs/instalador.md` sección «El plan»
    - Origen: tarea `docs/tasks/009-plan-de-instalacion.md`
  - **Marca del plan:** estado de cada recurso —`create` (destino
    libre), `identical` (contenido igual), `managed-update` (propio y
    sin tocar, versión igual o posterior) o `conflict` (contenido
    distinto ajeno o propio modificado).
    - Ancla: `buildPlan` en `src/plan.js`
  - **Resolución:** la decisión sobre un `conflict` —`overwrite` o
    `skip`— por flag, por respuesta interactiva o por aborto.
    - Ancla: `resolveConflicts` en `src/plan.js` (la asignación es
      operación del plan), `settleConflicts` en `src/commands.js` (la
      política) y `createAsker` en `src/prompt.js`
  - **Diff de conflicto:** la comparación visible destino↔paquete que
    acompaña el anuncio de cada `conflict` —tras `conflicto sin
    resolver:` en el listado no interactivo y antes de la pregunta en
    la interactiva—. Es un diff unificado línea a línea por archivo,
    resuelto hoja a hoja cuando el recurso es una carpeta: solo las
    hojas divergentes producen bloque, las unilaterales se muestran
    como adición o retirada íntegras, los enlaces se comparan por su
    destino y un `removal` —sin lado entrante— muestra el contenido
    local que se retiraría. La comparación se hace en crudo y el
    escape de caracteres de control es solo de presentación; las
    hojas ilegibles o binarias degradan a un marcador. `--force` y
    `--skip` no lo emiten: resuelven sin anuncio.
    - Ancla: `diffResource`, `diffLines` y `show` en `src/diff.js`;
      `settleConflicts` en `src/commands.js`
    - Origen: tarea
      `docs/tasks/041-mostrar-diff-archivos-conflicto.md`
  - **Respaldo:** la copia del contenido previo del destino que un
    conflicto resuelto `overwrite` —sobrescribir o, en un retirado,
    quitar— conserva antes del paso destructivo. Vive bajo
    `.teleprompter/backups/<operación>/`, espejo de la ruta relativa
    del recurso —un directorio por operación nombrado
    `<marca-UTC>-<paquete>[@<versión-registrada>]`, donde la versión
    es la que el respaldo desplaza y solo entra si el registro la
    guarda con forma semver, pues el lock es dato que no se
    interpola a ciegas—. Solo los conflictos sobrescritos lo
    producen: `skip`, `create`, `identical` y `managed-update` no
    generan copia, y la entrada aplicada declara su ubicación aunque
    el paso destructivo falle después.
    - Ancla: `backupConflict` en `src/execute.js` —la copia usa la
      misma escritura y la misma guarda de escape del plan—;
      `backupName` y `checkBackupDestination` en
      `src/commands.js`; `reportBackup` en `src/report.js`
    - Origen: tarea
      `docs/tasks/040-respaldar-conflictos-sobrescritos.md`
  - **Registro (lock):** `teleprompter-lock.json` en la raíz del
    destino; por paquete guarda `version`, `installedAt` y `files`
    con `target`, acción y `sha256` —las entradas `skip` no llevan
    hash— y `personalization` con la ruta gestionada de la guía
    cuando el manifiesto la declara; `origin` registra de dónde vino
    la instalación —`{type:'github',repo,ref?,commit}` o
    `{type:'path',path}` absoluta—, opcional en entradas escritas
    antes del campo; `commit` es el commit resuelto de la
    obtención, también opcional —los locks previos no lo llevan—; una
    instalación desde colección añade
    `package` con el nombre del miembro y el origen apunta a la
    raíz de la colección. Es la memoria que distingue lo propio de
    lo ajeno. El lock es dato no confiable también en sus claves:
    las lecturas por nombre solo reconocen entradas propias —una
    clave heredada como `__proto__` o `constructor` se lee como
    ausente—; la guarda es de pertenencia, así que una entrada
    `__proto__` propia sigue resolviéndose.
    - Ancla: `readLock`, `isValidLock`, `writeLock`, `lockEntry`,
      `lockEntries` e `isWritten` en `src/lock.js` —la forma del
      registro solo se navega desde ese módulo, `lockEntry` lleva
      la guarda de propiedad propia e `isWritten` nombra la entrada
      registrada como escrita (toda `action` salvo `skip`)— y
      `originOf` en `src/commands.js`; D007, D014, D019
  - **Unidad de colección:** cada paquete que una selección nombra
    dentro de una colección; se instala como instalación plena e
    independiente —plan, colisiones, guía y registro propios—, en
    ejecución secuencial y atómica por unidad. La actualización
    re-resuelve el miembro por su nombre en el índice del árbol
    recién obtenido.
    - Ancla: `selectUnits` e `installUnit` en `src/commands.js`,
      `resolveSelection` en `src/collection.js`; D019
  - **Propiedad:** un recurso es propio cuando el destino actual
    hashea igual que lo que el registro anotó para él.
    - Ancla: `recorded.get(target) === destHash` en `src/plan.js`
  - **Commit resuelto:** el SHA exacto al que la referencia pedida
    apuntaba en el momento de la obtención —la rama por defecto
    cuando no hubo referencia—. Un SHA completo se toma por
    resuelto sin consulta; la descarga del tarball se ancla a ese
    SHA, así que el árbol extraído es siempre el commit que el
    resultado declara, no el que la rama móvil sirva después. El
    `commit` del origen registrado es este valor: mientras `ref`
    expresa la intención —«seguir esta rama»—, `commit` dice qué
    árbol produjo la instalación.
    - Ancla: `resolveCommit` y `repoUrls` en `src/fetch.js`;
      `originOf` en `src/commands.js` lo escribe en el origen
  - **Deriva:** el estado de un recurso registrado al confrontarlo
    con el disco —`intact` (el hash coincide), `modified` (difiere),
    `missing` (la ruta ya no existe) o `unverifiable` (sin `sha256`
    registrado, lectura fallida o ruta que escapa del destino); el
    informe los presenta como `intacto`, `modificado`, `ausente` y
    `no verificable`.
    - Ancla: `classifyResource` en `src/drift.js`, que aplica el
      nivel cadena de la defensa de rutas registradas
      (`recordedChainSafe` en `src/paths.js`); contrato en
      `docs/instalador.md` «La verificación del estado»
  - **Plan de actualización:** el plan de una versión entrante
    distinta de la registrada; además de las marcas de instalación
    añade `update` (la versión cambió el recurso y el destino sigue
    intacto) y `retire` (registrado, retirado por la versión e
    intacto → eliminación), y marca los retirados con deriva como
    `conflict` de eliminación —`overwrite` quita, `skip` conserva—.
    La unidad del retirado baja a recursos cuando el mapa cambia de
    granularidad (véase **unidad de retirado**). Versión igual a la
    registrada → `upToDate`, sin plan.
    - Ancla: `buildUpdatePlan` en `src/plan.js`; contrato en
      `docs/instalador.md` «El plan de actualización»; D015
  - **Unidad de retirado:** el subárbol máximo bajo un target
    directorio registrado que ni los targets entrantes ni otra
    entrada registrada cubren; el retirado opera sobre unidades,
    no sobre el target completo. Lo que está en el camino de un
    target entrante se conserva —nunca es unidad—, y un enlace
    conservado puede apuntar bajo una unidad hermana, así que ancla
    la expansión: todas las unidades pasan a decisión. Un target
    registrado descendiente de uno entrante lo gobierna la acción
    de ese recurso, y un árbol registrado intacto certifica el
    contenido de sus hijos entrantes —su hash vale como hash
    registrado para ellos—.
    - Ancla: `uncoveredUnits` en `src/drift.js`, `isWithin` en
      `src/paths.js` y `recordedHash` en `src/plan.js`
    - Origen: tarea
      `docs/tasks/029-retiro-directorio-padre-destruye-targets-hijos.md`
  - **Plan de retirada:** el plan de `uninstall`: recorre las
    entradas `files` del paquete registrado y la deriva decide la
    marca —`retire` para el recurso intacto (propio, la retirada es
    segura), `conflict` con `removal` para el divergente (modificado
    o no verificable: degrada a la decisión compartida —`overwrite`
    significa quitar, `skip` conservar—), nada para el ya ausente,
    que sale del plan sin marca como en la actualización—. Las
    entradas `skip` nunca producen entrada: la instalación nunca las
    escribió y caen con la entrada del paquete. La guía gestionada
    es un recurso más —sin la excepción de la guía reemplazada,
    propia de `update`—.
    - Ancla: `buildUninstallPlan` en `src/plan.js`
    - Origen: tareas
      `docs/tasks/042-uninstall-retira-paquete-intacto.md` y
      `docs/tasks/043-resolucion-divergencias-retirada.md`
- **Entidades / estado:**
  - `VerificationResult` — `kind: 'ok'|'manifest'|'requires'`, el
    manifiesto validado, `warnings`, `errors`, `creates` y `failures`.
    - Ancla: `verifyPackage` en `src/verify.js`
  - `Plan` — forma canónica compartida por los tres constructores:
    `{ upToDate, mkdirs, resources, conflicts, retired }`; cada
    recurso lleva `source`, `target`, `status` y, tras resolver,
    `resolution`. `upToDate` solo es verdadero en el plan de
    actualización —neutro `false` donde el concepto no se
    pregunta— y `retired` queda vacío fuera de la actualización.
    - Ancla: `buildPlan`, `buildUpdatePlan`, `buildUninstallPlan` y
      `resolveConflicts` en `src/plan.js`
  - `UpdatePlan` — el `Plan` de una versión entrante distinta;
    `resources` incluye las entradas del manifiesto y los retirados
    con deriva marcados `removal`, `retired` solo las marcas
    `retire`, y `upToDate` cortocircuita cuando la versión es la
    registrada.
    - Ancla: `buildUpdatePlan` en `src/plan.js`
  - `UninstallPlan` — el `Plan` de la retirada: `resources` lleva
    las marcas `retire` y los divergentes `conflict`/`removal` en el
    orden registrado, y `conflicts` recoge estos últimos para la
    política compartida.
    - Ancla: `buildUninstallPlan` en `src/plan.js`
  - Hash de recurso — SHA-256 sobre dominios separados (`file\n`,
    `link\n`, `dir\n`) para que tipos distintos nunca colisionen;
    los árboles ordenan sus entradas para que el digest sea
    independiente del orden de lectura.
    - Ancla: `hashPath` en `src/hash.js`
- **Invariantes:**
  - El plan completo se calcula antes de escribir; un plan no
    ejecutable aborta sin escribir nada —ni recursos ni registro
    (D005). Ancla: `runInstall`/`runUpdate` y las fases
    `settleConflicts`/`checkGuideDestination` en `src/commands.js`
  - «Existe» significa «hay una entrada en el directorio», sin seguir
    enlaces: un enlace colgado ocupa su ruta.
    Ancla: `hasEntry` en `src/paths.js`
  - `--force` y `--skip` son mutuamente excluyentes; el error es de
    invocación (código 4). Ancla: `parseArgs` en `src/usage.js`
  - `managed-update` exige hash registrado coincidente **y** versión
    del paquete ≥ versión registrada; un downgrade es `conflict`.
    Ancla: `semverAtLeast` en `src/plan.js`
  - Una respuesta interactiva que no es afirmativa significa `skip`:
    el defecto ante trabajo ajeno es no sobrescribir.
    Ancla: `createAsker` en `src/prompt.js`
  - Un lock ilegible o con estructura inesperada degrada a «sin
    historia» con aviso, nunca a crash.
    Ancla: `readLock`/`isValidLock` en `src/lock.js`
  - Ninguna escritura puede salir de la raíz por un enlace en la
    cadena de padres: el ancestro existente más profundo debe
    resolver a un directorio dentro del destino, en el plan y en la
    ejecución. Ancla: `resolvesUnder` en `src/paths.js`
  - El anuncio de un conflicto tampoco lee fuera de la raíz —del
    destino ni del paquete—: la ruta registrada y cada hoja pasan la
    defensa de cadena antes de leerse, y la que no la supera degrada
    a `(ruta insegura)` sin exponer contenido. Ancla:
    `recordedChainSafe` en `src/paths.js` aplicado por `diffResource`
    en `src/diff.js`
  - Dos entradas `install` no pueden compartir `target`: el plan sería
    ambiguo. Ancla: `checkInstall` en `src/manifest.js`
  - `.teleprompter/` es propiedad de la herramienta, igual que el lock:
    la guía declarada se copia ahí fuera del plan y sin detección de
    colisiones, y el respaldo de los conflictos sobrescritos vive en
    `backups/` —en ambos casos su destino se verifica escribible
    **antes** de escribir nada: un escape hace el plan no ejecutable
    (D005)—.
    Ancla: `installPersonalization` y `backupConflict` en
    `src/execute.js`, `MANAGED_DIR` en `src/paths.js` y la
    pre-verificación en `src/commands.js`; D010
  - Un recurso `identical` conserva el registro previo que sigue
    siendo veraz —una omisión `skip`, un hash que coincide— y
    registra el recurso en los demás casos: el paquete lo gestiona
    lo escribiera quien lo escribiera, y un hash registrado que el
    disco desmiente no sobrevive.
    Ancla: `writeLock` en `src/lock.js`
  - Un recurso retirado por la versión solo se elimina intacto —propio
    y sin tocar—; modificado o no verificable exige decisión. La
    regla opera por unidad de retirado: un target registrado
    ancestro de targets entrantes se expande en lugar de retirarse
    entero —y si no puede descenderse se conserva intacto o se
    decide—; un registrado descendiente de un entrante nunca se
    retira. Quedan
    excluidos las entradas `skip` y el target de `personalization`
    que el manifiesto **entrante** siga declarando. Si la versión
    declara otra guía, la registrada se retira incluso modificada
    —deja de ser la guía y un `keep` la dejaría huérfana para
    `guide`; solo un `unverifiable` —ruta insegura— sigue siendo
    decisión—; si la versión abandona el campo, la guía registrada se
    retira como cualquier otro recurso (D015). Ancla:
    `buildUpdatePlan` en `src/plan.js`
- **Operaciones:**
  - `teleprompter [install] <user/repo[@ref]> [destino]` o
    `teleprompter [install] --path <paquete> [destino]` — obtiene el
    paquete (tarball público de GitHub anclado al commit resuelto o
    directorio local), verifica,
    planea, resuelve, ejecuta y registra; el destino por defecto es el
    directorio de trabajo.
    - Ancla: `bin/teleprompter.js` → `main` en `src/cli.js`
  - Ejecutar el plan resuelto: `mkdirs` primero, luego cada recurso
    según su acción; `overwrite` elimina el destino antes de escribir
    —nunca a través de un enlace— y los enlaces se copian como
    enlaces. Un conflicto que llega a un paso destructivo copia antes
    su contenido previo al respaldo de la operación, la entrada
    aplicada declara su ubicación y el resultado lo anuncia con una
    sección `respaldo:`. Un fallo a mitad lanza `ExecutionError`, que
    transporta las acciones ya aplicadas y el error original como
    `cause`, para que el informe muestre el estado parcial —respaldo
    incluido—.
    - Ancla: `executePlan`, `backupConflict` y `ExecutionError` en
      `src/execute.js`; `reportBackup` en `src/report.js`
  - Registrar la instalación: fusiona el lock preservando otros
    paquetes; `identical` conserva el registro previo veraz o se
    registra con su acción y su hash, y `skip` va sin hash; la
    guía gestionada se añade a `files` y al campo `personalization`
    sin figurar entre las acciones del plan. La escritura es
    atómica —temporal en el mismo directorio + `rename`—, así que un
    corte a mitad deja el lock anterior o el nuevo, nunca uno
    truncado.
    - Ancla: `writeLock` en `src/lock.js`
  - Materializar y entregar la guía: `installPersonalization` copia
    el archivo declarado a `.teleprompter/<paquete>/<archivo>` tras
    ejecutar el plan, y el bloque final `personalización (<ruta>):`
    entrega el contenido de la copia materializada —no el fuente,
    que en origen remoto ya no existe—.
    - Ancla: `installPersonalization` en `src/execute.js` y
      `printGuide` en `src/report.js`
  - Consultar la guía: `teleprompter guide [<paquete>]` lee el campo
    `personalization` del registro del directorio de trabajo y
    muestra el mismo bloque; no hay destino ni opciones de
    instalación. Sin guía que mostrar es código 4; la ruta
    registrada insegura o el archivo ausente es código 3 —el lock
    es dato versionado y se revalida antes de leer.
    - Ancla: `showGuide` en `src/commands.js`, que aplica el nivel hoja de
      la defensa de rutas registradas (`resolveRecordedPath` en
      `src/paths.js`); D011
  - Consultar el registro: `teleprompter list` lee el registro del
    directorio de trabajo —sin argumentos ni opciones— y muestra una
    entrada por paquete con `nombre@version`, `installedAt` y los
    `target` escritos; las entradas `skip` no se listan —registran
    una omisión— y no se exponen hashes ni acciones. Sin
    instalaciones responde «no hay paquetes instalados» con código
    0: es una respuesta, no un fallo.
    - Ancla: `showList` en `src/commands.js`; D012
  - Calcular el plan de actualización: confronta la versión entrante
    con el registro y el disco; devuelve `upToDate` si la versión es
    la registrada, o el plan clasificado con los retirados según su
    deriva —sin escribir nada—.
    - Ancla: `buildUpdatePlan` en `src/plan.js`; D015
  - Actualizar: `teleprompter update <paquete> [<origen>]` opera
    sobre el directorio de trabajo —sin destino—; resuelve la fuente
    del `origin` registrado salvo que la invocación lo sobrescriba
    (`--path`, `user/repo[@ref]` o `--ref`), y luego ejecuta el flujo
    de instalación con el plan de actualización. Los conflicts
    `removal` preguntan por quitar y resuelven `remove`/`keep`; el
    registro queda a la versión nueva con el origen efectivo.
    - Ancla: `runUpdate` en `src/commands.js`; D016
  - Retirar un paquete: `teleprompter uninstall <paquete>` opera
    sobre el directorio de trabajo —sin destino—; nombra el paquete
    por su entrada del registro, presenta el plan de retirada
    completo antes de borrar, somete los `conflict`/`removal` a la
    política de conflictos compartida —pregunta con diff, flags
    `--force`/`--skip` o listado y aborto— respaldando lo decidido a
    retirar, y elimina los `retire` con la misma guarda de escritura
    que toda acción `remove`; al terminar reescribe el registro sin
    la entrada del paquete —atómicamente, con la escritura
    compartida de `writeLock`— y el lock persiste aunque `packages`
    quede vacío. Pedir un paquete no instalado es error de
    invocación (4), un plan no ejecutable sale con 2 y `--dry-run`
    muestra el plan sin escribir.
    - Ancla: `runUninstall` en `src/commands.js`, `buildUninstallPlan` en
      `src/plan.js` y `removeLockEntry` en `src/lock.js`
  - Verificar el estado de lo instalado: `teleprompter check`
    confronta el registro del directorio de trabajo con el disco
    —sin argumentos ni opciones— y muestra por paquete una marca de
    deriva por recurso registrado; las entradas `skip` no se
    verifican y encontrar deriva no es un fallo —la consulta siempre
    termina con código 0—.
    - Ancla: `showCheck` en `src/commands.js` y `classifyResource` en
      `src/drift.js`; D013
  - Códigos de salida: 0 éxito, 1 manifiesto inválido, 2 plan no
    ejecutable, 3 error de ejecución, 4 invocación, 5 obtención del
    repositorio remoto.
    - Ancla: `EXIT_*` en `src/exits.js`; contrato en
      `docs/instalador.md` «Resultado y errores»

## Explicación del dominio

- **Fronteras:**
  - Dentro: verificación, plan, resolución de colisiones, ejecución y
    registro de una instalación.
  - Fuera: la forma del manifiesto (dominio del paquete), el contenido
    de la personalización y la distribución del CLI.
  - Relaciones: consume el dominio del paquete a través del resultado
    estructurado de `verifyPackage`; la invocación (`bin/`) es una
    capa delgada sin dominio.
- **Decisiones relevantes:**
  - `docs/decisions/D005` — plan completo antes de escribir, aborto
    total.
  - `docs/decisions/D006` — política de colisiones: interactiva,
    aborto sin consola, `--force`/`--skip` excluyentes.
  - `docs/decisions/D007` — `teleprompter-lock.json` como memoria de
    propiedad.
  - `docs/decisions/D008` — implementación JavaScript vía `npx` como
    `@nucleoabierto/teleprompter`.
  - `docs/decisions/D010` — `.teleprompter/` como ubicación gestionada
    de la guía de personalización.
  - `docs/decisions/D011` — `guide` como subcomando de consulta sobre
    el directorio de trabajo.
  - `docs/decisions/D012` — `list` como subcomando de consulta del
    registro sobre el directorio de trabajo.
  - `docs/decisions/D013` — `check` como subcomando de verificación
    del estado de los recursos instalados.
  - `docs/decisions/D014` — `origin` en el registro: la procedencia
    reobtenible de cada instalación.
  - `docs/decisions/D015` — vocabulario del plan de actualización y
    política de retirados.
  - `docs/decisions/D016` — `update` como subcomando: resolución del
    origen y acciones `remove`/`keep`.

## Estado de salud

- Última revisión: 2026-10-26 (tarea
  `docs/tasks/048-uniformar-forma-plan.md`)
- Divergencias conocidas: cuando un paquete sobrescribe un recurso
  registrado por otro, la entrada del primero queda intacta aunque su
  contenido ya no coincida —el plan siguiente lo marcará `conflict` en
  el paquete viejo, que es conservador pero puede sorprender.
