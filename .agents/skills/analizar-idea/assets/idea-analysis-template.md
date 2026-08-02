# Template: Análisis Preliminar de Idea

Template para estructurar el artefacto de salida de `analizar-idea`. El agente sigue este formato al escribir `docs/<domain>/idea/<IDEA-SLUG>/idea-analysis.md`.

## Header requerido (al inicio del documento)

- [Idea slug]
- Dominio
- Fecha
- Skill: analizar-idea
- Input: descripción de la idea (texto del usuario) o ruta del artefacto fuente si existe. Para este skill el input suele ser texto libre pegado por el usuario, no un archivo; documentar como `Input: descripción del usuario` (o pegar el texto breve). Si hay un artefacto fuente (ej. issue, email), documentar su ruta/referencia. **No omitas la línea `Input:`** del header aunque el detalle vaya en la sección "Resumen de la idea".

## Secciones requeridas

- Header requerido (al inicio del documento, incluyendo línea `Input:`)
- (Opcional) Nota de relación con artefactos downstream — ver abajo
- Resumen de la idea (input del usuario) — preserva el input original para contexto
- Declaración de resultado (sin mención de solución)
- Validación de resultado (válido/necesita reformulación)
- Alineación estratégica
- Urgencia y momento
- Disponibilidad de recursos
- Recomendación preliminar (Proceder/Proceder condicional/No proceder)
- Fase F — Observaciones de diseño relevantes para el siguiente paso: insights de diseño que no son parte del gate pero aceleran `evaluar-alcance-idea`
- Gate de avance (Fase G): inventario de preguntas identificadas (críticas/importantes/menores) con estado de resolución, evidencia de la alerta al usuario (si hubo) y estado final de avance que justifica el `Ready for`. **Obligatoria** incluso si todas las preguntas se resolvieron inline.
- Preguntas Abiertas (resueltas/pendientes): documenta decisiones tomadas con severidad original y estado de resolución. Marcar como "Pendiente — usuario eligió avanzar con default conservador" las que el usuario decidió no resolver en el gate de la Fase G.
- Checklist de salida (validación de contenido + formato)
- Ready for (`evaluar-alcance-idea`, `evaluar-alcance-idea (condicionado)`, `bloqueado`) con link relativo al siguiente artefacto

## Convenciones de formato del documento

- Sin emojis en el documento (matriz, validación, checklist de salida). Usa texto: `Pass`/`Partial`/`Fail`, `Sí`/`Parcial`/`No`. Símbolos tipográficos estándar (`→`, `—`, `≥`, `≤`) sí están permitidos.
- La matriz de decisión tiene 4 columnas; las justificaciones van en lista debajo, no como columna extra.

## Nota opcional: Relación idea ↔ artefactos downstream

Cuando ya existen artefactos downstream generados por skills posteriores del workflow (scope-roadmap, PRD, epics), añade al inicio del documento (justo después del header) una nota breve que relacione esta idea con sus artefactos derivados, para facilitar navegación.

**Formato**:
> **Relación idea ↔ PRD**: esta idea (`idea/<IDEA-SLUG>/`) es la fase pre-PRD. Su alcance se dividió y la parte prioridad N (RICE X) derivó en el PRD activo `initiatives/<PRD-SLUG>/` (PRD N — <descripción>). Ver [scope-roadmap.md](scope-roadmap.md).

Solo se añade cuando los artefactos downstream existen. En la primera ejecución del skill (sin downstream), se omite.

## Ready for valores (con link relativo al siguiente artefacto)

- `evaluar-alcance-idea`: Aprobado, proceder a evaluación de alcance. Avance libre (sin preguntas Críticas/Importantes sin resolver). Link: `../<IDEA-SLUG>/scope-roadmap.md` (o `../<IDEA-SLUG>-scope-roadmap.md` en formato legacy)
- `evaluar-alcance-idea (condicionado)`: Proceder con mitigaciones. Hay preguntas Importantes sin resolver; el usuario fue alertado y eligió avanzar con defaults conservadores. Las preguntas pendientes se heredan en `evaluar-alcance-idea`. Link: `../<IDEA-SLUG>/scope-roadmap.md` (o `../<IDEA-SLUG>-scope-roadmap.md` en formato legacy)
- `bloqueado`: No proceder. Hay preguntas Críticas sin resolver, resultado no claro, desalineado, o no viable. Necesita reformulación o aclaración antes de cualquier avance.
- `[siguiente skill ya ejecutado]`: Cuando se re-ejecuta o actualiza el análisis y los artefactos downstream ya existen (scope-roadmap, feature-prioritization, PRD), el `Ready for` apunta al siguiente skill pendiente en la cadena, con link relativo al artefacto downstream existente. Ejemplo: `priorizar-roadmap` con link a `feature-prioritization.md` si `evaluar-alcance-idea` ya corrió. Acompañar con la "Nota opcional: Relación idea ↔ artefactos downstream".
