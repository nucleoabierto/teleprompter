# Respaldar los conflictos sobrescritos en .teleprompter/

## Estado

[ ] Pendiente | [~] En progreso | [r] En revisión | **[x] Completada** | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

Cuando `install` o `update` resuelve un conflicto sobrescribiendo —por `--force` o por respuesta afirmativa en la consola interactiva— el contenido anterior del destino se pierde sin recursos. La tarea añade un respaldo previo a la escritura: cada archivo en conflicto efectivamente sobrescrito conserva una copia bajo `.teleprompter/`, de modo que el estado previo quede recuperable sin copiar el conjunto completo de recursos del paquete. La tarea determina la mejor forma del respaldo —directorio espejo de las rutas destino, archivo único u otra— y su estructura dentro de `.teleprompter/` —por ejecución, por paquete o lo que se decida—, incluida la decisión sobre los conflictos `removal` —el contenido que se retira también admite respaldo si procede—.

## Dependencias

- Ninguna

## Entrada

- `src/plan.js` — `plan.conflicts` y `resolveConflicts`: qué recursos entran en conflicto y con qué resolución.
- `src/execute.js` — `executePlan`: el punto donde la resolución `overwrite` materializa la escritura.
- `src/paths.js` — `MANAGED_DIR` (`.teleprompter`): el territorio propio de la herramienta donde el respaldo vive.
- `src/cli.js` — `settleConflicts` y `executeAndReport`: dónde se deciden las resoluciones y dónde se reporta el resultado.
- `manual/` — la referencia de `install` y `update`, por si el respaldo se documenta.

## Resultado esperado

- Al sobrescribir un conflicto, el contenido anterior del destino queda copiado bajo `.teleprompter/` antes de la escritura, en la forma y estructura que la tarea decide y justifica.
- Solo se respaldan los recursos en conflicto efectivamente sobrescritos: los `skip`, los `identical`, los `create` y las actualizaciones gestionadas no generan respaldo.
- La ejecución informa del respaldo creado —qué se preservó y dónde quedó— junto al resultado de la operación.
- `test/` cubre el respaldo: contenido preservado, alcance limitado a los conflictos sobrescritos y convivencia de respaldos sucesivos.
- Si el respaldo es un contrato observable, la referencia del manual correspondiente lo documenta.

## Criterios de calidad

- `install`/`update` con un conflicto resuelto `overwrite` deja una copia del contenido previo del destino bajo `.teleprompter/`, verificable contra el original —mismo contenido, misma ruta relativa o la que la estructura decida—.
- El respaldo solo contiene los conflictos sobrescritos: ni los resueltos `skip`, ni los recursos sin conflicto, ni el conjunto completo del paquete.
- Dos operaciones con respaldo no se confunden: la estructura decidida distingue un respaldo de otro.
- La salida del CLI comunica que hubo respaldo y dónde está.
- `npm test` queda en verde con la cobertura exigida —100 % de líneas, funciones y ramas en `src/`—.

## Procedimiento sugerido

1. Elegir la forma del respaldo —directorio espejo, archivo único— y su estructura bajo `.teleprompter/`, justificándola contra la consulta posterior.
2. Respaldar el contenido previo de cada conflicto resuelto `overwrite` antes de que `executePlan` lo sobrescriba —o en el punto equivalente—.
3. Reportar el respaldo en la salida y cubrir el comportamiento en la suite.

## Notas

- `.teleprompter/` es territorio gestionado por la herramienta: el respaldo no debe colisionar con la guía de personalización ni registrarse en el lock como recurso del paquete.
- La decisión sobre los conflictos `removal` —el contenido retirado— queda en la tarea: respaldarlos igual o declararlos fuera de alcance.

## Contexto


- **Archivos similares:**
  - `src/execute.js` — `executePlan` materializa la resolución: el
    `overwrite` hace `rm` del destino antes de copiar, con guarda
    `resolvesUnder` sobre la cadena de padres; `ExecutionError`
    transporta las acciones ya aplicadas. Es el punto donde el
    respaldo debe ocurrir, antes de esa escritura destructiva.
  - `src/plan.js` — `buildPlan`/`buildUpdatePlan` producen los
    `conflict` (incluidos los `removal`, sin `source`) y
    `resolveConflicts` asigna `resolution`; un conflicto `removal`
    resuelto `overwrite` se ejecuta como `remove`.
  - `src/cli.js` — `settleConflicts` aplica la política D006
    (`--force`, `--skip`, pregunta interactiva, aborto listando) y
    `executeAndReport` orquesta plan → guía → lock → informe; es
    donde el respaldo se anuncia.
  - `src/paths.js` — `MANAGED_DIR` (`.teleprompter`),
    `resolvesUnder` e `isSafeRelative`: la guarda que toda ruta que
    se escribe debe pasar.
  - `src/lock.js` — `writeLock` como modelo de escritura atómica
    (temporal + `rename`) si el respaldo la necesitara.
  - `test/execute.test.js` — helpers `tmp()`, `pkgWith()`, `run()`
    y el patrón de aserciones sobre lock y salida.
