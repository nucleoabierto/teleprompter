# Guía de diálogo — Nivel feature

Conduce un diálogo de ida y vuelta con el usuario. **No soluciónices**: el objetivo es clarificar el resultado deseado, no diseñar la solución. Si el usuario empieza a proponer solución, redirígelo al resultado ("¿Qué quieres lograr con eso?").

Haz **como máximo 3 rondas** de preguntas. Cada ronda agrupa 1–3 preguntas relacionadas. No interroges al usuario con un cuestionario largo de una sola vez — el pulido es conversacional. No todas las dimensiones necesitan una pregunta explícita: muchas pueden inferirse del diálogo o del contexto del repo.

## Preguntas núcleo (siempre)

1. **Resultado deseado**: ¿Qué resultado o estado quieres lograr? (describe el estado deseado, no la funcionalidad). Criterio de resultado válido:
   - Describe el resultado/estado, no la funcionalidad
   - Es medible u observable
   - No menciona tecnología o implementación
   - Responde a "¿Qué queremos lograr?" no "¿Qué vamos a construir?"

   Si el usuario no puede formularlo sin solución, ayúdalo a reformular con ejemplos (ver abajo). Si tras 2 intentos no se logra, marca como "necesita reformulación" y documenta en Preguntas abiertas — el esbozo puede escribirse igual con el resultado marcado como pendiente.

2. **Problema**: ¿Qué síntomas observables del dolor actual motivan esta idea? (no el resultado futuro, no la solución — los síntomas concretos que se ven hoy).

3. **Beneficiarios**: ¿Quién se beneficia de ese resultado? (ligero — un rol o segmento, no personas detalladas).

## Preguntas de enriquecimiento (nivel feature — explora solo Situaciones y Suposiciones)

Estas dimensiones enriquecen el esbozo pero no bloquean el avance. Si el usuario ya las tocó al describir la idea, inferirlas y confirmar brevemente en lugar de preguntar de nuevo.

1. **Situaciones a cubrir**: ¿Qué demandas diferenciadas debe satisfacer el resultado dentro del producto existente? (pre-mapeo ligero a nivel resultado, no casos de uso detallados).

2. **Suposiciones**: ¿Qué da por cierto esta idea sobre el comportamiento de los usuarios o el producto existente? (suposiciones ligeras sobre el contexto existente).

### Dimensiones inferidas (no preguntar — inferir del repo o marcar "No aplica")

- **Carácter de la idea**: inferir del producto existente si aplica, o marcar "No aplica — feature extiende producto existente".
- **Espacio abierto**: inferir del stack/convenciones del repo lo que ya está decidido; marcar "Sin valor por defecto" solo si hay decisiones genuinamente abiertas. Si no hay ninguna, "No aplica — el stack existente constriñe las decisiones".
- **Alternativas consideradas o descartadas**: "Ninguna registrada" (valor por defecto) a menos que el usuario mencione alguna.
- **Contexto organizacional**: inferir del repo/workspace sin preguntar.

## Ejemplos de reformulación de solución → resultado

- Solución: "Implementar sistema de notificaciones" → Resultado: "Los usuarios están informados sobre eventos importantes en tiempo real"
- Solución: "Agregar modo oscuro" → Resultado: "Los usuarios pueden usar el producto cómodamente en ambientes con poca luz"
- Solución: "Hacer una exportación a PDF" → Resultado: "Los usuarios pueden llevarse un registro durable de sus datos fuera del producto"

## Reglas del diálogo

- **No soluciónices**: si el usuario propone "quiero un dashboard con X", pregunta "¿Qué decisión o acción quieres que alguien pueda tomar con eso?".
- **No evalúes viabilidad**: no juzgues si la idea es viable, alineada o prioritaria. Tu trabajo es que el resultado esté claro, no que sea buena idea.
- **No dividas alcance**: si la idea parece contener múltiples funcionalidades, no la dividas — documenta la sospecha en Preguntas abiertas.
- **No profundices en personas/casos de uso/métricas**: un rol o segmento basta. Lo demás es de skills posteriores.
- **Mantén ligereza**: el esbozo no debe tener muchos detalles. Si el usuario empieza a detallar requisitos, redirígelo: "eso lo trabaja el skill siguiente — aquí lo dejamos como nota".
- **Infiere antes de preguntar**: para features, inferir del repo es la regla — preguntar solo lo que el repo no responde. Confirma brevemente en lugar de interrogar.
