# Extraer el pipeline compartido y la resolución de conflictos

## Estado

[x] Completada

## Tipo

mantenimiento (refactoring)

## Objetivo

`main` y `runUpdate` en `src/cli.js` implementan dos veces el
mismo pipeline —obtención, verificación, plan, resolución de
colisiones, guarda de la guía, `--dry-run`, ejecución y registro— y
la política de colisiones de D006 vive en dos bucles que ya divergen
deliberadamente («¿quitar?» para `removal`). Además la capa de
aplicación muta las entradas del plan (`r.resolution = …`) y navega
`lock.packages[…]` directamente. Extraer las fases compartidas y
concentrar la resolución en una operación de dominio elimina la
fuente principal de divergencia y prepara el punto de apoyo para
comandos futuros (colecciones).

## Dependencias

- Ninguna

## Entrada

- `src/cli.js` (`main` líneas ~428-556, `runUpdate` líneas ~244-404)
- `docs/decisions/D005`, `D006`, `D015`, `D016` — contratos a
  preservar
- `docs/architecture-reviews/002-instalacion-tras-el-ciclo-de-vida.md`
  — hallazgos H1 y H7

## Resultado esperado

- Una sola implementación del bucle de resolución de conflicts
  (flags `--force`/`--skip` → interactivo → aborto), parametrizada
  por la pregunta por conflicto —`overwrite`/`skip` en instalación,
  `quitar`/`conservar` en `removal`—.
- Las fases compartidas (obtención con cleanup, mapeo de
  verificación, guarda de la guía, ejecución + registro + informe)
  extraídas de modo que `main` y `runUpdate` compartan el esqueleto.
- La mutación del plan y la navegación del registro concentradas en
  operaciones de dominio —p. ej. `resolveConflicts(plan, decision)` o
  equivalente— sin que `cli.js` toque `r.resolution` ni
  `lock.packages` directamente.
- Misma API pública, misma suite en verde sin tocar aserciones y
  mismo comportamiento observable —mensajes y códigos de salida
  idénticos—.

## Criterios de calidad

- `npm test` verde (100 % de cobertura) sin modificar las aserciones
  existentes; solo se permiten pruebas nuevas de las operaciones
  extraídas.
- Ninguna línea de `cli.js` asigna `resolution` ni accede a
  `lock.packages`.
- Un solo sitio implementa la resolución de conflicts.
- Los mensajes de salida y los códigos de salida son byte a byte los
  mismos (salvo donde una prueba nueva lo justifique).

## Procedimiento sugerido

1. Extraer la resolución de conflicts como operación compartida.
2. Extraer el bloque fetch/verify y el bloque
   ejecutar+guía+registro+informe.
3. Encapsular la navegación del registro (`entry(name)`, `origin`).
4. Verificar suite completa y cobertura.

## Notas

- Encaja con el paradigma declarado por el usuario: flujo de datos
  funcional en el pipeline, entidades de dominio con comportamiento
  para lo que tiene invariantes que proteger.

## Contexto

- **Archivos similares:**
  - `src/cli.js` — `main` (install) y `runUpdate` duplican el
    pipeline obtener → verificar → planear → resolver → guardar guía
    → dry-run → ejecutar → registrar → informar; es el propio objeto
    del refactor. Las consultas (`showGuide`, `showList`, `showCheck`)
    muestran el estilo fino deseado de la capa de aplicación.
  - `src/plan.js` — `buildPlan`/`buildUpdatePlan` construyen el plan
    como dato plano; el plan es donde vive la futura operación de
    dominio de resolución.
  - `src/lock.js` — `readLock`/`writeLock`/`isValidLock` poseen la
    forma del registro; el acceso `lock.packages[…]` desde `cli.js`
    y `plan.js` es lo que hay que encapsular.
  - `src/execute.js` — `executePlan` materializa el plan resuelto y
    ya lee `r.resolution`/`r.removal`: es consumidor del contrato de
    resolución, no parte del bucle.
  - `src/prompt.js` — `createAsker` inyectable; el bucle interactivo
    consume `io.createAsker` y `io.interactive`.
  - `test/cli.test.js` (1313 líneas) — ejerce `main` por inyección
    de `io` y afirma mensajes y códigos literalmente: es la red de
    invariancia del refactor.
