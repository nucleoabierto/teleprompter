---
name: implementar-ticket
description: >-
  Orquesta el pipeline completo para implementar un ticket del repositorio,
  encadenando los skills de revisión, brief, triage, planificación,
  implementación, verificación y revisión de PR. Escribe artefactos puntuados
  en disco o los entrega en chat. No hace push a menos que se le pida. Úsalo
  cuando el usuario pida implementar un ticket de extremo a extremo siguiendo
  el proceso del repo, o reanudar trabajo de ticket con artefactos parciales —
  a menos que un plan de implementación puntuado (≥9, Ready for=implement) ya
  exista en disco. No para revisión de PR.
---

# Orquestar implementación de ticket

Ejecuta el workflow de extremo a extremo para un ticket invocando los skills hijos en orden. Delega cada fase a un agente hijo que lee y sigue el archivo `SKILL.md` vinculado.

`<skills-root>` es el directorio cuyos subcarpetas contienen un `SKILL.md` (en este repo, `.devin/skills/`). Las rutas a continuación son relativas a `<skills-root>/`.

Eres el orquestador. Pasa rutas de artefactos y puntuaciones entre fases. Ejecuta cada `SKILL.md` hijo en secuencia; espera el handoff antes de iniciar el siguiente paso. Si una puerta retorna `blocked` o `refine`, detente y pregunta cómo proceder a menos que el usuario anule. No hagas push ni publiques sin la finalización del skill hijo y la aprobación explícita del usuario.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas compartida |
| [workflow-catalog.md](references/workflow-catalog.md) | Cadenas de skills y rutas de artefactos |

## Fase 0 — Resolver entradas

Requerido: `TICKET-SLUG`. Opcional: artefactos de workflow existentes en disco para reanudar.

Resuelve `TICKET-SLUG` siguiendo [file-discovery.md](references/file-discovery.md). Escanea `docs/**/<TICKET-SLUG>-*.md` para detectar artefactos existentes y aplica las reglas de resume flags:

- **`…-revisando-ticket.md`**: Saltar Fase 1 — `revisar-ticket` si Puntuación ≥ 9 y Ready for ∉ {`blocked`, `refine`}, a menos que el usuario pida rehacer
- **`…-research-brief.md`**: Saltar Fase 2 — `generar-brief-contexto` si Puntuación ≥ 9, a menos que la revisión Ready for requiera un brief fresco
- **`…-ticket-work-triage.md`**: Saltar Fase 3 — `clasificar-tareas` si Puntuación ≥ 9, a menos que el alcance sea grande o difuso
- **`…-implementation-plan.md`**: Saltar Fase 4 — `planificar-implementacion` si Puntuación ≥ 9 y Ready for = `implement`, a menos que el usuario pide replanificar
- **`…-implementation-report.md`**: Saltar Fase 6 — `implementar-plan` si Puntuación ≥ 9 y Ready for = `revisar-cambios-locales`, a menos que el usuario pide reimplementar

Declara las entradas resueltas, qué fases se ejecutarán o saltarán y por qué. Luego inicia la Fase 1 o la primera fase no saltada.

## Resumen del workflow

```text
Fase 1  revisando-ticket                    →  …-revisando-ticket.md
          │ puerta: blocked | refine → DETENER (preguntar usuario)
Fase 2  generando-brief-contexto                    →  …-research-brief.md
Fase 3  clasificando-tareas                     →  …-ticket-work-triage.md
          │ puerta: spike | demo | resolve-questions → skill de rama, luego reanudar o DETENER
Fase 4  planificando-implementacion           →  …-implementation-plan.md
          │ puerta: Ready for ≠ implement → DETENER o rama
Fase 5  understanding-quiz (opcional)    →  chat-only
Fase 6  implementando-plan                      →  …-implementation-report.md + cambios locales
Fase 7  verificación (lint/typecheck/test) →  resultados en chat
Fase 8  PR y revisión (opcional)         →  PR + review
```

## Protocolo de delegación

Para cada fase, delega a un agente hijo cuando el host soporte delegación de subagentes:

1. El agente hijo lee el `SKILL.md` completo en la ruta de la tabla antes de actuar.
2. El agente hijo ejecuta solo las fases de ese skill y no inicia el siguiente paso del workflow.
3. El agente hijo termina su mensaje final con este bloque de handoff:

```markdown
## Handoff — <nombre-fase>
- TICKET-SLUG: …
- Artefacto: <ruta o "none">
- Puntuación: <N>/10 o n/a
- Ready for / Siguiente paso: <valor del menú del skill>
- Bloqueadores: <lista o "none">
- Resumen: <2–4 oraciones>
```

### Perfil de delegación por fase

Cuando el host soporte elegir un perfil de delegación, prefiere:

