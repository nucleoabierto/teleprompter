# Listar los paquetes instalados

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Una consulta del CLI muestra los paquetes instalados en el repositorio
destino —nombre, versión, fecha de instalación y recursos escritos—
leyendo el registro, en lenguaje de producto y sin que el usuario abra
`teleprompter-lock.json`.

## Dependencias

- Ninguna.

## Entrada

- La gramática del CLI en `src/cli.js` y el patrón de consulta sobre el
  directorio de trabajo que la tarea 015 introdujo con `guide` (D011).
- `readLock` en `src/lock.js` y el contrato del registro en
  `docs/instalador.md` («El registro»).
- La suite de consulta en `test/cli.test.js` como modelo de pruebas.

## Resultado esperado

- `teleprompter list` (o el nombre que la planeación fije) muestra una
  entrada por paquete instalado con nombre, versión, fecha y recursos
  registrados; sin opciones ni argumento de destino.
- Sin instalaciones registradas, la respuesta lo dice en lugar de
  fallar ni quedar vacía; un registro corrupto se trata como el resto
  de lecturas del lock.
- `docs/instalador.md`, `README.md`, `manual/` y el dominio de
  instalación reflejan la consulta.

## Criterios de calidad

- La consulta responde nombre, versión, fecha y recursos por paquete
  sin exponer hashes ni acciones internas.
- El comportamiento no depende del origen con que se instaló (remoto o
  `--path`): lee solo el registro del directorio de trabajo.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Fijar en la planeación el nombre del comando, su gramática y el
   formato de salida, coherentes con `guide`.
2. Implementar la consulta leyendo el registro.
3. Extender la suite: listado con uno y varios paquetes, destino sin
   instalaciones, registro corrupto, rechazo de opciones y argumentos.
4. Actualizar la documentación del producto y del contrato.

## Notas

- El campo `personalization` del registro puede señalarse por paquete
  si aporta al usuario saber que hay guía consultable; lo decide la
  planeación.

## Contexto

- **Archivos similares:**
  - `src/cli.js` — `parseArgs` define la gramática y ya tiene un
    comando de consulta hermano: `guide [<paquete>]`, que opera
    sobre `io.cwd` sin destino ni opciones (D011). `showGuide` es
    el modelo de lectura del registro: `readLock(io.cwd)`, avisos
    por `out`, errores de resolución como código 4. `USAGE` es la
    línea que todo error de invocación devuelve.
  - `src/lock.js` — `readLock(destDir)` devuelve
    `{ packages, warnings }`; cada entrada guarda `version`,
    `installedAt`, `files` (`target`, `action`, `sha256?`) y
    `personalization?`. Un lock ausente o corrupto degrada a
    paquetes vacíos con aviso, nunca a crash.
  - `test/cli.test.js` — el helper `run(argv, { cwd })` invoca
    `main` sin procesos; `writePkg`/`validManifest`/`guidePkg`
    son las fixtures; el bloque «entrega y consulta de la guía»
    (tests de `guide`) es el modelo de suite de consulta.
  - `docs/instalador.md` — «El registro» fija el contrato que la
    consulta lee; «La consulta de la guía» es la sección hermana
    donde documentar la nueva consulta.
  - `manual/referencia-guide.md` — formato de una página de
    referencia de subcomando: invocación, comportamiento y tabla
    de errores; la nueva consulta necesita su página gemela y su
    entrada en `mkdocs.yml`, `manual/README.md`,
    `manual/index.md` y `manual/guia-de-uso.md`.
  - `README.md` — la sección «Uso» menciona `guide`; `list` se
    presenta junto a ella.
- **Patrones:**
  - El CLI es capa de invocación delgada: `parseArgs` → despacho
    por comando → salida por líneas en español vía `out`/`err`
    inyectables → código de salida. Los comandos de consulta
    operan solo sobre el directorio de trabajo y rechazan
    opciones y argumentos de más con `EXIT_USAGE` + `USAGE`.
  - Cada palabra de comando (`install`, `guide`) queda reservada
    en la gramática; `list` seguirá la misma regla.
  - La lectura del lock nunca confía en el dato: corrupción se
    trata como «sin historia» con aviso (la consulta no revalida
    rutas porque no lee archivos registrados, solo los imprime).
  - Cobertura del 100 % sobre `src/` exigida por `npm test`;
    pruebas de comportamiento por módulo en `test/`.
