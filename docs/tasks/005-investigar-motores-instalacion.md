# Investigar cómo instalan las herramientas comparables

## Estado

[x] Completada

## Tipo

investigación

## Objetivo

Comparar cómo ejecutan la instalación las herramientas que llevan
contenido a un repositorio o directorio con trabajo previo, para
extraer las decisiones que el instalador de Teleprompter debe
considerar: verificación previa, presentación del plan, políticas de
colisión y registro del resultado.

## Dependencias

- Ninguna.

## Entrada

- El problema y la forma de solución de esta propuesta.
- El contrato del manifiesto en `docs/especificacion-paquete.md`: las
  precondiciones (`requires`) y el mapa de instalación (`install`) que
  el instalador tendrá que ejecutar.
- Herramientas candidatas a comparar: gestores de paquetes,
  instaladores de plugins, gestores de dotfiles y herramientas de
  andamiaje de proyectos.

## Resultado esperado

- Un documento en `docs/research/` con las conclusiones: cómo se
  verifica el destino antes de escribir, cómo se presenta el plan al
  usuario, qué políticas de colisión existen, cómo se deja constancia
  de la operación y qué decisiones conviene adoptar o evitar para el
  instalador de Teleprompter.

## Criterios de calidad

- Compara al menos tres herramientas de familias distintas.
- Cada conclusión declara la evidencia que la sostiene y su fuente.
- Las recomendaciones se expresan como decisiones adoptables por el
  instalador de Teleprompter, no como descripción neutral.

## Procedimiento sugerido

1. Seleccionar las herramientas a comparar cubriendo familias
   distintas.
2. Para cada una, extraer: verificación previa, presentación del plan,
   políticas de colisión ante recursos existentes, atomicidad de la
   operación y registro del resultado.
3. Sintetizar patrones comunes y divergencias relevantes.
4. Derivar las decisiones candidatas para el instalador de
   Teleprompter.
5. Redactar el documento en `docs/research/` siguiendo las
   convenciones de investigación del proyecto.

## Notas

- Al completarse, la referencia al documento producido se añade a la
  sección «Investigaciones de apoyo» de la propuesta.

## Revisión

- Subagente: 2026-09-28 — Aprueba (2ª pasada, tras corregir la
  descripción de los archivos de bloqueo de skills.sh)
- Usuario: 2026-09-28 — Aprueba
