# Rúbrica de puntuación de resultados de spike

Puntúa el artefacto de notas del spike de [spike](../spike/SKILL.md), no la calidad del código.

Aplica los gates en orden. Asigna el puntaje más alto cuyos gates pasen todos.

- **10**: Una sola pregunta respondida decisivamente; keep/rewrite/delete claro; ruta de implementación real obvia; alcance se mantuvo dentro de una sola pregunta de spike
- **9**: Respuesta fuerte; solo gaps triviales en las notas
- **8**: Dirección útil; ruta de implementación necesita refinamiento menor
- **7**: Respuesta parcial; las notas indican qué sigue sin estar claro
- **5–6**: Multi-question creep, spike tratado como implementación, o pregunta sin respuesta
- **1–4**: Código del spike enviado como cambio de producto, o respuesta contradice restricciones del codebase

Verificación rápida de 9 vs 8: si planning-implementation necesitaría otro spike primero, puntúa ≤ 8.

Revisa las notas del spike en como máximo 2 rondas hasta que el puntaje sea ≥ 9. Si el puntaje sigue por debajo de 9 después de 2 rondas, detente e informa los bloqueos en el chat.