- **Lecciones:** ninguna aplica —no existe `docs/lessons/`—.
- **Decisiones:**
  - D007 — el registro es la fuente que la consulta lee:
    `packages` indexado por nombre con `version`, `installedAt`,
    `files` y `personalization?`.
  - D011 — el patrón de subcomando de consulta sobre el
    directorio de trabajo que la nueva consulta replica: sin
    `dest`, sin opciones de instalación, errores de invocación
    con código 4.
  - D009 — la documentación de producto vive en `manual/` y se
    publica con MkDocs: una página nueva exige entradas en
    `mkdocs.yml`, `manual/README.md` e `manual/index.md`.
  - D008 — el CLI es JavaScript ejecutable vía `npx`; contexto
    de distribución, sin exigencia adicional.
- **Vacío detectado / punto abierto:** el nombre del comando
  (`list` es lo esperado), el formato exacto de salida por
  paquete y si se señala la presencia de `personalization` quedan
  por fijar; el plan los propone al usuario junto al resto.

## Conectividad

**Veredicto: conectada.**

Todo lo que la tarea asume existe: `parseArgs` en `src/cli.js` ya
despacha un comando de consulta hermano (`guide`) que opera sobre
`io.cwd` sin destino ni opciones, `readLock` en `src/lock.js`
devuelve `{ packages, warnings }` con `version`, `installedAt`,
`files` y `personalization?` por paquete, el lock se escribe en
cada instalación desde la tarea 010, el harness `run(argv, { cwd })`
de `test/cli.test.js` ejerce el CLI sin procesos y la superficie
documental (`docs/instalador.md`, `README.md`, `manual/`,
`mkdocs.yml`, dominio 002) está localizada. La única pieza nueva es
el propio comando de consulta, absorbible dentro del alcance de la
tarea sobre la gramática de `parseArgs`.

## Plan técnico

**Entendimiento.** `src/cli.js` es la capa de invocación delgada:
`parseArgs` resuelve la gramática —la forma `install` y el comando
de consulta `guide`— y `main` despacha el resultado a los
manejadores y a los códigos de salida, con la salida por líneas en
español a través de `out`/`err` inyectables. `readLock(io.cwd)`
devuelve `{ packages, warnings }`; cada paquete guarda `version`,
`installedAt`, `files` y `personalization?`. Esta tarea añade un
comando hermano de `guide`: `teleprompter list`, una consulta de
solo lectura sobre el directorio de trabajo que traduce el registro
a lenguaje de producto.

**Decisiones de diseño (aprobadas por el usuario):**

- `teleprompter list` no admite argumentos ni opciones: cualquier
  operando u opción es `EXIT_USAGE` con `USAGE`. La palabra queda
  reservada en la gramática, como `guide` (D011), y se registra
  como decisión propia —una palabra de la gramática es costosa de
  retirar—.
- La salida presenta una entrada por paquete:
  `nombre@version — instalado <installedAt>` seguida de los
  `target` registrados que se escribieron, uno por línea indentada.
  No se exponen hashes ni acciones internas.
- Las entradas con `action: 'skip'` no se listan: registran una
  omisión, no un recurso escrito; las entradas sin `action`
  —válidas según `isValidLock`— sí se muestran.
- Un paquete con `personalization` añade la línea
  `guía: teleprompter guide <nombre>`: señala que hay guía
  consultable y enseña el comando.
- Una entrada sin `installedAt` —el lock lo admite— se muestra sin
  la parte de fecha.
- Sin instalaciones, `list` responde `no hay paquetes instalados`
  por stdout con código `0` —respuesta explícita, no fallo ni
  silencio—; un lock corrupto añade el `aviso:` previo y la misma
  respuesta.
