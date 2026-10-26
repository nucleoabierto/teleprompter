---
name: consultar-artefactos
description: >
  Responde consultas deterministas sobre los artefactos del sistema
  (índice de tareas, archivos de tarea, índices de decisiones y de
  lecciones, ideas persistidas y series numeradas) devolviendo datos
  parseables, para que los consumidores deleguen la lectura de los
  formatos en lugar de re-describirlos.
  Usar cuando un trabajo necesite un dato del estado o la estructura
  de un artefacto del proyecto evaluado cubierto por el catálogo.
  Sinónimos: consultar artefactos, consulta de artefactos, consulta
  mecánica, datos del índice, estado de una tarea.
---

# Consultar artefactos

Instrucciones para que un agente responda consultas deterministas sobre los artefactos del sistema. El skill recibe la orden delegada (artefacto objetivo, operación y términos) y la resuelve aplicando el documento de reglas del artefacto consultado, que declara su formato, su lectura tolerante y cada operación: el agente lee el artefacto directamente con las herramientas habituales. Es la mitad de lectura del mecanismo de delegación: las mutaciones de los artefactos corresponden a `actualizar-artefactos`.

## Cuándo usar

- Cuando un skill necesite un dato del estado o la estructura de un artefacto del sistema (índice de tareas, archivo de tarea, índice de decisiones o de lecciones, ideas persistidas, series numeradas) y la consulta sea una operación del catálogo.

## Cuándo no usar

- Para lecturas simples que el arnés resuelve directamente (`read`, `grep`, `git`): no se delegan.
- Para consultas que exigen juicio (veredictos, coincidencias semánticas, redacción): el skill devuelve datos, no interpreta.
- Para mutar los artefactos: las escrituras no entran en el catálogo.

## Entrada

- La consulta delegada del consumidor en términos de dominio («la próxima pendiente», «el estado de la tarea», «las propuestas en revisión», «el siguiente número de la serie») con las referencias de dominio que la consulta pida; nunca una ubicación, marca o sección que el documento de reglas resuelve.

## Salida

- Los datos de la consulta, en el formato que cada operación declara: una línea por resultado, campos separados por tabulador. La ausencia del artefacto objetivo es un fallo con diagnóstico; la ausencia de resultados es vacío legítimo.

## Principios rectores

1. **Datos, nunca síntesis:** las operaciones devuelven lo que el artefacto contiene; la ausencia de archivo o de resultados se reporta como tal, sin fabricar datos.
2. **La orden es completa:** el consumidor delega artefacto, operación y términos; no re-describe el formato del artefacto en su propio cuerpo.
3. **Catálogo abierto:** una consulta mecánica no cubierta la resuelve el consumidor leyendo el artefacto directamente, y puede incorporarse después como operación nueva en el documento de reglas del artefacto.
4. **Contrato único:** datos parseables, una línea por resultado con campos separados por tabulador; el vacío legítimo no es error y la operación que no puede ejecutarse falla con diagnóstico, sin producir datos (D035).

## Procedimiento

1. **Recibir la consulta delegada** del consumidor: consulta de dominio y referencias.
2. **Resolver y leer:** la consulta mapea a la operación del catálogo; el documento de reglas que la operación nombra declara el objetivo y las reglas de lectura (incluida la tolerancia a variantes históricas) y el agente lee el archivo directamente siguiéndolo.
3. **Devolver el resultado:** el dato tal como las reglas lo producen; un fallo se transmite con su diagnóstico, sin reinterpretarlo.

## Acciones

El consumidor delega la consulta de dominio; el gestor la traduce a la operación del catálogo y resuelve el objetivo desde el documento de reglas del artefacto.

