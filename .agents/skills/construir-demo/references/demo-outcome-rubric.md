# Rúbrica de puntuación de outcome del harness

Puntúa el artefacto de notas del harness de [harness](../SKILL.md), no la calidad del código.

Aplica los gates en orden. Asigna la puntuación más alta cuyos gates pasen todos.

- **10**: Objetivo de visibilidad respondido decisivamente; comportamientos confirmados; implicaciones claras; decisión conservar/eliminar obvia; alcance se mantuvo dentro de un objetivo de demo
- **9**: Respuesta fuerte; gaps triviales solo en las notas
- **8**: Visibilidad útil; el camino de implementación necesita refinamiento menor
- **7**: Respuesta parcial; las notas declaran qué sigue sin claridad
- **5–6**: Creep multi-objetivo, el demo se trató como implementación, o objetivo de visibilidad sin respuesta
- **1–4**: El artefacto del demo quedó como ruta de producción sin decisión explícita de conservar, o contradice el comportamiento de la fuente

Check rápido 9 vs 8: Si se necesita throwaway-spike antes de planificar, puntuación ≤ 8.

Revisa las notas del harness en máximo 2 rondas hasta puntuación ≥ 9. Si sigue debajo de 9 después de 2 rondas, detente y reporta bloqueadores en el chat.
