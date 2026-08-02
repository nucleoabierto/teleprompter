---
name: clasificar-comentarios
description: >-
  Clasifica los comentarios abiertos de un PR y omite hilos resueltos o ya
  procesados. Usa subagentes en paralelo para clasificar grupos de hilos
  independientes. Escribe
  docs/<domain>/<TICKET-ID>-pr-<PR-NUMBER>-comments-triage.md con veredicto,
  severidad, respuesta propuesta y Ready for. Carga el doc de review-comments
  cuando está presente. Análisis únicamente — no publica respuestas ni
  resuelve hilos. Úsalo cuando el usuario pida clasificar, triage, priorizar o
  categorizar comentarios nuevos de revisión en un PR abierto que necesiten un
  fix, respuesta o plan de aplazamiento.
---

# Clasificación de comentarios de PR

Clasifica hilos de revisión nuevos y abiertos que aún necesitan respuesta o fix. Omite hilos resueltos en la plataforma de código o completamente procesados en un doc de triage previo.

Escribe `docs/<domain>/<TICKET-ID>-pr-<PR-NUMBER>-comments-triage.md`. Un resumen en el chat no es suficiente.

Análisis únicamente: sin respuestas, resolución de hilos, pushes o cambios en la plataforma de código. Pon las lagunas de intención del hilo en Preguntas abiertas. Cambios de código solo cuando el usuario lo pida por separado.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas (Fase 0) |
| [parallel-subagents.md](references/parallel-subagents.md) | Delegación por temas (Fase B) |
| [comments-triage-rubric.md](references/comments-triage-rubric.md) | Rúbrica de puntuación (Fase B) |

## Fase 0 — Resolver entradas

Requerido: `PR-NUMBER` (string) y `TICKET-SLUG` (string, opcional) — ticket, brief o contexto del cambio. Opcional: documento de contexto existente en ruta local.

Sigue el protocolo de descubrimiento de archivos en `references/file-discovery.md` (vía contexto → solicitud directa → invocación) para resolver `PR-NUMBER` y `TICKET-SLUG`.

Declara las entradas resueltas en el chat, luego procede a la Fase A.

Ruta de salida: `docs/<domain>/<TICKET-ID>-pr-<PR-NUMBER>-comments-triage.md`.

## Fase A — Cargar

1. Lee las fuentes resueltas (objetivo, criterios de aceptación, objetivos excluidos, restricciones) desde docs locales, documentación y/o tareas según la Fase 0.
2. Carga `REVIEW-COMMENTS-DOC` cuando esté presente y cruza la intención del revisor para hilos abiertos.
3. Carga `PRIOR-TRIAGE-DOC` cuando esté presente y marca hilos ya clasificados con una acción final como procesados.
4. Enumera los hilos de revisión abiertos en el PR vía CLI de la plataforma de código (por ejemplo comandos de API para listar comentarios de review) o MCP de la plataforma de código. Incluye comentarios de revisión inline no resueltos y hilos de revisión sin resolución. Excluye:
   - Hilos resueltos o colapsados en la plataforma de código
   - Comentarios de diff desactualizados superados por nuevos commits (a menos que el hilo se haya reabierto)
   - Hilos ya procesados en `PRIOR-TRIAGE-DOC` sin actividad nueva desde ese triage
5. Registra un checklist de cada hilo incluido (autor, path:line, resumen de una línea, nuevo vs continuo) antes de la Fase B. Cuando `gh` no esté disponible, pide al usuario que pegue enlaces o resúmenes de hilos abiertos.
6. Revisa el diff del PR lo suficiente para entender cada región comentada en contexto.

Cuando queden cero hilos abiertos después del filtrado, escribe un triage breve notificando "no open threads" con Ready for `reply-only` y detente.

## Estrategia de fallo

- Si la fuente no existe o no se puede leer, pide al usuario que pegue el contexto en el chat.
- Si el PR no se encuentra localmente o no tiene diff accesible, reporta el bloqueo en Preguntas abiertas; pregunta al usuario.
- Si no puedes acceder a los comentarios abiertos vía `gh` o MCP de la plataforma de código, pide al usuario que pegue el listado antes de clasificar.
- Si no hay comentarios abiertos después del filtrado, escribe un triage breve notificando "no open threads" con Ready for `reply-only` y detente.

## Fase B — Clasificar

