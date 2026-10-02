# Unificar la defensa de rutas registradas

## Estado

[x] Completada

## Tipo

mantenimiento (refactoring)

## Objetivo

«El lock es dato no confiable y sus rutas se revalidan» se defiende
hoy con dos mecánicas distintas: `classifyResource` (`src/drift.js`)
usa `isSafeRelative` + `resolvesUnder` sobre la cadena de padres —
la hoja es segura porque `hashPath` hace `lstat`—, mientras
`showGuide` (`src/cli.js`) usa `isSafeRelative` + `realpathSync` de
la hoja completa, cubriendo además que el propio archivo registrado
sea un enlace saliente. Unificar la defensa en una operación
compartida —o declarar la diferencia si es deliberada— evita que un
tercer consumidor elija mal.

## Dependencias

- Ninguna

## Entrada

- `src/drift.js` (líneas ~15-19), `src/cli.js` (`showGuide`, líneas
  ~149-168), `src/paths.js`
- `docs/architecture-reviews/002-instalacion-tras-el-ciclo-de-vida.md`
  — hallazgo H2

## Resultado esperado

- Una sola operación «la ruta registrada es segura para acceder» en
  `paths.js` (o la diferencia entre los dos niveles —padres vs hoja—
  declarada en el código y el dominio), consumida por `drift.js` y
  `showGuide`.
- `guide` sigue validando la hoja misma (lee el contenido); la
  deriva mantiene su semántica actual.
- Mismo comportamiento observable.

## Criterios de calidad

- Las pruebas de escape por enlace existentes (`check`, `guide`,
  plan) siguen verdes sin modificar aserciones.
- Un solo mecanismo o una diferencia documentada; cobertura 100 %.

## Procedimiento sugerido

1. Comparar los dos mecanismos y decidir unificación o declaración.
2. Extraer a `paths.js` lo compartido y adaptar los consumidores.
3. Verificar suite y cobertura.

## Notas

- Si la unificación revela una diferencia de nivel (la hoja importa
  en `guide` pero no en deriva), la respuesta puede ser una API de
  dos niveles en `paths.js`, no necesariamente una función única.

## Contexto

- **Archivos similares:**
  - `src/paths.js` — hogar natural de las defensas de rutas:
    `isSafeRelative`, `resolvesUnder`, `hasEntry`,
    `personalizationTarget`. Las rutas del plan ya comparten
    `resolvesUnder` (plan, ejecución, destino de guía): la defensa de
    rutas *registradas* es la que queda por unificar.
  - `src/drift.js` — `classifyResource` consume la defensa a nivel de
    cadena de padres: `isSafeRelative(target)` +
    `resolvesUnder(destDir, dirname(abs))`; la hoja es segura porque
    `hashPath` opera con `lstat` —un enlace se hashea como enlace,
    nunca se sigue—.
  - `src/cli.js` `showGuide` — consume la defensa a nivel de hoja
    completa: `isSafeRelative` + `realpathSync` de la ruta entera con
    contención en la raíz, porque lee el contenido a través de la
    hoja y un enlace saliente filtraría archivos ajenos.
  - `src/hash.js` — `hashPath` documenta que `lstat` es deliberado:
    siguiendo enlaces fallaría con colgados y podría recursar; es la
    justificación de que la deriva no necesite resolver la hoja.
  - `test/cli.test.js` — pruebas de escape por enlace para `guide`
    (líneas ~516-546: `..`, padre enlazado, hoja enlazada) y `check`
    (~773-777): la red de invariancia.
- **Patrones:**
  - Funciones puras exportadas por módulo ESM; resultados
    discriminados (`{ok, …}` en `fetch`, `kind` en `verifyPackage`).
  - Comentarios de bloque en inglés explicando el porqué;
    early returns.
  - `npm test` exige cobertura 100 % sobre `src/`.
- **Lecciones:**
  - `docs/lessons/` no existe: ninguna nota aplica.
  - `EXPERIENCIAS.md` (20260930T010326): la revisión técnica se lanza
    con un subagente capaz de ejecutar `git` y `npm test`.
- **Decisiones:**
  - D007 — el lock es memoria de propiedad; como dato versionado se
    revalida antes de usarse.
  - D011 — `guide` lee el campo `personalization` del registro; ruta
    registrada insegura es código 3.
  - D013 — `check` clasifica la deriva de cada recurso registrado;
    ruta insegura degrada a `unverifiable`, nunca a fallo.

## Conectividad

**Veredicto: conectada.**

