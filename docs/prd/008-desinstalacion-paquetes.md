# PRD — Desinstalación de paquetes

El ciclo de vida de un paquete no tiene salida —se instala, verifica y
actualiza, pero nada lo retira— y retirar a mano deja el registro
afirmando lo que ya no existe. El conjunto busca la retirada
verificable: quitar un paquete con lo que registró, visible antes de
borrar, y un registro que deja de afirmar lo que deja de existir.

## Usuarios

Quien mantiene un repositorio destino con paquetes instalados y quiere
probar, reemplazar o limpiar.

## Casos de uso

- **CU-1 — Retirar un paquete instalado:** el consumidor pide retirar
  un paquete, ve el plan de retirada completo y, al ejecutarse, los
  recursos registrados desaparecen del destino y el paquete deja de
  constar.
  - Un recurso registrado ya ausente limpia su entrada igualmente.
  - La guía gestionada de personalización se retira con su paquete.
  - Los recursos `skip` no se tocan: la instalación nunca los escribió.
  - Pedir un paquete no instalado, o invocar sin registro, es un error
    de invocación.
  - `--dry-run` muestra el plan de retirada sin escribir nada.
- **CU-2 — Decidir sobre recursos modificados:** un recurso registrado
  con cambios locales se anuncia con el diff del contenido que se
  retiraría y se decide quitarlo —con respaldo previo— o conservarlo.
  - Sin consola ni opciones, la operación lista las divergencias con su
    diff y aborta sin escribir.
  - `--force` retira todas las divergencias y `--skip` las conserva
    todas; ambas son excluyentes.
  - Lo conservado queda en disco pero fuera del registro: deja de
    pertenecer al paquete retirado.

## Comportamiento esperado

- **Plan de retirada:** se presenta completo antes de borrar —una línea
  por recurso registrado—; un plan no ejecutable aborta sin escribir
  nada.
- **Retirada:** solo borra rutas registradas que resuelven dentro del
  destino; los respaldos históricos de `.teleprompter/backups/` se
  conservan.
- **Registro:** la entrada del paquete desaparece al terminar; el lock
  persiste aunque `packages` quede vacío.
- **Superficies de decisión:** las mismas que en `install`/`update` —
  pregunta interactiva con diff previo, flags excluyentes, listado con
  diff y aborto sin consola—.

## Criterios de éxito

- Un paquete se retira de extremo a extremo sin editar nada a mano.
- El registro nunca afirma lo que no existe tras la operación.
- `list` y `check` describen el destino real después de la retirada.

## Fuera de alcance

- Retirada parcial —solo algunos recursos— o masiva —varios paquetes o
  todo el destino—.
- Purgado de históricos: los respaldos ya escritos no se tocan.
- Interdependencia entre paquetes: sin análisis de recursos reclamados
  por varios, más allá del tratamiento conservador por deriva.
- Reconstrucción del destino ni deshacer la retirada.
