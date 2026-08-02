---
name: mapear-casos-uso
description: >-
  Mapea casos de uso concretos para cada persona. Define: happy path,
  alternativa paths, edge cases, precondiciones y postcondiciones. Salida:
  docs/<domain>/initiatives/<PRD-SLUG>/use-cases.md con matriz de casos y
  flujos. Úsalo después de definir usuarios para entender workflows
  específicos.
---

# Mapeador de Casos de Uso

Mapea casos de uso concretos para cada persona. Define flujos: happy path, alternativas, edge cases. Transforma personas en workflows específicos.

Solo documentación: no diseña, no decide. Mapea usos reales.

## Fase 0 — Resolver entrada

Requerido: `REQ-SLUG` o `PERSONAS-RUTA`.

Infiere desde:
- Ruta: `docs/**/initiatives/**/personas-mapping.md` (preferido) o `docs/**/initiatives/**/personas.md` (legacy)
- Ruta: `docs/**/initiatives/**/personas-mapping.md`
- Contenido pegado: si usuario pega definición de personas
- Previo: busca archivo más reciente de `*-personas-mapping.md` o `*-personas.md`

Pregunta cuando falta: "¿Qué requerimiento? (ruta o slug)"

Declara inputs resueltos: requerimiento, personas leídas.

## Fase A — Analizar Personas y Pain Points

Para cada persona primaria, preguntar:
- ¿Qué tareas principales hace hoy? (workflow actual)
- ¿Dónde ocurren fricción/pain points?
- ¿Cómo la feature resolvería el workflow?

## Fase B — Mapear Happy Path por Persona

Happy path = camino ideal, sin errores.

```
### Persona: María - Happy Path

**Trigger**: Usuario inactivo por 7+ días sin engagarse

**Precondiciones**:
- Sistema detectó inactividad (telemetría configured)
- Notificación rule activa para "inactive user"
- User preferencias allow push notifications

**Paso a Paso**:
1. Sistema detecta María no logeó en 7 días
2. Sistema chequea user engagement metrics
3. Sistema genera alert: "User at risk: João inactivo"
4. Push notification enviado a María's phone: "1 user inactive - revisit"
5. María ve notificación, tap → app abre user dashboard
6. María ve João inactivo, cliquea "send re-engage email"
7. Sistema envia email a João con oportunidades
8. (Days later) João loguea, re-engages
9. Sistema marques María's alert como "resolved"

**Postcondiciones**:
- Alert resuelto
- João re-engaged (métrica tracks)
- María sabe qué pasó

**Metrics**:
- Time-to-notification: < 5 min
- Time-to-action: < 30 min
- Re-engagement rate: > 30%
```

## Fase C — Mapear Paths Alternativos

Variaciones del happy path:

```
### Persona: María - Alternative Paths

**Path 1: Notification preferences**
- María recibe notificación pero prefer email
- Sistema respeta preferencia, envia email instead
- Result: Same outcome, different channel

**Path 2: Alert fatigue**
- María recibe 3 alerts en 1 hora (too many)
- Sistema batches next 3 alerts into 1 digest
- Result: María no overwhelmed

**Path 3: Already engaged**
- Alert says "User at risk" pero user just logged in
- System fetches latest data
- Result: Alert auto-resolves, María no notified (false positive avoided)

**Path 4: Manual snooze**
- María vé alert pero not ready to action
- Clicks "snooze 1 day"
- Result: Alert reappears tomorrow

Mapeo:
| Caso | Trigger | Resultado | Probabilidad |
|------|---------|-----------|--------------|
| Happy | Detects + notifies + acts | Re-engaged | 60% |
| Alt 1 | Prefers email | Email sent | 20% |
| Alt 2 | Multiple alerts | Batched | 10% |
| Alt 3 | Already engaged | Dismissed auto | 5% |
| Alt 4 | Snoozed | Reappears later | 15% |
```

## Fase D — Mapear Edge Cases y Error Paths

Qué pasa cuando algo sale mal:

```
### Edge Cases / Error Paths

**Edge 1: User deleted**
- Precondición: Alert triggered para deleted user
- Resultado: Alert safely skipped, no error
- Handling: Check user existence before sending

**Edge 2: Notification service down**
- Precondición: Push notification fails
- Resultado: Fallback to email or in-app bell
- Handling: Retry logic + alternative channel

**Edge 3: Data stale**
- Precondición: Metrics data 24h old
- Resultado: Alert might be inaccurate
- Handling: Refresh data before alert, o marcar como "last checked"

**Edge 4: Alert storm**
- Precondición: 100 users inactivo simultaneously
- Resultado: System overload
- Handling: Queue alerts, distribute over time

**Edge 5: User unsubscribed**
- Precondición: User turned off all notifications
- Resultado: Alert respects preference, not sent
- Handling: Check subscription status before sending
```

## Fase E — Mapear Casos de Uso de Actores Secundarios

Si aplica (CS, Support, etc.):

