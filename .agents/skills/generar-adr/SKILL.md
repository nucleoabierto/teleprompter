---
name: generar-adr
description: >-
  Genera Architecture Decision Records (ADRs) documentando decisiones
  arquitectónicas clave, alternativas consideradas y trade-offs. Salida:
  docs/<domain>/adr/<EPIC-SLUG>-*.md (un ADR por decisión). Úsalo cuando el
  usuario pida documentar, registrar o capturar decisiones arquitectónicas y
  su rationale. No lo usas para generar documentación arquitectónica visual
  (usar generar-arquitectura) ni para especificar requisitos técnicos (usar
  generar-trd).
---

# Generador de ADRs

Genera Architecture Decision Records (ADRs) para documentar decisiones arquitectónicas clave del epic. Captura el "por qué" detrás de cada decisión importante, alternativas consideradas, y trade-offs.

Solo documentación: no implementa. Úsalo como referencia para futuros cambios y onboarding del equipo.

## Fase 0 — Resolver entrada

Requerido: `EPIC-SLUG` o ruta del TRD del epic.

Infiere desde:
- Ruta: `docs/**/<EPIC-SLUG>-trd.md`
- Contenido pegado: si el usuario pega el TRD
- TRD previo: busca el archivo más reciente de `*-trd.md`

Pregunta cuando falta: "¿Para qué epic genero ADRs? (ruta de trd.md o epic slug)"

Declara inputs resueltos: epic, TRD leído.

## Fase A — Identificar Decisiones Clave

Lee el TRD e identifica decisiones arquitectónicas importantes:

**Categorías comunes**:
- **Diseño de datos**: "¿Tabla nueva o reutilizar existente?"
- **Autenticación/Autorización**: "¿JWT vs Session tokens?"
- **Comunicación**: "¿Sincrónica (REST) o asincrónica (queue)?"
- **Almacenamiento**: "¿Cache en Redis o DB?"
- **Servicios externos**: "¿Integración directa o adapter pattern?"
- **Feature flags**: "¿Gradual rollout o big bang?"
- **Testing**: "¿Mocks o test DB?"
- **Escalabilidad**: "¿Horizontal scaling o vertical?"

Extrae cada decisión que aparezca en el TRD (si el TRD menciona una elección, hay un ADR detrás).

**Tip**: Busca frases como:
- "Decidimos usar..."
- "En lugar de..."
- "Consideramos..."
- "Por motivos de..."

Genera 2-5 ADRs (si > 5, agrupa decisiones relacionadas).

## Fase B — Estructura de un ADR

Cada ADR sigue formato MADR (Markdown Architecture Decision Records).

Lee el template: `assets/madr-template.md`

El template incluye todas las secciones requeridas:
- Status (Accepted | Proposed | Deprecated | Superseded)
- Context (problema, restricciones, importancia)
- Decision (decisión tomada, imperativo y claro)
- Rationale (por qué es la mejor, criterios evaluados)
- Consequences (positivos y negativos)
- Alternatives Considered (opciones evaluadas y por qué se rechazaron)
- References (links a TRD, tareas, tests, configs)
- Related ADRs (ADRs relacionados)

## Fase C — Generar ADRs Específicos

Basándote en el TRD, crea un ADR para cada decisión importante:

**Ejemplo de decisiones típicas en un PRD**:

1. **ADR: Modelo de autenticación** (nueva, legacy, tercero)
2. **ADR: Diseño de schema** (normalización, particionamiento)
3. **ADR: API design** (REST vs GraphQL, versionamiento)
4. **ADR: Comunicación intra-servicio** (sincrónica vs async)
5. **ADR: Escalabilidad strategy** (caching, índices, sharding)

## Fase D — Validar ADRs contra TRD

Para cada ADR:
- ✅ ¿Está mencionada la decisión en el TRD?
- ✅ ¿Está clara la rationale (por qué)?
- ✅ ¿Se mencionan las alternativas?
- ✅ ¿Se documentan las consecuencias?
- ✅ ¿Se menciona cómo se implementa o valida?

