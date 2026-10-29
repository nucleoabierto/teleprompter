# Revisión de complejidad interna de las operaciones

- **Fecha:** 2026-10-29
- **Dominio evaluado:** `src/` completo (18 módulos, ~2 720
  líneas) —tamaño de operaciones, anidación de condiciones,
  abanico condicional y duplicación intra-módulo—.
- **Intención declarada:** `docs/domains/001-paquete.md`,
  `002-instalacion.md`, `003-registro.md` y
  `004-resolucion-conflictos.md` —módulos funcionales, datos en
  estructuras planas, defensas en el lector—.
- **Decisiones respetadas:** D005 (plan antes de escribir), D006
  (política de conflictos), D021 (un idioma de resultado por capa:
  las extracciones propuestas conservan los objetos discriminados
  y los códigos de salida tal cual).
- **Alcance:** como la revisión 003, esta evalúa lo que la rúbrica
  excluye —smells de implementación— con criterios propios:
  tamaño de operación, profundidad de anidación, abanico
  condicional y duplicación de lógica dentro de un módulo. La
  arquitectura de módulos quedó evaluada en la 004 y no se
  revisita.

## Veredicto por criterio

| Criterio | Veredicto | Evidencia | Confianza |
|----------|-----------|-----------|-----------|
| Tamaño de operaciones | Mejorable | cuatro operaciones superan las 85 líneas mezclando fases (`buildUpdatePlan` 109, `runUpdate` 93, `fetchRepoTree` 89, `parseArgs` 88) | alta |
| Anidación de condiciones | Mejorable | ternarios encadenados de 4-5 niveles en `fetch.js`; predicados apilados en `isValidLock`/`isValidOrigin` | alta |
| Duplicación intra-módulo | Mejorable | el vocabulario de fallo de GitHub ×2, los validadores de la colección ×5, el esqueleto de clasificación de entrantes ×2, `isPlainObject` reimplementado | alta |
| Descomposición algorítmica | Correcto | `diff.js` y `drift.js` descomponen su complejidad real en operaciones nombradas (`diffOps`, `fileLeaf`, `walk`, `uncoveredUnits`) | alta |
| Estilo del proyecto | Correcto | comentarios de porqué homogéneos, verbosidad deliberada, sin fuga de convenciones | alta |

## Hallazgos

### H1 — El vocabulario de fallo de GitHub se reescribe dos veces como ternarios anidados

- **Criterio o patrón:** primitivas compartidas + anidación — el
  mismo concepto («por qué falló GitHub») se evalúa en dos
  ternarios encadenados con reglas solapadas.
- **Evidencia:** `src/fetch.js:78-81` (`resolveCommit`: ternario
  de cuatro niveles status→mensaje) y `src/fetch.js:154-159`
  (`fetchRepoTree`: cinco niveles sobre la agregación de estados
  de dos endpoints). Ambos producen el mismo vocabulario —«no se
  pudo contactar», «repositorio o referencia no encontrados»,
  «acceso denegado o límite de peticiones», «error de servidor»,
  «HTTP n», «respuesta inesperada»—; difieren solo en cómo se
  agregan los estados (uno vs. varios endpoints, 404/422).
- **Objetivo:** un clasificador compartido del fallo de GitHub
  —una función que traduce un status, o el conjunto de statuses
  observados, al mensaje— consumido por ambas operaciones; la
  anidación pasa a tabla o guardas planas.
- **Restricciones:** mensajes idénticos y mismas reglas de
  agregación —«no encontrado» solo cuando lo que responde cada
  endpoint lo permite; la distinción timeout/red se conserva—.
- **Validación:** una sola tabla de vocabulario; la suite sigue
  en verde (los tests de fetch ejercen cada rama).
- **Confianza:** alta.
- **Derivado en:** docs/tasks/053-descomponer-fetchrepo-unificar-fallo-github.md

### H2 — `fetchRepoTree` ejecuta cinco fases en secuencia y repite su punto de limpieza

- **Criterio o patrón:** tamaño/anidación — 89 líneas con
  indentación máxima 6; el recurso temporal se libera en cinco
  puntos de retorno distintos.
- **Evidencia:** `src/fetch.js:105-193` — (1) creación del
  temporal, (2) resolución del commit, (3) descarga con
  *fallback* entre dos endpoints, (4) límites de tamaño y lectura
  del cuerpo, (5) extracción del tarball. `cleanup(); return …`
  aparece cinco veces.
- **Objetivo:** la descarga con *fallback* y la extracción como
  operaciones propias (`downloadArchive`, `extractArchive` o
  equivalentes), y una sola disciplina de limpieza —helper de
  fallo o flag de éxito—; `fetchRepoTree` queda como la
  composición legible de sus fases.
