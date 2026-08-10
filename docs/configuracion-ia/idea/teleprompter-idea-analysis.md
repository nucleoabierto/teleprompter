---
idea_slug: teleprompter
domain: configuracion-ia
date: 2026-08-10
skill: analizar-idea
level: producto
status: ready
next: evaluar-alcance-idea
---

# Descripción narrativa: teleprompter

## Problema

Aprovisionar una configuración de agente de IA en un repositorio es hoy un proceso manual y frágil que se repite cada vez que un equipo quiere adoptar o actualizar configuraciones compartidas. El dolor se manifiesta en cuatro síntomas concretos que afectan tanto a quienes mantienen las configuraciones como a quienes las consumen.

El síntoma más visible es el drift entre repositorios: los mantenedores copian archivos sueltos a mano, y nadie sabe con certeza qué versión de qué configuración tiene cada proyecto. Un skill actualizado en el repo origen no llega de forma confiable a los repos que lo consumen; la propagación es manual y propensa a errores. El segundo síntoma son las colisiones frágiles: cuando un repo destino ya tiene configuraciones locales (skills personalizados, reglas propias, guías de estilo), la instalación de una plantilla compartida choca con esos archivos y se resuelve ad-hoc, con riesgo real de perder customizaciones que el equipo valoraba. El tercer síntoma es el onboarding costoso: integrar un nuevo teammate o un early adopter externo requiere 10-20 minutos explicando qué copiar, dónde y cómo personalizarlo, porque no hay un mecanismo estandarizado que entregue esa información de forma estructurada. El cuarto síntoma es la iteración no versionable: una mejora en una plantilla no se propaga de forma confiable a los repos que la consumen; el mantenedor no tiene visibilidad de quién está usando qué versión, y el consumidor no tiene un camino claro para actualizar sin romper lo que ya funciona.

El workaround actual es exclusivamente manual: copiar archivos por SSH, enviar snippets por chat, o mantener documentación desactualizada de "cómo instalar". No hay mecanismo en la plataforma que haga la distribución de configuraciones reproducible, segura y observable. El costo agregado no es trivial: tiempo perdido en instalaciones manuales, customizaciones perdidas por colisiones mal resueltas, barreras de adopción altas para nuevos usuarios, y un ecosistema de configuración que no escala porque cada actualización requiere intervención manual en cada repo.

## Resultado

El estado final deseado es uno en el que los equipos pueden distribuir, instalar y personalizar configuraciones de agentes IA en cualquier repositorio de forma reproducible y segura, sin perder customizaciones locales, y con un mecanismo que permite al agente adaptar esos recursos al contexto del proyecto. La instalación deja de ser un proceso manual propenso a errores y se convierte en una operación estandarizada que produce el mismo resultado si se repite con las mismas condiciones.

El flujo del usuario después del cambio tiene tres movimientos claros. Un mantenedor que itera en una configuración compartida puede empaquetarla y distribuirla; un consumidor que quiere adoptarla puede instalarla en su repo con una sola operación; un agente que consume el handoff puede entender qué se instaló y adaptar esos recursos al contexto específico del proyecto. La diferencia con hoy no es que los equipos hagan algo nuevo; es que dejan de tener que copiar archivos a mano, resolver colisiones ad-hoc, y mantener documentación desactualizada de instalaciones.

Lo que deja de pasar es observable y específico: los archivos de configuración ya no se copian manualmente, las colisiones se resuelven con políticas explícitas en lugar de ad-hoc, las customizaciones locales nunca se pierden sin confirmación, y cada instalación deja una huella observable que permite saber qué versión de qué paquete está instalado en cada repo. Las señales de que el resultado se alcanzó son medibles sin mirar la implementación: el tiempo de onboarding baja a minutos, las actualizaciones de configuraciones se propagan sin intervención manual, las customizaciones locales se preservan en todas las instalaciones, y los equipos pueden auditar qué configuraciones tienen instaladas en cada repo.

## Solución

El producto que entrega ese resultado es un instalador de paquetes de configuración para agentes de IA. Toma una plantilla compartida (recursos + instrucciones de personalización), la instala en un repositorio destino y entrega al agente las instrucciones necesarias para que adapte esos recursos al contexto del proyecto. La experiencia central es la de **instalar y adaptar**: el instalador se encarga de la parte mecánica (copiar archivos, resolver colisiones, validar precondiciones), y el handoff le dice al agente qué se instaló y qué necesita adaptar al contexto específico del repo. No es un agente, no ejecuta nada, solo prepara el terreno para que el agente trabaje.

### Forma del producto