```
### Persona: João (CS Agent) - Happy Path

**Trigger**: Customer about to churn

**Precondición**:
- CS agent reviewing dashboard
- Notification bell shows "User X at risk: inactive 14 days"

**Paso a Paso**:
1. João ve notification of at-risk user
2. João clicks para ver details
3. João reviews user's engagement history
4. João clicks "send automated re-engage flow" or "schedule call"
5. System respects choice, actúa
6. João marks alert as "in progress" or "resolved"

**Postcondiciones**:
- User either re-engaged or churned (known)
- CS focus on other priorities
```

## Fase F — Crear Matriz de Casos de Uso

Tabla consolidada (usa IDs UC1, UC2, ... para trazabilidad):

```
## Matriz de Casos de Uso

| ID | Persona | Trigger | Precondiciones | Happy Path | Edge Cases | Success Metric | Measurement | Éxito? |
|----|---------|---------|----------------|-----------|-----------|----------------|-------------|--------|
| UC1 | María | Inactividad 7d | Telemetry OK | Alert→Action→Reeng | Stale data, deleted user | 30%+ re-engagement | telemetría | 60%+ |
| UC2 | María | Multiple alerts | >3 in 1h | Batch digest | Rate limiting OK | No se siente abrumada (encuesta) | survey | 50%+ |
| UC3 | João | At-risk user | Dashboard open | View→Action→Track | User churned before action | Tickets -15% | telemetría | 40%+ |
| UC4 | Admin | Monitor health | Dashboard | See alerts statistics | System down | N/A | no-medible-en-MVP | N/A |
```

### Gate de métrica medible (Fase F)

**Cada success metric debe declarar un campo `measurement`** con uno de estos valores:

- `telemetría` — medición automática vía instrumentación del producto. Threshold numérico firme permitido (ej: "30%+ re-engagement").
- `survey` — medición vía encuesta post-interacción. Threshold **cualitativo** (ej: "Gil reporta 0 pérdidas en 2 semanas de uso"), no numérico firme.
- `auto-reporte` — medición vía auto-reporte del usuario en conversación/entrevista. Threshold **cualitativo**.
- `manual` — medición vía cronometraje/observación manual. Threshold **cualitativo** (ej: "teammate reporta < 5 min en encuesta post-onboarding").
- `no-medible-en-MVP` — la métrica no se puede medir en el stage MVP. Se marca como "observación post-MVP" y **no cuenta para Go/No-Go** del PRD.

**Reglas**:
- Si `measurement ∈ {survey, auto-reporte, manual}` → el threshold debe ser cualitativo, no numérico firme. Un threshold como "0 customizaciones perdidas" sin plan de medición es inválido; reformular como "Gil reporta 0 pérdidas en 2 semanas de uso" (`auto-reporte`).
- Si `measurement = no-medible-en-MVP` → la métrica se documenta como observación post-MVP y se excluye de los criterios Go/No-Go del PRD.
- Si no puedes declarar un `measurement` creíble para una métrica → marcarla `no-medible-en-MVP` o reformular la métrica. No dejar métricas con threshold numérico firme sin plan de medición.

**Criterio de éxito**: ¿Qué métrica determina si use case is working? (con `measurement` declarado)
- UC1: 30%+ re-engagement rate (`telemetría`)
- UC2: User satisfaction — "no se siente abrumada" (`survey`)
- UC3: CS efficiency — tickets reduced 15% (`telemetría`)

## Fase G — Escribir Mapeo de Casos de Uso

Estructura:

1. **Resumen ejecutivo**: # casos, personas cubiertas, lista de casos de uso identificados (UC1, UC2, ... con persona y trigger)
2. **Happy path por persona**: Flujo ideal paso a paso (con ID UC)
3. **Alternative paths**: Variaciones comunes (referenciando ID UC)
4. **Edge cases y errores**: Qué pasa si algo falla (referenciando ID UC)
5. **Actores secundarios**: CS, Support, Admin si aplica
6. **Matriz de casos**: Tabla estructurada con columnas fijas (ID, Persona, Trigger, Precondiciones, Happy Path, Edge Cases, Success Metric, Measurement, Éxito?) y success metrics con campo `measurement` declarado por métrica (ver gate de métrica medible en Fase F)
7. **Completitud**: ¿Todos los workflows cubiertos?
8. **Ready for**: `disenar-experimentos` (stage Growth/Scale) | `generar-prd` (stage MVP, con stub de omisión de `disenar-experimentos`) — con ruta relativa del siguiente artefacto. La condicionalidad se resuelve leyendo el stage desde `personas-mapping.md` o `product-viability.md` (campo stage del PRD); si no se puede determinar, alertar al usuario.

## Salida

Escribe en: `docs/<domain>/initiatives/<PRD-SLUG>/use-cases.md`

**Header requerido** (al inicio del documento):
- Req slug
- Dominio
- Fecha
- Skill: mapear-casos-uso
- Input: ruta del artefacto fuente (personas-mapping.md o personas.md legacy)

