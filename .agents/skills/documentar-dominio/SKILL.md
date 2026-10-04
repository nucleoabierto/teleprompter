---
name: documentar-dominio
description: >
  Mantiene la documentación viva de los dominios del proyecto
  bajo docs/domains/: tras una tarea del sub-flujo de desarrollo
  evalúa si el cambio altera conceptos, invariantes o fronteras
  del dominio y solo entonces actualiza; si detecta divergencia
  estructural, recomienda una revisión de arquitectura.
  Usar al cerrar una tarea del sub-flujo de desarrollo, cuando
  el usuario pida documentar un dominio, o cuando haya que crear
  el documento de un dominio nuevo.
  Sinónimos: documentar dominio, documentación de dominio,
  dominio vivo, glosario del dominio, actualizar dominio.
---

# Documentar dominio

Instrucciones para que un agente mantenga la documentación viva de los dominios. Los dominios se documentan en el `docs/domains/` del proyecto que contiene el código del dominio —la documentación vive junto al código que describe—: un documento por dominio y un índice obligatorio. La documentación separa la referencia del modelo (lenguaje ubicuo, entidades, invariantes, operaciones) de la explicación del dominio (propósito, fronteras, decisiones) y ancla sus afirmaciones a elementos de código para poder detectar deriva.

## Cuándo usar

- Al cerrar una tarea enrutada al sub-flujo de desarrollo —tipo `desarrollo` o `mantenimiento (refactoring)`— en el ciclo de `ejecutar-tareas`, con la ubicación de sus cambios como entrada.
- Cuando el usuario pida documentar o redocumentar un dominio.
- Cuando un dominio nuevo aparece y no tiene documento en `docs/domains/`.

## Cuándo no usar

- Para evaluar la calidad de la arquitectura: eso corresponde a `revisar-arquitectura`, que este skill puede recomendar pero no ejecuta.
- Para documentar el comportamiento observable del producto —funcionalidades, flujos del usuario, referencia de uso—: eso corresponde a `documentar-producto`. La frontera es de audiencia y contenido: un hecho de modelo vive en `docs/domains/`; un hecho de comportamiento, en el directorio de documentación de producto; cada documento referencia al otro, no lo copia.
- Para registrar decisiones de diseño: usar `decisiones-diseno`.

## Entrada

- La ubicación de los cambios de la tarea —árbol de trabajo sin commitear o rango de commits—: el skill reconstruye el diff con git a partir de ella, no lo recibe ya materializado (o el código del dominio, si se documenta por primera vez).
- `docs/domains/` como documentación existente: `README.md` (índice) y los documentos `NNN-slug.md`.
- `assets/domain.txt` como plantilla del documento de dominio.

## Salida

- Documentos de `docs/domains/` creados o actualizados, y el índice `README.md` reflejándolos.
- O el veredicto explícito de «sin impacto»: el diff no altera conceptos, invariantes ni fronteras del dominio, y la documentación queda como está.
- Si la evaluación detecta divergencia estructural (el código ya no se explica con el modelo documentado, aparecen fronteras nuevas o se difuminan las existentes), una recomendación de invocar `revisar-arquitectura`, comunicada al ejecutor o al usuario.

## Principios rectores

1. **Sensor, no carga:** el skill corre en cada flujo de desarrollo, pero la mayoría de las ejecuciones deben terminar en «sin impacto». Si casi siempre produce cambios, el umbral de relevancia está mal calibrado.
2. **Un hogar por hecho:** cada concepto del dominio se define una sola vez; otros documentos lo referencian en lugar de copiarlo.
3. **Indexado o no existe:** todo documento de dominio está listado en `docs/domains/README.md`; un documento huérfano se da de alta o se elimina.
4. **Anclado al código:** las afirmaciones del documento (glosario, modelo, fronteras) nombran los elementos de código que las materializan —clases, funciones, archivos— para que la divergencia sea detectable. El ancla apunta a lo que cambia (el código), no a su historia: la procedencia del concepto puede añadirse como campo «Origen» (tarea o épica), que es complementaria y opcional.
5. **Superseder, no reescribir:** la historia del dominio no se borra; si una descripción deja de ser válida se actualiza el documento y la divergencia queda visible en su estado de salud, no se oculta.

## Procedimiento

1. **Delimitar el dominio afectado.** Reconstruir el diff con git a partir de la ubicación indicada —`git status` y `git diff` en el árbol de trabajo, o el rango de commits por sus hashes— e identificar a qué dominio pertenece el cambio y si existe ya su documento en `docs/domains/`. Si el proyecto tiene varios dominios, trabajar solo los tocados.
2. **Evaluar el impacto.** Contrastar el diff con el documento del dominio: ¿introduce o renombra conceptos del lenguaje ubicuo?, ¿cambia entidades o invariantes del modelo?, ¿mueve responsabilidades entre fronteras?, ¿crea un dominio nuevo? La lista de preguntas es orientativa, abierta y extensible —cualquier cambio que altere lo que el documento afirma cuenta como impacto—. Si ninguna aplica, emitir «sin impacto» y terminar.
3. **Crear o actualizar el documento.** Si el dominio no tiene documento, asignar el siguiente número disponible en `docs/domains/` —operación `siguiente` de `consultar-artefactos`; serie propia de dominios: `001`, `002`, …— y crearlo con `assets/domain.txt` documentando el estado actual. Si existe, actualizar las secciones afectadas, manteniendo los anclas a elementos de código.
4. **Actualizar el índice** `docs/domains/README.md` con el documento nuevo o los cambios de estado.
5. **Actualizar el estado de salud** del documento: fecha de la revisión y divergencias conocidas o resueltas.
6. **Evaluar divergencia estructural.** Si el código ya no se explica con el modelo documentado —responsabilidades que cruzan fronteras, conceptos sin hogar, estructura que contradice las fronteras declaradas—, registrar la divergencia en el estado de salud y recomendar invocar `revisar-arquitectura`.
7. **Informar del resultado:** «sin impacto», documentación actualizada, o divergencia detectada con su recomendación.

## Finalización

El skill ha terminado cuando se cumple una de las dos ramas:

- **Sin impacto:** se emitió el veredicto explícito y no se modificó ningún archivo.
- **Con impacto:** los documentos de dominio afectados están creados/actualizados con sus anclas al código, el índice los refleja y el estado de salud está al día. Si además se detectó divergencia estructural, la recomendación de `revisar-arquitectura` quedó comunicada.

## Referencias

- `assets/domain.txt` — Plantilla del documento de dominio. Leer antes de crear un documento nuevo.
- `docs/research/2026-09-revision-arquitectura-y-documentacion-dominio.md` — Investigación que motiva el skill: documentación viva como sensor continuo, formatos (arc42 reducido, un hogar por hecho, anclas doc↔código).
