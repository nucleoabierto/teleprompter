# El comando `update`

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

`teleprompter update` lleva un paquete instalado a la versión que
publica su origen —el registrado en la instalación o el que la
invocación indique—, presenta el plan de actualización completo y lo
ejecuta tras resolver las decisiones por recurso.

## Dependencias

- 018 (origen registrado) y 019 (plan de actualización).

## Entrada

- La gramática del CLI en `src/cli.js` y el flujo completo de
  `install` —obtención remota, verificación, plan, resolución
  interactiva, ejecución, registro— como molde del que `update` es
  hermano.
- El origen registrado en el lock (018) y el plan de actualización
  (019).

## Resultado esperado

- `teleprompter update <paquete>` reobtiene el paquete desde su
  origen registrado; una especificación explícita —`user/repo[@ref]`
  o `--path`— sobrescribe el origen registrado. La gramática exacta
  la fija la planeación.
- Si el paquete no está instalado o su origen no está registrado ni
  se indica, la respuesta es un error de invocación claro.
- El plan de actualización se presenta completo antes de escribir;
  los recursos cambiados con edición local se resuelven con la misma
  política que las colisiones —interactiva, `--force`, `--skip`,
  aborto sin consola— en el vocabulario que la planeación fije.
- La ejecución escribe los recursos y actualiza el registro a la
  versión nueva; `install` queda intacto e idempotente.
- `docs/instalador.md`, `README.md`, `manual/` y el dominio de
  instalación reflejan el comando.

## Criterios de calidad

- Actualizar un paquete con deriva muestra la clasificación real:
  lo intacto avanza sin preguntar, lo editado se decide caso a caso.
- Sin consola interactiva y con decisiones pendientes, la operación
  informa y aborta sin escribir, como `install`.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Fijar en la planeación la gramática de `update` —cómo se nombra
   el paquete y cómo se sobrescribe el origen— coherente con la del
   resto del CLI.
2. Implementar el flujo reutilizando obtención, verificación y
   ejecución del molde de `install`, con el plan de actualización.
3. Extender la suite: actualización limpia, con ediciones locales,
   interactiva y con `--force`/`--skip`, sin consola, origen no
   registrado, misma versión, paquete no instalado.
4. Actualizar la documentación del producto y del contrato.

## Contexto

- Decisiones consultadas: D005 (plan completo, aborto total), D006
  (política de colisiones), D007 (lock como memoria), D011–D013
  (patrón de subcomandos), D014 (`origin` reobtenible), D015
  (vocabulario del plan de actualización y política de retirados).
- Lecciones: `docs/lessons/` no existe; `EXPERIENCIAS.md` exige la
  revisión final con `subagent_general`.
- Gramática fijada: `update <paquete> [<user/repo[@ref]> |
  --path <dir>] [--ref <ref>] [--force|--skip] [--dry-run]`, sobre
  el directorio de trabajo —sin destino—. Origen: `--path` > spec
  posicional > `origin` registrado; `--ref` solo aplica a origen
  github.
- Acciones nuevas del ejecutor: `remove` (retirado intacto o
  `removal` resuelto `overwrite`) y `keep` (removal resuelto `skip`
  → conserva la entrada previa del lock, como `identical`).

## Plan técnico

> Aprobado por el usuario — 2026-09-30

**Subsistema.** `main` encadena obtención → verificación → plan →
resolución → ejecución → registro; `update` es su hermano con dos
cambios: el origen se resuelve del lock y el plan es
`buildUpdatePlan`. La ejecución añade `remove` y `keep` al
vocabulario de acciones compartido.

- [x] Gramática de `update` en `parseArgs` + `USAGE`: nombre
  obligatorio, posicional opcional como spec de repo, `--path`,
  `--ref`, `--force`/`--skip`/`--dry-run`. *Aporta:* la palabra
  reservada entra con el mismo bucle de flags/opciones que
  `install`.
- [x] Resolver la fuente en `runUpdate`: `--path` > spec posicional
  > `origin` registrado (`github` → spec con `--ref` ??
  `origin.ref`; `path` → dir); sin ninguno → error de invocación.
  `--ref` con fuente `--path` → error; paquete no instalado →
  error. *Aporta:* el origen registrado se consume sin re-pedirlo y
  la sobrescritura explícita actualiza el `origin` grabado.
- [x] Flujo `runUpdate` en `cli.js`: fetch/verificación del molde;
  manifiesto que publica otro nombre → error de invocación;
  `buildUpdatePlan`; `upToDate` → «ya está en esa versión» código
  0; plan impreso con las marcas de actualización; conflicts con la
  política de `install` —los `removal` preguntan «¿quitar?»—;
  ejecución + `writeLock` con el origen efectivo. *Aporta:* la
  superficie completa del comando.
- [x] `executePlan` acepta `retire` → `remove` y `conflict` +
  `removal` resuelto → `remove`/`keep` (itera `resources` +
  `retired`); `writeLock` descarta `remove` del registro y `keep`
  conserva la entrada previa. *Aporta:* las acciones nuevas
  ejecutan con la misma guarda `resolvesUnder`. *Contexto:* si la
  versión nueva ya no declara `personalization`, la guía anterior
  entra en retirados —la exclusión solo aplica cuando el manifiesto
  la sigue declarando—.
- [x] Suite `test/cli.test.js` con los casos aprobados.
- [x] Documentación: `docs/instalador.md` (gramática + sección del
  comando), `README.md`, `manual/referencia-update.md` + índices y
  `mkdocs.yml`, dominio (operación `update`), decisión **D016**
  (gramática de `update`, sobrescritura de origen, `remove`/`keep`).

## Suite de pruebas esperada

> Aprobada por el usuario — 2026-09-30

Caso de uso: *llevar un paquete instalado a la versión que publica
su origen.*

- `update <p>` con origen `--path` registrado → `update`/`retire`/
  `create` aplicados, lock a la versión nueva (O).
- Misma versión → «ya está en esa versión», código 0, nada escrito
  (Z).
- Paquete no instalado → código 4 (E).
- Sin `origin` ni origen explícito → código 4 claro (E).
- `--path` explícito sobrescribe el origen registrado y actualiza el
  lock (O).
- Origen github con `ref` → fetch con ese ref; sin `ref` → rama por
  defecto; `--ref` lo sobrescribe (O).
- Spec posicional `otro/repo@ref` sobrescribe el origen (O).
- Intacto con versión cambiada → sobrescrito sin preguntar (O).
- Edición local + versión cambiada → `conflict` → sin consola aborta
  código 2 sin escribir (E).
- Interactiva: respuestas por recurso; la pregunta de un `removal`
  dice «quitar» (O).
- `--force` → ediciones sobrescritas y retirados con deriva
  eliminados (B).
- `--skip` → ediciones conservadas; retirado con deriva conserva
  registro vía `keep` (B).
- Retirado intacto → eliminado del disco y del lock; ausente → solo
  sale del lock (B).
- `--dry-run` → plan impreso, nada escrito (Z).
- El origen publica otro nombre → código 4 (I/E).
- `update` sin nombre, destino extra, `--ref` + `--path`, flag
  desconocida → código 4 (I/E).

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
