---
name: registrar-experiencias
description: >
  Registra en EXPERIENCIAS.md las correcciones que el usuario hizo durante
  una tarea, como entradas que documentan la brecha entre el resultado
  esperado y el obtenido.
  Usar al cerrar una tarea en la que el usuario corrigió al agente, o cuando
  el usuario corrija una acción y pida que quede constancia.
  Sinónimos: registrar experiencia, anotar corrección, guardar experiencia,
  aprender de una corrección.
---

# Registrar experiencias

Instrucciones para que un agente registre en `EXPERIENCIAS.md` las acciones que el usuario corrigió durante una tarea, documentando la brecha entre el resultado esperado y el obtenido.

## Cuándo usar

- Al cerrar una tarea durante la cual el usuario corrigió al agente: en la revisión final («solicita cambios») o a mitad de la sesión.
- Cuando el usuario corrija una acción del agente y pida que quede constancia.

## Cuándo no usar

- Cuando la tarea terminó sin correcciones del usuario. Sin correcciones no hay experiencia que registrar.
- En subagentes: solo la sesión donde el usuario corrige puede juzgar qué es una corrección y con qué contexto. Un subagente de revisión nunca registra experiencias.
- Para guardar una decisión de diseño: eso corresponde al skill `decisiones-diseno`.

## Entrada

- La conversación de la sesión actual, donde el usuario corrigió al agente.
- La tarea en curso o recién terminada, referenciada como `docs/tasks/NNN-slug.md`.
- `EXPERIENCIAS.md`, si ya existe.

## Salida

- Una entrada por corrección, añadida al final de `EXPERIENCIAS.md` con el formato definido en «Formato de la entrada».
- `EXPERIENCIAS.md` creado con su cabecera si no existía.

## Principios rectores

1. **Append-only:** las entradas nunca se editan ni se borran. `EXPERIENCIAS.md` es el log de evidencia; la consolidación posterior marca las entradas como `consolidada`, no las elimina.
2. **Registrar la brecha, no solo la corrección:** cada entrada documenta qué se esperaba, qué se obtuvo y qué indicó el usuario. Una corrección sin brecha explicada no enseña nada al agente futuro.
3. **Lenguaje natural:** el lector futuro de cada entrada es un agente; redactar en prosa clara, no en tuplas ni jerga críptica.
4. **Solo la sesión que recibe la corrección registra:** el contexto completo de la corrección solo existe donde el usuario la emitió.
5. **Validar con el usuario:** el usuario es la fuente de la corrección; las entradas se le presentan antes de escribirlas para evitar registrar mal lo que quiso decir.

## Procedimiento

1. **Identificar las correcciones** de la sesión: revisiones donde el usuario solicitó cambios, indicaciones que desviaron el rumbo del trabajo, o peticiones explícitas de registro.
2. **Descartar lo que no es lección:** correcciones meramente mecánicas ya resueltas (una tilde, un nombre de variable) que no contienen nada transferible a tareas futuras. Ante la duda sobre si una corrección es transferible, preguntar al usuario.
3. **Redactar una entrada por corrección** siguiendo el «Formato de la entrada»: un `Id` generado por entrada con el mecanismo de unicidad descrito en «Formato de la entrada», la tarea afectada, lo esperado, lo obtenido y la corrección del usuario.
4. **Comprobar duplicados:** si `EXPERIENCIAS.md` existe, verificar que no haya ya una entrada equivalente (misma tarea y misma corrección) antes de añadirla; el skill puede invocarse a mitad de sesión y otra vez al cierre de la tarea.
5. **Presentar las entradas al usuario** para validación. Si pide ajustes, corregir y volver a presentar.
6. **Crear `EXPERIENCIAS.md`** en la raíz del proyecto si no existe, con la cabecera que declara su naturaleza append-only.
7. **Añadir las entradas** nuevas al final del archivo con `Estado: pendiente`.
8. **Informar al usuario** de las experiencias registradas.

## Formato de la entrada

```markdown
- Id: AAAAMMDDTHHMMSS
  Tarea: docs/tasks/NNN-slug.md
  Esperado: [qué esperaba el usuario]
  Obtenido: [qué produjo el agente]
  Corrección: [lo que el usuario indicó]
  Estado: pendiente | consolidada
```

El `Id` es el timestamp de registro con precisión de segundo (`AAAAMMDDTHHMMSS`), tomado nuevo antes de escribir cada entrada —nunca se reutiliza un mismo timestamp para varias entradas del mismo lote, porque pueden caer en el mismo segundo. Si el timestamp obtenido coincide con un `Id` ya presente en el archivo o ya asignado a otra entrada de esta ejecución, se incrementa un segundo (y se repite si sigue coincidiendo) hasta obtener un `Id` único. Las lecciones consolidadas referencian este `Id`, no la tarea, porque una tarea puede generar varias experiencias.

Una corrección genera una entrada; varias correcciones en la misma tarea generan varias entradas con la misma referencia de tarea.

## Finalización

El skill ha terminado cuando:

- Las entradas validadas por el usuario están añadidas al final de `EXPERIENCIAS.md`.
- Ninguna entrada previa fue editada ni eliminada.
- Si no había correcciones que registrar, no se escribió nada.
