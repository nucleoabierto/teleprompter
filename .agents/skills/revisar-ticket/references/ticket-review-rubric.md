# Rúbricas de puntuación de ticket-review

## Rúbrica de puntuación del ticket (1–10)

Puntúa el ticket, no el brief de revisión.

- **10**: Problema claro; AC binarios cubren done; alcance in/out explícito; dependencias resueltas o dispensadas; estimación ajusta al alcance; QA/CI claros; análisis de factibilidad coincide con repo; sin ambigüedades bloqueantes; sin drift a plan de implementación
- **9**: Listo para implementar; solo nits triviales de redacción o una Pregunta abierta menor
- **8**: Implementable con pequeñas clarificaciones del ticket; no requiere drift significativo
- **7**: Ticket útil pero AC, alcance o dependencias necesitan resolución humana antes de coding
- **5–6**: Gaps materiales: AC faltantes, alcance difuso, bloqueadores sin resolver, o estimación claramente errónea
- **1–4**: Problema incorrecto, alcance inseguro (auth/PII), o ticket contradice la realidad del codebase

## Rúbrica de puntuación del brief de revisión (1–10)

Puntúa el artefacto de análisis (separado del puntaje del ticket).

- **10**: Verificaciones de AC, alcance, dependencias, estimación y factibilidad completas; ≥2 rutas citadas (o vacío listado); 1–2 anclajes de convención; exactamente una acción Ready for mapeada al gap más alto; Preguntas abiertas solo para elementos sin resolver; nada inventado; drift a plan de implementación detectado y reportado cuando aplica
- **9**: Documento de revisión completo; solo nits triviales
- **8**: Útil pero análisis de factibilidad débil, estado de dependencias débil, o justificación de Ready for suave
- **7**: Cubre el ticket; la estructura o evidencia necesita rework
- **5–6**: Intención inventada, omite AC, sin acción Ready for, o recomienda `plan` a pesar de bloqueadores
- **1–4**: Revisión inusable: recomendaciones incorrectas, contradice el ticket, u omite riesgos de auth/PII

## Estrategia de revisión

Mejora el brief de revisión en **como máximo 2** rondas hasta que el puntaje del brief sea ≥ 9. **No** edites el ticket de la fuente en este paso para forzar el puntaje.
