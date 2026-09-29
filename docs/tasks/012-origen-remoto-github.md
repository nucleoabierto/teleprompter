# Origen remoto `user/repo` y opción `--path`

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Redefinir la entrada del CLI para que la invocación habitual sea
`npx @nucleoabierto/teleprompter user/repo [OUT]`: el comando obtiene
el árbol del repositorio público de GitHub descargando su tarball por
HTTP —sin git ni credenciales— y lo usa como directorio del paquete
para el proceso de instalación existente. La opción `--path <dir>`
toma un directorio local como origen y en ese caso el argumento
`user/repo` no se procesa. El segundo parámetro posicional, `OUT`,
es el destino de la copia y por defecto el directorio de trabajo.

## Dependencias

- Ninguna.

## Entrada

- El contrato de comportamiento en `docs/instalador.md` —las fases de
  «La operación», «Colisiones», «El registro» y «Resultado y
  errores»— y las decisiones D005, D006, D007 y D008.
- La implementación actual en `src/cli.js`, que hoy exige
  `install <paquete> <destino>` con directorios locales.
- La sintaxis acordada: la forma corta `teleprompter user/repo [OUT]`
  es la recomendada y `install` se mantiene como alias que acepta los
  mismos argumentos; `--path <dir>` sustituye el origen remoto; la
  referencia se selecciona con `user/repo@ref` u opción equivalente
  (`--ref`), con la rama por defecto del repositorio cuando no se
  indica.

## Resultado esperado

- `teleprompter user/repo [OUT]` descarga el tarball público del
  repositorio —URL de `codeload.github.com` o equivalente—, lo
  extrae en un directorio temporal y ejecuta sobre ese árbol el flujo
  completo verificación → plan → ejecución → registro.
- `--path <dir>` usa el directorio local como origen y el argumento
  posicional `user/repo` no se procesa.
- `OUT` omitido instala sobre el directorio de trabajo.
- `install` funciona como alias de la forma corta.
- `user/repo@ref` o `--ref <ref>` seleccionan la referencia del
  tarball; sin indicación se descarga la rama por defecto del
  repositorio.
- Los errores de obtención —repositorio inexistente o privado, ref
  inexistente, fallo de red— abortan antes del plan con mensaje
  claro y un código de salida distinguible, documentado junto a los
  existentes.
- El directorio temporal de extracción se elimina al terminar,
  también en caso de error y en `--dry-run`.
- Uso, `README.md`, `docs/instalador.md` y `manual/` reflejan la
  nueva invocación.

## Criterios de calidad

- La forma corta, `install` y `--path` producen el mismo plan y
  registro que un origen local equivalente.
- La obtención usa solo HTTP público: sin git, sin credenciales; un
  repositorio inaccesible aborta antes de calcular el plan.
- `OUT` omitido equivale a `pwd`; las rutas del plan y del registro
  son coherentes con el destino efectivo.
- No quedan temporales tras la ejecución, sea cual sea el resultado.
- Cobertura de pruebas del 100 % mantenida (convención del proyecto,
  `package.json`).

## Procedimiento sugerido

1. Nuevo módulo de obtención (p. ej. `src/fetch.js`): resuelve
   `user/repo` y la referencia a la URL del tarball, lo descarga y lo
   extrae en un directorio temporal.
2. Reescribir el parseo de argumentos en `src/cli.js`: subcomando
   opcional `install`, origen posicional o `--path`, `OUT` posicional
   opcional con defecto el directorio de trabajo, y opciones
   `--ref`, `--force`, `--skip`, `--dry-run`.
3. Conectar el origen resuelto con `verifyPackage` y el resto del
   flujo sin cambios, limpiando el temporal en `finally`.
4. Añadir el código de salida de error de obtención y actualizar
   `docs/instalador.md`, `README.md` y `manual/`.
5. Probar la nueva invocación y el módulo de obtención con HTTP
   simulado, manteniendo la cobertura.

## Notas

- La investigación `docs/research/2026-09-descarga-archivos-github.md`
  resuelve la obtención: URL directa de codeload
  (`/tar.gz/{ref|HEAD}`) con el endpoint `tarball` de la API como
  fallback, y la dependencia `tar` para extraer —sanea rutas
  hostiles por defecto y hay que eliminar el directorio raíz
  `owner-repo-sha/` que envuelve el archive (`strip`)—.
- Un repositorio puede contener varios paquetes (D002); la tarea
  decide si el paquete se busca en la raíz del árbol extraído o cómo
  se localiza.

## Contexto