- **Restricciones:** mismos mensajes, mismo orden de intentos,
  misma semántica de limpieza en cada punto de salida.
- **Validación:** cada fase nombrada; un solo sitio decide la
  limpieza; suite en verde.
- **Confianza:** alta.
- **Derivado en:** docs/tasks/053-descomponer-fetchrepo-unificar-fallo-github.md

### H3 — `buildUpdatePlan` concentra dos clasificaciones, y la de entrantes repite el esqueleto de `buildPlan`

- **Criterio o patrón:** tamaño + duplicación estructural — 109
  líneas, la función más grande de `src/`; su mitad de
  clasificación de recursos entrantes es el mismo esqueleto que
  `buildPlan` con otra condición de sobrescritura.
- **Evidencia:** `src/plan.js:90-198` frente a `src/plan.js:18-50`:
  ambos mapean cada entrada `install` como ausente →
  `create`/`conflict` con guarda de ruta, igual → `identical`,
  registrado-intacto y permitido → clase que sobrescribe
  (`update` vs. `managed-update`), si no → `conflict`, con la
  misma rebaja a `conflict` cuando la ruta no resuelve bajo la
  raíz. El resto de `buildUpdatePlan` (líneas 145-190) mezcla el
  cálculo de la guía reemplazada, los filtros de retirada y las
  tres ramas del descenso por unidades.
- **Objetivo:** un esqueleto compartido de «clasificar entrante»
  parametrizado por la regla de la clase de sobrescritura, y las
  retiradas como operación propia (`plannedRemovals` o
  equivalente); `buildUpdatePlan` se lee como sus dos
  clasificaciones.
- **Restricciones:** conservar las marcas `managed-update`/`update`
  distintas y la semántica exacta de `ancestorDrift` y
  `uncoveredUnits`; sin cambios de plan producido.
- **Validación:** cada constructor delega la clasificación
  compartida; planes idénticos en la suite, en verde.
- **Confianza:** media —la forma compartida exige criterio para
  no borrar la diferencia de vocabulario—.
- **Derivado en:** docs/tasks/055-compartir-clasificacion-entrantes-plan.md

### H4 — `executePlan` despacha por acción dentro del mismo bucle

- **Criterio o patrón:** tamaño/anidación — 68 líneas con
  indentación máxima 6; la resolución de la acción y sus cuatro
  ramas viven en un solo bucle.
- **Evidencia:** `src/execute.js:83-134` — la tabla `ACTION` +
  `REMOVAL_RESOLUTION` decide la acción y luego `remove`,
  `create`/`overwrite`, `identical` y el resto se ejecutan en
  ramas que repiten la guarda `resolvesUnder` y el patrón
  entrada + respaldo.
- **Objetivo:** `actionOf(entry)` como operación propia y un
  manejador por acción —o tabla de despacho—; la guarda de
  escritura y el respaldo previo declarados una vez por rama.
- **Restricciones:** el orden de `applied` es observable —la
  entrada `overwrite` se empuja antes de copiar y el respaldo
  parcial se reporta si la retirada falla—; la defensa de
  escritura no se toca.
- **Validación:** `executePlan` se lee como mkdirs + bucle que
  delega por acción; suite en verde.
- **Confianza:** alta.
- **Derivado en:** docs/tasks/054-despachar-executeplan-por-accion.md

### H5 — `loadCollectionManifest` revalida en línea lo que la tabla `VALIDATORS` ya estructura

- **Criterio o patrón:** duplicación — 60 líneas que
  reimplementan a mano la mitad de los validadores del contrato
  de paquete.
- **Evidencia:** `src/manifest.js:254-313` duplica
  `checkFormat` (líneas 95-99 → 272-274), `checkAuthor`
  (159-169 → 293-302), `checkMetadata` (196-198 → 303-305) y el
  par `description`/`license` (200-204 → 306-310); el chequeo de
  `name` diverge deliberadamente (sin comparación de directorio)
  y `packages` tiene validador propio.
- **Objetivo:** validadores de campo reutilizables que ambas
  cargas compongan —una tabla `COLLECTION_VALIDATORS` o
  funciones nombradas compartidas—; el contrato de colección
  declara sus diferencias (collection obligatorio, campos de
  paquete prohibidos, `packages` propio) en lugar de reescribir
  las coincidencias.
- **Restricciones:** mismos mensajes de error y mismos campos
  aceptados/rechazados por contrato.
- **Validación:** cada regla compartida existe una vez; suite en
  verde.
- **Confianza:** alta.
- **Derivado en:** docs/tasks/056-reutilizar-validadores-manifiesto-coleccion.md

### H6 — `isValidLock` e `isValidOrigin` apilan condiciones y reimplementan «objeto plano»

