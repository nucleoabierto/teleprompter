# Despachar executePlan por acción

## Estado

[x] Completada

## Tipo

mantenimiento (refactoring)

## Objetivo

Sacar la resolución de la acción y sus cuatro ramas del bucle
único de `executePlan` —68 líneas con indentación máxima 6— a un
`actionOf(entry)` y manejadores por acción, declarando la guarda
de escritura y el respaldo previo una vez por rama.

## Dependencias

- Ninguna.

## Entrada

- `src/execute.js`: `ACTION`/`REMOVAL_RESOLUTION` (18-29) y el
  bucle de `executePlan` (83-134).
- `docs/architecture-reviews/005-complejidad-interna.md` —
  hallazgo H4—.

## Resultado esperado

- `actionOf` como operación propia que decide `create`,
  `overwrite`, `remove`, `identical`, `keep`/`skip` por entrada.
- Un manejador por acción —o tabla de despacho—; `executePlan`
  se lee como mkdirs + bucle que delega.

## Criterios de calidad

- Orden de `applied` observable idéntico —la entrada `overwrite`
  se empuja antes de copiar; un respaldo ya hecho se reporta
  aunque la retirada falle—.
- La defensa de escritura (`resolvesUnder`) no cambia.
- `npm test` en verde con el 100 % de cobertura en `src/`.

## Procedimiento sugerido

1. Extraer `actionOf` con la lógica `ACTION`/`REMOVAL_RESOLUTION`.
2. Dar a cada acción su manejador con su guarda y su respaldo.
3. Correr la suite.

## Notas

- El vocabulario de retirada (`remove`/`keep` ↔
  `overwrite`/`skip`) se traduce en tres sitios —observación del
  informe—; si la extracción naturalmente lo unifica, bienvenido,
  pero no es requisito.

## Contexto

- **Archivos similares:** la tabla `EXECUTE` propuesta sigue el
  precedente de `VALIDATORS` en `src/manifest.js` —despacho por
  tabla en lugar de cadena de ramas—; `actionOf` se suma a las
  primitivas de traducción ya declaradas junto a `ACTION` y
  `REMOVAL_RESOLUTION`.
- **Patrones:** los manejadores reciben el contexto de la
  operación y empujan a `applied` en el punto exacto que el
  informe exige —la entrada `overwrite` antes de copiar, el
  respaldo aunque la retirada falle—; los comentarios de
  cabecera explican el porqué.
- **Dominio:** `docs/domains/002-instalacion.md` ancla
  `executePlan`, `backupConflict` y `ExecutionError`;
  `003-registro.md` ancla `.teleprompter/` con
  `installPersonalization` y `backupConflict`;
  `004-resolucion-conflictos.md` ancla `backupConflict` —los
  cinco símbolos deben seguir existiendo con ese nombre—.
- **Producto:** ningún documento aplica —comportamiento
  observable invariante por definición de la tarea—.
- **PRD:** el hito 2 no tiene PRD —saneamiento sin
  comportamiento nuevo—.
- **Lecciones:** `docs/lessons/revision-tecnica-subagente.md`
  —la revisión técnica se lanza con un subagente que pueda
  ejecutar comandos—.
- **Decisiones:** D005 —un fallo aborta el plan entero y
  `ExecutionError` transporta `applied`; D021 —la capa de
  ejecución conserva su idioma de error tipado con `cause`—.
- **Suite:** `test/execute.test.js` ejerce `executePlan`
  directo (mkdir que escapa, conflicto sin resolver,
  `ExecutionError` con `applied`, guarda de respaldo) y por
  integración; `test/cli.test.js` cubre las retiradas —
  `remove`, `keep`, respaldo reportado aunque el borrado
  falle—.

## Conectividad

Verificada durante la recolección: las tablas `ACTION` y
`REMOVAL_RESOLUTION` (`execute.js:18-29`), el bucle de despacho
(`execute.js:83-134`) y las cuatro ramas existen tal como la
tarea los describe; `resolvesUnder`, `backupConflict`,
`copyResource` y `hashPath` ya son primitivas reutilizables; la
suite ejerce cada rama incluidos el respaldo reportado en
borrado fallido (`test/cli.test.js:1534`, `:2836`) y la entrada
empujada antes de copiar (`test/execute.test.js:337`). La rama
`else` final —registrar sin escribir— cubre `skip`, `keep` y
cualquier acción ajena al vocabulario. Veredicto:
**conectada**.