El producto es un instalador de paquetes de configuración que vive como una herramienta CLI. Un paquete es una colección de recursos (skills, reglas, guías de estilo, plantillas) más un manifiesto que describe qué es, qué versión es, y cómo debe instalarse. El instalador toma ese paquete, valida que el repo destino cumple las precondiciones, resuelve las colisiones con archivos existentes según una política definida, copia los recursos al lugar correcto, y genera un handoff que resume qué se instaló y qué queda pendiente de adaptación al contexto. La experiencia es la de un instalador tradicional: se ejecuta, valida, instala, y reporta. Lo que lo hace diferente es que el handoff está diseñado tanto para humanos (para entender qué se instaló) como para agentes (para saber qué adaptar).

Se acopla al ecosistema de configuración de agentes que ya existe, pero como una herramienta nueva, no como una extensión de un producto existente. Los equipos ya tienen skills, reglas, guías de estilo en sus repos; lo que cambia no es qué tienen, sino cómo lo instalan y actualizan. Hay un nuevo comando para ejecutar, pero no un nuevo tipo de archivo ni una nueva estructura de repo. El instalador trabaja con lo que ya existe: archivos en el sistema de archivos, convenciones de ubicación, y un ecosistema de configuración que es compartible entre repos. No crea un nuevo ecosistema, solo automatiza la distribución del existente.

### Fronteras — qué no es

- No es un **agente de IA**: el instalador no toma decisiones de personalización, no adapta recursos al contexto, no ejecuta nada. Solo instala y genera un handoff informativo.
- No es un **sistema de gestión de configuraciones centralizado**: no hay un servidor ni un repositorio central que mantenga el estado de todos los repos. Cada repo tiene su propia instalación, y el instalador trabaja localmente.
- No es una **herramienta de colaboración en tiempo real**: no hay edición concurrente de configuraciones entre equipos. La instalación es un evento local; la colaboración se da a través de la distribución de paquetes, no de co-edición.
- No es un **sistema de control de versiones para configuraciones**: el instalador instala paquetes versionados, pero no gestiona el historial de cambios de un repo. El control de versiones sigue siendo responsabilidad de git.
- No es un **validador de configuraciones**: el instalador valida precondiciones antes de instalar, pero no valida que la configuración resultante sea correcta ni que el agente la consuma correctamente. La validación de calidad es responsabilidad del mantenedor del paquete y del agente que lo consume.
- No es una **plataforma de distribución de paquetes**: el instalador asume que los paquetes existen en algún lugar (un repo, un archivo, un URL), pero no define ni implementa el canal de distribución. Esa decisión se difiere al análisis posterior.

### Comportamientos clave del producto

Estos son los comportamientos que el producto debe entregar, descritos en términos de experiencia. Cada uno es una unidad de producto que un análisis posterior puede expandir y descomponer.

1. **Validar precondiciones antes de instalar**: el instalador verifica que el repo destino cumple las condiciones necesarias antes de hacer cualquier cambio (permisos, espacio en disco, dependencias, compatibilidad de versiones). Si falla, aborta con un mensaje claro sin dejar el repo modificado.

2. **Detectar y resolver colisiones con archivos existentes**: cuando el paquete contiene archivos que ya existen en el repo destino, el instalador detecta la colisión y la resuelve según una política definida (sobrescribir, preservar, renombrar, abortar). La política puede ser interactiva (preguntar al usuario) o automática (predefinida en modo CI).

3. **Instalar recursos en el lugar correcto**: el instalador copia los archivos del paquete a las ubicaciones esperadas por el ecosistema de configuración (skills en `.agents/skills/`, reglas en `.agents/rules/`, etc.) respetando la estructura definida en el manifiesto.

4. **Preservar customizaciones locales**: cuando el repo destino tiene customizaciones que el usuario quiere conservar, el instalador las respeta y no las sobrescribe sin confirmación explícita. Las customizaciones pueden ser archivos individuales o directorios completos.

5. **Generar un handoff legible para humanos y agentes**: después de instalar, el instalador genera un resumen de qué se instaló, qué colisiones se resolvieron, y qué queda pendiente de adaptación al contexto del repo. El handoff sirve tanto para que un humano entienda qué pasó como para que un agente sepa qué necesita personalizar.

6. **Dejar una huella observable del paquete instalado**: el instalador registra qué paquete y qué versión se instaló en el repo destino (por ejemplo, en un archivo de manifiesto local o en un comentario en los archivos instalados) para que sea posible auditar qué configuraciones tiene cada repo.

7. **Soportar instalación en modo no interactivo para CI**: el instalador puede ejecutarse en modo automático sin prompts que bloqueen, usando una política de colisiones predefinida y validaciones que no requieren intervención humana. Esto permite integrar la instalación en pipelines de CI/CD.

### Escenarios y variantes

