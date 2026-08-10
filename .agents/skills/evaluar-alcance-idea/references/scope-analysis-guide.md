# Guía de Análisis de Alcance

Esta guía define cómo evaluar si una idea contiene múltiples funcionalidades o una sola funcionalidad cohesiva.

## Criterios para múltiples funcionalidades

Una idea contiene múltiples funcionalidades cuando cumple uno o más de estos criterios:

- La idea describe varias features independientes que pueden tener PRDs separados
- Ejemplos: "sistema de notificaciones + sistema de archivos + sistema de chat"
- Múltiples bounded contexts impactados
- Requiere múltiples equipos o especialidades
- Tiene componentes naturales que pueden entregarse independientemente
- Alta complejidad técnica que justifica descomposición

## Criterios para funcionalidad única

Una idea es una funcionalidad única cuando cumple uno o más de estos criterios:

- La idea describe una feature cohesiva que justifica un solo PRD
- Ejemplos: "alertas de inactividad", "exportar a PDF", "2FA"
- Dominio único o bounded context existente
- Implementable por 1-2 personas
- No tiene componentes naturales independientes
- Complejidad técnica manejable en un solo esfuerzo

## Estrategia de fallo

Si no se puede clasificar con confianza (la idea es ambigua o mezcla concerns), realizar una exploración activa:

### Experimento mental de implementación

1. **Recorrer la implementación mentalmente**: Simula cómo se construiría esta idea paso a paso
   - ¿Qué módulos/components se necesitarían?
   - ¿Qué bounded contexts se impactarían?
   - ¿Qué endpoints/APIs se crearían?
   - ¿Qué datos se persistirían?

2. **Mapear el código existente**: Explora el codebase actual para identificar:
   - ¿Existen módulos similares que puedan reutilizarse?
   - ¿Hay bounded contexts existentes que absorban parte de la funcionalidad?
   - ¿Qué patrones arquitectónicos ya están establecidos?
   - ¿Qué dependencias externas se necesitarían?

3. **Determinar el alcance basado en el mapeo**:
   - Si el mapeo muestra componentes naturales independientes → múltiples funcionalidades
   - Si el mapeo muestra un bounded context cohesivo → funcionalidad única
   - Si el mapeo sigue siendo ambiguo → proceder a la siguiente sección

### Preguntar al usuario si sigue siendo vago

Si después del experimento mental y mapeo del código la clasificación sigue siendo ambigua:

1. Formular una pregunta específica basada en el análisis: "Basado en el mapeo del código, la idea podría dividirse en [X componentes]. ¿Prefieres tratar esto como múltiples funcionalidades independientes o como una funcionalidad con sub-componentes?"
2. Presentar las opciones con trade-offs claros
3. Dejar que el usuario decida la clasificación
4. Documentar la decisión tomada como "Decisión resuelta (YYYY-MM-DD)"

### No forzar una clasificación

Solo en último caso, si el usuario no puede decidir:

1. Marcar como "clasificación ambigua"
2. Documentar preguntas abiertas (Crítica: "¿la idea describe N features independientes o una feature con sub-componentes?")
3. Dejar que la Fase F decida el avance

## Resultados del análisis

**Si son múltiples funcionalidades**:

- Dividir en funcionalidades individuales con alcance claro
- Para cada funcionalidad definir: alcance específico, value proposition, dependencias
- Generar roadmap de funcionalidades con orden de implementación (basado en dependencias)
- El orden de implementación se define en la sección "Recomendación" del scope-roadmap

**Si es funcionalidad única**:

- No dividir
- Pasar directo a evaluación de conectividad
- Generar scope-roadmap con una sola funcionalidad
