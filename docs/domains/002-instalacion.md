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
    - Ancla: `src/cli.js` (bucle de resolución) y `createAsker` en
      `src/prompt.js`
  - **Registro (lock):** `teleprompter-lock.json` en la raíz del
    destino; por paquete guarda `version`, `installedAt` y `files`
    con `target`, acción y `sha256` —las entradas `skip` no llevan
    hash. Es la memoria que distingue lo propio de lo ajeno.
    - Ancla: `readLock` y `isValidLock` en `src/lock.js`; D007
  - **Propiedad:** un recurso es propio cuando el destino actual
    hashea igual que lo que el registro anotó para él.
    - Ancla: `recorded.get(target) === destHash` en `src/plan.js`
- **Entidades / estado:**
  - `VerificationResult` — `kind: 'ok'|'manifest'|'requires'`, el
    manifiesto validado, `warnings`, `errors`, `creates` y `failures`.
    - Ancla: `verifyPackage` en `src/verify.js`
  - `Plan` — `{ mkdirs, resources, conflicts }`; cada recurso lleva
    `source`, `target`, `status` y, tras resolver, `resolution`.
    - Ancla: `buildPlan` en `src/plan.js`
  - Hash de recurso — SHA-256 sobre dominios separados (`file\n`,
    `link\n`, `dir\n`) para que tipos distintos nunca colisionen;
    los árboles ordenan sus entradas para que el digest sea
    independiente del orden de lectura.
    - Ancla: `hashPath` en `src/hash.js`
- **Invariantes:**
  - El plan completo se calcula antes de escribir; un plan no
    ejecutable aborta sin escribir nada —ni recursos ni registro
    (D005). Ancla: `main` en `src/cli.js`
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
  - Un recurso `identical` conserva su registro previo —el contenido
    sigue siendo propio— pero no crea registro si nunca se escribió.
    Ancla: `writeLock` en `src/lock.js`
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
    enlaces.
    - Ancla: `executePlan` en `src/execute.js`
  - Registrar la instalación: fusiona el lock preservando otros
    paquetes; `identical` no se registra y `skip` va sin hash.
    - Ancla: `writeLock` en `src/lock.js`
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

## Estado de salud

- Última revisión: 2026-09-28
- Divergencias conocidas: cuando un paquete sobrescribe un recurso
  registrado por otro, la entrada del primero queda intacta aunque su
  contenido ya no coincida —el plan siguiente lo marcará `conflict` en
  el paquete viejo, que es conservador pero puede sorprender.
