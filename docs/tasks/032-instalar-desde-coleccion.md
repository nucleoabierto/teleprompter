# Instalar el paquete seleccionado de una colección

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Materializar el paso nuevo de `install`: cuando el origen —local
(`--path`) o remoto (`user/repo`)— describe una colección, el CLI
acepta la selección definida en la tarea 031, resuelve el manifiesto
de colección a los paquetes elegidos e instala cada uno con el
pipeline existente. Deja de rechazarse el manifiesto de colección
como «no instalable».

## Dependencias

- Tarea 031 — el comportamiento definido: gramática de selección,
  caso sin selección y cardinalidad.

## Entrada

- `src/manifest.js` — validación del manifiesto; hoy rechaza
  `collection: true` como instalable.
- `src/cli.js`, `src/fetch.js` — gramática del CLI y obtención: el
  tarball del repo completo ya se extrae en local, así que las rutas
  del índice resuelven dentro del árbol descargado.
- `src/plan.js`, `src/execute.js` — pipeline de instalación que ya
  instala un paquete a la vez.
- Definición de la tarea 031.

## Resultado esperado

- `install` acepta un origen de colección con la selección
  documentada e instala el/los paquete(s) elegido(s) como una
  instalación normal: plan completo, resolución de colisiones,
  registro en el lock.
- El comportamiento sin selección y los errores del índice (rutas
  inexistentes, paquetes inválidos) responden como se definió.

## Criterios de calidad

- Instalar desde una colección local (`--path`) y remota produce el
  mismo resultado que instalar cada paquete por separado: mismos
  targets, mismo plan por paquete, mismo registro.
- Un índice con rutas inválidas o un paquete mal formado aborta con
  error claro sin escribir nada.
- La suite cubre: colección válida, sin selección, selección de uno
  y de varios, selección inexistente, índice inválido.

## Procedimiento sugerido

1. Planear la implementación (sub-flujo de desarrollo: contexto,
   plan técnico, suite esperada).
2. Extender la resolución del origen: detectar colección, aplicar
   selección, producir la lista de paquetes a instalar.
3. Iterar el pipeline por paquete seleccionado, agregando planes.

## Contexto

- Archivos similares:
  - `src/cli.js` — la invocación completa: `splitArgs` separa
    posicionales, flags y opciones con valor (`VALUE_OPTIONS`, hoy
    un solo valor por opción y compartido con `update`);
    `runInstall` ejecuta el pipeline obtener → verificar → plan →
    colisiones → ejecutar → registrar; `originOf` produce el
    `origin` del lock; `obtainPackage` entrega el `pkgDir` raíz
    del repo o el `--path` local.
  - `src/manifest.js` — `loadManifest` valida paquetes:
    `checkCollection` rechaza `collection: true`; `checkName` fija
    nombre ≡ basename del directorio; los validadores son
    independientes (`VALIDATORS`).
  - `src/verify.js` — `verifyPackage` envuelve `loadManifest` +
    `checkRequires` en un resultado por `kind`.
  - `src/lock.js` — `isValidOrigin` no restringe claves extra: un
    campo `package` no invalida el lock (033 lo tipará).
  - `test/cli.test.js`, `test/manifest.test.js` — la suite se
    ejercita por `main(argv, io)` inyectable y fixtures en tmp.
- Patrones:
  - Errores por `kind`/código de salida (`EXIT_USAGE`,
    `EXIT_MANIFEST`…), mensajes en español por `err()`, avisos por
    `out()`.
  - El pipeline por paquete ya es un bloque reutilizable dentro de
    `runInstall` (`try`/`finally` con `cleanup` del fetch).
  - `checkName` garantiza que el basename de cada `path` del índice
    es el nombre del paquete: la resolución nombre → ruta no exige
    leer el manifiesto del miembro.
- Dominio: `docs/domains/001-paquete.md` — colección como
  contenedor puro; el paquete es la unidad instalable.
- Producto: `docs/especificacion-paquete.md` (sección Colecciones)
  — el manifiesto de colección admite `name`, `description`,
  `license`, `author`, `metadata`, `format` + `collection` y
  `packages`; campos de paquete son error; `manual/referencia-install.md`
  describirá la gramática nueva (su actualización es de la tarea
  035).
- Lecciones: `docs/lessons/` sin notas consolidadas;
  `EXPERIENCIAS.md` — acotar globs a archivos propios (aplica a la
  ejecución, no al código).
- Decisiones:
  - D019 — la definición completa a materializar: `--package`
    repetible, error con índice sin selección, unidades secuenciales
    atómicas, `origin.package`, bordes (duplicados, anidamiento,
    miembro inválido, `update` sin `--package`).
  - D002 — colección = contenedor puro con índice de rutas.
  - D005 — plan completo o aborto total por unidad.
  - D006 — política de colisiones `--force`/`--skip`/interactivo,
    aplica a cada unidad.
  - D014 — forma del `origin` que `package` extiende.

## Conectividad

Veredicto: **conectada**.

- El fetch remoto (`src/fetch.js`) ya descarga y extrae el repo
  completo en un tmp dir: las rutas del índice resuelven dentro
  del árbol obtenido sin trabajo adicional de obtención.