- **Fase 1**: `<skills-root>/revisando-ticket/SKILL.md` → analysis / general (Revisión de ticket)
- **Fase 2**: `<skills-root>/generando-brief-contexto/SKILL.md` → explore / research (Investigación amplia del repo)
- **Fase 3**: `<skills-root>/clasificando-tareas/SKILL.md` → analysis / general (Clasificación solo)
- **Fase 4**: `<skills-root>/planificando-implementacion/SKILL.md` → analysis / general (Plan doc solo)
- **Fase 5**: `<skills-root>/understanding-quiz/SKILL.md` → analysis / general (Chat-only)
- **Fase 6**: `<skills-root>/implementando-plan/SKILL.md` → implementation / general (Puede ejecutar shell para validación)
- **Fase 7**: (inline) → implementation / general (Ejecuta comandos de AGENTS.md, reporta resultados)

En hosts sin delegación de subagentes, ejecuta cada `SKILL.md` hijo inline en la misma sesión. Ejecuta las fases secuencialmente; incluso cuando el host soporte subagentes paralelos, espera cada handoff hijo antes de iniciar el siguiente paso.

Usa esta plantilla de prompt para cada fase delegada:

```text
Estás ejecutando una fase de implement-ticket.

TICKET-SLUG: <ID>
Artefactos previos: <lista rutas de handoffs previos>

1. Lee y sigue exactamente: <ruta absoluta o relativa al repo del SKILL.md>
2. Escribe el artefacto de salida del skill en la ruta que especifica.
3. Termina con el bloque Handoff definido en implement-ticket/SKILL.md.
```

## Puertas entre fases

### Después de Fase 1 — revisando-ticket

Lee `Ready for` de `…-revisando-ticket.md`:

- **`blocked`**: Detente. Reporta bloqueadores y pregunta cómo proceder.
- **`refine`**: Detente. Lista recomendaciones de corrección del ticket y pide al usuario que actualice el ticket.
- **`generar-brief-contexto`**: Continúa a Fase 2.
- **`clasificar-tareas`**: Continúa a Fase 2; Fase 3 es requerida incluso si existe un brief.
- **`planificar-implementacion`**: Continúa a Fase 2 cuando no hay briefs con puntuación ≥ 9; de lo contrario salta a Fase 4.
- **`implement`**: Igual que `planificar-implementacion` (valor legacy de Ready for en artefactos antiguos).

### Después de Fase 3 — clasificando-tareas

Lee `Ready for` de `…-ticket-work-triage.md`:

- **`blocked`**: Detente. Reporta bloqueadores y pregunta cómo proceder.
- **`resolve-questions`**: Detente. Lista preguntas abiertas para el usuario.
- **`spike`**: Ejecuta `spike` (skill de investigación desechable), luego retorna a Fase 4 cuando las notas de spike tengan puntuación ≥ 9.
- **`demo`**: Ejecuta `harness` (skill de demo temporal), luego retorna a Fase 4.
- **`planificar-implementacion`**: Continúa a Fase 4.

### Después de Fase 4 — planificando-implementacion

Lee `Ready for` de `…-implementation-plan.md`:

- **`blocked`**: Detente. Reporta bloqueadores y pregunta cómo proceder.
- **`spike`**: Ejecuta `spike`, luego replanifica (Fase 4).
- **`generar-brief-contexto`**: Re-ejecuta Fase 2, luego Fase 4.
- **`implement`**: Continúa a Fase 6 cuando la puntuación del plan sea ≥ 9.

Antes de Fase 6, ofrece `understanding-quiz` cuando el ticket toque auth/PII, dominios desconocidos o flujo de datos complejo. Procede a Fase 6 solo cuando el usuario aprueba explícitamente saltar el quiz.

Cuando la puntuación del plan esté por debajo de 9 o las preguntas abiertas bloqueen la codificación segura, detente y pregunta si replanificar o resolver preguntas primero.

### Después de Fase 6 — implementando-plan

Lee `Ready for` de `…-implementation-report.md`:

- **`blocked`**: Detente. Reporta bloqueadores y pregunta cómo proceder.
- **`fix-locally`**: Detente. Lista gaps y pregunta al usuario antes de continuar.
- **`revisar-cambios-locales`**: Resume en chat. La implementación está lista para revisión local manual.

### Fase 7 — Verificación

Esta fase ejecuta los comandos de validación específicos del proyecto según `AGENTS.md` para asegurar la calidad del código implementado.

#### 7.1 Ejecutar comandos de validación

Determina qué comandos ejecutar basándote en lo que cambió en Fase 6:

- **Código Python en general**: `./scripts/docker-helper.sh lint`, `./scripts/docker-helper.sh typecheck`, `./scripts/docker-helper.sh test`
- **Cambios en módulo específico**: `./scripts/docker-helper.sh test [ruta]` (p. ej. `tests/shared/utils/` para ALE-023)
- **Solo formato**: `./scripts/docker-helper.sh lint`, `./scripts/docker-helper.sh format`
- **Cambios de modelos/migraciones**: `./scripts/docker-helper.sh migrate`, luego `./scripts/docker-helper.sh test`

Ejecuta los comandos en orden y captura la salida de cada uno.

#### 7.2 Reportar resultados en chat

Reporta los resultados de cada comando de validación en el chat con el siguiente formato:

