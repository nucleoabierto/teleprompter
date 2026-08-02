---
name: evaluar-conectividad-tecnica
description: >-
  Evalúa prerequisitos técnicos y conectividad de una funcionalidad con el
  codebase actual. Genera assessment de prerequisitos y bridge roadmap cuando
  la funcionalidad está desconectada. Salida: prerequisites-assessment,
  bridge-roadmap (si aplica). Úsalo después de evaluar-alcance-idea o
  priorizar-roadmap.
---

# Evaluador de Conectividad Técnica

Evalúa prerequisitos técnicos y conectividad de una funcionalidad con el codebase actual. Determina si la funcionalidad está conectada al producto existente o si requiere features puente para construir la infraestructura necesaria.

Solo análisis y planificación: no implementa, no modifica código. Prepara la funcionalidad para capturar-requerimiento.

**Scope**: Este skill evalúa conectividad a nivel PRD/funcionalidad. Para conectividad a nivel epic, usa `evaluar-conectividad-epic`. La diferencia:
- PRD-level: evalúa si la funcionalidad completa tiene prerequisitos en el codebase
- Epic-level: evalúa si un epic específico tiene prerequisitos (más granular)

Los artefactos viven en rutas distintas según el scope.

## Fase 0 — Resolver entrada

Requerido: `FUNCIONALIDAD-SLUG` o `IDEA-DESCRIPCION`.

Infiere desde:
- Ruta: `docs/**/idea/<IDEA-SLUG>-scope-roadmap.md` (para extraer funcionalidad específica)
- Slug: si el usuario especifica una funcionalidad del roadmap
- Descripción pegada: si el usuario pega la funcionalidad directamente

Pregunta cuando falta: "¿Qué funcionalidad evalúo? (slug del roadmap o descripción)"

Declara inputs resueltos: funcionalidad capturada.

## Fase A — Evaluar Prerequisitos Técnicos

Analiza el codebase actual para identificar prerequisitos existentes.

**Detección de greenfield**: antes de enumerar infraestructura, verifica si el repo destino tiene codebase/producto previo. Señales de greenfield:
- Repo vacío o recién inicializado (sin `src/`, `package.json` previo, sin módulos de aplicación).
- Sin infraestructura de producto (auth, DB, APIs, servicios, frontend, monitoring).
- La funcionalidad es el primer entregable del producto (no extiende uno existente).

Si el repo es greenfield, NO se salta el paso: ejecuta la Fase A de forma reducida (ver "Modo greenfield" abajo) y produce el artefacto obligatorio. La conectividad se evalúa como "conectado por vacío" (sin prerequisitos previos que falten), pero el artefacto queda como registro de la decisión.

**Infraestructura existente** (modo codebase existente):
- Auth system (JWT, OAuth, sessions, etc.)
- Database (PostgreSQL, MongoDB, etc., schemas existentes)
- APIs (REST, GraphQL, endpoints existentes)
- Servicios (queue, cache, search, email, etc.)
- Frontend framework y patrones
- Monitoring y logging

**Features implementadas relacionadas** (modo codebase existente):
- Busca features similares con `grep` y `find_file_by_name`
- Identifica patrones arquitectónicos usados
- Mapea bounded contexts existentes

**Deuda técnica relevante** (modo codebase existente):
- TODOs, FIXMEs, deprecated code
- Legacy systems que afectan la funcionalidad
- Known limitations o constraints

**Comparación prerequisitos de la funcionalidad vs estado actual**:
- ¿Qué componentes necesita la funcionalidad?
- ¿Cuáles existen?
- ¿Cuáles faltan?
- ¿Cuáles necesitan upgrades?

### Modo greenfield