Todo lo que la tarea asume existe: las dos mecánicas están donde el
hallazgo las ubica (`src/drift.js:15-19` y `src/cli.js` `showGuide`),
`paths.js` ya concentra las primitivas que ambas combinan, y la suite
cubre los tres escapes (`..`, padre enlazado, hoja enlazada) más la
guía ausente. La diferencia de niveles es real y deliberada —la
deriva hashea la hoja sin seguirla, `guide` lee a través de ella—,
así que la respuesta esperada es la API de dos niveles que la propia
tarea prevé; no falta infraestructura.

## Plan técnico

**Subsistema.** `paths.js` concentra las defensas de rutas
(`isSafeRelative`, `resolvesUnder`, `hasEntry`). Dos consumidores de
rutas *registradas* aplican «el lock es dato no confiable» con
mecánicas distintas porque operan a niveles distintos: la deriva
(`classifyResource`) trata la hoja atómicamente —`hashPath` hace
`lstat`, nunca sigue el enlace— y solo exige que la cadena de padres
no escape; `guide` (`showGuide`) lee contenido a través de la hoja,
así que exige además que la hoja resuelva dentro del destino. La
diferencia es deliberada; lo que falta es declararla como API.

- [x] Declarar en `src/paths.js` la API de dos niveles para rutas
  registradas: nivel «cadena» —`isSafeRelative` + `resolvesUnder`
  sobre los padres, booleano— y nivel «hoja» —resolución completa
  con contención en la raíz, resultado discriminado que distingue
  `unsafe` de `unreadable`—
  - Aporta: la defensa tiene un solo hogar y la diferencia de niveles
    queda declarada en la API en lugar de dispersa en dos mecánicas
  - Contexto: el nivel hoja debe distinguir «insegura» de «ilegible»
    porque `showGuide` emite mensajes distintos por caso; calcular la
    raíz real dentro de la operación es suficiente —una `realpath`
    extra por guía, comportamiento idéntico—
- [x] Adaptar `classifyResource` (`src/drift.js`) al nivel cadena y
  `showGuide` (`src/cli.js`) al nivel hoja
  - Aporta: los dos consumidores comparten la defensa; un tercer
    consumidor futuro elegirá nivel, no mecánica
  - Contexto: `showGuide` conserva leer todas las guías antes de
    imprimir y sus dos mensajes de error; `classifyResource` sigue
    degradando cualquier inseguridad a `unverifiable`
- [x] Verificar suite y cobertura; añadir pruebas unitarias de la API
  solo si alguna rama nueva queda descubierta
  - Aporta: mantiene el 100 % sin inflar la suite
  - Contexto: las pruebas de escape existentes cubren ambos niveles
    vía `guide` y `check`

## Suite de pruebas esperada

Casos de uso: (1) verificar la deriva de los recursos registrados,
(2) consultar la guía registrada, (3) la defensa compartida de rutas
registradas.

- Regresión: `guide` sigue rechazando con «no es segura» los escapes
  por `..`, por padre enlazado y por hoja enlazada, y respondiendo
  «no se puede leer» ante la guía ausente; `check` sigue marcando
  `unverifiable` las rutas que escapan —la suite existente los
  cubre, sin anotar letra— casos 1 y 2.
- Condicional (solo si la cobertura lo exige): el nivel cadena acepta
  una hoja que es enlace saliente mientras los padres resuelvan
  dentro —la deriva nunca lee a través de la hoja— y el nivel hoja
  la resuelve o la rechaza según contención (B) — caso 3.

## Desviaciones del plan

- La rama descubierta por la cobertura no estaba en la API de
  `paths.js` sino en `showGuide`: al separar la resolución de la
  lectura, el `catch` de `readFileSync` quedó alcanzable solo cuando
  la ruta resuelve dentro pero no es legible —un directorio
  registrado como guía—. Se cubrió con una prueba nueva en
  `test/cli.test.js` en lugar de una prueba unitaria de la API, que
  era lo que la acción preveía. Motivo: la rama vive en el
  consumidor, no en la operación extraída. Decisión: añadir la prueba
  a nivel CLI, coherente con las pruebas de escape vecinas.
- `resolveRecordedPath` calcula la raíz real dentro de su `try`, así
  que una raíz de destino irresoluble degrada a «no se puede leer»
  (código 3) en lugar del crash no capturado que producía el cálculo
  previo fuera del `try` en `showGuide`. Inalcanzable en la práctica
  —`readLock` lee el lock desde esa misma raíz antes— y degrada a
  error gestionado en vez de crash. Detectado en la revisión
  técnica (observación O1); se acepta.

## Revisión

- Subagente: 2026-10-01 — Aprueba
- Usuario: 2026-10-01 — Aprueba