```markdown
## Resultados de verificación — <TICKET-SLUG>

### Lint
- Estado: <✅ PASÓ / ❌ FALLÓ>
- Salida: <resumen de errores o "sin errores">

### Typecheck
- Estado: <✅ PASÓ / ❌ FALLÓ>
- Salida: <resumen de errores o "sin errores">

### Tests
- Estado: <✅ PASÓ / ❌ FALLÓ>
- Tests ejecutados: <número>
- Tests fallidos: <número>
- Salida: <resumen de fallos o "todos pasaron">
```

#### 7.3 Decisión basada en resultados

- **Todos los comandos pasan**: Continúa a Fase 8 si el usuario pide abrir PR, o termina el workflow con resumen exitoso.
- **Algún comando falla**: Detente y reporta los fallos específicos. Pregunta al usuario si desea corregir antes de proceder. No avances a Fase 8 hasta que la verificación esté en verde.

Si los fallos son menores y el usuario aprueba continuar, puedes iterar correcciones dentro de esta fase. Si falla repetidamente después de varios intentos de corrección, reporta el error concreto y pide ayuda antes de proceder.

### Fase 8 — PR y revisión (solo si el usuario pide abrir PR)

Esta fase es opcional y solo se ejecuta cuando el usuario pide explícitamente abrir un PR.

1. Crea commit y Pull Request siguiendo las reglas de git del sistema (mensaje enfocado en el *por qué*, sin secrets).
2. Invoca `revisando-pull-request` con `[PR-NUMBER] [TICKET-SLUG]`.
3. Si la puntuación de la revisión es < 9, invoca `pull-request-improvement` con `[PR-NUMBER] [TICKET-SLUG] [REVIEW-DOC-SLUG]` y vuelve a verificar.

## Checklist del orquestador

Copia y rastrea:

```text
Orquestar implementación de ticket — <TICKET-SLUG>
- [ ] Fase 1: revisando-ticket — artefacto + handoff
- [ ] Fase 2: generando-brief-contexto — artefacto + handoff
- [ ] Fase 3: clasificando-tareas — artefacto + handoff
- [ ] Fase 4: planificando-implementacion — artefacto + handoff
- [ ] Fase 5: understanding-quiz (opcional) — resultado en chat
- [ ] Fase 6: implementando-plan — cambios locales + handoff
- [ ] Fase 7: verificación — ejecutar comandos AGENTS.md + reportar resultados
- [ ] Fase 8: PR y revisión (opcional) — PR + review
- [ ] Resumen final publicado al usuario
```

## Convenciones locales

- Sigue `references/file-discovery.md` para resolver el `TICKET-SLUG` a un archivo bajo `docs/`.
- Lee siempre el epic padre y las dependencias citadas antes de planificar.
- Verifica con los comandos de `AGENTS.md` (`./scripts/docker-helper.sh lint|typecheck|test`) tras implementar.
- Detente en cada puerta de aprobación explícita; no avances de fase sin confirmación del usuario cuando el artefacto lo requiera.

## Cuándo usarlo y cuándo no

- **Sí**: el usuario pide implementar un ticket de extremo a extremo siguiendo el proceso del repo (p. ej. "implementa ALE-023").
- **No**: el usuario pide un único paso (revisar, briefear, planificar, implementar, revisar PR) — invoca el skill específico.
- **No**: el usuario pide crear un ticket (`create-ticket`) o solo explorar el codebase.
- **No**: ya existe un plan de implementación puntuado (≥9, Ready for=implement) en disco — usa `implementar-plan` directamente.

## Entrada y salida

- **Entrada**: `TICKET-SLUG` (string, obligatorio). Se resuelve vía `references/file-discovery.md`.
- **Salida**: el ticket implementado localmente con verificación pasada y, si aplica, un PR revisado. Artefactos intermedios (review-brief, generando-brief-contexto, triage, plan) se entregan en el chat o se guardan con `write` si el usuario lo pide.

## Estrategia de fallo

- Si un skill delegado reporta bloqueo (p. ej. `Ready for: blocked`), detén el pipeline y expón el bloqueo con las preguntas abiertas.
- Si una verificación falla repetidamente, reporta el error concreto y pide ayuda en lugar de seguir iterando indefinidamente.
- Si el ticket no existe o no se resuelve, pide la ruta o el contenido en el chat.

## Termina cuando

Todas las fases requeridas están completadas, o el workflow se detuvo limpiamente en una puerta con bloqueadores documentados. Los artefactos existen en disco con puntuaciones ≥ 9 donde aplica, y la validación de Fase 7 está en verde — o se le preguntó al usuario en una puerta con una razón clara y la siguiente acción.

**Límite de alcance**: este orquestador termina en Fase 7 (verificación) o, si el usuario pide PR, en Fase 8. No encadena automáticamente `actualizar-mapeo-contextos`, `revisar-cambios-locales` ni `revisar-cambios-implementados` — el ticket implementado queda con verificación en verde pero sin gate de revisión local ni validación post-implementación. Si el usuario los necesita antes de abrir PR, invócalos como pasos manuales adicionales después de Fase 7.
