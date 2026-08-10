# Template: Evaluación y Roadmap de Alcance

Template para estructurar el artefacto de salida de `evaluar-alcance-idea`. El agente sigue este formato al escribir `docs/<domain>/idea/<IDEA-SLUG>/scope-roadmap.md`.

## Objetivo del artefacto

Documento de decisión que combina la evaluación estratégica con la planificación táctica. Responde: ¿Merece inversión? ¿Es una o múltiples funcionalidades? ¿En qué orden? ¿Hay decisiones pendientes?

## Frontmatter requerido (al inicio del documento)

```yaml
---
idea_slug: <IDEA-SLUG>
domain: <domain>
date: <YYYY-MM-DD>
skill: evaluar-alcance-idea
profile: lite | full
status: ready | conditional | blocked
next: priorizar-roadmap | evaluar-conectividad-tecnica
---
```

- **profile**: el tamaño de la idea según la Fase B. `lite` (producto interno o funcionalidad única cohesiva) o `full` (producto externo o múltiples funcionalidades).
- **status**: `ready` (avance libre), `conditional` (Importantes sin resolver), `blocked` (Críticas sin resolver o No proceder). Lógica en `references/advancement-gate-guide.md`.
- **next**: la señal de routing al siguiente skill. Presente solo cuando `status` es `ready` o `conditional`. Valores: `priorizar-roadmap` (múltiples funcionalidades) o `evaluar-conectividad-tecnica` (funcionalidad única).

## Estructura del documento

### 1. Evaluación Estratégica (Fail-Fast)

```markdown
## Evaluación Estratégica

- **Veredicto**: [Proceder | No proceder | Condicionado]
- **Alineación**: [Descripción de alineación con visión del producto]
- **Tamaño**: [full | lite]
- **Justificación**: [Por qué este veredicto]
```

Si el veredicto es "No proceder", el documento termina aquí. No se requieren más secciones.

### 2. Clasificación de Alcance

```markdown
## Clasificación de Alcance

- **Tipo**: [Funcionalidad única | Múltiples funcionalidades]
- **Justificación**: [Criterios específicos de scope-analysis-guide.md]

```

### 3. Roadmap de Funcionalidades

```markdown
## Roadmap de Funcionalidades

### [Nombre de funcionalidad 1]
- **Alcance**: [qué incluye]
- **Valor**: [valor para usuario]
- **Depende de**: [otras funcionalidades o "ninguno"]
- **Estado**: [bloqueada | lista | condicionada]

### [Nombre de funcionalidad 2]
- **Alcance**: [qué incluye]
- **Valor**: [valor para usuario]
- **Depende de**: [otras funcionalidades o "ninguno"]
- **Estado**: [bloqueada | lista | condicionada]
```

Si es funcionalidad única, usa una sola sección.

### 4. Desglose por Funcionalidad

Para cada funcionalidad del roadmap:

```markdown
## Desglose: [Nombre de funcionalidad]

### Fases
1. **[Fase 1]**: [descripción]
2. **[Fase 2]**: [descripción]

### Decisiones
- **Resuelta ([fecha])**: [decisión] - [rationale]
- **Pendiente**: [decisión] - [opciones con trade-offs]
```

Mínimo 2 fases por funcionalidad. Decisiones pendientes alimentan la sección 5.

### 5. Decisiones Pendientes y Next Steps

```markdown
## Decisiones Pendientes

### Críticas (bloquean avance)
- [Pregunta]: [opciones] - [impacto si no se resuelve]

### Importantes (afectan calidad)
- [Pregunta]: [opciones] - [impacto si no se resuelve]

### Menores (ideal resolver)
- [Pregunta]: [opciones] - [impacto si no se resuelve]

## Recomendación

- **Empezar con**: [funcionalidad]
- **Next step**: [priorizar-roadmap | evaluar-conectividad-tecnica | bloqueado]
- **Justificación**: [por qué este orden y next step]
```

## Convenciones de formato

- Sin emojis en el documento. Usa texto como `Pass`/`Partial`/`Fail` o `Sí`/`Parcial`/`No`. Símbolos tipográficos estándar como `→`, `—`, `≥`, `≤` sí están permitidos.
- Nombres de funcionalidades en kebab-case
- Decisiones resueltas siempre incluyen fecha en formato YYYY-MM-DD

## Validación de calidad

El documento está completo cuando:

1. La evaluación estratégica tiene veredicto claro con justificación
2. La clasificación de alcance cita criterios específicos
3. El roadmap de funcionalidades tiene dependencias claras
4. Cada funcionalidad tiene desglose con fases y decisiones
5. Las decisiones pendientes están clasificadas por severidad
6. La recomendación tiene next step consistente con el estado

## Ejemplo de referencia

Para un ejemplo completo del documento final, consulta `references/scope-roadmap-guide.md` sección "Ejemplo Completo".
