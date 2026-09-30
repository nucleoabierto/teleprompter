# Actualización entre versiones: instalar de nuevo sobre lo ya instalado

> **Tipo:** idea de flujo — conjunto (complejidad alta)
> **Fecha:** 2026-09
> **Orden sugerido:** 3 de 3 — cierra el ciclo de vida del paquete y
> presupone el registro legible y el diagnóstico de deriva.

## Problema

Un paquete instalado es un punto en el tiempo: el mantenedor publica
una versión nueva y quien lo instaló solo puede repetir la
instalación completa, enfrentando cada recurso como si fuera la
primera vez. No hay noción de «ya tengo la 1.0.0 y viene la 1.2.0»:
sin comparación entre lo instalado, lo modificado localmente y lo
que trae la versión nueva, actualizar significa o sobrescribir todo
—perdiendo adaptaciones— o quedarse congelado en la versión inicial.

## Qué desbloquea

- **Ciclo de vida completo:** el paquete deja de ser una copia que se
  congela al instalar y pasa a tener una trayectoria de versiones en
  el destino.
- **Actualización consciente de la deriva:** el plan distingue
  recursos intactos —actualizables sin pérdida— de recursos que el
  usuario editó, donde la decisión es deliberada.
- **Difusión de mejoras del mantenedor:** las correcciones y
  ampliaciones de un paquete llegan a quienes ya lo instalaron.

## Flujos de trabajo que se hacen viables

- Un usuario instala `user/repo` otra vez y el instalador le muestra
  qué cambió entre su versión y la nueva: recursos nuevos,
  actualizados, eliminados.
- Quien adaptó un skill instalado decide caso a caso qué hacer con
  la versión nueva: adoptarla, conservar la suya o compararlas.
- El mantenedor publica una versión con confianza de que sus
  usuarios pueden recibirla sin perder su trabajo.

## Ventajas como producto

- **El semver del manifiesto se activa:** la versión obligatoria del
  formato —hoy solo informativa— pasa a gobernar una trayectoria
  real de actualización.
- **Canal mantenedor→usuario bidireccional en el tiempo:** el
  producto deja de ser entrega única y se convierte en relación
  continuada entre quien publica y quien instala.

## Tensión que introduce en el roadmap

Es la mayor del conjunto y presupone a sus hermanas: la lectura
presentable del registro (`listado-paquetes-instalados`) y el
diagnóstico de qué se modificó (`deteccion-deriva`) son los insumos
del plan de actualización. También es la que más decisiones difíciles
concentra —qué es una actualización cuando hubo ediciones locales,
qué hace la política de colisiones con recursos modificados— y la que
más riesgo introduce si se hace mal, porque toca trabajo del usuario
que la primera instalación solo evitaba por no existir.
