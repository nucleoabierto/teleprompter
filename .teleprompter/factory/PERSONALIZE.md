# Personalización del paquete factory

Factory instala en `.agents/skills/` una colección de skills de agente autocontenidos —cada uno con su `SKILL.md` y, según el caso, directorios `references/` o `assets/` auxiliares— que orquestan el ciclo de trabajo de un proyecto: de la idea a la tarea, ejecución con revisión vía pull request, memoria del proyecto, documentación viva y liberación de versiones.

Los skills no llevan consigo los artefactos de estado: los crean y los mantienen en el repositorio destino. Este archivo describe la estructura mínima que asumen, para que el agente instalador la prepare o verifique.

## Artefactos de la raíz

Crear si no existen:

- `TODO.md` — índice de tareas del proyecto. Una línea por tarea con el formato `- [estado] docs/tasks/NNN-slug.md — título breve`, donde el estado es `[ ]` pendiente, `[~]` en progreso, `[r]` en revisión, `[x]` completada o `[!]` bloqueada. Las tareas sueltas viven bajo la sección `## General`; los conjuntos planificados, bajo encabezados `## Hito N: título`; al final, la sección `## Propuestas en revisión` lista las propuestas del flujo de idea a tarea con el marcador `[p]`.
- `EXPERIENCIAS.md` — registro append-only de las correcciones que el usuario hace al agente; el skill `destilar-lecciones` lo gestiona.
- `CHANGELOG.md` — changelog del proyecto en formato Keep a Changelog, con la sección `## [Unreleased]` para los cambios no liberados.
- `ROADMAP.md` — opcional; lo produce `planificar-roadmap` cuando el proyecto quiere declarar dirección y prioridades.
- `DESIGN.md` — opcional; si existe, activa por convención el par de skills de guía de estilo (`documentar-guia-estilo`, `aplicar-guia-estilo`).

## Directorios de `docs/`

Los skills escriben sus artefactos bajo `docs/`; cada directorio se crea cuando su productor lo necesita, pero conviene tenerlos presentes:

- `docs/tasks/` — un archivo por tarea, con la plantilla de `crear-tareas` (`assets/task.md` dentro del skill instalado).
- `docs/ideas/` — ideas persistidas que alimentan el flujo de idea a tarea.
- `docs/proposals/` — un directorio por propuesta, con su `propuesta.md` y los borradores de tarea.
- `docs/epics/` — un documento por épica.
- `docs/decisions/` — decisiones de diseño, con un `README.md` como índice por disparadores.
- `docs/lessons/` — notas de lecciones aprendidas, con un `README.md` como índice por disparadores.
- `docs/research/` — resultados del skill `investigar` (su nombre exacto lo acuerda el proyecto).
- `docs/domains/` — documentación viva de dominios, con un `README.md` como índice.
- `docs/architecture-reviews/` — informes del skill `revisar-arquitectura`.

## Qué queda a criterio del proyecto destino

- Las convenciones de commit que `commit` debe seguir (mensaje, idioma, formato).
- La política de versionado del changelog (categorías, cuándo liberar).
- Cualquier artefacto propio del proyecto (código, pruebas, documentación existente): el paquete no los presume ni los toca.

El resto de lo que históricamente se dejaba «a criterio del proyecto» —ubicaciones, nomenclaturas, marcas, secciones, prefijos— está catalogado abajo como configuración con valores por defecto.

## Frontera entre dominio y convención

Los skills consumidores expresan acciones de dominio —«la próxima pendiente», «marcar bloqueada», «registrar el veredicto», «crear la tarea»— y los gestores de artefactos resuelven ubicación, formato y aplicación. La frontera que separa lo que un consumidor puede escribir en su `SKILL.md`:

