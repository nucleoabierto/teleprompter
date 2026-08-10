# Template: Preguntas Abiertas

Template para documentar información faltante e incógnitas que requieren aclaración antes de proceder.

## Propósito

Documentar cualquier información faltante, incertidumbres o preguntas que deben resolverse antes de proceder al siguiente paso del workflow. Esto asegura que las incógnitas sean visibles y rastreables.

**Nota**: Este template es solo para **preguntas abiertas/incógnitas** (información faltante que requiere resolución externa). Los **criterios de calidad del análisis** (ej: ¿el producto conecta problema y resultado?, ¿se describe en términos de experiencia?) se evalúan en el gate pero no se documentan aquí, son validaciones internas del skill.

## Categorías de incógnitas

**Información faltante**: Datos o contexto que no está disponible
**Ambigüedad de requisitos**: Requerimientos que no son claros
**Dependencias externas**: Elementos fuera de control que afectan el proyecto
**Riesgos identificados**: Riesgos conocidos que requieren mitigación

## Formato de documentación

Para cada pregunta abierta, documentar:

1. **Pregunta o problema**: Descripción clara de la incógnita
2. **Impacto**: Cómo afecta esta incógnita al proyecto
3. **Severidad**: Crítico / Importante / Menor
4. **Propuesta de resolución**: Cómo se puede resolver

## Gate de avance

La lógica completa del gate (niveles de severidad, estados de avance, flujo, reglas y ejemplos) está en [references/gate-guide.md](../references/gate-guide.md). Consúltala durante la Fase D para decidir `status` y `next`.

El gate evalúa **dos tipos de criterios**:

1. **Criterios de calidad del análisis**: Validaciones internas que el skill debe cumplir (ej: el producto conecta problema y resultado, se describe en términos de experiencia). Si un criterio Crítico falla, el skill debe corregir el análisis antes de avanzar.
2. **Preguntas abiertas/incógnitas**: Información faltante que requiere resolución externa (las que se documentan en este template). Si hay Críticas sin resolver, el gate bloquea el avance.
