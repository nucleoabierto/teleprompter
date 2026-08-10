---
idea_slug: teleprompter
domain: configuracion-ia
date: 2026-08-10
skill: evaluar-alcance-idea
profile: full
status: conditional
next: evaluar-conectividad-tecnica
---

# Evaluación y Roadmap de Alcance: teleprompter

## Evaluación Estratégica

- **Veredicto**: Proceder
- **Alineación**: La idea es consistente con la dirección del producto. El README del proyecto indica que Teleprompter es "Instalador de paquetes de configuracion para agentes de IA", lo cual coincide exactamente con la idea evaluada. La idea ES el producto principal del repositorio.
- **Tamaño**: full
- **Justificación**: Producto externo (instalador de paquetes para distribución entre repos) con alcance que sugiere múltiples comportamientos clave (7 comportamientos identificados en el análisis de idea). El profile puede refinarse si el análisis de alcance cambia el panorama.

## Clasificación de Alcance

- **Tipo**: Funcionalidad única
- **Justificación**: El experimento mental de implementación muestra que los componentes identificados (validador de precondiciones, detector/resolvedor de colisiones, instalador de archivos, generador de handoff, gestor de estado, parser de manifiestos, CLI interface) son sub-módulos fuertemente acoplados a la misma feature de instalación. No tienen sentido como PRDs separados porque no pueden entregarse independientemente sin romper el flujo central. Los 3 movimientos identificados en el análisis (paquete, instalación, handoff) no son funcionalidades independientes sino partes del mismo flujo de trabajo: el paquete es el input, la instalación es el proceso central, y el handoff es el output. Cumple criterios de funcionalidad única: dominio único (gestión de paquetes de configuración), implementable por 1-2 personas, no tiene componentes naturales independientes, complejidad técnica manejable en un solo esfuerzo.

## Roadmap de Funcionalidades

### instalador-paquetes-configuracion

- **Alcance**: Instalador CLI de paquetes de configuración para agentes de IA que valida precondiciones, resuelve colisiones, instala recursos, preserva customizaciones, genera handoff, deja huella observable y soporta modo no interactivo para CI.
- **Valor**: Permite a los equipos distribuir, instalar y personalizar configuraciones de agentes IA en cualquier repositorio de forma reproducible y segura, sin perder customizaciones locales, reduciendo el tiempo de onboarding de 10-20 minutos a minutos y eliminando el drift entre repositorios.
- **Depende de**: ninguno
- **Estado**: condicionada

## Desglose: instalador-paquetes-configuracion

### Fases

1. **Core de instalación (MVP)**: Infraestructura CLI básica, parser de manifiestos de paquetes, validador de precondiciones (permisos, espacio, dependencias), detector/resolvedor de colisiones con política básica (sobrescribir/preservar/abortar), instalador de archivos a ubicaciones estándar (.agents/skills/, .agents/rules/, etc.), generador de handoff en formato markdown, registro local de paquetes instalados. Soporta instalación interactiva en repos nuevos o con configuraciones existentes.

2. **Expansión a modo CI y actualizaciones**: Soporte para modo no interactivo (política de colisiones predefinida, validaciones sin prompts), comando de actualización de paquetes (detección de versión instalada vs. nueva versión, delta o reinstalación), comando de desinstalación (detección de archivos modificados post-instalación, preservación o eliminación con confirmación), comando de listado de paquetes instalados. Handoff en formato JSON adicional para consumo por agentes.

3. **Dependencias y validación avanzada**: Soporte para dependencias entre paquetes (resolución automática, instalación en orden, detección de ciclos), validación de post-instalación (parseo de skills, validación de sintaxis de reglas, detección de errores de configuración), políticas de colisiones avanzadas (renombrado automático, merge de archivos, diff interactivo), handoff con recomendaciones de adaptación al contexto específico del repo.

### Decisiones

- **Resuelta (2026-08-10)**: Producto es una herramienta CLI, no un agente de IA - El instalador no toma decisiones de personalización, no adapta recursos al contexto, no ejecuta nada. Solo instala y genera un handoff informativo.
- **Resuelta (2026-08-10)**: Producto es local, no centralizado - No hay servidor ni repositorio central que mantenga el estado de todos los repos. Cada repo tiene su propia instalación y el instalador trabaja localmente.
- **Resuelta (2026-08-10)**: Producto no es plataforma de distribución - El instalador asume que los paquetes existen en algún lugar (un repo, un archivo, un URL), pero no define ni implementa el canal de distribución. Esa decisión se difiere al análisis posterior.
- **Pendiente**: Canal de distribución del paquete - Opciones: archivo local, repo git, URL, binario, npm, sistema de paquetes. Trade-offs: simplicidad vs. descubribilidad vs. control de versiones.
- **Pendiente**: Formato del manifiesto del paquete - Opciones: YAML, JSON, TOML. Trade-offs: legibilidad vs. parseo vs. ecosistema existente.
- **Pendiente**: Estructura exacta del paquete y del repo destino - Opciones: convención fija (.agents/skills/, .agents/rules/) vs. configurable. Trade-offs: simplicidad vs. flexibilidad.
- **Pendiente**: Política de colisiones por defecto - Opciones: sobrescribir, preservar, abortar, preguntar. Trade-offs: seguridad vs. UX vs. comportamiento en CI.
- **Pendiente**: Soporte para desinstalación - Opciones: soportar desde el inicio vs. diferir a fase 2 vs. no soportar. Trade-offs: completeness vs. complejidad vs. timeline.
- **Pendiente**: Soporte para dependencias entre paquetes - Opciones: soportar desde el inicio vs. diferir a fase 3 vs. no soportar. Trade-offs: poder de expresión vs. complejidad de resolución vs. timeline.
- **Pendiente**: Validación de post-instalación - Opciones: validar desde el inicio vs. diferir a fase 3 vs. no validar. Trade-offs: calidad vs. responsabilidad del mantenedor vs. complejidad.
- **Pendiente**: Instalación en repo nuevo vs. repo con configuraciones existentes - Opciones: mismo flujo con detección vs. flujos distintos. Trade-offs: simplicidad vs. UX específica.
- **Pendiente**: Handoff: formato y ubicación - Opciones: solo stdout, solo archivo, ambos; formato: markdown, JSON, ambos. Trade-offs: legibilidad vs. consumibilidad por agentes vs. ruido.
- **Pendiente**: Actualización de paquete ya instalado - Opciones: delta vs. reinstalación completa. Trade-offs: eficiencia vs. simplicidad vs. preservación de customizaciones.