**Secciones requeridas**:
- Header requerido
- Resumen ejecutivo: lista de casos de uso identificados (UC1, UC2, ... con persona y trigger)
- Happy path por cada persona primaria (paso a paso)
- Alternative paths (por persona)
- Edge cases y error handling
- Actores secundarios (si aplica)
- Matriz de casos de uso (tabla estructurada con success metrics y campo `measurement` por métrica)
- Completitud check
- Autoevaluación (checklist de validación) — incluye gate de métrica medible
- Ready for (`disenar-experimentos` si stage Growth/Scale, `generar-prd` si stage MVP con stub de omisión, `blocked`)

**IDs de casos de uso**:
Asigna identificadores únicos a cada caso de uso: UC1, UC2, UC3, etc. Usa el mismo ID en el happy path, alternative paths, edge cases y la matriz consolidada para trazabilidad.

**Matriz de casos de uso (tabla estructurada)**:
Prescribe una tabla con columnas fijas:

| ID | Persona | Trigger | Precondiciones | Happy Path | Edge Cases | Success Metric | Measurement | Éxito? |
|----|---------|---------|----------------|-----------|-----------|----------------|-------------|--------|
| UC1 | ... | ... | ... | ... | ... | ... | telemetría/survey/auto-reporte/manual/no-medible-en-MVP | ... |
| UC2 | ... | ... | ... | ... | ... | ... | ... | ... |

**Autoevaluación (checklist de validación)**:
- [ ] Cada caso de uso tiene ID único (UC1, UC2, ...)
- [ ] Happy path definido paso a paso por cada persona primaria
- [ ] Alternative paths mapeados por persona
- [ ] Edge cases y error handling cubiertos
- [ ] Actores secundarios mapeados (si aplica)
- [ ] Matriz de casos de uso en tabla estructurada con success metrics
- [ ] **Métrica medible**: toda success metric tiene campo `measurement` declarado (telemetría / survey / auto-reporte / manual / no-medible-en-MVP)
- [ ] **Métrica medible**: las métricas con `measurement ∈ {survey, auto-reporte, manual}` tienen thresholds cualitativos (no numéricos firmes sin plan de medición)
- [ ] **Métrica medible**: las métricas `no-medible-en-MVP` se marcan como observación post-MVP y se excluyen de Go/No-Go
- [ ] Precondiciones y postcondiciones explícitas
- [ ] Ready for definido correctamente
- [ ] Documento de salida accionable

Ready for valores:
- `disenar-experimentos`: Casos de uso mapeados y stage del PRD es Growth/Scale (data suficiente para A/B testing). Proceder al diseño riguroso del experimento antes del PRD.
- `generar-prd`: Casos de uso mapeados y stage del PRD es MVP (A/B no apropiado). Se omite `disenar-experimentos` con un stub `experiment-design.md` con veredicto "Omitido por stage MVP" para preservar trazabilidad.
- `blocked`: Workflows no claros o incompletos, aclarar primero

**Resolución del stage**: Antes de fijar el `Ready for`, lee el stage del PRD desde `docs/<domain>/initiatives/<PRD-SLUG>/personas-mapping.md` (campo stage) o `docs/<domain>/initiatives/<PRD-SLUG>/product-viability.md`. Si el stage no puede determinarse, alerta al usuario y pide confirmación antes de elegir la rama.

En la sección Ready for, incluye la ruta relativa del siguiente artefacto esperado (ej: `docs/<domain>/initiatives/<PRD-SLUG>/experiment-design.md` para Growth/Scale, o `docs/<domain>/initiatives/<PRD-SLUG>/prd.md` para MVP).

---

## Ejemplo Completo: Sistema Notificaciones

```markdown
# Use Cases: Sistema de Notificaciones

## UC1: María Receives Alert (Happy Path)

**Precondiciones**:
- User inactividad detector activo
- María permitió push notifications
- Sistema tiene datos de engagament

**Flujo**:
1. Sistema detecta user inactivo 7+ days
2. Alert rule triggered: "inactive_user_7d"
3. Notificación envia a María's device: "User João inactivo - revisit"
4. María tap notificación
5. App abre user detail page para João
6. María ve: "Last login: 7 days ago", engagement score: low
7. María clicks "send re-engage flow"
8. Sistema envia automated email a João
9. Sistema track: alert marked as "actioned"

**Postcondiciones**:
- Alert resolved (manual action)
- Email sent to user
- María informed

**Success Metric**: 30%+ users re-engaged within 7 days

---

## UC2: Alert Batching (Alternative Path)

**Trigger**: María receives 5 inactivity alerts in 1 hour

**Precondiciones**: Alert batching rule: "max 1 alert per hour"

**Flujo**:
1. Sistema detecta 5 inactivity alerts queued
2. Sistema batches: "5 users inactivo today - need attention?"
3. Notificación enviada (1 alert instead of 5)
4. María decides how many to action

**Success Metric**: User satisfaction (not overwhelmed)

---

## Edge Case: User Already Re-engaged

**Trigger**: Alert says "inactivo" pero user just logged in

**Precondiciones**: Alert queued but data stale (2h old)

**Handling**:
1. Before sending alert, check current user status
2. If user logged in recently, skip alert
3. Result: False positive avoided

**Success Metric**: 0% false positive alerts
```
