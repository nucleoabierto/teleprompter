# Rúbrica de puntuación del plan de implementación (1–10)

- **10**: Alcance ajustado; arquitectura fuerte; ≥2 rutas de convención hermanas citadas; cobertura completa de AC; validación clara y dirigida; guía de commits paso a paso revisable con tests ordenados sensatamente; efectos de segundo orden abordados o explícitamente ninguno
- **9**: Plan senior con cobertura y convenciones apropiadas; coincide con artefactos hermanos en tono y profundidad; el orden de tests sigue ZOMBIES durante la planificación o solo nits triviales de ordenamiento
- **8**: Plan senior pero desalineado con las convenciones hermanas citadas o pasos de validación vagos para las capas cambiadas
- **7**: Implementa los requisitos; aún se necesitan mejoras de arquitectura antes de codificar
- **5–6**: Vacíos en criterios, tests, edge cases inseguros sin manejar, o scope creep sin Preguntas abiertas
- **1–4**: El plan contradice los AC del ticket, entry points incorrectos, o enfoque inseguro de auth/PII

## Gates de aprobación

Un plan debe cumplir estos estándares antes de poder puntuar ≥ 9:

- Cada criterio de aceptación se mapea a al menos un commit o paso de validación explícito.
- El pase de convenciones cita ≥2 rutas hermanas que la implementación debería reflejar.
- La guía de commits está ordenada y es revisable (no una lista de lavandería de archivos).
- Los tests dirigidos por commit siguen el ordenamiento ZOMBIES durante la planificación donde aplique (Z → O → M happy path; B/I/E cubiertos); el plan escrito usa solo descripciones de tests en lenguaje plano.

## Regla de Ready for

Cuando la puntuación del plan sea ≤ 7, Ready for no debe ser `implement`.

## Verificación rápida de 9 vs 8

Si solicitarías una corrección importante de arquitectura o convención antes de codificar, puntúa ≤ 8.

## Estrategia de revisión

Mejora el plan en **como máximo 2** rondas de revisión hasta que la puntuación sea ≥ 9. Si sigue por debajo de 9 después de 2 rondas, detente e informa los bloqueos en lugar de iterar indefinidamente.
