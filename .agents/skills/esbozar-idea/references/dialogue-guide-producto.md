# Guía de diálogo — Nivel producto

Conduce un diálogo de ida y vuelta con el usuario. **No soluciónices**: el objetivo es clarificar el resultado deseado, no diseñar la solución. Si el usuario empieza a proponer solución, redirígelo al resultado ("¿Qué quieres lograr con eso?").

Haz **como máximo 5 rondas** de preguntas. Cada ronda agrupa 1–3 preguntas relacionadas. No interroges al usuario con un cuestionario largo de una sola vez, el pulido es conversacional. No todas las dimensiones necesitan una pregunta explícita: muchas pueden inferirse del diálogo o del contexto del repo.

## Preguntas núcleo (siempre)

1. **Resultado deseado**: ¿Qué resultado o estado quieres lograr? (describe el estado deseado, no la funcionalidad). Criterio de resultado válido:
   - Describe el resultado/estado, no la funcionalidad
   - Es medible u observable
   - No menciona tecnología o implementación
   - Responde a "¿Qué queremos lograr?" no "¿Qué vamos a construir?"

   Si el usuario no puede formularlo sin solución, ayúdalo a reformular con ejemplos (ver abajo). Si tras 2 intentos no se logra, marca como "necesita reformulación" y documenta en Preguntas abiertas. El esbozo puede escribirse igual con el resultado marcado como pendiente.

2. **Problema**: ¿Qué síntomas observables del dolor actual motivan esta idea? (no el resultado futuro, no la solución, los síntomas concretos que se ven hoy).

3. **Beneficiarios**: ¿Quién se beneficia de ese resultado? (ligero, un rol o segmento, no personas detalladas).

## Preguntas de enriquecimiento (nivel producto — explora todas)

Estas dimensiones enriquecen el esbozo pero no bloquean el avance. Si el usuario ya las tocó al describir la idea, infiere las respuestas y confirma brevemente en lugar de preguntar de nuevo.

1. **Carácter de la idea**: ¿Qué valores distinguen esta idea de alternativas? (declaración de intenciones: reproducibilidad, seguridad, agnosticismo, etc.).

2. **Situaciones a cubrir**: ¿Qué demandas diferenciadas debe satisfacer el resultado? (pre-mapeo ligero a nivel resultado: "instalación inicial", "actualización con colisiones". No casos de uso detallados con happy path/edge cases).

3. **Espacio abierto**: ¿Qué decisiones están deliberadamente abiertas? Distingue entre:
   - **Sin valor por defecto**: decisiones sin preferencia inicial (lenguaje, formato, canal de distribución, etc.).
   - **Con valor por defecto a reevaluar**: decisiones con un valor por defecto provisional que el skill siguiente puede revisar.

4. **Suposiciones**: ¿Qué da por cierto esta idea? (suposiciones ligeras: "los agentes consumen instrucciones", "los repos usan git").

5. **Alternativas consideradas o descartadas**: ¿Hay alternativas que ya se pensaron y se descartaron? ("Ninguna registrada" es un valor válido).

## Ejemplos de reformulación de solución → resultado

- Solución: "Implementar sistema de notificaciones" → Resultado: "Los usuarios están informados sobre eventos importantes en tiempo real"
- Solución: "Agregar modo oscuro" → Resultado: "Los usuarios pueden usar el producto cómodamente en ambientes con poca luz"
- Solución: "Hacer una exportación a PDF" → Resultado: "Los usuarios pueden llevarse un registro durable de sus datos fuera del producto"

## Reglas del diálogo

- **No soluciónices**: si el usuario propone "quiero un dashboard con X", pregunta "¿Qué decisión o acción quieres que alguien pueda tomar con eso?".
- **No evalúes viabilidad**: no juzgues si la idea es viable, alineada o prioritaria. Tu trabajo es que el resultado esté claro, no que sea buena idea.
- **No dividas alcance**: si la idea parece contener múltiples funcionalidades, no la dividas. Documenta la sospecha en Preguntas abiertas.
- **No profundices en personas/casos de uso/métricas**: un rol o segmento basta. Lo demás es de skills posteriores.
- **Mantén ligereza**: el esbozo no debe tener muchos detalles. Si el usuario empieza a detallar requisitos, redirígelo: "eso lo trabaja el skill siguiente, aquí lo dejamos como nota".
- **Infiere antes de preguntar**: las dimensiones de enriquecimiento pueden inferirse de lo que el usuario ya dijo o del contexto del repo. Confirma brevemente en lugar de interrogar.
