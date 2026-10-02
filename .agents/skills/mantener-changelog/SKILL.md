---
name: mantener-changelog
description: >
  Mantiene el changelog del proyecto evaluado: tras una tarea
  evalúa si el cambio tiene impacto observable para el consumidor
  y, cuando lo tiene, lo registra en la sección de no liberados
  fusionándolo con la entrada de su agrupación cuando existe.
  Usar al cerrar una tarea, cuando el usuario pida actualizar el
  changelog o cuando haya que crear el changelog de un proyecto.
  Sinónimos: mantener changelog, actualizar changelog, registrar
  cambio, entrada de changelog, changelog del proyecto.
---

# Mantener changelog

Instrucciones para que un agente mantenga el changelog del proyecto evaluado. El changelog es el registro consumible por los usuarios del producto: un archivo plano del repositorio en formato Keep a Changelog, con una sección de no liberados donde se acumulan los cambios hasta que el proceso de liberación los promueve a una versión. La unidad de registro es el cambio notable para el usuario, no la tarea: cuando el cambio pertenece a una agrupación —épica, propuesta o encabezado ligero del índice de tareas— la entrada de la agrupación lo absorbe en lugar de duplicarse.

## Cuándo usar

- Al cerrar una tarea del proyecto evaluado, con la ubicación de sus cambios como entrada.
- Cuando el usuario pida registrar un cambio o actualizar el changelog.
- Cuando el proyecto evaluado no tenga changelog y haya que inicializarlo.

## Cuándo no usar

- Para liberar una versión —promover los no liberados a `X.Y.Z`, calcular el bump o actualizar los enlaces comparativos—: eso corresponde a `liberar-version`.
- Para registrar decisiones de diseño, correcciones del usuario o documentación de dominio y producto: corresponde a `decisiones-diseno`, `registrar-experiencias`, `documentar-dominio` y `documentar-producto`.
- Para cambios sin impacto observable: el skill los evalúa y emite el veredicto «sin entrada», no los registra.

## Entrada

- La ubicación de los cambios a registrar —árbol de trabajo sin commitear o rango de commits de la tarea—: el skill reconstruye el diff con git a partir de ella, no lo recibe ya materializado.
- El changelog del proyecto evaluado: `CHANGELOG.md` en la raíz es la convención; si el proyecto lo ubica en otra parte o usa otro nombre, esa ubicación es un dato de entrada. Si no existe, se inicializa solo cuando hay algo que registrar.
- Los artefactos de agrupación del sistema de tareas del proyecto evaluado, cuando existen —épicas, propuestas, encabezados del índice de tareas—, para resolver la agregación.
- `references/formato-y-agregacion.md`: la estructura del formato, la plantilla de inicialización, los criterios de notabilidad y la política de agregación. Cargarlo al inicializar el changelog o al redactar y fusionar entradas.

## Salida

- El changelog actualizado: la entrada nueva o fusionada en la sección de no liberados, o el changelog inicializado cuando no existía y había cambio que registrar.
- O el veredicto explícito de «sin entrada»: el cambio no tiene impacto observable para el consumidor y el changelog queda como está.

## Principios rectores

1. **Sensor, no registro exhaustivo:** el skill corre al cerrar cada tarea, pero el trabajo interno sin impacto observable —proceso, formato, dependencias de desarrollo, cambios que se anulan entre sí— termina en «sin entrada». El criterio de inclusión es el impacto para el consumidor del producto, no el esfuerzo realizado.
2. **La unidad es el cambio, no la tarea:** una agrupación de tareas que produce un cambio notable genera una sola entrada que absorbe las contribuciones de sus piezas; solo una tarea suelta y notable genera entrada propia.
3. **Una entrada es una línea:** el mensaje breve va en el changelog; la explicación larga vive en la referencia enlazada —el artefacto de la agrupación, la tarea o el documento de funcionalidad.
4. **Borrador con contexto fresco:** las entradas se escriben al cerrar la tarea, cuando el diff y el contexto están presentes, y quedan como material en borrador que la liberación vuelve a curar: fusionar duplicados, clarificar el impacto y hacer visibles las rupturas.
5. **Formato fijo:** las categorías son las seis de Keep a Changelog y no crecen; el tipo de cambio va en la categoría y el porqué importa va en la redacción.

## Procedimiento

1. **Evaluar la notabilidad.** Reconstruir el diff con git a partir de la ubicación indicada —`git status` y `git diff` en el árbol de trabajo, o el rango de commits por sus hashes— y decidir si el cambio tiene impacto observable para el consumidor —funcionalidad nueva, comportamiento cambiado, corrección, eliminación, deprecación o seguridad— según los criterios de la referencia. Si no aplica, emitir «sin entrada» y terminar sin modificar archivos.
2. **Localizar o inicializar el changelog.** Buscar `CHANGELOG.md` en la raíz del proyecto evaluado; si no está, localizar el archivo equivalente que el proyecto use. Si no existe, crearlo con la plantilla de `references/formato-y-agregacion.md`.
3. **Resolver la agregación.** Determinar si el cambio pertenece a una agrupación —épica, propuesta o encabezado ligero— y si esa agrupación ya tiene entrada en los no liberados: si la tiene, fusionar el cambio en ella reformulando la línea si la nueva contribución la amplía, o no escribir nada si ya está cubierta; si no la tiene y el conjunto es notable como unidad, crear la entrada de la agrupación; si el cambio no pertenece a ninguna agrupación —o su agrupación no es notable como unidad—, crear entrada propia. El enlace de la entrada apunta al artefacto de la agrupación cuando existe, no a cada tarea.
4. **Clasificar y redactar.** Asignar la categoría —`Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` o `Security`— y prefijar con `**Breaking:**` en línea cuando el cambio sea incompatible con la interfaz pública que el proyecto declare. Redactar una línea autodescriptiva en el idioma del changelog, con la referencia al artefacto de origen entre paréntesis.
5. **Escribir en los no liberados.** Añadir la entrada bajo su categoría —crear el encabezado de categoría solo cuando tiene entradas— o dejar la fusión hecha. No tocar las secciones de versiones ya liberadas.
6. **Informar del resultado:** «sin entrada», entrada registrada, entrada fusionada o changelog inicializado.

## Finalización

El skill ha terminado cuando se cumple una de las dos ramas:

- **Sin entrada:** se emitió el veredicto explícito y el changelog no se modificó.
- **Con entrada:** la entrada está en la sección de no liberados, en su categoría, fusionada con la de su agrupación cuando procede, con su referencia al artefacto de origen; las secciones liberadas quedaron intactas. Si el changelog no existía, quedó inicializado con el formato declarado.

## Referencias

- `references/formato-y-agregacion.md` — Estructura Keep a Changelog, plantilla de inicialización, criterios de notabilidad, política de agregación y correspondencia con semver. Leer al inicializar el changelog y al redactar o fusionar entradas.
- `docs/research/2026-09-changelog-y-versionado-semantico.md` — Investigación que motiva el skill: modelo de dos momentos, formato recomendado y justificación de la agregación por agrupación.