Si algún ADR no puede justificarse desde el TRD → no lo incluyas (la decisión no es importante).

## Fase E — Crear Referencias Cruzadas

Actualiza referencias:

```
En el TRD, al lado de cada decisión, añade:
"[Ver ADR-XXX para la rationale de esta decisión]"

En el plan de tareas, al lado de cada tarea:
"Implementa ADR-XX"
```

Ejemplo:
- TRD: "Usamos JWT para tokens"
  → Agrega: "[Rationale: ver ADR-001-auth-mechanism]"
- Plan de tareas: "Crear endpoint POST /login"
  → Agrega: "Implementa ADR-001"

## Fase F — Escribir ADRs en Disco

Crea carpeta: `docs/<domain>/adr/`

Escribe cada ADR en archivo separado:
- `docs/<domain>/adr/ADR-001-<slug>.md`
- `docs/<domain>/adr/ADR-002-<slug>.md`
- etc.

Naming: `ADR-[número]-[slug-kebab-case]`

Ejemplo:
- `ADR-001-authentication-mechanism.md`
- `ADR-002-schema-normalization.md`
- `ADR-003-async-communication-strategy.md`

## Salida

**Secciones del skill**:

1. **Resumen del epic**: qué es, qué decisiones técnicas importan
2. **Decisiones identificadas**: lista de 2-5 decisiones clave con breve descripción
3. **ADRs generados**: cuerpo completo de cada ADR (Context, Decision, Rationale, Consequences, Alternatives)
4. **Índice de ADRs**: tabla con número, título, status, referencias a TRD y tareas
5. **Preguntas abiertas**: decisiones no resueltas, o ADRs que necesitan más thinking
6. **Ready for**: `tareas-listas` (listo para implementar) o `refine-adr` (algunos ADRs incompletos)

**Archivos creados**:
- `docs/<domain>/<EPIC-SLUG>-adr-summary.md` (índice y resumen)
- `docs/<domain>/adr/ADR-001-*.md` (cada ADR)
- `docs/<domain>/adr/ADR-002-*.md`
- etc.

Ready for valores:
- `implementation-ready`: Todos los ADRs documentados, listo para implementar
- `refine-adr`: Algunos ADRs incompletos o ambigüed, necesita thinking adicional
- `blocked`: No se puede generar ADRs sin clarificación del TRD

## Autoevaluación

Después de ejecutar este skill, verifica:

**Checklist de validación**:
- [ ] Se identificaron 2-5 decisiones arquitectónicas clave del TRD
- [ ] Cada decisión tiene un ADR separado con formato MADR completo
- [ ] Cada ADR incluye: Context, Decision, Rationale, Consequences, Alternatives Considered
- [ ] La rationale explica claramente el "por qué" de cada decisión
- [ ] Las alternativas consideradas están documentadas con razones de rechazo
- [ ] Las consecuencias (positivas y negativas) están explícitas
- [ ] Los ADRs están numerados consecutivamente (ADR-001, ADR-002, etc.)
- [ ] Los archivos se crearon en `docs/<domain>/adr/` con naming correcto
- [ ] Se creó el índice en `docs/<domain>/<EPIC-SLUG>-adr-summary.md`
- [ ] Las referencias cruzadas se añadieron al TRD (si aplica)

**Criterios de éxito**:
- Cada ADR es comprensible por un nuevo miembro del equipo sin contexto adicional
- Las decisiones están justificadas con criterios objetivos (tiempo, costo, riesgo, etc.)
- Las alternativas rechazadas tienen razones claras y específicas
- Los archivos siguen el formato MADR del template en `assets/madr-template.md`
- El índice permite navegar rápidamente a cualquier ADR

**Señales de alerta**:
- ADRs sin sección "Alternatives Considered" → probablemente la decisión no fue bien pensada
- Rationale vaga ("es mejor porque sí") → falta análisis real
- Más de 5 ADRs para un epic → considera agrupar decisiones relacionadas
- ADRs sin consecuencias negativas documentadas → probablemente incompleto
