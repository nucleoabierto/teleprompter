# Reglas de la propuesta

Reglas del artefacto «propuesta»: el directorio de la propuesta, el documento `propuesta.md`, los borradores de tarea y la promoción que los convierte en tareas definitivas. Las mecánicas compartidas de `## Estado`, secciones y `## Revisión` son las de `tarea.md` de este mismo directorio (este documento declara solo lo que la propuesta tiene de propio). Hogar: `actualizar-artefactos`; lo consume también `consultar-artefactos` por referencia cruzada: `../actualizar-artefactos/references/propuesta.md`.

## Ubicación y literales

- Un directorio por propuesta en `docs/proposals/`, nombrado `NNN-slug` —serie continua: el mayor `NNN` de los directorios, más uno, a tres dígitos—.
- El documento principal de cada directorio es `propuesta.md`; los borradores son archivos `MM-slug.md` del mismo directorio (serie propia de dos dígitos).
- Las tareas definitivas viven en `docs/tasks/` y el índice de tareas es `TODO.md` (los necesita la promoción).
- Los literales llevan los valores por defecto de la convención; un proyecto que difiere los edita aquí.

## Formato del artefacto

`propuesta.md` es un documento con estado que sigue las mecánicas de `tarea.md`, con estas particularidades:

- Su `## Estado` usa los estados de las propuestas (`Borrador`, `Pendiente de revisión`, `Aprobada`, `Descartada`) con las mismas reglas de forma canónica y variantes toleradas.
- Tiene la sección `## Borradores`: una viñeta por borrador de la propuesta, cada una referencia el archivo entre comillas simples invertidas (`` - `MM-slug.md` — <título>``) y puede declarar su orden con la forma `depende de MM`.
- Un borrador `MM-slug.md` usa los campos de la plantilla de tarea sin `## Estado` ni `## Revisión` (se inyectan al promocionar) y declara sus dependencias entre borradores como `Borrador MM` en su `## Dependencias`.
- En el índice de tareas, la propuesta figura en `## Propuestas en revisión` como `- [p] <dir-propuesta>/ — <título> (<n> borradores)`. Las reglas del índice están en `indice-tareas.md`.

## Operaciones de escritura

Las operaciones de estado, secciones y revisión sobre `propuesta.md` son las de `tarea.md` con el juego de opciones de las propuestas. La operación propia del artefacto es la promoción.

### `promover`

Promueve los borradores `MM-slug.md` del directorio a tareas definitivas `docs/tasks/NNN-slug.md`. Es una operación compuesta: la validación precede a cualquier escritura (un fallo aborta la promoción entera sin tocar nada) y devuelve una línea `MM<TAB>NNN<TAB>ruta-nueva` por borrador promovido. El cambio de estado de `propuesta.md` a `[a]` y la retirada de su línea `[p]` del índice son órdenes aparte, que delega el consumidor.

1. **Precondiciones:** existen el directorio de la propuesta, su `propuesta.md`, el directorio de tareas y el índice (cualquiera ausente es invocación inválida). Sin borradores `MM-slug.md` en el directorio: fallo.
2. **Numeración:** la base es el mayor número entre los archivos cuyo nombre empieza por dígitos en el directorio de tareas y las ocurrencias `docs/tasks/<dígitos>` del índice (ambas fuentes, porque el índice puede apuntar a tareas ya retiradas del directorio). Cada borrador, en orden de su `MM`, recibe el siguiente `NNN` de tres dígitos.
3. **Validación (antes de escribir nada):**
   - Toda dependencia `Borrador MM` de la sección `## Dependencias` de cada borrador resuelve a una tarea asignada en el mapa `MM→NNN`.
   - Todo `MM-slug.md` listado en la sección `## Borradores` de `propuesta.md` existe en el directorio y tiene serie válida.
   - Todo borrador tiene secciones `## ` donde inyectar y no trae ya `## Estado` ni `## Revisión`.
   - Un fallo cualquiera aborta sin escribir, con diagnóstico por cada causa.
   - Un borrador del directorio cuyo nombre de archivo no aparece en `propuesta.md` (la comprobación busca el nombre en todo el documento) no es fallo: avisa y se promueve igual, aunque su línea en `## Borradores` no exista para actualizarla.
4. **Por cada borrador, en orden:** mover `MM-slug.md` a `docs/tasks/NNN-slug.md` conservando el `slug`, con estas transformaciones en el contenido:
   - Inyectar `## Estado` en forma canónica —`[ ] Pendiente`— inmediatamente antes de la primera sección `## `.
   - Renumerar las dependencias `Borrador MM` de su `## Dependencias` al `NNN` asignado (la referencia queda como el número de la tarea).
   - Anexar al final `## Revisión` con los tres placeholders de veredicto —Subagente, Usuario (ejecución), Usuario (cierre)— en la forma `- <Autor>: [fecha] — [Aprueba | Solicita cambios]`.
5. **Actualizar el índice de `propuesta.md`:** en su sección `## Borradores`, cada referencia `` `MM-slug.md` `` se reescribe a `docs/tasks/NNN-slug.md` y cada `depende de MM` a `depende de NNN`.
6. **Devolver** la correspondencia `MM<TAB>NNN<TAB>ruta` por borrador.
