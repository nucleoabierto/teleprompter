# Resolución de conflictos

## Propósito

Decidir qué hacer cuando lo que el paquete trae —o lo que una
versión retira— colisiona con lo que el destino ya tiene: una
política declarada, el diff visible antes de decidir y un respaldo
del contenido previo antes del paso destructivo.

## Referencia del modelo

- **Lenguaje ubicuo:**
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
- **Invariantes:**
  - `--force` y `--skip` son mutuamente excluyentes; el error es de
    invocación (código 4). Ancla: `parseArgs` en `src/usage.js`
  - Una respuesta interactiva que no es afirmativa significa `skip`:
    el defecto ante trabajo ajeno es no sobrescribir.
    Ancla: `createAsker` en `src/prompt.js`
  - El anuncio de un conflicto tampoco lee fuera de la raíz —del
    destino ni del paquete—: la ruta registrada y cada hoja pasan la
    defensa de cadena antes de leerse, y la que no la supera degrada
    a `(ruta insegura)` sin exponer contenido. Ancla:
    `recordedChainSafe` en `src/paths.js` aplicado por `diffResource`
    en `src/diff.js`
- **Operaciones:**
  - Aplicar la política a los conflictos de un plan: cada `conflict`
    se anuncia con su diff y recibe su `resolution` —por flag, por
    respuesta interactiva o por aborto— antes de ejecutar nada. Es
    una fase de los flujos de instalación, actualización y retirada
    (dominio 002), no un comando propio.
    - Ancla: `settleConflicts` en `src/commands.js` (la política),
      `resolveConflicts` en `src/plan.js` (la asignación) y
      `createAsker` en `src/prompt.js`

## Explicación del dominio

- **Fronteras:**
  - Dentro: la política de colisiones, el diff que la informa y el
    respaldo que la hace reversible.
  - Fuera: qué recursos llegan a conflicto y cuándo (los planes del
    ciclo de vida, dominio 002) y dónde vive el respaldo dentro del
    territorio gestionado (registro, dominio 003).
  - Relaciones: los flujos del ciclo de vida la aplican como fase
    antes de ejecutar el plan; el respaldo escribe bajo
    `.teleprompter/backups/`, territorio del dominio 003.
- **Decisiones relevantes:**
  - `docs/decisions/D006` — política de colisiones: interactiva,
    aborto sin consola, `--force`/`--skip` excluyentes.

## Estado de salud

- Última revisión: 2026-10-29 (tarea
  `docs/tasks/059-adoptar-util-parseargs-nivel-token.md`)
- Divergencias conocidas: Ninguna
