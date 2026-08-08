---
idea_slug: teleprompter
date: 2026-08-08
skill: esbozar-idea
level: producto
status: ready
next: analizar-idea
---

# Esbozo: teleprompter

## Resumen de la idea

"Teleprompter es un instalador de paquetes de configuracion para agentes de IA: toma una plantilla compartida (recursos + instrucciones de personalizacion), la instala en un repositorio destino y entrega al agente las instrucciones necesarias para que adapte esos recursos al contexto del proyecto."

## Resultado deseado

Los equipos pueden distribuir, instalar y personalizar configuraciones de agentes IA en cualquier repositorio de forma reproducible y segura, sin perder customizaciones locales, y con un mecanismo que permite al agente adaptar esos recursos al contexto del proyecto.

## Problema

Hoy aprovisionar una configuracion de agente IA en un repositorio es un proceso manual y fragil. Sintomas observables:

- **Drift entre repos**: los mantenedores copian archivos sueltos a mano; nadie sabe con certeza que version de que configuracion tiene cada proyecto.
- **Colisiones fragiles**: las colisiones con configuraciones locales (`AGENTS.md`, skills personalizados) se resuelven ad-hoc, con riesgo real de perder customizaciones.
- **Onboarding costoso**: integrar un nuevo teammate o early adopter requiere 10-20 min explicando que copiar, donde y como personalizarlo.
- **Iteracion no versionable**: una mejora en una plantilla no se propaga de forma confiable a los repos que la consumen.

En resumen: no existe un mecanismo confiable para distribuir, instalar y personalizar configuraciones de agentes IA de forma reproducible y segura.

## Beneficiarios

- **Skill Maintainer** (Gil): itera skills en el repo origen y los prueba en repos propios. Quiere instalar/actualizar sin miedo a perder customizaciones.
- **Early Adopter Externo** (Sam): adopta configuraciones de nucleoabierto en sus repos. Quiere bajar la barrera de adopcion a minutos.
- **Agent Operator** (Riley): consume el handoff para que el agente termine de personalizar los recursos al contexto del repo destino.

## Caracter de la idea

Valores que distinguen esta idea de alternativas:

- **Reproducibilidad**: el mismo paquete + el mismo repo destino + la misma politica de colisiones debe producir el mismo resultado.
- **Seguridad de customizaciones**: nunca se pierde una configuracion local sin confirmacion explicita.
- **Agnosticismo al agente**: el instalador no se acopla a un agente concreto. Cualquier agente que entienda el ecosistema de configuracion es destino valido.
- **Fail-fast y limpio**: validacion completa antes de cualquier cambio; si falla, no queda estado parcial.
- **Legibilidad humana**: el handoff debe servir tanto para un agente como para un humano que quiera entender que se instalo y por que.
- **Versionado implicito**: la identidad del paquete instalado debe ser observable en el repo destino.

## Situaciones a cubrir

- **Instalacion inicial en un repo nuevo**: un early adopter adopta configuraciones compartidas en un repo limpio, sin colisiones.
- **Actualizacion con customizaciones locales**: un mantenedor lanza una nueva version de un skill; el repo destino ya tiene customizaciones que deben preservarse.
- **Sincronizacion en CI**: un pipeline ejecuta la instalacion en modo no interactivo con una politica de colisiones predefinida, sin prompts que bloqueen.
- **Instalacion fallida**: el paquete esta mal descrito, falta un recurso o no hay permisos; el instalador aborta con un mensaje claro y no deja el repo modificado a medias.

## Espacio abierto

### Sin default

- Lenguaje/runtime del instalador.
- Formato del manifiesto del paquete (YAML, JSON, TOML, etc.).
- Estructura exacta del paquete y del repo destino.
- Formato del handoff (markdown, JSON, texto plano) y su mecanismo de entrega.
- CLI exacta, flags y nombres de comandos.
- Canal de distribucion (npm, binario, paquete del sistema, etc.).
- Herramientas de testing, build y CI/CD.

### Con default a reevaluar

- Convencion `.agents/` como ubicacion de recursos en el repo destino (default de una implementacion anterior, a reevaluar).
- Salida dual stdout + archivo persistente para el handoff .

## Suposiciones

- Los agentes IA consumen instrucciones textuales para personalizar recursos al contexto del proyecto.
- Los repos destino usan git y tienen un sistema de archivos convencional.
- Existe un ecosistema de configuracion de agentes (skills, reglas, guias de estilo) que es compartible entre repos.
- Los mantenedores quieren distribuir versiones actualizadas de sus plantillas y los consumidores quieren adoptarlas.
- El handoff es informativo, no ejecutable: el instalador no invoca al agente.