Cuando el repo es greenfield (sin codebase/producto previo):
- Infraestructura existente: ninguna (declarar explícitamente "greenfield — sin infraestructura previa").
- Prerequisitos de la funcionalidad: listar los que la funcionalidad aporta o requiere (ej: runtime, dependencias externas, convenciones de archivos).
- Gaps: ninguno bloqueante (la funcionalidad construye su propia base) o listar los pocos que falten.
- Conectividad: **conectado (greenfield)** — sin prerequisitos previos que falten porque no hay producto previo del que depender.
- Genera el artefacto obligatorio con veredicto "conectado (greenfield)" y justificación. No se salta el paso: el artefacto es el registro de la decisión.

### Modo greenfield — short-form (path lite)

Cuando el repo es greenfield Y `profile: lite` (ver `analizar-idea`), emite un **short-form** en vez del assessment completo. El assessment completo para greenfield es 90% filas "No existe / No aplica (greenfield)" — ceremonia innecesaria para un MVP interno. El short-form preserva el veredicto y los componentes a crear, sin enumerar cada categoría de infraestructura como N/A:

```
# Prerequisites Assessment: <PRD-SLUG>
- **Skill**: evaluar-conectividad-tecnica
- **Modo**: Greenfield (short-form, profile=lite)
- **Fecha**: <fecha>

## Veredicto: Conectado (greenfield)

El repo `<repo>` es greenfield: sin codebase/producto previo, sin infraestructura de producto. La funcionalidad es el primer entregable — no extiende uno existente. Conectividad: conectado por vacío (sin prerequisitos previos que falten).

## Componentes a crear (tabla mínima)

| Componente | Notas |
|---|---|
| <componente 1> | <se crea como parte del MVP> |
| <componente 2> | <se crea como parte del MVP> |

## Ready for: capturar-requerimiento
```

Skip del escaneo de auth/DB/APIs/servicios/frontend/monitoring (todos N/A en greenfield). Solo lista los componentes que la funcionalidad aporta o requiere. Si hay gaps bloqueantes (ej: "acceso al scope npm debe confirmarse"), lístalos como notas — pero en greenfield puro normalmente no los hay.

## Fase B — Evaluar Conectividad

Determina si la funcionalidad está conectada al producto actual:

**Criterios de conectividad**:
- Prerequisitos críticos existen ✅
- Prerequisitos faltantes son alcanzables con esfuerzo razonable (< 2 semanas) ✅
- Patrones arquitectónicos son compatibles ✅
- Integración con bounded contexts existentes es posible ✅
- **Greenfield**: sin prerequisitos previos que falten → conectado por vacío ✅

**Si la funcionalidad está conectada** (incluye greenfield):
- Pasa directo a `capturar-requerimiento`
- Genera `docs/<domain>/initiatives/<PRD-SLUG>/connectivity/prerequisites-assessment.md` con análisis positivo (en modo greenfield, con veredicto "conectado (greenfield)" y justificación)

> Si la conectividad se evalúa por epic en vez de por PRD, el artefacto vive en `docs/<domain>/initiatives/<PRD-SLUG>/epics/<EPIC-SLUG>/prerequisites-assessment.md` (sin subcarpeta `connectivity/`).

**Si la funcionalidad está desconectada**:
- Faltan prerequisitos críticos que no existen
- Infraestructura base no está presente
- Patrones arquitectónicos son incompatibles
- Integración requiere refactor mayor

Genera roadmap de **features puente**:
- Features intermedias que construyen la infraestructura necesaria
- Cada feature puente tiene valor por sí misma
- Secuencia lógica de dependencias
- Estimación de esfuerzo por feature

Ejemplo de features puente para "sistema de recomendaciones ML":
1. Feature puente 1: Sistema de tracking de eventos (value: analytics básico)
2. Feature puente 2: Data warehouse y pipelines ETL (value: reporting)
3. Feature puente 3: API de modelo simple (value: integraciones externas)
4. Feature puente 4: Sistema de recomendaciones básico (value: recommendations rule-based)
5. Feature objetivo: Sistema de recomendaciones ML completo

## Fase C — Generar Documentos de Salida

**Documento 1: Prerequisites Assessment** (siempre)
`docs/<domain>/initiatives/<PRD-SLUG>/connectivity/prerequisites-assessment.md`

