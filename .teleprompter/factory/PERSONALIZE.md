# Personalización del paquete factory

Factory instala en `.agents/skills/` una colección de skills de agente autocontenidos —cada uno con su `SKILL.md` y, según el caso, directorios `references/` o `assets/` auxiliares— que orquestan el ciclo de trabajo de un proyecto: de la idea a la tarea, ejecución con revisión vía pull request, memoria del proyecto, documentación viva y liberación de versiones.

Los skills no llevan consigo los artefactos de estado: los crean y los mantienen en el repositorio destino. Este archivo describe la estructura mínima que asumen, para que el agente instalador la prepare o verifique, y dónde vive cada literal personalizable cuando el proyecto destino usa convenciones distintas de las del paquete.

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

Lo que históricamente se catalogaba como configuración central —ubicaciones, nomenclaturas, marcas, secciones, prefijos— no se resuelve en ningún archivo único: cada literal vive embebido en el documento de reglas del artefacto que lo usa o en el skill consumidor que lo necesita, y la personalización consiste en editarlo en su sitio. La guía de la última sección indica qué archivo contiene cada literal.

## Frontera entre dominio y convención

Los skills consumidores expresan acciones de dominio —«la próxima pendiente», «marcar bloqueada», «registrar el veredicto», «crear la tarea»— y los gestores de artefactos resuelven ubicación, formato y aplicación leyendo el documento de reglas del artefacto. La frontera que separa lo que un consumidor puede escribir en su `SKILL.md`:

- **Dominio — puede nombrarse:** los artefactos como objetos del trabajo del usuario: la tarea por su referencia, la propuesta, la épica, la idea, la decisión, la lección. Su referencia es vocabulario del dominio, no configuración.
- **Convención — vive embebida, no delegada:** ubicaciones de almacenamiento —nombres de archivos y directorios—, formatos internos —forma de líneas, comentarios de enlace, plantillas—, marcas y etiquetas de estado, nombres de sección, nomenclaturas de series y prefijos. Los literales del artefacto viven en su documento de reglas; los ajenos a un artefacto, en el consumidor que los usa.
- **Formato externo — tampoco es convención configurable:** la sintaxis de Markdown —encabezados `##`, casillas `- [ ]`, negritas, comentarios— y el formato Keep a Changelog —`## [Unreleased]`, `### Added`, `[YANKED]`— son contrato fijo del artefacto, no decisión del proyecto.

Ejemplos del inventario de fugas: «marcar `[x]` la línea del índice» es fuga doble —marca y ubicación—; la acción es «marcar la tarea completada». «`docs/tasks/132-x.md`» como referencia de la tarea concreta es dominio; «`docs/tasks/`» como lugar donde viven las tareas es convención. «`## Revisión`» es convención —un nombre de sección—; «el veredicto del subagente» es dominio.

## Dónde vive cada literal personalizable

Cuando el proyecto destino usa una convención distinta del valor por defecto, el instalador edita el literal en cada archivo que lo contiene. Los documentos de reglas declaran sus literales en la sección «Ubicación y literales» con los valores por defecto; los consumidores embeben el literal que usan —la mayoría lo nombran como «la convención `dir_investigaciones` (`docs/research` por defecto)», otros solo lo declaran—, de modo que el nombre de la convención o el valor por defecto sirven para localizar cada ocurrencia en el paquete.

### Los literales de un artefacto: en su documento de reglas

Cada tipo de artefacto tiene un único documento de reglas que declara su ubicación y todos sus literales —formato, marcas, etiquetas, secciones y operaciones—. Está en el gestor dueño de la escritura canónica y lo referencian los demás gestores que lo operan:

- El índice de tareas —`TODO.md`, las marcas `[ ] [~] [r] [x] [!] [p]`, las secciones `General`, `Hito N:` y `Propuestas en revisión`, los formatos de línea y de bloqueantes, el comentario `<!-- épica: -->`—: `.agents/skills/actualizar-artefactos/references/indice-tareas.md`.
- El archivo de tarea, compartido por tareas, propuestas y épicas —`docs/tasks`, los estados y sus etiquetas, `## Estado` de línea única, `## Revisión` con su formato de veredicto y sus actores, las secciones del sub-flujo de desarrollo—: `.agents/skills/actualizar-artefactos/references/tarea.md`.
- La propuesta —`docs/proposals`, `propuesta.md`, el ciclo de borradores `MM`, la sección `Borradores`, la promoción—: `.agents/skills/actualizar-artefactos/references/propuesta.md`.
- La épica —`docs/epics`, el estado acumulativo `Planificada`/`Completada`, la sección `Piezas`—: `.agents/skills/actualizar-artefactos/references/epica.md`.
- La idea persistida —`docs/ideas`, las cabeceras `> **Procesada en:**` y `> **Requiere:**`—: `.agents/skills/actualizar-artefactos/references/idea.md`.
- Los índices por disparadores —los `README.md` de `docs/decisions` y `docs/lessons` con sus campos `Disparadores`, `Resumen` y `Estado`—: `.agents/skills/consultar-artefactos/references/indice-disparadores.md`.
- El registro de experiencias —`EXPERIENCIAS.md`, los campos `Id Tarea Esperado Obtenido Corrección` y `Estado` con `pendiente`/`consolidada`—: `.agents/skills/operar-experiencias/references/experiencias.md`.
- El changelog —`CHANGELOG.md`, `## [Unreleased]`, las categorías y la promoción—: `.agents/skills/operar-changelog/references/changelog.md`.

La serie numerada de un directorio —prefijo, ancho, cálculo del siguiente— la declara el documento del artefacto que la usa o el consumidor que conoce su convención; la regla general vive en línea en `.agents/skills/consultar-artefactos/SKILL.md`, junto a la operación `siguiente`.

### Los literales ajenos a un artefacto: en el consumidor que los usa

Una convención que no pertenece a ningún artefacto vive embebida en el `SKILL.md` —o `references/`— de cada skill que la usa. Las actuales:

- `rama_principal` (`main`) y `prefijo_rama_tarea` (`tarea/`): `ejecutar-tareas`.
- El directorio de informes de revisión de PR (`.git/factory/pr-reviews`, con sustitución del prefijo `.git/` por `git rev-parse --git-common-dir`; los skills lo declaran sin nombre de convención): `revisar-pr`, `comentar-pr`, `clasificar-comentarios`, `mejorar-pr` y `gestionar-pr`.
- `dir_prd` (`docs/prd`) y `prefijo_caso_uso` (`CU`): `mantener-prd`; el directorio también en `planificar`.
- `dir_dominios` (`docs/domains`): `documentar-dominio`.
- `dir_revisiones_arquitectura` (`docs/architecture-reviews`): `revisar-arquitectura`.
- `dir_investigaciones` (`docs/research`): `investigar`.
- `dir_docs_producto` (`product-docs`): `documentar-producto`.
- `archivo_roadmap` (`ROADMAP.md`): `planificar-roadmap` y `mantener-roadmap`.
- `archivo_design` (`DESIGN.md`): `documentar-guia-estilo` y `aplicar-guia-estilo`.
- `dir_decisiones` (`docs/decisions`): `decisiones-diseno` y `consultar-decisiones`; el prefijo `D` de su serie vive en `decisiones-diseno` y el índice por disparadores lo opera desde `consultar-artefactos/references/indice-disparadores.md`.
- `dir_lecciones` (`docs/lessons`): `consultar-lecciones` y `destilar-lecciones`; mismo documento de índice.
- `dir_tareas` (`docs/tasks`): `crear-tareas`, además del documento de reglas de la tarea.
- `dir_ideas` (`docs/ideas`): `lluvia-de-ideas`, además del documento de reglas de la idea.
- `dir_propuestas` (`docs/proposals`): `refinar-propuesta`, además del documento de reglas de la propuesta.
- `dir_epicas` (`docs/epics`): `planificar`, además del documento de reglas de la épica.

## Personalización al instalar

Al instalar, el agente instalador recorre la guía anterior: para cada convención que difiere del valor por defecto, edita el literal en cada archivo que lo contiene —el documento de reglas del artefacto y cada consumidor que lo embebe—. Un literal compartido puede vivir en varios archivos; la forma segura de no dejar ocurrencias es buscar el valor por defecto o el nombre de la convención en el paquete instalado y editar cada resultado. Las plantillas de `assets/` de los consumidores —la del archivo de tarea, la de la propuesta, la de la épica— reproducen literales de la convención por defecto y se reescriben igualmente.

## Personalizaciones vigentes de este proyecto

Convenciones de este repositorio que difieren del valor por defecto del paquete —reaplicar tras cada actualización que las sobrescriba—:

- `rama_principal`: `master` (el paquete asume `main`). Vive en `ejecutar-tareas`.
- `dir_docs_producto`: `manual` (el paquete asume `product-docs`). Vive en `documentar-producto`.