## Decisiones Pendientes

### Críticas (bloquean avance)

- Ninguna

### Importantes (afectan calidad)

- Política de colisiones por defecto - Opciones: sobrescribir, preservar, abortar, preguntar. Impacto si no se resuelve: UX inconsistente, riesgo de perder customizaciones, comportamiento impredecible en CI.
- Soporte para desinstalación - Opciones: soportar desde el inicio, diferir a fase 2, no soportar. Impacto si no se resuelve: incompleteness del producto, dificultad de rollback, user experience fragmentada.
- Soporte para dependencias entre paquetes - Opciones: soportar desde el inicio, diferir a fase 3, no soportar. Impacto si no se resuelve: limitación en expresividad de paquetes complejos, necesidad de instalación manual en orden.
- Validación de post-instalación - Opciones: validar desde el inicio, diferir a fase 3, no validar. Impacto si no se resuelve: configuraciones rotas instaladas sin detección, debugging costoso, confianza del usuario afectada.
- Instalación en repo nuevo vs. repo con configuraciones existentes - Opciones: mismo flujo con detección, flujos distintos. Impacto si no se resuelve: UX subóptima para uno de los casos, confusión del usuario.
- Handoff: formato y ubicación - Opciones: solo stdout, solo archivo, ambos; formato: markdown, JSON, ambos. Impacto si no se resuelve: handoff no consumible por agentes, o no legible por humanos, o ruido en el repo.
- Actualización de paquete ya instalado - Opciones: delta, reinstalación completa. Impacto si no se resuelve: customizaciones perdidas en actualizaciones, o actualizaciones costosas e innecesarias.

### Menores (ideal resolver)

- Canal de distribución del paquete - Opciones: archivo local, repo git, URL, binario, npm, sistema de paquetes. Impacto si no se resuelve: UX de obtención de paquetes, descubribilidad, control de versiones.
- Formato del manifiesto del paquete - Opciones: YAML, JSON, TOML. Impacto si no se resuelve: legibilidad para humanos, parseo por herramientas, adopción por mantenedores.
- Estructura exacta del paquete y del repo destino - Opciones: convención fija, configurable. Impacto si no se resuelve: simplicidad de implementación vs. flexibilidad para diferentes ecosistemas.

## Recomendación

- **Empezar con**: instalador-paquetes-configuracion
- **Next step**: evaluar-conectividad-tecnica (condicionado)
- **Justificación**: Es una funcionalidad única cohesiva, por lo que no requiere priorización entre múltiples funcionalidades. El siguiente paso natural es evaluar la conectividad técnica con el codebase actual. Sin embargo, hay 7 decisiones Importantes sin resolver que afectan la calidad del diseño. El avance está condicionado: el usuario debe ser alertado y tener la opción de responder estas preguntas antes de avanzar, o puede avanzar con defaults conservadores.

## Gate de Avance (Fase F)

### Inventario de preguntas identificadas

**Críticas:**

- Ninguna identificada durante el análisis.

**Importantes:**

- Política de colisiones por defecto - Pendiente
- Soporte para desinstalación - Pendiente
- Soporte para dependencias entre paquetes - Pendiente
- Validación de post-instalación - Pendiente
- Instalación en repo nuevo vs. repo con configuraciones existentes - Pendiente
- Handoff: formato y ubicación - Pendiente
- Actualización de paquete ya instalado - Pendiente

**Menores:**

- Canal de distribución del paquete - Pendiente
- Formato del manifiesto del paquete - Pendiente
- Estructura exacta del paquete y del repo destino - Pendiente

### Estado final de avance

**Estado**: Avance condicionado

Hay 7 decisiones Importantes sin resolver que afectan la calidad del diseño pero no bloquean completamente la implementación. El usuario debe ser alertado sobre estas decisiones y tener la opción de responderlas antes de avanzar a evaluar-conectividad-tecnica, o puede avanzar con defaults conservadores que se pueden refinar posteriormente.

**Ready for**: evaluar-conectividad-tecnica (condicionado)