> Si la conectividad se evalúa por epic en vez de por PRD, el artefacto vive en `docs/<domain>/initiatives/<PRD-SLUG>/epics/<EPIC-SLUG>/prerequisites-assessment.md` (sin subcarpeta `connectivity/`).

Usa el template en `assets/prerequisites-assessment-template.md` y rellena con:
- Infraestructura existente (auth, database, APIs, servicios, frontend, monitoring)
- Prerequisitos de la funcionalidad (componentes necesarios, integraciones requeridas, patrones arquitectónicos)
- Gaps identificados (prerequisitos faltantes, upgrades necesarios, deuda técnica)
- Evaluación de conectividad (estado, justificación, bloqueadores críticos)
- Recomendaciones (proceder a capturar-requerimiento o revisar bridge roadmap)

**Tablas requeridas en prerequisites-assessment**:

1. Tabla de Requisitos Técnicos:
   | Requisito | Tipo | Detalle |
   |---|---|---|

2. Tabla de Análisis del Codebase Actual:
   | Componente | Estado | Notas |
   |---|---|---|

3. Tabla de Matriz de Prerequisitos vs Existentes:
   | Prerequisito | Existe en codebase | Suficiente | Acción requerida |
   |---|---|---|---|

**Documento 2: Bridge Roadmap** (solo si está desconectado)
`docs/<domain>/initiatives/<PRD-SLUG>/connectivity/bridge-roadmap.md`

> Si la conectividad se evalúa por epic en vez de por PRD, el artefacto vive en `docs/<domain>/initiatives/<PRD-SLUG>/epics/<EPIC-SLUG>/bridge-roadmap.md` (sin subcarpeta `connectivity/`).

Usa el template en `assets/bridge-roadmap-template.md` y rellena con:
- Análisis de desconexión (bloqueadores principales, infraestructura faltante, estimación de esfuerzo)
- Features puente (cada una con prerequisitos que construye, value proposition, esfuerzo estimado, dependencias, success criteria)
- Feature objetivo (prerequisitos requeridos, value proposition, esfuerzo estimado, dependencias, success criteria)
- Recomendación de implementación (empezar con, justificación, next step)

## Fase D — Definir Ready For

**Si la funcionalidad está conectada**:
- `Ready for: capturar-requerimiento` con la funcionalidad original

**Si la funcionalidad está desconectada**:
- `Ready for: priorizar-roadmap` para priorizar features puente

**Si la información es insuficiente**:
- `Ready for: blocked` con preguntas abiertas

## Fase G — Gate de Avance Condicionado (Preguntas Abiertas)

**Gate obligatorio.** Después de completar el análisis (Fases A–D) y antes de fijar el `Ready for` y escribir el documento final, ejecuta este gate. El documento **no está completo** hasta que Fase G se ejecuta y se documenta, incluso si todas las preguntas se resolvieron inline durante las Fases A/B.

**Principio**: Las preguntas abiertas no bloquean automáticamente el avance, pero el usuario debe ser alertado y tener la opción de responderlas antes de avanzar. El avance es **condicionado**, no automático. La alerta ocurre **antes de** fijar el `Ready for` y avanzar al siguiente skill (`capturar-requerimiento` si conectado, `priorizar-roadmap` si desconectado).

### Estados de avance

1. **Inventariar preguntas abiertas**: Reúne todas las preguntas generadas durante las Fases A y B, clasificadas por severidad (Crítico / Importante / Menor). Incluye también las preguntas que se resolvieron inline durante el análisis — el inventario debe reflejar todo lo que se identificó, con su estado de resolución.

2. **Clasificar el estado de avance**:
   - **Avance bloqueado**: Hay preguntas Críticas sin resolver → `Ready for: bloqueado`
   - **Avance condicionado**: Hay preguntas Importantes sin resolver → `Ready for: <siguiente> (condicionado)` donde `<siguiente>` es `capturar-requerimiento` o `priorizar-roadmap` según el veredicto de conectividad. Alerta al usuario con el inventario; ofrece responder ahora o avanzar con default conservador.
   - **Avance libre**: Solo hay preguntas Menores o todas las Críticas/Importantes están resueltas → `Ready for: <siguiente>`

