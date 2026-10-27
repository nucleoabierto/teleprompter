# Guarda de propiedad propia en las lecturas del lock

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Las lecturas del registro resuelven `lock.packages[name]` sin guarda
de propiedad propia: una clave heredada como `__proto__` o
`constructor` resuelve un miembro de `Object.prototype` en lugar de
«no instalado», así que un comando invocado con ese nombre opera
sobre un objeto que nadie instaló. La tarea hace que las lecturas
del lock reconozcan solo las entradas propias del registro.

## Dependencias

- Ninguna.

## Entrada

- `src/lock.js` — `lockEntry` devuelve `lock.packages[name]` sin
  comprobar que la clave sea propia; el defecto lo encontró la
  revisión técnica de la tarea 043 (preexistente, no introducido por
  ella). Conviene auditar cualquier otro acceso `lock.packages[...]`
  o equivalente.
- `src/cli.js` — los comandos que resuelven un paquete por nombre a
  través de `lockEntry` (`uninstall`, `update`, `guide`) son la
  superficie observable del defecto.
- El lock es dato no confiable (misma familia de defensas que las
  rutas registradas): la corrección pertenece al lector, no a los
  comandos.
- `src/manifest.js` — `NAME_RE` admite nombres como `constructor`,
  que colisionan con miembros heredados aunque sean nombres válidos.

## Resultado esperado

- `uninstall`, `update` y `guide` invocados con un nombre que solo
  existe como propiedad heredada (`__proto__`, `constructor`,
  `hasOwnProperty`, …) responden «no está instalado» —código 4— como
  cualquier paquete ausente.
- Una entrada propia legítima sigue resolviéndose —incluida una
  clave `__proto__` real, que `JSON.parse` materializa como
  propiedad propia—: la guarda es de pertenencia, no una lista
  negra de nombres.
- `lockEntries` y las escrituras del registro conservan su
  comportamiento.

## Criterios de calidad

- `uninstall __proto__` termina con código 4 y mensaje de paquete no
  instalado, no con éxito; lo mismo en `update` y `guide`.
- Un nombre válido según `NAME_RE` que colisiona con un miembro
  heredado (p. ej. `constructor`) se trata como no instalado salvo
  que la entrada exista como propiedad propia.
- Un lock con una entrada `__proto__` propia —escrita por
  `JSON.parse`— sigue siendo legible por los comandos.
- `npm test` en verde con el 100 % de cobertura exigido en `src/`.

## Procedimiento sugerido

1. Añadir la guarda de propiedad propia en `lockEntry`
   (`Object.hasOwn` o equivalente) y auditar los demás accesos por
   nombre al registro.
2. Cubrir en la suite las claves heredadas en los comandos que
   leen por nombre, más el caso de una entrada `__proto__` propia.

## Notas

- Defecto descubierto durante la revisión técnica de la tarea 043;
  es preexistente y quedó fuera de su alcance.

## Contexto

- Archivos similares: `src/lock.js` es el módulo que concentra la
  forma del registro —toda lectura por nombre pasa por `lockEntry`
  (`src/plan.js` ×2, `src/cli.js` ×4)—, así que una sola guarda
  cubre a todos los llamadores; `test/lock.test.js` da el idioma de
  las unitarias y `test/cli.test.js` ya prueba nombres heredados
  (`help constructor`, `help __proto__`) como precedente.
- Patrones: los lectores nunca tocan `lock.packages` directamente
  —comentario rector del módulo—; `lockEntries`, `isValidLock` y
  las escrituras ya operan sobre propiedades propias
  (`Object.entries`, `Object.values`, `...rest`), así que la guarda
  solo falta en `lockEntry`; la corrección pertenece al lector, no
  a los comandos.
- Dominio: `docs/domains/002-instalacion.md` —entidad Registro
  (lock): el lock es dato no confiable y su forma solo se toca en
  `src/lock.js`; ancla `lockEntry`/`lockEntries`—.
