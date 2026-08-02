---
name: capturar-requerimiento
description: >-
  Captura y estructura un requerimiento bruto de producto (idea, feature,
  problema). Genera documento con: problema, usuarios afectados, solución
  propuesta, restricciones. Salida:
  docs/<domain>/initiatives/<PRD-SLUG>/requirements.md. Úsalo para estructurar
  ideas antes de validación de viabilidad.
---

# Capturador de Requerimientos

Captura y estructura un requerimiento de producto bruto. Transforma una idea vagaba o descripción informal en documento estructurado listo para validación.

Solo documentación: no valida, no aprueba. Estructura la idea.

## Fase 0 — Resolver entrada

Requerido: `IDEA-DESCRIPCION` o `BREVE`.

Infiere desde:
- Descripción pegada: si el usuario pega la idea/feature request
- Contenido breve: "Agregar dark mode", "Sistema de notificaciones", etc.
- Email o chat snippet: si el usuario copia descripción informal

Pregunta cuando falta: "¿Cuál es la idea que capturo? (descripción breve o completa)"

Declara inputs resueltos: idea capturada.

## Fase A — Analizar Idea Bruta

Lee la descripción e identifica:
1. **Problema central**: ¿Qué problema resuelve?
2. **Contexto**: ¿Por qué importa ahora?
3. **Solución propuesta**: ¿Qué se propone?
4. **Actores**: ¿Quiénes están involucrados?
5. **Restricciones mencionadas**: tiempo, presupuesto, tech, etc.

## Fase B — Estructurar Requerimiento

Genera documento con secciones:

```
### 1. Problema
**Declaración de problema**: 
[En 2-3 oraciones, qué problema existe]

Ejemplo:
"Los usuarios no reciben notificaciones importantes de su cuenta, 
causando que se pierdan oportunidades de engagement. 
Actualmente no hay sistema de notificaciones."

### 2. Audiencia Afectada
- **Usuarios primarios**: [Quién sufre el problema más]
- **Usuarios secundarios**: [Quién se beneficia indirectamente]
- **Internos**: [Product, Sales, Support, etc.]

Ejemplo:
- Primarios: Usuarios activos (ej: 5K diarios)
- Secundarios: Nuevos usuarios (onboarding)
- Internos: CS team (reduce tickets), Product

### 3. Solución Propuesta
**Descripción de alto nivel**:
[Qué se va a construir, en lenguaje simple — solo el "qué", no el "cómo"]

**Regla de no-solutionización**: la solución propuesta se describe a nivel de **propósito/capacidad**, no de detalle de diseño. NO incluir aquí: formato de archivos, flags de CLI, políticas de UX (overwrite/skip/abort), mecanismos de handoff, esquemas de manifiesto, rutas destino, políticas de colisiones. Esas decisiones se toman en `generar-prd` (sección RF), informadas por personas y casos de uso. Si el usuario las menciona al capturar la idea, registrarlas en "Preguntas abiertas" como "decisión de diseño pendiente — se resuelve en generar-prd", no en "Decisiones resueltas".

Ejemplo (bueno — propósito/capacidad):
"Sistema de notificaciones que alerta a usuarios sobre eventos importantes de su cuenta, con preferencias por usuario."

Ejemplo (malo — cristalización prematura de diseño):
"Sistema de notificaciones con tabla `notifications` (id, user_id, type, payload jsonb), worker Redis BullMQ, endpoint POST /v1/notifications, política de rate-limit 5/min." ← esto es diseño de solución, va en el PRD/TRD.

### 4. Restricciones Conocidas
- **Timing**: [Cuándo se necesita, si hay deadline]
- **Recursos**: [Equipo disponible, restricciones]
- **Técnicas**: [Tech stack obligatorio, sistemas existentes que afecta]
- **Negocio**: [Budget si es conocido, prioridad relativa]

Ejemplo:
- Timing: "Necesitado antes de Q3 feature launch"
- Recursos: "1 backend dev, 1 frontend dev"
- Técnicas: "Debe integrar con email service existente (SendGrid)"
- Negocio: "Part of retention initiative, high priority"

### 5. Preguntas Abiertas
[Lo que NO se sabe y necesita clarificación]

Ejemplo:
- ¿Qué canales de notificación? (email only, SMS, push?)
- ¿Qué frecuencia máxima? (evitar spam)
- ¿Integración con sistema de analytics existente?
- ¿Soporte para webhooks de terceros?
```

## Fase C — Validar Completitud

Checklist:
- ✅ ¿Problema está claro?
- ✅ ¿Usuarios identificados?
- ✅ ¿Solución propuesta descrita?
- ✅ ¿Restricciones documentadas?
- ✅ ¿Preguntas abiertas listadas?

