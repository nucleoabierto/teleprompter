---
name: consultar-decisiones
description: >
  Recupera las decisiones de diseño vigentes que rigen un trabajo
  concreto —qué eligió el proyecto sobre sus artefactos, formatos y
  procesos— y las trae al contexto para que el trabajo las respete.
  Usar al comenzar cualquier trabajo del proyecto —una tarea, una
  investigación, la creación de un skill, la edición de documentos— o
  cuando el usuario lo pida.
  Sinónimos: consultar decisiones, buscar decisiones, recuperar
  decisiones aplicables, decisiones de diseño, ADR.
---

# Consultar decisiones

Instrucciones para que un agente recupere las decisiones de diseño que aplican al trabajo que va a realizar, antes de realizarlo. Es una capacidad independiente: puede invocarse desde cualquier skill o en cualquier punto de una sesión, no solo dentro del ciclo de ejecución de tareas.

## Cuándo usar

- Al comenzar un trabajo del proyecto que pueda estar regido por una decisión ya tomada: ejecutar una tarea, crear o editar un skill, modificar artefactos del sistema (`TODO.txt`, propuestas, épicas, roadmap, documentación de dominio o de producto).
- Cuando el usuario pida revisar si hay decisiones que apliquen a algo.
- Cada vez que cambie el trabajo en curso y aparezcan archivos o acciones nuevos no contemplados en una consulta anterior.

## Cuándo no usar

- Para registrar una decisión nueva: eso corresponde a `decisiones-diseno`.
- Para recuperar lecciones aprendidas (brechas observadas entre lo esperado y lo obtenido): eso corresponde a `consultar-lecciones`. Las decisiones registran lo que el proyecto eligió; las lecciones, lo que el proyecto aprendió.
- Cuando el trabajo no toca el proyecto ni sus artefactos (por ejemplo, una pregunta conversacional).

## Entrada

- Una descripción del trabajo a realizar: archivos o rutas que se tocarán, comandos que se ejecutarán, tipo de acción y palabras clave de la actividad.
- `docs/decisions/README.md`, índice de decisiones cuyos disparadores son el contrato de descubrimiento.

## Salida

- Las decisiones de `docs/decisions/` cuyos disparadores coinciden con el trabajo, traídas al contexto para que el agente las respete.
- Si ninguna decisión aplica, esa conclusión explícita; no se inventan decisiones ni se fuerza la coincidencia.

## Principios rectores

1. **Los disparadores son el contrato:** la recuperación es léxica; cada decisión declara en el índice cuándo aplica (archivos, artefactos, palabras clave) y esos disparadores son la única forma de descubrimiento.
2. **Consultar antes de actuar:** una decisión es una elección costosa de revertir; su valor está en respetarla antes de contradecirla, no en descubrirla después.
3. **Traer la decisión, no solo el resumen:** el resumen del índice orienta la coincidencia, pero la justificación completa con sus consecuencias vive en el archivo.
4. **El estado manda:** una decisión `Sustituida` u `Obsoleta` no aplica como vigente; el índice lo declara y el archivo enlaza a la sustituta si la hay.
5. **Sin coincidencia también es resultado:** si ningún disparador aplica, el trabajo continúa sin decisiones; no hace falta justificarlo.

## Procedimiento

1. **Leer `docs/decisions/README.md`** para obtener el índice de decisiones con sus disparadores.
2. **Cotejar los disparadores con el trabajo** delegando en `consultar-artefactos`: la operación `coincidencias` del índice devuelve `archivo`, `estado` y `resumen` de cada entrada cuyos disparadores contienen alguno de los términos del trabajo —archivos, comandos o palabras clave—.
3. **Descartar las no vigentes:** las entradas cuyo estado sea `Sustituida` u `Obsoleta` no aplican; si la sustituta existe y aplica, es la que se trae.
4. **Leer las decisiones aplicables** en `docs/decisions/DNNN-slug.md` y traerlas al contexto.
5. **Informar brevemente** de qué decisiones aplican (o que ninguna aplica) y seguir con el trabajo.

## Finalización

El skill ha terminado cuando:

- Los disparadores del índice se cotejaron con la descripción del trabajo.
- Las decisiones vigentes aplicables están en el contexto, listas para regir el trabajo, o se confirmó que ninguna aplica.
