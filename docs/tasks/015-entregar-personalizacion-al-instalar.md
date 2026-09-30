# Entregar las instrucciones al instalar y bajo demanda

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

El instalador entrega las instrucciones de personalización declaradas
por el paquete: al terminar una instalación con éxito las presenta
como parte del resultado, y quedan consultables después sobre el
destino ya instalado. La entrega funciona igual con origen remoto y
con `--path`.

## Dependencias

- 013 — su recomendación informa la forma de la entrega.
- 014 — fija la declaración que el instalador consume.

## Entrada

- La investigación de la tarea 013 en `docs/research/`.
- La declaración del formato implementada por la tarea 014.
- El flujo del instalador en `src/cli.js` —la entrega es un paso al
  final del resultado de instalación— y el contrato de
  `docs/instalador.md`.
- El paquete de referencia con instrucciones declaradas.

## Resultado esperado

- Una instalación con éxito de un paquete que declara instrucciones
  presenta su contenido tal cual al final del resultado, tras el
  registro —sin interpretar ni transformar el texto libre del
  mantenedor—; un paquete sin declaración no añade ruido a la
  salida.
- Las instrucciones quedan consultables sobre el destino instalado
  sin reinstalar ni volver a descargar el paquete.
- `--dry-run` no entrega instrucciones como si la instalación se
  hubiera completado —la forma exacta la fija el comportamiento
  documentado—.
- `docs/instalador.md`, `README.md` y `manual/` reflejan la entrega y
  la consulta.

## Criterios de calidad

- La entrega ocurre solo cuando el paquete declara instrucciones y la
  instalación termina con éxito.
- La consulta posterior devuelve el mismo contenido que la entrega
  del momento de instalar.
- El comportamiento es idéntico para origen remoto y `--path`, y la
  consulta posterior no depende de la fuente original.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Actualizar el contrato de `docs/instalador.md` con el paso de
   entrega y la consulta posterior.
2. Implementar la lectura de la declaración y su presentación al
   final de la instalación.
3. Implementar la consulta posterior sobre el destino instalado.
4. Extender la suite: entrega con y sin declaración, consulta,
   equivalencia remoto/local, `--dry-run`.
5. Actualizar `README.md` y `manual/`.

## Notas

- La consulta posterior consume lo que la tarea 014 dejó
  materializado en el destino; esta tarea decide su invocación
  concreta —subcomando, opción o convención— dentro de la gramática
  del CLI.

## Contexto

- **Archivos similares:**
  - `src/cli.js` — `main` orquesta el flujo; la entrega es un paso
    más al final del resultado, junto al anuncio actual de
    `personalización:`. `parseArgs` define la gramática
    `[install] <spec> [dest] | --path <dir> [dest]` donde encaja la
    invocación de consulta.
  - `src/execute.js` — `installPersonalization` devuelve
    `{ target }`; la copia gestionada ya existe en el destino tras
    la ejecución, fuente de lectura posible para la entrega.
  - `src/lock.js` — la entrada del paquete lleva `personalization`
    con la ruta gestionada y `files` la incluye con su hash: la
    consulta posterior localiza el archivo sin reconstruir la
    convención.
  - `docs/research/2026-09-guia-postinstalacion.md` — la
    investigación de la 013: entrega diferida al final del
    resultado exitoso bajo un encabezado propio, contenido tal
    cual, nada si no hay declaración ni en `--dry-run` ni en
    fallos; consulta leyendo el archivo materializado.
  - `test/execute.test.js` — «install materializes the
    personalization guide…» es el modelo de fixture y aserciones.
- **Patrones:**
  - Salida por líneas en español vía `out`/`err` inyectables;
    secciones con encabezado `nombre:`.
  - La guía gestionada vive en `.teleprompter/<paquete>/<archivo>`;
    el lock la registra en `files` y en el campo `personalization`.
  - Cobertura 100 % sobre `src/`; pruebas de comportamiento por
    módulo de test.
- **Lecciones:** ninguna aplica —no existe `docs/lessons/`—.
- **Decisiones:**
  - D005 — la entrega ocurre tras `writeLock`, solo cuando la
    instalación tuvo éxito; `--dry-run` y los abortos no la
    alcanzan.
  - D007 — la consulta posterior se apoya en el registro, que ya
    recuerda la ruta gestionada.
  - D010 — la ubicación gestionada es la convención que la
    consulta lee.
- **Vacío detectado / punto abierto:** la forma de invocación de
  la consulta posterior —subcomando, opción o convención— queda
  por fijar; el plan la propone al usuario junto al resto.

## Conectividad

**Veredicto: conectada.**

Todo lo que la tarea asume existe desde la 014: la guía se
materializa en `.teleprompter/<paquete>/<archivo>` con
`installPersonalization`, el lock recuerda su ruta en
`personalization`, el CLI ya la anuncia al final y el paquete de
referencia declara instrucciones reales. La entrega lee el archivo
materializado —así funciona igual con origen remoto (el temporal se
limpia en `finally` tras la ejecución) y con `--path`—; la consulta
posterior es lectura del destino. Solo falta la invocación de
consulta, absorbible dentro del alcance de la tarea sobre la
gramática de `parseArgs`.

