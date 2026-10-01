# Unificar la defensa de rutas registradas

## Estado

[ ] Pendiente

## Tipo

mantenimiento (refactoring)

## Objetivo

«El lock es dato no confiable y sus rutas se revalidan» se defiende
hoy con dos mecánicas distintas: `classifyResource` (`src/drift.js`)
usa `isSafeRelative` + `resolvesUnder` sobre la cadena de padres —
la hoja es segura porque `hashPath` hace `lstat`—, mientras
`showGuide` (`src/cli.js`) usa `isSafeRelative` + `realpathSync` de
la hoja completa, cubriendo además que el propio archivo registrado
sea un enlace saliente. Unificar la defensa en una operación
compartida —o declarar la diferencia si es deliberada— evita que un
tercer consumidor elija mal.

## Dependencias

- Ninguna

## Entrada

- `src/drift.js` (líneas ~15-19), `src/cli.js` (`showGuide`, líneas
  ~149-168), `src/paths.js`
- `docs/architecture-reviews/002-instalacion-tras-el-ciclo-de-vida.md`
  — hallazgo H2

## Resultado esperado

- Una sola operación «la ruta registrada es segura para acceder» en
  `paths.js` (o la diferencia entre los dos niveles —padres vs hoja—
  declarada en el código y el dominio), consumida por `drift.js` y
  `showGuide`.
- `guide` sigue validando la hoja misma (lee el contenido); la
  deriva mantiene su semántica actual.
- Mismo comportamiento observable.

## Criterios de calidad

- Las pruebas de escape por enlace existentes (`check`, `guide`,
  plan) siguen verdes sin modificar aserciones.
- Un solo mecanismo o una diferencia documentada; cobertura 100 %.

## Procedimiento sugerido

1. Comparar los dos mecanismos y decidir unificación o declaración.
2. Extraer a `paths.js` lo compartido y adaptar los consumidores.
3. Verificar suite y cobertura.

## Notas

- Si la unificación revela una diferencia de nivel (la hoja importa
  en `guide` pero no en deriva), la respuesta puede ser una API de
  dos niveles en `paths.js`, no necesariamente una función única.

## Revisión

- Subagente: — 
- Usuario: — 
