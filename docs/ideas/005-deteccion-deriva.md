# Detección de deriva: saber si lo instalado sigue como se instaló

> **Tipo:** idea de funcionalidad — tamaño tarea (complejidad media)
> **Fecha:** 2026-09
> **Procesada en:** docs/proposals/005-deteccion-deriva/
> **Orden sugerido:** 2 de 3 — presupone la lectura del registro y su
> diagnóstico es la entrada natural de la actualización.

## Problema

Los recursos que un paquete instala conviven con el trabajo del
repositorio: el usuario los edita, los adapta, a veces los borra. El
registro guarda los hashes de lo que se escribió, pero nada compara
ese estado declarado con el estado actual. La consecuencia es una
incertidumbre silenciosa: no se puede distinguir «tal cual se
instaló» de «modificado a propósito» ni de «roto», y esa distinción
es justo la que cualquier decisión posterior —actualizar, regenerar,
dejar como está— necesita.

## Qué desbloquea

- **Estado real del destino:** una verificación que contrasta cada
  recurso registrado con lo que hay ahora en disco: intacto,
  modificado, ausente.
- **Ediciones del usuario reconocidas:** las adaptaciones locales
  dejan de ser indistinguibles de una instalación prístina.
- **Diagnóstico antes que acción:** una base para decidir con
  información qué merece actualización, qué se conserva y qué se
  perdió.

## Flujos de trabajo que se hacen viables

- Un usuario ejecuta una verificación del destino y ve qué recursos
  instalados siguen intactos, cuáles editó y cuáles faltan.
- Antes de tocar un skill instalado, alguien comprueba si el archivo
  que ve es el original del paquete o una adaptación local.
- Un agente del repositorio detecta que un recurso gestionado fue
  borrado y lo reporta en lugar de asumir que todo está en su sitio.

## Ventajas como producto

- **El registro cobra sentido:** los hashes del lock dejan de ser
  datos dormidos y pasan a responder una pregunta real del usuario.
- **Respeto por la adaptación local:** el producto reconoce que el
  destino es territorio del usuario y que sus ediciones son
  información, no ruido.

## Tensión que introduce en el roadmap

Es hermana de `listado-paquetes-instalados` —misma lectura del lock,
semántica distinta: esta compara, aquella solo muestra— y precede a
`actualizacion-entre-versiones`, porque actualizar sin saber qué se
modificó es sobrescribir a ciegas el trabajo del usuario; la
comparación de hashes ya existe como insumo del instalador, así que
el esfuerzo es de presentación y clasificación más que de mecanismo.
