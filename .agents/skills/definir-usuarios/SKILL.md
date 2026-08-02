---
name: definir-usuarios
description: >-
  Define user personas primarias y secundarias para un requerimiento, usando
  personas canónicas compartidas a nivel dominio. Crea personas canónicas en
  docs/<domain>/personas/ (una por archivo) si no existen, y un mapeo en
  docs/<domain>/initiatives/<PRD-SLUG>/personas-mapping.md que referencia las
  personas canónicas con su rol específico en el PRD. Úsalo después de validar
  viabilidad para entender quién usará la feature.
---

# Definidor de Usuarios

Define user personas en detalle: motivaciones, pain points, comportamientos, contexto. Transforma audiencia abstracta en personas concretas.

Solo documentación: no valida, no diseña. Define a quiénes servimos.

## Fase 0 — Resolver entrada

Requerido: `REQ-SLUG` o `VIABILITY-RUTA`.

Infiere desde:
- Ruta: `docs/**/initiatives/**/product-viability.md`
- Contenido pegado: si usuario pega validación de viabilidad
- Requerimiento previo: busca archivo más reciente

Pregunta cuando falta: "¿Qué requerimiento? (ruta o slug)"

Declara inputs resueltos: requerimiento, audiencia identificada.

## Fase 0.5 — Verificar Personas Canónicas Existentes

Antes de definir nuevas personas, verifica si ya existen personas canónicas para este dominio:

1. Busca `docs/<domain>/personas/` (carpeta de personas canónicas)
2. Si existe, lee `docs/<domain>/personas/README.md` para ver el índice
3. Lee cada archivo `<persona>.md` para entender las personas existentes

IF Personas canónicas existen Y cubren la audiencia del requerimiento:
  → Reutiliza las personas existentes
  → Solo crea `personas-mapping.md` (Fase F) con el mapeo a este PRD
  → Omite Fases B, C, D (definición de personas)

IF Personas canónicas NO existen O no cubren la audiencia:
  → Ejecuta Fases B, C, D para definir nuevas personas canónicas
  → Crea los archivos en `docs/<domain>/personas/`
  → Luego crea `personas-mapping.md` (Fase F)

## Fase A — Analizar Audiencia Identificada

Del requerimiento, extrae:
- **Usuarios primarios**: Quién sufre el problema más
- **Usuarios secundarios**: Quién se beneficia indirectamente
- **Actores internos**: Soporte, ventas, product, etc.

Para cada segmento, preguntar:
- ¿Quiénes son específicamente?
- ¿Qué los define? (edad, rol, nivel técnico, etc.)
- ¿Cuántos son aproximadamente?
- ¿Qué motivaciones tienen?

## Fase B — Definir Personas Primarias (2-3 máximo)

**Path lite (profile=lite)**: si `idea-analysis.md` declara `profile: lite` (dogfooding/internal tool/1-2 personas/greenfield/MVP N=1), define **1 persona primaria** (el dogfooder/usuario interno principal) en vez de 2-3. Añade 0-1 secundaria solo si hay un rol distinto claro (ej: agent operator en un CLI de agente IA). 3 personas para un MVP de 1-2 devs dogfooding es ceremonia desproporcionada. Si `profile: full`, usa la regla de 2-3 personas.

Cada persona se escribe como un archivo canónico individual en
`docs/<domain>/personas/<persona-slug>.md`.

Estructura de cada archivo canónico:

```markdown
# Persona: [Nombre]

- **Dominio**: <domain>
- **Tipo**: Primaria | Secundaria
- **Fecha**: YYYY-MM-DD
- **Skill**: definir-usuarios

## Datos demográficos
[edad, rol, experiencia, contexto]

## Motivación Principal
[1 oración]

## Pain Points (top 3)
1. ...
2. ...
3. ...

## Comportamiento Actual
[cómo resuelve el problema hoy]

## Necesidad que Resuelve
[cómo cambiaría su trabajo]

## Contexto de Uso
[dónde, cuándo, dispositivos]
```

Ejemplo de contenido para una persona primaria:

```
## Datos demográficos
- Edad/Rango: 25-35
- Rol/Título: Product Manager
- Experiencia: 5 años PM, tech-savvy
- Contexto: Startup 50 personas, ágil

## Motivación Principal
María quiere reducir el tiempo que tarda en descubrir
oportunidades de engagement para no perder clientes.

## Pain Points (top 3)
1. No recibe alertas de cambios importantes en su cuenta
2. Chequea manualmente cada mañana (5 min/día, 25 min/semana)
3. Se pierde oportunidades time-sensitive

## Comportamiento Actual
- Chequea inbox cada 30 min (distracción)
- Usa calendarios/reminders manuales
- Pierde 10-15% de oportunidades

## Necesidad que Resuelve
- Recibe alertas instant → reduce tiempo 25 min/semana
- Menos ansiedad (no pierde oportunidades)
- Mejor focus en trabajo importante

## Contexto de Uso
- Web: durante trabajo (90%)
- Mobile: en camino entre reuniones (5%)
- Email: resumen diario (5%)
```

