# Escritura atómica del registro

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

`writeLock` escribe `teleprompter-lock.json` con `writeFileSync`
directo: un corte a mitad de la escritura deja un JSON truncado que
`readLock` degrada a «sin historia», perdiendo de una vez toda la
memoria de propiedad de la que dependen `check`, `update` y la
detección de colisiones. Escribir vía archivo temporal + `rename`
hace el fallo binario: o el lock anterior o el nuevo, nunca uno
corrupto.

## Dependencias

- Ninguna

## Entrada

- `src/lock.js` (`writeLock`, líneas ~103-106)
- `docs/architecture-reviews/002-instalacion-tras-el-ciclo-de-vida.md`
  — hallazgo H5

## Resultado esperado

- `writeLock` escribe a un temporal en el **mismo directorio** (el
  rename solo es atómico dentro del mismo sistema de archivos) y lo
  renombra sobre `teleprompter-lock.json`; el temporal se limpia si
  la escritura falla.
- Mismo formato y contrato del lock; el temporal no debe colisionar
  con targets instalables ni quedar registrado.
- Prueba del camino feliz y del fallo de escritura que verifica que
  el lock previo sobrevive.

## Criterios de calidad

- Un `writeFileSync` que falle deja intacto el lock anterior y sin
  temporales residuales.
- El temporal vive en el directorio del destino y tiene nombre
  inequívoco de la herramienta (p. ej. `.teleprompter-lock.json.tmp`
  con sufijo único).
- Suite verde con cobertura 100 %.

## Procedimiento sugerido

1. Implementar tmp+rename en `writeLock` con `try/finally` de limpieza.
2. Añadir las pruebas de éxito y de fallo.

## Notas

- Afín a la línea «Endurecimiento de la obtención remota» del
  roadmap (Next): mismo espíritu de robustez de la base ya publicada.

## Revisión

- Subagente: — 
- Usuario: — 
