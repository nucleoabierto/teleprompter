# Guía de Gate de Avance Condicionado

Esta guía define cómo ejecutar el gate de avance condicionado basado en preguntas abiertas (decisiones pendientes).

## Principio

Las preguntas abiertas (decisiones pendientes) no bloquean automáticamente el avance, pero el usuario debe ser alertado y tener la opción de responderlas antes de avanzar. El avance es **condicionado**, no automático. La alerta ocurre **antes de comenzar** la siguiente etapa (fijar el `Ready for` y avanzar al siguiente skill), no después.

## Estados de avance

### 1. Inventariar preguntas abiertas

Reúne todas las decisiones pendientes identificadas en el desglose de fases internas (Fase D) y las preguntas de las estrategias de fallo de Fases B y C, clasificadas por severidad (Crítico / Importante / Menor). Incluye también las preguntas que se resolvieron durante el análisis, el inventario debe reflejar todo lo que se identificó con su estado de resolución.

**Clasificación de severidad para decisiones pendientes**:

- **Crítico**: bloquea la implementación de la funcionalidad (ej: decisión de modelo de distribución sin la cual no se puede estimar alcance/timeline)
- **Importante**: afecta calidad o timeline pero no bloquea completamente (ej: UX de selección, multi-paquete sí/no)
- **Menor**: no bloquea progreso, ideal resolver (ej: versionado independiente vs atado)

### 2. Clasificar el estado de avance

Combina con el estado preliminar de Fase E:

- **Avance bloqueado**: hay preguntas Críticas sin resolver, `Ready for: bloqueado`
- **Avance condicionado**: hay preguntas Importantes sin resolver, `Ready for: [siguiente skill] (condicionado)`. Alerta al usuario con el inventario; ofrece responder ahora o avanzar con default conservador.
- **Avance libre**: solo hay preguntas Menores o todas las Críticas/Importantes están resueltas, `Ready for: [siguiente skill]`

### 3. Documentar la ejecución del gate

Con independencia del resultado, añade al documento una subsección "Gate de avance (Fase F)" que registre:

- Inventario de preguntas identificadas (críticas/importantes/menores) con su estado (resuelta durante el análisis / resuelta en gate / pendiente).
- Si hubo alerta: confirma que se presentó al usuario y qué decidió.
- Estado final de avance (bloqueado / condicionado / libre) que justifica el `Ready for`.

## Reglas

- **Nunca** omitir la alerta cuando hay preguntas Críticas o Importantes sin resolver
- **Nunca** marcar `Ready for: [siguiente skill]` (libre) si hay preguntas Importantes o Críticas sin resolver
- **Nunca** omitir la subsección "Gate de avance (Fase F)" del documento, es la evidencia de que el gate se ejecutó
- **Siempre** incluir el inventario completo de preguntas, incluso las que se resolvieron durante el análisis
- **Siempre** documentar la decisión del usuario cuando hay alerta (respondió ahora / avanzó con default conservador)
