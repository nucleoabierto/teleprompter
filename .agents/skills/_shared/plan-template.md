# Template de plan de implementación

Secciones requeridas para un plan de implementación completo.

## Secciones requeridas

1. **Mapeo de objetivo y criterios de aceptación**
   - Tabla o checklist que mapea cada criterio de aceptación a un paso del plan

2. **Efectos de segundo orden y hardening**
   - Para cada paso mayor, lista efectos de segundo orden (callers, jobs, flags, auth/PII, serializadores, mobile/legacy)
   - Integra el hardening en el plan

3. **Referencias de convención**
   - 2–3 patrones hermanos con rutas específicas
   - Adaptación del plan para que el código nuevo se vea nativo de este codebase

4. **Guía paso a paso**
   - Commits pequeños y revisables
   - Cada commit tiene: propósito + archivos + tests
   - Descripciones de tests en lenguaje plano (no etiquetas ZOMBIES)

5. **Comandos de validación**
   - Comandos dirigidos a las áreas cambiadas
   - Nunca el suite completo

6. **Puntuación del plan + breve justificación**
   - Omítelo cuando se bloquee antes de escribir el plan

7. **Ready for**
   - Exactamente uno: `implement` | `spike` | `context-brief` | `blocked`
   - Incluye justificación del por qué

8. **Preguntas abiertas**
   - Solo elementos sin resolver
   - Incógnitas que bloquean la codificación segura

## Formato

Prefiere evidencia de docs de contexto, documentación y rutas de repo. Mantén el archivo fácil de leer con encabezados, párrafos cortos y tablas cuando sea útil.