El comportamiento central tiene variantes que el producto necesita resolver. Cada una es una decisión de producto que el análisis posterior debe trabajar:

- **Instalación en repo nuevo vs. repo con configuraciones existentes**: ¿el instalador trata ambos casos de la misma forma, o hay flujos distintos cuando el repo está limpio vs. cuando ya tiene skills/reglas/otras configuraciones?

- **Política de colisiones por defecto**: cuando hay una colisión y el usuario no especifica una política, ¿cuál es el comportamiento por defecto? ¿Sobrescribir, preservar, abortar, o preguntar?

- **Handoff: formato y ubicación**: ¿el handoff se escribe en un archivo específico, se imprime en stdout, o ambos? ¿El formato es markdown, JSON, texto plano, o algo más estructurado para consumo por agentes?

- **Actualización de paquete ya instalado**: cuando el repo ya tiene una versión de un paquete y se quiere instalar una versión más nueva, ¿el instalador detecta la actualización y aplica un delta, o reinstala todo desde cero?

- **Desinstalación de un paquete**: ¿el instalador soporta desinstalar un paquete previamente instalado, o la desinstalación es manual? Si la soporta, ¿qué hace con los archivos que fueron modificados después de la instalación?

- **Dependencias entre paquetes**: ¿un paquete puede depender de otro paquete, y el instalador resuelve esas dependencias automáticamente, o cada paquete es independiente y el usuario las instala manualmente en orden?

- **Validación de post-instalación**: ¿el instalador valida que la configuración resultante es funcional (por ejemplo, que los skills son parseables, que las reglas no tienen errores de sintaxis), o esa validación es responsabilidad del agente que consume la configuración?

### Beneficiarios

- **Primario: Skill Maintainer**: itera skills en el repo origen y los prueba en repos propios. Quiere instalar/actualizar configuraciones compartidas sin miedo a perder customizaciones locales, y quiere que las actualizaciones se propaguen de forma confiable a los repos que consumen sus paquetes.

- **Secundario: Early Adopter Externo**: adopta configuraciones de núcleoabierto en sus repos. Quiere bajar la barrera de adopción a minutos, no tener que copiar archivos a mano, y tener un camino claro para actualizar sin romper lo que ya funciona.

- **Secundario: Agent Operator**: consume el handoff para que el agente termine de personalizar los recursos al contexto del repo destino. Quiere que el handoff sea claro, estructurado y contenga toda la información necesaria para que el agente adapte la configuración sin tener que inferir contexto.

## Suposiciones y dependencias

- Los agentes de IA consumen instrucciones textuales para personalizar recursos al contexto del proyecto. El handoff del instalador asume que el agente puede procesar texto estructurado (markdown, JSON, etc.) para entender qué se instaló y qué necesita adaptar.

- Los repos destino usan git y tienen un sistema de archivos convencional. El instalador asume que puede leer y escribir archivos en el repo, y que git está disponible para operaciones como verificar el estado del working tree.

- Existe un ecosistema de configuración de agentes (skills, reglas, guías de estilo) que es compartible entre repos. El instalador asume que hay convenciones de ubicación y formato que hacen que estos recursos sean portables entre proyectos.

- Los mantenedores quieren distribuir versiones actualizadas de sus plantillas y los consumidores quieren adoptarlas. El instalador asume que hay un flujo de mejora continua en las configuraciones compartidas, y que los consumidores valoran recibir actualizaciones.

- El handoff es informativo, no ejecutable: el instalador no invoca al agente. El instalador asume que el agente será invocado por otro mecanismo (el usuario, un pipeline, un scheduler) y que su rol es solo preparar el terreno.

## Decisiones diferidas al análisis posterior

- **Canal de distribución del paquete**: el instalador asume que los paquetes existen en algún lugar, pero no define ni implementa el canal (npm, un binario, un paquete del sistema, un repo git, un URL, etc.). Esta decisión se toma en `capturar-requerimiento` o `generar-trd`.

- **Formato del manifiesto del paquete**: el instalador asume que cada paquete tiene un manifiesto que describe qué es, qué versión es, y cómo debe instalarse, pero no define el formato (YAML, JSON, TOML, etc.) ni la estructura exacta. Esta decisión se toma en `capturar-requerimiento` o `generar-trd`.

- **Estructura exacta del paquete y del repo destino**: el instalador asume que hay convenciones de ubicación (`.agents/skills/`, `.agents/rules/`, etc.), pero no define la estructura exacta ni valida que sea la única posible. Esta decisión se toma en `generar-trd`.

- **Política de colisiones por defecto**: el instalador soporta políticas de colisiones, pero no define cuál es el comportamiento por defecto cuando el usuario no especifica una. Esta decisión se toma en `capturar-requerimiento`.

