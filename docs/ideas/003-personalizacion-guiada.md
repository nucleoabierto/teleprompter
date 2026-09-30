# Personalización guiada: instrucciones del mantenedor para adaptar el paquete

> **Tipo:** idea de flujo — conjunto (complejidad media)
> **Fecha:** 2026-09
> **Orden sugerido:** 3 de 3 — presupone el formato de paquete, donde
> vive el artefacto, y completa la experiencia que el instalador
> cierra.
> **Procesada en:** docs/proposals/003-personalizacion-guiada/

## Problema

Los recursos de un paquete están pensados para adaptarse al proyecto
que los recibe: nombres, rutas, convenciones, decisiones locales. Hoy
esa adaptación depende de que quien instala descubra por su cuenta qué
es genérico y qué es específico, o de que el autor del paquete lo
explique en cada ocasión. Quien mejor sabe qué hay que personalizar —el
mantenedor del paquete— no tiene un canal declarado para decirlo.

## Qué desbloquea

- **Personalización declarada por el mantenedor:** el paquete trae sus
  propias instrucciones de adaptación, con la forma que el mantenedor
  elija: variables a sustituir, instrucciones en texto plano o una
  combinación de ambas.
- **Adaptación sin descubrimiento:** el agente del repositorio destino
  recibe una guía accionable en lugar de inferir qué personalizar.
- **Intención preservada:** el cómo de la adaptación lo define quien
  conoce el paquete, no quien lo encuentra por primera vez.

## Flujos de trabajo que se hacen viables

- Un mantenedor escribe junto al paquete las instrucciones de
  personalización; cada instalación las entrega al destinatario.
- El agente del repositorio destino lee las instrucciones y ejecuta la
  adaptación como parte de la instalación o de su primera sesión.
- El humano revisa las mismas instrucciones para entender qué debe
  cambiar el paquete en su proyecto.

## Ventajas como producto

- **Diferenciador:** la personalización guiada es lo que separa a
  Teleprompter de un copiador de archivos: no solo mueve recursos,
  transfiere el criterio para adaptarlos.
- **Rol del mantenedor:** el producto reconoce que cada paquete tiene
  un autor con criterio propio y le da un lugar para expresarlo.

## Tensión que introduce en el roadmap

Comparte frontera con `formato-paquete`: las instrucciones de
personalización son contenido del paquete, así que el formato debe
prever dónde viven y cómo se declaran; si se decide tarde, el formato
tendrá que reabrirse. Con `motor-instalacion` la relación es de
entrega: el motor instala el artefacto y lo presenta al destinatario,
pero no decide su contenido.