- **Patrones:** CommonJS-less ESM con `node:test`; toda escritura
  bajo el destino pasa antes por `resolvesUnder`; los mensajes al
  usuario van en español; el vocabulario de acciones del plan es
  fijo (`create`/`identical`/`overwrite`/`skip`/`remove`/`keep`/
  `mkdir`); cobertura exigida del 100 % en `src/`.
- **Dominio:** `docs/domains/002-instalacion.md` — el plan completo
  precede a cualquier escritura (D005) y `.teleprompter/` es
  propiedad de la herramienta: nada del mapa `install` puede
  apuntar dentro, y lo que la herramienta escribe ahí no se
  registra como recurso del paquete.
- **Producto:** `manual/referencia-install.md` y
  `manual/referencia-update.md` documentan las colisiones; si el
  respaldo es contrato observable, las referencias lo reflejan. No
  existe directorio `product-docs/`.
- **PRD:** el conjunto es un hito ligero sin épica: no hay PRD.
- **Lecciones:** `revision-tecnica-subagente` — la revisión técnica
  la hace un subagente con capacidad de ejecutar comandos;
  `documentacion-viva` — nada de detalles históricos puntuales en
  la documentación viva. `promocion-de-tareas` no aplica.
- **Decisiones:**
  - `D006` — la copia de seguridad se descartó como *resolución*
    de colisión, no como respaldo; «puede añadirse si aparece la
    necesidad» y esta tarea es esa necesidad.
  - `D007` — el lock registra recursos del paquete; el respaldo es
    territorio de la herramienta y no entra en `files`.
  - `D010` — `.teleprompter/` es namespace reservado gestionado.
  - `D015`/`D016` — un `conflict` `removal` resuelto `overwrite`
    elimina (`remove`): su contenido previo también admite
    respaldo antes del borrado.

## Conectividad


**Veredicto: conectada.**

Todo lo que la tarea asume existe: `plan.conflicts` y
`resolveConflicts` (`src/plan.js`) entregan los conflictos con su
`resolution`; `executePlan` (`src/execute.js`) es el punto donde el
`overwrite` y el `remove` de los `removal` se materializan, con la
guarda `resolvesUnder` ya aplicada a cada escritura; `MANAGED_DIR`
(`src/paths.js`) fija el namespace `.teleprompter/` donde el respaldo
vivirá; y `executeAndReport`/`settleConflicts` (`src/cli.js`) son la
superficie donde reportarlo. No falta capacidad base: la tarea decide
la forma del respaldo dentro de su propio alcance.

## Plan técnico


El plan resuelto llega a `executePlan` (`src/execute.js`), que aplica
cada acción: el `overwrite` hace `rm` del destino antes de copiar y el
`remove` de un conflicto `removal` lo borra —ambos pasos destructivos
ya llevan la guarda `resolvesUnder`—. El respaldo es una escritura
previa a ese paso, limitada a las entradas `status: 'conflict'` con
`resolution: 'overwrite'`; la ubicación se anota en la acción aplicada
y `executeAndReport` (`src/cli.js`) la presenta.

- [x] Fijar la convención del respaldo: raíz `.teleprompter/backups/`
  y nombre de operación `<AAAAMMDDTHHMMSSZ>-<paquete>[@<versión-registrada>]` —
  el `@versión` solo cuando el lock registra una instalación previa del
  paquete— con un espejo de las rutas relativas de los targets dentro.
  - Aporta: fija la forma y estructura que la tarea manda decidir:
    inspeccionable y restaurable con una copia simple, orden
    cronológico y distinción entre operaciones sucesivas, atribuible
    al paquete y a la versión desplazada.
  - Contexto: `.teleprompter/` es namespace propio (D010) y ningún
    `target` puede apuntar dentro (`manifest.js`); el respaldo no
    entra en el lock (D007); sin registro previo el contenido
    desplazado era ajeno y el nombre va sin `@`.
- [x] Añadir en `execute.js` la copia de respaldo de un target del
  destino a su ruta espejo, reutilizando la semántica de
  `copyResource` —enlaces como enlaces, árboles enteros—.
  - Aporta: una sola forma de copiar; el respaldo preserva
    exactamente lo que se va a destruir.
