# `uninstall` retira un paquete instalado intacto

## Estado

**[ ] Pendiente** | [~] En progreso | [r] En revisión | [x] Completada | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

Añadir el subcomando `uninstall <paquete>` al ciclo de vida: desde la
raíz del destino, lee la entrada del paquete en el registro, presenta un
plan de retirada completo antes de borrar —una línea por recurso
registrado—, elimina exactamente lo que la instalación escribió y
reescribe el registro sin la entrada del paquete. Es el camino feliz del
flujo: los recursos registrados con deriva quedan conservados con aviso
a la espera de la política de divergencias del borrador siguiente.

## Dependencias

- Ninguna.

## Entrada

- `src/cli.js` — gramática de comandos, `parseArgs`, el reparto de
  `main`, la ayuda estructurada y `originOf`; `update`, `list`, `check`
  y `guide` ya operan sobre el directorio de trabajo como referencia.
- `src/lock.js` — `readLock`, `lockEntries`, `writeLock` y la forma del
  registro: la guía gestionada de `personalization` figura en `files`
  con su acción y su hash, como cualquier otro recurso.
- `src/plan.js` y `src/drift.js` — el vocabulario de plan y la
  clasificación por deriva (`classifyResource`) para decidir qué
  retirar; `recordedChainSafe` en `src/paths.js` como defensa de rutas
  registradas.
- `src/execute.js` — la eliminación de recursos con la guarda de
  escritura dentro del destino.
- `test/` — las suites de CLI, plan y ejecución como modelo de cobertura.

## Resultado esperado

- `teleprompter uninstall <paquete>` muestra el plan de retirada —una
  línea por cada recurso registrado del paquete— antes de borrar nada,
  y elimina los recursos registrados que siguen intactos, incluida la
  copia gestionada de la guía de personalización.
- Un recurso registrado ya ausente no es un error: la retirada limpia su
  entrada igualmente —afirmar que se quitó lo que ya no existe sería
  falso, pero la entrada del paquete sí se retira—.
- Las entradas `skip` no se retiran —la instalación nunca las escribió—
  ni generan acción; caen con la entrada del paquete.
- Un recurso registrado con deriva se conserva y se anuncia como tal en
  el resultado —la política de divergencias llega en el borrador 02—.
- Terminada la retirada, el registro queda reescrito sin la entrada del
  paquete; si era el último, `packages` queda vacío y el lock se
  conserva.
- Pedir un paquete no instalado, o invocar sin registro, es error de
  invocación (código 4); `--dry-run` muestra el plan de retirada sin
  escribir recursos ni registro.
- `uninstall` figura en la ayuda general y tiene su sinopsis, como el
  resto de comandos.

## Criterios de calidad

- El plan de retirada completo se presenta antes de cualquier borrado;
  un plan no ejecutable aborta sin escribir nada.
- Solo se borran rutas registradas que resuelven dentro del destino; una
  ruta registrada insegura no se toca.
- El registro resultante refleja el estado real: lo borrado deja de
  constar, lo conservado por deriva también sale de la entrada —deja de
  pertenecer al paquete—.
- `npm test` en verde con el 100 % de cobertura exigido en `src/`.

## Procedimiento sugerido

1. Definir el vocabulario del plan de retirada —la marca por recurso y
   su presentación— apoyándose en la clasificación por deriva sobre las
   entradas `files` del paquete.
2. Cablear el subcomando: gramática, reparto en `main`, ayuda y
   `--dry-run`; el paquete se nombra por su clave del registro.
3. Ejecutar la retirada sobre los recursos intactos y reescribir el
   registro sin la entrada, con informe de lo retirado y lo conservado
   por deriva.
4. Cubrir la suite: paquete intacto, recursos ausentes, entradas `skip`,
   guía gestionada, último paquete, paquete no instalado y `--dry-run`.

## Notas

- El nombre `uninstall` casa con `install`; otras opciones (`remove`,
  `uninstall` como alias de otro nombre) se deciden al planear la tarea,
  no aquí.
- Un directorio registrado intacto se retira entero; el que contiene
  contenido no registrado diverge y se conserva hasta el borrador 02.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
