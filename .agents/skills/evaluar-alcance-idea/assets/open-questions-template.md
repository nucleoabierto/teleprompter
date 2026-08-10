# Template: Preguntas Abiertas

Template para documentar información faltante e incógnitas que requieren aclaración antes de proceder al siguiente paso del workflow de evaluación de alcance.

## Propósito

Documentar cualquier información faltante, incertidumbres o decisiones pendientes que deben resolverse antes de proceder a la siguiente fase del workflow. Esto asegura que las preguntas abiertas sean visibles y rastreables durante la evaluación de alcance.

## Estructura

### Categoría de Incógnitas

**Información estratégica faltante**: Visión, roadmap o alineación con producto no está claro
**Incertidumbre de alcance**: No está claro si la idea es una funcionalidad o múltiples
**Ambigüedad de funcionalidades**: Límites entre funcionalidades no están definidos
**Dependencias técnicas**: Relaciones entre bounded contexts o sistemas no están claras
**Decisiones de diseño pendientes**: Opciones técnicas o de producto no resueltas

### Formato de Documentación

Para cada pregunta abierta, documentar:

1. **Pregunta o issue**: Descripción clara de la incógnita
2. **Impacto**: Cómo afecta esta incógnita a la evaluación de alcance
3. **Severidad**: Crítico / Importante / Menor
4. **Propuesta de resolución**: Cómo se puede resolver
5. **Owner**: Quién es responsable de resolver (si aplica)
6. **Timeline**: Cuándo debe resolverse (si aplica)

## Categorías Específicas para Evaluar Alcance

**Categorías comunes**:

- Visión/plan de trabajo de producto no está claro (Fase B)
- La idea es ambigua entre múltiples funcionalidades y una funcionalidad con sub-componentes (Fase C)
- Las dependencias entre funcionalidades no están claras
- Los bounded contexts impactados no están claros
- Decisiones de diseño que afectan la división del alcance
- Timeline o recursos no pueden estimarse sin resolver decisiones de diseño

**Ejemplo**:

```markdown
- **Pregunta**: No está claro si la idea describe un sistema de notificaciones completo o solo la infraestructura base
- **Impacto**: No se puede determinar si requiere múltiples PRDs o uno solo
- **Severidad**: Crítico
- **Propuesta**: Realizar experimento mental de implementación y mapeo de código existente
- **Owner**: Product Manager
- **Timeline**: Antes de proceder a dividir alcance
```

## Severidad Levels

**Crítico**: Bloquea la evaluación de alcance completamente

- No se puede proceder sin resolver
- Impacto directo en la clasificación de funcionalidad única vs múltiple
- Requiere resolución inmediata

**Importante**: Afecta calidad del análisis o timeline pero no bloquea completamente

- Se puede proceder con mitigaciones temporales
- Impacto significativo en la precisión del roadmap
- Requiere resolución en corto plazo

**Menor**: No bloquea la evaluación, pero sería ideal resolver

- Procede con incógnita documentada
- Impacto limitado o contingente
- Puede resolverse posteriormente

## Cómo Usar este Template

1. **Identificar incógnitas**: Durante ejecución del skill, documentar cualquier información faltante
2. **Clasificar por severidad**: Determinar si es crítico, importante o menor
3. **Proponer resolución**: Sugerir cómo se puede resolver cada incógnita
4. **Definir timeline**: Establecer cuándo debe resolverse (si aplica)
5. **Comunicar**: Asegurar que las preguntas abiertas sean visibles al equipo
6. **Seguimiento**: Revisar periódicamente si las preguntas han sido resueltas
7. **Actualizar**: Marcar como resueltas cuando se obtenga la información

## Integración con Status y Next y Avance Condicionado

El avance al siguiente skill no es automático cuando hay preguntas abiertas. Se aplica un **gate de avance condicionado obligatorio**: el usuario es alertado y tiene la opción de responder antes de avanzar. El gate es una **precondición dura**, ya que el artefacto no se considera completo hasta que el gate se ejecuta y se documenta, incluso si todas las preguntas se resolvieron durante el análisis.

### Estados de avance

**`status: blocked`**: Cuando hay preguntas abiertas **Críticas** sin resolver

- No se puede proceder sin resolver
- Documentar todas las preguntas críticas
- Especificar qué resolución se requiere
- El usuario debe resolver o descartar la idea
- `next` queda sin definir

**`status: conditional` con `next: [siguiente skill]`**: Cuando hay preguntas **Importantes** sin resolver

- El skill **debe alertar al usuario** antes de avanzar
- Presenta el inventario de preguntas Importantes con su impacto
- Ofrece al usuario la opción de responderlas ahora o avanzar con default conservador
- Si el usuario responde → incorporar como decisiones, recalcular, re-evaluar estado
- Si el usuario elige avanzar sin responder → documentar como "Pendiente, usuario eligió avanzar con default conservador"
- Las preguntas pendientes se heredan en el siguiente skill para que no se pierdan

