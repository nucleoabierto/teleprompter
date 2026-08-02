# Template: Preguntas Abiertas

Template para documentar información faltante y unknowns que requieren aclaración antes de proceder.

## Propósito

Documentar cualquier información faltante, incertidumbres o preguntas que deben resolverse antes de proceder al siguiente paso del workflow. Esto asegura que los unknowns sean visibles y rastreables.

## Estructura

### Categoría de Unknowns

**Información faltante**: Data o contexto que no está disponible
**Incertidumbre técnica**: Aspectos técnicos no resueltos
**Ambigüedad de requisitos**: Requerimientos que no son claros
**Dependencias externas**: Elementos fuera de control que afectan el proyecto
**Riesgos identificados**: Riesgos conocidos que requieren mitigación

### Formato de Documentación

Para cada pregunta abierta, documentar:

1. **Pregunta o issue**: Descripción clara del unknown
2. **Impacto**: Cómo afecta este unknown al proyecto
3. **Severidad**: Crítico / Importante / Menor
4. **Propuesta de resolución**: Cómo se puede resolver
5. **Owner**: Quién es responsable de resolver (si aplica)
6. **Timeline**: Cuándo debe resolverse (si aplica)

## Template por Tipo de Skill

### Para Skills de Discovery (analizar-idea, mapear-assumptions)

**Categorías comunes**:

- Visión/roadmap de producto no está claro
- No hay información sobre deadlines externos
- Disponibilidad de recursos es desconocida
- Outcome no puede definirse sin mencionar solución
- Dominio del requerimiento es desconocido para framework aplicado

**Ejemplo**:

```markdown
- **Pregunta**: No hay información sobre la visión de producto para Q3
- **Impacto**: No se puede evaluar alineación estratégica de la idea
- **Severidad**: Importante
- **Propuesta**: Revisar documento de roadmap con product lead
- **Owner**: Product Manager
- **Timeline**: Antes de proceder a evaluar-alcance-idea
```

### Para Skills de Diseño (disenar-experimentos)

**Categorías comunes**:

- Data histórica insuficiente para calcular baseline
- Métricas propuestas no son medibles con infraestructura actual
- No hay claridad sobre población objetivo del experimento
- Incertidumbre sobre capacidad de tráfico para sample size requerido
- Riesgos técnicos no identificados para setup experimental

**Ejemplo**:

```text
- **Pregunta**: No hay data histórica de CTR para calcular baseline
- **Impacto**: No se puede calcular sample size requerido
- **Severidad**: Crítico
- **Propuesta**: Extraer data de analytics de últimos 30 días o usar estimación conservadora
- **Owner**: Data Analyst
- **Timeline**: Antes de proceder a calcular sample size
```

### Para Skills de Implementación (implementar-plan, etc.)

**Categorías comunes**:

- Dependencias técnicas no documentadas
- APIs externas con contracts no claros
- Requerimientos de performance no especificados
- Integraciones con sistemas existentes no mapeadas
- Procesos de deployment no definidos para el contexto

## Severidad Levels

**Crítico**: Bloquea el progreso completamente

- No se puede proceder sin resolver
- Impacto directo en éxito del proyecto
- Requiere resolución inmediata

**Importante**: Afecta calidad o timeline pero no bloquea completamente

- Se puede proceder con mitigaciones temporales
- Impacto significativo pero manejable
- Requiere resolución en corto plazo

**Menor**: No bloquea progreso, pero sería ideal resolver

- Procede con unknown documentado
- Impacto limitado o contingente
- Puede resolverse posteriormente

## Cómo Usar este Template

1. **Identificar unknowns**: Durante ejecución del skill, documentar cualquier información faltante
2. **Clasificar por severidad**: Determinar si es crítico, importante o menor
3. **Proponer resolución**: Sugerir cómo se puede resolver cada unknown
4. **Definir timeline**: Establecer cuándo debe resolverse (si aplica)
5. **Comunicar**: Asegurar que las preguntas abiertas sean visibles al equipo
6. **Seguimiento**: Revisar periódicamente si las preguntas han sido resueltas
7. **Actualizar**: Marcar como resueltas cuando se obtenga la información

## Integración con Ready For — Avance Condicionado

El avance al siguiente skill no es automático cuando hay preguntas abiertas. Se aplica un **gate de avance condicionado obligatorio**: el usuario es alertado y tiene la opción de responder antes de avanzar. El gate es una **precondición dura** — el artefacto no se considera completo hasta que el gate se ejecuta y se documenta, incluso si todas las preguntas se resolvieron inline durante el análisis.

### Estados de avance

**Ready for `bloqueado`**: Cuando hay preguntas abiertas **Críticas** sin resolver

- No se puede proceder sin resolver
- Documentar todas las preguntas críticas
- Especificar qué resolución se requiere
- El usuario debe resolver o descartar la idea

**Ready for `[siguiente skill] (condicionado)`**: Cuando hay preguntas **Importantes** sin resolver

- El skill **debe alertar al usuario** antes de avanzar
- Presenta el inventario de preguntas Importantes con su impacto
- Ofrece al usuario la opción de responderlas ahora o avanzar con default conservador
- Si el usuario responde → incorporar como decisiones, recalcular, re-evaluar estado
- Si el usuario elige avanzar sin responder → documentar como "Pendiente — usuario eligió avanzar con default conservador"
- Las preguntas pendientes se heredan en el siguiente skill para que no se pierdan

**Ready for `[siguiente skill]`** (avance libre): Cuando no hay preguntas Críticas ni Importantes sin resolver

