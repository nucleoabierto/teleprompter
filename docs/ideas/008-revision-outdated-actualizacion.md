# Revisión de desactualizados: saber qué va a actualizar antes de actualizar

> **Tipo:** idea de funcionalidad — tamaño conjunto (complejidad media)
> **Fecha:** 2026-10
> **Orden sugerido:** 2 de 4 — complementa la desinstalación para
> cerrar el ciclo; el usuario la refinó: falta revisar los
> desactualizados antes de decidir

## Problema

`update` exige nombrar el paquete y actúa de inmediato: no hay forma
de preguntar qué paquetes instalados ofrecen versión nueva sin
actualizarlos. Con colecciones el costo crece —un destino puede
tener varias unidades y hay que sondearlas de una en una—. El
consumidor decide a ciegas: o actualiza y mira el plan después, o no
se entera de que hay versiones nuevas.

## Qué desbloquea

- **Revisión previa:** una consulta que compare lo instalado con lo
  que cada origen registrado publica ahora —versión instalada,
  versión disponible— sin escribir nada.
- **Actualización informada:** actualizar lo revisado —un paquete,
  varios o todo lo desactualizado— sabiendo de antemano qué va a
  cambiar.

## Flujos de trabajo que se hacen viables

- Revisar periódicamente qué hay desactualizado y decidir con datos.
- Actualizar todo lo que ofrece versión nueva en una sola
  invocación, con el plan de cada unidad visible.
- Automatizar la revisión en CI sin efectos secundarios.

## Ventajas como producto

- **Ciclo cerrado:** instalar → revisar → actualizar → retirar; la
  revisión es el eslabón que hoy obliga a decidir sin información.
- **Coherente con el plan visible:** la misma filosofía de «plan
  completo antes de escribir», aplicada a la decisión de actualizar.

## Tensión que introduce en el roadmap

Se apoya en la re-resolución de orígenes que D019 dejó materializada
y comparte con `007-desinstalacion-paquetes.md` la lectura del
registro por unidad. Sondea orígenes remotos, así que hereda la
fragilidad de la obtención —la línea «Endurecimiento de la
obtención remota» en Now la beneficia directamente— y introduce la
pregunta de cuántos orígenes sondear en paralelo. No se solapa con
`009-reproduccion-destino-registro.md` —esa reconstruye, esta
revisa— pero ambas amplían la superficie de `update`.
