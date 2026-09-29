# Formato de paquete: contrato declarativo para configuración de agentes

> **Tipo:** idea de épica — conjunto (complejidad media)
> **Fecha:** 2026-09
> **Orden sugerido:** 1 de 3 — es la idea estructural: sin un contrato de
> qué es un paquete, no hay nada que instalar ni reportar.
> **Procesada en:** docs/proposals/001-formato-paquete/

## Problema

La configuración de agentes de IA —skills, reglas, guías de estilo,
plantillas— se traslada hoy entre proyectos copiando archivos a mano y
describiendo en lenguaje natural qué hay que ajustar. A quien escribe la
configuración le cuesta expresar qué es reutilizable y qué es específico
del proyecto; a quien la consume le cuesta saber qué recibió, de qué
versión y en qué orden debía aplicarse. Nada convierte un conjunto de
recursos en algo instalable: cada traslado es un acuerdo informal que hay
que renegociar en cada repositorio.

## Qué desbloquea

- **Paquetes consumibles:** un conjunto de recursos con manifiesto puede
  producirse una vez e instalarse en repositorios distintos.
- **Versionado explícito:** el manifiesto declara qué versión es, lo que
  hace posible razonar sobre actualizaciones y compatibilidad.
- **Personalización declarada:** las instrucciones de adaptación al
  contexto viajan con el paquete en lugar de vivir solo en la memoria
  del autor.

## Flujos de trabajo que se hacen viables

- Un autor empaqueta su `.agents/skills/` —como el de este
  repositorio— en un directorio con manifiesto y lo comparte.
- Un consumidor inspecciona el manifiesto antes de instalar y sabe qué
  recursos recibirá y qué personalización se le pedirá.
- Un paquete evoluciona: la versión nueva declara qué cambió respecto a
  la instalada.

## Ventajas como producto

- **Base estructural:** todo lo demás del producto —instalador,
  handoff— consume este contrato; definirlo primero fija el
  vocabulario del proyecto.
- **Posicionamiento:** un formato de paquete es el artefacto que podría
  convertirse en convención compartida entre proyectos y equipos.

## Tensión que introduce en el roadmap

Condiciona a sus hermanas: `motor-instalacion` opera sobre paquetes con
este formato, y `personalizacion-guiada` vive dentro de él —las
instrucciones de adaptación son contenido que el formato debe prever.
Compite con ellas por atención de diseño, porque las decisiones del
formato —dónde viven los recursos, cómo se declaran las instrucciones de
personalización— se propagan a ambas; conviene cerrarla antes de
construir sobre ella.
