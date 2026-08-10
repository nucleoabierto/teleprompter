# Template: Descripción narrativa de producto

Template para estructurar el artefacto de salida de `analizar-idea`. El agente sigue este formato al escribir `docs/<domain>/idea/<IDEA-SLUG>/idea-analysis.md`.

## Objetivo del artefacto

El artefacto transmite la idea del producto a quien va a gestionar su desarrollo. No es una descripción técnica, pero debe ser tan completa y detallada que permita realizar un análisis técnico posterior y descomponer en épicas y tareas. El nivel de detalle es producto: qué es, qué experiencia ofrece, qué forma tiene, qué comportamientos entrega, qué no es (sin stack, arquitectura ni implementación).

## Frontmatter requerido (al inicio del documento)

```yaml
---
idea_slug: <IDEA-SLUG>
domain: <domain>
date: <YYYY-MM-DD>
skill: analizar-idea
level: producto | feature
status: ready | conditional | blocked
next: evaluar-alcance-idea
---
```

- **level**: el diagnóstico de la Fase A. `producto` (producto completo o espacio nuevo) o `feature` (extensión a un producto existente). Cambia el alcance de la narrativa, no la estructura del artefacto.
- **status**: `ready` (avance libre), `conditional` (Importantes sin resolver), `blocked` (Críticas sin resolver). Lógica en [references/gate-guide.md](../references/gate-guide.md).

## Estructura del artefacto

El artefacto se organiza en tres secciones principales: **Problema**, **Resultado**, **Solución**. Le siguen **Suposiciones y dependencias**, **Decisiones diferidas**, **Gate de avance** y **Preguntas Abiertas**. Las tres secciones principales se escriben en forma narrativa (prosa, no viñetas sueltas), pero con la densidad necesaria para que un planificador pueda entender el producto y descomponerlo sin tener que volver a preguntar lo básico.

### Problema

Pinta el dolor actual con suficiente detalle para que un planificador entienda **quién sufre, cuándo, cómo, y por qué importa ahora**. No es un síntoma vago: es el diagnóstico del problema en términos de experiencia observable.

Cubrir:

- **Quién sufre** y en qué contexto (rol/segmento, situación en la que aparece el dolor).
- **Síntomas concretos**: las fallas observables que se repiten. Si hay varios modos de falla (ej: olvido vs. revisión compulsiva vs. incertidumbre), listarlos (cada uno es una faceta del problema).
- **Workaround actual**: cómo vive el usuario el problema hoy, qué hace a mano para compensar.
- **Costo agregado**: no solo tiempo (atención, dependencias que se atrasan, fricción que se tolera y deja de reportarse).

Forma: prosa narrativa, puede usar una lista con guiones para los síntomas concretos si son múltiples y distintos. 1–3 párrafos según riqueza del problema.

### Resultado

Pinta el estado final al que conduce el producto: el destino, no el puente. Observable, sin solución. Debe ser específico enough para que un planificador pueda derivar señales de éxito.

Cubrir:

- **El estado final**: el mundo al que se llega. Qué cambia en la experiencia del usuario.
- **El flujo del usuario después del cambio**: qué hace el usuario en el nuevo estado, paso a paso, en contraste con hoy.
- **Qué deja de pasar**: observable y específico. Cosas que hoy ocurren y en el estado final no ocurren.
- **Señales de éxito**: cómo se sabría que el resultado se alcanzó, medible sin mirar la implementación (no métricas técnicas sino cambios en comportamiento o feedback).

Forma: prosa narrativa. 1–2 párrafos. Las señales de éxito pueden ir como lista si son múltiples y medibles.

### Solución

Pinta el producto que puentea entre el problema y el resultado. Es la sección más densa: describe la forma del producto, sus fronteras, sus comportamientos clave, los escenarios/variantes que necesita resolver, y los beneficiarios. El objetivo es dar suficiente forma para que un análisis posterior pueda identificar piezas (semillas de épicas/tareas) sin que el artefacto se vuelva técnico.

Estructura interna con sub-secciones:

#### Forma del producto

Qué ES el producto, la experiencia central que ofrece, y cómo se acopla al contexto existente. La experiencia se describe con una frase o metáfora que la captura (ej: "soltar y retomar", "recorrer una biblioteca compartida"). 1–2 párrafos.

#### Fronteras: qué no es