## Plan técnico

**Entendimiento.** La guía ya se materializa en
`.teleprompter/<paquete>/<archivo>` y el lock recuerda su ruta
(tarea 014). Esta tarea la *entrega*: al final de una instalación
exitosa se imprime su contenido tal cual, y un subcomando nuevo la
recupera sobre el destino sin reinstalar ni redescargar —modelo
`brew info` de la investigación 013—.

**Decisiones de diseño (apoyadas en las recomendaciones de la
investigación y el acuerdo del usuario):**

- La entrega lee **la copia materializada en el destino**
  (`guide.target` tras `executePlan`), no el fuente —equivale al
  contenido instalado, funciona igual con origen remoto (cuyo
  temporal ya se limpió) y con `--path`, y es lo mismo que la
  consulta posterior mostrará.
- El bloque se imprime al final del resultado con encabezado
  `personalización (<target>):` seguido del contenido verbatim;
  la línea puntero actual (`instrucciones en "…"`) desaparece en
  favor del contenido. Solo cuando hay guía instalada y éxito;
  `--dry-run` y los abortos no la alcanzan (D005).
- La consulta es un subcomando **`guide [<paquete>]`** que opera
  siempre sobre el directorio actual —sin `dest`: el usuario fijó
  que debe ejecutarse dentro del proyecto—. Sin `<paquete>` muestra
  la guía de cada paquete instalado que la declare; con él, la de
  ese paquete. Lee `personalization` del lock y muestra el mismo
  bloque que la entrega.
- Resolución fallida (sin lock, paquete no instalado, paquete sin
  guía declarada) → error en stderr y código `4`; el archivo
  registrado no existe o no se puede leer (deriva) → código `3`.
- Registro de la decisión del subcomando (`decisiones-diseno`):
  nueva palabra de la gramática del CLI, costosa de retirar.

**Acciones:**

1. `src/cli.js`: `parseArgs` reconoce `guide [<paquete>]` como
   comando propio (rechaza `--path`, `--ref`, `--force`, `dest`);
   `main` lo dirige a la consulta. Tras `writeLock`, si hubo guía
   instalada lee `<dest>/<guide.target>` e imprime el bloque
   `personalización (<target>):` + contenido verbatim, antes de
   `instalado:`. La consulta: `readLock` → paquete(s) con
   `personalization` → mismo bloque por cada uno.
2. `docs/instalador.md`: paso de entrega al final del resultado y
   contrato del subcomando `guide`.
3. Registro de la decisión del subcomando.
4. `README.md` y `manual/` (página del subcomando y referencia de
   `install` si describe la línea puntero actual).
5. Dominio 002 si el diff altera el contrato documentado.

**Suite de pruebas esperada (se muestran las pruebas principales;
las de actualización se incorporan con el registro de desviaciones):**

- Instalar con guía imprime el bloque con su contenido verbatim al
  final, tras el resultado.
- Instalar sin `personalization` no añade salida de guía.
- `--dry-run` no imprime el bloque (ni escribe nada).
- El contenido entregado es idéntico al del archivo materializado.
- `guide` sin argumento muestra la guía del paquete instalado.
- `guide` con varios paquetes con guía muestra un bloque por paquete.
- `guide <paquete>` muestra solo la de ese paquete.
- `guide` sin lock → error y código `4`.
- `guide <paquete>` no instalado → error y código `4`.
- `guide <paquete>` instalado sin guía → error y código `4`.
- `guide` con el archivo registrado eliminado → error y código `3`.
- `guide --path …` / `guide <pkg> <dest>` → error de uso, código `4`.
- Regresión: instalación remota sigue entregando la guía (la entrega
  lee del destino, no del fuente temporal).
- Cobertura del 100 % en `src/`.

## Registro de desviaciones

- **Guarda de rutas del lock en la consulta** (revisión, rondas 1-2):
  el plan no contemplaba que `teleprompter-lock.json` es dato
  versionado —entrada no confiable—; `showGuide` revalida cada ruta
  registrada con `isSafeRelative` y exige que su `realpath` —con
  enlaces en la cadena de padres y en el propio archivo— resuelva
  dentro del destino, tratando el escape como fallo de lectura
  (código 3).
- **Lectura atómica de las guías** (revisión, ronda 1): la consulta
  lee todos los archivos antes de imprimir ninguno —un fallo no deja
  salida parcial—.
- **`guide -x`** (revisión, ronda 1): los argumentos que empiezan por
  `-` son error de uso, no nombres de paquete.

## Revisión

- Subagente: 2026-09-30 — Aprueba (tras dos rondas: guarda de rutas
  del lock, regresión remota, symlink en el componente final)
- Usuario: 2026-09-30 — Aprueba
