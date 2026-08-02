---
idea_slug: modo-oscuro
date: 2026-08-05
skill: esbozar-idea
level: feature
status: ready
next: analizar-idea
---

# Esbozo: modo-oscuro

## Resumen de la idea

"estaría bueno tener modo oscuro"

## Resultado deseado

Los usuarios pueden usar el producto cómodamente en ambientes con poca luz sin fatiga visual.

## Problema

Hoy la interfaz solo tiene tema claro. Síntomas observables:

- **Fatiga visual nocturna**: los usuarios que trabajan de noche reportan incomodidad.
- **Consumo de batería**: en dispositivos OLED, el fondo blanco consume más batería.

## Beneficiarios

- **Usuarios finales** que usan el producto en ambientes con poca luz.

## Carácter de la idea

No aplica — feature extiende producto existente.

## Situaciones a cubrir

- **Activación manual**: el usuario cambia a tema oscuro desde preferencias.
- **Detección automática**: el tema sigue la preferencia del sistema operativo.
- **Retorno del usuario**: el usuario vuelve al producto y espera encontrar su tema anterior aplicado.

## Espacio abierto

### Sin default

No aplica — el stack existente constriñe las decisiones.

### Con default a reevaluar

- Interruptor manual + detección automática (valor por defecto) vs. solo detección automática.

## Suposiciones

- El framework de UI soporta temas o puede adaptarse.
- Los usuarios tienen una preferencia de tema en su sistema operativo (para detección automática).

## Alternativas consideradas o descartadas

Ninguna registrada.

## Contexto organizacional

Inferir del repository/workspace (ejemplo standalone — en ejecución real, inferir del repo sin preguntar).

## Gate de avance (Fase D)

- **Estado del resultado**: Claro — formulado sin mención de solución, medible (uso cómodo en ambientes con poca luz).
- **Inventario de preguntas identificadas**:
  - [Menor] ¿Detección automática al inicio o solo interruptor manual? — Estado: pendiente (lo trabaja un skill posterior, no bloquea).
- **Estado final de avance**: Libre — `status: ready`, `next: analizar-idea`.

## Preguntas Abiertas (resueltas/pendientes)

### Resueltas inline

- **Pregunta**: ¿El tema debe seguir la preferencia del sistema operativo o solo un interruptor manual?
- **Impacto**: Define el alcance de la detección automática.
- **Severidad**: Importante
- **Propuesta**: Soportar ambos — interruptor manual con detección automática como valor por defecto.
- **Responsable**: N/A (decisión de producto)
- **Plazo**: N/A
- **Estado**: Resuelta inline — se documenta en Espacio abierto (con default a reevaluar).

### Pendientes

- **Pregunta**: ¿Detección automática al inicio o solo interruptor manual?
- **Impacto**: No bloquea el esbozo; un skill posterior lo resolverá en `capturar-requerimiento`.
- **Severidad**: Menor
- **Propuesta**: Heredar en `analizar-idea`.
- **Responsable**: N/A
- **Plazo**: Antes de `capturar-requerimiento`
