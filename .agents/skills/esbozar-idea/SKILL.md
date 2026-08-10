---
name: esbozar-idea
description: >-
  Inicia un chat interactivo para esbozar y pulir una idea de producto hasta
  convertirla en un esbozo ligero y bien formado que sirve como contexto
  inicial para el proceso de generación de PRDs. Conduce un diálogo de ida y
  vuelta enfocado en el resultado deseado (sin soluciónizar) y beneficiarios,
  sin entrar en viabilidad, alcance, priorización ni detalles técnicos. Úsalo
  cuando el usuario tenga una idea semilla y quiera darle forma interactiva
  antes de realizar el trabajo de formalización. Triggers comunes: esbozar,
  dar forma a, pulir, redactar o aclarar una idea. No lo usas para evaluar
  viabilidad, estructurar requerimientos formales, dividir alcance ni generar
  PRDs.
---

# Esbozador de Ideas

Inicia un chat interactivo para esbozar y pulir una idea bruta. El esbozo es deliberadamente ligero: declara el resultado deseado sin mencionar la solución. El detalle (viabilidad, alcance, priorización, personas, casos de uso, PRD) es trabajo de skills posteriores.

## Cuándo usarlo y cuándo no

- **Sí**: la idea está muy verde o vaga o el usuario quiere pulirla interactivamente antes de avanzar. El objetivo es definir de forma clara el problema y el objetivo a cumplir, no la solución.
- **No**: priorizar, definir personas, realizar un proceso de formalización que incluya un análisis profundo y detallado. Detener si el objetivo incluye proponer una solución concreta.

## Fase 0 — Resolver entrada

Requerido: `IDEA-DESCRIPCION` (texto libre, por vago que sea).

Infiere desde:
- Idea expresada en el mensaje: "Quiero algo para que la gente exporte reportes", "estaría bueno notificar a los usuarios", "modo oscuro".
- Archivo referenciado en el mensaje: si el usuario menciona un archivo que contiene la idea, úsalo y cita la ruta.

Si no se puede inferir la idea, pregunta: "¿Cuál es la idea que quieres esbozar? (puede ser vaga, la puliremos juntos)" y detente a esperar la respuesta.

Genera `IDEA-SLUG` en kebab-case a partir del resultado o, si el resultado aún no está claro, de la frase más representativa de la idea (ej. "exportar reportes a PDF" → `exportar-reportes-pdf`). El slug puede refinarse en la Fase C si el diálogo aclara el resultado.

## Fase A — Eco y diagnóstico inicial

Devuelve al usuario un eco breve de lo que entendiste y un diagnóstico inicial de qué tan lista está la idea.

**Diagnóstico de madurez** (clasifica la idea en uno de estos estados):

- **Verde**: solo una frase suelta, sin resultado claro ni beneficiario. Necesita diálogo completo.
- **Borrador**: hay un resultado implícito y algún beneficiario, pero está mezclado con solución o falta claridad. Necesita diálogo focalizado.
- **Casi lista**: el resultado está claro y sin solución, hay beneficiario. Diálogo mínimo de confirmación.

**Diagnóstico de nivel** (clasifica la idea en uno de estos niveles):

- **Producto**: idea de producto completo, nuevo producto o iniciativa nueva que define su propio espacio.
- **Feature**: idea de funcionalidad nueva dentro de un producto existente. El contexto del repo ya constriñe muchas decisiones (stack, organización, convenciones).

Criterios para distinguir nivel:

- **Producto**: no hay producto previo, O la idea define un espacio nuevo (no extiende uno existente), O el usuario describe algo fundacional ("un instalador de paquetes", "una plataforma de X"). Requiere crear módulos nuevos que y no existe un punto claro del sistema que pueda absorber la idea.
- **Feature**: hay un producto/codebase existente y la idea lo extiende ("modo oscuro", "exportar reportes", "notificaciones push", "agregar autenticación con Google"). Generalmente se expresa como una extensión para mejorar la experiencia del usuario.

