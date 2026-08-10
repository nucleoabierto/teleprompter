# Guía del gate de avance

Lógica completa para evaluar el estado del esbozo.

## Contenido

- [Niveles de severidad](#niveles-de-severidad)
- [Estados de avance](#estados-de-avance)
- [Flujo del gate](#flujo-del-gate)
- [Reglas](#reglas)
- [Mejores prácticas](#mejores-prácticas)
- [Ejemplo completo](#ejemplo-completo)

## Niveles de severidad

**Crítico**: Bloquea el progreso completamente

- No se puede proceder sin resolver
- Impacto directo en éxito del proyecto
- Requiere resolución inmediata

**Importante**: Afecta la calidad pero no bloquea completamente

- Se puede proceder con mitigaciones temporales
- Impacto significativo pero manejable
- Requiere resolución en corto plazo

**Menor**: No bloquea progreso, pero sería ideal resolver

- Procede con la incógnita documentada
- Impacto limitado o contingente
- Puede resolverse posteriormente

## Estados de avance

**Status `blocked`**: Cuando hay preguntas abiertas **Críticas** sin resolver

- No se puede proceder sin resolver
- Documentar todas las preguntas críticas
- Especificar qué resolución se requiere
- El usuario debe resolver o descartar la idea
- `next` se omite en el frontmatter

**Status `conditional`, next `[siguiente skill]`**: Cuando hay preguntas **Importantes** sin resolver

- El skill **debe alertar al usuario** antes de avanzar
- Presenta el inventario de preguntas Importantes con su impacto
- Ofrece al usuario la opción de responderlas ahora o avanzar con valor por defecto conservador
- Si el usuario responde → incorporar como decisiones y re-evaluar estado
- Si el usuario elige avanzar sin responder → documentar como "Pendiente"

**Status `ready`, next `[siguiente skill]`** (avance libre): Cuando no hay preguntas Críticas ni Importantes sin resolver

- Pueden haber preguntas Menores (no requieren alerta ni condicionan)
- Documentar para seguimiento
- Proceder sin condicionamientos

## Flujo del gate

```text
1. Inventariar preguntas abiertas (Críticas / Importantes / Menores).
   Incluye las resueltas durante el análisis. El inventario refleja
   todo lo identificado, con su estado de resolución.
2. ¿Hay Críticas sin resolver?
   → Sí: status = blocked, next ausente. Fin.
   → No: continuar.
3. ¿Hay Importantes sin resolver?
   → Sí: alertar al usuario con el inventario.
      → ¿Usuario responde? → incorporar decisiones, recalcular, volver a paso 2.
      → ¿Usuario avanza sin responder? → status = conditional, next = [siguiente].
         Documentar preguntas como "Pendiente — usuario eligió avanzar con valor por defecto conservador".
   → No: status = ready, next = [siguiente] (avance libre).
4. Las preguntas Menores nunca bloquean ni condicionan; se documentan para seguimiento.
5. Documentar la ejecución del gate en el artefacto (subsección "Gate de avance"):
   inventario con estado, evidencia de alerta (si hubo), estado final de avance.
   Obligatorio incluso si todas se resolvieron inline (registra "resuelta inline", avance libre).
```

## Reglas

- **Nunca** omitir la alerta cuando hay preguntas Críticas o Importantes sin resolver.
- **Nunca** marcar avance libre si hay preguntas Importantes o Críticas sin resolver.
- **Nunca** omitir la documentación del gate en el artefacto.
- Las preguntas resueltas durante el gate se documentan con su severidad original y estado "Resuelta".
- Las preguntas resueltas durante el análisis se documentan con su severidad original.
- Las preguntas que el usuario eligió no resolver se documentan con estado "Pendiente - usuario eligió avanzar".

## Mejores prácticas

1. **Ser específico**: Evitar preguntas vagas como "necesito más información"
2. **Priorizar**: No documentar todo como crítico
3. **Accionable**: Cada pregunta debe tener una propuesta de resolución
4. **Actualizar**: Revisar periódicamente y marcar como resueltas
5. **Comunicar**: Asegurar que el equipo esté al tanto de las preguntas abiertas
6. **No bloquear innecesariamente**: Solo marcar como `blocked` si es realmente crítico
7. **Alertar siempre**: Cuando hay preguntas Importantes o Críticas sin resolver, se debe alertar al usuario y ofrecer la opción de responder antes de avanzar (avance condicionado). Nunca avanzar automáticamente con incógnitas significativas.

## Ejemplo completo

```markdown
## Preguntas Abiertas

### Críticas

- **Pregunta**: No hay información sobre la disponibilidad del equipo backend para Q3
- **Impacto**: No se puede evaluar viabilidad técnica de la idea
- **Severidad**: Crítico
- **Propuesta**: Reunión con líder de ingeniería para confirmar capacidad

### Importantes

- **Pregunta**: No está claro si el feature requiere integración con servicio de email externo
- **Impacto**: Afecta estimación de esfuerzo y dependencias
- **Severidad**: Importante
- **Propuesta**: Revisar arquitectura actual y confirmar con líder técnico

### Menores

- **Pregunta**: No hay datos sobre preferencias de notificación de usuarios existentes
- **Impacto**: Podría afectar diseño del feature pero no bloquea desarrollo
- **Severidad**: Menor
- **Propuesta**: Encuesta rápida a un subconjunto de usuarios durante desarrollo
```
