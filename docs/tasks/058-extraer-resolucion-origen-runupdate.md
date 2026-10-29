# Extraer la resolución del origen de runUpdate

## Estado

[ ] Pendiente

## Tipo

mantenimiento (refactoring)

## Objetivo

El prólogo de `runUpdate` —93 líneas— mezcla ~25 líneas
autocontenidas de traducción origen-registrado→source con la
orquestación del pipeline; extraerla como operación propia que
devuelve el `source` o el error de uso.

## Dependencias

- Ninguna.

## Entrada

- `src/commands.js`: `runUpdate` (201-293) —la resolución del
  origen vive en 210-238—.
- `docs/architecture-reviews/005-complejidad-interna.md` —
  hallazgo H7—.

## Resultado esperado

- `sourceOf(record, parsed)` —o equivalente— como operación
  propia; `runUpdate` queda como prólogo declarativo + pipeline
  compartido con install.

## Criterios de calidad

- Mismos mensajes y códigos `EXIT_USAGE` por cada rama de
  origen —ausente, `path` con guarda de `--ref`, `github` con
  re-parseo—.
- La precedencia `spec.ref = parsed.ref ?? origin.ref ?? null`
  se conserva.
- `npm test` en verde con el 100 % de cobertura en `src/`.

## Procedimiento sugerido

1. Extraer la resolución del origen con su idioma de resultado
   —source o código de error, como manda D021—.
2. Correr la suite.

## Notas

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
