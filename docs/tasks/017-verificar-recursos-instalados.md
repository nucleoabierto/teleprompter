# Verificar el estado de los recursos instalados

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Una consulta del CLI informa, por paquete instalado, el estado real de
cada recurso registrado —intacto, modificado o ausente— comparando lo
que el registro dice que se escribió con lo que el disco contiene, en
lenguaje de producto.

## Dependencias

- Ninguna (presupone el registro fijado por D007, ya implementado).

## Entrada

- La gramática del CLI en `src/cli.js` y el patrón de consulta sobre
  el directorio de trabajo fijado por `guide` (D011) y `list` (D012).
- `readLock` en `src/lock.js`, `hashPath` en `src/hash.js` y el
  contrato del registro en `docs/instalador.md` («El registro»).
- La suite de consulta en `test/cli.test.js` como modelo de pruebas.

## Resultado esperado

- `teleprompter <consulta>` (nombre fijado en la planeación;
  candidatos: `verify`, `check`, `status`) muestra por cada paquete
  instalado el estado de cada recurso registrado: intacto si el
  contenido coincide con el hash registrado, modificado si difiere,
  ausente si el destino ya no existe.
- Las entradas `skip` del registro —decisiones que no escribieron
  recurso— no se reportan; el informe responde en lenguaje de
  producto sin exponer hashes.
- Sin instalaciones o con todo intacto, la respuesta lo dice en lugar
  de quedar vacía; un registro corrupto se trata como el resto de
  lecturas del lock.
- `docs/instalador.md`, `README.md`, `manual/` y el dominio de
  instalación reflejan la consulta.

## Criterios de calidad

- La clasificación cubre los tres estados y se verifica por recurso:
  contenido idéntico, editado y borrado tras la instalación.
- La consulta opera solo sobre el directorio de trabajo, sin
  argumento de destino ni opciones, como sus hermanas.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Fijar en la planeación el nombre del comando, su gramática y el
   formato del informe, coherentes con `guide` y `list`.
2. Implementar la comparación recomputando `hashPath` sobre cada
   `target` registrado con `sha256` y clasificando el resultado.
3. Extender la suite: todo intacto, recurso modificado, recurso
   ausente, entrada `skip` no reportada, destino sin instalaciones,
   registro corrupto, rechazo de opciones y argumentos.
4. Actualizar la documentación del producto y del contrato.

## Notas

- Los recursos registrados sin `sha256` —válidos según el contrato
  del lock— no tienen referencia contra la que comparar; qué estado
  les corresponde (reportarlos como no verificables u omitirlos) lo
  decide la planeación.

## Contexto

- **Archivos similares:**
  - `src/cli.js` — `showList` y `showGuide` son el modelo de consulta
    sobre el directorio de trabajo: leen `readLock(io.cwd)`, emiten
    sus `warnings` por `out`, traducen el registro a lenguaje de
    producto y devuelven el código de salida. `parseArgs` reserva la
    primera palabra del subcomando y `USAGE` nombra toda la gramática.
  - `src/lock.js` — `readLock` devuelve `{ packages, warnings }` y
    degrada lock ausente o corrupto a «sin historia» con aviso; el
    contrato de `files` es `{ target, action, sha256? }` —`skip` va
    sin hash y `sha256` puede faltar.
  - `src/hash.js` — `hashPath` hashea archivo, enlace o árbol por
    dominios separados; lanza (ENOENT) si la ruta no existe, que es
    exactamente la señal de «ausente».
  - `test/cli.test.js` — la suite de `list` y `guide` (líneas
    380–674) es el modelo: `run(argv, { cwd })` con `stdout`/`stderr`
    capturados, lock fabricado a mano para los casos de registro
    sin instalar de verdad.
  - `docs/instalador.md` — las secciones «La consulta de la guía» y
    «La consulta del registro» son el contrato hermano; la nueva
    consulta necesita su sección gemela y una línea en la gramática
    del encabezado.
  - `manual/` — `referencia-list.md`, `referencia-guide.md`,
    `guia-de-uso.md`, `index.md` y `mkdocs.yml`: superficie de
    documentación de producto donde la consulta se registra (D009).
  - `docs/domains/002-instalacion.md` — el dominio documenta cada
    operación de consulta con su ancla; la nueva se añade junto a
    `showList`.
