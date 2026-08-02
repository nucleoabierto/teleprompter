# Rúbrica de puntuación del borrador

Puntúa el artefacto de borrador de ticket de [create-ticket](../create-ticket/SKILL.md), no el documento de review. Úsalo en la Fase B antes de escribir a disco.

Aplica los gates en orden. Asigna el puntaje más alto cuyos gates todos pasen.

- **10**: Problema declara quién/qué/por qué; Alcance tiene In/Out explícito; Requisitos citan rutas, flags o comandos cuando se conocen; AC son checkboxes binarios que cubren done; deps y tickets relacionados aparecen en Referencias o Preguntas abiertas; estimación es un punto + T-shirt per [ticket-estimate-scale.md](./ticket-estimate-scale.md) con ajuste apropiado al alcance; Testing/QA declara pasos CI/staging o "QA no requerido" con razón; Preguntas abiertas listan solo incógnitas sin resolver; sin stubs de placeholder; secciones opcionales aparecen solo cuando las puertas de INPUT de Fase B las requieren
- **9**: Igual que 10; solo nits triviales (redacción, una ruta faltante, borde de banda de estimación sin cambio de alcance)
- **8**: Borrador usable pero uno de: estimación desajustada vs alcance, AC delgados, límites de Alcance débiles, o Testing/QA vago cuando QA se necesita
- **7**: El borrador existe pero secciones clave delgadas (Problema, Alcance o AC necesitan input del autor); o deps sin resolver sin Preguntas abiertas
- **5–6**: Gaps materiales: AC o Alcance faltantes, stubs de placeholder, gaps de producto sin resolver no en Preguntas abiertas, o estimación claramente errónea para el alcance declarado
- **1–4**: Ticket placeholder, contradice INPUT/fuentes, o alcance inseguro (auth/PII) sin guardrails

Un borrador debe cumplir estos estándares antes de poder puntuar ≥ 9:

- Problema, Alcance (in/out), Criterios de aceptación, y Referencias/deps tienen contenido real (per lista de secciones de Fase B en SKILL.md).
- Cada incógnita está en Preguntas abiertas, no enterrada en prosa de Requisitos.
- La estimación usa [ticket-estimate-scale.md](./ticket-estimate-scale.md); cuando el alcance no es claro, documenta un rango y prefiere el límite inferior.
- Sin líneas de template vacías o stubs "TBD" en secciones requeridas.

Verificación rápida de 9 vs 8: si un compañero necesitaría una pregunta sustantiva de producto o alcance antes de investigación, puntúa ≤ 8. Si solo redacción o un nit menor de ruta permanece, puntúa ≥ 9.

Mejora el borrador en **como máximo 2** rondas hasta que el puntaje sea ≥ 9. Cuando el puntaje sigue por debajo de 9 después de 2 rondas, detente y lista los bloqueadores en Preguntas abiertas.