- **Patrones:**
  - Módulos ESM de funciones puras exportadas; el dominio devuelve
    valores estructurados (`VerificationResult`, `Plan`, `UpdatePlan`,
    lock) y la I/O vive en los bordes (`cli.js`, `prompt.js`,
    `fetch.js`).
  - Inyección de dependencias por el objeto `io`
    (`out`/`err`/`cwd`/`interactive`/`createAsker`/`fetch`/`tmpBase`)
    que mantiene todo comprobable sin frameworks.
  - Comentarios de bloque en inglés que explican el «por qué» de cada
    operación antes de ella; código compacto con early returns.
  - `npm test` exige cobertura 100 % (líneas, funciones, ramas) sobre
    `src/`: todo código extraído debe quedar cubierto por la suite
    existente o por pruebas nuevas de las operaciones extraídas.
- **Lecciones:**
  - `docs/lessons/` no existe aún: ninguna nota aplica.
  - `EXPERIENCIAS.md` (entrada 20260930T010326): la revisión técnica
    independiente debe lanzarse con un subagente capaz de ejecutar
    `git` y `npm test` (perfil `subagent_general`), no solo lectura.
- **Decisiones:**
  - D005 — plan completo antes de escribir y aborto total: el orden
    verificación → plan → resolución → escritura es contrato.
  - D006 — política de colisiones: interactiva por recurso, aborto
    sin consola, `--force`/`--skip` excluyentes (ya garantizado por
    `splitArgs`); el contenido nunca se fusiona.
  - D007 — el registro `teleprompter-lock.json` es la memoria de
    propiedad; su forma la posee `lock.js`.
  - D014 — `origin` registra la procedencia reobtenible; `update`
    consume solo el registro para reobtener.
  - D015 — vocabulario del plan de actualización y política de
    retirados: `removal` reutiliza la resolución `overwrite`/`skip`
    con sentido quitar/conservar.
  - D016 — `update` resuelve el origen: explícito > registrado;
    `--ref` no aplica a origen local; `remove`/`keep` en ejecución.
  - D017 — semver inmutable: `upToDate` por versión, sin comparación
    de contenido; no tocar en este refactor.

## Conectividad

**Veredicto: conectada.**

Todo lo que la tarea asume existe con la forma esperada, verificado
contra el código:

- `main` (install) y `runUpdate` en `src/cli.js` implementan el
  pipeline duplicado descrito —fetch con `cleanup`, mapeo de
  `result.kind`, bucle de resolución `--force`/`--skip`/interactivo/
  aborto, pre-verificación del destino de la guía, `--dry-run`,
  `executePlan` + `installPersonalization` + `writeLock` + informe—.
- Las mutaciones y navegaciones a encapsular existen donde el
  hallazgo las ubica: `r.resolution = …` en los dos bucles de
  resolución, `lock.packages[…]` en `showGuide`, `showList`,
  `showCheck`, `runUpdate` y `src/plan.js`.
- El punto de apoyo del dominio existe: `Plan`/`UpdatePlan` son datos
  producidos por `plan.js`, `lock.js` posee la forma del registro y
  `execute.js` ya consume `r.resolution`/`r.removal`; la inyección de
  `io` (`interactive`, `createAsker`) sostiene un bucle de resolución
  compartido y comprobable.
- La red de invariancia existe: `test/cli.test.js` afirma mensajes y
  códigos literalmente y `npm test` exige cobertura 100 %.

No falta infraestructura: extraer las operaciones de dominio y el
pipeline compartido es el propio alcance de la tarea.

## Plan técnico

**Subsistema.** `src/cli.js` orquesta cinco comandos como capa de
aplicación: parsea, delega en el dominio y traduce resultados a
salida y códigos. `main` (install) y `runUpdate` duplican el
pipeline completo —obtener → verificar → planear → resolver →
pre-verificar la guía → `--dry-run` → ejecutar → registrar →
informar— y divergen en puntos conocidos: el prólogo (update
resuelve el origen desde el registro), el constructor del plan
(`buildPlan`/`buildUpdatePlan`), la puerta `upToDate`, el título y
las entradas del plan impreso, la pregunta y el vocabulario mostrado
para conflicts `removal`, y el verbo final
(`instalado`/`actualizado`). El refactor extrae las fases compartidas
como funciones de aplicación dentro de `cli.js` y mueve al dominio
las dos operaciones que hoy se hacen desde fuera: asignar
`resolution` (→ `plan.js`) y navegar `lock.packages` (→ `lock.js`).

- [x] Añadir `resolveConflicts(plan, decide)` a `src/plan.js` como
  única operación que asigna `r.resolution`: invoca
  `decide(conflicto)` por conflicto, en orden y esperando su
  resultado con `await` para admitir decisiones asíncronas
  - Aporta: la mutación del plan —«una resolución es `overwrite` o
    `skip`»— gana dueño en el dominio; `cli.js` deja de asignar
    `resolution` y el bucle compartido consume la operación
  - Contexto: la decisión se aplica secuencialmente porque las
    preguntas interactivas salen de una en una
