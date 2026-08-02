---
name: analizar-idea
description: >-
  Analiza preliminarmente una idea de producto definiendo el resultado deseado
  sin mencionar solución. Evalúa alineación estratégica, urgencia,
  disponibilidad de recursos y genera recomendación Proceder/Proceder
  condicional/No proceder. Salida:
  docs/<domain>/idea/<IDEA-SLUG>/idea-analysis.md. Úsalo como gate preliminar
  de viabilidad antes de evaluar-alcance-idea. Solo análisis: no implementa,
  no aprueba, no evalúa alcance (usa evaluar-alcance-idea). Para
  implementación usa implementar-plan o implementar-ticket.
---

# Analizador de Ideas

Combina análisis preliminar de viabilidad con definición de resultado deseado. Evalúa rápidamente si la idea merece inversión y define el resultado sin mencionar la solución.

Solo análisis: no implementa, no aprueba. Prepara punto de control de aprobación. Para implementación usa implementar-plan o implementar-ticket.

## Cuándo usarlo y cuándo no

- **Sí**: Gate preliminar de viabilidad antes de invertir tiempo en evaluación de alcance
- **No**: Para implementar funcionalidades (usa implementar-plan), para aprobación final (usa validar-viabilidad-producto), para análisis técnico profundo (usa evaluar-conectividad-tecnica)

## Fase 0 — Resolver entrada

Requerido: `IDEA-DESCRIPCION`.

Infiere desde:
- Descripción pegada: si el usuario pega la idea/solicitud de funcionalidad
- Contenido breve: "Agregar modo oscuro", "Sistema de notificaciones", "Exportar a PDF"
- Email o fragmento de chat: si el usuario copia descripción informal

Pregunta cuando falta: "¿Cuál es la idea que analizo? (descripción breve o completa)"

Declara inputs resueltos: idea capturada.

## Fase A — Definir Resultado Deseado

Extrae el resultado sin mencionar la solución:

**Criterios de resultado válido**:
- Describe el resultado/estado deseado, no la funcionalidad
- Es medible u observable
- No menciona tecnología o implementación
- Responde a "¿Qué queremos lograr?" no "¿Qué vamos a construir?"

**Ejemplos**:
- Incorrecto: "Implementar sistema de notificaciones" (menciona solución)
- Correcto: "Los usuarios están informados sobre eventos importantes en tiempo real" (resultado)
- Incorrecto: "Agregar modo oscuro" (menciona solución)
- Correcto: "Los usuarios pueden usar el producto cómodamente en ambientes con poca luz" (resultado)

**Si no puede definir resultado sin solución**:
- Marcar como "necesita reformulación"
- Sugerir reformulación de la idea
- Ready for: bloqueado con instrucciones

## Fase B — Evaluar Alineación Estratégica

¿Encaja con visión/plan de trabajo de producto?

**Criterios**:
- ¿Esta idea es consistente con dirección de producto?
- ¿Mueve un norte explícito de la compañía?
- ¿Es esencial o deseable?
- ¿Mantiene foco o lo dispersa?

**Veredicto**: Alineado / Parcialmente alineado / Desalineado

**Estrategia de fallo**: Si no hay información sobre visión/plan de trabajo, marcar como "Parcialmente alineado" y documentar en Preguntas abiertas.

## Fase C — Evaluar Urgencia y Momento

¿Por qué ahora?

**Criterios**:
- ¿Hay fecha límite externa (regulatorio, mercado, cliente)?
- ¿Es bloqueante para otra iniciativa?
- ¿Es oportunidad sensible al tiempo?
- ¿Puede esperar sin costo significativo?

**Veredicto**: Urgente / Importante / Puede esperar

**Estrategia de fallo**: Si no hay información sobre fechas límite o prioridades, marcar como "Importante" (default conservador) y documentar en Preguntas abiertas.

## Fase D — Evaluar Disponibilidad Básica de Recursos

Verificación rápida de viabilidad:

**Criterios**:
- ¿Equipo disponible (capacidad básica)?
- ¿Stack tecnológico compatible con arquitectura existente?
- ¿Dependencias externas críticas disponibles?
- ¿Riesgo técnico manejable?

**Veredicto**: Viable / Desafiante / No viable

**Estrategia de fallo**: Si no hay información sobre recursos, marcar como "Desafiante" (default conservador) y documentar en Preguntas abiertas.

## Fase E — Generar Recomendación Preliminar

Usar template en `assets/decision-matrix-template.md` para estructurar la decisión.

**Matriz de decisión** (resumen, mismo esquema que el template — justificaciones en lista, no en celdas):

| Criterio | Status | Weight | Score |
|-------|--------|--------|-------|
| Resultado claro | Pass - Partial - Fail | 25% | 25% - 12.5% - 0% |
| Alineación estratégica | Pass - Partial - Fail | 25% | 25% - 12.5% - 0% |
| Urgencia | Pass - Partial - Fail | 25% | 25% - 12.5% - 0% |
| Recursos básicos | Pass - Partial - Fail | 25% | 25% - 12.5% - 0% |

**Reglas de formato de la matriz** (no opcionales):

- La tabla tiene **exactamente 4 columnas**: `Criterio | Status | Weight | Score`. No añadas una 5ª columna `Justificación` a la tabla — las celdas deben quedar ≤50 chars.
- Las justificaciones van en **lista debajo de la tabla**, una por criterio (ver abajo).
- `Status` usa **texto**, no emojis: `Pass` / `Partial` / `Fail` (o `Sí` / `Parcial` / `No`). No uses `✅` / `⚠️` / `❌` — degradan legibilidad en terminales y no renderizan uniformemente.

**Justificaciones** (una por criterio, en lista debajo de la tabla):

- **Resultado claro**: Por qué este status
- **Alineación estratégica**: Por qué este status
- **Urgencia**: Por qué este status
- **Recursos básicos**: Por qué este status

**Recomendación**:
- **Proceder**: Todos los criterios afirmativos o mayoría afirmativos
- **Proceder condicional**: Algunos parciales, necesita aclaración
- **No proceder**: Criterios críticos negativos (resultado no claro, desalineado, no viable)

**Mapeo a Ready for** (refinado por la Fase G según preguntas abiertas):
- Proceder → `evaluar-alcance-idea` (avance libre, sin preguntas Críticas/Importantes sin resolver)
- Proceder condicional → `evaluar-alcance-idea (condicionado)` o `bloqueado` según severidad de preguntas abiertas
- No proceder → `bloqueado`

**Detección de `profile` (full / lite)**: además del veredicto, declara un campo `profile` que el orquestador (`orquestar-prd-workflow` Fase 0) consume para activar shortcuts lite. Criterios:

- `profile: lite` cuando **al menos 2** de:
  - dogfooding O internal tool (no producto externo)
  - 1-2 personas
  - greenfield (sin codebase de producto previo)
  - stage MVP con N=1 funcionalidad
- `profile: full` cuando:
  - producto externo, O
  - stage Growth/Scale, O
  - N>1 funcionalidades, O
  - requiere validación de demanda externa

El `profile` no reemplaza el veredicto (Proceder/Condicional/No proceder) — es una señal ortogonal sobre cuánta ceremonia aplica el workflow downstream. Un PRD puede ser `Proceder` con `profile: lite` (dogfooding) o `Proceder` con `profile: full` (producto externo Growth).

Para detalles completos de sistema de scoring, umbrales y customización por contexto, consultar el template.

## Fase F — Escribir Análisis Preliminar

Estructura:

1. **Declaración de resultado**: 1-2 frases del resultado deseado
2. **Validación de resultado**: Si es válido o necesita reformulación
3. **Alineación estratégica**: ¿Encaja con visión?
4. **Urgencia y momento**: ¿Por qué ahora?
5. **Disponibilidad de recursos**: Verificación básica de viabilidad
6. **Recomendación preliminar**: Proceder/Proceder condicional/No proceder con justificación
7. **Profile**: `full` o `lite` (con justificación — ver criterios en Fase E). El orquestador lo consume para activar shortcuts lite (stub RICE N=1, connectivity short-form, 1 persona, experiment-design omitido).
8. **Ready for**: `evaluar-alcance-idea`, `evaluar-alcance-idea (condicionado)` o `bloqueado`

