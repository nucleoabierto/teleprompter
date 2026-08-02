# Template: Scope Roadmap

Template para estructurar el artefacto de salida de `evaluar-alcance-idea`. El agente sigue este formato al escribir `docs/<domain>/idea/<IDEA-SLUG>/scope-roadmap.md`.

## Header requerido (al inicio del documento)

- [Idea slug]
- Dominio
- Fecha
- Skill: evaluar-alcance-idea
- Input: ruta del artefacto fuente (`idea-analysis.md` si existe) o descripción de la idea. **No omitas la línea `Input:`** del header.

## Secciones requeridas

- Header requerido (al inicio del documento, incluyendo línea `Input:`)
- Análisis de alcance (tipo, justificación, timeline)
- Estrategia de división (si aplica)
- Notas de modelo (aclaraciones de conceptos clave que puedan ser ambiguos — ej: qué constituye una "funcionalidad", criterios de división, definición de bounded context, framing correcto del producto)
- Desglose interno de PRDs/funcionalidades: para cada funcionalidad/PRD, incluir fases internas con descripción, decisiones resueltas (con fecha), decisiones pendientes (con opciones y trade-offs)
- Roadmap de Funcionalidades (resumen ejecutivo que complementa el desglose detallado — tabla de alto nivel con nombre, alcance, timeline y dependencias por funcionalidad)
- Recomendación de implementación
- Gate de avance (Fase G): inventario de preguntas identificadas (críticas/importantes/menores) con estado de resolución, evidencia de la alerta al usuario (si hubo) y estado final de avance que justifica el `Ready for`. **Obligatoria** incluso si todas las preguntas se resolvieron inline.
- Preguntas Abiertas (resueltas/pendientes): documenta decisiones con severidad original y estado de resolución. Marcar como "Pendiente — usuario eligió avanzar con default conservador" las que el usuario decidió no resolver en el gate de la Fase G.
- Checklist de salida (validación de contenido + formato)
- Ready for con link relativo al siguiente artefacto

## Convenciones de formato del documento

- Sin emojis en el documento. Usa texto: `Pass`/`Partial`/`Fail`, `Sí`/`Parcial`/`No`. Símbolos tipográficos estándar (`→`, `—`, `≥`, `≤`) sí están permitidos.

## Estructura del desglose interno de PRDs

Para cada PRD/funcionalidad, desglosar en fases internas:

```markdown
### PRD N — [Nombre]

Fases internas que componen PRD N:

#### Fase N — [Nombre]

- [Descripción de la fase]
- **Decisión resuelta ([fecha])**: [decisión tomada, con rationale]
- **Decisión pendiente**: [decisión no resuelta, con opciones enumeradas y trade-offs]
```

Las decisiones pendientes identificadas aquí son las preguntas abiertas que alimentan el gate de la Fase G.

## Ready for valores (con link relativo al siguiente artefacto)

- `priorizar-roadmap`: Múltiples funcionalidades identificadas, avance libre (sin preguntas Críticas/Importantes sin resolver). Link: `feature-prioritization.md`
- `priorizar-roadmap (condicionado)`: Múltiples funcionalidades, hay preguntas Importantes sin resolver; el usuario fue alertado y eligió avanzar con defaults conservadores. Las preguntas pendientes se heredan en `priorizar-roadmap`. Link: `feature-prioritization.md`
- `evaluar-conectividad-tecnica`: Funcionalidad única, avance libre. Link: `../../initiatives/<PRD-SLUG>/connectivity/prerequisites-assessment.md`
- `evaluar-conectividad-tecnica (condicionado)`: Funcionalidad única, hay preguntas Importantes sin resolver; el usuario fue alertado y eligió avanzar con defaults conservadores. Link: `../../initiatives/<PRD-SLUG>/connectivity/prerequisites-assessment.md`
- `bloqueado`: Hay preguntas Críticas sin resolver o la clasificación de alcance es ambigua. Necesita aclaración antes de cualquier avance.
