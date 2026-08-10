---
name: analizar-idea
description: >-
  Toma una idea de producto (esbozo o idea bruta) y redacta una descripción
  narrativa del producto con suficiente detalle para permitir análisis técnico
  posterior y descomposición en épicas y tareas, sin entrar en stack,
  arquitectura ni implementación. Úsalo cuando el usuario tenga una idea y
  quiera describir la forma del producto o funcionalidad antes de formalizar
  requerimientos. Triggers comunes: describir, narrar, bosquejar la solución,
  definir la funcionalidad, qué construir. No lo uses para explicar el
  problema, ni para evaluar viabilidad, ni para estructurar requerimientos
  formales o generar PRDs.
---

# Analizador de Ideas

Toma una idea que contenga el problema a resolver y redacta una descripción narrativa del producto que la resuelve. La descripción es de nivel producto: pinta el problema, el resultado al que conduce y la solución que conecta ambos. Sirve para entender qué es el producto, qué experiencia ofrece, qué forma tiene, qué comportamientos entrega, qué no es, sin mencionar tecnología, arquitectura ni implementación. El detalle es lo suficientemente completo para que quien gestione el desarrollo pueda hacer un análisis posterior y descomponer en épicas y tareas sin tener que volver a preguntar lo básico. La viabilidad, el alcance, la priorización, las personas, los casos de uso y el PRD son trabajo de skills posteriores.

## Cuándo usarlo y cuándo no

- **Sí**: la idea ya describe un problema claro y se necesita explicar qué producto lo resuelve antes de avanzar a formalización. El objetivo es pintar el producto y la experiencia, no la implementación.
- **No**: esbozar el resultado sin solución, evaluar viabilidad o generar go/no-go, estructurar requerimientos formales, dividir alcance, definir personas o casos de uso, o generar el PRD. Detener si la descripción empieza a incluir stack técnico, esquemas de datos o detalles de implementación.

NOTA: Al ejecutar las distintas fases, determina las partes que no requieren intervención del usuario y divide las tareas para usar subagentes, ya sea para ejecutar tareas en paralelo o para ejecutarlas de forma consecutiva pero aprovechando el subagente especializado.

## Fase 0 — Resolver entrada

Requerido: `IDEA-DESCRIPCION` (texto con la idea, por vago que sea el producto).

Infiere desde:
- Idea expresada en el mensaje: "Quiero algo para que la gente exporte reportes", "estaría bueno notificar a los usuarios", "modo oscuro".
- Archivo referenciado en el mensaje: si el usuario menciona un archivo que contiene la idea, úsalo y cita la ruta.

Si no se puede inferir la idea o el resultado no está claro, pregunta: "¿Cuál es la idea y qué resultado quieres lograr? (si no queda claro el problema a resolver, usa `esbozar-idea` primero)" y detente a esperar la respuesta.

## Fase A — Eco y diagnóstico inicial

Devuelve al usuario un eco breve de lo que entendiste (problema y objetivo) y un diagnóstico inicial de qué tan lista está la idea para ser descrita como producto.

**Diagnóstico de madurez** (clasifica la idea en uno de estos estados):

- **Verde**: hay un resultado pero no hay ninguna imagen del producto que lo resuelve. Necesita diálogo completo.
- **Borrador**: hay un resultado y alguna noción vaga del producto, pero mezclada con solución técnica o sin claridad sobre la experiencia generada. Necesita diálogo focalizado.
- **Casi lista**: el resultado está claro, el producto es visible y la experiencia se intuye. Diálogo mínimo de confirmación.

**Diagnóstico de nivel** (clasifica la idea en uno de estos niveles):

- **Producto**: idea de producto completo, nuevo producto o iniciativa nueva que define su propio espacio.
- **Feature**: idea de funcionalidad nueva dentro de un producto existente.

Criterios para distinguir nivel:

- **Producto**: no hay producto previo o la idea define un espacio nuevo (no extiende uno existente). Requiere crear módulos nuevos y no existe un punto claro del sistema que pueda absorber la idea.
- **Feature**: hay un módulo en el producto existente que se puede usar como base para realizar una función específica ("modo oscuro", "exportar reportes", "notificaciones push", "agregar autenticación con Google"). Generalmente se expresa como una extensión para mejorar la experiencia del usuario.

Presenta ambos diagnósticos y confirma que quiere describir la funcionalidad antes de avanzar. Si el usuario ya trae una idea con producto visible (madurez "Casi lista"), ofrece generar la descripción con la información disponible. En cualquiera de los casos detente y espera la respuesta

## Fase B - Resolución de dominio

`domain` es la carpeta raíz que agrupa los artefactos del workflow de PRD.

El diagnóstico de nivel (Producto vs Feature) informa la lógica: **Feature** → dominio del producto existente que extiende; **Producto** → dominio nuevo o existente según encaje. Resumen operativo:

1. **Inventariar dominios existentes** en `docs/`.
2. **Inferir 1–3 candidatos** en kebab-case del área de producto (no técnica).
3. **Filtrar por nivel**: Feature → solo dominios existentes; Producto → existentes o nuevo.
4. **Decidir**: 0 candidatos → preguntar; 1 candidato → usar; >1 candidatos → preguntar.

Consulta [references/domain-resolution-guide.md](references/domain-resolution-guide.md) para la lógica completa, ejemplos y reglas.

## Fase C — Diálogo de descripción interactiva

Conduce un diálogo de ida y vuelta con el usuario. **Describe el producto, no la implementación**: el objetivo es pintar el problema, el resultado y la solución con suficiente detalle para planificar, no cómo se construye. Si el usuario empieza a proponer stack técnico o arquitectura, redirígelo al producto ("¿Qué experiencia quieres que el usuario viva con eso?"). Busca cubrir las dimensiones del artefacto, en este orden:

1. **Confirmar el problema** — si viene de esbozo, confirma brevemente. Si la idea viene bruta, aclara los síntomas de hoy, quién sufre y el workaround actual sin solución.
2. **Confirmar el resultado** — el estado final al que se quiere llegar, el flujo del usuario después del cambio, qué deja de pasar. Sin solución.
3. **Pintar la solución** — la pregunta central: "¿Qué producto entrega ese estado final? Descríbelo por la experiencia que ofrece el usuario, no por cómo se construye." Explora la forma, la experiencia, qué es y qué no es.
4. **Explorar comportamientos clave** — qué hace el producto, en términos de experiencia.
5. **Explorar escenarios y variantes** — las bifurcaciones de experiencia que el producto necesita resolver (fallo, saturación, ausencia, etc.). No las resuelvas aquí; identifícalas para análisis posterior.
6. **Aclarar el beneficiario** — quién se beneficia, ligero (un rol o segmento). Se introduce naturalmente al hablar del producto, no como pregunta aislada.

El nivel diagnosticado en la Fase A modula el alcance del diálogo:
- **Producto** → diálogo amplio para establecer un espacio nuevo (la experiencia se describe de cero)
- **Feature** → diálogo acotado que asume el producto existente como contexto y extiende lo que ya existe.

La diferencia de alcance por nivel está ejemplificada en [references/examples/example-producto.md](references/examples/example-producto.md) y [references/examples/example-feature.md](references/examples/example-feature.md).

No interroges al usuario con un cuestionario largo de una sola vez, trabaja en bloques pequeños (2 o 3 preguntas a la vez). No todas las preguntas necesitan una respuesta explícita: muchas pueden inferirse del diálogo o del contexto del repo. Si el usuario ya describió el producto con suficiente claridad, no prolongues el diálogo para llenar huecos imaginarios.

## Fase D — Consolidar descripción