- **Archivos similares:**
  - `src/cli.js` — capa de invocación que la tarea reescribe:
    `parseArgs` + validación de directorios + flujo
    verificar → plan → resolver → ejecutar → registrar; `io`
    inyectable (`out`, `err`, `interactive`, `createAsker`) es la
    vía para inyectar también la obtención remota en tests.
  - `src/verify.js`, `src/paths.js` — módulos pequeños con una
    función exportada que devuelve resultados estructurados
    (`{ kind, warnings, errors }`); el módulo de obtención debe
    seguir esa forma.
  - `test/cli.test.js` — modelo de pruebas del CLI: `run(argv, io)`
    captura salida y códigos sin procesos; `writePkg` materializa
    paquetes en temporales.
  - `test/e2e.test.js` — ejercita el binario real con
    `execFileSync`; modelo para una prueba de la nueva invocación.
- **Patrones:**
  - Sin dependencias de ejecución hoy (`package.json` no declara
    ninguna); añadir `tar` sería la primera.
  - Cobertura obligatoria del 100 % sobre `src/` (`npm test`).
  - Mensajes de usuario en español; códigos de salida numerados
    (0-4) con una constante exportada por código.
  - Comentarios escasos que explican el *porqué*, no el qué.
- **Lecciones:** ninguna aplica —no existe `docs/lessons/`—.
- **Decisiones:**
  - D005 — plan completo antes de escribir; el origen remoto debe
    resolverse y extraerse antes de la verificación, sin tocar el
    destino.
  - D006 — `--force`/`--skip` excluyentes se conservan en la nueva
    sintaxis.
  - D007 — el registro se escribe en `OUT`, no en el temporal de
    extracción.
  - D008 — el cambio redefine justo la invocación `npx` que la
    decisión fija como forma de distribución.
  - D002 — un repositorio puede contener varios paquetes
    (`collection`); la tarea decide cómo se localiza el paquete en
    el árbol extraído.

## Conectividad

**Veredicto: conectada.**

Todo lo que la tarea asume existe con la forma esperada: el flujo
verificar → plan → ejecutar → registrar consume un directorio local
(`verifyPackage(pkgDir, destDir)`), así que el origen remoto solo
debe producir un directorio para conectarse; la inyección de `io`
en `main` ya es la vía de testeo y admite inyectar la descarga;
`fetch` global y `mkdtemp` están en Node 22, que `engines` exige.
Lo que falta —el módulo de obtención y la dependencia `tar`— es lo
que la propia tarea construye dentro de su alcance.

## Plan técnico

El CLI es una capa de invocación delgada: `parseArgs` valida la
línea y `main` encadena verificación → plan → colisiones →
ejecución → registro sobre dos directorios locales. El cambio
sustituye el «directorio del paquete» obligatorio por un origen
que se materializa antes de verificar: local (`--path`) o remoto
(`user/repo` descargado a un temporal). Todo lo posterior al
origen queda intacto.

- [x] Extender `parseArgs` a la nueva gramática: subcomando
  `install` opcional, opciones con valor (`--path`, `--ref`),
  origen posicional `user/repo[@ref]`, `OUT` posicional opcional
  y las flags existentes
  - Aporta: la invocación nueva es el contrato visible de la
    tarea; toda combinación inválida se rechaza aquí sin tocar
    nada
  - Contexto: `install` queda como alias de la forma corta;
    declarar `@ref` y `--ref` a la vez es error de uso; con
    `--path`, el posicional restante es `OUT` y ningún origen
    remoto se procesa
- [x] Crear `src/fetch.js`: `parseRepoSpec` + `fetchRepoTree` —
  descarga `codeload.github.com/{owner}/{repo}/tar.gz/{ref|HEAD}`
  con fallback al endpoint `tarball` de la API, y extrae a un
  temporal con `tar` (`strip: 1` por el directorio raíz
  `owner-repo-sha/`)
  - Aporta: encapsula la obtención remota como módulo inyectable
    como los demás `src/`; devuelve `{ dir, cleanup }` o error
    estructurado
  - Contexto: `docs/research/2026-09-descarga-archivos-github.md`
    fija URLs y dependencia; `fetch` se inyecta vía `io` (sin
    mocks de globals); el archivo es remoto — `tar` ya sanea
    rutas hostiles por defecto
- [x] Añadir la dependencia `tar` con `npm add`
  - Aporta: primera dependencia de ejecución del paquete;
    extracción segura en proceso sin depender del binario del
    sistema
- [x] Resolver el origen en `main`: `--path` → directorio local;
  `user/repo` → temporal con limpieza en `finally`; `OUT` →
  posicional o `process.cwd()` (`io.cwd` en tests)
  - Aporta: conecta el origen materializado con el flujo
    existente sin cambiarlo; el temporal se libera siempre,
    también en error y `--dry-run`
