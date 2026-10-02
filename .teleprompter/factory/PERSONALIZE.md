# Personalización del paquete factory

Factory instala en `.agents/skills/` una colección de skills de agente autocontenidos —cada uno con su `SKILL.md` y, según el caso, directorios `references/` o `assets/` auxiliares— que orquestan el ciclo de trabajo de un proyecto: de la idea a la tarea, ejecución con revisión dual, memoria del proyecto, documentación viva y liberación de versiones.

Los skills no llevan consigo los artefactos de estado: los crean y los mantienen en el repositorio destino. Este archivo describe la estructura mínima que asumen, para que el agente instalador la prepare o verifique.

## Artefactos de la raíz

Crear si no existen:

- `TODO.txt` — índice de tareas del proyecto. Una línea por tarea con el formato `- [estado] docs/tasks/NNN-slug.md — título breve`, donde el estado es `[ ]` pendiente, `[~]` en progreso, `[r]` en revisión, `[x]` completada o `[!]` bloqueada. Las tareas sueltas viven bajo la sección `## General`; los conjuntos planificados, bajo encabezados `## Hito N: título`; al final, la sección `## Propuestas en revisión` lista las propuestas del flujo de idea a tarea con el marcador `[p]`.
- `EXPERIENCIAS.md` — registro append-only de las correcciones que el usuario hace al agente; el skill `registrar-experiencias` lo gestiona.
- `CHANGELOG.md` — changelog del proyecto en formato Keep a Changelog, con la sección `## [Unreleased]` para los cambios no liberados.
- `ROADMAP.md` — opcional; lo produce `planificar-roadmap` cuando el proyecto quiere declarar dirección y prioridades.
- `DESIGN.md` — opcional; si existe, activa por convención el par de skills de guía de estilo (`documentar-guia-estilo`, `aplicar-guia-estilo`).

## Directorios de `docs/`

Los skills escriben sus artefactos bajo `docs/`; cada directorio se crea cuando su productor lo necesita, pero conviene tenerlos presentes:

- `docs/tasks/` — un archivo por tarea, con la plantilla de `crear-tareas` (`assets/task.txt` dentro del skill instalado).
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
- El nombre del directorio de documentación de producto, que `documentar-producto` mantiene en un directorio propio, separado del `docs/` de proceso.
- Cualquier artefacto propio del proyecto (código, pruebas, documentación existente): el paquete no los presume ni los toca.
