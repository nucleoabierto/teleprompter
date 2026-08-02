# Guía de descripciones

Especificación de descripciones para skills y rúbrica de auditoría para `revisar-skills`.

## Contenido

- [Especificación de descripciones](#especificación-de-descripciones)
- [Rúbrica de auditoría de descripciones (1–10)](#rúbrica-de-auditoría-de-descripciones-110)

## Especificación de descripciones

### Formato

- **Longitud**: 1–1024 caracteres
- **Voz**: tercera persona desde la perspectiva del modelo
- **Idioma**: español para dominio del negocio, inglés para términos técnicos
- **Sin I/you**: prohibido "I can help", "you should", "helps with"

### Estructura WHAT + WHEN + Boundary

Toda descripción debe incluir:

- **WHAT**: Capacidades + entregable principal
  - Ejemplo: "Evalúa un SKILL.md contra mejores prácticas..."
- **WHEN**: Frases de trigger o etapa de workflow
  - Ejemplo: "Úsalo cuando el usuario pida revisar..."
- **Boundary**: Qué NO hace (si hay superposición con hermanos)
  - Ejemplo: "No lo usas para crear skills desde cero..."

### Palabras clave de trigger

Incluye sustantivos de tarea y sinónimos que el usuario podría usar:

- **Revisión**: revisar, auditar, evaluar, puntuar, mejorar
- **Implementación**: implementar, ejecutar, construir, desarrollar
- **Planificación**: planificar, diseñar, arquitecturar, estrategia
- **Generación**: generar, crear, producir, construir
- **Clasificación**: clasificar, triage, priorizar, categorizar

### Ejemplos buenos y malos

- **Bueno**: "Evalúa un SKILL.md contra las mejores prácticas de diseño de agent skills. Úsalo cuando el usuario pida revisar, auditar, evaluar, puntuar o mejorar un skill."
  - Por qué: WHAT claro, WHEN específico, trigger keywords
- **Malo**: "I can help you review code"
  - Por qué: Primera persona, sin WHEN, sin trigger keywords
- **Bueno**: "Orquesta el pipeline completo para implementar un ticket del repositorio. Úsalo cuando el usuario pida implementar un ticket de extremo a extremo."
  - Por qué: WHAT + WHEN claros, boundary implícito
- **Malo**: "Helps with code review"
  - Por qué: Voz pasiva, sin WHAT específico, sin WHEN
- **Bueno**: "Genera un research brief desde un ticket. Úsalo cuando el usuario pida preparar el contexto de implementación o revisión de un ticket."
  - Por qué: WHAT + WHEN + trigger keywords
- **Malo**: "A tool for reviewing"
  - Por qué: Genérico, sin trigger keywords, sin boundary

### Routing test

#### Pregunta de routing

¿Ganaría sobre skills hermanos para los triggers declarados?

Si la respuesta es no o ambigua, la description score ≤ 7.

## Rúbrica de auditoría de descripciones (1–10)

### Gate de calidad

- **Voz**: ¿Está en tercera persona (sin I/you)?
  - Pass: Tercera persona completa
  - Partial: Mezcla de voces
  - Fail: Primera persona o "helps with"
- **WHAT**: ¿Declara capacidades + entregable principal?
  - Pass: WHAT claro y específico
  - Partial: WHAT presente pero vago
  - Fail: WHAT ausente o confuso
- **WHEN**: ¿Incluye frases de trigger o etapa de workflow?
  - Pass: WHEN específico con keywords
  - Partial: WHEN presente pero genérico
  - Fail: WHEN ausente
- **Keywords**: ¿Incluye palabras clave de trigger relevantes?
  - Pass: Keywords variadas y relevantes
  - Partial: Keywords limitados
  - Fail: Sin keywords relevantes
- **Boundary**: ¿Declara qué NO hace (si hay superposición)?
  - Pass: Boundary claro cuando aplica
  - Partial: Boundary parcial o ausente cuando no crítico
  - Fail: Boundary ausente cuando hay superposición
- **Longitud**: ¿Está entre 1–1024 caracteres?
  - Pass: Dentro del rango
  - Partial: Levemente fuera del rango
  - Fail: Fuera del rango significativamente
- **Routing**: ¿Gana routing test vs hermanos?
  - Pass: Routing claro
  - Partial: Routing ambiguo
  - Fail: Pierde vs hermanos

### Matriz de puntuación

- **10**: Pass; Todas las filas = pass; Cero hallazgos
- **9**: Pass; Cero missing; ≤ 1 partial en filas no críticas; Cero hallazgos blocker/important
- **8**: Pass o Partial; Cero filas fail; ≤ 2 partial; Cero hallazgos blocker
- **7**: Partial; Múltiples partial pero routing aún funcional; No blocker
- **5–6**: Fail; Cualquier fila fail, o 2+ missing; Cualquier blocker
- **1–4**: Fail; Descripción rompe spec o es engañosa; —

### Auditoría para revisar-skills

Usa este checklist en Phase B del skill de revisión:

- [ ] Tercera persona (sin I/you routing voice)
- [ ] WHAT — capacidades + entregable
- [ ] WHEN — frases de trigger o etapa de workflow
- [ ] Palabras clave de trigger (sustantivos de tarea, sinónimos)
- [ ] Boundary — qué NO hace (si hay superposición con hermanos)
- [ ] Longitud 1–1024 caracteres
- [ ] `name` coincide con directorio; naming spec (ver naming-guide.md)
- [ ] Routing test — ¿ganaría vs hermanos para triggers declarados?
- [ ] No marketing / no vague / no body leakage

Si score < 8, incluye rewrite propuesto (texto completo, ≤1024 caracteres) en hallazgos.
