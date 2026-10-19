# Respaldar los conflictos sobrescritos en .teleprompter/

## Estado

[ ] Pendiente | [~] En progreso | [r] En revisión | [x] Completada | [!] Bloqueada

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

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
