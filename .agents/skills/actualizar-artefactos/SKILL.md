---
name: actualizar-artefactos
description: >
  Ejecuta escrituras mecánicas sobre los artefactos del sistema
  —índice de tareas, archivos de tarea, propuestas y épicas, ideas
  persistidas y la promoción de borradores— preservando los formatos
  y escribiendo la forma canónica, para que los consumidores
  deleguen la mutación en lugar de re-describirla.
  Usar cuando un trabajo necesite mutar un artefacto del proyecto
  evaluado con una operación del catálogo.
  Sinónimos: actualizar artefactos, escritura de artefactos,
  mutación mecánica, cambiar estado de una tarea, actualizar el
  índice.
---

# Actualizar artefactos

Instrucciones para que un agente ejecute escrituras mecánicas sobre los artefactos del sistema. El skill recibe la orden delegada —archivo objetivo, operación y términos— y la ejecuta con los scripts bash propios de `assets/`, que mutan el artefacto preservando lo que no tocan. Es la mitad de escritura del mecanismo de D033: las consultas corresponden a `consultar-artefactos`.

## Cuándo usar

- Cuando un skill necesite mutar un artefacto del sistema —marcar una línea del índice, cambiar el `## Estado` de una tarea, insertar una sección, registrar un veredicto, mover líneas entre agrupaciones, marcar una idea como procesada, promover borradores— y la mutación sea una operación del catálogo.

## Cuándo no usar

- Para escrituras con juicio —redacción de contenido, reformulación, veredictos—: el skill ejecuta mecánica; qué escribir lo decide el consumidor.
- Para consultar los artefactos: eso corresponde a `consultar-artefactos`.
- Para mutaciones no cubiertas por el catálogo: el consumidor edita directamente; la operación puede incorporarse después siguiendo el contrato.

## Entrada

- La orden delegada del consumidor: el archivo o directorio objetivo, la operación del catálogo y los términos que la operación pida —marca, etiqueta, texto de referencia, línea a añadir o cuerpo de sección por `stdin`—.

## Salida

- El artefacto mutado en su ubicación. Las operaciones que producen un dato —`encabezado`, `promover`— lo emiten por stdout en formato parseable. Una mutación que no puede ejecutarse termina con código distinto de cero y diagnóstico en stderr, sin escribir.

## Principios rectores

1. **Preservar lo que no se toca:** las mutaciones reescriben solo lo que la operación declara: sublistas de bloqueo, comentarios de épica, secciones ajenas y contenido quedan intactos.
2. **La orden es completa:** el consumidor delega archivo, operación y términos; las decisiones —qué estado poner, qué sección escribir, dónde va una línea— son del consumidor, no del script.
3. **Escritura canónica, lectura tolerante:** `## Estado` se escribe siempre en la forma canónica —línea completa de opciones con la vigente en negrita, marcador y etiqueta incluidos— aunque la entrada sea una variante histórica; `## Desviaciones del plan` y cualquier sección nueva van inmediatamente antes de `## Revisión` (D033).
4. **Falla sin escribir:** ante un formato inesperado —sección ausente, referencia no localizada, línea de opciones no parseada— el script termina con diagnóstico y no modifica el archivo.
5. **Promoción sin reescritura:** la promoción de borradores mueve archivos, inyecta las secciones que faltan y renumera referencias; no reformula el contenido aprobado (D014).
6. **Contrato único:** los mismos canales y códigos que en la lectura: stdout para datos parseables, stderr para diagnósticos, `0` en éxito y `2` en entrada ausente o invocación inválida (D033).

## Procedimiento

1. **Recibir la orden delegada:** el consumidor indica el archivo o directorio objetivo, la operación y sus términos.
2. **Ejecutar el script** de `assets/` correspondiente a la operación con los argumentos dados; el cuerpo de las secciones nuevas entra por `stdin`.
3. **Transmitir el resultado al consumidor:** un código de salida distinto de cero se comunica con su diagnóstico, sin reinterpretarlo.

## Catálogo de operaciones

Los scripts viven en `assets/` y se invocan como `assets/<script>.sh <objetivo> <operación> [términos]`. Las referencias `<ref>` casan por subcadena con la línea o el encabezado; conviene pasar la ruta del archivo o el encabezado completo para que sean únicas.

