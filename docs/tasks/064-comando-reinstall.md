# El comando `reinstall` de punta a punta

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

`teleprompter reinstall` recorre el registro del destino, obtiene
cada unidad anclada a su commit registrado, presenta el plan del
conjunto antes de escribir y lo ejecuta con la política de
conflictos y el respaldo vigentes, dejando cada entrada
reescrita como la de una instalación.

## Dependencias

- 063 —la reobtención anclada—.

## Entrada

- `src/usage.js`: gramática —`reinstall` sin argumentos ni
  opciones propias, con `--force`/`--skip`/`--dry-run` como sus
  hermanas de escritura—, `USAGE` y `HELP`.
- `src/cli.js`: el despacho por comando.
- `src/commands.js`: el pipeline compartido —`obtainPackage`,
  `verifyPackage`, `buildPlan`, `settleConflicts`,
  `checkGuideDestination`, `checkBackupDestination`,
  `backupName`, `executePlan`, `installPersonalization`,
  `reportExecutionFailure`— e `installUnit` como referencia de
  relectura del registro por unidad.
- `src/lock.js`: `readLock` y el recorrido de entradas que
  `outdated` ya usa.
- `manual/`: la página de referencia por comando y las guías
  numeradas por flujo.
- `test/`: la suite por módulo y el e2e de comandos.

## Resultado esperado

- `reinstall` sin argumentos reinstala todo el registro; no
  acepta posicionales ni opciones ajenas —la selección parcial
  quedó fuera de alcance—.
- La obtención de todas las unidades precede al plan: una
  unidad no reproducible —origen inalcanzable, `origin` ausente,
  `commit` no registrado, ruta local desaparecida, miembro
  disuelto— se reporta con su motivo y la operación aborta sin
  escribir nada, listando todas las unidades afectadas.
- El plan del conjunto se imprime por unidad antes de las
  decisiones. Por unidad es el plan de instalación sobre el
  árbol anclado: recurso intacto → `identical`, ausente →
  `create`, divergente o ajeno en un target → `conflict`, cuyo
  `overwrite` restaura el contenido declarado —con respaldo— y
  cuyo `skip` lo conserva. Cada divergencia es una sola
  decisión.
- `--dry-run` corta tras el plan sin escribir; la ejecución
  corre unidad a unidad; un fallo a mitad reporta lo aplicado y
  lo pendiente con el idioma de fallo de ejecución vigente; cada
  entrada queda reescrita con su `origin` intacto y
  `installedAt` renovado.
- El registro vacío o corrupto se comporta como en las demás
  operaciones —«no hay paquetes instalados» / degradación con
  aviso—.
- La ayuda describe el comando —`HELP` y `USAGE`— y el manual
  gana su página de referencia y la guía del flujo.

## Criterios de calidad

- Nada se escribe —ni destino, ni registro, ni respaldos— si
  cualquier unidad no es obtenible o el conjunto no es
  ejecutable (D005).
- Una unidad ya conforme se anuncia como tal dentro del
  conjunto, sin acciones.
- `npm test` en verde con el 100 % de cobertura en `src/`, e2e
  del flujo: un registro de dos unidades, una de ellas con
  deriva, que `--force` devuelve al estado declarado, con
  respaldo.

## Procedimiento sugerido

1. Gramática y ayuda en `usage.js`; despacho en `cli.js` hacia un
   `runReinstall` hermano de `runUninstall`.
2. Fase de obtención del conjunto —cada entrada a su unidad
   anclada con la primitiva del borrador 01, acumulando
   diagnósticos— y aborto reportado antes de cualquier plan.
3. Por unidad, el pipeline de instalación compartido con el
   `source` y el `commit` propios de su entrada: verificar,
   planear, decidir, preflight, ejecutar y reescribir el
   registro, con relectura por unidad como en `installUnit`.
4. Página `referencia-reinstall.md` del manual y la guía del
   flujo, con su entrada en la gramática de ayuda.
5. Tests de unidad por camino y el e2e del criterio.

## Notas

- A commit fijo, el manifiesto obtenido es el que produjo la
  instalación: el plan de reproducción coincide con el plan de
  instalación y no hay retirados reales. El caso «registrado
  pero ya no traído» solo existe si la entrada fue alterada a
  mano; tras la reescritura esos targets quedan fuera del
  registro, intactos en disco y ya no gestionados —fuera de
  alcance—.
- El nombre `reinstall` fue decisión de la revisión: instalar
  otra vez lo declarado. `reproduce` y extender `install` sin
  espec quedaron como alternativas —la primera sugiere una
  operación distinta de instalar, la segunda sobrecarga la
  gramática del alias implícito—. La expectativa de
  `reinstall <paquete>` por paralelismo con `uninstall` se
  cierra con la gramática: no acepta posicionales.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
