# Lecciones aprendidas

Índice de las lecciones que el proyecto destiló de sus correcciones.
Cada lección vive en un archivo `<tema>.md` de este directorio y es
producida por el skill `destilar-lecciones` a partir de las entradas
de `EXPERIENCIAS.md`.

Cada entrada del índice declara el archivo, un resumen de una frase y
sus disparadores: los patrones de archivo, de comando o palabras clave
que hacen aplicable la lección. Los disparadores son el contrato de
descubrimiento: quien vaya a tocar algo listado aquí debe leer la
lección antes de actuar.

<!--
Formato de entrada del índice:

- [<tema>.md](<tema>.md) — resumen de una frase de la lección.
  - Disparadores: patrones de archivo, comandos o palabras clave
-->

## Lecciones

- [revision-tecnica-subagente.md](revision-tecnica-subagente.md) —
  la revisión técnica independiente necesita un subagente que pueda
  ejecutar comandos.
  - Disparadores: `revisar-implementacion`, subagente, `git diff`,
    revisión técnica, suite de pruebas, pull request
- [documentacion-viva.md](documentacion-viva.md) — la documentación
  de largo plazo no registra acciones puntuales históricas.
  - Disparadores: `docs/`, documentación, manual, changelog,
    detalle histórico, acción puntual
- [promocion-de-tareas.md](promocion-de-tareas.md) — al promocionar
  tareas, verificar los números ocupados y acotar los globs a los
  archivos propios.
  - Disparadores: `docs/tasks/`, numeración, promoción, propuesta,
    borradores, glob, serie
- [abstraccion-segundo-eje.md](abstraccion-segundo-eje.md) — al
  crecer un recorrido a un segundo eje, elevar la abstracción en
  vez de anidar ramas en el bucle existente.
  - Disparadores: `src/dependencies.js`, resolvedor, orígenes,
    recorrido, `visit`, mapas paralelos, refactor