- [x] En `executePlan`, antes del paso destructivo de cada entrada
  `conflict` resuelta `overwrite` —incluidos los `removal`, que
  ejecutan `remove`—, copiar el destino a su ruta espejo pasando la
  guarda `resolvesUnder` y anotar la ubicación en la acción aplicada.
  - Aporta: el respaldo ocurre justo antes de la destrucción con el
    alcance exacto —ni `skip`, ni `identical`, ni `create`, ni
    `update`/`managed-update`— y deja en `applied` el dato que el
    informe necesita.
  - Contexto: `update`/`managed-update` también producen la acción
    `overwrite` pero no son conflictos: la condición es sobre
    `status` + `resolution`, no sobre la acción; un `conflict`
    `removal` resuelto `overwrite` se respalda igual porque pierde
    su contenido.
- [x] En `cli.js`, componer el nombre de la operación —marca UTC y
  paquete con la versión registrada cuando la haya—, pasarlo a
  `executePlan` y pre-verificar que la raíz del respaldo resuelve
  bajo el destino antes de escribir nada, solo cuando hay conflictos
  resueltos a sobrescribir.
  - Aporta: un `.teleprompter/` cuya cadena escapa hace el plan no
    ejecutable en lugar de fallar a mitad (D005, misma
    pre-verificación que la guía gestionada); el nombre con paquete
    lo calcula quien conoce el manifiesto y el lock.
- [x] Reportar en `executeAndReport` una sección `respaldo:` con la
  ruta y los targets preservados —en el resultado y en el informe de
  error de ejecución cuando ya hubo respaldo—.
  - Aporta: cumple «la ejecución informa qué se preservó y dónde
    quedó».
- [x] Documentar el respaldo en `manual/referencia-install.md` y
  `manual/referencia-update.md`: ubicación, cuándo se crea y qué
  contiene.
  - Aporta: la ubicación es contrato observable; las referencias de
    colisiones la describen.
- [x] Cubrir la suite de pruebas esperada en `test/`.
  - Aporta: verifica el comportamiento completo y mantiene la
    cobertura del 100 % en `src/`.

## Suite de pruebas esperada


Sin PRD —el hito es ligero—; los casos de uso se derivan del
objetivo: CU-1 respaldo de la sobrescritura de un conflicto, CU-2
alcance limitado a los conflictos sobrescritos, CU-3 respaldos
sucesivos distinguibles, CU-4 comunicación del respaldo.

- CU-1 — `install` con un conflicto resuelto `--force`: el contenido
  previo del destino queda bajo `.teleprompter/backups/` con el mismo
  contenido y su ruta relativa, y el destino queda con lo del paquete
  (O).
- CU-1 — `update` con un conflicto resuelto `overwrite`: el mismo
  comportamiento, con el nombre de la operación llevando la versión
  registrada (I).
- CU-1 — un conflicto `removal` resuelto `overwrite`: el contenido
  retirado queda respaldado antes del borrado (B).
- CU-1 — un conflicto sobre un directorio preserva el árbol completo;
  un conflicto sobre un enlace lo preserva como enlace (B).
- CU-2 — un conflicto resuelto `skip` no genera respaldo (Z).
- CU-2 — un plan sin conflictos —`create`, `identical`,
  `managed-update`— no genera respaldo (Z).
- CU-2 — una resolución interactiva mixta respalda solo los
  conflictos aceptados (M).
- CU-3 — dos operaciones con respaldo producen dos directorios
  distintos (M).
- CU-4 — la salida comunica que hubo respaldo y dónde quedó (I).
- `--dry-run` no crea respaldo y el respaldo no aparece entre `files`
  del lock (I).
- Un fallo de ejecución tras respaldar informa igualmente de la
  ubicación del respaldo (E).

## Desviaciones del plan


- **También se documentó el respaldo en `docs/instalador.md`.** El
  plan pedía las dos referencias del manual; el contrato de dominio
  describe la misma política de colisiones y quedaba desactualizado.
  Decisión: actualizarlo en la misma acción —el respaldo es contrato
  observable y la sección «Colisiones» es su lugar.
- **La marca temporal lleva milisegundos.** La convención declarada
  era `<AAAAMMDDTHHMMSSZ>` y la implementación produce
  `<AAAAMMDDTHHMMSS.mmmZ>`. Decisión: conservar los milisegundos
  —ordenan mejor y evitan la colisión de dos operaciones del mismo
  paquete en el mismo segundo— y registrarlo aquí porque difiere del
  formato aprobado. Detectado en la revisión técnica (F2).

## Revisión

- Subagente: 2026-10-19 — Aprueba
- Usuario (ejecución): 2026-10-21 — Aprueba
- Usuario (cierre): 2026-10-21 — Aprueba
