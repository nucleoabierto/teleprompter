# Documentar las colecciones en el manual

## Estado

[x] Completada

## Tipo

documentación

## Objetivo

Llevar las colecciones a la documentación pública del producto: cómo
declara el mantenedor su colección y cómo selecciona el consumidor el
paquete a instalar, con el ejemplo de la colección de referencia.

## Dependencias

- Tarea 034 — la colección de referencia como ejemplo real y el
  comportamiento e2e verificado.

## Entrada

- `manual/` — la documentación pública (MkDocs); hoy las colecciones
  solo aparecen en `docs/especificacion-paquete.md` para
  mantenedores, sin guía de uso.
- `docs/especificacion-paquete.md` — la sección «Colecciones» ya
  especificada.
- La colección de referencia de la tarea 034.

## Resultado esperado

- El manual documenta: instalar desde una colección (sintaxis de
  selección y comportamiento sin selección) para el consumidor, y
  declarar una colección para el mantenedor, con el ejemplo de la
  colección de referencia.

## Criterios de calidad

- Toda sintaxis y comportamiento documentados coinciden con lo
  implementado y verificado en e2e —nada queda descrito de más.
- El manual enlaza la especificación del formato como referencia
  del manifiesto de colección.
- El sitio MkDocs construye sin enlaces rotos.

## Procedimiento sugerido

1. Revisar la estructura del manual y decidir dónde encaja la guía.
2. Escribir la documentación del consumidor y del mantenedor.
3. Construir el sitio y verificar.

## Revisión

- Subagente: 2026-10-04 — Aprueba
- Usuario: 2026-10-04 — Aprueba
