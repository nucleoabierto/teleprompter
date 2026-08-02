# Rúbrica de puntuación de implementación

Puntúa el resultado de implementación del skill `implementing`, no la calidad del plan.

Aplica los gates en orden. Asigna el puntaje más alto cuyos gates todos pasen.

- **10**: Todos los cambios coinciden con el plan; cada criterio de aceptación cubierto; validación dirigida en verde; sin bloqueadores sin resolver
- **9**: Completo con desviaciones triviales explicadas; validación dirigida en verde
- **8**: Mayormente completo; gaps menores de AC o validación documentados en las notas
- **7**: Parcial; gaps significativos o fallos documentados
- **5–6**: Incompleto, validación en rojo, o drift de alcance sin explicación
- **1–4**: Enfoque incorrecto enviado, regresión de auth/PII, o contradice los AC del plan

Verificación rápida de 9 vs 8: si una revisión local puntuaría el cambio ≤ 8, la puntuación de implementación es ≤ 8.

Revisa la implementación en como máximo 2 rondas de corrección cuando el puntaje sea < 9 antes de escribir las notas finales. Cuando el puntaje permanezca por debajo de 9 después de las rondas de corrección, documenta los gaps en las notas de implementación con Ready for `fix-locally`.