- **Dominio — puede nombrarse:** los artefactos como objetos del trabajo del usuario: la tarea por su referencia, la propuesta, la épica, la idea, la decisión, la lección. Su referencia es vocabulario del dominio, no configuración.
- **Convención — no aparece en los skills:** ubicaciones de almacenamiento —nombres de archivos y directorios—, formatos internos —forma de líneas, comentarios de enlace, plantillas—, marcas y etiquetas de estado, nombres de sección, nomenclaturas de series y prefijos. Viven en el catálogo de convenciones.
- **Formato externo — tampoco es convención configurable:** la sintaxis de Markdown —encabezados `##`, casillas `- [ ]`, negritas, comentarios— y el formato Keep a Changelog —`## [Unreleased]`, `### Added`, `[YANKED]`— son contrato fijo del artefacto, no decisión del proyecto.

Ejemplos del inventario de fugas: «marcar `[x]` la línea del índice» es fuga doble —marca y ubicación—; la acción es «marcar la tarea completada». «`docs/tasks/132-x.md`» como referencia de la tarea concreta es dominio; «`docs/tasks/`» como lugar donde viven las tareas es convención. «`## Revisión`» es convención —un nombre de sección—; «el veredicto del subagente» es dominio.

## Catálogo de convenciones

Toda constante de las clases listadas vive como clave de configuración con su valor por defecto —la convención del paquete— y el consumidor que la resuelve. La lista es abierta: una convención nueva del ciclo se registra aquí.

**Rutas de artefactos** —las resuelven los gestores para construir el objetivo de cada operación—:

- `indice_tareas` — `TODO.md`: el índice de tareas.
- `dir_tareas` — `docs/tasks`: un archivo por tarea.
- `dir_propuestas` — `docs/proposals`: un directorio por propuesta.
- `archivo_propuesta` — `propuesta.md`: el documento dentro de cada directorio de propuesta.
- `dir_ideas` — `docs/ideas`: ideas persistidas.
- `dir_epicas` — `docs/epics`: un documento por épica.
- `dir_decisiones` — `docs/decisions`: decisiones de diseño, con `README.md` como índice por disparadores.
- `dir_lecciones` — `docs/lessons`: lecciones aprendidas, con `README.md` como índice por disparadores.
- `dir_dominios` — `docs/domains`: documentación viva de dominios.
- `dir_investigaciones` — `docs/research`: resultados de `investigar`.
- `dir_revisiones_arquitectura` — `docs/architecture-reviews`: informes de `revisar-arquitectura`.
- `dir_revisiones_pr` — `.git/factory/pr-reviews`: informes de `revisar-pr` y triages de `clasificar-comentarios`/`mejorar-pr`; estado local efímero fuera del control de versiones, que `gestionar-pr` elimina al cerrar el PR.
- `dir_prd` — `docs/prd`: PRD de conjuntos.
- `dir_docs_producto` — `product-docs`: documentación de producto, fuera del `docs/` de proceso.
- `archivo_experiencias` — `EXPERIENCIAS.md`: el registro append-only.
- `archivo_changelog` — `CHANGELOG.md`: el changelog.
- `archivo_roadmap` — `ROADMAP.md`: el roadmap.
- `archivo_design` — `DESIGN.md`: la guía de estilo.

**Marcas del índice** —el carácter dentro de la casilla—:

- `marca_pendiente` — ` ` · `marca_en_progreso` — `~` · `marca_en_revision` — `r` · `marca_completada` — `x` · `marca_bloqueada` — `!` · `marca_propuesta` — `p`
- `marca_aprobada` — `a` · `marca_descartada` — `d` (estados internos de `propuesta.md`)

**Etiquetas de estado** —las opciones de la línea de estado de tareas, propuestas y épicas—:

- `estado_pendiente` — `Pendiente` · `estado_en_progreso` — `En progreso` · `estado_en_revision` — `En revisión` · `estado_completada` — `Completada` · `estado_bloqueada` — `Bloqueada`
- `estado_borrador` — `Borrador` · `estado_pendiente_revision` — `Pendiente de revisión` · `estado_aprobada` — `Aprobada` · `estado_descartada` — `Descartada`
- `estado_planificada` — `Planificada` (épicas)

**Secciones** —nombres de encabezado dentro de los artefactos—:

