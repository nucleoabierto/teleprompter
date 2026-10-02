---
name: liberar-version
description: >
  Libera una versión del proyecto evaluado: cura los cambios no
  liberados del changelog, propone el bump semver justificado por
  los tipos de cambio acumulados y, tras la confirmación del
  usuario, promueve la sección a la nueva versión con su fecha.
  Usar cuando se pida liberar o publicar una versión, cerrar un
  ciclo de cambios o promover los no liberados del changelog.
  Sinónimos: liberar versión, publicar versión, release, nueva
  versión, promover no liberados, bump semver.
---

# Liberar versión

Instrucciones para que un agente libere una versión del proyecto evaluado. La liberación es el segundo momento del modelo de changelog: lo que `mantener-changelog` acumuló como borrador en la sección de no liberados se cura, se convierte en propuesta de bump semver —major, minor o patch— justificada por los tipos de cambio presentes y, tras la confirmación del usuario, se promueve a una sección de versión con su fecha. El skill es agnóstico de tecnología: gestiona la anotación de la versión —el changelog y, cuando el proyecto la ofrece, su fuente de versión detectable—; las etiquetas de git, los paquetes y los despliegues son decisión de cada proyecto.

## Cuándo usar

- Cuando el usuario pida liberar o publicar una versión del proyecto evaluado.
- Al cerrar un ciclo de cambios acumulados en la sección de no liberados del changelog.
- Cuando el usuario pida retirar una versión ya publicada: se marca `[YANKED]`, no se borra.

## Cuándo no usar

- Para registrar cambios en los no liberados: eso corresponde a `mantener-changelog`.
- Para la publicación real —etiquetas de git, paquetes, despliegues—: queda fuera del alcance; el skill gestiona la anotación de la versión en el changelog y en la fuente detectable del proyecto, y la distribución es decisión de cada proyecto.
- Cuando la sección de no liberados está vacía: no hay nada que liberar y se informa sin escribir.

## Entrada

- El changelog del proyecto evaluado: `CHANGELOG.md` en la raíz es la convención; otra ubicación o nombre es un dato de entrada.
- La fuente de verdad de la versión actual —la última versión del changelog, el manifiesto del proyecto u otra que el proyecto use—: se detecta o se pregunta al usuario, nunca se asume ni se fija a un gestor concreto.
- `references/promocion-y-semver.md`: la lista de curación previa a la promoción, la correspondencia entre categorías y bump, y la mecánica de la materialización. Cargarlo al proponer el bump y al promover.

## Salida

- La nueva sección `## [X.Y.Z] - YYYY-MM-DD` en el changelog con los cambios curados, una sección `## [Unreleased]` vacía encima y los enlaces comparativos actualizados cuando el formato los tiene; y la versión del proyecto actualizada en su fuente detectable —manifiesto o herramienta propia— cuando el proyecto la ofrece.
- O el veredicto «nada que liberar»: los no liberados están vacíos y el changelog queda como está.
- O la liberación cancelada por el usuario tras la propuesta.
- O la versión retirada: el encabezado de su sección marcado `[YANKED]` y el contenido conservado.

## Principios rectores

1. **La versión la decide el humano:** el skill propone el bump con justificación derivable —qué tipos de cambio lo producen— pero la confirmación es del usuario, que puede aceptar el número, ajustarlo o cancelar la liberación.
2. **Curar antes de promover:** el material acumulado es borrador; antes de convertirse en versión se revisa —fusionar duplicados, quitar detalle interno, clarificar el impacto y hacer visibles las rupturas— y los cambios de curación se presentan al usuario junto a la propuesta, no se aplican en silencio.
3. **La señal más fuerte manda:** cuando conviven varios tipos de cambio, el bump propuesto es la señal más fuerte presente: rupturas ante todo, después funcionalidad, después correcciones.
4. **Fuente de verdad explícita:** la versión actual se obtiene del changelog, del manifiesto del proyecto o del usuario; nunca de una suposición ni de una ruta fija de un gestor concreto.
5. **Agnóstico de tecnología:** el skill escribe el changelog y, cuando el proyecto la ofrece, su fuente de versión detectable; etiquetas, paquetes y despliegues quedan fuera de su alcance.

