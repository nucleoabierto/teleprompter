# Desinstalación de paquetes: salida limpia del ciclo de vida

## Estado

[ ] Borrador | [p] Pendiente de revisión | **[a] Aprobada** | [d] Descartada

## Problema

El ciclo de vida de un paquete instalado no tiene salida: se puede
instalar, verificar su deriva y actualizarlo a otra versión, pero no hay
forma de retirarlo del destino. Quien ya no quiere un paquete solo puede
borrar sus recursos a mano —si recuerda cuáles eran— y dejar el registro
tal cual, o editarlo a mano.

Eso deja dos estados incoherentes: el destino conserva recursos que ya
no se quieren, o el registro sigue afirmando instalado lo que ya se
borró. La deriva que la verificación reporta después —ausentes,
modificados— es en parte consecuencia de esa ausencia de salida: el
estado real y el declarado divergen sin vía legítima de reconciliarlos.

Afecta a cualquier consumidor que pruebe un paquete, lo reemplace por
otro o limpie un destino acumulado; el coste de no resolverlo es un
registro que deja de ser fiable como memoria del destino.

## Oportunidad

Resolverlo da una retirada verificable: quitar un paquete y solo sus
recursos registrados, con la operación visible antes de ejecutarse y el
registro actualizado de forma coherente —lo que deja de afirmar, deja de
constar—. Supera a la alternativa manual —borrar ficheros y editar el
registro a mano— en exactitud y seguridad, y cierra el ciclo de vida que
el producto ya afirma tener, sirviendo además de base para reconstruir
el destino desde el registro.

## Forma de solución

El producto gana una operación nueva del ciclo de vida —retirar un
paquete— que, ejecutada desde la raíz del destino y nombrando el paquete
por su entrada en el registro, muestra antes de borrar todo lo que se
quitaría, decide caso a caso lo que fue modificado a mano, ejecuta la
retirada y deja el registro sin la entrada del paquete. Categoría: flujo
nuevo —hoy el objetivo no tiene camino dentro del producto: solo se
logra saliendo a la edición manual—.

## Solución

Un subcomando `uninstall <paquete>` del ciclo de vida, ejecutado desde
la raíz del destino como `update`, `list` o `check`. Lee la entrada del
paquete en el registro y calcula un plan de retirada completo antes de
borrar —misma disciplina del plan de instalación—: una línea por cada
recurso registrado del paquete, presentada antes de tocar el disco. La
retirada elimina exactamente lo que la instalación escribió —los
`target` registrados, incluida la copia gestionada de la guía de
personalización—, tolera los recursos registrados ya ausentes, nunca
toca lo que la instalación omitió (`skip`) ni lo que nunca registró, y
reescribe el registro sin la entrada del paquete —el lock se conserva
aunque quede vacío—.

Los recursos que divergen de lo registrado —modificados a mano— no se
borran a ciegas: pasan a decisión con la misma política de colisiones
del resto del producto —pregunta interactiva con el diff del contenido
local que se retiraría, `--force` que los retira, `--skip` que los
conserva y, sin consola ni flags, listado con diff y aborto sin
escribir—. Una divergencia decidida a retirar se respalda en
`.teleprompter/backups/` antes de borrarse, y lo conservado queda en
disco pero fuera del registro del paquete retirado. Pedir un paquete no
instalado es error de invocación, y `--dry-run` muestra el plan de
retirada sin escribir.

## Alternativas consideradas

- Un caso particular de `update` —una actualización «a nada»—: se
  descarta porque la retirada no tiene versión entrante, origen ni
  manifiesto; la maquinaria de actualización resolvería contra un
  paquete vacío y la operación quedaría contada con un vocabulario
  —versión, fuente— que no le pertenece.
- Ampliar la verificación para que ofrezca retirar lo que diverge: se
  descarta porque la verificación es una superficie de solo lectura por
  diseño —su contrato es informar sin escribir— y además solo
  alcanzaría recursos con deriva, no la retirada completa de un paquete
  intacto, que es el caso dominante.
- Documentar el borrado manual como flujo soportado: se descarta porque
  perpetúa el problema —la retirada a mano es exactamente lo que hace
  mentir al registro—.

## Fuera de alcance

- Retirada parcial: quitar solo algunos recursos de un paquete
  conservando el resto.
- Retirada múltiple o total: varios paquetes en una invocación o vaciar
  el registro entero.
- Purgado de históricos en `.teleprompter/`: los respaldos de
  conflictos ya escritos se conservan —la guía gestionada del paquete
  sí se retira por ser recurso registrado—.
- Interdependencia entre paquetes: no hay análisis de recursos
  reclamados por varios, más allá del tratamiento conservador por
  deriva.
- Reconstrucción del destino (idea 009) ni deshacer la retirada.

## Investigaciones de apoyo

- Ninguna.

## Borradores

- `docs/tasks/042-uninstall-retira-paquete-intacto.md` — `uninstall` retira un
  paquete instalado intacto
- `docs/tasks/043-resolucion-divergencias-retirada.md` — resolución de divergencias
  en la retirada (depende de 01)

## Revisión

- Usuario: 2026-10-23 — Aprueba