## Fase C — Definir Personas Secundarias

Cada persona secundaria también se escribe como un archivo canónico individual
en `docs/<domain>/personas/<persona-slug>.md`, usando el mismo template de la
Fase B pero con contenido abreviado:

```markdown
# Persona: [Nombre]

- **Dominio**: <domain>
- **Tipo**: Secundaria
- **Fecha**: YYYY-MM-DD
- **Skill**: definir-usuarios

## Datos demográficos
[rol, contexto breve]

## Motivación Principal
[Qué quiere lograr, 1 oración]

## Pain Points (top 3)
1. ...
2. ...

## Comportamiento Actual
[cómo resuelve el problema hoy]

## Necesidad que Resuelve
[cómo cambiaría su trabajo]

## Contexto de Uso
[dónde, cuándo, dispositivos]

## Conexión con Primaria
[Cómo se relaciona con la persona primaria]
```

Ejemplo:

```
## Datos demográficos
- Rol: Customer Support Agent

## Motivación Principal
Resolver tickets más rápido sin llamadas repetidas.

## Pain Points (top 3)
1. Usuarios no saben su estado (30% de tickets)
2. Espera setup manual (15 min por user)

## Conexión con Primaria
Si usuarios reciben notificaciones, CS no necesita explicar.
```

## Fase D — Mapear Contexto de Producto

Considerar estado del producto:

```
### Contexto: Estado del Producto & Usuarios

**MVP (<1000 users)**:
- Usuarios: Early adopters, tech-savvy
- Comportamiento: Exploración, tolerance alto a bugs
- Canales: In-app primarily, email secondary
- Feedback: Direct interviews, qualitative
- Testing: Surveys + signup metrics (NO A/B tests)

**Growth (1K-10K users)**:
- Usuarios: Early adopters + pragmatists
- Comportamiento: Feature exploration, workflow established
- Canales: Multi-channel (web, mobile, email)
- Feedback: Surveys, telemetría, support tickets
- Testing: A/B landing pages para risky features

**Scale (10K+ users)**:
- Usuarios: Pragmatists + laggards
- Comportamiento: Established workflows, learning curve sensitive
- Canales: Full omnichannel
- Feedback: Analytics, NPS, surveys
- Testing: A/B tests en-app, cohort analysis

**Implicación para Personas**:
Si MVP: personas son tech-early-adopters
Si Growth: personas son mezcla, incluir pragmatists
Si Scale: agregar personas de laggards también
```

## Fase E — Validar Personas

Checklist:
- ✅ ¿Cada persona tiene motivación clara?
- ✅ ¿Pain points son específicos (no genéricos)?
- ✅ ¿Comportamiento actual documentado?
- ✅ ¿Contexto de producto considerado?
- ✅ ¿Primarias vs secundarias diferenciadas?
- ✅ ¿Número de personas apropiado al profile? (profile=full: 2-3; profile=lite: 1 primaria + 0-1 secundaria)

## Fase E.5 — Crear/Actualizar Índice de Personas Canónicas

Genera o actualiza: `docs/<domain>/personas/README.md`

Secciones requeridas:
- Título: "Personas del dominio `<domain>`"
- Stage del producto (MVP/Growth/Scale)
- Fuente original (iniciativa que las definió)
- Resumen de las personas del dominio
- Tabla comparativa: | Persona | Tipo | Rol | Archivo |
- Estado del producto y contexto
- Diferencias entre personas (tabla comparativa por aspecto)
- Hipótesis de adopción (a nivel dominio, no por iniciativa)
- Mapeo a iniciativas (qué PRDs usan cada persona)

## Fase F — Escribir Mapeo de Personas

Escribe en: `docs/<domain>/initiatives/<PRD-SLUG>/personas-mapping.md`

Este archivo es un PUNTERO a las personas canónicas, NO una redefinición.

Estructura:
1. Header con metadata (req slug, dominio, fecha, skill, input, stage)
2. Referencia a personas canónicas: `> Personas canónicas: docs/<domain>/personas/`
3. Tabla de aplicación al PRD: | Persona | Tipo en este PRD | Rol en este PRD | Archivo |
   - Usar links relativos: `[gil.md](../../personas/gil.md)`
4. Notas específicas del PRD (si hay variaciones de rol/comportamiento por PRD)
5. Ready for: mapear-casos-uso

## Salida

Escribe en:
- `docs/<domain>/personas/<persona-slug>.md` (una por persona canónica, si son nuevas)
- `docs/<domain>/personas/README.md` (índice de personas canónicas, crear o actualizar)
- `docs/<domain>/initiatives/<PRD-SLUG>/personas-mapping.md` (mapeo a este PRD)

**Secciones requeridas en `personas-mapping.md`**:
- Header con metadata (req slug, dominio, fecha, skill, input, stage)
- Referencia a personas canónicas
- Tabla de aplicación al PRD (persona, tipo, rol, archivo)
- Notas específicas del PRD (si aplica)
- Ready for (`mapear-casos-uso`, `blocked`)

