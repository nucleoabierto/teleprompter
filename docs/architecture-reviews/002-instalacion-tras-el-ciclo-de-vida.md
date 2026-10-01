# Revisión de arquitectura 002: instalación tras el ciclo de vida

- **Fecha:** 2026-10-01
- **Dominio evaluado:** instalación —`src/` completo (`cli`, `plan`,
  `execute`, `lock`, `drift`, `hash`, `paths`, `fetch`, `verify`,
  `manifest`, `requires`, `prompt`) más `bin/teleprompter.js`—, con
  la frontera hacia el dominio paquete (`001-paquete.md`) incluida
  en la evaluación. La revisión 001 evaluó el contrato antes del
  código; esta evalúa la base real tras cerrar las épicas 001–004.
- **Intención declarada:** `docs/domains/002-instalacion.md`
  (glosario, invariantes, fronteras) y `docs/instalador.md`
  (contrato de comportamiento).
- **Decisiones respetadas:** D005–D007 (plan completo, colisiones,
  registro), D010 (namespace `.teleprompter/`), D011–D016
  (subcomandos y ciclo de vida).

## Veredictos por criterio

### Lenguaje ubicuo — correcto (confianza alta)

Los nombres del código coinciden con el glosario: `buildPlan`/
`buildUpdatePlan` (plan/plan de actualización), `classifyResource`
(deriva), `readLock`/`writeLock` (registro), `conflict`/`resolution`,
`retire`/`removal`, `origin`. Los dos vocabularios de marcas
(`managed-update` en instalación, `update` en actualización) son la
decisión documentada de D015, no sinónimos accidentales. La única
excepción es una invariante del documento ya falsa —H3—.

### Separación de capas — mejorable (confianza media)

La dirección es la correcta en todo el grafo: `cli` (orquestación y
presentación) → dominio (`plan`, `execute`, `lock`, `drift`) →
utilidades (`hash`, `paths`); `verify` → `manifest`/`requires` para
el dominio paquete; `fetch` queda aislado como infraestructura
inyectable. Pero `cli.js` mezcla dos estilos: las consultas
(`showGuide`/`showList`/`showCheck`) son finas, mientras `runUpdate`
duplica el pipeline completo de `main` —obtención, verificación,
resolución de colisiones, guarda de guía, `--dry-run`, ejecución y
registro— con deltas deliberados —H1—, y `showGuide` reimplementa la
defensa «la ruta registrada es segura» con otra mecánica —H2—.

### Fronteras del contexto — correcto (confianza alta)

El dominio paquete se consume exclusivamente por el resultado
estructurado de `verifyPackage`; la instalación no revalida el
manifiesto. `fetch` no filtra conceptos de dominio (devuelve
`{ok, dir, cleanup}`). `.teleprompter/` se respeta como namespace
gestionado en el manifiesto, el plan y la ejecución. Sin fuga de
modelo ni shared kernels accidentales.

### Invariantes y modelo — correcto (confianza alta)

Cada invariante documentada tiene un único defensor localizado:
D005 en la frontera plan/ejecución de `cli.js`, `--force`/`--skip`
excluyentes en `splitArgs`, semver en `semverAtLeast`, «existe sin
seguir enlaces» en `hasEntry`, escritura contenida en
`resolvesUnder` (aplicada en plan, ejecución y guarda de guía),
targets duplicados en `checkInstall`, lock degradado en
`readLock`/`isValidLock`, conservación de `identical` en `writeLock`
y retirada solo-intacta en `buildUpdatePlan`. Dos grietas semánticas
—no violaciones de lo declarado— en H4 y H5.

### Acoplamiento y estructura — correcto (confianza alta)

Grafo acíclico verificado mecánicamente: ningún componente fuerte
conexo. `cli.js` concentra 557 de 1438 líneas (39 %) pero es el hub
convencional de la capa de aplicación para cinco comandos —la
duplicación interna es el problema real, no el tamaño—. Sin
dependencias inestables ni funcionalidad dispersa más allá de H1/H2.

## Hallazgos

### H1 — El pipeline instalar/actualizar está implementado dos veces

- **Criterio o patrón:** funcionalidad dispersa —la misma
  preocupación arquitectónica (obtener → verificar → planear →
  resolver → ejecutar → registrar) vive en dos componentes del mismo
  archivo—; consecuencia: la política de colisiones de D006 tiene dos
  implementaciones.
