# Rúbrica de puntuación del context brief (1–10)

Puntúa el artefacto de investigación (separado del ticket).

- **10**: Un compañero podría implementar o revisar solo desde este archivo sin re-consultar la fuente; ≥3 rutas de entry-point citadas (o vacío listado); deps/estado claros; riesgos y objetivos excluidos explícitos; cada declaración de comportamiento cita una ruta o una Pregunta abierta; el outline es solo de alto nivel
- **9**: Brief senior; solo nits triviales (redacción, una ruta faltante)
- **8**: Útil pero deps débiles, verificación de codebase escasa, u outline demasiado detallado
- **7**: Cubre el ticket; la verificación cruzada o los non-goals necesitan revisión
- **5–6**: Especulación, menos de 3 rutas sin listar el vacío, inventa intención, o secciones requeridas vacías
- **1–4**: El brief contradice el ticket/codebase, omite AC declarados, o gaps de auth/PII inseguros sin Preguntas abiertas

## Gates de aprobación

Un brief debe cumplir estos estándares antes de poder puntuar ≥ 9:

- Las secciones requeridas de Fase C en SKILL.md están presentes con contenido real.
- Los entry points, flujo de datos y anclajes de convención citan rutas (≥3 o el vacío documentado).
- Los gaps de intención de producto son Preguntas abiertas, no afirmados como hechos.

## Verificación rápida de 9 vs 8

Si el implementador reabriría la fuente por un hecho sustantivo, puntúa ≤ 8. Si el brief se sostiene solo con solo nits de redacción, puntúa ≥ 9.

## Estrategia de revisión

Mejora el brief en **como máximo 2** rondas de revisión hasta que la puntuación sea ≥ 9. Si sigue por debajo de 9 después de 2 rondas, detente e informa los bloqueos en lugar de iterar indefinidamente.