## Fase G — Gate de Avance Condicionado (Preguntas Abiertas)

**Gate obligatorio.** Después de completar el análisis (Fases A–F) y antes de fijar el `Ready for` y escribir el documento final, ejecuta este gate. El documento **no está completo** hasta que Fase G se ejecuta y se documenta, incluso si todas las preguntas se resolvieron inline durante las Fases B/C/D.

**Principio**: Las preguntas abiertas no bloquean automáticamente el avance, pero el usuario debe ser alertado y tener la opción de responderlas antes de avanzar. El avance es **condicionado**, no automático. La alerta ocurre **antes de comenzar** la siguiente etapa (fijar el `Ready for` y avanzar a `evaluar-alcance-idea`), no después.

### Estados de avance

1. **Inventariar preguntas abiertas**: Reúne todas las preguntas generadas en las estrategias de fallo de las Fases B, C y D, clasificadas por severidad (Crítico / Importante / Menor). Incluye también las preguntas que se resolvieron inline durante el análisis — el inventario debe reflejar todo lo que se identificó, con su estado de resolución.

2. **Clasificar el estado de avance**:
   - **Avance bloqueado**: Hay preguntas Críticas sin resolver → `Ready for: bloqueado`
   - **Avance condicionado**: Hay preguntas Importantes sin resolver → `Ready for: evaluar-alcance-idea (condicionado)`. Alerta al usuario con el inventario; ofrece responder ahora o avanzar con default conservador.
   - **Avance libre**: Solo hay preguntas Menores o todas las Críticas/Importantes están resueltas → `Ready for: evaluar-alcance-idea`

3. **Documentar la ejecución del gate**: Con independencia del resultado, añade al documento una subsección "Gate de avance (Fase G)" que registre:
   - Inventario de preguntas identificadas (críticas/importantes/menores) con su estado (resuelta inline / resuelta en gate / pendiente).
   - Si hubo alerta: confirma que se presentó al usuario y qué decidió.
   - Estado final de avance (bloqueado / condicionado / libre) que justifica el `Ready for`.

### Reglas

- **Nunca** omitir la alerta cuando hay preguntas Críticas o Importantes sin resolver.
- **Nunca** marcar `Ready for: evaluar-alcance-idea` (libre) si hay preguntas Importantes o Críticas sin resolver.
- **Nunca** omitir la subsección "Gate de avance (Fase G)" del documento — es la evidencia de que el gate se ejecutó.
- Las preguntas Menores no requieren alerta ni condicionan el avance; se documentan para seguimiento.
- Si todas las preguntas se resolvieron inline durante B/C/D, el gate sigue documentándose (inventario con estado "resuelta inline", avance libre) — el gate no se omite, se registra como ejecutado sin alerta necesaria.

### Ejemplo canónico — Gate con todas resueltas inline

Cuando todas las preguntas se resolvieron inline durante B/C/D (caso más común en ideas bien formadas), la subsección "Gate de avance (Fase G)" del documento se ve así:

```markdown
## Gate de avance (Fase G)

- **Inventario de preguntas identificadas**:
  - [Importante] ¿El instalador debe ser agnóstico al agente destino? — Estado: resuelta inline
  - [Importante] ¿Cómo entregar las instructions al agente? — Estado: resuelta inline
  - [Menor] ¿Canal de publicación del paquete npm? — Estado: resuelta inline
- **Alerta al usuario**: No necesaria — todas las Críticas/Importantes se resolvieron inline durante el análisis.
- **Estado final de avance**: Libre — `Ready for: evaluar-alcance-idea`
```

Para el flujo detallado del gate (formato de alerta, manejo de respuestas del usuario, herencia de preguntas pendientes en el siguiente skill, best practices), consultar `assets/open-questions-template.md` sección "Integración con Ready For — Avance Condicionado".

