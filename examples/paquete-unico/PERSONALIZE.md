# Personalización de ciclo-tareas

Estas instrucciones guían la adaptación de los skills instalados a este
repositorio. El instalador no las ejecuta: léelas y aplícalas ahora o en
tu primera sesión sobre el proyecto.

## Qué adaptar

1. **Índice de tareas.** Los skills esperan `TODO.txt` en la raíz del
   repositorio, con secciones markdown (`## General` para tareas
   sueltas). Si no existe, créalo con esa estructura mínima.
2. **Archivos de tarea.** Las tareas viven en
   `docs/tasks/NNN-identificador.md`, creados con la plantilla
   `.agents/skills/crear-tareas/assets/task.txt`. Si el proyecto ya
   usa otro lugar para sus tareas, decide uno solo y adapta las
   referencias `docs/tasks/` de los tres `SKILL.md`.
3. **Ubicación de los skills.** El paquete asume que el agente lee
   `.agents/skills/`. Si tu entorno resuelve los skills desde otra
   ruta, mueve los directorios o registra el alias; las referencias
   cruzadas internas (`crear-tareas`, `commit`) usan nombres de skill,
   no rutas, así que basta con que el registro las resuelva.
4. **Revisión con subagente.** `ejecutar-tareas` pide lanzar un
   subagente independiente para la revisión técnica. Si tu entorno no
   puede lanzar subagentes, sustituye ese paso por una revisión en la
   misma sesión con rol adversarial y dilo al usuario.
5. **Convenciones de commit.** `commit` exige asunto en imperativo de
   máximo 50 caracteres y cuerpo que explique qué y por qué. Si el
   repositorio ya usa otra convención, ajusta
   `.agents/skills/commit/references/convenciones.md` a la convención
   real.

## Qué no adaptar

- El formato de los archivos de tarea (secciones `Estado`, `Tipo`,
  `Revisión`) es el contrato del ciclo: cámbialo solo si estás
  dispuesto a mantener el desvío.
- Las marcas de `TODO.txt` (`[ ]`, `[~]`, `[x]`, `[!]`, `[p]`) las
  interpreta el ciclo, no el sistema de archivos: no las redefinas.