- **Evidencia:** `src/cli.js:285-403` (`runUpdate`) replica
  `src/cli.js:453-556` (`main`): el bloque de fetch con `cleanup`,
  el mapeo de `result.kind`, el bucle de resolución de conflicts
  (`--force` → `--skip` → interactivo → aborto), la guarda de la guía
  con `resolvesUnder`, `--dry-run` y el bloque
  ejecutar+`installPersonalization`+`writeLock`+informe. Ya divergen
  de forma deliberada (la pregunta «¿quitar?» de `removal`, la marca
  `update`); una cuarta variante —o un flag nuevo— se editaría dos
  veces.
- **Objetivo:** una sola implementación del bucle de resolución y de
  las fases compartidas, parametrizada por lo que difiere (pregunta
  por conflicto, función de plan, resolución del origen).
- **Restricciones:** conservar códigos de salida y redacción de
  mensajes —la suite los afirma literalmente—; la resolución de
  `removal` sigue preguntando «quitar».
- **Validación:** `npm test` verde sin tocar aserciones; una sola
  función implementa la resolución de conflicts.
- **Confianza:** alta.
- **Derivado en:** docs/tasks/021-extraer-pipeline-compartido.md

### H2 — Dos mecánicas distintas para «la ruta registrada es segura»

- **Criterio o patrón:** funcionalidad dispersa —la defensa «el lock
  es dato no confiable» se aplica con dos mecanismos—.
- **Evidencia:** `src/drift.js:15-19` usa `isSafeRelative` +
  `resolvesUnder` sobre la cadena de padres (la hoja es segura porque
  `hashPath` hace `lstat`); `src/cli.js:149-168` (`showGuide`) usa
  `isSafeRelative` + `realpathSync` del archivo completo —cubre además
  que la hoja misma sea un enlace saliente—. Ambas son correctas hoy
  para amenazas distintas, pero un tercer consumidor de rutas
  registradas tendría que adivinar cuál aplica.
- **Objetivo:** una sola operación «la ruta registrada es segura para
  leer» que capture los dos niveles —cadena de padres y hoja—, o un
  comentario/contrato que declare por qué difieren.
- **Restricciones:** `guide` debe seguir validando la hoja (lee
  contenido del archivo); la deriva solo necesita padres.
- **Validación:** los dos consumidores comparten la defensa o la
  diferencia queda declarada; las pruebas de escape existentes siguen
  verdes.
- **Confianza:** media.
- **Derivado en:** docs/tasks/024-unificar-defensa-de-rutas-registradas.md

### H3 — El documento de dominio declara una invariante ya falsa

- **Criterio o patrón:** intención declarada divergente —el modelo
  documentado ya no describe el código—.
- **Evidencia:** `docs/domains/002-instalacion.md` (invariante de
  retirados) afirma que «el `target` de `personalization` … nunca se
  retiran»; desde la corrección de la guía renombrada,
  `src/plan.js:103-109` excluye solo el target *entrante* —la guía
  registrada se retira cuando la versión la renombra o abandona el
  campo (prueba «retires the old guide when the version renames it»)—.
  El campo «Última revisión» también quedó en 2026-09-30.
- **Objetivo:** la invariante describe la regla real —la guía solo se
  excluye mientras el manifiesto entrante la siga declarando—.
- **Restricciones:** coherencia con D015 y con `docs/instalador.md`,
  que ya refleja el comportamiento.
- **Validación:** la frase del documento coincide con
  `buildUpdatePlan` y con las dos pruebas de guía retirada.
- **Confianza:** alta.
- **Derivado en:** docs/domains/002-instalacion.md (corrección aplicada)

### H4 — `upToDate` compara solo la versión, nunca el contenido

- **Criterio o patrón:** modelo —la memoria del registro presupone
  semver inmutable; un mismo número con contenido distinto es
  invisible—.
- **Evidencia:** `src/plan.js:71-75`: `record.version ===
  manifest.version` devuelve `upToDate` sin comparar recursos. Un
  paquete local editado sin bump, o una release retagueada, hacen que
  `update` responda «ya está en esa versión» aunque el contenido
  entrante difiera —la deriva del *paquete* no tiene detector—.
  Simétrico: un downgrade con contenido idéntico reescribe el
  registro a la versión menor sin ningún conflicto.