### `todo.sh` — el índice de tareas (`TODO.txt`)

- `marcar <ref> <marca> [bloqueante…]` — cambia la marca de la línea que contiene `<ref>`; con `!` escribe la sublista de bloqueantes dada y con otra marca la retira.
- `añadir <sección> <línea>` — añade la línea al final de una sección: `general`, `propuestas` o el texto de un encabezado; crea la sección si falta (`## General` al inicio de las agrupaciones, `## Propuestas en revisión` al final del archivo).
- `retirar <ref>` — elimina la línea que contiene `<ref>` con su sublista.
- `mover <ref> <encabezado>` — mueve la línea, con su sublista, bajo el encabezado que contiene `<encabezado>`.
- `recolocar <ref> <pos> [ref2]` — recoloca un bloque —un grupo entero o una línea con su sublista—: `antes-de` o `después-de` `<ref2>`, o `final` antes de la sección de propuestas; cualquier reordenación se compone de recolocaciones.
- `retirar-grupo <ref>` — elimina el encabezado que contiene `<ref>` con su comentario de épica y todas sus líneas.
- `encabezado <título> [épica]` — crea `## Hito N: <título>` con el siguiente número de la serie, al final de las agrupaciones, con el comentario `<!-- épica: … -->` cuando se pasa la ruta; devuelve el encabezado creado.
- `inicializar` — crea el índice con la estructura de la convención.

### `tarea.sh` — un archivo de tarea, propuesta o épica

- `estado <etiqueta>` — escribe `## Estado` en forma canónica con la opción `<etiqueta>` vigente; conserva las opciones de una línea existente (tareas y propuestas) y reconstruye la línea a partir de la forma suelta.
- `marcar-opcion <etiqueta>` — pone `[x]` a la opción `<etiqueta>` sin tocar las demás, para el `## Estado` acumulativo de las épicas (`[x] Planificada | [x] Completada`).
- `insertar-seccion <título>` — inserta `## <título>` con el cuerpo leído de `stdin`, antes de `## Desviaciones del plan` si existe o de `## Revisión`; falla si la sección ya existe.
- `registrar-revision <línea>` — registra `- Autor: fecha — veredicto` en `## Revisión`: rellena el placeholder del autor si existe o añade la línea al final de la sección.
- `añadir-linea <sección> <línea>` — añade la línea al final de la sección indicada.
- `marcar-item <sección> <texto>` — marca `[x]` los ítems de checklist de la sección que contienen `<texto>`; idempotente sobre ítems ya marcados.
- `sustituir-item <sección> <texto>` — sustituye el ítem de checklist que contiene `<texto>`, con sus sub-bullets, por el contenido leído de `stdin` —la replanificación del `## Plan técnico`—.

### `ideas.sh` — un archivo de idea persistida

- `procesada <destino>` — añade `> **Procesada en:** <destino>` al final de la cabecera; falla si la idea ya está marcada.

### `promocion.sh` — la promoción de borradores

- `promover <dir-tareas> <índice>` — invocado sobre el directorio de la propuesta: mueve cada `MM-slug.md` a `<dir-tareas>/NNN-slug.md` con numeración continua tras el máximo del directorio y del índice, inyecta `## Estado` canónica y `## Revisión`, renumera las dependencias «Borrador MM» y actualiza el índice `## Borradores` de `propuesta.md`. Devuelve `MM<TAB>NNN<TAB>ruta` por borrador. La validación precede a cualquier escritura: una referencia no resoluble aborta la promoción entera sin tocar nada. El cambio de estado de `propuesta.md` a `[a]` y la retirada de su línea `[p]` son órdenes aparte (`tarea.sh estado` y `todo.sh retirar`).

## Finalización

El skill ha terminado cuando el artefacto quedó mutado según la orden —o el consumidor recibió el diagnóstico de la operación fallida—.

## Referencias

- `docs/decisions/D033-pasos-mecanicos-skills-utilidad-scripts.md` — El mecanismo de delegación, el contrato de los scripts y las formas canónicas que estas operaciones escriben.
- `.agents/skills/consultar-artefactos/SKILL.md` — La mitad de lectura del mecanismo.
