# Comportamiento de `guide` sobre una guía conservada tras retiro

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Cuando una versión entrante abandona o renombra `personalization`,
la guía registrada anterior entra en retirados; si tiene deriva y el
usuario resuelve `keep`, el archivo sigue en disco y en `files`,
pero `writeLock` ya no escribe el campo `personalization` —`guide`
responde «no declara instrucciones» aunque la guía exista—. Decidir
si ese es el comportamiento correcto (la versión nueva ya no la
considera guía) o si `keep` debería conservar también el campo, e
implementar lo decidido.

## Dependencias

- Ninguna

## Entrada

- `src/lock.js` (`writeLock`, líneas ~82-90), `src/plan.js`
  (`buildUpdatePlan`), `src/cli.js` (`showGuide`)
- `docs/decisions/D015`, `D016`, `D010`
- `docs/architecture-reviews/002-instalacion-tras-el-ciclo-de-vida.md`
  — hallazgo H6

## Resultado esperado

- El comportamiento elegido —conservar el campo `personalization`
  cuando el usuario hace `keep` de la guía retirada, o dejarlo como
  está— queda declarado en el contrato (`docs/instalador.md`) y el
  dominio, y probado.
- Si se conserva el campo: `writeLock`/`guide` lo reflejan; si se
  deja: la documentación declara que una guía conservada deja de ser
  consultable por `guide`.

## Criterios de calidad

- El caso «guía retirada + `keep`» tiene una prueba que afirma el
  comportamiento decidido.
- Coherencia con D015/D016; cobertura 100 %.

## Procedimiento sugerido

1. Formular el caso al usuario y fijar el comportamiento.
2. Implementar y probar; documentar el resultado.

## Notas

- Es un borde pequeño; si la respuesta elegida es «como está», la
  tarea se reduce a declarar el comportamiento en el contrato.

## Decisión del usuario

Al presentar el caso —guía registrada que retira por renombre o
abandono, conservada con `keep` pero ya no consultable por `guide`—
el usuario eligió una tercera vía: **si la versión entrante declara
su propia guía, la guía registrada retirada se borra en lugar de
ofrecer `keep`**. Una guía que la versión nueva reemplaza deja de
ser conservable: su retiro con deriva no es conflicto sino `retire`.
Si la versión entrante abandona `personalization` por completo —sin
guía nueva— el retiro con deriva sigue preguntando `remove`/`keep`
como cualquier archivo retirado.

## Contexto

- **Archivos similares:**
  - `src/plan.js` — `buildUpdatePlan` construye los retirados:
    `intact` → `retire`, `missing` → fuera del plan, el resto →
    `conflict` con `removal`. La guía registrada queda excluida del
    filtro solo mientras el manifiesto entrante declara el mismo
    target.
  - `src/lock.js` — `writeLock` escribe `personalization` solo si el
    manifiesto entrante lo declara; un `keep` de la guía retirada
    deja el archivo en `files` pero sin el campo.
  - `src/cli.js` — `settleConflicts` pregunta `remove`/`keep` para
    conflicts `removal`; `showGuide` lee el campo del registro.
- **Patrones:**
  - El vocabulario del plan decide y el orquestador no diverge: un
    `retire` nunca llega a `conflicts`, así que ningún bucle de
    resolución lo ve.
- **Lecciones:**
  - `docs/lessons/` no existe: ninguna nota aplica.
  - `EXPERIENCIAS.md` (20260930T010326): la revisión técnica requiere
    un subagente capaz de ejecutar `git` y `npm test`.
- **Decisiones:**
  - D015/D016 — `retire` y el conflicto `removal` con resoluciones
    `remove`/`keep`: el cambio reclasifica el retiro de la guía
    reemplazada de «conflicto removal» a «retire», dentro del
    vocabulario vigente.
  - D011/D010 — la guía gestionada y su consulta por `guide`.

## Conectividad

**Veredicto: conectada.**

El punto exacto existe: el `flatMap` de retirados en
`buildUpdatePlan` ya distingue intact/missing/resto y conoce el
`record` —`record.personalization` identifica la guía registrada y
`manifest.personalization` la declaración entrante—. Ninguna
infraestructura nueva hace falta: `retire` ya elimina en la
ejecución y `writeLock`/`guide` no cambian.

## Plan técnico

**Subsistema.** `buildUpdatePlan` retira la guía registrada como un
archivo cualquiera: intacta se borra (`retire`), ausente sale del
plan, y con deriva degrada a `conflict` `removal` —donde `keep` la
conserva en disco y en `files` pero `writeLock` ya no escribe
`personalization`, dejándola huérfana para `guide`—. Por la decisión
del usuario, cuando el manifiesto entrante declara su propia guía la
registrada se retira incluso con deriva: la versión nueva la
reemplaza y ya no es conservable.

- [x] En el `flatMap` de retirados de `buildUpdatePlan`: si
  `manifest.personalization` está declarado y el target retirado es
  el `record.personalization` con deriva `modified`, emitir `retire`
  en lugar de `conflict`/`removal`
  - Aporta: la guía reemplazada por la versión entrante se borra sin
    preguntar — el `keep` que dejaba una guía huérfana desaparece
  - Contexto: `unverifiable` sigue siendo `conflict` —un retiro
    forzado de una ruta que escapa convertiría una decisión
    resoluble en un error de ejecución—; `intact` y `missing` ya
    hacían lo suyo; el abandono total de `personalization` no toca
    esta rama porque la condición exige guía entrante
- [x] Actualizar el comentario de retirados en `plan.js` y el
  contrato en `docs/instalador.md`: la guía reemplazada por una
  guía entrante se retira aun con deriva
  - Aporta: el comportamiento queda declarado, no solo implementado
- [x] Pruebas en `test/cli.test.js`: update que renombra la guía con
  la registrada modificada → la vieja se borra sin pregunta y la
  nueva se materializa; update que abandona `personalization` con la
  registrada modificada → sigue preguntando `remove`/`keep`
  - Aporta: fija ambos lados de la decisión

## Suite de pruebas esperada

Casos de uso: (1) actualizar un paquete cuya versión entrante
renombra la guía, (2) actualizar un paquete cuya versión entrante
abandona la guía.

- Una guía registrada con deriva cuya versión entrante declara otra
  guía se borra sin preguntar y la nueva se materializa (B) — caso 1.
- Una guía registrada con deriva cuya versión entrante abandona
  `personalization` sigue siendo conflicto `removal` y pregunta
  `remove`/`keep` (B) — caso 2.
- Regresión: retirados intactos, ausentes y ajenos a la guía —la
  suite existente los cubre—.

## Desviaciones del plan

Sin desviaciones.

## Revisión

- Subagente: 2026-10-01 — Aprueba
- Usuario: 2026-10-01 — Aprueba
