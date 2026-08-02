# Rúbrica de puntuación del diseño del quiz

Puntúa el set de preguntas antes de preguntar al humano — no las respuestas del humano.

Aplica los gates en orden. Asigna el puntaje más alto cuyos gates todos pasen.

- **10**: 5–10 preguntas; cubre objetivo/objetivos excluidos, entry points, auth/PII o flag crítico, modo de fallo, efecto de segundo orden; todas respondibles desde la fuente y el código; sin trivia; cada tema bloqueante cubierto; cada pregunta cita dónde mirar (ruta, sección o Pregunta abierta)
- **9**: Igual cobertura que 10; solo nits triviales de redacción restantes
- **8**: Temas sólidos pero punteros de evidencia débiles, una pregunta suave/trivia, o un tema bloqueante cubierto solo indirectamente
- **7**: Cubre el cambio; omite un tema bloqueante o pregunta detalle no respondible sin marcar como Pregunta abierta
- **5–6**: Trivia, múltiples preguntas no respondibles, o se basa en intención de producto no declarada en lugar de material citado
- **1–4**: Set de preguntas no utilizable: sin temas bloqueantes, mayormente trivia, o contradice la fuente

Temas bloqueantes — un miss en cualquiera reprueba la puerta de comprensión cuando el puntaje sería ≥ 9: límite de auth/PII, entry point o flujo de datos principal incorrecto, criterio de aceptación omitido.

Un set de preguntas debe cumplir estos estándares antes de poder puntuar ≥ 9:

- Cada pregunta es respondible desde el material de fuente cargado y las rutas de código citadas solas.
- Sin trivia (bikesheds de nombres, conteos de líneas, fechas) a menos que esté directamente ligado a AC o seguridad.
- Los temas bloqueantes están cada uno cubiertos por al menos una pregunta directa.

Verificación rápida de 9 vs 8: si falta algún tema bloqueante o cualquier pregunta requiere adivinar intención de producto, puntúa ≤ 8.

Revisa la lista de preguntas en como máximo 2 rondas hasta que el puntaje sea ≥ 9. Si sigue por debajo de 9 después de 2 rondas, detente y reporta vacíos de la fuente bajo Preguntas abiertas. Cuando falten criterios de aceptación o entry points en la fuente, haz una pregunta enfocada antes de hacer el quiz.
