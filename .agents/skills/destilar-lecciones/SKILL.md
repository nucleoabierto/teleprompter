---
name: destilar-lecciones
description: >
  Destila las correcciones transferibles que el usuario hizo durante un
  trabajo en lecciones aprendidas: en el mismo acto anexa cada
  corrección como experiencia en el registro append-only del proyecto y
  la destila en la nota del tema correspondiente, con su índice.
  Usar al cerrar una tarea en la que el usuario corrigió al agente,
  cuando el usuario corrija una acción y pida que quede constancia, o
  cuando queden experiencias pendientes de destilar en el registro.
  Sinónimos: destilar lección, registrar experiencia, consolidar
  experiencias, aprender de una corrección, TIL.
---

# Destilar lecciones

Instrucciones para que un agente convierta las correcciones del usuario en lecciones recuperables en el momento en que ocurren —al estilo TIL, capturar el aprendizaje cuando está fresco—. En un solo acto: anexa la experiencia en el registro append-only, escribe o actualiza la nota de lecciones del tema, actualiza el índice de lecciones y marca la experiencia como consolidada. También procesa el registro pendiente acumulado cuando se le invoca sin correcciones frescas.

## Cuándo usar

- Al cerrar una tarea durante la cual el usuario corrigió al agente: en la revisión final («solicita cambios»), en los comentarios del pull request de la tarea o a mitad de la sesión.
- Cuando el usuario corrija una acción del agente y pida que quede constancia.
- Cuando el usuario pida destilar las experiencias pendientes del registro.

## Cuándo no usar

- Cuando la tarea terminó sin correcciones del usuario y el registro no tiene pendientes. Nada que destilar.
- En subagentes: solo la sesión donde el usuario corrige puede juzgar qué es una corrección y con qué contexto. Un subagente de revisión nunca destila lecciones.
- Para guardar una decisión de diseño: eso corresponde al skill `decisiones-diseno`.

## Entrada

- La conversación de la sesión actual, donde el usuario corrigió al agente; o, en modo pendientes, las entradas `pendiente` del registro.
- La tarea en curso o recién terminada, referenciada por la ruta de su archivo, cuando el lote viene de correcciones frescas.
- El registro de experiencias del proyecto —su ubicación la resuelve `operar-experiencias`— y el directorio de lecciones de la convención (`convencion dir_lecciones` de `consultar-artefactos`) con su índice, si existen.

## Salida

- Una entrada de experiencia por corrección transferible, anexada al registro y marcada como consolidada en el mismo acto.
- Las lecciones destiladas en las notas de su tema —nota nueva o existente— y el índice de lecciones actualizado.
- Si no había nada que destilar, ninguna escritura.

## Principios rectores

1. **Destilar en el momento:** la corrección se convierte en lección en el mismo acto que se registra, con el contexto fresco de la sesión. No hay fase «se consolida después»: la distancia pierde contexto y es fricción.
2. **Solo lo transferible es lección:** una lección debe poder reusarse en trabajo futuro. Una corrección acoplada a su tarea —un detalle de implementación, un ajuste menor del proceso específico— no enseña nada a un agente futuro y no se registra. Ante la duda sobre si una corrección es transferible, preguntar al usuario.
3. **La evidencia es append-only:** el registro de experiencias es la fuente de verdad; sus entradas nunca se editan ni se borran, solo se marcan como consolidadas. Las notas de lecciones son la capa derivada: pueden reescribirse, fusionarse o retirarse porque la evidencia persiste.
4. **Registrar la brecha, no solo la corrección:** cada entrada documenta qué se esperaba, qué se obtuvo y qué indicó el usuario. Una corrección sin brecha explicada no enseña nada.
5. **Una sola puerta de validación:** el usuario aprueba en una sola presentación las entradas y su destilación —temas, notas nuevas o actualizadas e índice—. Es la fuente de la corrección; nada se escribe sin su OK.
6. **Agrupar por tema, no por tarea:** varias correcciones de trabajos distintos pueden formar una sola lección si apuntan al mismo tema.
7. **Los disparadores son el contrato de descubrimiento:** cada lección declara cuándo aplica (patrones de archivo, de comando o palabras clave), porque la recuperación es léxica.
8. **Solo la sesión que recibe la corrección destila:** el contexto completo de la corrección solo existe donde el usuario la emitió.

## Procedimiento