- [x] Añadir `lockEntry(lock, name)` y `lockEntries(lock)` a
  `src/lock.js` y sustituir todo acceso a `lock.packages` fuera del
  módulo: `showGuide`, `showList`, `showCheck` y `runUpdate` en
  `cli.js`; `buildPlan` y `buildUpdatePlan` en `plan.js`
  - Aporta: la navegación del registro se concentra en el módulo que
    posee su forma; `cli.js` deja de conocer `packages` y cambiar la
    estructura interna deja de tocar tres módulos (H7)
  - Contexto: `plan.js` pasará a importar de `lock.js`; no hay ciclo
    porque `lock.js` solo importa `hash.js` y `paths.js`
- [x] Extraer en `cli.js` las fases compartidas como funciones
  privadas de aplicación, con las diferencias como parámetros:
  `obtainPackage` (obtención remota con `cleanup`, resultado
  discriminado), `checkVerified` (avisos + `kind` manifest/requires +
  nombre esperado opcional + «verificado:»), `printPlan` (título
  parametrizado, recursos más `retired ?? []`), `settleConflicts`
  (único bucle `--force`/`--skip` → interactivo → aborto, con
  pregunta y etiqueta mostrada ramificadas por `r.removal`),
  `checkGuideDestination` (pre-verificación del destino de la guía) y
  `executeAndReport` (`executePlan` + `installPersonalization` +
  `writeLock` + informe + guía + verbo final `instalado`/`actualizado`)
  - Aporta: una sola implementación del bucle de resolución y de cada
    fase; install y update quedan como dos composiciones con el mismo
    esqueleto visible (H1)
  - Contexto: la marca `removal` solo aparece en planes de
    actualización, así que ramificar por ella reproduce los dos
    textos sin parámetros de configuración; el nombre esperado se
    pasa solo desde update; la lectura del registro queda en cada
    orquestador porque los puntos de aviso difieren —update avisa
    antes de obtener, install tras «verificado:»— y la salida debe
    ser idéntica byte a byte
- [x] Recomponer `main` y `runUpdate` como orquestadores: `main`
  delega la parte de install en un `runInstall` simétrico a
  `runUpdate`; cada uno conserva su prólogo (comprobación de rutas en
  install; entrada, origen registrado y `--ref` en update) y el
  `try/finally` de `cleanup`
  - Aporta: cierra la duplicación y deja el punto de apoyo para
    comandos futuros; `main` vuelve a ser capa de invocación delgada
    —parsea y delega—
  - Contexto: el orden observable se conserva exactamente —mismos
    mensajes, mismo orden, mismos códigos—; `--dry-run` y la puerta
    `upToDate` quedan en su posición actual
- [x] Añadir pruebas nuevas de las operaciones de dominio extraídas
  (`resolveConflicts`, `lockEntry`, `lockEntries`) sin tocar las
  aserciones existentes
  - Aporta: documenta el contrato de las operaciones nuevas y
    protege la cobertura 100 % que `npm test` exige
  - Contexto: no existe `test/lock.test.js`; siguiendo la convención
    de un archivo por módulo, las de `lockEntry`/`lockEntries` van en
    `test/lock.test.js` nuevo y las de `resolveConflicts` en
    `test/plan.test.js`

## Suite de pruebas esperada

Casos de uso: (1) instalar un paquete con colisiones, (2) actualizar
un paquete instalado con retirados en conflicto, (3) resolver los
conflicts de un plan como operación de dominio, (4) consultar
entradas del registro por nombre o en bloque.

- Resolver un plan sin conflicts no decide ni muta nada (Z) — caso 3.
- Un conflicto queda con la resolución que la decisión devuelve
  (O) — caso 3.
- Con varios conflicts, cada uno recibe su propia decisión en el
  orden del plan (M) — caso 3.
- La decisión puede devolver una promesa —pregunta interactiva— y se
  espera antes de seguir (I) — caso 3.
- La entrada de un paquete se recupera por nombre; un nombre ausente
  responde indefinido (O) — caso 4.
- El registro vacío enumera cero entradas y el poblado enumera todos
  sus pares nombre-entrada (Z/M) — caso 4.
- Regresión: install y update producen mensajes y códigos byte a byte
  idénticos en `--force`, `--skip`, interactivo, aborto no
  interactivo, `--dry-run`, `upToDate` y error de ejecución —la suite
  existente los cubre, sin anotar letra— casos 1 y 2.

## Revisión

- Subagente: 2026-10-01 — Aprueba
- Usuario: 2026-10-01 — Aprueba
