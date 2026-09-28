---
name: decisiones-diseno
description: >
  Registra una decisión de diseño que da forma al proyecto y es costosa
  de revertir, creando un archivo con su contexto, su justificación y
  su estado.
  Usar cuando se tome una decisión relevante para la arquitectura o los
  principios del proyecto, o como parte del flujo de revisión tras
  completar una tarea que introduzca cambios estructurales.
  Sinónimos: registrar decisión, registro de decisión, ADR, decisión de
  arquitectura, decisión de diseño.
---

# Registrar decisiones de diseño

Instrucciones para que un agente registre una decisión de diseño siguiendo el formato del proyecto.

## Cuándo usar

- Cuando se tome una decisión que dé forma al proyecto y sea costosa de revertir.
- Como parte del flujo de revisión tras completar una tarea que introduzca cambios estructurales, si se identifica una decisión implícita que merece quedar registrada.
- Cuando el usuario pida explícitamente registrar una decisión.

## Cuándo no usar

- Para decisiones triviales o fácilmente reversibles: basta con el commit y el historial de git.
- Para registrar el progreso de una tarea: usar el skill `crear-tareas`, `TODO.txt` y el archivo de tarea.
- Para definir reglas operativas permanentes del agente: usar las reglas siempre activas (p. ej. `AGENTS.md` o el sistema de reglas del arnés).
- Para describir la visión o el propósito del proyecto: usar el documento de visión o el README.

## Entrada

- La decisión a registrar, descrita por el usuario o inferida del cambio que la motiva.
- El contexto en que se tomó: qué problema o fuerzas la motivaron.
- `docs/decisions/` como directorio de decisiones existentes, para determinar el siguiente número disponible.

## Salida

- Un archivo `docs/decisions/DNNN-slug.md` con la decisión redactada según el formato del proyecto.
- Estado inicial `Aceptada`.
- `docs/decisions/README.md` actualizado con la entrada de la nueva decisión.

## Principios rectores

1. **Una decisión por archivo:** cada decisión es autónoma y referenciable por su identificador.
2. **Inmutabilidad relativa:** la decisión no se reescribe una vez aceptada. Si cambia, se marca como `Sustituida` o `Obsoleta` y se crea una nueva decisión que la reemplaza.
3. **Trazabilidad:** el identificador estable permite enlazar la decisión desde `TODO.txt`, archivos de tarea y otros documentos.
4. **Justificación explícita:** el *porqué* es más importante que la decisión concreta. La justificación explica las alternativas y las consecuencias.
5. **Mínima ceremonia:** el formato tiene solo las secciones necesarias. No añadir secciones opcionales salvo que aporten valor.
6. **Distinción frente a tareas y reglas:** una decisión no es una tarea ni una regla operativa. Si el contenido corresponde a otro tipo de documento, no usar este skill.

## Procedimiento

1. **Determinar el siguiente número disponible.** Listar `docs/decisions/` y tomar el número siguiente al último existente. Si el directorio no existe, crearlo y empezar en `D001`.
2. **Redactar el título.** Frase nominal breve que describe la decisión, no el problema. Por ejemplo: «`TODO.txt` como índice único de tareas», no «Cómo organizar las tareas».
3. **Redactar el contexto.** Dos a cuatro frases que describan las fuerzas en juego: qué problema motivó la decisión, qué opciones estaban sobre la mesa, qué restricciones aplican. Sin justificar la decisión todavía.
4. **Redactar la decisión.** Una a tres frases, en presente y en primera persona del plural, que digan qué se decidió de forma clara y concreta.
5. **Redactar la justificación.** Explicar por qué se tomó esta decisión y no otra. Listar las alternativas consideradas si aporta valor. Describir las consecuencias, positivas y negativas.
6. **Añadir referencias** si enlazan a tareas, investigaciones u otros documentos existentes en el repositorio. Si no hay, omitir la sección.
7. **Revisar la redacción y pulir mecánicamente** el borrador antes de presentarlo al usuario. Si el arnés lo permite, invocar primero el skill `revisar-redaccion` en modo preventivo y, con su salida, el skill `pulir-escritura` en modo preventivo; de lo contrario, realizar el equivalente manualmente.
8. **Presentar el borrador al usuario** para aprobación. Si solicita cambios, ajustar y repetir desde el paso 2. Si lo rechaza, no crear archivo y terminar.
9. **Tras la aprobación, crear el archivo** en `docs/decisions/DNNN-slug.md`, donde `DNNN` es el identificador completo (prefijo `D` más el número de tres dígitos) y `slug` es una versión en kebab-case del título.
10. **Registrar la decisión en el índice** `docs/decisions/README.md`: añadir una entrada con el nombre del archivo, sus disparadores —archivos, artefactos y palabras clave que hagan aplicable la decisión—, un resumen de una frase y su estado, siguiendo el formato declarado en el propio índice.
11. **Si la nueva decisión sustituye o deja obsoleta una decisión existente**, actualizar el archivo anterior: cambiar su línea de `Estado` a `Sustituida por DNNN` o `Obsoleta`, y añadir el enlace a la nueva decisión en la sección `Referencias`. La decisión original no se reescribe: solo se cambia el estado y se enlaza. Actualizar también su entrada del índice: el campo `Estado` refleja la sustitución o la obsolescencia, y el resumen se ajusta si la aplicabilidad cambió.

## Finalización

El skill ha terminado cuando:

- El usuario ha aprobado la decisión.
- El archivo de decisión está creado en `docs/decisions/` y registrado en `docs/decisions/README.md`.
- El contenido sigue el formato y las reglas.
- Si la decisión sustituye a una anterior, el archivo anterior y su entrada del índice están actualizados.

## Referencias

- `references/que-es-una-decision.md` — Definición de qué constituye una decisión de diseño y qué no, con ejemplos. Leer cuando haya duda sobre si algo es o no una decisión de diseño.
- `references/formato.md` — Plantilla, reglas y ejemplo del formato de las decisiones. Leer al redactar una nueva decisión.
