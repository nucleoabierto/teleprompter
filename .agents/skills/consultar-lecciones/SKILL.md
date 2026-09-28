---
name: consultar-lecciones
description: >
  Recupera las lecciones aprendidas que aplican a un trabajo concreto
  —qué aprendió el proyecto de sus correcciones— y las trae al contexto
  para que el trabajo no repita errores conocidos.
  Usar al comenzar cualquier trabajo del proyecto —una tarea, una
  investigación, la creación de un skill, la edición de documentos— o
  cuando el usuario lo pida.
  Sinónimos: consultar lecciones, buscar lecciones, recuperar lecciones
  aplicables, lecciones aprendidas.
---

# Consultar lecciones

Instrucciones para que un agente recupere las lecciones aprendidas que aplican al trabajo que va a realizar, antes de realizarlo. Es una capacidad independiente: puede invocarse desde cualquier skill o en cualquier punto de una sesión, no solo dentro del ciclo de ejecución de tareas.

## Cuándo usar

- Al comenzar un trabajo del proyecto: ejecutar una tarea, crear o editar un skill, investigar un tema, escribir o editar documentos.
- Cuando el usuario pida revisar si hay lecciones que apliquen a algo.
- Cada vez que cambie el trabajo en curso y aparezcan archivos o acciones nuevos no contemplados en una consulta anterior.

## Cuándo no usar

- Para registrar correcciones nuevas: eso corresponde a `registrar-experiencias`.
- Para agrupar experiencias en notas de lecciones: eso corresponde a `consolidar-lecciones`.
- Cuando el trabajo no toca el proyecto ni sus artefactos (por ejemplo, una pregunta conversacional).

## Entrada

- Una descripción del trabajo a realizar: archivos o rutas que se tocarán, comandos que se ejecutarán, tipo de acción y palabras clave de la actividad.
- `docs/lessons/README.md`, índice de temas cuyos disparadores son el contrato de descubrimiento.

## Salida

- Las notas de `docs/lessons/` cuyos disparadores coinciden con el trabajo, traídas al contexto para que el agente las aplique.
- Si ninguna lección aplica, esa conclusión explícita; no se inventan lecciones ni se fuerza la coincidencia.

## Principios rectores

1. **Los disparadores son el contrato:** la recuperación es léxica; cada lección declara en el índice cuándo aplica (archivos, comandos, palabras clave) y esos disparadores son la única forma de descubrimiento.
2. **Consultar antes de actuar:** las lecciones son brechas ya observadas; su valor está en aplicarlas antes de repetir el error, no después.
3. **Traer la nota, no solo el resumen:** el resumen del índice orienta la coincidencia, pero la lección completa con su «por qué» vive en la nota.
4. **Sin coincidencia también es resultado:** si ningún disparador aplica, el trabajo continúa sin lecciones; no hace falta justificarlo.

## Procedimiento

1. **Leer `docs/lessons/README.md`** para obtener el índice de temas con sus disparadores.
2. **Cotejar los disparadores con el trabajo:** buscar en el índice las entradas cuyos disparadores coincidan con los archivos, comandos o palabras clave del trabajo a realizar. La búsqueda puede hacerse con `grep -iEB1 -- '- Disparadores:.*(palabras)' docs/lessons/README.md`.
3. **Leer las notas aplicables** en `docs/lessons/<tema>.md` y traerlas al contexto.
4. **Informar brevemente** de qué lecciones aplican (o que ninguna aplica) y seguir con el trabajo.

## Finalización

El skill ha terminado cuando:

- Los disparadores del índice se cotejaron con la descripción del trabajo.
- Las notas aplicables están en el contexto, listas para guiar el trabajo, o se confirmó que ninguna aplica.