Consolida la descripción usando el template en [idea-analysis-template.md](assets/idea-analysis-template.md). El template especifica la estructura del artefacto. Sigue el template como guía, no de forma literal. Usa tu juicio para determinar si se necesita alguna modificicación o cambio debido al tipo de información existente.

El artefacto se escribe en forma narrativa (prosa), pero con la densidad necesaria para que quien gestione el desarrollo pueda hacer análisis técnico y descomponer en épicas y tareas sin tener que volver a preguntar lo básico. Los comportamientos clave son las semillas de épicas/tareas: cada uno es una unidad de producto descomponible. Las variantes se declaran como decisiones diferidas, no se resuelven aquí.

Para referencia de formato, consulta el ejemplo canónico correspondiente al nivel:
- **Producto**: [references/examples/example-producto.md](references/examples/example-producto.md) — descripción de "marketplace-interno" con solución amplia y fronteras numerosas.
- **Feature**: [references/examples/example-feature.md](references/examples/example-feature.md) — descripción de "notificaciones-push" con solución acotada y fronteras con "No aplica" como base.

Refina `IDEA-SLUG` si el diálogo aclaró el producto desde la Fase 0.

Para las preguntas abiertas, usa el template en [open-questions-template.md](assets/open-questions-template.md).

## Fase E — Gate de listo para el workflow de PRD

**Gate obligatorio.** Antes de fijar `status` y `next` en el frontmatter y escribir el documento final, verifica que la descripción está lista para pasar al workflow de PRD (`evaluar-alcance-idea` o `orquestar-prd-workflow`).

El gate evalúa si la narrativa pinta un producto válido, no si llenó campos. Las preguntas del gate (2 Críticas, 2 Importantes, 2 Menores) están especificadas en [idea-analysis-template.md](assets/idea-analysis-template.md). Sigue las instrucciones del template al escribir el artefacto. Resumen operativo:

1. **Decisión de status**: evalúa el inventario de preguntas abiertas. `ready` si no hay Críticas/Importantes sin resolver. `conditional` si hay Importantes sin resolver (el usuario fue alertado y eligió avanzar). `blocked` si hay Críticas sin resolver.
2. **Decisión de next**: si `status` es `ready` o `conditional`, `next: evaluar-alcance-idea` (o `orquestar-prd-workflow`). Si `blocked`, `next` se omite.
3. **Documentación del gate**: añade al artefacto una subsección "Gate de avance" que registre inventario de preguntas (críticas/importantes/menores) con estado de resolución, evidencia de alerta (si hubo), y estado final de avance. Obligatoria incluso si todas las preguntas se resolvieron inline.

Consulta [references/gate-guide.md](references/gate-guide.md) para la lógica completa de severidad, estados de avance, flujo del gate y reglas.

## Salida

Escribe en: `docs/<domain>/idea/<IDEA-SLUG>/idea-analysis.md`

Adicionalmente, gestiona el índice del dominio siguiendo [references/domain-readme-spec.md](references/domain-readme-spec.md):

- **Si no existe `docs/<domain>/README.md`**: créalo con la estructura completa del spec. En esta primera ejecución del workflow, la única fila con artefacto real en "Puntos de entrada" es `idea/<IDEA-SLUG>/idea-analysis.md`; las demás (roadmap, personas, ADRs, PRD, epics) quedan como placeholders pendientes que los skills posteriores poblarán.
- **Si ya existe `docs/<domain>/README.md`**: actualiza la tabla de "Puntos de entrada" con el enlace al `idea-analysis.md` recién generado.

## Checklist de salida

Verificación final, no parte del artefacto. Antes de terminar, verifica el checklist en [idea-analysis-template.md](assets/idea-analysis-template.md) (sección "Checklist de salida") más estos dos ítems adicionales:

- Frontmatter con `domain`, `level`, `status` y `next` correctos según Fase A (dominio) y Fase D (status/next, `next` ausente si `blocked`)
- `status` y `next` van en el frontmatter, no como sección del body