- Producto: `manual/referencia-uninstall.md` y
  `manual/referencia-update.md` —el error «el paquete no está
  instalado» (código 4) es la respuesta declarada para un nombre
  ausente del registro; los nombres heredados deben caer en ella—.
- PRD: ninguno —la tarea es suelta, sin conjunto con PRD—.
- Lecciones: `revision-tecnica-subagente` —la revisión técnica irá
  con un subagente capaz de ejecutar comandos—;
  `documentacion-viva` —los sensores de cierre no registran
  acciones puntuales—.
- Decisiones: D007 —el registro es la base de propiedad del
  sistema; corromper sus lecturas con miembros heredados rompe esa
  base—.

## Conectividad

Veredicto: **conectada**.

Todos los supuestos de la Entrada se verificaron contra el código
real: `lockEntry` es el único punto de lectura por nombre y carece
de la guarda (`src/plan.js` ×2, `src/cli.js` ×4 la consumen); las
enumeraciones (`lockEntries`, `isValidLock`) y las escrituras
(`writeLock`, `removeLockEntry`) ya operan solo sobre propiedades
propias, así que la guarda falta en un solo sitio; `Object.hasOwn`
está disponible —`engines` exige Node ≥ 22—; y la respuesta «no
está instalado» con código 4 ya es la de los comandos afectados.
No falta capacidad base: el cambio es una guarda en el lector.

## Plan

`src/lock.js` es el dueño de la forma del registro —toda lectura
por nombre pasa por `lockEntry`, que devuelve `lock.packages[name]`
sin guarda de propiedad propia: una clave heredada (`__proto__`,
`constructor`, `hasOwnProperty`…) resuelve un miembro de
`Object.prototype` en lugar de «ausente». Las enumeraciones
(`lockEntries`, `isValidLock`) y las escrituras (`writeLock`,
`removeLockEntry`) ya operan solo sobre propiedades propias, así
que el defecto vive en un solo punto y la corrección pertenece al
lector, no a los comandos.

- [x] Añadir la guarda de propiedad propia en `lockEntry`
  (`src/lock.js`) —devolver la entrada solo cuando el nombre sea
  propiedad propia de `lock.packages` (`Object.hasOwn`),
  `undefined` en cualquier otro caso—.
  - Aporta: cierra el defecto en el embudo único; los seis
    llamadores (`buildInstallPlan`, `buildUninstallPlan`,
    `showGuide`, `backupName`, `runUpdate`, `runUninstall`)
    heredan la protección sin tocarse.
  - Contexto: una entrada `__proto__` propia legítima
    —`JSON.parse` la materializa como propia— debe seguir
    resolviéndose: la guarda es de pertenencia, no una lista
    negra de nombres.
- [x] Cobertura de la suite hasta el 100 % exigido en `src/`.

## Suite

- `uninstall` invocado con un nombre que solo existe como
  propiedad heredada —`__proto__`, `constructor`,
  `hasOwnProperty`, `toString`— responde «no está instalado» con
  código 4. (M+B)
- `update` y `guide` con los mismos nombres responden igual
  —código 4, mensaje de no instalado—. (I)
- Un lock con una entrada `__proto__` propia —materializada por
  `JSON.parse`— sigue resolviéndose: el comando opera sobre ella
  como sobre cualquier entrada. (B)
- Unitario del lector: una clave propia devuelve su entrada; una
  clave ausente y una solo heredada devuelven `undefined`.
  (Z+O+B)
- Regresión: nombres válidos instalados siguen resolviéndose;
  `lockEntries` y las escrituras del registro conservan su
  comportamiento.
- 100 % de cobertura en `src/`.

## Revisión

- Subagente: 2026-10-26 — Aprueba
- Usuario (ejecución): 2026-10-26 — Aprueba
- Usuario (cierre): 2026-10-26 — Aprueba