- `splitArgs` admite opciones con valor pero rechaza repeticiones:
  `--package` repetible exige extenderlo (multi-valor) o una
  opción acumulativa — extensión localizada, sin refactor.
- `runInstall` itera una vez sobre el pipeline; la selección
  múltiple lo invoca en bucle por paquete resuelto — no requiere
  cambios en `plan.js`, `execute.js` ni `lock.js`.
- `loadManifest` no tiene hoy un camino para manifiestos de
  colección: hay que añadir el validador del índice
  (`loadCollectionManifest` o equivalente). Es el único hueco de
  infraestructura y es del tamaño de esta tarea.

## Plan técnico

**Subsistema:** `install` resuelve el origen a un `pkgDir` (path
local o repo extraído) y corre un pipeline de paquete único
(verificar → plan → colisiones → ejecutar → lock). El paso nuevo
se inserta entre obtención y verificación: si el manifiesto raíz
es de colección, la selección resuelve a directorios miembro y el
pipeline corre una vez por miembro, secuencialmente.

- [x] Extender `splitArgs`: `--package` como opción de valor
  acumulable
  - Aporta: la gramática de D019 sin tocar posicionales; `install`
    la acepta, `update` la rechaza (uso)
  - Contexto: `VALUE_OPTIONS` rechaza hoy la repetición; hay que
    distinguir opciones multi-valor o acumular en lista
- [x] Añadir el validador de manifiesto de colección en
  `manifest.js` (`loadCollectionManifest` o equivalente)
  - Aporta: el índice validado como única fuente nombre → ruta;
    `collection: true`, `packages` como lista de `{path}` seguras,
    campos de paquete prohibidos, `name` cosmético sin check de
    basename
- [x] Resolver la selección a unidades `{ nombre, memberDir }`
  - Aporta: el paso nuevo del flujo — sin `--package` imprime el
    índice (basename, versión y descripción leídas del manifiesto
    del miembro; los ilegibles se marcan) y aborta con
    `EXIT_USAGE`; nombre ausente → error con disponibles;
    basename duplicado → colección ambigua; entrada a otra
    colección → error al seleccionarla (cae por el rechazo de
    manifiesto existente)
  - Contexto: `basename(path)` ≡ `name` por `checkName`; no hace
    falta leer manifiestos para la existencia
- [x] Reorganizar `runInstall`: obtener una vez, detectar
  colección (peek al manifiesto raíz), iterar el pipeline por
  unidad
  - Aporta: cada paquete instalado como unidad independiente —su
    verify, plan, settleConflicts, executeAndReport, guía—
  - Contexto: las unidades comparten `pkgDir` raíz y `destDir`;
    un fallo en la unidad N deja instaladas las N-1 (D005 por
    unidad); con `--dry-run` se imprimen todos los planes y nada
    se escribe; `--force`/`--skip` aplican a todas
- [x] Registrar `origin.package` en las unidades de colección
  - Aporta: el lock queda re-resoluble por nombre (D019); `origin`
    guarda la raíz de la colección + el nombre, no el memberDir
  - Contexto: `isValidOrigin` no restringe claves extra; el tipado
    del campo es trabajo de 033
- [x] Rechazar `--package` con origen no-colección y en `update`;
  actualizar `USAGE`
  - Aporta: los bordes de D019 a nivel de gramática

## Suite de pruebas esperada

- **Instalación desde colección** (caso de uso principal)
  - colección local con `--package` instala como el paquete
    directo: mismos targets, mismo plan, misma entrada de lock (O)
  - colección remota (`user/repo`) con `--package` produce el
    mismo resultado que la local (O)
  - `--package a --package b` instala ambos secuencialmente en el
    orden de los flags (M)
  - `--package` repetido con el mismo nombre instala una sola
    vez (M)
  - el lock registra `origin.package` por unidad, con
    `type`/`repo`/`ref` o `path` de la raíz (I)
- **Sin selección** (caso de uso de descubrimiento)
  - colección sin `--package` aborta sin escribir imprimiendo el
    índice con nombre, versión y descripción (O)
  - colección de un solo paquete sin `--package` igualmente
    aborta —no hay selección implícita— (Z→O)
  - índice con miembro de manifiesto inválido lo muestra marcado,
    no aborta (E)
- **Errores de selección** (caso de uso de bordes)
  - `--package` con nombre ausente → error que lista los
    disponibles, nada escrito (E)
  - `--package` con origen que es paquete (no colección) →
    error (E)
  - `--package` en `update` → error de uso (E, I)
  - dos entradas del índice con igual basename → colección
    ambigua, error (B, E)
  - miembro seleccionado con manifiesto inválido → sus errores
    de manifiesto, nada escrito (E)
  - entrada del índice que apunta a otra colección → error al
    seleccionarla (E)
  - ruta del índice inexistente seleccionada → error claro (E)
- **Bordes de ejecución** (caso de uso multi-unidad)
  - fallo en la unidad N deja instaladas las N-1 anteriores (E)
  - `--dry-run` con varios paquetes imprime todos los planes y
    no escribe nada (B)
  - `--force`/`--skip` se aplican a todas las unidades (B)
- **Regresión**: instalación de paquete simple sin `--package`
  —suite actual en verde— (sin letra)

## Revisión

- Subagente: 2026-10-04 — Aprueba
- Usuario: 2026-10-04 — Aprueba