- `seccion_general` — `General` · `seccion_propuestas` — `Propuestas en revisión` · `seccion_hito` — `Hito` (los encabezados de agrupación son `## Hito N: título`)
- `seccion_estado` — `Estado` · `seccion_revision` — `Revisión` · `seccion_dependencias` — `Dependencias` · `seccion_desviaciones` — `Desviaciones del plan` · `seccion_plan` — `Plan técnico` · `seccion_suite` — `Suite de pruebas esperada` · `seccion_contexto` — `Contexto` · `seccion_conectividad` — `Conectividad`
- `seccion_borradores` — `Borradores` (en `propuesta.md`) · `seccion_piezas` — `Piezas` (en la épica)

**Nomenclaturas y formatos de línea:**

- `ancho_numeracion` — `3`: la `NNN` de tareas, propuestas, épicas, ideas, dominios y revisiones.
- `ancho_borrador` — `2`: la `MM` de los borradores dentro de una propuesta.
- `prefijo_decision` — `D`: la `DNNN` de las decisiones.
- `prefijo_caso_uso` — `CU`: el `CU-N` de los casos de uso del PRD.
- `ref_borrador` — `Borrador`: la forma «Borrador MM» de las dependencias entre borradores.
- `formato_linea_tarea` — `- [%s] %s — %s`, `formato_linea_propuesta` — `- [%s] %s/ — %s (%s borradores)` y `formato_bloqueante` — `  - [ ] %s`: las líneas del índice.
- `comentario_epica` — `épica`: el enlace del encabezado a su épica es `<!-- épica: <ruta> -->`.
- `formato_veredicto` — `- %s: %s — %s` (autor, fecha, veredicto), `marcador_fecha` — `[fecha]`, `opciones_veredicto` — `Aprueba | Solicita cambios` y `actores_revision` — `Subagente|Usuario (ejecución)|Usuario (cierre)`: la línea de `## Revisión`, su placeholder y la plantilla de veredictos.
- `ref_depende` — `depende de`: la forma «depende de MM» de las dependencias en el índice de una propuesta.
- `dependencias_vacia` — `Ninguna`: la línea que declara ausencia de dependencias.
- `campo_procesada` — `> **Procesada en:** %s` y `campo_orden_idea` — `**Orden sugerido:**`: marcas de las ideas.
- `campos_experiencia` — `Id Tarea Esperado Obtenido Corrección`, `campo_estado_experiencia` — `Estado`, `estado_experiencia_pendiente` — `pendiente` y `estado_experiencia_consolidada` — `consolidada`: la entrada del registro.
- `campos_indice_disparadores` — `Disparadores|Resumen|Estado`: los sub-campos de los índices por disparadores.

**Prefijos y git:**

- `prefijo_rama_tarea` — `tarea/`: la rama de una tarea es su identificador bajo este prefijo.
- `rama_principal` — `main`: la rama sobre la que se abren los pull requests.

## Inyección al instalar

Cada gestor —`consultar-artefactos`, `actualizar-artefactos`, `operar-experiencias`, `operar-changelog`— lleva `assets/convenciones.sh`: un archivo `CLAVE=valor` con los valores por defecto del catálogo, idéntico en los cuatro. Los scripts lo cargan al arrancar y resuelven de él cada literal que es convención; el gestor resuelve además las rutas para construir el objetivo de las operaciones, de modo que el consumidor nunca nombra ni pasa una ubicación.

Al instalar, el agente instalador escribe en cada `convenciones.sh` los valores del proyecto destino cuando difieren de la convención —otro nombre de índice, otro directorio de tareas, otra marca— y los flujos continúan sin tocar los skills. Una clave ausente en el archivo rige por el valor por defecto embebido en el script; un archivo malformado hace fallar la operación con diagnóstico, sin operar sobre datos sintetizados.

Cuando un consumidor necesita una convención para mecánica ajena a los artefactos —el prefijo de rama de `ejecutar-tareas`, la rama principal de `gestionar-pr`, un directorio donde escribir directamente—, la consulta con la operación `convencion <clave>` de `consultar-artefactos`.

Las plantillas de `assets/` de los consumidores —la del archivo de tarea, la de la propuesta, la de la épica— reproducen los literales de la convención por defecto; cuando la instalación cambia una convención, el instalador reescribe también esos literales en las plantillas.
