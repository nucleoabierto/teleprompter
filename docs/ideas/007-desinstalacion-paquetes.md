# Desinstalación de paquetes: salida limpia del ciclo de vida

> **Tipo:** idea de funcionalidad — tamaño conjunto (complejidad media)
> **Fecha:** 2026-10
> **Orden sugerido:** 1 de 4 — cierra el ciclo de vida con lo ya
> construido; el registro ya sabe qué retirar

## Problema

El ciclo de vida de un paquete instalado no tiene salida: `install`
escribe, `update` trae versiones nuevas, pero nada desinstala. El
consumidor que ya no quiere un paquete solo puede borrar sus recursos
a mano —si sabe cuáles eran— y editar o ignorar el registro, que
queda afirmando una instalación que ya no existe. La deriva que
`check` detecta después —ausentes, modificados— es en parte
consecuencia de esa ausencia.

## Qué desbloquea

- **Retirada verificable:** quitar un paquete y solo sus recursos
  registrados, con el plan visible y el registro coherentemente
  actualizado —lo que la desinstalación deja de afirmar, deja de
  constar.

## Flujos de trabajo que se hacen viables

- Probar un paquete y retirarlo sin dejar rastro cuando no convence.
- Reemplazar un paquete por otro que cubre lo mismo, retirando antes
  de instalar.
- Limpiar un destino que acumuló paquetes de pruebas.

## Ventajas como producto

- **Ciclo completo:** el producto afirma instalar, verificar y
  actualizar; la desinstalación es la pieza que hace creíble que el
  registro describe el estado real del destino.
- **Base para la reproducción:** la misma lectura del registro que
  permite retirar permite reconstruir (idea hermana
  `009-reproduccion-destino-registro.md`).

## Tensión que introduce en el roadmap

Compite con ninguna línea abierta y reutiliza la infraestructura del
plan y del registro —es la idea de menor riesgo del conjunto. Los
retirados de `update` (D015) ya resuelven el caso más fino —quitar
contenido intacto—; la desinstalación lo generaliza al paquete
entero. Condiciona a `009-reproduccion-destino-registro.md`, que
comparte la lectura del registro, y a
`008-revision-outdated-actualizacion.md`, con la que forma el ciclo
completo instalar → revisar → actualizar → retirar.
