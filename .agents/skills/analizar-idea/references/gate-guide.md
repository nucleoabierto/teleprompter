# Guía del gate de avance

Lógica completa para evaluar el estado del análisis y decidir `status` y `next` en el frontmatter. Referencia única para el gate de la Fase E — SKILL.md delega aquí.

El gate evalúa **dos tipos de criterios**:

1. **Criterios de calidad del análisis**: Validaciones internas que el skill debe cumplir (ej: el producto conecta problema y resultado, se describe en términos de experiencia, no implementación). Son checks de calidad que el skill debe garantizar antes de avanzar.
2. **Preguntas abiertas/incógnitas**: Información faltante que requiere resolución externa (ej: disponibilidad de recursos, dependencias externas no confirmadas). Son incógnitas que el usuario o el contexto deben resolver.

## Contenido

- [Niveles de severidad](#niveles-de-severidad)
- [Tipos de criterios](#tipos-de-criterios)
- [Estados de avance](#estados-de-avance)
- [Flujo del gate](#flujo-del-gate)
- [Reglas](#reglas)
- [Mejores prácticas](#mejores-prácticas)
- [Ejemplo completo](#ejemplo-completo)
- [Ejemplo canónico — Gate con todas resueltas inline](#ejemplo-canónico--gate-con-todas-resueltas-inline)

## Niveles de severidad

**Crítico**: Bloquea el progreso completamente

- No se puede proceder sin resolver
- Impacto directo en éxito del proyecto
- Requiere resolución inmediata

**Importante**: Afecta calidad o plazo pero no bloquea completamente

- Se puede proceder con mitigaciones temporales
- Impacto significativo pero manejable
- Requiere resolución en corto plazo

**Menor**: No bloquea progreso, pero sería ideal resolver

- Procede con la incógnita documentada
- Impacto limitado o contingente
- Puede resolverse posteriormente

## Tipos de criterios

El gate evalúa dos tipos de criterios con lógica diferente:

### 1. Criterios de calidad del análisis

Validaciones internas que el skill debe cumplir. Si un criterio Crítico falla, el skill debe corregir el análisis antes de avanzar (no es una pregunta abierta, es un defecto del análisis).

**Criterios Críticos** (bloquean avance si fallan):

- **¿El producto conecta el problema y el estado final?**: Si el producto descrito no conecta ambos, no es el puente correcto. El skill debe revisar y corregir la narrativa.
- **¿El producto se describe en términos de experiencia, no de implementación?**: Si la narrativa habla de stack, arquitectura o esquemas, no es una descripción de producto. El skill debe eliminar el contenido técnico.

**Criterios Importantes** (afectan calidad pero no bloquean):

- **¿El beneficiario está claro?**: Se debe poder identificar quién se beneficia del producto. Si no está claro, el skill debe aclararlo en la narrativa.
- **¿La idea contiene múltiples funcionalidades?**: Si sospechas que sí, documenta la sospecha como Pregunta abierta (no la dividas).

**Criterios Menores** (ideal pero no bloquean):

- **¿Los límites están declarados?**: Las fronteras del producto deben estar explícitas.
- **¿Las suposiciones están documentadas?**: Las suposiciones del contexto deben estar declaradas.

### 2. Preguntas abiertas/incógnitas

Información faltante que requiere resolución externa. Estas son preguntas que el usuario o el contexto deben responder, no defectos del análisis.

**Críticas**: Bloquean el progreso completamente (ej: no hay información sobre disponibilidad del equipo).
**Importantes**: Afectan calidad o plazo pero no bloquean completamente (ej: no está claro si requiere integración externa).
**Menores**: No bloquean progreso, pero sería ideal resolver (ej: no hay datos sobre preferencias de usuarios).

## Estados de avance

**Status `blocked`**: Cuando hay preguntas abiertas **Críticas** sin resolver

- No se puede proceder sin resolver
- Documentar todas las preguntas críticas
- Especificar qué resolución se requiere
- El usuario debe resolver o descartar la idea
- `next` se omite en el frontmatter

**Status `conditional`, next `evaluar-alcance-idea`**: Cuando hay preguntas **Importantes** sin resolver

- El skill **debe alertar al usuario** antes de avanzar
- Presenta el inventario de preguntas Importantes con su impacto
- Ofrece al usuario la opción de responderlas ahora o avanzar con valor por defecto conservador
- Si el usuario responde → incorporar como decisiones, recalcular, re-evaluar estado
- Si el usuario elige avanzar sin responder → documentar como "Pendiente — usuario eligió avanzar con valor por defecto conservador"
- Las preguntas pendientes se heredan en el siguiente skill para que no se pierdan

**Status `ready`, next `evaluar-alcance-idea`** (avance libre): Cuando no hay preguntas Críticas ni Importantes sin resolver

- Pueden haber preguntas Menores (no requieren alerta ni condicionan)
- Documentar para seguimiento
- Proceder sin condicionamientos

## Flujo del gate

```text
1. Evaluar criterios de calidad del análisis:
   - ¿El producto conecta el problema y el estado final? (Crítico)
   - ¿El producto se describe en términos de experiencia, no de implementación? (Crítico)
   - ¿El beneficiario está claro? (Importante)
   - ¿La idea contiene múltiples funcionalidades? (Importante)
   - ¿Los límites están declarados? (Menor)
   - ¿Las suposiciones están documentadas? (Menor)

   Si un criterio Crítico falla → corregir el análisis antes de continuar.
   Si un criterio Importante falla → corregir o documentar como Pregunta abierta.
   Los criterios Menores se documentan pero no bloquean.

2. Inventariar preguntas abiertas (Críticas / Importantes / Menores).
   Incluye las resueltas inline durante el análisis — el inventario refleja
   todo lo identificado, con su estado de resolución.

3. ¿Hay Críticas sin resolver?
   → Sí: status = blocked, next ausente. Fin.
   → No: continuar.

4. ¿Hay Importantes sin resolver?
   → Sí: alertar al usuario con el inventario.
      → ¿Usuario responde? → incorporar decisiones, recalcular, volver a paso 3.
      → ¿Usuario avanza sin responder? → status = conditional, next = evaluar-alcance-idea.
         Documentar preguntas como "Pendiente — usuario eligió avanzar con valor por defecto conservador".
   → No: status = ready, next = evaluar-alcance-idea (avance libre).

5. Las preguntas Menores nunca bloquean ni condicionan; se documentan para seguimiento.

6. Documentar la ejecución del gate en el artefacto (subsección "Gate de avance (Fase D)"):
   - Estado de criterios de calidad (pasaron/fallaron)
   - Inventario de preguntas abiertas con estado
   - Evidencia de alerta (si hubo)
   - Estado final de avance
   Obligatorio incluso si todos los criterios pasaron y todas las preguntas se resolvieron inline.
```

## Reglas

### Para criterios de calidad del análisis

- **Nunca** avanzar si un criterio Crítico falla. El skill debe corregir el análisis antes de continuar.
- Los criterios Importantes deben corregirse o documentarse como Preguntas abiertas.
- Los criterios Menores se documentan pero no bloquean el avance.
- El estado de los criterios de calidad debe documentarse en el gate.

### Para preguntas abiertas/incógnitas

- **Nunca** omitir la alerta cuando hay preguntas Críticas o Importantes sin resolver.
- **Nunca** marcar avance libre si hay preguntas Importantes o Críticas sin resolver.
- **Nunca** omitir la documentación del gate en el artefacto — es la evidencia de que se ejecutó.
- Las preguntas resueltas durante el gate se documentan con severidad original y estado "Resuelta".
- Las preguntas resueltas inline durante el análisis se documentan con estado "Resuelta inline" y cuentan como resueltas para el estado de avance.
- Las preguntas que el usuario eligió no resolver se documentan con estado "Pendiente — usuario eligió avanzar con valor por defecto conservador" y se heredan en el siguiente skill.

## Mejores prácticas

1. **Ser específico**: Evitar preguntas vagas como "necesito más información"
2. **Priorizar**: No documentar todo como crítico - usar severidad apropiada
3. **Accionable**: Cada pregunta debe tener una propuesta de resolución
4. **Rastreable**: Asignar responsable y plazo cuando sea posible
5. **Actualizar**: Revisar periódicamente y marcar como resueltas
6. **Comunicar**: Asegurar que el equipo esté al tanto de las preguntas abiertas
7. **No bloquear innecesariamente**: Solo marcar como `blocked` si realmente crítico
8. **Alertar siempre**: Cuando hay preguntas Importantes o Críticas sin resolver, el skill debe alertar al usuario y ofrecer la opción de responder antes de avanzar (avance condicionado). Nunca avanzar en silencio con incógnitas significativas.
9. **Heredar pendientes**: Las preguntas que el usuario eligió no resolver en el gate se heredan en el siguiente skill del workflow para que no se pierdan. Documentar con estado "Pendiente — usuario eligió avanzar con valor por defecto conservador".

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

## Ejemplo canónico — Gate con todas resueltas inline

Caso más común en ideas bien formadas: los criterios de calidad pasaron y las preguntas se resolvieron inline durante el análisis (Fases B/C/D del skill) y no se necesita alerta. Aun así, el gate **debe documentarse** en el artefacto como evidencia de que se ejecutó.

```markdown
## Gate de avance (Fase D)

- **Criterios de calidad del análisis**:
  - [Crítico] ¿El producto conecta el problema y el estado final? — Estado: pasó
  - [Crítico] ¿El producto se describe en términos de experiencia, no de implementación? — Estado: pasó
  - [Importante] ¿El beneficiario está claro? — Estado: pasó
  - [Importante] ¿La idea contiene múltiples funcionalidades? — Estado: pasó (idea única)
  - [Menor] ¿Los límites están declarados? — Estado: pasó
  - [Menor] ¿Las suposiciones están documentadas? — Estado: pasó

- **Inventario de preguntas abiertas identificadas**:
  - [Importante] ¿El instalador debe ser agnóstico al agente destino? — Estado: resuelta inline
  - [Importante] ¿Cómo entregar las instrucciones al agente? — Estado: resuelta inline
  - [Menor] ¿Canal de publicación del paquete npm? — Estado: resuelta inline

- **Alerta al usuario**: No necesaria — todos los criterios de calidad pasaron y todas las Críticas/Importantes se resolvieron inline durante el análisis.

- **Estado final de avance**: Libre — `status: ready`, `next: evaluar-alcance-idea`
```

**Notas**:

- Los criterios de calidad del análisis se evalúan primero. Si alguno Crítico falla, el skill debe corregir el análisis antes de continuar.
- El inventario de preguntas abiertas lista **todas** las preguntas identificadas, no solo las pendientes. Las resueltas inline se marcan con estado "resuelta inline".
- Aunque no hubo alerta, la subsección "Gate de avance (Fase D)" es **obligatoria** — es la evidencia de que el gate se ejecutó y de que el avance libre está justificado.
- Las decisiones resueltas inline se documentan además en la sección "Preguntas Abiertas (resueltas)" del artefacto con su severidad original y la decisión tomada.
