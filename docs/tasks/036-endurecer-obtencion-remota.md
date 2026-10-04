# Endurecer la obtención remota

## Estado

[ ] Pendiente | [~] En progreso | [r] En revisión | **[x] Completada** | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

Cerrar los residuales de la revisión de la tarea 012 en la obtención
remota (`src/fetch.js`): la descarga carece de timeout y de tamaño
máximo, los errores HTTP no distinguen «no encontrado» de «error de
servidor», y un fallo del sistema de archivos propaga como «error
inesperado». La línea «Endurecimiento de la obtención remota» del
roadmap (Now) existe porque `update`, la revisión de desactualizados
y la reproducción del destino multiplican las invocaciones del fetch:
su fragilidad es un costo creciente.

## Dependencias

- Ninguna

## Entrada

- Residuales registrados en la revisión de `docs/tasks/012-origen-remoto-github.md`:
  distinción 404 vs. 5xx en el mensaje de obtención, ausencia de
  timeout/tamaño máximo de descarga, y `mkdtempSync` fuera del `try`.
- `src/fetch.js` y su suite de pruebas en `test/`.

## Resultado esperado

- `fetchRepoTree` aborta descargas que exceden el timeout o el tamaño
  máximo con errores propios y diagnóstico claro.
- El mensaje de obtención distingue *inalcanzable*, *no encontrado*
  (404) y *error de servidor* (5xx).
- Un fallo del sistema de archivos al crear el directorio temporal no
  propaga como «error inesperado».
- Suite de pruebas cubre cada residual; el camino feliz queda
  inalterado.

## Criterios de calidad

- `npm test` en verde con pruebas nuevas para: timeout, tamaño
  excedido, 404 frente a 5xx frente a inalcanzable, y fallo de FS.
- Los errores nuevos son diagnósticos propios, no excepciones
  propagadas.
- Sin cambios de comportamiento en descargas correctas.

## Procedimiento sugerido

1. Recopilar contexto: `src/fetch.js`, sus consumidores en `cli.js` y
   sus tests.
2. Evaluar conectividad de lo asumido.
3. Planear la implementación con su suite de pruebas esperada.
4. Ejecutar el plan aprobado.

## Notas
- El rechazo del cuerpo (`arrayBuffer`) ganó su propio diagnóstico —«la descarga falló» / «tiempo máximo excedido»— en lugar de caer en «no se pudo extraer»: antes compartía el try de extracción y un corte a mitad de descarga se diagnosticaba como tar corrupto. Refinamiento dentro del espíritu del plan, no desviación.


## Contexto

- **Archivos similares:** `src/fetch.js` —el módulo a endurecer,
  ~85 líneas: `parseRepoSpec`, `repoUrls` (codeload + API como
  respaldo) y `fetchRepoTree`—; `test/fetch.test.js` —suite con
  `spyFetch`/`okResponse`/`notFound` como modelo de las pruebas
  nuevas—; `src/cli.js` —`obtainPackage` (líneas ~261-274) es el
  único consumidor: traduce `fetched.error` a `error de obtención:`
  con `EXIT_FETCH` (5).
- **Patrones:** el `fetch` lo inyecta el llamador (`io.fetch`) —las
  pruebas no tocan red real—; el resultado es `{ ok, dir, cleanup }`
  o `{ ok: false, error }` con diagnóstico en español; el directorio
  temporal se libera en todo camino de fallo (`cleanup()` antes de
  cada `return`); la sanitización del tar es la frontera de
  seguridad; los errores del módulo son mensajes, no excepciones.
- **Dominio:** `docs/domains/002-instalacion.md` —la fase «obtener»
  del pipeline y el código de salida 5; las distinciones nuevas
  siguen siendo «error de obtención».
- **Producto:** `manual/referencia-install.md` (tabla de códigos) y
  `manual/referencia-update.md` —el código 5 cubre hoy
  «repositorio inaccesible, referencia inexistente o archivo
  corrupto»; las distinciones nuevas son matices del mismo código.
- **PRD:** no aplica —tarea suelta sin épica.
- **Lecciones:** ninguna aplica —`docs/lessons/` vacío; las
  experiencias pendientes de `EXPERIENCIAS.md` no tocan el fetch.
- **Decisiones:** ninguna rige el fetch directamente —el índice de
  decisiones (D001–D019) no declara decisión sobre obtención
  remota; los límites elegidos serán la primera.

## Conectividad

**Veredicto: conectada.**