Lista explícita de qué NO es el producto. Cada frontera es una decisión de alcance que evita que el planificador infiera funcionalidad que no existe. Formato: lista con guiones, una frontera por ítem, con una frase que explica la distinción. Para `level: feature`, si el producto existente define la frontera, marcar "No aplica (el producto existente define la frontera)" como primer ítem, y agregar las fronteras específicas que emergan.

#### Comportamientos clave del producto

Los comportamientos que el producto debe entregar, descritos en términos de experiencia. **Cada comportamiento es una unidad de producto** que un análisis posterior puede expandir y descomponer (son las semillas de épicas/tareas). No son requisitos técnicos ni specs; son "qué hace el producto" en lenguaje de experiencia.

Formato: lista numerada, un comportamiento por ítem, con una frase que lo nombra y una o dos que lo explican. 3–7 comportamientos típicamente.

#### Escenarios y variantes

Las variantes del comportamiento central que el producto necesita resolver. Cada una es una **decisión de producto diferida explícitamente** (no un caso técnico, sino una bifurcación de experiencia que define la forma final). Identificarlas aquí permite que el análisis posterior las trabaje de forma explícita en lugar de descubrirlas tarde.

Formato: lista con guiones, una variante por ítem, formulada como pregunta o tensión abierta (ej: "Reporte que falla: ¿aviso de fallo o silencio?", "Muchos reportes terminando cerca: ¿un aviso por evento o agrupación?"). 3–7 variantes típicamente.

#### Beneficiarios

Quién se beneficia del producto, con el beneficio concreto de cada uno. Un beneficiario primario y cero o más secundarios. El primario se introduce naturalmente en la narrativa; aquí se consolida y se agregan secundarios si emergen. Formato: lista con guiones, "Primario: \<rol\>: \<beneficio concreto\>", "Secundario: \<rol\>: \<beneficio\>".

**Diferencia por nivel**:

- `level: producto`: la Solución pinta un espacio nuevo. Más amplia: el producto define su propio territorio, la experiencia se describe de cero, las fronteras son más numerosas porque no hay producto existente que las herede.
- `level: feature`: la Solución pinta una extensión a un producto existente. Más acotada: asume que el producto existente define el contexto, la experiencia se describe como una extensión sobre lo que ya existe, las fronteras incluyen "No aplica (el producto existente define la frontera)" como base.

### Suposiciones y dependencias

Lista separada de lo que la descripción asume del contexto, los usuarios o el producto para que la solución tenga sentido. Diferente de las Fronteras (que dicen qué no es): las suposiciones dicen qué se asume true del mundo para que el producto funcione. Incluye dependencias sobre el producto existente (ej: "el evento X es detectable por la plataforma").

Formato: lista con guiones, una suposición por ítem. Para `level: feature`, inferir del repo cuando sea posible. Si no emerge ninguna, "Sin suposiciones (la narrativa es autocontenida)".

### Decisiones diferidas al análisis posterior

Lista explícita de las decisiones de producto que este artefacto no toma y delega a skills posteriores (`evaluar-alcance-idea`, `capturar-requerimiento`, etc.). Esto es clave para planificación: el planificador sabe qué decisiones le toman a él vs. qué ya está decidido. Incluye las variantes de "Escenarios y variantes" que quedan abiertas, más cualquier otra decisión (canal, preferencias de usuario, alcance de casos borde).

Formato: lista con guiones, una decisión por ítem, descrita en términos de producto (no técnicos). Si no hay decisiones diferidas, "Sin decisiones diferidas (el artefacto está completo para esta etapa)".

### Gate de avance

Cierre operacional. **Obligatoria** incluso si todos los criterios pasaron y todas las preguntas se resolvieron.

El gate evalúa si la descripción está lista para pasar a `evaluar-alcance-idea` usando dos tipos de criterios:

1. **Criterios de calidad del análisis**: Validaciones internas que el skill debe cumplir (ej: ¿el producto conecta problema y resultado?, ¿se describe en términos de experiencia?). Si un criterio Crítico falla, el skill debe corregir el análisis antes de avanzar.
2. **Preguntas abiertas/incógnitas**: Información faltante que requiere resolución externa (ej: disponibilidad de recursos, dependencias externas).

La lógica completa del gate (criterios, severidad, estados de avance, flujo, reglas y ejemplos) está en [references/gate-guide.md](../references/gate-guide.md).