1. **Reunir el lote.** Si la sesión tuvo correcciones del usuario —revisiones que solicitaron cambios, comentarios del pull request, indicaciones que desviaron el rumbo, peticiones explícitas de registro—, el lote son esas correcciones. Si no hubo, listar las entradas `pendiente` del registro delegando «las experiencias pendientes» en `operar-experiencias` y el lote son esas entradas. Si el lote queda vacío, informar y terminar sin escribir.
2. **Filtrar lo no transferible.** Descartar las correcciones que no son reutilizables en trabajo futuro: detalles de implementación propios de la tarea, ajustes mecánicos ya resueltos (una tilde, un nombre de variable), correcciones menores del proceso específico. La pregunta de filtro es «¿actuaría distinto un agente futuro en otra tarea conociendo esto?»; si la respuesta es no, la corrección no se registra ni se destila. Las entradas `pendiente` del backlog se consideran ya filtradas —pasaron por validación al registrarse—; solo se cotejan.
3. **Comprobar duplicados** para las correcciones frescas: verificar que el registro no tenga ya una entrada equivalente —misma tarea y misma corrección— recuperando «las experiencias de la tarea `<ref>`» de `operar-experiencias`; el skill puede invocarse a mitad de sesión y otra vez al cierre.
4. **Redactar las entradas de experiencia** de las correcciones frescas con el contenido de «Contenido de la entrada»: un identificador único por entrada, delegando su generación en `operar-experiencias` y pasando como ocupados los del mismo lote.
5. **Cotejar el lote contra las lecciones existentes.** Mapear cada corrección a las notas cuyos disparadores coincidan con su contenido —qué se corrigió y sobre qué archivos—, con la operación `coincidencias` de `consultar-artefactos` sobre el índice de lecciones —el mismo mecanismo léxico que usa `consultar-lecciones`—. Clasificar cada una: ya cubierta por una lección, refuerzo de una nota existente, contradicción con una lección, o tema nuevo.
6. **Presentar el paquete de destilación al usuario** en una sola propuesta: las entradas a anexar y, para cada tema, el título de la nota, las lecciones que la componen y su clasificación. Las contradicciones se plantean en esta misma presentación. Si el usuario ajusta, corregir y repetir; puede aprobar solo en parte —las entradas del backlog no aprobadas quedan `pendiente`; las correcciones frescas no aprobadas no se registran.
7. **Escribir todo en el mismo acto**, solo tras la aprobación:
   - Anexar las entradas nuevas al registro delegando «anexar esta entrada» en `operar-experiencias`, que crea el registro con su cabecera si no existe y fija el estado inicial.
   - Crear o actualizar la nota de cada tema en el directorio de lecciones con el «Formato de la nota»: regla imperativa, porqué, disparadores y origen —los identificadores de las experiencias que la originaron—. Las correcciones ya cubiertas no generan lección nueva; las de refuerzo se integran en la nota existente añadiendo su identificador al `Origen`. Revisar las lecciones existentes del tema: fusionar las que digan lo mismo, reescribir las que una corrección contradiga según lo acordado y mantener el resto.
   - Actualizar el índice de lecciones con una entrada por tema, siguiendo el formato declarado en el comentario del propio índice.
   - Marcar como consolidadas las entradas procesadas —las nuevas anexadas y las del backlog destilado, cubiertas incluidas— delegando «marcar consolidadas» en `operar-experiencias`. Lo aprobado parcialmente marca solo lo procesado.
8. **Informar al usuario** de las experiencias registradas y de las notas creadas o actualizadas.

## Contenido de la entrada

Cada entrada documenta la brecha entre lo esperado y lo obtenido: un identificador único, la tarea afectada, qué esperaba el usuario, qué produjo el agente y la corrección que indicó. La forma escrita —un campo por línea, el identificador por timestamp con resolución de colisiones, el estado inicial— la define y valida `operar-experiencias` al anexar; este skill solo redacta el contenido.

Una corrección genera una entrada; varias correcciones en la misma tarea generan varias entradas con la misma referencia de tarea. Las lecciones referencian el identificador de la experiencia, no la tarea, porque una tarea puede generar varias experiencias.

## Formato de la nota

```markdown
# [Tema]

## Lecciones

- **[Regla imperativa en una frase].** [Por qué: la brecha esperado-obtenido que la originó.]
  Disparadores: [patrones de archivo, de comando o palabras clave]
  Origen: <id> [, <id>, ...]
```

`Origen` lista los identificadores de las experiencias del registro que originaron la lección, separados por comas. Así se puede reconstruir cómo se generó cada lección, incluso cuando fusiona experiencias de tareas distintas.

El formato de las entradas del índice se declara en el propio índice, que es su fuente única de verdad.

## Finalización

El skill ha terminado cuando:

- El usuario aprobó el paquete de destilación —entradas y agrupación por temas, informada por el cotejo contra las lecciones existentes—.
- Cada corrección procesada tiene su entrada anexada y marcada consolidada, y cada tema su nota con lecciones y disparadores, con el índice actualizado.
- Ninguna entrada previa del registro fue editada ni eliminada.
- Si no había nada transferible que destilar, no se escribió nada.