- **Patrones:**
  - Las consultas del CLI operan solo sobre el directorio de trabajo:
    comando propio sin `dest` ni opciones de instalación, con la
    primera palabra reservada en `parseArgs` (patrón fijado por
    `guide` y `list`).
  - La salida es lenguaje de producto: nombres, versiones y rutas; ni
    hashes ni acciones internas. Las entradas `skip` no se reportan:
    registran una omisión, no un recurso escrito.
  - «Sin instalaciones» es una respuesta con código 0, no un fallo;
    un registro corrupto añade el mismo `aviso:` que el resto de
    lecturas del lock.
  - `io` inyectable (`out`, `err`, `cwd`): la suite ejerce el CLI sin
    procesos; la cobertura exige 100 % de líneas, funciones y ramas
    (`npm test`).
- **Lecciones:** ninguna aplica —no existe `docs/lessons/` todavía—.
- **Decisiones:**
  - **D007** — `teleprompter-lock.json` registra por recurso `target`,
    acción y `sha256`: el hash anotado es la referencia contra la que
    se compara el contenido actual.
  - **D011** — `guide` fijó el subcomando de consulta sobre el
    directorio de trabajo: sin destino ni opciones, errores de
    invocación código 4.
  - **D012** — `list` replicó el patrón sobre el registro: lenguaje de
    producto, `skip` no listado, vacío como respuesta válida con
    código 0.
  - **D009** — la documentación de producto vive en `manual/` y se
    publica con MkDocs: una referencia nueva exige su página y su
    entrada en `mkdocs.yml` e `index.md`/`README.md` del manual.

## Conectividad

**Veredicto: conectada.**

Todo lo que la tarea asume existe con la forma esperada: `readLock`
en `src/lock.js` devuelve `{ packages, warnings }` con la degradación
de lock corrupto ya resuelta; `hashPath` en `src/hash.js` recomputa
el hash de archivo, enlace o árbol y lanza ENOENT cuando la ruta no
existe —la señal de «ausente»—; el contrato del registro fijado por
D007 registra `target` y `sha256` por recurso; `parseArgs` en
`src/cli.js` ya reserva subcomandos de consulta (`guide`, `list`)
como patrón a replicar, y `showList`/`showGuide` son las
implementaciones hermanas. La suite de `test/cli.test.js` cubre el
modelo de pruebas y la superficie documental (`docs/instalador.md`,
`manual/`, `docs/domains/002-instalacion.md`, `README.md`) tiene
dónde recibir la consulta.

## Plan técnico

**Subsistema.** Las consultas del CLI (`guide`, `list`) son comandos
propios que operan solo sobre el directorio de trabajo: `parseArgs`
reserva la primera palabra, una función `show*` lee
`readLock(io.cwd)`, emite sus avisos y traduce el registro a lenguaje
de producto con código 0. La novedad es la comparación: `hashPath`
recomputa el hash de cada `target` registrado y lo contrasta con el
`sha256` del lock (D007). La clasificación de deriva se extrae a un
módulo propio porque la tarea 019 (plan de actualización) la
presupone como base reutilizable.

- [x] Reservar `check` en la gramática (`parseArgs`, `USAGE`): sin
  argumentos ni opciones; cualquier extra es código 4 —patrón de
  `list`—.
  - Aporta: la consulta entra en la gramática como sus hermanas, sin
    destino ni opciones de instalación.