- «la próxima pendiente»: `siguiente` sobre el índice de tareas.
- «las propuestas en revisión»: `propuestas` sobre el índice de tareas.
- «las agrupaciones del índice con su épica»: `grupos` sobre el índice de tareas.
- «el estado de la agrupación `<texto>`»: `estado-grupo` sobre el índice de tareas (la agrupación está agotada cuando solo figura la marca completada).
- «las líneas de trabajo abiertas»: `inventario` sobre el índice de tareas y el directorio de épicas.
- «el estado de `<ref>`»: `estado` sobre el documento indicado (la referencia es de dominio: la tarea por su referencia, la propuesta, la épica).
- «las secciones de `<ref>`»: `secciones`.
- «si la planeación de la tarea `<ref>` está completa»: `planeacion`.
- «las dependencias de `<ref>`»: `dependencias`.
- «las acciones del plan de `<ref>` con su marca»: `checklist`.
- «las ideas sin procesar»: `pendientes` sobre el directorio de ideas.
- «las lecciones/decisiones que disparan con `<término>…`»: `coincidencias` sobre el índice del dominio correspondiente.
- «el siguiente número de la serie `<directorio>` [prefijo] [ancho]»: `siguiente` (el directorio es referencia de dominio; prefijo y ancho los declara el documento de reglas del artefacto, o los pasa el consumidor que conoce la convención de su artefacto).

La operación `convencion` desaparece del catálogo: con las convenciones embebidas en cada documento de reglas no queda artefacto que consultar. Las convenciones ajenas a un artefacto (el prefijo de las ramas de tarea, la rama principal, los directorios sin gestor) viven embebidas como literales en el `SKILL.md` o `references/` del consumidor que las usa.

## Catálogo de operaciones

Cada operación se resuelve aplicando la sección de su nombre en el documento de reglas que encabeza su grupo (el agente opera el archivo directamente con las herramientas habituales, sin scripts). Una operación sin resultados devuelve el vacío legítimo; un objetivo ausente o una consulta mal formada fallan con diagnóstico.

Los documentos de los artefactos compartidos con `actualizar-artefactos` viven en su `references/` y se referencian por ruta relativa.

### `../actualizar-artefactos/references/indice-tareas.md`: el índice de tareas (`TODO.md`)

- `siguiente`
- `propuestas`
- `grupos`
- `estado-grupo <texto>`
- `inventario <dir-épicas>`

### `../actualizar-artefactos/references/tarea.md`: un archivo de tarea, propuesta o épica

Las particularidades de propuestas y épicas las declaran `propuesta.md` y `epica.md` del mismo directorio.

- `estado`
- `secciones`
- `planeacion`
- `dependencias`
- `checklist`

### `../actualizar-artefactos/references/idea.md`: el directorio de ideas persistidas (`docs/ideas/`)

- `pendientes`

### `references/indice-disparadores.md`: los índices de decisiones y de lecciones (`README.md`)

- `coincidencias <término>…`

### Las series numeradas de un directorio: sin documento propio

La serie numerada no es un artefacto con documento de reglas: la regla de la operación queda aquí, en línea, y cada documento de artefacto con serie declara su prefijo y su ancho.

#### `siguiente <directorio> [prefijo] [ancho]`

Emite el siguiente número de la serie: el mayor número que casa `<prefijo><dígitos>` entre los archivos del directorio, más uno, rellenado con ceros al ancho pedido (por defecto `3`). Directorio sin entradas de la serie: emite el primero (`001`, `D001`…). Directorio ausente: fallo. Ejemplos: `121` para `docs/tasks`, `D034` para `docs/decisions` con prefijo `D`, `05` para borradores con ancho `2`.

### Cobertura

- Todas las operaciones tienen al menos un skill consumidor (las publicadas por anticipado no entran en el catálogo: se añaden cuando aparezca su consumidor).
- Artefactos del ciclo aún sin operación delegada: `ROADMAP.md` (lectura y escritura directas del consumidor); la sección `## Borradores` de `propuesta.md` (los borradores se listan y tachan a mano; la promoción solo la actualiza al promover); las escrituras de los índices `README.md` de `docs/decisions/` y `docs/lessons/` (sus consultas por disparadores ya las cubre `coincidencias`); y el índice de `docs/domains/` entero (formato distinto, sin lectura ni escritura delegada). El registro de experiencias y el changelog están cubiertos por `operar-experiencias` y `operar-changelog`.

## Finalización

El skill ha terminado cuando el consumidor recibió los datos de la consulta (o el diagnóstico de la operación fallida) tal como las reglas del artefacto los produjeron.

## Referencias

- `docs/decisions/D035-reglas-declarativas-por-artefacto.md`: el mecanismo de delegación que estas operaciones cumplen.
- `../actualizar-artefactos/references/`: los documentos de reglas de los artefactos compartidos: `indice-tareas.md`, `tarea.md`, `propuesta.md`, `epica.md`, `idea.md`.
