---
name: mejorar-pr
description: >-
  Aplica mejoras a un PR para elevar su puntuación de revisión a ≥ 9. Úsalo
  cuando el usuario pida corregir, mejorar, arreglar o aplicar fixes a un PR
  tras una revisión o una revisión fresca, y no para solo revisar, explicar o
  publicar comentarios en la plataforma de código. Escribe notas de mejora en
  disco o las entrega en chat. No hace push a menos que se le pida.
---

# Mejora de PR

Aplica mejoras al PR `PR-NUMBER` para que la rama alcance una puntuación de revisión ≥ 9. La fuente es `TICKET-SLUG` (una tarea o research brief en el chat o archivo local). Opcionalmente usa también `REVIEW-DOC-SLUG` (un brief de revisión previo).

Esto es **implementación**, no una pasada de solo-revisión fresca. No publiques comentarios ni revisiones en la plataforma de código; cambia el código (y tests) localmente.

**No** crees commits de control de versiones, hagas push, force-push, ni publiques a menos que se te pida explícitamente. No resuelvas ni respondas en la plataforma de código en este paso. No expandas el alcance más allá de la tarea / non-goals de la fuente. Prefiere diffs mínimos que aborden los hallazgos de la revisión.

## Cuándo usarlo y cuándo no

- **Sí**: el usuario pide elevar la puntuación de un PR aplicando correcciones locales tras una revisión.
- **No**: el usuario solo quiere revisar, explicar o publicar comentarios; para eso usa `pr-review` o `comments-triage`.

## Entrada y salida

- **Entrada**: `PR-NUMBER` (string, obligatorio), `TICKET-SLUG` (string, obligatorio), `REVIEW-DOC-SLUG` (string, opcional).
- **Salida**: `improvement-notes` (string, markdown) — notas con puntuación inicial, correcciones aplicadas, puntuación final y vacíos restantes; se entrega en el chat o se escribe con `write` si el usuario lo pide.

## Convenciones locales

- Trabaja con archivos locales o el chat.
- Sigue el protocolo de descubrimiento de archivos en `references/file-discovery.md` (vía contexto → solicitud directa → invocación) para resolver `PR-NUMBER`, `TICKET-SLUG` y `REVIEW-DOC-SLUG`.
- Los entregables se presentan en el chat. Si el usuario solicita guardar, escribe el archivo en la ruta indicada con `write`.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas compartida (Fase 0) |
| [workflow-catalog.md](references/workflow-catalog.md) | Cadenas de skills y rutas de artefactos |
| [self-contained-comments.md](../_shared/self-contained-comments.md) | Convención de comentarios y mensajes de commit autocontenidos |

## Fase 0 — Resolver entradas

Requerido: `PR-NUMBER`, `TICKET-SLUG`. Opcional: `REVIEW-DOC-SLUG` (documento de revisión previo).

Resuelve las entradas siguiendo [file-discovery.md](references/file-discovery.md):

- **`PR-NUMBER`**: Inferir de Mensaje, URL del repositorio, rama actual. Preguntar si falta: "¿Qué número de PR debo mejorar?"
- **`TICKET-SLUG`**: Inferir de Metadatos del PR, nombre de rama, archivos en `docs/**/`. Preguntar si falta: "¿Para qué tarea es este PR? (ej. TASK-881)"
- **`REVIEW-DOC-SLUG`**: Inferir de `docs/**/<TICKET-SLUG>-pr-<PR-NUMBER>-review.md`. Preguntar si falta: Omitir si no está en disco

Declara las entradas resueltas en el chat, luego procede.

## Fase A — Cargar y puntuar

1. Relee los criterios de aceptación de la fuente.
2. Si hay un documento de revisión disponible: lee esos hallazgos y úsalos como hallazgos de trabajo.
3. Si no hay documento de revisión, ejecuta una revisión temática **completa** del PR vs la fuente y convenciones (agrupa archivos temáticamente; anota convenciones y efectos de segundo orden; produce hallazgos ordenados por severidad con números de línea verificados). **No** hagas un skim rápido. Trata esa revisión como los hallazgos de trabajo.
4. Puntúa el PR actual con la rúbrica de abajo. Si ya está ≥ 9, escribe las notas de mejora (puntuación final + nits opcionales solo) y detente.

Si `REVIEW-DOC-SLUG` falta y la fuente (`TICKET-SLUG`) carece de objetivo y criterios de aceptación, detente y pregunta: "No se encontró documento de revisión o research brief — pega una ruta de archivo de revisión, URL de documentación, o ¿debo cargar los AC desde la tarea?"

**Rúbrica de puntuación (1–10)**