- [x] Crear el clasificador de deriva en un módulo nuevo
  (`src/drift.js`): por paquete del lock, omite las entradas `skip` y
  clasifica cada `target` registrado —`intacto` si el hash coincide,
  `modificado` si difiere, `ausente` si la ruta no existe (ENOENT),
  `no verificable` si no hay `sha256` registrado o la lectura falla
  por otra causa—.
  - Aporta: la memoria del registro se vuelve contrastable; el módulo
    separado deja la clasificación disponible para el plan de
    actualización de 019.
  - Contexto: `hashPath` lanza ENOENT cuando la ruta no existe —esa
    es la señal de «ausente»—; archivos, enlaces y árboles se
    verifican con el mismo digest, sin casos especiales.
- [x] Presentar el informe en `showCheck` (`src/cli.js`): avisos del
  lock, «no hay paquetes instalados» si no hay nada registrado, y por
  paquete `nombre@version` una línea `marca  target` por recurso;
  código 0 siempre —la deriva es información, no un fallo—.
  - Aporta: la superficie de producto, con las marcas en español que
    la tarea fija y sin exponer hashes.
- [x] Extender `test/cli.test.js` con el bloque de `check` según la
  suite esperada.
  - Aporta: cobertura 100 % mantenida (exigencia del script `test`).
- [x] Documentar la consulta: sección nueva en `docs/instalador.md`
  con su línea en la gramática del encabezado, párrafo en
  `README.md`, `manual/referencia-check.md` más sus entradas en
  `mkdocs.yml`, `manual/README.md`, `manual/index.md` y
  `guia-de-uso.md`, y la operación con las marcas de deriva en
  `docs/domains/002-instalacion.md`.
  - Aporta: el contrato y la documentación de producto reflejan la
    consulta, como pide el resultado esperado.
- [x] Registrar la decisión D013 —`check` como subcomando de
  verificación sobre el directorio de trabajo, sus cuatro marcas y el
  tratamiento de las entradas sin hash—.
  - Aporta: replica el patrón de D011/D012: cada palabra reservada de
    la gramática queda registrada como decisión.
  - Contexto: el formato del informe y «no verificable» para recursos
    sin referencia son las novedades que la decisión fija.

## Suite de pruebas esperada

Caso de uso: *consultar el estado real de lo instalado en el destino.*

- Sin registro → responde «no hay paquetes instalados» con código 0
  (Z).
- Un paquete con un recurso intacto → el informe muestra `intacto`
  junto a su target (O).
- Un recurso editado tras la instalación → `modificado` (O).
- Un recurso borrado tras la instalación → `ausente` (O).
- Varios paquetes y recursos → cada uno con su marca correcta,
  incluida una mezcla de los tres estados (M).
- Entrada `skip` del registro → no se reporta (B).
- Entrada sin `sha256` → `no verificable` (B).
- Recurso presente pero ilegible → `no verificable` (E).
- Ruta registrada que escapa del destino —`..` o un enlace en la
  cadena de padres— → `no verificable`, sin leer fuera del
  directorio de trabajo (E; añadida en revisión: el lock es dato no
  confiable y se revalida como en `guide`).
- Registro corrupto → aviso + «no hay paquetes instalados», código 0
  (I/E).
- Lock fabricado a mano sin instalación real → la clasificación opera
  igual (I).
- La guía gestionada (`.teleprompter/…`) también figura con su marca,
  porque está registrada en `files` (M).
- Con todo intacto, la respuesta lo dice en lugar de quedar vacía
  (Z del informe).
- La salida no expone hashes ni detalles internos (regresión de
  lenguaje de producto).
- `check` con argumentos u opciones (`check x`, `check --force`,
  `check -x`…) → código 4 con `uso:` (I/E).

## Revisión

- Subagente: 2026-09-30 — Aprueba (2ª ronda; la 1ª solicitó la
  revalidación de rutas registradas)
- Usuario: 2026-09-30 — Aprueba
