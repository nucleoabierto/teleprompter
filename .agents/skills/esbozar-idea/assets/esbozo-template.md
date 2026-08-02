# Template: Esbozo de Idea

Template para estructurar el artefacto de salida de `esbozar-idea`. El agente sigue este formato al escribir `docs/drafts/<IDEA-SLUG>/esbozo.md`.

Es deliberadamente ligero: declara el resultado deseado sin solución, el problema que motiva y quién se beneficia. El detalle (viabilidad, alcance, priorización, personas, casos de uso, PRD) es trabajo de skills posteriores.

## Frontmatter requerido (al inicio del documento)

```yaml
---
idea_slug: <IDEA-SLUG>
date: <YYYY-MM-DD>
skill: esbozar-idea
level: producto | feature
status: ready | conditional | blocked
next: analizar-idea | orquestar-prd-workflow
---
```

El campo **level** indica si la idea es un producto completo/iniciativa nueva (`producto`) o una funcionalidad nueva en un producto existente (`feature`).

El campo **status** describe el estado del esbozo: `ready` (avance libre), `conditional` (avance condicionado por preguntas Importantes), o `blocked` (no avanza). La lógica completa para decidir el valor está en [references/gate-guide.md](../references/gate-guide.md).

El campo **next** es la señal de routing al siguiente skill. Presente solo cuando `status` es `ready` o `conditional`. Valores: `analizar-idea` o `orquestar-prd-workflow`. La decisión se toma en la Fase D (ver SKILL.md).

## Secciones núcleo (siempre presentes — ambos niveles)

- Frontmatter requerido (al inicio del documento, incluyendo `level`)
- Resumen de la idea (input original del usuario, sin reformular — preserva el texto literal para contexto). Usa esta sección cuando el input es un máximo de 2 párrafos
- Resultado deseado (1-2 frases, sin mención de solución). Si no pudo formularse sin solución, marcar como "necesita reformulación" y dejar el mejor intento.
- Problema (síntomas observables del dolor actual que motiva la idea — no el resultado futuro, no la solución)
- Beneficiarios (rol o segmento, ligero — "no especificado" es un valor válido)
- Situaciones a cubrir (demandas diferenciadas que el resultado debe satisfacer — pre-mapeo ligero a nivel resultado, no casos de uso detallados)
- Suposiciones (suposiciones ligeras que la idea da por ciertas — no es el tratamiento completo de `mapear-assumptions`)
- Gate de avance (Fase D): estado del resultado (claro / parcial / bloqueado) con justificación, inventario de preguntas identificadas (críticas/importantes/menores) con estado de resolución, y estado final de avance que justifica `status` y `next`. **Obligatoria** incluso si el resultado está claro y no hay preguntas pendientes.
- Preguntas Abiertas (resueltas/pendientes): documenta incógnitas no resueltas durante el diálogo, clasificadas por severidad.

## Secciones de enriquecimiento (condicionales al nivel)

Estas secciones son **siempre presentes en el documento** (no las omitas), pero su contenido depende del nivel:

### Nivel producto — desarrollar con contenido real

- Carácter de la idea (valores que distinguen esta idea de alternativas — no es diseño de solución, es declaración de intenciones)
- Espacio abierto con dos sub-secciones:
  - Sin default: decisiones deliberadamente abiertas sin preferencia inicial (ej: lenguaje, formato, canal de distribución)
  - Con default a reevaluar: decisiones con un default provisional que el skill siguiente puede revisar
- Alternativas consideradas o descartadas ("Ninguna registrada" es un valor válido)
- Contexto organizacional (organización o equipo que genera la idea)

### Nivel feature — inferir del repository o marcar "No aplica"

- Carácter de la idea: inferir del producto existente si aplica, o marcar "No aplica — feature extiende producto existente"
- Espacio abierto: inferir del stack/convenciones del repository lo que ya está decidido; marcar "Sin default" solo si hay decisiones genuinamente abiertas. Si no hay ninguna, "No aplica — el stack existente constriñe las decisiones"
- Alternativas consideradas o descartadas: "Ninguna registrada" (default) a menos que el usuario mencione alguna
- Contexto organizacional: inferir del repository/workspace sin preguntar

**Regla**: no omitir las secciones de enriquecimiento para features — marcarlas explícitamente como "No aplica" con una breve razón. El lector del esbozo debe ver que se consideraron, no inferir que se olvidaron.

## Convenciones de formato del documento

- Sin emojis en el documento (resultado, gate, secciones). Usa texto: `Sí`/`Parcial`/`No`, `Pass`/`Partial`/`Fail`. Símbolos tipográficos estándar (`→`, `—`, `≥`, `≤`) sí están permitidos.
- El esbozo es ligero: **no** incluyas requisitos formales, personas detalladas, casos de uso con happy path/edge cases, métricas de éxito, diseño de experimentos ni diseño de solución. Esos son trabajo de skills posteriores. Si el usuario los mencionó durante el diálogo, resúmelos en una sola línea bajo "Suposiciones" o como Pregunta abierta, sin desarrollarlos.

## Ligereza: qué NO va en el esbozo

Estos contenidos pertenecen a skills posteriores y **no** deben desarrollarse en el esbozo:

- Análisis de viabilidad (alineación, urgencia, recursos) → `analizar-idea`
- Requerimientos formales estructurados → `capturar-requerimiento`
- División de alcance / múltiples funcionalidades → `evaluar-alcance-idea`
- Priorización RICE → `priorizar-roadmap`
- Conectividad técnica / features puente → `evaluar-conectividad-tecnica`
- Mapeo de assumptions (matriz 2x2, risk vs evidence) → `mapear-assumptions`
- Personas detalladas → `definir-usuarios`
- Casos de uso (happy path, edge cases, precondiciones, postcondiciones) → `mapear-casos-uso`
- Métricas de éxito / diseño de experimentos → `disenar-experimentos`
- PRD → `generar-prd`

Si el usuario introdujo alguno de estos durante el diálogo, regístralo como nota breve en "Suposiciones" o como Pregunta abierta, sin desarrollarlo.

## Distinciones clave para no confundir secciones

- **Resultado deseado** vs **Problema**: el resultado es el estado futuro que quieres lograr; el problema son los síntomas observables del dolor actual. Ambos se formulan sin solución.
- **Carácter de la idea** vs **diseño de solución**: el carácter declara valores/intenciones que distinguen la idea (reproducibilidad, seguridad, agnosticismo…); el diseño de solución describe cómo se implementa. El carácter va en el esbozo; el diseño no.
- **Situaciones a cubrir** vs **casos de uso**: las situaciones son demandas diferenciadas a nivel resultado ("instalación inicial", "actualización con colisiones"); los casos de uso detallan flujos con happy path, edge cases y precondiciones. Las situaciones van en el esbozo; los casos de uso no.
- **Espacio abierto** vs **Preguntas Abiertas**: el espacio abierto captura decisiones deliberadamente abiertas (lenguaje, formato, CLI…); las preguntas abiertas capturan incógnitas no resueltas que el skill siguiente hereda. Ambas coexisten.
- **Suposiciones** vs **mapear-assumptions**: las suposiciones del esbozo son una lista ligera de suposiciones que la idea da por ciertas; `mapear-assumptions` construye la matriz 2x2 risk vs evidence con priorización.
