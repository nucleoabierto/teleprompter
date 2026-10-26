# Reglas del registro de experiencias

Reglas del artefacto «registro de experiencias»: el archivo append-only donde viven las correcciones que el usuario hace al agente, como evidencia para `destilar-lecciones`. Hogar y único consumidor: `operar-experiencias`.

## Ubicación y literales

- El registro es `EXPERIENCIAS.md` en la raíz del repositorio del proyecto evaluado.
- Los campos de la entrada son `Id`, `Tarea`, `Esperado`, `Obtenido`, `Corrección` y `Estado`; los estados son `pendiente` y `consolidada`.
- Los literales llevan los valores por defecto de la convención; un proyecto que difiere los edita aquí.

## Formato del artefacto

Cabecera fija:

```markdown
# Experiencias

<!-- Registro append-only de las correcciones que el usuario hace al agente
     durante la ejecución de tareas. Cada entrada documenta la brecha entre
     el resultado esperado y el obtenido.

     Las entradas nunca se editan ni se borran. Gestionado por el skill
     destilar-lecciones. -->
```

Cada entrada es un bloque que empieza en `- Id:` y corre hasta la siguiente `- Id:` o el fin del archivo, separada de la anterior por una línea en blanco:

```markdown
- Id: AAAAMMDDTHHMMSS
  Tarea: <referencia a la tarea>
  Esperado: <texto>
  Obtenido: <texto>
  Corrección: <texto>
  Estado: pendiente
```

**Invariante append-only:** las entradas nunca se editan ni se borran; la única mutación admitida sobre una entrada es el marcado de `Estado` de `pendiente` a `consolidada`.

## Lectura tolerante

El lector acepta las variantes existentes:

- Una entrada empieza siempre en la línea `- Id:`.
- Un campo puede ir **envuelto**: su valor continúa en la línea siguiente hasta que aparece otra línea `Campo:` (una línea sangrada `<Texto>:` con nombre de campo) o se acaba la entrada.
- Pueden faltar el campo `Estado` o la línea en blanco de separación entre entradas.

## Escritura canónica

La escritura produce siempre la forma canónica: un campo por línea, sin envolver, con `Estado` presente y una línea en blanco separando la entrada de lo anterior.

## Operaciones

Una operación que no puede ejecutarse falla sin escribir, con su diagnóstico. Las lecturas exigen el registro (ausente: fallo); las escrituras lo crean si falta.

### `id [ocupado…]`

Devuelve un `Id` único con formato `AAAAMMDDTHHMMSS`: la marca de tiempo actual o, si colisiona con un `Id` del registro o con algún `<ocupado>` dado (los ya asignados a otras entradas del mismo lote), uno posterior. El registro ausente no es error: la escritura posterior lo creará. Tras una decena de intentos sin lograr unicidad: fallo.

### `listar [pendiente|consolidada]`

Devuelve las entradas del registro tal como están escritas (el bloque `- Id:` con sus campos), separadas por una línea en blanco; con el estado como término, solo las de ese estado (el estado de una entrada es el valor de su campo `Estado`, resuelto con la lectura tolerante). Otro estado como término: invocación inválida. Sin resultados: vacío legítimo.

### `por-tarea <ref>`

Devuelve las entradas cuyo campo `Tarea` contiene la subcadena `<ref>` (la ruta del archivo de tarea identifica sus entradas), en la misma forma que `listar`. Sin resultados: vacío legítimo.

### `anexar`

Añade al final del registro la entrada dada por el consumidor, fijando `  Estado: pendiente` como último campo. La forma canónica exigida es exactamente cinco líneas:

```markdown
- Id: AAAAMMDDTHHMMSS
  Tarea: <texto>
  Esperado: <texto>
  Obtenido: <texto>
  Corrección: <texto>
```

Cualquier otra forma (campos envueltos, ausentes o de más, `Id` mal formado o ya presente en el registro) rechaza la operación sin escribir. Si el registro no existe o está vacío, se crea con la cabecera fija antes de anexar; si ya tiene contenido, una línea en blanco separa la entrada nueva de lo que hay escrito.

### `marcar <id>…`

Cambia `Estado: pendiente` a `Estado: consolidada` en la línea `Estado:` de cada entrada cuyo `Id` se indica, sin tocar nada más del archivo. Un `Id` ausente, ya consolidado o cuya entrada no tiene campo `Estado` produce un diagnóstico sin abortar el lote: el resto se procesa. Si algún `Id` no quedó marcado, la operación se reporta como fallida con el diagnóstico de cada uno.
