# Investigar formatos de manifiesto existentes

## Estado

[x] Completada

## Tipo

investigación

## Objetivo

Comparar cómo describen sus manifiestos los sistemas de paquetes y
plugins existentes, para extraer los campos y las decisiones que el
formato de paquete de Teleprompter debe considerar.

## Dependencias

- Ninguna.

## Entrada

- El problema y la forma de solución de la propuesta
  `docs/proposals/001-formato-paquete/propuesta.md`.
- Sistemas candidatos a comparar: gestores de paquetes de lenguajes,
  sistemas de plugins de editores y distribuidores de plantillas de
  proyecto.

## Resultado esperado

- Un documento en `docs/research/` con las conclusiones: campos
  habituales de un manifiesto, cómo se declaran las precondiciones y el
  mapa de instalación, cómo se versiona y qué decisiones conviene
  adoptar o evitar para un paquete de configuración de agentes.

## Criterios de calidad

- Compara al menos tres sistemas de familias distintas.
- Cada conclusión declara la evidencia que la sostiene y su fuente.
- Las recomendaciones se expresan como decisiones adoptables por el
  formato de Teleprompter, no como descripción neutral.

## Procedimiento sugerido

1. Seleccionar los sistemas a comparar cubriendo familias distintas.
2. Para cada uno, extraer: identidad y versionado, declaración de
   contenido, precondiciones del destino, personalización y orden de
   aplicación.
3. Sintetizar patrones comunes y divergencias relevantes.
4. Derivar las decisiones candidatas para el formato de Teleprompter.
5. Redactar el documento en `docs/research/` siguiendo las
   convenciones de investigación del proyecto.

## Notas

- Al completarse, la referencia al documento producido se añade a la
  sección «Investigaciones de apoyo» de la propuesta.

## Revisión

- Subagente: 2026-09-28 — Aprueba
- Usuario: 2026-09-28 — Aprueba