Si algo falta, agregarlo o listarlo en preguntas abiertas.

## Fase G — Gate de Avance Condicionado (Preguntas Abiertas)

**Gate obligatorio.** Después de completar el análisis (Fases A–D) y antes de fijar el `Ready for` y escribir el documento final, ejecuta este gate. El documento **no está completo** hasta que Fase G se ejecuta y se documenta, incluso si todas las preguntas se resolvieron inline durante las Fases A/B/C.

**Principio**: Las preguntas abiertas no bloquean automáticamente el avance, pero el usuario debe ser alertado y tener la opción de responderlas antes de avanzar. El avance es **condicionado**, no automático. La alerta ocurre **antes de** fijar el `Ready for` y avanzar a `mapear-assumptions` (recomendado) o `validar-viabilidad-producto`.

### Estados de avance

1. **Inventariar preguntas abiertas**: Reúne todas las preguntas generadas durante las Fases A, B y C (incluyendo la sección "5. Preguntas Abiertas" de la Fase B), clasificadas por severidad (Crítico / Importante / Menor). Incluye también las preguntas que se resolvieron inline durante el análisis — el inventario debe reflejar todo lo que se identificó, con su estado de resolución.

2. **Clasificar el estado de avance**:
   - **Avance bloqueado**: Hay preguntas Críticas sin resolver → `Ready for: bloqueado`
   - **Avance condicionado**: Hay preguntas Importantes sin resolver → `Ready for: mapear-assumptions (condicionado)` (o `validar-viabilidad-producto (condicionado)` si se omite `mapear-assumptions`). Alerta al usuario con el inventario; ofrece responder ahora o avanzar con default conservador.
   - **Avance libre**: Solo hay preguntas Menores o todas las Críticas/Importantes están resueltas → `Ready for: mapear-assumptions` (o `validar-viabilidad-producto`)

3. **Documentar la ejecución del gate**: Con independencia del resultado, añade al documento una subsección "Gate de avance (Fase G)" que registre:
   - Inventario de preguntas identificadas (críticas/importantes/menores) con su estado (resuelta inline / resuelta en gate / pendiente).
   - Si hubo alerta: confirma que se presentó al usuario y qué decidió.
   - Estado final de avance (bloqueado / condicionado / libre) que justifica el `Ready for`.

### Reglas

- **Nunca** omitir la alerta cuando hay preguntas Críticas o Importantes sin resolver.
- **Nunca** marcar `Ready for` libre si hay preguntas Importantes o Críticas sin resolver.
- **Nunca** omitir la subsección "Gate de avance (Fase G)" del documento — es la evidencia de que el gate se ejecutó.
- Las preguntas Menores no requieren alerta ni condicionan el avance; se documentan para seguimiento.
- Si todas las preguntas se resolvieron inline durante A/B/C, el gate sigue documentándose (inventario con estado "resuelta inline", avance libre) — el gate no se omite, se registra como ejecutado sin alerta necesaria.

### Ejemplo canónico — Gate con todas resueltas inline

```markdown
## Gate de avance (Fase G)

- **Inventario de preguntas identificadas**:
  - [Importante] ¿La audiencia primaria es interna o externa? — Estado: resuelta inline
  - [Menor] ¿Hay restricciones de compliance específicas del dominio? — Estado: resuelta inline
- **Alerta al usuario**: No necesaria — todas las Críticas/Importantes se resolvieron inline durante el análisis.
- **Estado final de avance**: Libre — `Ready for: mapear-assumptions`
```

Para el flujo detallado del gate (formato de alerta, manejo de respuestas del usuario, herencia de preguntas pendientes en el siguiente skill, best practices), consultar `_shared/open-questions-template.md` sección "Integración con Ready For — Avance Condicionado".

## Fase D — Escribir Requerimiento Capturado

Estructura:

1. **Resumen ejecutivo**: 1-2 oraciones del requerimiento
2. **Problema**: Descripción clara del pain point
3. **Audiencia afectada**: Primarios, secundarios, internos
4. **Solución propuesta**: Descripción de alto nivel
5. **Restricciones**: Timing, recursos, técnicas, negocio
6. **Preguntas abiertas**: Qué se necesita clarificar
7. **Restricciones y Decisiones de Alcance** (opcional): Decisiones tomadas durante la captura, con fecha de resolución. **Gate de no-solutionización**: las decisiones registradas aquí solo pueden ser de tipo:
   - **(a) Restricciones de timing/recursos/negocio** (ej: "MVP en 3-4 semanas", "1-2 personas", "dogfooding-first").
   - **(b) Restricciones de tech stack impuestas externamente** (ej: "Stack: Node ≥ 18 LTS + TypeScript", "Debe integrar con SendGrid existente").
   - **(c) Decisiones de alcance** (qué queda fuera del MVP, qué se difiere a post-MVP).
   - **NO permitidas**: decisiones de diseño de solución (formato de archivos/manifiestos, flags de CLI, políticas de UX como overwrite/skip/abort, mecanismos de handoff, rutas destino, esquemas, políticas de colisiones). Esas se toman en `generar-prd` (sección RF), informadas por personas y casos de uso. Si una decisión de este tipo aparece durante la captura, moverla a "Preguntas abiertas" como "decisión de diseño pendiente — se resuelve en generar-prd".
