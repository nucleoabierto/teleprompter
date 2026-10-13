# Registrar el commit obtenido en el origen del registro

## Estado

[ ] Pendiente | [~] En progreso | [r] En revisión | **[x] Completada** | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

El registro conserva el commit exacto que produjo cada instalación
remota: el origen `github` gana el campo `commit` con el SHA
resuelto, escrito al instalar y refrescado al actualizar.

## Dependencias

- 037 — aporta el SHA resuelto en el resultado de la
  obtención remota.

## Entrada

- `src/lock.js`: `isValidOrigin` (la forma válida del origen) y
  `writeLock` (donde el origen se persiste).
- `src/cli.js`: `originOf` (la construcción del origen registrado)
  y los flujos de `install` y `update` que lo producen.
- El resultado del fetch con el SHA resuelto, del Borrador 01.

## Resultado esperado

- Toda instalación remota registra `{type: github, repo, ref?,
  commit}` —`commit` siempre presente en orígenes `github`—; los
  orígenes `path` no lo llevan.
- `update` mantiene su semántica de avance: obtiene lo que el
  origen publica en ese momento y el `commit` registrado se mueve
  con él, de modo que el registro siempre dice qué árbol produjo la
  instalación vigente.
- Los locks escritos antes del campo siguen siendo válidos: el
  origen sin `commit` se acepta.

## Criterios de calidad

- Tras `install user/repo`, el `commit` registrado coincide con el
  SHA que la API de GitHub declara para la rama por defecto.
- Tras `update`, el `commit` refleja el SHA del contenido efectivamente
  instalado en esa invocación.
- Un lock previo sin `commit` pasa la validación y no rompe `list`,
  `check` ni `update`.
- La suite cubre los caminos nuevos y la cobertura sigue al 100 %.

## Procedimiento sugerido

1. Ampliar `isValidOrigin` para aceptar `commit` como string
   opcional en orígenes `github`.
2. Propagar el SHA resuelto desde el resultado de la obtención
   hasta `originOf`/`writeLock` en los flujos de `install` y
   `update`.
3. Cubrir con tests: install y update remotos registran el SHA,
   origen `path` sin campo, lock antiguo sin `commit` sigue válido.

## Notas

- La divergencia «el commit avanzó, la versión no» queda
  detectable comparando el `commit` registrado con la resolución
  actual del origen; exponerla corresponde a la línea de revisión
  de desactualizados (fuera de alcance de esta propuesta).

## Contexto

- **Archivos similares:** `src/lock.js` es dueño de la forma del
  registro —`isValidOrigin` valida el origen campo a campo y
  `writeLock` lo persiste tal cual lo recibe—; `src/cli.js`
  construye el origen en `originOf` y lo pasa a `executeAndReport`
  → `writeLock` desde `installUnit` y `runUpdate`.
- **Patrones:** los campos opcionales del origen se escriben solo
  cuando existen —`ref` y `package` siguen esa forma— y el
  validador los acepta opcionales para no romper locks previos;
  `obtainPackage` devuelve `{ ok, pkgDir, cleanup, commit }` tras
  la 037 y sus llamadores ya desestructuran lo que necesitan.
- **Dominio:** `docs/domains/002-instalacion.md` — «commit
  resuelto» ya es concepto del lenguaje ubicuo tras la 037; esta
  tarea lo conecta con `origin`, la procedencia reobtenible
  (D014).
- **Producto:** `manual/004-actualizar-un-paquete.md` y
  `referencia-update.md` describen la semántica de avance de
  `update` —el commit se refresca con ella, no cambia el flujo—;
  `referencia-install.md` describe la obtención anclada.
- **PRD:** `docs/prd/007-pin-de-obtencion-remota.md` — CU-1
  (instalar con procedencia registrada) es el caso central;
  CU-2 (avanzar refrescando el commit) cubre `update`; CU-3
  (consultar la procedencia) presupone que el registro sin el
  campo sigue siendo legible.
- **Lecciones:** ninguna aplica a la implementación.
- **Decisiones:** `D014-campo-origin-del-registro.md` — el
  origen es la memoria reobtenible de la instalación: `commit`
  la completa, no la redefine.
- **Restricción de forma:** `commit` es obligatorio en origen
  `github` escrito por la obtención actual y ausente en origen
  `path`; la validación lo acepta opcional —los locks previos no
  se reescriben—.

## Conectividad

**Conectada.**

Todo lo que la tarea asume existe con la forma esperada:

- `obtained.commit` ya viaja en el resultado de `obtainPackage`
  desde la 037 —los llamadores `runInstall` y `runUpdate` lo
  tienen en scope—.
- `isValidOrigin` en `src/lock.js` valida campo a campo con
  opcionales: el patrón para `commit` está dado por `ref`.
- `originOf` en `src/cli.js` es el único punto que produce el
  origen `github`/`path`: un parámetro `commit` opcional cubre
  ambos flujos sin tocar la firma de `writeLock`.
- `executeAndReport` pasa `origin` intacto a `writeLock`: la
  escritura no requiere cambio.
- Los tests de lock y los flujos CLI con `remoteOk` ya encadenan
  resolución + descarga: el SHA resuelto está disponible para
  asertar contra `origin.commit`.

## Plan técnico

El registro lo escribe `writeLock` con el `origin` que
`originOf(source)` construye; tras la 037 el SHA resuelto viaja
en `obtained.commit`, al alcance de `runInstall` y `runUpdate`.

- [x] **`isValidOrigin` acepta `commit` opcional** para orígenes
   `github` (`undefined` o string).
   - Aporta: el registro nuevo es válido y los locks previos sin
     el campo lo siguen siendo —la compatibilidad vive en el
     validador—.
- [x] **`originOf(source, commit)` escribe `commit`** cuando se le
   pasa —solo en `github`; `path` nunca lo recibe—.
   - Aporta: un solo punto produce la forma nueva del origen.
   - Contexto: sigue el patrón de `ref` —presente solo cuando
     existe—.
- [x] **`obtained.commit` llega a los dos flujos**: `runInstall` lo
   pasa a `installUnit` (que lo da a `originOf`); `runUpdate` lo
   pasa a su `originOf`.
   - Aporta: install registra el commit de lo instalado; update
     lo refresca —la semántica de avance se conserva—.
   - Contexto: `installUnit` recibe `source`, no `obtained` —el
     commit entra por parámetros; colección no cambia.
- [x] **La suite cubre los caminos nuevos** y la cobertura sigue al
   100 %.

## Suite de pruebas esperada

- `install user/repo` registra `origin.commit` igual al SHA que
  el spy devolvió en la resolución (O).
- `install user/repo@ref` registra el commit de esa ref (O).
- `install` desde colección registra commit + `package` del
  miembro (O).
- `install --path` produce origen `path` sin campo `commit` (B).
- `update` remoto registra el commit del árbol de esa obtención
  —distinto del previo si el spy cambia el SHA— (O).
- `update` sobre origen `path` sigue sin `commit` (B).
- Un lock sin `commit` pasa la validación y `list`, `check` y
  `update` operan —update reescribe el origen con commit— (B).
- `commit` no-string hace el lock corrupto (E).

## Revisión

- Subagente: 2026-10-12 — Aprueba
- Usuario (ejecución): 2026-10-12 — Aprueba
- Usuario (cierre): 2026-10-12 — Aprueba
