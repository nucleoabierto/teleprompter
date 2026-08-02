# Rúbrica de puntuación del explicador

Puntúa el documento de enseñanza de [change-explainer](../SKILL.md), no el cambio de código subyacente.

Aplica los gates en orden. Asigna el puntaje más alto cuyos gates todos pasen.

- **10**: Narrativa con intuición primero; mapeo completo de AC; quiz de autoevaluación respondible solo desde el documento; efectos de segundo orden explícitos; sin intención de producto inventada; Preguntas abiertas solo para vacíos sin resolver
- **9**: Documento didáctico senior: orden de historia, criterios cubiertos, quiz funciona; solo nits triviales (redacción, una ruta faltante)
- **8**: Contenido sólido pero todavía parcialmente una lista de archivos, intuición débil, o un item de AC solo parcialmente mapeado
- **7**: Cubre el cambio; la narrativa o el mapeo de AC necesita rework
- **5–6**: Faltan criterios, quiz no respondible solo desde el documento, o intención de producto inventada sin entrada en Preguntas abiertas
- **1–4**: Inusable para onboarding: flujo de datos incorrecto, contradice la fuente, u omite límites de auth/PII

Un documento debe cumplir estos estándares antes de poder puntuar ≥ 9:

- La intuición y la narrativa preceden cualquier lista de archivos.
- Cada criterio de aceptación de la fuente proporcionada aparece en el checklist.
- El quiz de autoevaluación es respondible solo desde el explicador. Escríbelo en el documento; no lo uses como puerta en vivo. Para puertas en vivo, usa [understanding-quiz](../understanding-quiz/SKILL.md).

Verificación rápida de 9 vs 8: si el lector necesitaría el diff del PR o el ticket original para responder el quiz de autoevaluación, puntúa ≤ 8. Si la intuición, el mapeo de AC y el quiz se sostienen solos, puntúa ≥ 9.

Mejora el explicador en como máximo 2 rondas de revisión hasta que el puntaje alcance ≥ 9. Si el puntaje sigue por debajo de 9 después de 2 rondas, detente y reporta los bloqueos en el chat en lugar de iterar indefinidamente.