Presenta ambos diagnósticos y confirma que quiere pulirla antes de avanzar. Si el usuario ya trae una idea bien formada (madurez "Casi lista"), ofrece generar la plantilla con la información disponible. En cualquiera de los dos casos detente a esperar la respuesta.

## Fase B — Diálogo de pulido interactivo

Conduce un diálogo de ida y vuelta con el usuario. **No soluciónices**: el objetivo es clarificar el resultado deseado, no diseñar la solución. Si el usuario empieza a proponer solución, redirígelo al resultado ("¿Qué quieres lograr con eso?").

Lee la guía de diálogo según el nivel diagnosticado en la Fase A:

- **Producto**: [references/dialogue-guide-producto.md](references/dialogue-guide-producto.md) — 5 rondas máx, 3 preguntas núcleo + 6 de enriquecimiento, ejemplos de reformulación y reglas del diálogo.
- **Feature**: [references/dialogue-guide-feature.md](references/dialogue-guide-feature.md) — 3 rondas máx, 3 preguntas núcleo + 2 de enriquecimiento + 4 dimensiones inferidas del repo, ejemplos de reformulación y reglas del diálogo.

No interroges al usuario con un cuestionario largo de una sola vez ya que el pulido es conversacional. No todas las dimensiones necesitan una pregunta explícita: muchas pueden inferirse del diálogo o del contexto del repo.

Durante el diálogo, evalua la informacion usando las siguientes preguntas y clasificando se importancia:

- **¿El resultado puede formularse sin mencionar solución?** — Crítica: bloquea el avance.
- **¿El problema tiene síntomas observables?** — Importante.
- **¿El beneficiario está claro?** — Importante.
- **¿La idea contiene múltiples funcionalidades?** — Importante.
- **¿El carácter de la idea está ambiguo o mezclado con diseño de solución?** — Menor.
- **¿Una suposición clave está confirmada?** — Menor.

## Fase C — Consolidar esbozo

Consolida el esbozo usando el template en [esbozo-template.md](assets/esbozo-template.md). El template especifica frontmatter, secciones núcleo, secciones de enriquecimiento (condicionales al nivel), convenciones de formato, distinciones clave entre secciones y qué contenido NO va en el esbozo. Síguelo literalmente.

Para referencia de formato, consulta el ejemplo canónico correspondiente al nivel:
- **Producto**: [references/examples/example-producto.md](references/examples/example-producto.md) — esbozo de "exportar-reportes-pdf" con todas las secciones de enriquecimiento desarrolladas.
- **Feature**: [references/examples/example-feature.md](references/examples/example-feature.md) — esbozo de "modo-oscuro" con secciones de enriquecimiento marcadas "No aplica".

Refina `IDEA-SLUG` si el diálogo aclaró el resultado desde la Fase 0.

Para las preguntas abiertas, usa el template en [open-questions-template.md](assets/open-questions-template.md).

## Fase D — Gate de listo para `analizar-idea`

**Gate obligatorio.** Antes de fijar `status` y `next` en el frontmatter y escribir el documento final, verifica que el esbozo está listo para pasar a `analizar-idea`.

Consulta [references/gate-guide.md](references/gate-guide.md) para la lógica completa de severidad, estados de avance, flujo del gate y reglas. Resumen operativo:

## Salida

Escribe en: `docs/ideas/<IDEA-SLUG>.md`

## Checklist de salida

Esta es una verificación final, no debe ser parte del artefacto. Antes de terminar, verifica contra el template en [esbozo-template.md](assets/esbozo-template.md):

- Todas las secciones núcleo presentes (frontmatter, resumen, resultado, problema, beneficiarios, situaciones, suposiciones, gate, preguntas abiertas)
- Secciones de enriquecimiento presentes para producto; para feature, marcadas "No aplica" con razón (no omitidas)
- Frontmatter con `level`, `status` y `next` correctos según Fase D (`next` ausente si `blocked`)
- Sección "Gate de avance (Fase D)" documentada con estado, inventario de preguntas y estado final. Obligatoria incluso si el resultado está claro
- Sin emojis, sin contenido de skills posteriores (ver "Ligereza: qué NO va" en el template)
- `status` y `next` van en el frontmatter, no como sección del body
