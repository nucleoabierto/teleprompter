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
      operación del plan), `settleConflicts` en `src/cli.js` (la
      política) y `createAsker` en `src/prompt.js`
  - **Registro (lock):** `teleprompter-lock.json` en la raíz del
    destino; por paquete guarda `version`, `installedAt` y `files`
    con `target`, acción y `sha256` —las entradas `skip` no llevan
    hash— y `personalization` con la ruta gestionada de la guía
    cuando el manifiesto la declara; `origin` registra de dónde vino
    la instalación —`{type:'github',repo,ref?}` o
    `{type:'path',path}` absoluta—, opcional en entradas escritas
    antes del campo. Es la memoria que distingue lo propio de lo
    ajeno.
    - Ancla: `readLock`, `isValidLock`, `writeLock`, `lockEntry` y
      `lockEntries` en `src/lock.js` —la forma del registro solo se
      navega desde ese módulo— y `originOf` en `src/cli.js`;
      D007, D014
  - **Propiedad:** un recurso es propio cuando el destino actual
    hashea igual que lo que el registro anotó para él.
    - Ancla: `recorded.get(target) === destHash` en `src/plan.js`
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
    Versión igual a la registrada → `upToDate`, sin plan.
    - Ancla: `buildUpdatePlan` en `src/plan.js`; contrato en
      `docs/instalador.md` «El plan de actualización»; D015
- **Entidades / estado:**
  - `VerificationResult` — `kind: 'ok'|'manifest'|'requires'`, el
    manifiesto validado, `warnings`, `errors`, `creates` y `failures`.
    - Ancla: `verifyPackage` en `src/verify.js`
  - `Plan` — `{ mkdirs, resources, conflicts }`; cada recurso lleva
    `source`, `target`, `status` y, tras resolver, `resolution`.
    - Ancla: `buildPlan` y `resolveConflicts` en `src/plan.js`
  - `UpdatePlan` — `{ upToDate, mkdirs, resources, conflicts,
    retired }`; `resources` incluye las entradas del manifiesto y
    los retirados con deriva marcados `removal`, `retired` solo las
    marcas `retire`.
    - Ancla: `buildUpdatePlan` en `src/plan.js`
  - Hash de recurso — SHA-256 sobre dominios separados (`file\n`,
    `link\n`, `dir\n`) para que tipos distintos nunca colisionen;
    los árboles ordenan sus entradas para que el digest sea
    independiente del orden de lectura.
    - Ancla: `hashPath` en `src/hash.js`
- **Invariantes:**
  - El plan completo se calcula antes de escribir; un plan no
    ejecutable aborta sin escribir nada —ni recursos ni registro
    (D005). Ancla: `runInstall`/`runUpdate` y las fases
    `settleConflicts`/`checkGuideDestination` en `src/cli.js`
  - «Existe» significa «hay una entrada en el directorio», sin seguir
    enlaces: un enlace colgado ocupa su ruta.
    Ancla: `hasEntry` en `src/paths.js`
  - `--force` y `--skip` son mutuamente excluyentes; el error es de
    invocación (código 4). Ancla: `parseArgs` en `src/cli.js`
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
  - Dos entradas `install` no pueden compartir `target`: el plan sería
    ambiguo. Ancla: `checkInstall` en `src/manifest.js`
  - `.teleprompter/` es propiedad de la herramienta, igual que el lock:
    la guía declarada se copia ahí fuera del plan y sin detección de
    colisiones, pero su destino se verifica escribible **antes** de
    escribir nada —un escape hace el plan no ejecutable (D005)—.
    Ancla: `installPersonalization` en `src/execute.js` y la
    pre-verificación en `src/cli.js`; D010
  - Un recurso `identical` conserva su registro previo —el contenido
    sigue siendo propio— pero no crea registro si nunca se escribió.
    Ancla: `writeLock` en `src/lock.js`
  - Un recurso retirado por la versión solo se elimina intacto —propio
    y sin tocar—; modificado o no verificable exige decisión. Quedan
    excluidos las entradas `skip` y el target de `personalization`
    que el manifiesto **entrante** siga declarando: si la versión
    renombra la guía o abandona el campo, la guía registrada se retira
    como cualquier otro recurso (D015). Ancla: `buildUpdatePlan` en
    `src/plan.js`
- **Operaciones:**
  - `teleprompter [install] <user/repo[@ref]> [destino]` o
    `teleprompter [install] --path <paquete> [destino]` — obtiene el
    paquete (tarball público de GitHub o directorio local), verifica,
    planea, resuelve, ejecuta y registra; el destino por defecto es el
    directorio de trabajo.
    - Ancla: `bin/teleprompter.js` → `main` en `src/cli.js`
  - Ejecutar el plan resuelto: `mkdirs` primero, luego cada recurso
    según su acción; `overwrite` elimina el destino antes de escribir
    —nunca a través de un enlace— y los enlaces se copian como
    enlaces. Un fallo a mitad lanza `ExecutionError`, que transporta
    las acciones ya aplicadas y el error original como `cause`, para
    que el informe muestre el estado parcial.
    - Ancla: `executePlan` y `ExecutionError` en `src/execute.js`
  - Registrar la instalación: fusiona el lock preservando otros
    paquetes; `identical` no se registra y `skip` va sin hash; la
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
      `printGuide` en `src/cli.js`
  - Consultar la guía: `teleprompter guide [<paquete>]` lee el campo
    `personalization` del registro del directorio de trabajo y
    muestra el mismo bloque; no hay destino ni opciones de
    instalación. Sin guía que mostrar es código 4; la ruta
    registrada insegura o el archivo ausente es código 3 —el lock
    es dato versionado y se revalida antes de leer.
    - Ancla: `showGuide` en `src/cli.js`, que aplica el nivel hoja de
      la defensa de rutas registradas (`resolveRecordedPath` en
      `src/paths.js`); D011
  - Consultar el registro: `teleprompter list` lee el registro del
    directorio de trabajo —sin argumentos ni opciones— y muestra una
    entrada por paquete con `nombre@version`, `installedAt` y los
    `target` escritos; las entradas `skip` no se listan —registran
    una omisión— y no se exponen hashes ni acciones. Sin
    instalaciones responde «no hay paquetes instalados» con código
    0: es una respuesta, no un fallo.
    - Ancla: `showList` en `src/cli.js`; D012
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
    - Ancla: `runUpdate` en `src/cli.js`; D016
  - Verificar el estado de lo instalado: `teleprompter check`
    confronta el registro del directorio de trabajo con el disco
    —sin argumentos ni opciones— y muestra por paquete una marca de
    deriva por recurso registrado; las entradas `skip` no se
    verifican y encontrar deriva no es un fallo —la consulta siempre
    termina con código 0—.
    - Ancla: `showCheck` en `src/cli.js` y `classifyResource` en
      `src/drift.js`; D013
  - Códigos de salida: 0 éxito, 1 manifiesto inválido, 2 plan no
    ejecutable, 3 error de ejecución, 4 invocación, 5 obtención del
    repositorio remoto.
    - Ancla: `EXIT_*` en `src/cli.js`; contrato en
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

- Última revisión: 2026-10-01 (revisión de arquitectura
  `docs/architecture-reviews/002-instalacion-tras-el-ciclo-de-vida.md`)
- Divergencias conocidas: cuando un paquete sobrescribe un recurso
  registrado por otro, la entrada del primero queda intacta aunque su
  contenido ya no coincida —el plan siguiente lo marcará `conflict` en
  el paquete viejo, que es conservador pero puede sorprender.