8. **Ready for**: `mapear-assumptions` (recomendado) o `validar-viabilidad-producto`

## Salida

Escribe en: `docs/<domain>/initiatives/<PRD-SLUG>/requirements.md`

**Header requerido** (al inicio del documento):
- Req slug
- Dominio
- Fecha
- Skill: capturar-requerimiento
- Input: ruta del artefacto fuente (idea/feature-prioritization.md o descripción pegada)

**Secciones requeridas**:
- Header requerido
- Resumen ejecutivo
- Descripción del problema
- Audiencia afectada (primaria, secundaria, interna)
- Solución propuesta (alto nivel)
- Restricciones conocidas
- Preguntas abiertas
- Restricciones y Decisiones de Alcance (opcional): decisiones de timing/recursos/tech-stack/alcance con fecha — **sin decisiones de diseño de solución** (ver gate de no-solutionización en Fase D item 7)
- Autoevaluación (checklist de validación)
- Gate de avance (Fase G) — **obligatoria** incluso si todas las preguntas se resolvieron inline
- Ready for (`mapear-assumptions` recomendado, `validar-viabilidad-producto`, `blocked` si información crítica falta)

**Autoevaluación (checklist de validación)**:
- [ ] Problema declarado en 2-3 oraciones claras
- [ ] Audiencia primaria, secundaria e interna identificada
- [ ] Solución propuesta descrita en lenguaje simple
- [ ] Restricciones (timing, recursos, técnicas, negocio) documentadas
- [ ] Preguntas abiertas listadas
- [ ] Decisiones resueltas documentadas con fecha (si aplica)
- [ ] **No-solutionización**: ninguna "decisión resuelta" es de detalle de diseño de solución (formato de archivos, flags, políticas de UX, mecanismos de handoff, rutas destino, esquemas, políticas de colisiones) — si lo es, se movió a "Preguntas abiertas" como decisión de diseño pendiente para `generar-prd`
- [ ] Ready for definido correctamente
- [ ] Documento de salida accionable

Ready for valores:
- `mapear-assumptions`: Requerimiento estructurado, mapear supuestos antes de validar (recomendado)
- `validar-viabilidad-producto`: Requerimiento estructurado, proceder directo a validación (`docs/<domain>/initiatives/<PRD-SLUG>/product-viability.md`)
- `blocked`: Información crítica faltante, no proceder hasta aclarar

En la sección Ready for, incluye la ruta relativa del siguiente artefacto esperado (ej: `docs/<domain>/initiatives/<PRD-SLUG>/assumption-map.md` o `docs/<domain>/initiatives/<PRD-SLUG>/product-viability.md`).

---

## Ejemplo Completo

```markdown
# Requirements: Sistema de Notificaciones

## Resumen
Implementar sistema centralizado de notificaciones para alertar a usuarios 
sobre eventos importantes en tiempo real, mejorando engagement y retención.

## Problema
Usuarios pierden oportunidades importantes porque no reciben alertas sobre 
cambios en su cuenta o eventos time-sensitive. Actualmente 30% abandona sin 
reconocer oportunidades debido a falta de comunicación.

## Audiencia Afectada
- **Primaria**: Usuarios activos (5K diarios, creciendo 20%/mes)
- **Secundaria**: Nuevos usuarios en onboarding (500/semana)
- **Interna**: CS team (reduce tickets), Product, Sales (upsell)

## Solución Propuesta
Sistema de notificaciones omnichannel:
- Email (transaccional + digest)
- Push (mobile app)
- In-app bell notification
- Preferencias por usuario (qué y cómo recibir)

## Restricciones
- Timing: Before Q3 feature launch (8 semanas)
- Recursos: 1 backend, 1 frontend, 1 QA
- Tech: Usar SendGrid existente, integrar con analytics
- Negocio: High priority (retention iniciativa)

## Preguntas Abiertas
- ¿Frecuencia máxima? (evitar spam)
- ¿Soportar webhooks third-party?
- ¿A/B test en diferentes cadencias?
```