- **10**: Todo AC cumplido; validación dirigida pasa (o N/A con justificación explícita); cero hallazgos blocker, important o nit; convenciones coinciden con ≥2 patrones hermanos citados o divergencia intencional documentada; efectos de segundo orden abordados o explícitamente ninguno.
- **9**: Todo AC cumplido; validación dirigida pasa (o N/A con justificación explícita); cero hallazgos blocker e important; máximo 3 hallazgos nit; convenciones coinciden con patrones hermanos excepto donde nits notan gaps de micro-estilo solo.
- **8**: Todo AC cumplido funcionalmente, pero ≥1 hallazgo important o desajuste repetido de convenciones vs patrones hermanos citados o validación no ejecutada cuando el diff claramente lo justifica.
- **7**: Todo AC cumplido funcionalmente, pero deuda material de arquitectura/diseño (capa incorrecta, lógica duplicada, abstracción faltante) que no rompe el comportamiento hoy.
- **5–6**: Cualquier AC parcial o faltante; o tests débiles/faltantes para comportamiento cambiado; o casos edge riesgosos no manejados sin una Pregunta abierta.
- **1–4**: Enfoque incorrecto; comportamiento roto; inseguro para producción/PII; o ≥1 hallazgo blocker.

Verificación rápida de 9 vs 8: si archivarías ≥1 comentario important antes de merge, puntúa ≤8. Si todo AC está cumplido, validación está verde, y solo nits opcionales permanecen, puntúa ≥9.

## Estrategia de fallo

- Si el PR no se encuentra localmente o no tiene diff accesible, reporta el bloqueo en Preguntas abiertas y detente.
- Si la puntuación no sube a ≥ 9 tras 2 rondas, detente y lista los vacíos restantes en las notas.
- Si un comando de validación falla, corrige antes de la siguiente ronda.

## Fase B — Corregir

Ejecuta como máximo dos rondas de corrección apuntando a puntuación ≥ 9.

No:

- Expandir el alcance más allá de hallazgos de revisión y non-goals de la fuente — estaciona descubrimientos en Seguimientos de las notas de mejora.
- Saltar tests dirigidos (`./scripts/docker-helper.sh test -m unit`, ejecutar tests específicos del frontend) después de corregir hallazgos blocker o important.
- Hacer push, force-push, publicar comentarios o resolver hilos en la plataforma de código a menos que el usuario lo pida explícitamente.
- Ocultar vacíos restantes cuando la puntuación permanece por debajo de 9 tras dos rondas — listalos en las notas de mejora con Ready for `corregir-mas-localmente`.

1. Si la puntuación < 9, ordena hallazgos de blocker a important; omite nits puros a menos que sean baratos.
2. Aplica correcciones en cambios locales pequeños. Coincide con convenciones en archivos hermanos. Escribe comentarios de código autocontenidos según [self-contained-comments.md](../_shared/self-contained-comments.md): incorpora el contexto del porqué en el comentario en lugar de remitir a tickets, ADRs, PRDs u otra documentación externa. Cubre regresiones con tests dirigidos (`./scripts/docker-helper.sh test -m unit`, ejecutar tests específicos del frontend según AGENTS.md). Nunca ejecutes el suite completo.
3. Vuelve a puntuar según la rúbrica de Fase A.

Si la puntuación sigue < 9 tras dos rondas, detente y lista los vacíos restantes en las notas de mejora.

Si la validación dirigida falla, establece Ready for en `corregir-mas-localmente` a menos que aplique un bloqueador externo.

## Fase C — Entregar las notas de mejora

**Entrega las notas de mejora** en el chat. Si el usuario pide guardar, escribe el archivo en la ruta indicada con `write`.

**Secciones requeridas de las notas**

1. Puntuación inicial + visión general
2. Correcciones aplicadas (bullets orientados a cambios; qué cambió y por qué)
3. Puntuación final + justificación
4. Vacíos restantes (si la puntuación final < 9), en estilo de comentario de código cuando esté ligado a un archivo/línea
5. Nits opcionales (si ≥ 9)
6. Seguimientos (solo descubrimientos fuera de alcance)
7. Ready for — elige exactamente un valor de este menú y explica por qué:
   - `local-review` — La rama está lista para revisión local manual
   - `corregir-mas-localmente` — Quedan vacíos tras dos rondas; continuar corrigiendo localmente
   - `blocked` — Bloqueador externo sin resolver; lista qué debe cambiar

Declara Ready for en el chat también.

## Termina cuando

Las notas de mejora están en el chat o archivo local con todas las secciones requeridas, puntuación final ≥ 9 (o vacíos restantes listados tras dos rondas de corrección), exactamente un valor Ready for con justificación, y solo cambios locales — nada enviado o publicado a la plataforma de código. Un compañero puede ejecutar `pr-review`, hacer push, o continuar corrigiendo sin releer el PR completo.

Termina el mensaje final con este bloque de handoff:

```markdown
## Handoff — pr-improvement
- PR-NUMBER: …
- TICKET-SLUG: …
- Puntuación inicial: <N>/10
- Puntuación final: <N>/10
- Ready for: <valor del menú>
- Bloqueadores: <lista o "none">
- Resumen: <2–4 oraciones>
```
