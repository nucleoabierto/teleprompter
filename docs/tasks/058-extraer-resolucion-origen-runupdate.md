# Extraer la resolución del origen de runUpdate

## Estado

[r] En revisión

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

## Contexto

- **Archivos similares:** el propio `commands.js` —`originOf`
  (357) es la dirección directa de la misma traducción
  (source→origin al escribir el lock); la extracción es la
  inversa (origin→source al re-obtener) y debe sentarse a su
  lado—.
- **Patrones:** la capa de invocación devuelve objetos
  discriminados —`{ units }`/`{ code }` en
  `resolveMembers`/`selectUnits`, `{ ok, ... }` en
  `obtainPackage`—; la operación nueva imita ese idioma
  (D021), no devuelve códigos crudos.
- **Dominio:** `docs/domains/002-instalacion.md` y
  `003-registro.md` anclan `runUpdate` y `originOf` en
  `commands.js` —los nombres deben sobrevivir—.
- **Producto:** ningún documento aplica —mensajes y códigos
  `EXIT_USAGE` por rama invariantes—.
- **PRD:** el hito 2 no tiene PRD.
- **Lecciones:** `revision-tecnica-subagente.md` —el revisor
  debe poder ejecutar comandos—.
- **Decisiones:** D021 —idioma de resultado de la capa—;
  D014/D019 —el origen registrado y la selección de miembro,
  contratos que la traducción lee, no toca—.
- **Suite:** `cli.test.js` ejerce cada rama —1604 sin
  origen, 1924 `--ref` sobre origen local, 2128 repo
  malformado, la guarda `isDir` (1932) y la precedencia
  `parsed.ref ?? origin.ref` (1606, 1654)—.

## Conectividad

Verificada durante la recolección: el bloque 210-237 de
`runUpdate` traduce `record.origin` → `source` en ~25 líneas
autocontenidas —ausencia, rama `path` con guarda de `--ref`,
rama `github` con re-parseo y precedencia de `ref`, más la
guarda `isDir` final que valida el `source` resultante venga
del lock o de la invocación—. El hallazgo H7 de la revisión
005 corresponde a este estado. Veredicto: **conectada**.

## Plan técnico

- [x] `sourceOf(err, parsed, origin)` junto a `originOf`:
  la traducción pura del origen registrado —ausente, rama
  `path` con guarda `--ref`, rama `github` con re-parseo y
  precedencia `parsed.ref ?? origin.ref ?? null`— con
  idioma `{ source }`/`{ code }` (D021). Es la inversa
  nombrada de `originOf`: el par se lee junto.
- [x] `updateSource(err, parsed, record)`: el prólogo
  completo —`parsed.source` gana; si no, `sourceOf`; la
  guarda `isDir` valida el resultado en ambos caminos—.
  La precedencia invocación-sobre-lock existe una vez.
- [x] `runUpdate` queda declarativo: resuelve, discrimina
  y sigue al pipeline compartido intacto.
- [x] Correr la suite completa y confirmar el 100 % en
  `src/`.

## Suite de pruebas esperada

- Regresión completa en `cli.test.js`: sin origen (1604),
  `--ref` sobre origen local (1924), repo malformado
  (2128), `isDir` grabado e invocado (1932, 672) y
  precedencia de `ref` (1606, 1654).
- Cobertura 100 % en `src/commands.js`.
- Sin casos nuevos: refactor puro.

## Revisión

- Subagente: 2026-10-29 — Aprueba
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