Todo lo que la tarea asume existe en el codebase: `fetchRepoTree`
recibe el `fetch` inyectado —extender la llamada con `{ signal }` es
absorbible y los mocks de la suite ignoran argumentos extra—; las
respuestas ya exponen `ok`/`status` en producción y en los tests, así
que distinguir 404 de 5xx no requiere infraestructura nueva; el
tamaño se controla contra `content-length` antes de leer y contra el
buffer tras leer, ambos disponibles en la abstracción actual; y
mover `mkdtempSync` dentro del perímetro de error es local al
módulo. Las pruebas no necesitan red real: el spy inyectado puede
simular timeout (rechazo), tamaño (cabecera o buffer grande) y cada
clase de estado HTTP.

## Plan técnico

`fetchRepoTree` crea el directorio temporal, prueba codeload y luego
la API, bufferiza el tarball y extrae —devolviendo `{ ok, dir,
cleanup }` o `{ ok: false, error }` con diagnóstico en español—. El
endurecimiento actúa en tres frentes dentro del mismo módulo, sin
tocar `cli.js`: los errores siguen saliendo como `error de
obtención: …` con código 5.

- [x] Opciones de límite y señal de aborto en `fetchRepoTree`:
      `{ timeoutMs, maxBytes }` con defaults (~60 s, ~50 MB) y
      `signal` pasado como segundo argumento a `fetchImpl`
  - Aporta: la base del endurecimiento sin romper el contrato —los
    mocks de la suite ignoran el argumento extra
  - Contexto: `AbortSignal.timeout` existe en el Node soportado
    (Node 24 en CI)
- [x] Timeout por petición: cada endpoint tiene su propio
      presupuesto; un timeout cuenta como fallo y permite probar el
      siguiente —si todas las peticiones mueren por tiempo, el
      diagnóstico dice «tiempo máximo excedido»
  - Aporta: una descarga colgada deja de bloquear para siempre, con
    diagnóstico que distingue la causa
  - Contexto: el fallback codeload→API ya existe; conservarlo —que
    codeload agote no dice nada de la API
- [x] Límite de tamaño: rechazar antes de leer si `content-length`
      lo excede, y tras leer si el buffer lo excede
  - Aporta: un tarball desproporcionado aborta con diagnóstico
    propio antes de extraer
  - Contexto: la abstracción inyectada devuelve `arrayBuffer` —no
    hay streaming—; el chequeo doble (cabecera + buffer) cubre los
    dos casos sin cambiar el contrato
- [x] Errores HTTP diferenciados: clasificar los estados recibidos —
      todos 404 → «no encontrados»; algún 5xx → «error del
      servidor»; 401/403 → «acceso denegado o límite de
      peticiones»; resto → mensaje con el código
  - Aporta: el residual «404 vs 5xx» de la 012; un repo privado
    (403) deja de disfrazarse de «no encontrado»
  - Contexto: se conserva la semántica de probar ambos endpoints; la
    clasificación mira el conjunto de respuestas, no la última
- [x] `mkdtempSync` dentro del perímetro de error: un fallo de FS al
      crear el temporal devuelve `{ ok: false, error }`
  - Aporta: el tercer residual; coherente con el contrato del módulo

## Suite de pruebas esperada

Sin PRD (tarea suelta) — casos derivados del objetivo: la obtención
remota con presupuestos.

- **Timeout:** una petición que agota el tiempo permite probar el
  siguiente endpoint y tener éxito (E); si todas mueren por tiempo,
  el error menciona el tiempo máximo (E)
- **Tamaño:** `content-length` mayor que el límite → error de tamaño
  sin leer el cuerpo (B); cuerpo sin cabecera que excede el límite →
  error de tamaño tras leer (E); cuerpo exactamente en el límite →
  éxito (B)
- **HTTP diferenciado:** ambos endpoints 404 → «no encontrados»
  (regresión) (E); respuesta 5xx → «error del servidor», distinto de
  no-encontrado (E); 401/403 → «acceso denegado» (E); estado no
  contemplado → mensaje con el código (E)
- **FS:** fallo al crear el temporal → `{ ok: false }` con
  diagnóstico, sin excepción propagada (E)
- **Regresión:** descarga feliz, fallback, ref en URL, tar corrupto,
  entrada hostil — la suite actual en verde

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: 2026-10-04 — Aprueba
- Subagente — Aprueba (verificación empírica completa: fallback, cleanup en todo camino nuevo, precedencia de estados, defaults, content-length malformado, timeoutMs=0; 2 nits cerrados en la misma iteración —«HTTP undefined» con respuesta sin status y «tiempo máximo» atribuido al conjunto—; 2 nits aceptados: recuento de pruebas del prompt y opciones no expuestas en cli.js)

