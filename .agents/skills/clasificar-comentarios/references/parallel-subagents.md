# Protocolo de subagentes en paralelo

Referencia compartida para skills que exponen este archivo vía `references/parallel-subagents.md` (symlink a `<skills-root>/_shared/parallel-subagents.md`). Úsalo cuando un skill tiene tareas independientes de recolección o análisis que no dependen de la salida de otras hasta una fase de síntesis.

## Cuándo delegar

- El host soporta delegación de subagentes.
- Dos o más unidades de trabajo son independientes (fuentes diferentes, archivos o threads).
- Cada unidad tiene un entregable claro para que el agente orquestador fusione.

Si el host no soporta subagentes, ejecuta las mismas unidades secuencialmente en el orden listado.

## Reglas de lanzamiento

1. Envía un mensaje con múltiples delegaciones de subagentes cuando las unidades son independientes y el host lo soporta. No los lances uno a uno a través de turnos.
2. Cada subagente ejecuta solo su unidad asignada. No debe sintetizar, puntuar ni escribir el archivo final a menos que el prompt indique lo contrario.
3. Espera cada handoff antes del paso de síntesis o fusión.
4. Limita los subagentes concurrentes a 4 a menos que el usuario pida más. Agrupa conjuntos más grandes (por ejemplo, revisiones de skills o threads de PR) en olas de 4 o menos.

## Perfiles de delegación

El host mapea estos perfiles a tipos de agentes disponibles (por ejemplo, general-purpose versus explore):

| Unidad de trabajo                                         | Perfil sugerido | Notas                       |
|-----------------------------------------------------------|-----------------|-----------------------------|
| Fetch de herramientas externas vía MCP                    | general-purpose | APIs externas               |
| Búsqueda en repo, citación de rutas, pase de convenciones | explore         | Lectura amplia del codebase |
| Análisis por thread o por archivo con fuente ya cargada   | general-purpose | Alcance estrecho            |

## Bloque de handoff (requerido)

Cada subagente termina con:

```markdown
## Handoff — <nombre-de-unidad>
- Scope: <qué cubrió esta unidad>
- Hallazgos: <bullets o resumen estructurado>
- Rutas / URLs citadas: <lista o "none">
- Preguntas abiertas: <lista o "none">
- Bloqueadores: <lista o "none">
```

## Responsabilidades del orquestador

- Fusiona los handoffs; resuelve conflictos a favor de la evidencia citada.
- Lleva adelante las Preguntas abiertas de los subagentes en lugar de llenar gaps de producto silenciosamente.
- Puntúa y escribe el artefacto del skill solo después de que todos los handoffs requeridos estén completos.
- Registra en el chat qué unidades corrieron en paralelo versus inline.

## Evitar

- Paralelizar pasos que comparten estado mutable, como dos subagentes editando el mismo archivo.
- Iniciar la síntesis antes de que todos los handoffs retornen.
- Asignar el skill completo a un subagente, lo cual duplica la orquestación.
- Dejar que los subagentes escriban el artefacto final en disco; el orquestador es dueño de la escritura final.
