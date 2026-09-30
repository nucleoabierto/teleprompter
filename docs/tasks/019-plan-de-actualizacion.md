# Plan de actualización consciente de la deriva

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Dado un paquete ya instalado y una versión entrante distinta de la
registrada, el sistema calcula un plan de actualización completo
—antes de escribir nada— que clasifica cada recurso según lo que la
versión nueva trae y lo que el usuario hizo con lo instalado.

## Dependencias

- 017 (la clasificación de deriva intacto / modificado / ausente que
  esta tarea reutiliza o reproduce).

## Entrada

- `buildPlan` en `src/plan.js`, `hashPath` en `src/hash.js`,
  `readLock` en `src/lock.js` y el contrato del registro.
- D005 (plan completo con aborto total) y D006 (política de
  colisiones) como decisiones que el plan respeta.

## Resultado esperado

- Una construcción de plan que, para un paquete cuyo nombre ya figura
  en el registro con una versión distinta de la entrante, clasifica
  cada recurso: nuevo en la versión, sin cambios, cambiado e intacto
  —actualizable sin pérdida—, cambiado pero con edición local
  —requiere decisión—, y registrado pero ausente del manifiesto
  nuevo —retirado por la versión, con su política de retirada
  decidida en la planeación.
- La misma versión entrante que la registrada produce un plan vacío o
  un informe de «ya está en esa versión», no una reinstalación.
- El plan es completo y abortable como el de instalación (D005): si
  no es ejecutable, nada se escribe ni se registra.

## Criterios de calidad

- Cada clase del plan está cubierta por la suite: recurso nuevo,
  idéntico, actualizable intacto, modificado localmente, retirado y
  recurso ausente en disco.
- La clasificación usa el hash registrado contra el contenido actual
  —no solo existencia—, igual que la verificación de deriva.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Definir en la planeación el vocabulario del plan de actualización
   —las clases por recurso y cómo se presentan— y la política para
   los recursos retirados por la versión nueva.
2. Implementar la construcción del plan como hermana de `buildPlan`,
   reutilizando `hashPath` y el registro.
3. Extender la suite con los casos de cada clase y con el aborto del
   plan no ejecutable.

## Notas

- Qué ocurre con un recurso retirado por la versión nueva —borrado
  automático, decisión por recurso o conservación— es la decisión
  más delicada del conjunto: quitar es destructivo y conservar deja
  restos huérfanos; la planeación la fija con evidencia de la suite.

## Contexto

- Decisiones consultadas: D005 (plan completo y aborto total), D006
  (política de colisiones con resolución overwrite/skip), D007
  (`teleprompter-lock.json` como memoria), D013 (`check` y su
  clasificación de deriva), D014 (`origin` del registro).
- Lecciones: `docs/lessons/` no existe; `EXPERIENCIAS.md` exige la
  revisión final con `subagent_general` (capacidad de ejecutar).
- Vocabulario del plan de actualización (fijado con el usuario):
  `create` (nuevo o registrado borrado del destino —se reinstala),
  `identical`, `update` (la versión cambió el recurso y el destino
  sigue intacto; requiere versión ≥ registrada), `conflict` (edición
  local o contenido ajeno —decisión overwrite/skip; en retirados
  overwrite = quitar, skip = conservar) y `retire` (registrado,
  ausente del manifiesto e intacto → eliminación automática).
- Política de retirados (fijada con el usuario): intacto → `retire`;
  modificado o no verificable → `conflict`; ausente en disco →
  desaparece del plan sin marca.
- Misma versión entrante → `upToDate: true` con recursos vacíos;
  el informe lo emite la tarea 020.
- Excluidos de retirados: entradas `skip` y el `target` de
  `personalization` (lo reescribe `installPersonalization`).

## Plan técnico

> Aprobado por el usuario — 2026-09-30

**Subsistema.** `buildPlan` clasifica cada entrada `install`
comparando el contenido del paquete, el del destino y el hash
registrado. El plan de actualización añade los recursos retirados
(registrados, ausentes del manifiesto entrante) y una comparación
nueva —contenido entrante vs hash registrado— que dice si la versión
cambió el recurso. La deriva (`src/drift.js`) ya resuelve el estado
de cada recurso registrado y se reutiliza para los retirados. La
función es hermana de `buildPlan` en el mismo módulo y no ejecuta:
devuelve el plan para que 020 lo presente y ejecute.

- [x] `buildUpdatePlan(pkgDir, manifest, destDir, creates, lock)`
  en `src/plan.js`: clasifica las entradas del manifiesto nuevo
  (create/identical/update/conflict vía `hashPath`) y añade los
  retirados clasificados con `classifyResource` (retire/conflict/
  silencio). Devuelve `{ upToDate, mkdirs, resources, conflicts,
  retired }`. *Aporta:* la construcción completa y abortable que 020
  consumirá. *Contexto:* `classifyResource` ya revalida que el
  `target` registrado no escape del destino —los retirados heredan
  esa defensa—.
- [x] Extender `test/plan.test.js` con la suite del plan de
  actualización —pruebas de unidad sobre `buildUpdatePlan` con locks
  fabricados—. *Aporta:* cada clase cubierta y la puerta del 100 %
  mantenida.
- [x] Documentar el vocabulario en `docs/instalador.md` (sección
  hermana de «Las acciones del plan») y la operación en el dominio
  `docs/domains/002-instalacion.md`. *Aporta:* el contrato interno
  queda fijado antes de que 020 lo exponga.
- [x] Registrar la decisión **D015** —vocabulario del plan de
  actualización y política de retirados—. *Aporta:* la política
  destructiva de retirados es una decisión costosa de revertir.

**No hace:** el comando `update`, la obtención del origen, la
presentación ni la ejecución del plan —todo es 020. Sin cambios en
`cli.js` ni documentación de usuario.

## Suite de pruebas esperada

> Aprobada por el usuario — 2026-09-30

Caso de uso: *que la actualización decida recurso a recurso antes
de escribir.*

- Misma versión entrante → `upToDate`, recursos vacíos (Z).
- Recurso nuevo del manifiesto → `create` (O).
- Destino idéntico al contenido entrante → `identical` (O).
- Versión cambió el recurso y el destino sigue intacto → `update` (O).
- Versión cambió el recurso y el usuario lo editó → `conflict` (O).
- Versión no cambió el recurso pero el usuario lo editó →
  `conflict` —edición local por hash, no por existencia— (O).
- Registrado ausente del manifiesto e intacto → `retire` (B).
- Retirado modificado o sin hash verificable → `conflict` (B/E).
- Retirado ya ausente en disco → no aparece en el plan (B).
- Registrado, borrado del destino y aún en el manifiesto →
  `create` (B).
- Downgrade con recurso cambiado → `conflict`, no `update` (I).
- Entradas `skip` y `target` de `personalization` no figuran como
  retirados (I/E).
- `retired` contiene exactamente las `retire`; `conflicts` las
  `conflict` (regresión de forma).

## Revisión

- Subagente: 2026-09-30 — Aprueba
- Usuario: 2026-09-30 — Aprueba

## Desviaciones

- La democión por `resolvesUnder` se aplica también a `create`,
  igual que en `buildPlan` —una escritura bajo una cadena de padres
  que escapa no puede ser `create`—.
- `buildPlan` endureció la comparación de targets con
  `path.normalize` en ambos lados, tras el hallazgo de revisión:
  sin normalizar, un `./a.txt` entrante se clasificaba como enviado
  y retirado a la vez (corrección bloqueante de la ronda 1).
