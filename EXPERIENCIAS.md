# Experiencias

Log append-only de las correcciones que el usuario hace al agente
durante el trabajo: qué se esperaba, qué se obtuvo y qué indicó el
usuario. Las entradas nunca se editan ni se borran; la consolidación
en `docs/lessons/` las marca como `consolidada`.

## Entradas

- Id: 20260930T010326
  Tarea: docs/tasks/016-listar-paquetes-instalados.md
  Esperado: la revisión técnica independiente de
    `revisar-implementacion` reconstruye el diff con git —los
    cambios sin commitear se obtienen con `git status` y
    `git diff`— y puede verificar las puertas mecánicas si lo
    estima.
  Obtenido: el revisor se lanzó con un perfil de solo lectura
    (subagent_explore), sin shell: reconstruyó el «diff» leyendo
    los archivos modificados y no pudo ejecutar `git` ni
    `npm test`.
  Corrección: «ejecuta una revision con un subagente que si pueda
    ejecutar git» — el revisor independiente necesita capacidad de
    ejecutar comandos (perfil subagent_general), aunque no
    modifique archivos; la lectura directa no sustituye al diff
    real ni a la ejecución de la suite.
  Estado: pendiente
