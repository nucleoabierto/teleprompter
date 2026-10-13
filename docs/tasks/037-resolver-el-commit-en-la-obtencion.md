# Resolver el commit exacto en la obtención remota

## Estado

[ ] Pendiente | **[~] En progreso** | [r] En revisión | [x] Completada | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

La obtención remota devuelve, junto al contenido descargado, el
commit exacto que resolvió la referencia pedida —un SHA de 40
caracteres— tanto cuando la ref viene explícita como cuando está
ausente y se sirve la rama por defecto.

## Dependencias

- Ninguna.

## Entrada

- `src/fetch.js` endurecido (timeouts por endpoint, límite de
  descarga, diagnósticos HTTP diferenciados) y sus consumidores en
  `src/cli.js`.
- El sondeo de la propuesta: el SHA se obtiene de
  `api.github.com/repos/{o}/{r}/commits/{ref}`; sin `ref`, el mismo
  endpoint sobre la rama por defecto (obtenible del repo o del
  redirect del tarball, que expone `refs/heads/<rama>`).

## Resultado esperado

- El resultado de la obtención remota lleva el SHA resuelto
  disponible para quien la invoca.
- La resolución corre bajo los mismos presupuestos y diagnósticos
  del fetch endurecido: timeout propio y errores específicos.
- Cuando la ref ya es un SHA completo, no se repite la resolución:
  el dato se devuelve tal cual.

## Criterios de calidad

- `user/repo` sin ref resuelve el SHA real de la rama por defecto
  en ese momento (verificable contra la API de GitHub).
- `user/repo@<ref>` resuelve el SHA de esa ref —rama, tag o
  prefijo— y `user/repo@<sha-completo>` no dispara la resolución.
- Una ref inexistente produce el diagnóstico «no encontrado», no un
  error genérico.
- La suite cubre los caminos nuevos y la cobertura sigue al 100 %.

## Procedimiento sugerido

1. Localizar el punto del fetch donde la ref se traduce a URL de
   descarga y decidir dónde encaja la llamada de resolución: antes
   de la descarga, compartiendo sus presupuestos.
2. Implementar la resolución ref → SHA contra el endpoint de
   commits, con su timeout y sus diagnósticos; reconocer el SHA
   completo como resuelto sin llamada.
3. Propagar el SHA en el resultado de la obtención hasta el
   consumidor, sin registrar nada todavía.
4. Cubrir con tests los casos: sin ref, ref concreta, SHA completo,
   ref inexistente y fallo de la llamada de resolución.

## Notas

- La resolución añade una llamada a la API de GitHub por obtención;
  quienes instalen muchos paquetes en ráfaga comparten el límite de
  peticiones, ya diagnosticado como «acceso denegado o límite».

## Contexto

- **Archivos similares:** `src/fetch.js` es el único módulo del
  subsistema de obtención —la tarea lo extiende en el mismo
  archivo—; `test/fetch.test.js` modela los consumidores con
  `spyFetch`/`okResponse`, patrón que los tests nuevos siguen.
- **Patrones:** el resultado se comunica como `{ ok, ... }` con
  diagnósticos específicos en español —nunca excepciones hacia el
  consumidor—; cada endpoint tiene su timeout con
  `AbortSignal.timeout(timeoutMs)`; el fetch real lo inyecta el
  llamador (`io.fetch`), lo que hace el subsistema testeable sin
  red; las URLs se construyen con `encodeURIComponent` sobre
  owner/repo.
- **Dominio:** `docs/domains/002-instalacion.md` describe el
  registro (`origin` como memoria de dónde vino la instalación) —
  la tarea añade la procedencia que ese origen necesitará.
- **Producto:** `manual/001-instalar-un-paquete.md` y
  `referencia-install.md` describen `install user/repo[@ref]` —
  el comportamiento de obtención cambia por dentro, no en la
  invocación.
- **PRD:** `docs/prd/007-pin-de-obtencion-remota.md` — CU-1
  (instalar con procedencia) es el caso que esta tarea habilita:
  el commit resuelto debe estar disponible tras la obtención, con
  o sin ref explícita.
- **Lecciones:** ninguna aplica a la implementación; las
  existentes tocan el cierre (revisión por subagente con
  ejecución, escritura viva en docs).
