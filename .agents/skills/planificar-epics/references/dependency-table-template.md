# Template de Tabla de Dependencias

Usa esta estructura para mapear dependencias entre tareas o epics.

## Formato de tabla

| Tarea/Epic | Bloqueado por     | Puede correr con           | Desbloquea                 |
|------------|-------------------|----------------------------|----------------------------|
| [Nombre]   | None              | [lista separada por comas] | [lista separada por comas] |
| [Nombre]   | [otra tarea/epic] | [lista separada por comas] | [lista separada por comas] |

## Campos

- **Tarea/Epic**: Nombre identificativo de la tarea o epic
- **Bloqueado por**: Lista de tareas/epics que deben completarse antes (use "None" si no hay bloqueos)
- **Puede correr con**: Lista de tareas/epics que pueden ejecutarse en paralelo
- **Desbloquea**: Lista de tareas/epics que esta tarea/epic habilita

## Análisis a realizar

Detecta:

- **Cadenas secuenciales**: A → B → C (tomar en cuenta en timeline)
- **Paralelización**: T1 || T2 (reducir ciclo de implementación)
- **Ciclos** (nunca debe haber): si existen, reestructura o explícita "reconciliation point"
