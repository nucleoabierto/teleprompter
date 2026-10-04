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
- Id: 20261004T004549
  Tarea: docs/tasks/027-cadena-de-release.md
  Esperado: el documento de la cadena de release contiene solo la
    política de largo plazo del proyecto.
  Obtenido: `docs/release.md` incluía la mención del dist-tag
    `legacy`, una acción puntual histórica (backfill de 0.1.1).
  Corrección: eliminar la mención —«es un detalle que no es
    relevante en el contexto de largo plazo»—; los detalles
    históricos puntuales van en la decisión (D018) o quedan fuera
    de la documentación viva.
  Estado: pendiente
- Id: 20261004T010000
  Tarea: docs/epics/006-colecciones.md (planeación del hito 7)
  Esperado: las tareas promocionadas toman el siguiente número libre
    y las transformaciones solo tocan los archivos del conjunto.
  Obtenido: se asignaron 029-033 sin verificar que 029 y 030 ya
    existían completadas, y el script de promoción con glob añadió
    secciones Estado/Revisión duplicadas a esas tareas ajenas.
  Corrección: consultar los números ocupados en `docs/tasks/` antes
    de asignar y acotar los globs a los archivos propios.
  Estado: pendiente