3. **Documentar la ejecución del gate**: Con independencia del resultado, añade al documento una subsección "Gate de avance (Fase G)" que registre:
   - Inventario de preguntas identificadas (críticas/importantes/menores) con su estado (resuelta inline / resuelta en gate / pendiente).
   - Si hubo alerta: confirma que se presentó al usuario y qué decidió.
   - Estado final de avance (bloqueado / condicionado / libre) que justifica el `Ready for`.

### Reglas

- **Nunca** omitir la alerta cuando hay preguntas Críticas o Importantes sin resolver.
- **Nunca** marcar `Ready for` libre si hay preguntas Importantes o Críticas sin resolver.
- **Nunca** omitir la subsección "Gate de avance (Fase G)" del documento — es la evidencia de que el gate se ejecutó.
- Las preguntas Menores no requieren alerta ni condicionan el avance; se documentan para seguimiento.
- Si todas las preguntas se resolvieron inline durante A/B, el gate sigue documentándose (inventario con estado "resuelta inline", avance libre) — el gate no se omite, se registra como ejecutado sin alerta necesaria.

### Ejemplo canónico — Gate con todas resueltas inline

```markdown
## Gate de avance (Fase G)

- **Inventario de preguntas identificadas**:
  - [Importante] ¿El servicio de auth existente soporta los flujos del PRD? — Estado: resuelta inline
  - [Menor] ¿Versionado de la API interna documentado? — Estado: resuelta inline
- **Alerta al usuario**: No necesaria — todas las Críticas/Importantes se resolvieron inline durante el análisis.
- **Estado final de avance**: Libre — `Ready for: capturar-requerimiento`
```

Para el flujo detallado del gate (formato de alerta, manejo de respuestas del usuario, herencia de preguntas pendientes en el siguiente skill, best practices), consultar `_shared/open-questions-template.md` sección "Integración con Ready For — Avance Condicionado".

## Salida

Escribe en:
- `docs/<domain>/initiatives/<PRD-SLUG>/connectivity/prerequisites-assessment.md` (siempre)
- `docs/<domain>/initiatives/<PRD-SLUG>/connectivity/bridge-roadmap.md` (solo si está desconectado)

**Header requerido** (al inicio del documento):
- PRD slug / Epic slug (según scope)
- Dominio
- Fecha
- Skill: evaluar-conectividad-tecnica
- Input: ruta del artefacto fuente (scope-roadmap o epic)

**Secciones requeridas en prerequisites-assessment**:
- Infraestructura existente
- Prerequisitos de la funcionalidad
- Gaps identificados
- Evaluación de conectividad
- Recomendaciones
- Acceptance Criteria del epic/funcionalidad (si están disponibles)
- Dependencias upstream/downstream
- Autoevaluación (checklist de validación)
- Gate de avance (Fase G) — **obligatoria** incluso si todas las preguntas se resolvieron inline
- Ready for

Ready for valores:
- `capturar-requerimiento`: Funcionalidad conectada, proceder a estructurar requerimiento
- `priorizar-roadmap`: Funcionalidad desconectada, proceder a priorizar features puente
- `blocked`: Información insuficiente, necesita más contexto

## Autoevaluación

Después de completar la evaluación de conectividad, usa el checklist en `references/autoevaluacion-checklist.md` para validar:

1. Análisis de infraestructura existente
2. Identificación de prerequisitos de la funcionalidad
3. Evaluación de conectividad correcta
4. Generación de bridge roadmap cuando fue necesario
5. Features puente con valor propio y dependencias
6. Definición correcta del "Ready for"
7. **Path lite**: si greenfield Y profile=lite, se emitió short-form (no assessment completo con filas N/A por categoría)
8. Documentos de salida accionables

Si alguna respuesta es "No", revisa y completa antes de marcar el skill como terminado.