- [x] Nuevo código de salida `EXIT_FETCH = 5` con mensaje claro
  por causa (404/privado, red, ref inexistente)
  - Aporta: distingue «no se pudo obtener el paquete» de
    invocación inválida (4) y manifiesto inválido (1)
- [x] La raíz del árbol extraído es el directorio del paquete:
  `teleprompter.json` ausente o `collection` se rechaza por la
  verificación existente
  - Aporta: resuelve D002 sin lógica nueva — el paquete vive en
    la raíz del repo
- [x] Actualizar USAGE, `README.md`, `docs/instalador.md`
  (invocación + código 5) y `manual/`
  - Aporta: la documentación publica el contrato nuevo con
    `install` como alias
- [x] Cobertura 100 % sobre `src/` mantenida
  - Aporta: convención del proyecto (`npm test` la exige)

## Suite de pruebas esperada

CU1 instalar desde `user/repo` remoto; CU2 instalar desde
`--path`; CU3 gramática de invocación; CU4 selección de
referencia; CU5 destino y limpieza del temporal.

- `teleprompter user/repo` con descarga simulada instala en el
  directorio de trabajo — CU1 (Z)
- `teleprompter user/repo out` instala en `out` — CU1 (O)
- `install user/repo out` produce el mismo plan y registro — CU3
- `--path dir` instala el paquete local sin realizar petición
  HTTP — CU2 (O)
- `--path dir out` usa `out` como destino — CU2 (M)
- `user/repo@v1.2.0` y `--ref v1.2.0` descargan la URL con esa
  referencia — CU4 (O)
- declarar `@ref` y `--ref` a la vez → error de uso — CU4 (B)
- `user/repo` con formato inválido → error de uso — CU3 (I)
- repo inexistente o privado (404) → mensaje claro, código 5,
  nada escrito — CU1 (E)
- fallo de red durante la descarga → código 5, nada escrito —
  CU1 (E)
- ref inexistente → código 5 — CU4 (E)
- árbol sin `teleprompter.json` → código 1, nada escrito —
  CU1 (I)
- el temporal no existe tras éxito, error ni `--dry-run` —
  CU5 (B)
- `OUT` que no es directorio → error de uso (4), como hoy —
  CU5 (I)
- `--force`/`--skip`/`--dry-run` funcionan igual con origen
  remoto — CU3
- archive con ruta hostil (`../x`) no escribe fuera del
  temporal — CU1 (B)

## Desviaciones del plan

- La extracción aterriza en `{tmp}/{repo}`, no en la raíz del
  temporal: la regla del manifiesto que exige `name` igual al nombre
  del directorio sigue aplicando al origen remoto, así que el
  directorio del paquete se llama como el repositorio. Consecuencia:
  un repositorio cuyo nombre no coincide con el `name` del manifiesto
  se rechaza como manifiesto inválido —y como `name` además debe ser
  kebab-case, un repositorio con un nombre que no lo sea (`my_repo`,
  `Mi.Repo`) nunca podrá instalarse por vía remota mientras la regla
  exista.
- La forma `install <paquete> <destino>` con rutas locales deja de
  funcionar: `install` es alias de la gramática nueva y el origen
  local pasa siempre por `--path`. Es la consecuencia de la sintaxis
  acordada; la suite existente migró a `--path`.
- Se añadió `io.tmpBase` además de `io.cwd` e `io.fetch`: la base del
  temporal inyectable permite verificar la limpieza sin depender del
  listado global de `os.tmpdir()` (los archivos de test corren en
  paralelo).
- La salida gana una línea `obteniendo: owner/repo[@ref]` al inicio
  de la fase remota: sin ella la descarga sería silenciosa.

## Revisión

- Subagente: ronda 1 — Aprueba, con observaciones cerradas en la
  misma iteración: dominio `002-instalacion.md` obsoleto
  (invocación y códigos actualizados), ejemplos de salida sin la
  línea `obteniendo:` (corregidos en README y guía), `.gitignore`
  sin `node_modules/` (añadido), tests nominales ausentes para
  `--force` remoto y ref+404 (añadidos), `parseRepoSpec` aceptaba
  `.`/`..` (rechazados), ref sin validar en la URL (se rechazan
  espacios, `?`, `#`, `%` y `..`), `fetch` ausente degradaba a error
  de red (error explícito), bloque de sintaxis de la referencia
  ambiguo con las flags (reformateado). Quedan sin tratar por
  ínfimos: la distinción 404 vs. 5xx en el mensaje de obtención, la
  ausencia de timeout/tamaño máximo de descarga, y `mkdtempSync`
  fuera del `try` propaga como «error inesperado» si el FS falla.
- Usuario: 2026-09-29 — Aprueba
