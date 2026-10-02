# Promoción de versiones y correspondencia semver

Material de referencia del skill `liberar-version`: la lista de curación previa a la promoción, la correspondencia entre categorías de entrada y bump de versión, y la mecánica de la materialización en el changelog.

## Curación previa a la promoción

Los cambios no liberados se escribieron como borrador al cerrar cada tarea. Antes de promoverlos a versión se repasan:

- Fusionar duplicados y entradas que describen el mismo cambio desde tareas distintas.
- Eliminar lo que se anula dentro del mismo periodo: si algo se añadió y se retiró antes de liberar, no pertenece a la versión.
- Quitar detalle interno sin impacto para el consumidor que se coló en el registro.
- Reformular entradas poco claras: cada línea debe ser autodescriptiva para el lector de la versión.
- Verificar que cada entrada está en su categoría correcta.
- Hacer visibles las rupturas: todo cambio incompatible con la interfaz pública declarada lleva el prefijo `**Breaking:**` en línea dentro de su categoría.

Los cambios de curación se muestran al usuario junto a la propuesta de versión; no se aplican en silencio ni se escriben antes de la confirmación: se materializan en el archivo solo en el paso de promoción.

## Correspondencia con semver

El bump propuesto se deriva de las categorías presentes en los no liberados curados:

| Categoría o marca presente | Bump |
|---|---|
| `**Breaking:**` en línea, `Removed` | major |
| `Added`, `Deprecated`, `Changed` compatible | minor |
| `Fixed`, `Security` compatibles | patch |

Reglas de aplicación:

- El bump propuesto es la señal más fuerte presente: major si hay al menos una ruptura o un `Removed`; si no, minor si hay al menos una entrada de las que lo implican; si no, patch.
- Semver solo opera sobre la interfaz pública que el proyecto declare —API, CLI, formato de archivo, configuración—; si el proyecto no la tiene definida, la propuesta lo indica y el usuario decide la clasificación de las rupturas.
- En versiones `0.x`, la convención extendida trata los cambios incompatibles como minor; si el proyecto la sigue, la propuesta lo declara explícitamente.
- La justificación nombra las categorías presentes que producen la propuesta —por ejemplo, «minor: hay `Added` y `Changed`, sin rupturas»—, para que el usuario pueda auditarla sin rehacer el análisis.

## Mecánica de la promoción

1. Renombrar el encabezado `## [Unreleased]` a `## [X.Y.Z] - YYYY-MM-DD` con la fecha del día en formato ISO.
2. Crear encima una sección `## [Unreleased]` vacía, lista para el siguiente ciclo.
3. Si el archivo mantiene enlaces de referencia al pie —`[Unreleased]:`, `[X.Y.Z]:`— actualizarlos: el nuevo `[Unreleased]` compara la nueva versión con HEAD (`<base>/compare/X.Y.Z...HEAD` en el host del repositorio) y la entrada de la nueva versión compara con la versión anterior (`<base>/compare/A.B.C...X.Y.Z`). Cuando es la primera versión del archivo no hay versión anterior que comparar; el enlace se omite o apunta a la raíz del historial según lo que el host soporte. Si no hay enlaces o el host no los soporta, se omiten.
4. Las versiones retiradas no se ocultan: si el proyecto retira una versión ya publicada, su encabezado se marca `[X.Y.Z] [YANKED]` en lugar de borrarse.