## Salida

Escribe en (formato principal): `docs/<domain>/idea/<IDEA-SLUG>/idea-analysis.md` (subdirectorio)
Compatibilidad legacy: `docs/<domain>/idea/<IDEA-SLUG>-idea-analysis.md` (prefijo)

Para la estructura completa del artefacto (header requerido, secciones requeridas, convenciones de formato, nota opcional de relación con downstream, y valores de `Ready for` con links), usa el template en `assets/idea-analysis-template.md`.

**Resumen de secciones requeridas** (ver template para detalle):
- Header (incluyendo línea `Input:`)
- Resumen de la idea, Declaración de resultado, Validación de resultado
- Alineación estratégica, Urgencia y momento, Disponibilidad de recursos
- Recomendación preliminar, Fase F (observaciones de diseño)
- Gate de avance (Fase G) — **obligatoria** incluso si todas las preguntas se resolvieron inline
- Preguntas Abiertas (resueltas/pendientes), Checklist de salida, Ready for con link relativo

**Convenciones clave** (ver template para detalle):
- Sin emojis: usa `Pass`/`Partial`/`Fail` o `Sí`/`Parcial`/`No`
- Matriz de decisión: 4 columnas, justificaciones en lista debajo

### README del dominio (índice)

Como primer skill del Workflow 0, este skill es responsable de crear o actualizar el índice del dominio en `docs/<domain>/README.md`. La estructura requerida (título, puntos de entrada, árbol, convenciones) está especificada en `references/domain-readme-spec.md` — ese spec es compartido con otros skills del workflow que actualizan el README.

- **Si no existe**: créalo con la estructura completa del spec.
- **Si existe**: actualiza la tabla de "Puntos de entrada" con `idea/<IDEA-SLUG>/idea-analysis.md` y el árbol de estructura si hay nuevos archivos.

## Checklist de salida

Antes de marcar el skill como terminado, verifica cada ítem. Si alguno es "No", revisa y completa antes de terminar — el documento no está completo hasta que todos pasan.

### Contenido

1. Resultado definido sin mencionar solución
2. Resultado es medible u observable
3. Alineación estratégica evaluada correctamente
4. Urgencia justificada
5. Recursos básicos evaluados
6. Recomendación preliminar justificada
7. `Ready for` correcto según el estado de avance de la Fase G

### Formato (verificación de convenciones)

8. Header incluye línea `Input:` (no la omitas aunque el input sea texto libre del usuario)
9. Matriz de decisión tiene **exactamente 4 columnas** (`Criterio | Status | Weight | Score`) — sin 5ª columna `Justificación` en la tabla; las justificaciones van en lista debajo
10. `Status` usa **texto** (`Pass`/`Partial`/`Fail` o `Sí`/`Parcial`/`No`) — sin emojis (`✅`/`⚠️`/`❌`) en matriz, validación ni checklist de salida
11. Sección **"Gate de avance (Fase G)"** presente y documentada con inventario de preguntas, evidencia de alerta (si hubo) y estado final de avance — **obligatoria incluso si todas las preguntas se resolvieron inline**
12. `Ready for` incluye link relativo al siguiente artefacto

## Preguntas Abiertas

Usar template en `assets/open-questions-template.md` para documentar información faltante. El flujo de avance condicionado está definido en la **Fase G** y detallado en la sección "Integración con Ready For — Avance Condicionado" del template.

**Categorías comunes para este skill**:
- Si la visión/plan de trabajo de producto no está clara
- Si no hay información sobre fechas límite externas
- Si la disponibilidad de recursos es desconocida
- Si el resultado no puede definirse sin mencionar solución

Para estructura completa, severidad levels, flujo del gate de avance condicionado y best practices, consultar el template.

**Importante**: Las preguntas abiertas generadas en las estrategias de fallo de las Fases B, C y D alimentan directamente el gate de la Fase G. No se avanza al siguiente skill sin pasar por ese gate.
