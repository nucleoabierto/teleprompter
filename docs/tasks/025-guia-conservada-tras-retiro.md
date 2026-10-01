# Comportamiento de `guide` sobre una guía conservada tras retiro

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Cuando una versión entrante abandona o renombra `personalization`,
la guía registrada anterior entra en retirados; si tiene deriva y el
usuario resuelve `keep`, el archivo sigue en disco y en `files`,
pero `writeLock` ya no escribe el campo `personalization` —`guide`
responde «no declara instrucciones» aunque la guía exista—. Decidir
si ese es el comportamiento correcto (la versión nueva ya no la
considera guía) o si `keep` debería conservar también el campo, e
implementar lo decidido.

## Dependencias

- Ninguna

## Entrada

- `src/lock.js` (`writeLock`, líneas ~82-90), `src/plan.js`
  (`buildUpdatePlan`), `src/cli.js` (`showGuide`)
- `docs/decisions/D015`, `D016`, `D010`
- `docs/architecture-reviews/002-instalacion-tras-el-ciclo-de-vida.md`
  — hallazgo H6

## Resultado esperado

- El comportamiento elegido —conservar el campo `personalization`
  cuando el usuario hace `keep` de la guía retirada, o dejarlo como
  está— queda declarado en el contrato (`docs/instalador.md`) y el
  dominio, y probado.
- Si se conserva el campo: `writeLock`/`guide` lo reflejan; si se
  deja: la documentación declara que una guía conservada deja de ser
  consultable por `guide`.

## Criterios de calidad

- El caso «guía retirada + `keep`» tiene una prueba que afirma el
  comportamiento decidido.
- Coherencia con D015/D016; cobertura 100 %.

## Procedimiento sugerido

1. Formular el caso al usuario y fijar el comportamiento.
2. Implementar y probar; documentar el resultado.

## Notas

- Es un borde pequeño; si la respuesta elegida es «como está», la
  tarea se reduce a declarar el comportamiento en el contrato.

## Revisión

- Subagente: — 
- Usuario: — 