- **Soporte para desinstalación**: el instalador puede o no soportar desinstalación de paquetes, y si la soporta, el comportamiento exacto (qué hacer con archivos modificados) no está definido. Esta decisión se toma en `capturar-requerimiento`.

- **Soporte para dependencias entre paquetes**: el instalador puede o no soportar que un paquete dependa de otro, y si las soporta, el mecanismo de resolución no está definido. Esta decisión se toma en `capturar-requerimiento`.

- **Validación de post-instalación**: el instalador puede o no validar que la configuración resultante es funcional, y si la valida, el alcance de esa validación no está definido. Esta decisión se toma en `capturar-requerimiento`.

## Gate de avance

### Criterios de calidad del análisis

- **Crítico**: ¿El producto conecta claramente el problema con el resultado? — Sí. El instalador de paquetes es el puente directo entre el problema (instalación manual y frágil) y el resultado (distribución reproducible y segura). La narrativa muestra cómo cada comportamiento del producto ataca un síntoma específico del problema.

- **Crítico**: ¿Se describe en términos de experiencia, no de implementación? — Sí. La descripción se centra en qué hace el producto (validar, resolver colisiones, instalar, generar handoff) y qué experiencia ofrece, no en cómo se implementa (no hay stack, arquitectura, ni detalles técnicos).

- **Importante**: ¿Los comportamientos clave son descomponibles en épicas/tareas? — Sí. Cada comportamiento clave (validar precondiciones, resolver colisiones, instalar recursos, preservar customizaciones, generar handoff, dejar huella observable, soportar modo CI) es una unidad de producto que puede expandirse en múltiples épicas y tareas.

- **Importante**: ¿Las fronteras están bien definidas? — Sí. La lista de "qué no es" es clara y específica, y cada frontera es una decisión de alcance que evita que el planificador infiera funcionalidad que no existe.

- **Menor**: ¿Los escenarios y variantes están bien identificados? — Sí. Las 7 variantes identificadas son bifurcaciones de experiencia que el análisis posterior debe trabajar de forma explícita, no detalles técnicos.

- **Menor**: ¿Los beneficiarios están claros y sus beneficios son concretos? — Sí. Hay un beneficiario primario (Skill Maintainer) y dos secundarios (Early Adopter, Agent Operator), cada uno con un beneficio concreto que se conecta con el problema.

### Inventario de preguntas abiertas

- **Importante**: ¿La idea contiene múltiples funcionalidades que deban evaluarse por separado? — El esbozo describe 3 movimientos (paquete de configuración, instalación reproducible, handoff al agente) que podrían ser funcionalidades separadas con alcances y prioridades distintas. Esta pregunta se hereda del esbozo y se trabajará en `evaluar-alcance-idea`.

- **Menor**: ¿Qué canal de distribución del paquete usar? — Esta pregunta está en el espacio abierto del esbozo y se hereda como decisión diferida. Se trabajará en `capturar-requerimiento` o `generar-trd`.

### Estado final de avance

**Status**: `ready` — No hay preguntas Críticas sin resolver. La pregunta Importante sobre múltiples funcionalidades se trabajará en el siguiente skill (`evaluar-alcance-idea`), que es precisamente el lugar indicado para esa evaluación. Las preguntas Menores son decisiones diferidas que corresponden a skills posteriores.

**Next**: `evaluar-alcance-idea` — Este skill evaluará si la idea contiene múltiples funcionalidades y, si es así, las dividirá en funcionalidades individuales con alcance, propuesta de valor y temporalidad.

## Preguntas Abiertas

### Pendientes

- **Pregunta**: ¿La idea contiene múltiples funcionalidades que deban evaluarse por separado?
- **Impacto**: El pitch describe 3 movimientos (paquete de configuración, instalación reproducible, handoff al agente) que podrían ser funcionalidades separadas con alcances y prioridades distintas. Si es así, `evaluar-alcance-idea` las dividirá y priorizará.
- **Severidad**: Importante
- **Propuesta**: Heredar en `evaluar-alcance-idea` para que determine si es una funcionalidad única o múltiples, y en el segundo caso las divida y priorice.
- **Responsable**: N/A (decisión de producto)
- **Plazo**: Antes de `orquestar-prd-workflow`

- **Pregunta**: ¿Qué canal de distribución del paquete usar (npm, binario, paquete del sistema, repo git, URL)?
- **Impacto**: No bloquea el análisis de la idea; un skill posterior lo resolverá en `capturar-requerimiento` / `generar-trd`.
- **Severidad**: Menor
- **Propuesta**: Heredar como decisión diferida; se trabajará en `capturar-requerimiento` o `generar-trd`.
- **Responsable**: N/A
- **Plazo**: Antes de `generar-trd`