- **Objetivo:** decidir el criterio —misma versión y contenido
  distinto podría informarse («misma versión, contenido distinto») u
  ofrecerse como plan normal—; si semver inmutable es axioma del
  producto, declararlo.
- **Restricciones:** D015 define `upToDate` por versión; cambiarlo es
  decisión de producto, no corrección.
- **Validación:** el comportamiento ante «misma versión, otro
  contenido» está declarado en el contrato y probado.
- **Confianza:** media.
- **Derivado en:** docs/decisions/D017-semver-inmutable-como-axioma.md

### H5 — La escritura del registro no es atómica

- **Criterio o patrón:** robustez de la memoria del dominio —el lock
  es la pieza de la que dependen `check`, `update` y la propiedad—.
- **Evidencia:** `src/lock.js:103-106` escribe
  `teleprompter-lock.json` con `writeFileSync` directo; un corte a
  mitad de escritura deja un JSON truncado que `readLock` degrada a
  «sin historia» —todas las propiedades registradas se pierden de una
  vez y la siguiente operación trata todo como ajeno—.
- **Objetivo:** escritura atómica (archivo temporal + rename) para
  que un corte deje el lock anterior intacto.
- **Restricciones:** mismo contrato y formato; el rename debe caer en
  el mismo directorio para ser atómico.
- **Validación:** prueba que simule el corte (o revisión manual del
  patrón tmp+rename) y suite verde.
- **Confianza:** media.
- **Derivado en:** docs/tasks/022-escritura-atomica-del-registro.md

### H6 — Una guía conservada queda inalcanzable por `guide`

- **Criterio o patrón:** modelo —caso borde del retiro con decisión—.
- **Evidencia:** si la versión entrante abandona `personalization` y
  la guía retirada tiene deriva, un `keep` conserva el archivo y su
  entrada en `files`, pero `writeLock` ya no escribe el campo
  `personalization` (`src/lock.js:82-90`): `teleprompter guide`
  responderá «no declara instrucciones» aunque la guía siga en disco.
- **Objetivo:** decidir si es el comportamiento correcto —la versión
  nueva ya no la considera guía— o si `keep` debería conservar
  también el campo.
- **Restricciones:** coherencia con la política de retirados de D015.
- **Validación:** comportamiento declarado y probado en uno u otro
  sentido.
- **Confianza:** baja —borde deliberado plausible—.
- **Derivado en:** docs/tasks/025-guia-conservada-tras-retiro.md

## Segunda ronda — idiomatismo JavaScript y paradigma

A petición del usuario se evalúa el mismo dominio con dos criterios
adicionales: si el código es idiomático en JavaScript, y si sigue el
paradigma mixto declarado —flujo de datos funcional con gestión del
dominio orientada a objetos—. Son dimensiones que la rúbrica no
cubría; se proponen como adiciones.

### Idiomatismo JavaScript — correcto (confianza alta)

El código es idiomático en lo esencial: módulos ESM con funciones
puras y exportadas, `Map`/`Set` donde tocan (`recorded`, `shipped`,
`KNOWN_FLAGS`), `flatMap` para las retiradas, template literals,
early returns, validadores como funciones con nombre en
`VALIDATORS`, inyección de `io`/`fetch`/`createAsker` que mantiene
todo comprobable sin frameworks. Dos nits puntuales —H9—, ningún
antipatrón de plataforma (`var`, promesas manuales, callbacks).

### Flujo de datos funcional — correcto (confianza alta)

El pipeline es ya una cadena de transformaciones con la I/O en los
bordes: `loadManifest`/`verifyPackage`/`buildPlan`/`buildUpdatePlan`
devuelven valores estructurados sin efectos visibles más allá de la
lectura de disco, y `executePlan`/`writeLock` concentran la
escritura. El único quiebre funcional es la mutación del plan desde
la capa de aplicación —H7—, que es también la grieta del paradigma.

### Gestión del dominio (OOP) — mejorable (confianza media)

El modelo es completamente procedural: `Plan`, `UpdatePlan`,
`VerificationResult` y el registro son datos planos sin
comportamiento, manipulados desde fuera —el smell «modelo anémico»
de la rúbrica—. Para el paradigma OOP-de-dominio que se pide, las
entidades candidatas son el plan (qué resoluciones admite, cuándo es
ejecutable) y el registro (qué contiene una entrada, cómo se fusiona)
—H7—. La confianza es media porque «procedural y explícito» es una
elección legítima en un CLI pequeño: la derivación depende de cuánta
encapsulación quiera el producto.

