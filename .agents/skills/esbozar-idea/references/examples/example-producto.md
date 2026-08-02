---
idea_slug: exportar-reportes-pdf
date: 2026-08-02
skill: esbozar-idea
level: producto
status: ready
next: analizar-idea
---

# Esbozo: exportar-reportes-pdf

## Resumen de la idea

"estaría bueno que la gente se pueda llevar sus reportes"

## Resultado deseado

Los usuarios pueden llevarse un registro durable de sus reportes fuera del producto, en un formato que puedan archivar o compartir sin depender de la plataforma.

## Problema

Hoy los reportes solo viven dentro de la plataforma. Síntomas observables:

- **Dependencia de la plataforma**: si el usuario desactiva su cuenta, pierde acceso a su historial.
- **Imposibilidad de compartir**: no hay forma de enviar un reporte a alguien que no tiene cuenta.
- **Falta de archivo sin conexión**: los usuarios no pueden consultar reportes sin conexión.

## Beneficiarios

- **Usuarios finales** que consumen reportes (quieren archivar o compartir fuera de la plataforma).

## Carácter de la idea

Valores que distinguen esta idea de alternativas:

- **Portabilidad**: el registro exportado debe ser utilizable sin la plataforma.
- **Fidelidad**: la exportación preserva el contenido sin pérdida de información.
- **Autonomía**: el usuario decide cuándo y qué exportar sin intervención del equipo.

## Situaciones a cubrir

- **Exportación puntual de un reporte**: el usuario descarga un reporte específico.
- **Exportación masiva de historial**: el usuario descarga todos sus reportes de un periodo.
- **Exportación para compartir**: el usuario genera un archivo que puede enviar a un tercero.

## Espacio abierto

### Sin default

- Formato exacto de la exportación (PDF, CSV, JSON).
- Mecanismo de entrega (descarga directa, email, enlace temporal).
- Estructura del contenido exportado (reporte completo vs. resumen).

### Con default a reevaluar

- Un archivo por reporte (valor por defecto) vs. un archivo consolidado.

## Suposiciones

- Los usuarios tienen permiso sobre sus propios reportes.
- El volumen de datos por reporte es manejable para una descarga interactiva.

## Alternativas consideradas o descartadas

Ninguna registrada.

## Contexto organizacional

Equipo de producto — plataforma de reportes. Genera la idea desde feedback recurrente de usuarios que solicitan exportar su historial.

## Gate de avance (Fase D)

- **Estado del resultado**: Claro — formulado sin mención de solución, medible (registro durable fuera de la plataforma).
- **Inventario de preguntas identificadas**:
  - [Menor] ¿Qué formatos específicos? — Estado: pendiente (lo trabaja un skill posterior, no bloquea).
- **Estado final de avance**: Libre — `status: ready`, `next: analizar-idea`.

## Preguntas Abiertas (resueltas/pendientes)

### Resueltas inline

- **Pregunta**: ¿La exportación es un producto nuevo o una funcionalidad de la plataforma existente?
- **Impacto**: Define el nivel del esbozo (producto vs feature) y qué dimensiones de enriquecimiento aplican.
- **Severidad**: Importante
- **Propuesta**: Funcionalidad de la plataforma existente — pero el resultado define un espacio nuevo (registro durable fuera de la plataforma), por eso se trata como producto.
- **Responsable**: N/A (decisión de producto)
- **Plazo**: N/A
- **Estado**: Resuelta inline — se documenta como `level: producto` en el frontmatter.

### Pendientes

- **Pregunta**: ¿Qué formatos específicos de exportación soportar?
- **Impacto**: No bloquea el esbozo; un skill posterior lo resolverá en `capturar-requerimiento` / `mapear-casos-uso`.
- **Severidad**: Menor
- **Propuesta**: Heredar en `analizar-idea`.
- **Responsable**: N/A
- **Plazo**: Antes de `capturar-requerimiento`
