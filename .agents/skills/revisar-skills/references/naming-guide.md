# Guía de nombres

Especificación de nombres para skills y rúbrica de auditoría para `revisar-skills`.

## Contenido

- [Especificación de nombres](#especificación-de-nombres)
- [Rúbrica de auditoría de nombres (1–10)](#rúbrica-de-auditoría-de-nombres-110)

## Especificación de nombres

### Formato

- **Caracteres permitidos**: minúsculas, números y guiones
- **Longitud**: ≤ 64 caracteres
- **Infinitivo preferido**: verbos en infinitivo para acciones (ej: `revisar`, `construir`, `planificar`)
- **Único y conciso**: sin duplicados en la misma librería
- **Sin dobles guiones**: prohibido `--`

### Patrones de verbos

- **`revisar`**: Auditoría y evaluación
  - Ejemplos: `revisar-skills`, `revisar-codigo`
- **`implementar`**: Ejecución de planes
  - Ejemplos: `implementar-ticket`, `implementar-feature`
- **`planificar`**: Diseño y estrategia
  - Ejemplos: `planificar-implementacion`, `planificar-arquitectura`
- **`generar`**: Creación de artefactos
  - Ejemplos: `generar-contexto`, `generar-brief`
- **`clasificar`**: Clasificación y priorización
  - Ejemplos: `clasificar-tareas`, `clasificar-comentarios`
- **`orquestar`**: Coordinación de workflows
  - Ejemplos: `orquestar-workflow`, `orquestar-pipeline`

### Sufijos de etapa

Cuando un skill es parte de un workflow mayor, usa sufijos consistentes:

- **`-review`**: Auditoría/evaluación
  - Ejemplo: `ticket-review`, `pr-review`
- **`-brief`**: Documento de investigación
  - Ejemplo: `context-brief`, `research-brief`
- **`-plan`**: Plan de implementación
  - Ejemplo: `implementation-plan`, `architecture-plan`
- **`-triage`**: Clasificación de trabajo
  - Ejemplo: `tasks-triage`, `comments-triage`

### Ejemplos buenos y malos

- **Bueno**: `ejecutar-tests`
  - Por qué: Verbo claro, infinitivo, propósito obvio
- **Malo**: `test-helper`
  - Por qué: Sufijo genérico, no dice qué hace
- **Bueno**: `migracion-base-datos`
  - Por qué: Dominio específico, acción clara
- **Malo**: `data-skill-v2`
  - Por qué: Versión genérica, sin propósito
- **Bueno**: `revisar-pr`
  - Por qué: Verbo + objeto, ámbito claro
- **Malo**: `deployService`
  - Por qué: CamelCase, no sigue spec
- **Bueno**: `planificar-implementacion`
  - Por qué: Etapa de workflow clara
- **Malo**: `plan-impl`
  - Por qué: Abreviación innecesaria

## Rúbrica de auditoría de nombres (1–10)

### Gate de calidad

- **Spec**: ¿Cumple formato (minúsculas, guiones, ≤64, sin `--`, coincide con directorio)?
  - Pass: Todo cumple
  - Partial: Un elemento falla (ej: longitud > 35)
  - Fail: Múltiples elementos fallan
- **Verbo**: ¿El token principal es un verbo en infinitivo que coincide con la acción principal del cuerpo?
  - Pass: Verbo claro y alineado
  - Partial: Verbo débil o desalineado leve
  - Fail: Sin verbo o completamente desalineado
- **Sufijo**: ¿El sufijo de etapa (si aplica) es correcto?
  - Pass: Sufijo estándar correcto
  - Partial: Sufijo no estándar pero comprensible
  - Fail: Sufijo incorrecto o ausente cuando es requerido
- **Ambigüedad**: ¿No es ambiguo vs skills hermanos en la misma cadena?
  - Pass: Diferenciación clara
  - Partial: Superposición leve con hermanos
  - Fail: Nombre idéntico o muy similar a hermano

### Matriz de puntuación

- **10**: Pass; Todas las filas = pass; Cero hallazgos
- **9**: Pass; Cero missing; ≤ 1 partial en filas no críticas; Cero hallazgos blocker/important
- **8**: Pass o Partial; Cero filas fail; ≤ 2 partial; Cero hallazgos blocker
- **7**: Partial; Múltiples partial pero nombre aún funcional; No blocker
- **5–6**: Fail; Cualquier fila fail, o 2+ missing; Cualquier blocker
- **1–4**: Fail; Nombre rompe spec o es engañoso; —

### Acción alineación test

> "Si se invocara solo por el nombre, ¿un compañero esperaría la acción principal de este skill?"

Si la respuesta es no, el verb score ≤ 6.

### Auditoría para revisar-skills

Usa este checklist en Phase B del skill de revisión:

- [ ] Spec: minúsculas, guiones, longitud ≤64, sin `--`, coincide con directorio
- [ ] Token principal es verbo en infinitivo (o término de dominio aceptado)
- [ ] Verbo coincide con acción principal en SKILL.md body
- [ ] Sufijo de etapa es preciso (si aplica)
- [ ] No es ambiguo vs hermanos en la misma cadena
- [ ] Longitud razonable (< ~35 caracteres a menos que la etapa requiera más)

Si score < 8 o hay mismatch de verbo, incluye renombre propuesto (≤64 caracteres) en hallazgos.
