# Revisión de arquitectura general

- **Fecha:** 2026-10-26
- **Dominio evaluado:** `src/` completo (14 módulos) —estructura,
  abstracciones y fronteras tras el ciclo de vida completo
  (install, update, uninstall, colecciones)—.
- **Intención declarada:** `docs/domains/001-paquete.md` y
  `docs/domains/002-instalacion.md`; `src/cli.js` se declara a sí
  misma «capa de invocación» que se mantiene delgada.
- **Decisiones respetadas:** D005 (aborto total antes de
  escribir), D006 (política de conflictos), D007 (registro),
  D014/D019 (origen y colecciones), D022/D027 (roadmap).
- **Alcance:** la revisión idiomática (003) cubre los smells de
  implementación; esta evalúa los arquitectónicos con la rúbrica.

## Veredicto por criterio

| Criterio | Veredicto | Evidencia | Confianza |
|----------|-----------|-----------|-----------|
| Lenguaje ubicuo | Correcto | los nombres del código coinciden con el glosario (plan, marcas, registro, respaldo, unidad) | alta |
| Separación de capas | Mejorable | la capa de invocación concentra gramática, ayuda, presentación, orquestación y reglas de dominio (H1) | alta |
| Fronteras del contexto | Correcto | ningún módulo de dominio importa la capa de invocación; sin fuga de modelo | alta |
| Invariantes y modelo | Correcto | cada invariante tiene un defensor claro (`paths.js` para rutas, `lock.js` para la forma del registro, `manifest.js` para el contrato) | alta |
| Acoplamiento y estructura | Mejorable | grafo sin ciclos pero con un hub de ~900 líneas (H1); forma del plan heterogénea entre constructores (H2); idiomas de resultado mezclados (H3) | alta |

## Hallazgos

### H1 — `src/cli.js` concentra cinco preocupaciones

- **Criterio o patrón:** concentración de características /
  componente dios — un solo módulo realiza gramática (`parseArgs`,
  `splitArgs`), contenido de ayuda (`USAGE`, `HELP`), presentación
  (`printPlan`, `printGuide`, `showList`, `showCheck`,
  `reportBackup`, `DRIFT_MARKS`), orquestación de comandos
  (`runInstall`, `runUpdate`, `runUninstall`, `installUnit`,
  `obtainPackage`, `settleConflicts`) y reglas del dominio
  (`checkGuideDestination`, `checkBackupDestination`, `backupName`
  —deciden si un plan es ejecutable y cómo se nombra un respaldo—).
- **Evidencia:** `src/cli.js` con 904 líneas —~3× el siguiente
  módulo (`diff.js`, 309)— y su propio comentario declara
  «mantenerla delgada es lo que permite ejercitar el CLI sin
  procesos»: la intención declarada ya no describe el tamaño real.
- **Objetivo:** separar al menos la gramática y la ayuda —un
  módulo de invocación sin dependencias del dominio— de la
  orquestación; las reglas de «plan ejecutable» y la nomenclatura
  del respaldo evaluarlas como candidatas a vivir junto al dominio
  que definen.
- **Restricciones:** la suite ejerce `main` inyectando `io`; la
  frontera nueva debe conservar esa inyección y los mensajes
  observables. Sin cambios de comportamiento.
- **Validación:** `cli.js` vuelve a ser delgada —parsing,
  despacho y mapeo a códigos—; cada preocupación en su módulo;
  suite en verde.
- **Confianza:** alta —el tamaño es mecánico; la frontera exacta
  de la división exige criterio en la implementación—.
- **Derivado en:** docs/tasks/047-separar-gramatica-y-ayuda-cli.md

### H2 — La forma del plan difiere entre sus tres constructores

- **Criterio o patrón:** interfaz ambigua — `buildPlan` devuelve
  `{mkdirs, resources, conflicts}`; `buildUpdatePlan` añade
  `retired` y `upToDate`; `buildUninstallPlan` devuelve
  `{mkdirs, resources, conflicts, retired}` sin `upToDate`. Los
  consumidores lo normalizan con `?? []` (`printPlan`,
  `executePlan`), así que la heterogeneidad sobrevive sin nombre.
- **Evidencia:** `src/plan.js:42-46, 194-201, 246-251`;
  `src/cli.js:258` y `src/execute.js:80` consumen
  `plan.retired ?? []`.
- **Objetivo:** una forma de plan explícita y uniforme —los tres
  constructores devuelven los mismos campos, con `upToDate` solo
  donde el concepto existe o siempre presente— documentada como
  la entidad que el dominio ya declara.
- **Restricciones:** el documento de dominio ya modela el plan;
  alinear la forma, no el vocabulario.
