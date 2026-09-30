# Registrar el origen de la instalación en el registro

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

El registro recuerda de dónde vino cada instalación —el repositorio
`user/repo` con el ref usado o la ruta local de `--path`— para que
una operación posterior pueda reobtener el paquete sin pedir el
origen de nuevo.

## Dependencias

- Ninguna.

## Entrada

- `writeLock` y `readLock` en `src/lock.js`, el contrato del registro
  en `docs/instalador.md` («El registro») y la decisión D007 que lo
  fija.
- Las formas de origen que `install` ya acepta: `user/repo[@ref]` y
  `--path` (`src/cli.js`, `src/fetch.js`).

## Resultado esperado

- Cada entrada de paquete del registro registra su origen de
  instalación en un formato documentado: repositorio remoto con su
  ref, o ruta local.
- El campo es parte del contrato del lock documentado en
  `docs/instalador.md`; registros escritos antes de este cambio —sin
  origen— siguen siendo válidos y se tratan como «origen
  desconocido».
- La validación del lock (`isValidLock`) admite el campo sin exigirlo
  en entradas antiguas.

## Criterios de calidad

- Una instalación remota registra `user/repo` y el ref efectivo; una
  instalación `--path` registra la ruta.
- Los locks anteriores sin el campo no se consideran corruptos ni
  pierden sus entradas.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Definir en la planeación la forma del campo `origin` (o el nombre
   que se fije) y documentarlo en el contrato del registro.
2. Extender `writeLock` para persistirlo y `isValidLock` para
   admitirlo como opcional.
3. Extender la suite: instalación remota con y sin ref, instalación
   local, lock preexistente sin origen.
4. Actualizar la documentación del contrato.

## Notas

- Extender el contrato del registro es una consecuencia de D007 que
  puede merecer su propio registro de decisión; lo evalúa la
  revisión de la tarea.

## Contexto

- **Archivos similares:**
  - `src/lock.js` — `writeLock(destDir, lock, manifest, actions)`
    reescribe la entrada del paquete por completo en cada
    instalación; `isValidLock` es el modelo de «campo opcional sin
    romper locks antiguos» (`installedAt`, `f.sha256 === undefined ||
    typeof … === 'string'`).
  - `src/cli.js` — `main` invoca `writeLock` tras `executePlan`; el
    objeto `source` ya distingue `{ kind: 'path', dir }` de
    `{ kind: 'repo', spec }` —la forma del origen existe y solo hay
    que persistirla.
  - `src/fetch.js` — `parseRepoSpec` produce `{ owner, name, ref }`
    con `ref: null` cuando no se indicó referencia (rama por
    defecto); esa misma noción de «ref efectivo o ausente» es la que
    el registro debe conservar.
  - `docs/instalador.md` — la sección «El registro» documenta el
    contrato del lock que esta tarea extiende (D007).
  - `test/cli.test.js` — las instalaciones `--path` y las remotas
    con `spyFetch`/`remotePkg` son el modelo para los casos de la
    suite; los locks fabricados a mano sirven para «lock antiguo sin
    origen».
  - `docs/domains/002-instalacion.md` — la entidad «Registro (lock)»
    del lenguaje ubicuo describe los campos; el campo nuevo entra ahí.
- **Patrones:**
  - Los campos del lock se documentan en el contrato y se validan
    como opcionales cuando son añadidos: un lock escrito antes del
    campo nunca degrada a corrupto (precedente `installedAt`).
  - `writeLock` recibe lo que no puede derivar por sí mismo; el
    origen lo conoce `main` —el plan y la ejecución no lo ven—.
  - Comentarios de diseño en inglés en el código; contrato y
    documentación en español.
  - Cobertura 100 % de líneas, funciones y ramas (`npm test`).
- **Lecciones:** no existe `docs/lessons/`; `EXPERIENCIAS.md` tiene
  una entrada pendiente que aplica a esta iteración: la revisión
  independiente debe lanzarse con un subagente que pueda ejecutar
  `git` y `npm test` (perfil `subagent_general`), no de solo lectura.
- **Decisiones:**
  - **D007** — `teleprompter-lock.json` es la memoria de propiedad:
    `name`, `version`, `installedAt` y `files` por paquete; el
    origen es un campo más de la misma entrada.
  - **D011/D012** — las consultas operan sobre el directorio de
    trabajo; `list`/`check` leen lo que el registro anotó, así que el
    campo nuevo puede aparecer en su superficie si conviene.

## Conectividad

**Veredicto: conectada.**