## Procedimiento

Si lo pedido es retirar una versión ya publicada —no liberar una nueva—, el procedimiento es directo: confirmar la retirada con el usuario y añadir el marcador `[YANKED]` al encabezado de su sección sin borrarla. Los pasos siguientes no aplican.

1. **Localizar el changelog y los no liberados.** Buscar el changelog del proyecto evaluado; si no existe, o si no tiene sección de no liberados o la tiene vacía, informar «nada que liberar» y terminar sin modificar archivos.
2. **Determinar la versión actual.** Leer la última versión anotada en el changelog y contrastarla con la fuente de verdad del proyecto cuando exista. Si no se puede determinar o las fuentes divergen, preguntar al usuario.
3. **Curar en borrador los no liberados.** Producir la versión curada de las entradas sin escribirla todavía en el archivo —la escritura ocurre en el paso 6, tras la confirmación— aplicando la lista de curación de `references/promocion-y-semver.md`: fusionar duplicados, eliminar lo que se anula en el mismo periodo, quitar detalle interno sin impacto, reformular lo poco claro, corregir categorías y marcar las rupturas con `**Breaking:**`.
4. **Proponer el bump con justificación.** Clasificar los cambios curados por categoría y aplicar la correspondencia semver de la referencia: la señal más fuerte presente fija major, minor o patch. Presentar al usuario la versión propuesta, la justificación —las categorías que la producen— y la curación propuesta.
5. **Confirmar con el usuario.** Esperar su decisión: acepta el número propuesto, indica otro —con el que se continúa— o cancela la liberación. Nada se promueve sin esta confirmación.
6. **Materializar la promoción.** Escribir en el archivo las entradas curadas, renombrar `## [Unreleased]` a `## [X.Y.Z] - <fecha ISO del día>`, abrir una sección `## [Unreleased]` vacía encima y actualizar los enlaces comparativos del pie cuando el archivo los tenga: el nuevo `Unreleased` compara la nueva versión con HEAD.
7. **Actualizar la versión del proyecto si hay herramientas detectables.** Opcional y solo cuando el proyecto lo permite: si la fuente de verdad detectada en el paso 2 es un artefacto que materializa la versión —un manifiesto del proyecto o una herramienta propia de versionado—, actualizarla a la nueva versión con los medios del propio proyecto. Si no se detecta ninguna, el paso se omite y el changelog basta como anotación.
8. **Informar del resultado:** versión liberada —con la fuente del proyecto actualizada si procedía—, «nada que liberar» o liberación cancelada. Al liberar, recordar que etiquetar, publicar y desplegar son pasos posteriores propios de cada proyecto.

## Finalización

El skill ha terminado cuando se cumple una de las cuatro ramas:

- **Nada que liberar:** se emitió el veredicto y el changelog no se modificó.
- **Liberada:** el changelog tiene la sección `## [X.Y.Z] - fecha` con los cambios curados, un `## [Unreleased]` nuevo y vacío encima y los enlaces actualizados —y la fuente de versión del proyecto actualizada cuando procedía—, todo confirmado por el usuario.
- **Cancelada:** el usuario rechazó la propuesta y el changelog quedó como estaba.
- **Retirada:** la petición era retirar una versión; su encabezado quedó marcado `[YANKED]` tras la confirmación y su contenido se conserva.

## Referencias

- `references/promocion-y-semver.md` — Lista de curación previa a la promoción, correspondencia entre categorías y bump semver, y mecánica de la materialización con enlaces comparativos. Leer al proponer el bump y al promover.
- `docs/research/2026-09-changelog-y-versionado-semantico.md` — Investigación que motiva el skill: modelo de dos momentos, correspondencia semver y ciclo de vida de los no liberados.
- `.agents/skills/mantener-changelog/` — Skill hermano que produce el material en borrador que este skill promueve.
