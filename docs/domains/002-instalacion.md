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
  - **Unidad de colección:** cada paquete que una selección nombra
    dentro de una colección; se instala como instalación plena e
    independiente —plan, colisiones, guía y registro propios—, en
    ejecución secuencial y atómica por unidad. La actualización
    re-resuelve el miembro por su nombre en el índice del árbol
    recién obtenido.
    - Ancla: `selectUnits`, `resolveMembers` e `installUnit` en
      `src/commands.js`, `resolveSelection` en `src/collection.js`;
      D019
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
- **Invariantes:**
  - El plan completo se calcula antes de escribir; un plan no
    ejecutable aborta sin escribir nada —ni recursos ni registro
    (D005). Ancla: `runInstall`/`runUpdate` y las fases
    `settleConflicts`/`checkGuideDestination` en `src/commands.js`
  - «Existe» significa «hay una entrada en el directorio», sin seguir
    enlaces: un enlace colgado ocupa su ruta.
    Ancla: `hasEntry` en `src/paths.js`
  - `managed-update` exige hash registrado coincidente **y** versión
    del paquete ≥ versión registrada; un downgrade es `conflict`.
    Ancla: `semverAtLeast` en `src/plan.js`
  - Ninguna escritura puede salir de la raíz por un enlace en la
    cadena de padres: el ancestro existente más profundo debe
    resolver a un directorio dentro del destino, en el plan y en la
    ejecución. Ancla: `resolvesUnder` en `src/paths.js`
  - Dos entradas `install` no pueden compartir `target`: el plan sería
    ambiguo. Ancla: `checkInstall` en `src/manifest.js`
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
  - Materializar y entregar la guía: `installPersonalization` copia
    el archivo declarado a `.teleprompter/<paquete>/<archivo>` tras
    ejecutar el plan, y el bloque final `personalización (<ruta>):`
    entrega el contenido de la copia materializada —no el fuente,
    que en origen remoto ya no existe—.
    - Ancla: `installPersonalization` en `src/execute.js` y
      `printGuide` en `src/report.js`
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
  - Códigos de salida: 0 éxito, 1 manifiesto inválido, 2 plan no
    ejecutable, 3 error de ejecución, 4 invocación, 5 obtención del
    repositorio remoto.
    - Ancla: `EXIT_*` en `src/exits.js`; contrato en
      `docs/instalador.md` «Resultado y errores»

## Explicación del dominio

- **Fronteras:**
  - Dentro: la obtención, verificación, plan y ejecución de una
    instalación, y los flujos de actualización y retirada.
  - Fuera: la forma del manifiesto (dominio del paquete), la memoria
    del registro y sus consultas (dominio 003), la política que
    resuelve las colisiones (dominio 004), el contenido de la
    personalización y la distribución del CLI.
  - Relaciones: consume el dominio del paquete a través del resultado
    estructurado de `verifyPackage`; aplica la política de conflictos
    del dominio 004 como fase del flujo y escribe en el registro del
    dominio 003 al terminar; la invocación (`bin/`) es una capa
    delgada sin dominio.
- **Decisiones relevantes:**
  - `docs/decisions/D005` — plan completo antes de escribir, aborto
    total.
  - `docs/decisions/D008` — implementación JavaScript vía `npx` como
    `@nucleoabierto/teleprompter`.
  - `docs/decisions/D015` — vocabulario del plan de actualización y
    política de retirados.
  - `docs/decisions/D016` — `update` como subcomando: resolución del
    origen y acciones `remove`/`keep`.

## Estado de salud

- Última revisión: 2026-10-29 (tarea
  `docs/tasks/055-compartir-clasificacion-entrantes-plan.md`)
- Divergencias conocidas: Ninguna —la divergencia de registro
  coexistiendo con contenido sobrescrito por otro paquete vive en el
  dominio 003—.