## Plan técnico

- [x] `actionOf(resource)` junto a `ACTION`/`REMOVAL_RESOLUTION`:
  compone la traducción —`removal` consulta
  `REMOVAL_RESOLUTION[resolution]`, si no
  `ACTION[status] ?? resolution`— y lanza `plan sin resolver`
  cuando decide `undefined`.
  - Aporta: «qué acción» existe una sola vez, con su rechazo;
    el bucle ya no conoce las tablas.
- [x] `writableTarget(destDir, target)`: la guarda de cadena
  padre que devuelve `dest` o lanza el escape —consumida por
  las ramas que escriben (`create`, `overwrite`, `remove`)—.
  - Contexto: `identical` no la lleva —no escribe— y el bucle
    de `mkdirs` conserva la suya propia —verifica la ruta
    completa, no el padre—; la tarea exige que la defensa no
    cambie.
- [x] Cuatro manejadores `(ctx, r, applied)` con
  `ctx = { src, destDir, backupRoot }` y el bucle despachando
  `{ ...r, action }`:
  - `writeResource` —`create`/`overwrite`—: guarda, respaldo y
    `rmSync` si `overwrite`, entrada empujada antes de copiar,
    `sha256` tras `hashPath`.
  - `removeResource`: guarda, respaldo si conflicto con
    `backupRoot`, `rmSync` y —si falla tras respaldar— empuja
    la pseudo-acción `backup` antes de relanzar.
  - `recordIdentical`: `{ target, action, sha256 }` sin
    guarda —no hay escritura que defender—.
  - `recordDecision`: `{ target, action }` para `skip`,
    `keep` y cualquier acción ajena.
  - Aporta: cada rama nombra su trabajo; guarda y respaldo
    quedan declarados una vez por manejador.
- [x] Tabla `EXECUTE` —`create`/`overwrite`→`writeResource`,
  `remove`→`removeResource`, `identical`→`recordIdentical`— y
  el bucle:
  `(EXECUTE[action] ?? recordDecision)(ctx, { ...r, action }, applied)`.
  - Contexto: el `??` reproduce la rama `else` original —
    `skip`, `keep` y acciones ajenas se registran sin
    escribir—; como `skip`/`keep` pasan por el *fallback*, la
    rama ya está cubierta por los tests existentes.
- [x] `executePlan` queda: mkdirs + `actionOf` + despacho,
  envuelto en `ExecutionError` —invariante—.
  `installPersonalization` no se toca.
- [x] Correr la suite completa y confirmar el 100 % en `src/`.

## Decisiones

- La tabla solo nombra acciones que trabajan —`skip`/`keep`
  caen al *fallback*, no son manejadores— porque reproducen
  literalmente el `else` actual y así el `??` queda cubierto
  sin tests nuevos.
- Los manejadores empujan a `applied` en vez de devolver
  entradas porque los dos puntos de empuje —antes de copiar,
  antes de relanzar el fallo de borrado— son semántica del
  informe, no estilo.
- El vocabulario de retirada (`remove`/`keep` ↔
  `overwrite`/`skip`) queda unificado en `actionOf` —el
  tercer sitio de traducción desaparece con la extracción—.

## Suite de pruebas esperada

- Regresión completa: los 30 casos de `test/execute.test.js`
  más los de retirada en `test/cli.test.js` —`remove`,
  `keep`, respaldo-en-fallo, `plan sin resolver`, escapes—
  en verde sin tocar expectativas.
- Cobertura: 100 % en `src/execute.js` —cada manejador y el
  `??` ya tienen caso—.
- Sin casos nuevos: refactor puro.

## Desviaciones

- La revisión técnica detectó dos diferencias de comportamiento
  frente al bucle plano, ambas corregidas: `EXECUTE` se declara
  con `__proto__: null` —una acción ajena que colisione con
  `Object.prototype` debe caer al *fallback*, no invocar un
  miembro heredado— y `recordDecision` ejecuta
  `path.join(destDir, r.target)` por efecto lateral —el bucle
  original computaba el join para toda entrada, así que un
  `target` malformado sigue lanzando aunque nada se escriba—.

## Revisión

- Subagente: 2026-10-29 — Aprueba
- Usuario (ejecución): 2026-10-29 — Aprueba
- Usuario (cierre): 2026-10-29 — Aprueba
