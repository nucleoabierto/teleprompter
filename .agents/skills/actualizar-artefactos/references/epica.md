# Reglas de la épica

Reglas del artefacto «épica»: el documento de planeación de un conjunto de tareas. Las mecánicas compartidas de secciones y revisión son las de `tarea.md` de este mismo directorio. Este documento declara lo que la épica tiene de propio: su estado acumulativo y su enlace desde el índice. Hogar: `actualizar-artefactos`; lo consume también `consultar-artefactos` por referencia cruzada: `../actualizar-artefactos/references/epica.md`.

## Ubicación y literales

- Un documento por épica en `docs/epics/`, nombrado `NNN-slug.md` —serie continua: el mayor `NNN` de los archivos del directorio, más uno, a tres dígitos—.
- Los literales llevan los valores por defecto de la convención; un proyecto que difiere los edita aquí.

## Formato del artefacto

Un documento con título `# ` y secciones `## ` (objetivo, alcance, `## Piezas`, plan técnico, criterio de cierre y `## Estado`) que sigue las mecánicas de `tarea.md` con esta particularidad:

- Su `## Estado` es **acumulativo**: la línea de opciones `[ ] Planificada | [ ] Completada` va marcando `[x]` cada opción alcanzada sin desmarcar las anteriores y sin negritas. `[x] Planificada | [ ] Completada` es una épica planificada; `[x] Planificada | [x] Completada`, completada. El estado se resuelve por la opción marcada más avanzada: `completada` si `[x] Completada`, `planificada` si `[x] Planificada`, `otro` en cualquier otro caso.

## Vínculo con el índice

La agrupación del índice de tareas enlaza a su épica con el comentario `<!-- épica: <ruta> -->` bajo el encabezado `## Hito N:`. Las reglas del enlace y de la agrupación están en `indice-tareas.md`.

## Operaciones

- Las de lectura y escritura de `## Estado`, secciones y revisión son las de `tarea.md`.
- El avance del estado se escribe con `marcar-opcion` (marca `[x]` la opción dada sin tocar las demás), no con `estado`: la línea acumulativa no lleva opción vigente en negrita.
