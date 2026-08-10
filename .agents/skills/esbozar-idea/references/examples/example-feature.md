---
idea_slug: modo-oscuro
date: 2026-08-05
skill: esbozar-idea
level: feature
status: ready
next: analizar-idea
---

# Esbozo: modo-oscuro

## Idea inicial

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

No aplica — el stack existente determina las opciones disponibles.

### Con default a reevaluar

- Interruptor manual + detección automática (valor por defecto) vs. solo detección automática.

## Suposiciones

- El framework de UI soporta temas o puede adaptarse.
- Los usuarios tienen una preferencia de tema en su sistema operativo (para detección automática).

## Alternativas consideradas o descartadas

Ninguna registrada.

## Gate de avance

- **Estado del resultado**: Claro. Formulado sin mención de solución, medible (uso cómodo en ambientes con poca luz).
- **Inventario de preguntas identificadas**:
  - [Menor] ¿Detección automática al inicio o solo interruptor manual?
- **Estado final de avance**: Libre — `status: ready`, `next: analizar-idea`.

## Preguntas Abiertas (resueltas/pendientes)

### Resueltas inline

- **Pregunta**: ¿El tema debe seguir la preferencia del sistema operativo o solo un interruptor manual?
- **Impacto**: Define el alcance de la detección automática.
- **Severidad**: Importante
- **Respuesta**: Soportar ambos, con interruptor manual y detección automática como valor por defecto.
- **Estado**: Resuelta inline — se documenta en Espacio abierto (con default a reevaluar).

### Pendientes

- **Pregunta**: ¿Detección automática al inicio o solo interruptor manual?
- **Impacto**: No bloquea el esbozo.
- **Severidad**: Menor
- **Propuesta**: Inicializar con tema por defecto y permitir cambio manual (valor seleccionado o cambio automático).