- Pueden haber preguntas Menores (no requieren alerta ni condicionan)
- Documentar para seguimiento
- Proceder sin condicionamientos

### Flujo del gate de avance condicionado

```text
1. Inventariar preguntas abiertas (Críticas / Importantes / Menores).
   Incluye las resueltas inline durante el análisis — el inventario refleja
   todo lo identificado, con su estado de resolución.
2. ¿Hay Críticas sin resolver?
   → Sí: Ready for = bloqueado. Fin.
   → No: continuar.
3. ¿Hay Importantes sin resolver?
   → Sí: alertar al usuario con el inventario.
      → ¿Usuario responde? → incorporar decisiones, recalcular, volver a paso 2.
      → ¿Usuario avanza sin responder? → Ready for = [siguiente] (condicionado).
         Documentar preguntas como "Pendiente — usuario eligió avanzar con default conservador".
   → No: Ready for = [siguiente] (avance libre).
4. Las preguntas Menores nunca bloquean ni condicionan; se documentan para seguimiento.
5. Documentar la ejecución del gate en el artefacto (subsección "Gate de avance"):
   inventario con estado, evidencia de alerta (si hubo), estado final de avance.
   Obligatorio incluso si todas se resolvieron inline (registra "resuelta inline", avance libre).
```

### Reglas

- **Nunca** omitir la alerta cuando hay preguntas Críticas o Importantes sin resolver.
- **Nunca** marcar avance libre si hay preguntas Importantes o Críticas sin resolver.
- **Nunca** omitir la documentación del gate en el artefacto — es la evidencia de que se ejecutó.
- Las preguntas resueltas durante el gate se documentan con severidad original y estado "Resuelta".
- Las preguntas resueltas inline durante el análisis se documentan con estado "Resuelta inline" y cuentan como resueltas para el estado de avance.
- Las preguntas que el usuario eligió no resolver se documentan con estado "Pendiente — usuario eligió avanzar con default conservador" y se heredan en el siguiente skill.

## Ejemplo Completo

```markdown
## Preguntas Abiertas

### Críticas

- **Pregunta**: No hay información sobre la disponibilidad del equipo backend para Q3
- **Impacto**: No se puede evaluar feasibility técnica de la idea
- **Severidad**: Crítico
- **Propuesta**: Reunión con engineering lead para confirmar capacidad
- **Owner**: Engineering Manager
- **Timeline**: Esta semana antes de proceder

### Importantes

- **Pregunta**: No está claro si el feature requiere integración con servicio de email externo
- **Impacto**: Afecta estimación de effort y dependencias
- **Severidad**: Importante
- **Propuesta**: Revisar arquitectura actual y confirmar con tech lead
- **Owner**: Tech Lead
- **Timeline**: Antes de planificar implementación

### Menores

- **Pregunta**: No hay data sobre preferencias de notificación de usuarios existentes
- **Impacto**: Podría afectar diseño del feature pero no bloquea desarrollo
- **Severidad**: Menor
- **Propuesta**: Encuesta rápida a subset de usuarios durante desarrollo
- **Owner**: Product Designer
- **Timeline**: Durante fase de diseño (no bloquea inicio)
```

## Ejemplo canónico — Gate con todas resueltas inline

Caso más común en ideas bien formadas: las preguntas se resolvieron inline durante el análisis (Fases B/C/D del skill) y no se necesita alerta. Aun así, el gate **debe documentarse** en el artefacto como evidencia de que se ejecutó.

```markdown
## Gate de avance (Fase G)

- **Inventario de preguntas identificadas**:
  - [Importante] ¿El instalador debe ser agnóstico al agente destino? — Estado: resuelta inline
  - [Importante] ¿Cómo entregar las instructions al agente? — Estado: resuelta inline
  - [Menor] ¿Canal de publicación del paquete npm? — Estado: resuelta inline
- **Alerta al usuario**: No necesaria — todas las Críticas/Importantes se resolvieron inline durante el análisis.
- **Estado final de avance**: Libre — `Ready for: evaluar-alcance-idea`
```

**Notas**:

- El inventario lista **todas** las preguntas identificadas, no solo las pendientes. Las resueltas inline se marcan con estado "resuelta inline".
- Aunque no hubo alerta, la subsección "Gate de avance (Fase G)" es **obligatoria** — es la evidencia de que el gate se ejecutó y de que el avance libre está justificado.
- Las decisiones resueltas inline se documentan además en la sección "Preguntas Abiertas (resueltas)" del artefacto con su severidad original y la decisión tomada.

## Best Practices

1. **Ser específico**: Evitar preguntas vagas como "necesito más información"
2. **Priorizar**: No documentar todo como crítico - usar severidad apropiada
3. **Accionable**: Cada pregunta debe tener una propuesta de resolución
4. **Rastreable**: Asignar owner y timeline cuando sea posible
5. **Actualizar**: Revisar periódicamente y marcar como resueltas
6. **Comunicar**: Asegurar que el equipo sea aware de las preguntas abiertas
7. **No bloquear innecesariamente**: Solo marcar como blocked si realmente crítico
8. **Alertar siempre**: Cuando hay preguntas Importantes o Críticas sin resolver, el skill debe alertar al usuario y ofrecer la opción de responder antes de avanzar (avance condicionado). Nunca avanzar en silencio con unknowns significativos.
9. **Heredar pendientes**: Las preguntas que el usuario eligió no resolver en el gate se heredan en el siguiente skill del workflow para que no se pierdan. Documentar con estado "Pendiente — usuario eligió avanzar con default conservador".
