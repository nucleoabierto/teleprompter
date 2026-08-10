---
name: evaluar-alcance-idea
description: >-
  Evalúa la viabilidad preliminar y alcance de una idea. Primero evalúa la
  alineación estratégica para decidir si la idea merece inversión (fail-fast).
  Si procede, evalúa si contiene múltiples funcionalidades o una sola, divide
  ideas complejas en funcionalidades individuales con alcance, propuesta de valor
  y temporalidad, y declara tamaño (full/lite). Úsalo después de analizar-idea y
  antes de priorizar-roadmap. Triggers comunes: evaluar alcance, dividir idea,
  validar viabilidad preliminar, determinar tamaño. No lo usas para describir el
  producto (usa analizar-idea), ni para validar viabilidad de negocio a fondo
  (usa validar-viabilidad-producto), ni para priorizar (usa priorizar-roadmap).
---

# Evaluador de Alcance de Ideas

Evalúa si la idea merece inversión antes de dedicar tiempo a dividir alcance. Si procede, evalúa si la idea contiene múltiples funcionalidades que requieren PRDs separados o una sola funcionalidad cohesiva que justifica un solo PRD, y divide ideas complejas en funcionalidades individuales manejables.

Solo análisis y planificación, no implementa ni modifica código, prepara la idea para priorización.

## Cuándo usarlo y cuándo no

- **Sí**: existe una descripción del producto para evaluar su viabilidad preliminar y determinar si la idea requiere múltiples PRDs o uno solo
- **No**: para describir el producto, para viabilidad de negocio a fondo con matriz de decisión, para priorizar funcionalidades, para conectividad técnica, para implementar

NOTA: Al ejecutar las distintas fases, determina las partes que no requieren intervención del usuario y divide las tareas para usar subagentes, ya sea para ejecutar tareas en paralelo o para ejecutarlas de forma consecutiva pero aprovechando el subagente especializado.

## Fase 0: Resolver entrada

Requerido: `IDEA-DESCRIPCION`.

Infiere desde:
- Contenido breve: "Agregar dark mode", "Sistema de notificaciones", etc.
- Artefacto: si existe `docs/<domain>/idea/<IDEA-SLUG>/idea-analysis.md` (producido por `analizar-idea`), leerlo para heredar la descripción del producto, problema, estado final, beneficiarios y decisiones resueltas

Pregunta cuando falta: "¿Cuál es la idea que evalúo? (descripción breve o completa)" y detente a esperar la respuesta.

## Fase A: Eco y diagnóstico inicial

Devuelve al usuario un eco breve de lo que entendiste (idea y resultado) y un diagnóstico inicial de qué tan lista está la idea para evaluación de alcance.

**Diagnóstico de madurez** (clasifica la idea en uno de estos estados):

- **Verde**: solo una idea bruta sin descripción del producto, necesita `analizar-idea` primero
- **Borrador**: hay descripción del producto pero mezclada con implementación o sin claridad sobre el alcance, necesita diálogo focalizado
- **Casi lista**: el producto está claro y la experiencia se intuye, diálogo mínimo de confirmación

**Diagnóstico de nivel** (clasifica la idea en uno de estos niveles):

- **Producto**: idea de producto completo, nuevo producto o iniciativa nueva que define su propio espacio.
- **Feature**: idea de funcionalidad nueva dentro de un producto existente.

Criterios para distinguir nivel:

- **Producto**: no hay producto previo o la idea define un espacio nuevo (no extiende uno existente). Requiere crear módulos nuevos y no existe un punto claro del sistema que pueda absorber la idea.
- **Feature**: hay un módulo en el producto existente que se puede usar como base para realizar una función específica ("modo oscuro", "exportar reportes", "notificaciones push", "agregar autenticación con Google"). Generalmente se expresa como una extensión para mejorar la experiencia del usuario.

Presenta ambos diagnósticos y confirma que quiere evaluar el alcance antes de avanzar. Si el diagnóstico de madurez es "Verde", redirige a `analizar-idea` primero. En cualquier caso detente y espera la confirmación.

## Fase B: Gate preliminar de viabilidad

**Fail-fast.** Antes de invertir tiempo en dividir alcance, evalúa si la idea merece inversión. Si no procede, el workflow se detiene aquí sin pasar a la Fase C.

