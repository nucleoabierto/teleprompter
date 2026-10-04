---
name: consultar-artefactos
description: >
  Responde consultas deterministas sobre los artefactos del sistema
  —índice de tareas, archivos de tarea, índices de decisiones y de
  lecciones, ideas persistidas y series numeradas— devolviendo datos
  parseables, para que los consumidores deleguen la lectura de los
  formatos en lugar de re-describirlos.
  Usar cuando un trabajo necesite un dato del estado o la estructura
  de un artefacto del proyecto evaluado cubierto por el catálogo.
  Sinónimos: consultar artefactos, consulta de artefactos, consulta
  mecánica, datos del índice, estado de una tarea.
---

# Consultar artefactos

Instrucciones para que un agente responda consultas deterministas sobre los artefactos del sistema. El skill recibe la orden delegada —archivo objetivo, operación y términos— y la ejecuta con los scripts bash propios de `assets/`, que devuelven los datos por stdout. Es la mitad de lectura del mecanismo de D033: las mutaciones de los artefactos corresponden a otro skill de utilidad.

## Cuándo usar

- Cuando un skill necesite un dato del estado o la estructura de un artefacto del sistema —índice de tareas, archivo de tarea, índice de decisiones o de lecciones, ideas persistidas, series numeradas— y la consulta sea una operación del catálogo.

## Cuándo no usar

- Para lecturas simples que el arnés resuelve directamente (`read`, `grep`, `git`): no se delegan.
- Para consultas que exigen juicio —veredictos, coincidencias semánticas, redacción—: el skill devuelve datos, no interpreta.
- Para mutar los artefactos: las escrituras no entran en el catálogo.

## Entrada

- La orden delegada del consumidor: el archivo o directorio objetivo, la operación del catálogo y los términos que la operación pida.

## Salida

- Los datos de la consulta por stdout, en el formato que cada operación declara. La ausencia del archivo objetivo es un error con diagnóstico; la ausencia de resultados es salida vacía legítima.

## Principios rectores

1. **Datos, nunca síntesis:** las operaciones devuelven lo que el artefacto contiene; la ausencia de archivo o de resultados se reporta como tal, sin fabricar datos.
2. **La orden es completa:** el consumidor delega archivo, operación y términos; no re-describe el formato del artefacto en su propio cuerpo.
3. **Lectura tolerante:** los parsers aceptan las variantes históricas —las convenciones no canónicas de `## Estado`, las posiciones divergentes de las secciones— aunque la escritura siempre produce la forma canónica (D033).
4. **Catálogo abierto:** una consulta mecánica no cubierta la resuelve el consumidor leyendo el artefacto directamente, y puede incorporarse después como operación nueva siguiendo el contrato.
5. **Contrato único:** los scripts reciben la entrada por argumentos, reservan stdout a datos parseables y stderr a diagnósticos, devuelven `0` en éxito —incluido el vacío legítimo— y `2` cuando falta la entrada (D033).

## Procedimiento

1. **Recibir la orden delegada:** el consumidor indica el archivo o directorio objetivo, la operación y sus términos.
2. **Ejecutar el script** de `assets/` correspondiente a la operación con los argumentos dados.
3. **Devolver la salida al consumidor:** stdout es el dato; un código de salida distinto de cero se transmite con su diagnóstico, sin reinterpretarlo.

## Catálogo de operaciones

Los scripts viven en `assets/` y se invocan como `assets/<script>.sh <objetivo> <operación> [términos]`. Los campos de salida van separados por tabulador. Una operación sin resultados devuelve `0` sin líneas.

### `todo.sh` — el índice de tareas (`TODO.txt`)

- `siguiente` — la primera línea en curso (`[~]` o `[r]`); si no hay, la primera pendiente `[ ]`.
- `por-estado <marca>` — las líneas de tarea con la marca indicada (` `, `~`, `r`, `x`, `!`).
- `propuestas` — las líneas de propuestas `[p]` en revisión.
- `grupos` — `encabezado<TAB>épica` por cada `##` del índice; la épica va vacía en los encabezados ligeros.
- `estado-grupo <texto>` — `marca<TAB>cuenta` por estado presente bajo el encabezado que contiene `<texto>`; la agrupación está agotada cuando solo figura la marca `x`.
- `siguiente-hito` — el siguiente número de la serie `## Hito N`.
- `inventario <dir-épicas>` — las líneas de trabajo abiertas: `epica<TAB>ruta<TAB>planificada|completada|otro` por documento de épica, `grupo<TAB>encabezado<TAB>épica` por agrupación del índice y `suelta<TAB>línea` por tarea no completada de `## General`.

### `tarea.sh` — un archivo de tarea (`docs/tasks/NNN-slug.md`)

- `estado` — `pendiente`, `en-progreso`, `en-revision`, `completada` o `bloqueada`, tolerando las convenciones históricas del campo `## Estado`.
- `secciones` — los encabezados `##` presentes, en orden.
- `planeacion` — `sección<TAB>presente|ausente` para `Contexto`, `Conectividad`, `Plan técnico` y `Suite de pruebas esperada`.
- `dependencias` — las entradas de la sección `## Dependencias`, una por línea.
- `checklist` — `marca<TAB>texto` por acción del `## Plan técnico`: la marca es ` ` o `x` en checklists y el número del ítem en las listas numeradas históricas.

### `ideas.sh` — el directorio de ideas persistidas (`docs/ideas/`)

- `pendientes` — `orden<TAB>archivo<TAB>título` por idea sin la marca `Procesada en`, ordenadas por su «Orden sugerido»; las ideas sin orden van al final, con el campo vacío.

### `indice.sh` — los índices de decisiones y de lecciones (`README.md`)

- `coincidencias <término>…` — `archivo<TAB>estado<TAB>resumen` por cada entrada cuyos `Disparadores` contienen algún término, insensible a mayúsculas; el estado va vacío cuando la entrada no lo declara.

### `series.sh` — las series numeradas de un directorio

- `siguiente [prefijo] [ancho]` — el siguiente número de la serie: `121` para `docs/tasks`, `D034` para `docs/decisions` con prefijo `D`, `05` para borradores con ancho `2`.

## Finalización

El skill ha terminado cuando el consumidor recibió los datos de la consulta —o el diagnóstico de la operación fallida— tal como el script los produjo.

## Referencias

- `docs/decisions/D033-pasos-mecanicos-skills-utilidad-scripts.md` — El mecanismo de delegación y el contrato de los scripts que estas operaciones cumplen.
