# Plantilla de secciones de artefactos (compartido)

Patrones comunes para secciones de puntaje, readiness y preguntas abiertas en artefactos de workflow.

## Puntuación + justificación con cláusula de omisión

```
X. Puntuación del [ARTEFACTO] y breve justificación (omítelo solo si se bloquea antes de escribir)
```

**Patrón**: La sección de puntuación debe incluir una cláusula explícita de omisión para casos donde el skill se bloquea antes de poder generar el artefacto completo.

**Ejemplos de uso**:

- `Puntuación del plan + breve justificación (omítelo cuando se bloquee antes de escribir)`
- `Puntuación del brief de revisión y breve justificación (omítelo solo si se bloquea antes de escribir)`
- `Puntuación de implementación y breve justificación (omítelo solo si se bloquea antes de escribir)`

## Ready for con declaración en chat

```text
Y. Ready for: `OPCION1` | `OPCION2` | `OPCION3` — exactamente uno, con por qué (también decláralo en el chat)
```

**Patrón**: La sección Ready for debe:

1. Listar las opciones válidas separadas por `|`
2. Especificar "exactamente uno"
3. Requerir justificación ("con por qué")
4. Incluir instrucción para declarar también en el chat

**Ejemplos de uso**:

- `Ready for: implement | spike | context-brief | blocked — exactamente uno, con por qué (también decláralo en el chat)`
- `Ready for: context-brief | plan | refine | blocked — exactamente uno + por qué (indícalo también en el chat)`
- `Ready for: local-review | fix-locally | blocked — exactamente una opción y por qué (también decláralo en el chat)`

## Preguntas abiertas

```
Z. Preguntas abiertas (solo elementos sin resolver)
```

**Patrón**: La sección de preguntas abiertas debe:

1. Contener solo elementos sin resolver
2. No incluir items que ya fueron resueltos
3. Ser la última sección del artefacto típicamente

**Ejemplos de uso**:

- `Preguntas abiertas (solo elementos sin resolver)`
- `Preguntas abiertas / bloqueadores (solo elementos sin resolver)`

## Uso recomendado

Al crear o actualizar skills que generan artefactos con estas secciones, referencia este template para mantener consistencia en la redacción y estructura.