## Alternativas consideradas o descartadas

Ninguna registrada.

## Contexto organizacional

Nucleoabierto — equipo que mantiene configuraciones de agentes IA compartidas para adopcion interna y externa. La idea surge de la experiencia propia de iterar skills y necesitar un mecanismo confiable para distribuirlos.

## Gate de avance (Fase D)

- **Estado del resultado**: Claro — formulado sin mencionar solucion, medible (los equipos pueden distribuir, instalar y personalizar configuraciones de forma reproducible y segura).
- **Inventario de preguntas identificadas**:
  - [Importante] ¿El resultado puede formularse sin mencionar solucion? — Estado: resuelta inline (Ronda 1 del dialogo).
  - [Importante] ¿El beneficiario esta claro? — Estado: resuelta inline (el pitch trae 3 roles: Skill Maintainer, Early Adopter, Agent Operator).
  - [Menor] ¿La idea contiene multiples funcionalidades? — Estado: pendiente (el pitch describe 3 movimientos — paquete, instalacion, handoff — que podrian ser funcionalidades separadas; el resultado es uno solo. Lo trabaja `evaluar-alcance-idea`).
  - [Menor] ¿El caracter esta mezclado con diseno de solucion? — Estado: resuelta inline (Ronda 2 — los 6 valores son declaraciones de intencion, no diseno).
  - [Menor] ¿Canal de distribucion del paquete? — Estado: pendiente (espacio abierto, no bloquea).
- **Alerta al usuario**: No necesaria — todas las Criticas/Importantes se resolvieron inline durante el analisis.
- **Estado final de avance**: Libre — `status: ready`, `next: analizar-idea`.

## Preguntas Abiertas (resueltas/pendientes)

### Resueltas inline

- **Pregunta**: ¿El resultado puede formularse sin mencionar solucion?
- **Impacto**: Define si el esbozo puede avanzar o necesita reformulacion.
- **Severidad**: Importante
- **Propuesta**: Reformular como estado deseado: "Los equipos pueden distribuir, instalar y personalizar configuraciones de agentes IA de forma reproducible y segura, sin perder customizaciones locales, con handoff al agente para adaptacion contextual."
- **Responsable**: N/A (decision de producto)
- **Plazo**: N/A
- **Estado**: Resuelta inline — confirmada por el usuario en Ronda 1 del dialogo.

- **Pregunta**: ¿El beneficiario esta claro?
- **Impacto**: Define si el esbozo tiene suficiente claridad sobre quien se beneficia.
- **Severidad**: Importante
- **Propuesta**: Tres roles identificados desde el pitch: Skill Maintainer, Early Adopter Externo, Agent Operator.
- **Responsable**: N/A
- **Plazo**: N/A
- **Estado**: Resuelta inline — inferido del pitch seccion 4.1.

- **Pregunta**: ¿El caracter esta mezclado con diseno de solucion?
- **Impacto**: Define si los valores del esbozo son declaraciones de intencion o diseno.
- **Severidad**: Menor
- **Propuesta**: Los 6 valores extraidos de la seccion 5 del pitch son declaraciones de intencion (reproducibilidad, seguridad, agnosticismo, fail-fast, legibilidad, versionado), no diseno de solucion.
- **Responsable**: N/A
- **Plazo**: N/A
- **Estado**: Resuelta inline — confirmada por el usuario en Ronda 2 del dialogo.

### Pendientes

- **Pregunta**: ¿La idea contiene multiples funcionalidades que deban evaluarse por separado?
- **Impacto**: El pitch describe 3 movimientos (paquete de configuracion, instalacion reproducible, handoff al agente) que podrian ser funcionalidades separadas con alcances y prioridades distintas.
- **Severidad**: Menor
- **Propuesta**: Heredar en `analizar-idea` y, si confirma multiples funcionalidades, derivar a `evaluar-alcance-idea`.
- **Responsable**: N/A
- **Plazo**: Antes de `evaluar-alcance-idea`

- **Pregunta**: ¿Que canal de distribucion del paquete usar (npm, binario, paquete del sistema)?
- **Impacto**: No bloquea el esbozo; un skill posterior lo resolvera en `capturar-requerimiento` / `generar-trd`.
- **Severidad**: Menor
- **Propuesta**: Heredar en `analizar-idea`.
- **Responsable**: N/A
- **Plazo**: Antes de `generar-trd`