Formato:

```markdown
## Gate de avance

- **Criterios de calidad del análisis**:
  - [Crítico] ¿El producto conecta el problema y el estado final? — Estado: pasó/falló
  - [Crítico] ¿El producto se describe en términos de experiencia, no de implementación? — Estado: pasó/falló
  - [Importante] ¿El beneficiario está claro? — Estado: pasó/falló
  - [Importante] ¿La idea contiene múltiples funcionalidades? — Estado: pasó/falló
  - [Menor] ¿Los límites están declarados? — Estado: pasó/falló
  - [Menor] ¿Las suposiciones están documentadas? — Estado: pasó/falló

- **Inventario de preguntas abiertas identificadas**:
  - [Crítica] ¿Pregunta crítica?: Estado: resuelta/pendiente (justificación).
  - [Importante] ¿Pregunta importante?: Estado: resuelta/pendiente (justificación).
  - [Menor] ¿Pregunta menor?: Estado: resuelta/pendiente (justificación).

- **¿Alerta al usuario?**: Sí/No. Si hay preguntas Críticas o Importantes pendientes, el usuario fue alertado y eligió avanzar con valor por defecto conservador.

- **Estado final de avance**: Libre/Condicionado/Bloqueado (`status: ready/conditional/blocked`, `next: evaluar-alcance-idea`).
```

### Preguntas Abiertas (resueltas/pendientes)

Registro de las preguntas que surgieron durante el análisis, con su estado. Obligatoria si el gate dejó preguntas pendientes. Si todas se resolvieron, opcional pero recomendable para transparencia.

Formato:

```markdown
## Preguntas Abiertas (resueltas/pendientes)

### Resueltas

- **Pregunta**: <pregunta>
- **Impacto**: <qué afecta>
- **Severidad**: Crítica/Importante/Menor
- **Propuesta**: <propuesta de resolución>
- **Estado**: Resuelta (<cómo se resolvió>)

### Pendientes

- **Pregunta**: <pregunta>
- **Impacto**: <qué afecta>
- **Severidad**: Crítica/Importante/Menor
- **Propuesta**: <propuesta de resolución>
- **Estado**: Pendiente (<por qué sigue pendiente>)
```

## Tono y voz

El artefacto se escribe en un tono empático y observacional, como si estuvieras al lado del usuario viendo lo que le pasa. No es un documento de gestión abstracto: es una narrativa que describe la experiencia encarnada.

Características del tono:

- **Lenguaje experiencial y encarnado**: nombra estados cognitivos y corporales, no abstracciones de producto. "El usuario mantiene un hilo mental abierto", no "el usuario tiene fricción".
- **Construcción rítmica con repetición anafórica**: "no tiene que recordarlo, no tiene que revisar, no tiene que mantener ningún hilo mental abierto". La repetición cristaliza el estado deseado por acumulación.
- **Definición por negación deliberada**: la sección *Fronteras* usa "No es un… no es un… no es un…" como patrón para fijar el contorno del producto por exclusión.
- **Cristalización con frases cortas tras desarrollos largos**: después de párrafos extensos y subordinados, aterriza con una frase corta y simétrica: "Es puntual y oportuno: un evento, un aviso."
- **Metáforas cotidianas precisas, no decorativas**: "eslabón que avisaba que ya estaba disponible", "hilo de la tarea actual que se rompe". Las metáforas son funcionales: nombran algo que el lenguaje literal no alcanza.
- **Frases largas con subordinación y puntuación tradicional**: el ritmo es de prosa ensayística, no de bullet corporativo. Usa comas, paréntesis y puntos para introducir matices sin cortar el flujo, en lugar de em-dashes que son menos tradicionales en español.
- **Empatía observacional sin condescendencia**: el texto observa al usuario con respeto ("el usuario aprende a tolerar y deja de reportar como problema"), no lo patologiza ni lo victimiza.
- **Honestidad sobre lo que no se sabe**: "No hay datos cuantitativos… eso es una suposición que el análisis posterior debe confirmar." El tono no sobredeclara evidencia.

Lo que evita: jerga corporativa ("cross-team", "stakeholders", "value proposition" como sustantivo), abstracciones organizacionales ("la organización no tiene visibilidad"), lenguaje de venta o de pitch, listas planas sin narrativa que las conecte.