Consulta [references/viability-gate-guide.md](references/viability-gate-guide.md) para la lógica completa de criterios, veredicto, estrategia de fallo y declaración de tamaño.

## Fase C: Analizar Alcance de la Idea

Evalúa si la idea contiene múltiples funcionalidades o una sola.

Consulta [references/scope-analysis-guide.md](references/scope-analysis-guide.md) para la lógica completa de criterios, estrategia de fallo y resultados del análisis.

## Fase D: Generar Scope Roadmap

Genera el roadmap de alcance usando el template en `assets/scope-roadmap-template.md`.

Consulta [references/scope-roadmap-guide.md](references/scope-roadmap-guide.md) para la lógica completa de secciones a completar, estructura del roadmap y recomendaciones de implementación.

## Fase E: Clasificar Estado de Avance (preliminar)

Antes de fijar el `status` y `next` en el frontmatter, clasifica el estado de avance preliminar basado en la clasificación de alcance:

**Si es funcionalidad única**: estado preliminar `next: evaluar-conectividad-tecnica`

**Si son múltiples funcionalidades**: estado preliminar `next: priorizar-roadmap`

**Si la clasificación es ambigua o la información es insuficiente**: estado preliminar `status: blocked` (sin `next`)

El estado preliminar se refina en la Fase F según las preguntas abiertas (decisiones pendientes) identificadas.

## Fase F: Gate de Avance Condicionado (Preguntas Abiertas)

**Gate obligatorio.** Ejecuta este gate después de completar el análisis (Fases A–E) y antes de fijar el `status` y `next` en el frontmatter. El documento no está completo hasta que Fase F se ejecuta y se documenta.

Consulta [references/advancement-gate-guide.md](references/advancement-gate-guide.md) para la lógica completa de estados de avance, clasificación de severidad, reglas y documentación del gate.

## Salida

Escribe en formato principal en `docs/<domain>/idea/<IDEA-SLUG>/scope-roadmap.md` (subdirectorio), con compatibilidad legacy en `docs/<domain>/idea/<IDEA-SLUG>-scope-roadmap.md` (prefijo).

Usa el template en `assets/scope-roadmap-template.md` para la estructura completa del artefacto (frontmatter requerido, secciones requeridas, convenciones de formato, estructura del desglose interno).

### README del dominio (índice)

Si existe `docs/<domain>/README.md`, actualiza la tabla de "Puntos de entrada" con un enlace al scope-roadmap recién generado.

**Nota**: Si la Fase B recomienda "No proceder" (idea desalineada), el scope-roadmap se escribe igual con el veredicto de viabilidad y `status: blocked`, pero no se actualiza el README con entradas de roadmap ya que la idea no avanza.

## Checklist de salida

Antes de marcar el skill como terminado, verifica cada ítem. Si alguno es "No", revisa y completa antes de terminar. El documento no está completo hasta que todos pasan.

### Contenido

1. Gate preliminar de viabilidad evaluado correctamente (alineación estratégica)
2. Tamaño declarado con justificación (`full` / `lite`)
3. Evaluación correcta del alcance (múltiples funcionalidades vs única)
4. División del alcance cuando fue necesario
5. Identificación de funcionalidades con alcance claro
6. Value proposition definido para cada funcionalidad
7. Dependencias identificadas entre funcionalidades
8. `status` y `next` correctos según el estado de avance de la Fase F (`next` ausente si `blocked`)

### Formato (verificación de convenciones)

10. Frontmatter con `idea_slug`, `domain`, `date`, `skill`, `profile`, `status`, `next` correctos
11. Sección **"Decisiones Pendientes"** presente y documentada con clasificación por severidad (críticas/importantes/menores)
12. Sin emojis en el documento, usa texto como `Pass`/`Partial`/`Fail` o `Sí`/`Parcial`/`No`

## Preguntas Abiertas

Usa el template en `assets/open-questions-template.md` para documentar información faltante. El flujo de avance condicionado está definido en la **Fase F** y detallado en ese template.

**Importante**: Las decisiones pendientes identificadas en el desglose de fases internas (Fase D) y las preguntas de las estrategias de fallo de Fases B y C alimentan directamente el gate de la Fase F. No se avanza al siguiente skill sin pasar por ese gate.
