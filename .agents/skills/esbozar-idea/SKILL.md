---
name: esbozar-idea
description: >-
  Inicia un chat interactivo para esbozar y pulir una idea de producto bruta
  hasta convertirla en un esbozo ligero y bien formado que sirve como entrada
  a analizar-idea. Conduce un diálogo de ida y vuelta enfocado en el resultado
  deseado (sin soluciónizar) y beneficiarios, sin entrar en
  viabilidad, alcance, priorización ni detalles técnicos. Úsalo cuando el usuario tenga una idea
  muy verde o vaga que no está lista para analizar-idea, y quiera darle forma
  interactiva antes de avanzar. Triggers comunes: esbozar, dar forma a, pulir,
  redactar o aclarar una idea. No lo usas para evaluar viabilidad (usa
  analizar-idea), estructurar requerimientos formales (usa
  capturar-requerimiento), dividir alcance (usa evaluar-alcance-idea) ni
  generar PRDs (usa generar-prd o orquestar-prd-workflow).
---

# Esbozador de Ideas

Inicia un chat interactivo que esboza y pule una idea bruta. El esbozo es deliberadamente ligero: declara el resultado deseado sin mencionar la solución y quién se beneficia — nada más. El detalle (viabilidad, alcance, priorización, personas, casos de uso, PRD) es trabajo de skills posteriores.

Solo formulación interactiva: no evalúa viabilidad, no aprueba, no estructura requerimientos formales.

## Cuándo usarlo y cuándo no

Triggers y fronteras base están en el frontmatter. Complementos operativos:

- **Sí**: la idea está muy verde o vaga, no lista para `analizar-idea` — el usuario quiere pulirla interactivamente antes de avanzar.
- **No (adicionales al frontmatter)**: priorizar (usa `priorizar-roadmap`), definir personas (usa `definir-usuarios`). Tampoco para reanudar trabajo ya iniciado — si ya existe un `idea-analysis.md` producido por `analizar-idea`, este skill no aplica.

## Fase 0 — Resolver entrada

Requerido: `IDEA-DESCRIPCION` (texto libre, por vago que sea).

Infiere desde:
- Descripción pegada: si el usuario pega la idea/solicitud/fragmento de chat/email.
- Idea expresada en el mensaje: "Quiero algo para que la gente exporte reportes", "estaría bueno notificar a los usuarios", "modo oscuro".
- Archivo referenciado en el mensaje: si el usuario menciona un archivo que contiene la idea, úsalo y cita la ruta.

Si no se puede inferir la idea, pregunta: "¿Cuál es la idea que quieres esbozar? (puede ser vaga — la puliremos juntos)"

Genera `IDEA-SLUG` en kebab-case a partir del resultado o, si el resultado aún no está claro, de la frase más representativa de la idea (ej. "exportar reportes a PDF" → `exportar-reportes-pdf`). El slug puede refinarse en la Fase C si el diálogo aclara el resultado.

## Fase A — Eco y diagnóstico inicial

Devuelve al usuario un eco breve de lo que entendiste y un diagnóstico inicial de qué tan lista está la idea para pasar a `analizar-idea`.

**Diagnóstico de madurez** (clasifica la idea en uno de estos estados):

- **Verde**: solo una frase suelta, sin resultado claro ni beneficiario. Necesita diálogo completo.
- **Borrador**: hay un resultado implícito y algún beneficiario, pero está mezclado con solución o falta claridad. Necesita diálogo focalizado.
- **Casi lista**: el resultado está claro y sin solución, hay beneficiario. Diálogo mínimo de confirmación.

**Diagnóstico de nivel** (clasifica la idea en uno de estos niveles — ajusta cuántas dimensiones de enriquecimiento se exploran en la Fase B):

- **Producto**: idea de producto completo, nuevo producto o iniciativa nueva que define su propio espacio. Las dimensiones de enriquecimiento (carácter, espacio abierto, contexto organizacional, alternativas) son relevantes — el producto necesita declarar qué lo distingue y qué decisiones están abiertas.
- **Feature**: idea de funcionalidad nueva dentro de un producto existente. El contexto del repo ya constriñe muchas decisiones (stack, organización, convenciones). Las dimensiones de enriquecimiento se reducen: inferir del repo lo que se pueda, marcar "No aplica" cuando el contexto existente lo absorbe, y explorar solo lo que aporta valor sobre lo ya conocido.

Criterios para distinguir nivel:

- **Producto**: no hay producto previo, O la idea define un espacio nuevo (no extiende uno existente), O el usuario describe algo fundacional ("un instalador de paquetes", "una plataforma de X").
- **Feature**: hay un producto/codebase existente y la idea lo extiende ("modo oscuro", "exportar reportes", "notificaciones push", "agregar autenticación con Google").

Presenta ambos diagnósticos al usuario y confirma que quiere pulirla antes de avanzar. Si el usuario ya trae una idea bien formada (madurez "Casi lista"), ofrece pasar directamente a `analizar-idea` en lugar de forzar el diálogo y genera la plantilla con la información disponible.

## Fase B — Diálogo de pulido interactivo

Conduce un diálogo de ida y vuelta con el usuario. **No soluciónices**: el objetivo es clarificar el resultado deseado, no diseñar la solución. Si el usuario empieza a proponer solución, redirígelo al resultado ("¿Qué quieres lograr con eso?").

Lee la guía de diálogo según el nivel diagnosticado en la Fase A:

- **Producto**: [references/dialogue-guide-producto.md](references/dialogue-guide-producto.md) — 5 rondas máx, 3 preguntas núcleo + 6 de enriquecimiento, ejemplos de reformulación y reglas del diálogo.
- **Feature**: [references/dialogue-guide-feature.md](references/dialogue-guide-feature.md) — 3 rondas máx, 3 preguntas núcleo + 2 de enriquecimiento + 4 dimensiones inferidas del repo, ejemplos de reformulación y reglas del diálogo.

No interroges al usuario con un cuestionario largo de una sola vez — el pulido es conversacional. No todas las dimensiones necesitan una pregunta explícita: muchas pueden inferirse del diálogo o del contexto del repo.

Durante el diálogo, genera preguntas abiertas de estas categorías cuando aplique. Cada una declara su severidad y quién la resuelve:

- **¿El resultado puede formularse sin mencionar solución?** — Crítica: bloquea el avance.
- **¿El problema tiene síntomas observables?** — Importante: `analizar-idea` puede avanzar con valor por defecto conservador.
- **¿El beneficiario está claro?** — Importante: `analizar-idea` puede avanzar con valor por defecto conservador.
- **¿La idea contiene múltiples funcionalidades?** — Importante: la resuelve `evaluar-alcance-idea`.
- **¿El carácter de la idea está ambiguo o mezclado con diseño de solución?** — Menor: no condiciona el avance; `analizar-idea` puede avanzar.
- **¿Una suposición clave está confirmada?** — Menor: la trabaja `mapear-assumptions` posteriormente.
- **¿El contexto organizacional está claro?** — Menor: no condiciona el avance.

Las preguntas generadas aquí alimentan directamente el gate de la Fase D. No se avanza con preguntas Críticas sin resolver.

## Fase C — Consolidar esbozo

Consolida el esbozo usando el template en [esbozo-template.md](assets/esbozo-template.md). El template especifica frontmatter, secciones núcleo, secciones de enriquecimiento (condicionales al nivel), convenciones de formato, distinciones clave entre secciones y qué contenido NO va en el esbozo. Síguelo literalmente.

Para referencia de formato, consulta el ejemplo canónico correspondiente al nivel:
- **Producto**: [references/examples/example-producto.md](references/examples/example-producto.md) — esbozo de "exportar-reportes-pdf" con todas las secciones de enriquecimiento desarrolladas.
- **Feature**: [references/examples/example-feature.md](references/examples/example-feature.md) — esbozo de "modo-oscuro" con secciones de enriquecimiento marcadas "No aplica".

Refina `IDEA-SLUG` si el diálogo aclaró el resultado desde la Fase 0.

Para las Preguntas Abiertas, usa el formato definido en la sección "Preguntas Abiertas" más abajo.

## Fase D — Gate de listo para `analizar-idea`

**Gate obligatorio.** Antes de fijar `status` y `next` en el frontmatter y escribir el documento final, verifica que el esbozo está listo para pasar a `analizar-idea`.

Consulta [references/gate-guide.md](references/gate-guide.md) para la lógica completa de severidad, estados de avance, flujo del gate y reglas. Resumen operativo:

1. **Decisión de status**: evalúa el resultado y el inventario de preguntas abiertas. `ready` si el resultado está claro y no hay Críticas/Importantes sin resolver. `conditional` si hay Importantes sin resolver (el usuario fue alertado y eligió avanzar). `blocked` si el resultado no pudo formularse sin solución tras 2 intentos.
2. **Decisión de next**: si `status` es `ready` o `conditional`, pregunta al usuario: "¿Quieres invocar `analizar-idea` directamente o orquestar el workflow completo con `orquestar-prd-workflow`?". Default si no responde: `analizar-idea`. Si `blocked`, `next` se omite. Enlace relativo al siguiente artefacto: `../../<domain>/idea/<IDEA-SLUG>/idea-analysis.md` (a crear por `analizar-idea`).
3. **Documentación del gate**: añade al esbozo una subsección "Gate de avance (Fase D)" que registre estado del resultado (claro / parcial / bloqueado), inventario de preguntas (críticas/importantes/menores) con estado de resolución, y estado final de avance. Obligatoria incluso si el resultado está claro y no hay preguntas pendientes.

## Salida

Escribe en: `docs/drafts/<IDEA-SLUG>/esbozo.md`

Es un **artefacto temporal de transición**: vive fuera de `docs/<domain>/` porque la idea aún no está comprometida con un dominio. Cuando `analizar-idea` se ejecute, producirá el artefacto durable `docs/<domain>/idea/<IDEA-SLUG>/idea-analysis.md`; el esbozo puede mantenerse como trazabilidad del diálogo previo o eliminarse a discreción del usuario.

## Checklist de salida

Verificación interna del agente — no se incluye en el artefacto. Antes de terminar, verifica contra el template en [esbozo-template.md](assets/esbozo-template.md):

- Todas las secciones núcleo presentes (frontmatter, resumen, resultado, problema, beneficiarios, situaciones, suposiciones, gate, preguntas abiertas)
- Secciones de enriquecimiento presentes para producto; para feature, marcadas "No aplica" con razón (no omitidas)
- Frontmatter con `level`, `status` y `next` correctos según Fase D (`next` ausente si `blocked`)
- Sección "Gate de avance (Fase D)" documentada con estado, inventario de preguntas y estado final — obligatoria incluso si el resultado está claro
- Sin emojis, sin contenido de skills posteriores (ver "Ligereza: qué NO va" en el template)
- `status` y `next` van en el frontmatter, no como sección del body

## Preguntas Abiertas

Usa el template en [open-questions-template.md](assets/open-questions-template.md) para el formato. La lógica de severidad y decisión de avance se define en la Fase D. Estas preguntas se heredan en `analizar-idea` y alimentan su gate de avance.
