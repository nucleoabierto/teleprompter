# Motor de instalación: CLI que lleva paquetes a repositorios vivos

> **Tipo:** idea de épica — conjunto (complejidad alta)
> **Fecha:** 2026-09
> **Orden sugerido:** 2 de 3 — presupone el formato de paquete; es la
> pieza que convierte el contrato en experiencia ejecutable.

## Problema

Instalar configuración en un repositorio con trabajo previo es una
operación con riesgo: puede haber archivos con el mismo nombre,
precondiciones que no se cumplen o decisiones de ubicación que dependen
de la estructura del proyecto. Hoy esa operación se hace a mano, sin
validación previa ni registro de qué se pisó o se fusionó; cada
instalación es irrepetible y sus errores se descubren tarde, cuando ya
se mezclaron con el trabajo del proyecto.

## Qué desbloquea

- **Instalación segura y repetible:** validar precondiciones antes de
  tocar nada y resolver colisiones con una política declarada convierte
  la instalación en una operación confiable.
- **Ejecución con forma de instalador:** ejecutar, validar, instalar,
  reportar — el usuario sabe en cada momento qué está pasando.
- **Herramienta autónoma:** la lógica vive en un CLI invocable, no en el
  conocimiento de quien instala.

## Flujos de trabajo que se hacen viables

- El usuario ejecuta el CLI apuntando a un paquete y a un repositorio
  destino; la herramienta valida e informa antes de escribir.
- Ante una colisión —un recurso con el mismo nombre ya existe—, la
  política definida decide y deja constancia de la decisión.
- La misma instalación se repite en varios repositorios con resultados
  predecibles.

## Ventajas como producto

- **Forma reconocible:** comportarse como un instalador tradicional
  reduce la curva de adopción: el usuario ya sabe qué esperar de la
  herramienta.
- **Confianza estructural:** la validación y la política de colisiones
  son lo que hace la herramienta usable sobre repositorios reales, no
  solo sobre casos ideales.

## Tensión que introduce en el roadmap

Depende de `formato-paquete`: el motor consume el manifiesto y las
instrucciones de instalación que aquel declara, así que no puede
cerrarse antes que ella. Se relaciona con `personalizacion-guiada`
por entrega: el motor instala el artefacto de personalización y lo
presenta al destinatario, pero no decide su contenido.