1. Agrupa los comentarios abiertos temáticamente (la misma preocupación en varios archivos = un tema).
2. Compara los patrones disputados con archivos similares en el repo para convenciones. Cuando el veredicto sea **disagree** o **partially agree**, cita **al menos una** ruta hermana que respalde el caso (o lista el vacío bajo Preguntas abiertas).
3. **Guía de severidad** (calibra antes de etiquetar):
    - **blocker** — rompe criterios de aceptación, auth/PII, o comportamiento correcto
    - **important** — incorrecto vs convenciones del proyecto o probable bug/regresión
    - **nit** — estilo o claridad opcional; no requerido para subir
    - **fuera del alcance** — fuera de este PR / ligado a objetivos excluidos de la fuente
4. **Para cada comentario abierto**, produce este bloque:

```
thread: <autor> en `path:line` — <resumen de una línea de su petición>
verdict: agree | partially agree | disagree | needs more info
severity if fixed: blocker | important | nit | out of scope
case: <2–5 oraciones: por qué, citando la fuente y/o una ruta de convención hermana>
proposed reply: <respuesta concisa que podríamos publicar después>
action: implement fix | reply and resolve | ask clarifying question | defer (why)
```

Cuando `action` sea `implement fix`, nota que la validación debe usar `./scripts/docker-helper.sh test -m unit` / `cd frontend && npm test -- --filter=<name>` / `./scripts/docker-helper.sh exec api uv run ruff check`.

**Mala clasificación de comentarios (evitar)**

- Estar de acuerdo con cada hilo sin argumento.
- `implement fix` sin cita de fuente o convención en el case.
- Omitir un hilo abierto.
- Lista de acciones desordenada, o Ready=`yes` mientras quedan blockers.
- Pregunta al usuario la intención del producto antes de descartar un hilo.

**Puntuación de la clasificación de comentarios (1–10)**

- **10** — Cada hilo abierto tiene un bloque completo; veredictos justificados con la fuente y/o convención hermana; severidad calibrada; acciones ordenadas; out-of-scope ligado a objetivos excluidos; Ready coincide con los blockers restantes.
- **9** — Clasificación senior; solo nits triviales (redacción, una ruta faltante).
- **8** — Útil pero casos débiles, severidad suave, o citas de convención escasas.
- **7** — Cubre los hilos; división, severidad, o Ready necesita revisión.
- **≤ 6** — Hilos faltantes, acuerdos de goma, Ready contradice a los blockers, o pregunta la intención sin respuesta.

Mejora la clasificación en **como máximo 2** rondas de revisión hasta que la puntuación sea ≥ 9. Si sigue por debajo de 9 después de 2 rondas, detente e informa los bloqueos en lugar de iterar indefinidamente.

## Fase C — Entregar la clasificación

**Entrega la clasificación de comentarios** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`.

**Secciones requeridas**

1. Resumen de grupos temáticos
2. Convenciones disputadas (rutas hermanas comparadas cuando el veredicto es disagree / partially agree)
3. Bloques por hilo (cada comentario abierto)
4. Lista de acciones ordenada (qué implementar primero; qué resolver solo con discusión)
5. Fuera del alcance / no corresponde a este PR (ligado a objetivos excluidos de la fuente cuando aplique)
6. Puntuación de la clasificación + breve justificación (omítelo solo si se bloquea antes de escribir)
7. **¿Ready después de las acciones listadas?** — `yes` o `no`, más los blockers restantes si `no` (indícalo también claramente en el chat)
8. Preguntas abiertas (solo elementos sin resolver)

Prefiere evidencia de la fuente + diff + archivos hermanos. Mantenlo escaneable.

**Autoevaluación antes de terminar**

- Puntuación de la clasificación ≥ 9 (o bloqueos reportados después de 2 rondas).
- Cada hilo abierto tiene un bloque con veredicto, severidad, case, respuesta propuesta y acción.
- Cada caso de disagree / partially agree cita la fuente o una ruta hermana (o el vacío está en Preguntas abiertas).
- La lista de acciones ordenada y las llamadas de out-of-scope son explícitas.
- La readiness (`yes`/`no` + blockers) se indica en el archivo y en el chat, y coincide con la lista de blockers.
- Nada publicado en la plataforma de código.

## Termina cuando

Cada hilo abierto tiene un bloque, la lista de acciones ordenada y las llamadas de out-of-scope son explícitas, la readiness (`yes`/`no` + blockers) es consistente, la puntuación de la clasificación ≥ 9 (o bloqueos después de 2 rondas), y el archivo de clasificación está en el chat o archivo local. Nada publicado en la plataforma de código.