- **Criterio o patrón:** complejidad condicional + primitivas
  compartidas — la forma del contrato se evalúa en predicados
  anidados, y la triple comprobación de objeto se repite cuatro
  veces.
- **Evidencia:** `src/lock.js:50-64` y `71-82`:
  `typeof === 'object' && !== null && !Array.isArray` aparece en
  cuatro sitios; `isPlainObject` ya existe como privada en
  `src/manifest.js:29`. Las condiciones por entrada de paquete y
  por archivo viven anidadas dentro de un único `every`.
- **Objetivo:** `isPlainObject` compartido y predicados por
  forma —`isValidPackageEntry`, `isValidFileEntry`,
  `isValidOrigin` ya lo es—, de modo que la validación se lea
  como el contrato que declara.
- **Restricciones:** el lock acepta y rechaza exactamente lo
  mismo —datos no confiables, ningún cambio de criterio—.
- **Validación:** cada forma tiene su predicado nombrado; suite
  en verde.
- **Confianza:** alta.
- **Derivado en:** docs/tasks/057-nombrar-predicados-forma-lock.md

### H7 — El prólogo de `runUpdate` mezcla la resolución del origen con la orquestación

- **Criterio o patrón:** tamaño — 93 líneas; la traducción
  origen-registrado→source es una pieza autocontenida dentro del
  comando.
- **Evidencia:** `src/commands.js:210-238` — ~25 líneas de ramas
  por `origin.type` (ausente, `path` con guarda de `--ref`,
  `github` con re-parseo y la asignación `spec.ref = parsed.ref
  ?? origin.ref ?? null` que muta el spec), seguidas del pipeline
  compartido con install.
- **Objetivo:** `sourceOf(record, parsed)` —o equivalente— como
  operación propia que devuelve el `source` o el error de uso;
  `runUpdate` queda como prologo-declarativo + pipeline.
- **Restricciones:** mismos mensajes y códigos `EXIT_USAGE`; la
  mutación de `spec.ref` conserva su precedencia.
- **Validación:** la resolución del origen existe una vez con
  nombre; suite en verde.
- **Confianza:** media-alta.
- **Derivado en:** docs/tasks/058-extraer-resolucion-origen-runupdate.md

### H8 — El nivel token del parser se escribe a mano cuando `node:util` lo provee

- **Criterio o patrón:** primitiva de plataforma — `splitArgs`
  reimplementa el escaneo de opciones que la librería estándar
  ya valida.
- **Evidencia:** `src/usage.js:99-124` (`splitArgs`: valores,
  repetidas, desconocidas, acumulación de `--package`) y
  `src/usage.js:143-230` (`parseArgs`: un bloque por comando que
  vuelve a validar aridades y combinaciones). El paquete exige
  `node >=22` y su única dependencia es `tar`: una librería de
  parsing de terceros arrastraría dependencias por lo que la
  stdlib cubre.
- **Objetivo:** `util.parseArgs` en modo `strict` como nivel
  token —opción desconocida, valor ausente y repetida no
  `multiple` ya fallan solos— y `parseArgs` reducido a la forma
  por comando: despacho, aridades y reglas cruzadas
  (`--force`⊕`--skip`, `--ref`⊕`@ref`, `--package` solo en
  install), que son gramática del dominio.
- **Restricciones:** decidir dos deltas observables que el
  parser estándar acepta y la gramática actual rechaza —
  `--path=x` (forma `=`) y `--` como terminador—; ambos son un
  superset, conviene declararlos o rechazarlos explícitamente.
  Mensajes de ayuda y `null` como idioma de gramática inválida
  se conservan.
- **Validación:** `splitArgs` desaparece; las reglas cruzadas
  siguen siendo las únicas comprobaciones manuales; suite en
  verde.
- **Confianza:** media —los dos deltas de gramática son decisión
  de producto, no mecánica—.
- **Derivado en:** docs/tasks/059-adoptar-util-parseargs-nivel-token.md

## Observaciones


- `writeLock` (`src/lock.js:96-139`) combina el `flatMap` de
  despacho por acción, el apéndice de la guía y el ensamblado —
  moderado; candidato si la lista de acciones crece—.
- El vocabulario de retirada (`remove`/`keep` ↔ `overwrite`/`skip`)
  se traduce en tres sitios: la pregunta y el informe de
  `settleConflicts` (`src/commands.js:85-106`) y
  `REMOVAL_RESOLUTION` (`src/execute.js:29`) —un solo mapa
  compartido resistiría mejor una evolución—.
- La complejidad de `diff.js` es algorítmica real (LCS, hojas
  comparables) y está bien descompuesta; `uncoveredUnits`
  (`drift.js:44-75`) es compleja pero cohesiva y comentada.
- La métrica de indentación de `usage.js` es un falso positivo de
  los literales de ayuda, no estructura real.