**`status: ready` con `next: [siguiente skill]`** (avance libre): Cuando no hay preguntas Críticas ni Importantes sin resolver

- Pueden haber preguntas Menores (no requieren alerta ni condicionan)
- Documentar para seguimiento
- Proceder sin condicionamientos

### Flujo del gate de avance condicionado

```text
1. Inventariar preguntas abiertas (Críticas, Importantes, Menores).
   Incluye las resueltas durante el análisis, ya que el inventario refleja
   todo lo identificado con su estado de resolución.
2. ¿Hay Críticas sin resolver?
   → Sí: status = blocked, sin next. Fin.
   → No: continuar.
3. ¿Hay Importantes sin resolver?
   → Sí: alertar al usuario con el inventario.
      → ¿Usuario responde? → incorporar decisiones, recalcular, volver a paso 2.
      → ¿Usuario avanza sin responder? → status = conditional, next = [siguiente].
         Documentar preguntas como "Pendiente, usuario eligió avanzar con default conservador".
   → No: status = ready, next = [siguiente] (avance libre).
4. Las preguntas Menores nunca bloquean ni condicionan, se documentan para seguimiento.
5. Documentar la ejecución del gate en el artefacto (subsección "Gate de avance"):
   inventario con estado, evidencia de alerta (si hubo), estado final de avance.
   Obligatorio incluso si todas se resolvieron durante el análisis (registra "resuelta durante el análisis", avance libre).
```

### Reglas

- **Nunca** omitir la alerta cuando hay preguntas Críticas o Importantes sin resolver
- **Nunca** marcar avance libre si hay preguntas Importantes o Críticas sin resolver
- **Nunca** omitir la documentación del gate en el artefacto, ya que es la evidencia de que se ejecutó
- Las preguntas resueltas durante el gate se documentan con severidad original y estado "Resuelta"
- Las preguntas resueltas durante el análisis se documentan con estado "Resuelta durante el análisis" y cuentan como resueltas para el estado de avance
- Las preguntas que el usuario eligio no resolver se documentan con estado "Pendiente, usuario eligio avanzar con default conservador"

## Ejemplo canónico: Gate con todas resueltas durante el análisis

Caso más común en ideas bien formadas: las preguntas se resolvieron durante el análisis (Fases B/C/D del skill) y no se necesita alerta. Aun así, el gate **debe documentarse** en el artefacto como evidencia de que se ejecutó.

```markdown
## Gate de avance (Fase F)

- **Inventario de preguntas identificadas**:
  - [Importante] ¿El instalador debe ser agnóstico al agente destino? Estado: resuelta durante el análisis
  - [Importante] ¿Cómo entregar las instructions al agente? Estado: resuelta durante el análisis
  - [Menor] ¿Canal de publicación del paquete npm? Estado: resuelta durante el análisis
- **Alerta al usuario**: No necesaria, ya que todas las Críticas/Importantes se resolvieron durante el análisis
- **Estado final de avance**: Libre, con `status: ready` y `next: evaluar-alcance-idea`
```

**Notas**:

- El inventario lista **todas** las preguntas identificadas, no solo las pendientes. Las resueltas durante el análisis se marcan con estado "resuelta durante el análisis"
- Aunque no hubo alerta, la subsección "Gate de avance (Fase F)" es **obligatoria**, ya que es la evidencia de que el gate se ejecutó y de que el avance libre está justificado
- Las decisiones resueltas durante el análisis se documentan además en la sección "Preguntas Abiertas (resueltas)" del artefacto con su severidad original y la decisión tomada

## Best Practices

1. **Ser específico**: Evitar preguntas vagas como "necesito más información"
2. **Priorizar**: No documentar todo como crítico, usar severidad apropiada
3. **Accionable**: Cada pregunta debe tener una propuesta de resolución
4. **Rastreable**: Asignar owner y timeline cuando sea posible
5. **Actualizar**: Revisar periódicamente y marcar como resueltas
6. **Comunicar**: Asegurar que el equipo sea aware de las preguntas abiertas
7. **No bloquear innecesariamente**: Solo marcar como blocked si realmente crítico
8. **Alertar siempre**: Cuando hay preguntas Importantes o Críticas sin resolver, el skill debe alertar al usuario y ofrecer la opción de responder antes de avanzar (avance condicionado). Nunca avanzar en silencio con incógnitas significativas
9. **Heredar pendientes**: Las preguntas que el usuario eligio no resolver en el gate se heredan en el siguiente skill del workflow para que no se pierdan. Documentar con estado "Pendiente, usuario eligio avanzar con default conservador"
