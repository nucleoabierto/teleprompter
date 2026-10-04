# `origin` de colección y ciclo de vida por paquete

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Extender el `origin` registrado en el lock para que identifique el
paquete dentro del repositorio de origen, y verificar que el ciclo de
vida funciona por paquete instalado desde colección: `update`
resuelve el mismo paquete al reintentar el origen, y `list`, `check`
y `guide` no necesitan conocer que el paquete vino de una colección.

## Dependencias

- Tarea 032 — la instalación desde colección materializada.

## Entrada

- `src/lock.js` y `docs/decisions/D014-campo-origin-del-registro.md`
  — el registro guarda `origin: github | path` con `repo`/`ref` o
  ruta absoluta.
- `src/update` (`update`, `buildUpdatePlan`) — re-resuelve el origen
  registrado.
- La extensión del `origin` decidida en la tarea 031.

## Resultado esperado

- El `origin` de una instalación desde colección registra la
  identidad del paquete dentro del origen (p. ej. su ruta o nombre
  del índice), sin romper los orígenes ya registrados de paquetes
  sueltos.
- `update` sobre un paquete de colección re-descarga el origen,
  resuelve el mismo paquete y actualiza; `guide` y `check` se
  comportan igual que con cualquier otra instalación.

## Criterios de calidad

- `update` de un paquete instalado desde colección aplica las
  versiones nuevas del mismo paquete, no de otro del índice.
- Los locks con `origin` de paquete suelto (sin datos de colección)
  siguen funcionando sin migración.
- La suite cubre update desde colección local y el caso de paquete
  retirado del índice entre versiones.

## Procedimiento sugerido

1. Planear la implementación (sub-flujo de desarrollo).
2. Extender el esquema del `origin` y su escritura en el pipeline
   de instalación.
3. Hacer que `update` resuelva colección → paquete registrado.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
