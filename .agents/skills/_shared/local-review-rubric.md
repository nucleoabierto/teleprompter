# Rúbrica de puntuación de local-review (1–10)

- **10**: Todo AC cumplido; validación dirigida pasa (o N/A con justificación); cero hallazgos blocker, important o nit; convenciones coinciden con ≥2 patrones hermanos citados o divergencia intencional documentada; efectos de segundo orden abordados o explícitamente ninguno.
- **9**: Todo AC cumplido; validación dirigida pasa (o N/A con justificación); cero hallazgos blocker e important; máximo 3 hallazgos nit; convenciones coinciden con patrones hermanos excepto donde nits notan gaps de micro-estilo solo.
- **8**: Todo AC cumplido funcionalmente, pero ≥1 hallazgo important o desajuste repetido de convenciones vs patrones hermanos citados o validación no ejecutada cuando el diff claramente lo justifica.
- **7**: Todo AC cumplido funcionalmente, pero deuda material de arquitectura/diseño (capa incorrecta, lógica duplicada, abstracción faltante) que no rompe el comportamiento hoy.
- **5–6**: Cualquier AC parcial o faltante; o tests débiles/faltantes para comportamiento cambiado; o casos edge riesgosos no manejados sin una Pregunta abierta.
- **1–4**: Enfoque incorrecto; comportamiento roto; inseguro para producción/PII; o ≥1 hallazgo blocker.

## Verificación rápida de 9 vs 8

Si archivarías ≥1 comentario important antes de abrir PR, puntúa ≤8. Si todo AC está cumplido, validación está verde, y solo nits opcionales permanecen, puntúa ≥9.