- **Validación:** ningún consumidor necesita `??` para campos
  estructurales del plan; suite en verde.
- **Confianza:** alta.
- **Derivado en:** docs/tasks/048-uniformar-forma-plan.md

### H3 — Cuatro idiomas de resultado y fallo coexisten

- **Criterio o patrón:** estructura — las operaciones responden
  con idiomas distintos: `{ ok, dir, cleanup, commit }` /
  `{ ok: false, error }` (fetch), `{ units }` / `{ code }`
  (selectUnits), `{ kind, warnings, errors, manifest, … }`
  (verify), `{ ok, reason }` (resolveRecordedPath), códigos de
  salida crudos (comandos) y `ExecutionError` con `applied`
  (execute). Cada idioma encaja su capa, pero la orquestación
  jonglea los cuatro y un quinto consumidor no tiene forma
  declarada que imitar.
- **Evidencia:** `src/fetch.js:104`, `src/cli.js:782-817`,
  `src/verify.js:7-17`, `src/paths.js:87-100`,
  `src/execute.js:10-16`.
- **Objetivo:** un patrón de resultado declarado —probablemente
  un documento de decisión— que diga cuándo usar cada forma, o la
  unificación gradual hacia uno o dos idiomas.
- **Restricciones:** es una decisión de criterio, no solo mecánica:
  materializarla como decisión o tarea con su propuesta; sin
  cambios de comportamiento en la unificación.
- **Validación:** la próxima operación nueva no inventa un sexto
  idioma; la forma elegida queda registrada.
- **Confianza:** media —la conveniencia de unificar vs. declarar
  es juicio de dirección—.
- **Derivado en:** docs/decisions/D021-idiomas-de-resultado-por-capa.md

### H4 — La resolución de miembro de colección se implementa dos veces

- **Criterio o patrón:** funcionalidad dispersa — `selectUnits`
  (install) y el prólogo de `runUpdate` repiten la misma
  secuencia: `isCollectionDir` → `loadCollectionManifest` →
  avisos → errores → `resolveSelection` → informe de disponibles.
- **Evidencia:** `src/cli.js:638-657` frente a
  `src/cli.js:790-816`.
- **Objetivo:** una operación compartida «resolver miembro por
  nombre en colección» que ambos comandos consuman; las
  diferencias (selección múltiple vs. una, informe del índice)
  quedan parametrizadas o en el llamador.
- **Restricciones:** mismos mensajes y códigos de salida.
- **Validación:** una sola implementación de la secuencia; suite
  en verde.
- **Confianza:** alta.
- **Derivado en:** docs/tasks/049-extraer-resolucion-miembro-coleccion.md

### H5 — `executePlan` exige un lado «paquete» que el plan de retirada no tiene

- **Criterio o patrón:** frontera difusa — la firma
  `executePlan(pkgDir, destDir, plan, backupRoot)` presupone un
  árbol de paquete; `uninstall` le pasa `destDir` como sustituto
  con un comentario que admite el truco —la costura se resolvió
  con una convención en lugar de con la forma de la función—.
- **Evidencia:** `src/cli.js:730-732` y `src/execute.js:69`.
- **Objetivo:** la ejecución declara explícitamente si el plan
  tiene lado paquete —`pkgDir` opcional, un parámetro de forma
  `{src, dest}` o una vía propia para planes de retirada—, de modo
  que un plan que copia sin fuente sea imposible por forma, no por
  convención.
- **Restricciones:** los planes de retirada nunca llevan `source`
  en entradas `removal`; la defensa de escritura no se toca.
- **Validación:** `runUninstall` no pasa `destDir` dos veces;
  suite en verde.
- **Confianza:** media —la forma concreta (opcional vs. vías
  separadas) exige criterio—.
- **Derivado en:** docs/tasks/050-declarar-forma-ejecucion-sin-paquete.md

## Observaciones

- El grafo de dependencias es un DAG limpio: `cli →
  {verify,lock,plan,execute,diff,paths,fetch,drift,manifest,
  collection}`; dominio nunca importa la capa de invocación. La
  concentración de H1 es de tamaño, no de dirección.
- Los datos viajan como estructuras planas con funciones por
  concepto —coherente con el estilo del proyecto; no es modelo
  anémico en el sentido que penaliza la rúbrica—.
- `installUnit` relee el lock por unidad a propósito (comentario
  en `src/cli.js:819-822`): el diseño es correcto, no un olvido.
- `EMPTY()` en `lock.js` y el vocabulario `retired`/`retire` ya
  constan en la revisión 003 como observaciones menores.