## Hallazgos de la segunda ronda

### H7 — La capa de aplicación muta y navega las entidades del dominio

- **Criterio o patrón:** modelo de dominio anémico + feature envy —
  `cli.js` conoce la estructura interna del plan y del registro y la
  modifica directamente—.
- **Evidencia:** `src/cli.js:333-344` y `487-495` asignan
  `r.resolution` sobre las entradas del plan —la regla «una resolución
  es `overwrite` o `skip`» no tiene dueño—; `src/cli.js:248-255`,
  `129-135`, `184-198` y `222-233` navegan `lock.packages[…]` y sus
  campos (`origin`, `personalization`, `files`) directamente, igual
  que `src/plan.js:15,70`. Cambiar la forma del registro o del plan
  tocaría tres módulos.
- **Objetivo:** entidades con comportamiento —p. ej. un `Registro`
  que responde `entrada(nombre)`/`origen(nombre)` y un `Plan` que
  sabe `resolver(conflicto, decisión)` y si está `resuelto()`— o, al
  menos, funciones de dominio que concentren la mutación y la
  navegación (`resolveConflicts(plan, decision)`,
  `lockEntry(lock, name)`).
- **Restricciones:** mantener la testabilidad por inyección de `io`;
  sin frameworks ni herencia; la encapsulación no debe dificultar la
  lectura —un `class` solo donde haya invariante que proteger—.
- **Validación:** ninguna línea fuera del módulo de dominio toca
  `resolution` ni `lock.packages` directamente; suite verde.
- **Confianza:** media.
- **Derivado en:** docs/tasks/021-extraer-pipeline-compartido.md

### H8 — Estado transportado mutando el error capturado

- **Criterio o patrón:** idiomatismo —anexar propiedades a un `Error`
  capturado para comunicar estado hacia arriba—.
- **Evidencia:** `src/execute.js:84` hace `error.applied = applied`
  sobre cualquier error que el try atrape —incluidos errores de
  `fs`—, y `src/cli.js:388,541` lo lee con `error.applied ?? actions`.
- **Objetivo:** un tipo propio —`class ExecutionError extends Error
  { constructor(applied, cause) }`— o un valor de resultado
  `{ applied, error }` que declare el contrato.
- **Restricciones:** conservar el informe de acciones aplicadas que
  las pruebas afirman.
- **Validación:** el contrato del error es explícito en el tipo y la
  suite sigue verde.
- **Confianza:** media.
- **Derivado en:** docs/tasks/023-higiene-idiomatica.md

### H9 — Nits idiomáticos

- **Criterio o patrón:** idiomatismo puntual.
- **Evidencia:** `src/cli.js:406` —`isDir` combina `existsSync` +
  `statSync` (doble syscall y ventana TOCTOU; el patrón idiomático es
  `try { return fs.statSync(p).isDirectory() } catch { return false
  }`)—; `src/manifest.js:132` —`seen.has([...seen].find((o) =>
  t.startsWith(`${o}/`)))` es un `.some()` escrito de forma
  indirecta—.
- **Objetivo:** ambas expresiones en su forma idiomática.
- **Restricciones:** mismo comportamiento observable.
- **Validación:** suite verde sin tocar aserciones.
- **Confianza:** alta.
- **Derivado en:** docs/tasks/023-higiene-idiomatica.md

## Recomendaciones

1. Derivar H3 como corrección documental inmediata —barata y deja el
   modelo fiel al código—.
2. Derivar H1 como tarea de refactor del pipeline compartido: es la
   fuente principal de riesgo de divergencia futura y será el punto
   de apoyo de cualquier comando nuevo (colecciones en el roadmap).
   H7 comparte el mismo punto de apoyo —un `resolveConflicts` de
   dominio es el primer paso de ambos—.
3. Tratar H4 como decisión (¿semver inmutable es axioma?) antes de
   tocar código; H5 como tarea pequeña de endurecimiento, afín a la
   línea «endurecimiento de la obtención remota» del roadmap.
4. H8 y H9 caben en una tarea única de higiene idiomática; H2 y H6
   pueden entrar en la misma revisión de criterio o como tareas
   menores según el apetito.