Ready for valores:
- `mapear-casos-uso`: Personas definidas, proceder a casos de uso
- `blocked`: Personas insuficientemente claras, necesita más research

---

## Ejemplo Completo

### Archivos canónicos

`docs/notifications/personas/maria-pm.md`:

```markdown
# Persona: María (Early Adopter)

- **Dominio**: notifications
- **Tipo**: Primaria
- **Fecha**: 2025-01-15
- **Skill**: definir-usuarios

## Datos demográficos
- Edad: 28, Product Manager en SaaS
- Experiencia: 5 años PM, tech-savvy
- Contexto: Startup 50 personas, ágil

## Motivación Principal
Maximizar engagement de usuarios para retención y NRR.

## Pain Points (top 3)
1. No sabe qué usuarios se están yendo (churn signal bajo)
2. Chequea manualmente cada 30 min (context switching)
3. Pierde oportunidades de re-engage (5-10% más churn)

## Comportamiento Actual
- Chequea inbox, chat, analytics constantemente
- Usa calendar reminders manuales
- Escala manualmente a CS cuando detecta issue

## Necesidad que Resuelve
Alertas automáticas sobre usuarios inactivos o de riesgo
→ Reducir context switching 30 min/día
→ Proactive retention +5-10%

## Contexto de Uso
- Web (desktop): 80% durante trabajo
- Mobile: 10% en transit
- Email digest: 10% revisión noche anterior
```

`docs/notifications/personas/joao-cs.md`:

```markdown
# Persona: João (Pragmatist)

- **Dominio**: notifications
- **Tipo**: Primaria
- **Fecha**: 2025-01-15
- **Skill**: definir-usuarios

## Datos demográficos
- Edad: 42, Head of Customer Success
- Experiencia: 15 años CS, moderate tech
- Contexto: Mid-market, 200+ clientes

## Motivación Principal
Eficiencia en soporte sin faltar a SLAs.

## Pain Points (top 3)
1. 30% de tickets son questions sobre status (resuelven fácil)
2. Usuario churn porque no conocen features
3. Team sobreextendido (6 agents, 200 clientes)

## Comportamiento Actual
- Responde tickets manualmente uno por uno
- Setup de usuarios requiere 15 min cada uno

## Necesidad que Resuelve
Usuarios auto-informados mediante notificaciones
→ Reduce tickets 15-20%
→ Team puede focus en complex issues

## Contexto de Uso
- Web (desktop): 90% durante trabajo
- Email: resumen diario de tickets
```

### Índice de personas canónicas

`docs/notifications/personas/README.md` (extracto):

```markdown
# Personas del dominio `notifications`

- **Stage**: Growth (3K activos, creciendo 20%/mes)
- **Fuente original**: PRD-sistema-notificaciones

## Resumen
Dos personas primarias cubren la audiencia: María (PM early adopter)
y João (Head of CS pragmatist).

## Tabla comparativa

| Persona | Tipo | Rol | Archivo |
|---------|------|-----|---------|
| María | Primaria | Product Manager | [maria-pm.md](maria-pm.md) |
| João | Primaria | Head of Customer Success | [joao-cs.md](joao-cs.md) |

## Diferencias entre personas

| Aspecto | María | João |
|---------|-------|------|
| Adopción | Rápida (day 1) | Gradual (semana 1-2) |
| Canales | Push + web | Email mainly |
| Frecuencia | Multiple daily | Daily digest |
| Pain driver | Oportunidad loss | Cost/efficiency |

## Hipótesis de adopción
María adopta primero (early adopter), João después (pragmatist)
cuando ve reduction en tickets.

## Mapeo a iniciativas

| Persona | Iniciativas |
|---------|-------------|
| María | PRD-sistema-notificaciones, PRD-alertas-riesgo |
| João | PRD-sistema-notificaciones |
```

### Mapeo en la iniciativa

`docs/notifications/initiatives/PRD-sistema-notificaciones/personas-mapping.md`:

```markdown
# Mapeo de Personas: PRD-sistema-notificaciones

- **Req slug**: PRD-sistema-notificaciones
- **Dominio**: notifications
- **Fecha**: 2025-01-15
- **Skill**: definir-usuarios
- **Input**: product-viability.md
- **Stage**: Growth

> Personas canónicas: docs/notifications/personas/

## Aplicación al PRD

| Persona | Tipo en este PRD | Rol en este PRD | Archivo |
|---------|------------------|-----------------|---------|
| María | Primaria | Define alertas y reglas de engagement | [maria-pm.md](../../personas/maria-pm.md) |
| João | Primaria | Consumidor de reducción de tickets | [joao-cs.md](../../personas/joao-cs.md) |

## Notas específicas del PRD
- María configura las alertas; João las consume indirectamente
- En este PRD, João es primario porque el ROI se mide en tickets reducidos

**Ready for**: mapear-casos-uso
```