Todo lo que la tarea asume existe con la forma esperada:
`writeLock` en `src/lock.js` es el punto único de escritura del
registro y `main` en `src/cli.js` lo invoca con todo el contexto de
la instalación —el `source` parseado ya separa `--path` de
`user/repo[@ref]`—; `isValidLock` tiene el patrón de campo opcional
que admite locks antiguos; `parseRepoSpec` conserva el ref usado o
`null`. La suite de `test/cli.test.js` ya cubre instalaciones
locales y remotas con `fetch` inyectado, y el contrato del registro
en `docs/instalador.md` es el documento que el campo nuevo extiende.

## Plan técnico

**Subsistema.** `writeLock` en `src/lock.js` es el punto único de
escritura del registro: lo invoca `main` tras `executePlan` con el
lock leído, el manifiesto y las acciones. El origen ya está
resuelto en `main` como `source` —`{ kind: 'path', dir }` o
`{ kind: 'repo', spec: { owner, name, ref } }`— y solo hay que
persistirlo en la entrada del paquete, en un formato que `update`
pueda reutilizar para reobtener el paquete. El contrato del lock
admite campos opcionales sin romper locks antiguos (precedente
`installedAt`).

**Forma del campo `origin`** (decisión de contrato, a registrar en
D014):

```json
"origin": { "type": "github", "repo": "owner/name", "ref": "v1.0.0" }
"origin": { "type": "path", "path": "/ruta/absoluta" }
```

`ref` solo aparece cuando el usuario lo indicó (`@ref` o `--ref`);
ausente significa «la rama por defecto en el momento de la
obtención». La ruta local se registra absoluta (`path.resolve`),
porque la relativa moriría con el cwd de aquella invocación y
`update` la necesita estable.

- [x] Derivar el origen en `main` y pasarlo a `writeLock`: un
  mapeo pequeño de `source` a la forma del lock —
  `{ type: 'github', repo, …ref }` o
  `{ type: 'path', path: resolve(dir) }`—, y `writeLock` lo
  persiste en la entrada del paquete como el resto de campos.
  - Aporta: el registro recuerda la procedencia sin acoplar
    `lock.js` a la gramática del CLI.
  - Contexto: `writeLock` reescribe la entrada por completo: una
    reinstalación desde otro origen simplemente actualiza el campo.
- [x] Extender `isValidLock` para admitir `origin` opcional:
  ausente es válido (locks antiguos); presente debe ser
  `{ type: 'github', repo: string, ref?: string }` o
  `{ type: 'path', path: string }`; otra forma degrada a corrupto
  como el resto del validador.
  - Aporta: el contrato crece sin invalidar la memoria existente.
- [x] Extender `test/cli.test.js` con los casos de la suite:
  origen remoto con y sin ref, origen local absoluto, lock antiguo
  sin origen, origen malformado.
  - Aporta: la cobertura 100 % y la compatibilidad hacia atrás
    verificadas.
- [x] Documentar el campo en `docs/instalador.md` («El registro»:
  ejemplo y bullets) y en el dominio
  (`docs/domains/002-instalacion.md`, entidad «Registro (lock)»).
  - Aporta: el contrato escrito refleja lo que el código persiste
    —precondición de `update` (020)—.
- [x] Registrar la decisión D014 —la forma del campo `origin` y su
  opcionalidad—.
  - Aporta: persistir un campo en el lock es una decisión costosa
    de revertir: los locks escritos ya lo contendrán; la nota de la
    tarea pide evaluarlo y el precedente D011–D013 confirma que los
    contratos nuevos se registran.

## Suite de pruebas esperada

Caso de uso: *que una operación futura reobtenga el paquete sin
pedir el origen.*

- Instalación `--path` → la entrada registra `origin.type =
  'path'` con la ruta absoluta (O).
- Instalación remota con `@ref`/`--ref` → `origin` registra `repo`
  y el `ref` usado (O).
- Instalación remota sin ref → `origin` registra `repo` sin `ref`
  —la rama por defecto— (B).
- Dos paquetes instalados desde orígenes distintos → cada entrada
  conserva el suyo (M).
- Lock escrito antes del campo —sin `origin`— → sigue siendo
  válido: `readLock` no lo degrada y las consultas lo leen igual
  (I; cubierto además por las pruebas existentes de `list`/`check`
  que fabrican locks sin origen).
- `origin` con forma no reconocida → el lock degrada a corrupto
  con su aviso, como el resto del validador (E).

## Revisión

- Subagente: 2026-09-30 — Aprueba
- Usuario: 2026-09-30 — Aprueba