- **Decisiones:** `D014-campo-origin-del-registro.md` — el origen
  registrado es la memoria de la procedencia; esta tarea produce
  el dato que el campo ganará en la 038.
  `D007-registro-teleprompter-lock.md` — la forma del registro
  que consumirá el resultado.

## Conectividad

**Conectada.**

Todo lo que la tarea asume existe con la forma esperada:

- `fetchRepoTree` en `src/fetch.js` devuelve `{ ok, dir, cleanup }`
  o `{ ok: false, error }` —un campo `commit` nuevo en el
  resultado no rompe la forma ni a sus consumidores—.
- `parseRepoSpec` ya produce `{ owner, name, ref }` con `ref`
  anulable y valida refs —`user/repo@<sha>` se acepta hoy como
  ref plausible—.
- El fetch inyectable (`io.fetch`, `spyFetch` en tests) permite
  añadir la llamada de resolución y probarla sin red.
- El endpoint de resolución
  `api.github.com/repos/{o}/{r}/commits/{ref}` está verificado
  por el sondeo de la propuesta: devuelve el SHA directamente.
- `obtainPackage` en `src/cli.js` es el único consumidor del
  resultado y el punto de propagación natural hacia el registro.

## Plan

`src/fetch.js` es el subsistema de obtención: `parseRepoSpec`
normaliza la especificación y `fetchRepoTree` descarga el tarball
público por ref con presupuestos endurecidos, devolviendo el árbol
extraído. El cambio encaja antes de la descarga: la ref se
resuelve a su SHA contra la API de commits, la descarga se ancla
a ese SHA y el valor viaja en el resultado.

- [x] Resolver ref → SHA: SHA completo —`/^[0-9a-f]{40}$/i`— se
  toma por resuelto sin llamada; en caso contrario,
  `GET api.github.com/repos/{o}/{r}/commits/{ref ?? 'HEAD'}` con
  timeout propio y el fetch inyectado. Diagnósticos: 404/422 →
  referencia no encontrada, 401/403 → acceso denegado o límite,
  5xx → error de servidor, timeout/red → contacto.
  - Aporta: el ancla de la procedencia, antes de tocar la
    descarga.
  - Contexto: `commits/HEAD` devuelve la cabeza de la rama por
    defecto —verificado por sondeo—; no hace falta resolver la
    rama antes. Una ref inexistente responde 422 «No commit
    found», no 404.
- [x] Anclar la descarga al SHA resuelto: `repoUrls` usa el
  commit en lugar de la ref pedida.
  - Aporta: el árbol descargado es exactamente el commit
    propagado —elimina la carrera en que la rama se mueva entre
    resolver y descargar—.
  - Contexto: la descarga por SHA está verificada —codeload 200,
    API tarball 302—.
- [x] Devolver `commit` en el resultado de `fetchRepoTree` y
  propagarlo por `obtainPackage` hasta su llamador, sin registrar
  nada —el registro es la tarea 038—.
  - Aporta: el dato queda al alcance del registro sin cambiar el
    comportamiento visible del comando.
- [x] Cubrir la resolución en la suite con `spyFetch`
  encadenando resolución y descarga.
  - Aporta: los caminos nuevos quedan cubiertos y la cobertura
    sigue al 100 %.

## Suite

Expectativas sobre el comportamiento del sistema, trazadas a
CU-1 de `docs/prd/007-pin-de-obtencion-remota.md` —instalar con
procedencia registrada—.

- La obtención sin ref resuelve la cabeza de la rama por defecto
  y la devuelve como commit. (O)
- La obtención con ref —rama o tag— resuelve y devuelve el
  commit de esa ref. (O)
- La obtención con SHA completo no realiza llamada de resolución
  y devuelve ese SHA. (B)
- La descarga del árbol se pide por el commit resuelto, no por
  la ref pedida. (I)
- Una ref inexistente produce el diagnóstico «no encontrado»,
  no un error genérico. (E)
- Un fallo o timeout de la llamada de resolución aborta la
  obtención con su diagnóstico —no se descarga sin ancla—. (E)
- Una respuesta de resolución sin SHA válido produce «respuesta
  inesperada». (E)
- El consumidor `obtainPackage` recibe el commit en su
  resultado. (I)

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
