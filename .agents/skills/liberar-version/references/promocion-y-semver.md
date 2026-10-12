# Promoción de versiones y correspondencia semver

Material de referencia del skill `liberar-version`: la lista de curación previa a la promoción y la correspondencia entre categorías de entrada y bump de versión. La materialización en el changelog —sección nueva, no liberados vacíos, enlaces comparativos, marcado de retiradas— es mecánica delegada en `operar-changelog`; esta referencia sostiene el juicio de la curación y la propuesta.

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

## Materialización delegada

La mecánica de escribir la promoción —la nueva sección de versión con su fecha, los no liberados vacíos encima, los enlaces comparativos del pie y el marcado de retiradas— corre a cargo de `operar-changelog`, cuyo catálogo declara las operaciones `promover` e `yank` con sus casos borde: primera versión sin versión anterior que comparar, archivo sin enlaces y no liberados vacíos.