- `USAGE` pasa a incluir `| list`.

**Acciones:**

- [x] Reconocer `list` en `parseArgs` como comando sin operandos ni
  opciones, y actualizar `USAGE`
  - Aporta: la palabra reservada de la gramática que da entrada a
    la consulta, hermana de `guide`.
  - Contexto: como `guide`, un repositorio llamado `list` se
    instala vía el alias `install`; los argumentos que empiezan
    por `-` son error de uso, no operandos.
- [x] Implementar `showList` en `src/cli.js`: `readLock(io.cwd)`,
  avisos, mensaje de vacío y bloque por paquete
  - Aporta: la consulta en sí —del registro al lenguaje de
    producto, sin hashes ni acciones—.
  - Contexto: `files` puede traer `action: 'skip'` (no se lista)
    y entradas válidas sin `installedAt` (se muestran sin fecha);
    `readLock` nunca lanza —la corrupción ya llega degradada a
    paquetes vacíos con aviso—.
- [x] Extender `test/cli.test.js` con el bloque de pruebas de
  `list`
  - Aporta: la suite verifica el comportamiento de la consulta y
    mantiene la cobertura del 100 %.
- [x] Documentar la consulta en `docs/instalador.md`: línea de
  gramática y sección «La consulta del registro»
  - Aporta: el contrato interno refleja la nueva operación junto
    a «La consulta de la guía».
- [x] Registrar la decisión del subcomando `list`
  - Aporta: la palabra reservada queda documentada con su
    justificación, como hizo D011 con `guide`.
  - Contexto: invocar el skill `decisiones-diseno`; será la
    decisión D012.
- [x] Actualizar `README.md`: la sección «Uso» presenta `list`
  junto a `guide`
  - Aporta: la portada del producto refleja la consulta.
- [x] Crear `manual/referencia-list.md` y enlazarla en
  `mkdocs.yml`, `manual/README.md`, `manual/index.md` y
  `manual/guia-de-uso.md`
  - Aporta: la documentación de producto cubre el subcomando con
    el formato de página de referencia vigente (D009).
- [x] Actualizar `docs/domains/002-instalacion.md`: la operación
  de consulta del registro
  - Aporta: el lenguaje ubicuo del dominio refleja la nueva
    operación junto a «Consultar la guía».

## Suite de pruebas esperada

Caso de uso: consultar qué paquetes tiene instalados el repositorio
destino.

- `list` en un destino sin lock responde «no hay paquetes
  instalados» y termina con código `0` (Z).
- `list` tras instalar un paquete muestra su `nombre@version`, la
  fecha de instalación y una línea por recurso escrito (O).
- `list` tras instalar varios paquetes muestra una entrada por
  paquete (M).
- La salida muestra los `target` registrados sin exponer `sha256`
  ni acciones internas (`create`, `overwrite`, `skip`) (I).
- Un recurso registrado con `action: 'skip'` no aparece como
  instalado (B).
- Una entrada sin `installedAt` en un lock válido se lista sin la
  fecha y sin fallar (B).
- Un paquete con `personalization` muestra la línea que señala la
  guía consultable con `guide` (O).
- Un lock corrupto produce el `aviso:` y la respuesta de «no hay
  paquetes instalados», con código `0` (E).
- `list` con un argumento o una opción (`list x`, `list --path …`,
  `list -x`, `list a b`) es error de invocación con código `4` (B).
- `list` tras una instalación remota muestra el mismo listado que
  tras `--path`: solo lee el registro del directorio de trabajo (I).
- Regresión: la suite existente sigue verde y la cobertura de
  `src/` se mantiene en el 100 %.

## Revisión

- Subagente: 2026-09-30 — Aprueba (tras una ronda de correcciones
  documentales: escenarios de `list` en la página de
  funcionalidades, precisión de la palabra reservada en D012,
  fecha con milisegundos y tabla de errores en la referencia)
- Usuario: 2026-09-30 — Aprueba
