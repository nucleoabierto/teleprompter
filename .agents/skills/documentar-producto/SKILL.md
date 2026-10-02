---
name: documentar-producto
description: >
  Mantiene la documentación viva de producto del proyecto
  evaluado en su directorio propio (índice, guías, referencia y
  documentos de funcionalidad): tras una tarea del sub-flujo de
  desarrollo evalúa si el cambio altera funcionalidades, flujos
  o referencia de uso y solo entonces actualiza, manteniendo los
  escenarios anclados a la suite de pruebas del proyecto.
  Usar al cerrar una tarea del sub-flujo de desarrollo, cuando
  el usuario pida documentar el producto, o cuando haya que
  crear el documento de una funcionalidad nueva.
  Sinónimos: documentar producto, documentación de producto,
  doc de producto, funcionalidades, living documentation,
  actualizar documentación de uso.
---

# Documentar producto

Instrucciones para que un agente mantenga viva la documentación de producto del proyecto evaluado. La documentación de producto vive en un directorio propio del proyecto que contiene el código —separado del `docs/` de proceso— con un índice navegable, guías, referencia y un documento por funcionalidad. Describe el comportamiento observable (qué hace el producto y cómo usarlo), con escenarios anclados a la suite de pruebas del proyecto para que no queden obsoletos sin que una prueba lo delate.

## Cuándo usar

- Al cerrar una tarea enrutada al sub-flujo de desarrollo —tipo `desarrollo` o `mantenimiento (refactoring)`— en el ciclo de `ejecutar-tareas`, con la ubicación de sus cambios como entrada.
- Cuando el usuario pida documentar o redocumentar el producto.
- Cuando una funcionalidad nueva aparece y no tiene documento en el directorio de producto.

## Cuándo no usar

- Para documentar el modelo del dominio —entidades, invariantes, lenguaje ubicuo—: eso corresponde a `documentar-dominio`. La frontera es de audiencia y contenido: un hecho de comportamiento observable vive en la doc de producto; un hecho de modelo, en `docs/domains/`; cada documento referencia al otro, no lo copia.
- Para evaluar la calidad de la arquitectura: eso corresponde a `revisar-arquitectura`.
- Para registrar decisiones de diseño: usar `decisiones-diseno`.
- Cuando el proyecto no tiene directorio de documentación de producto: crearlo es una decisión que se planifica, no un efecto colateral de este sensor.

## Entrada

- La ubicación de los cambios de la tarea —árbol de trabajo sin commitear o rango de commits—: el skill reconstruye el diff con git a partir de ella, no lo recibe ya materializado (o el comportamiento del producto, si se documenta por primera vez).
- El directorio de documentación de producto del proyecto evaluado: su índice y los documentos existentes (guías, referencia, funcionalidades).
- La suite de pruebas del proyecto, como ancla de los escenarios.
- `assets/feature.txt` como plantilla del documento de funcionalidad.

## Salida

- Documentos del directorio de producto creados o actualizados, y el índice reflejándolos.
- O el veredicto explícito de «sin impacto»: el diff no altera funcionalidades, flujos ni referencia de uso, y la documentación queda como está.

## Principios rectores

1. **Sensor, no carga:** el skill corre en cada tarea del sub-flujo de desarrollo, pero la mayoría de las ejecuciones deben terminar en «sin impacto». Si casi siempre produce cambios, el umbral de relevancia está mal calibrado.
2. **Un hogar por hecho:** cada hecho se define una sola vez. Los hechos del modelo no se repiten en la doc de producto: se referencia el documento de dominio correspondiente.
3. **Indexado o no existe:** todo documento de producto está listado en el índice del directorio; un documento huérfano se da de alta o se elimina.
4. **Anclado a la suite:** cada escenario nombra la prueba que lo verifica —módulo y título, no número de línea— de modo que una funcionalidad no puede quedar obsoleta sin que una prueba lo delate. La suite concreta (archivo, framework) es dato del proyecto evaluado, no parte del formato.
5. **Lenguaje de uso, no de implementación:** los escenarios y las guías describen lo que el usuario observa y hace, no aserciones ni símbolos internos.

## Procedimiento

1. **Delimitar el impacto en producto.** Reconstruir el diff con git a partir de la ubicación indicada —`git status` y `git diff` en el árbol de trabajo, o el rango de commits por sus hashes— e identificar si el cambio altera el comportamiento observable: ¿añade, cambia o elimina una funcionalidad?, ¿cambia un flujo del usuario?, ¿cambia la referencia de uso (formatos, persistencia, contratos externos)? La lista de señales es orientativa, abierta y extensible. Si ninguna aplica, emitir «sin impacto» y terminar.
2. **Localizar los documentos afectados.** Si el cambio es de modelo sin comportamiento nuevo, deriva a `documentar-dominio` y termina con «sin impacto» en producto.
3. **Crear o actualizar los documentos.** Si la funcionalidad no tiene documento, asignar el siguiente número disponible en la sección de funcionalidades y crearlo con `assets/feature.txt` describiendo el comportamiento actual. Si existe, actualizar los escenarios afectados, manteniendo los anclas a la suite.
4. **Actualizar el índice** del directorio con el documento nuevo o los cambios.
5. **Verificar los anclas:** cada escenario citado debe existir en la suite con el módulo y el título declarados; un escenario que la suite ya no verifica indica documentación desfasada y se corrige.
6. **Informar del resultado:** «sin impacto» o documentación actualizada.

## Finalización

El skill ha terminado cuando se cumple una de las dos ramas:

- **Sin impacto:** se emitió el veredicto explícito y no se modificó ningún archivo.
- **Con impacto:** los documentos de producto afectados están creados/actualizados con sus anclas a la suite y el índice los refleja.

## Referencias

- `assets/feature.txt` — Plantilla del documento de funcionalidad. Leer antes de crear un documento nuevo.
- `docs/research/2026-09-documentacion-producto-y-roadmap.md` — Patrón de living documentation y estructura Diátaxis ligera.
- `docs/decisions/D021-documentacion-dominio-y-revision-arquitectura.md` — La división sensor continuo / evaluación ocasional que este skill replica a nivel de producto.
- `docs/decisions/D024-documentacion-producto-separada-anclas-suite.md` — El directorio separado y la convención de ancla doc↔test.
