# Revisión de PR [número]

- **Fecha:** [fecha de la revisión]
- **PR:** #[número] — «[título del PR]» — [enlace]
- **Base:** `[rama base]` ← **Head:** `[rama head]` — `[SHA head revisado]`
- **Autor del PR:** [autor]

## Resumen del cambio

[Qué hace el diff, en dos o tres frases.]

## Intención reconstruida

[Contra qué se juzga el cambio, con las fuentes usadas —la descripción del PR,
la tarea o épica referenciada, la documentación del proyecto—. Si la intención
no se pudo reconstruir, se declara aquí y el veredicto es `blocked`.]

## Hallazgos

[Cada hallazgo bajo su severidad, citando el archivo con su anclaje y la regla
declarada o el patrón concreto que infringe. Una observación sin anclaje no es
un hallazgo. «No hay hallazgos» es un resultado válido: declararlo y omitir las
subsecciones vacías.]

### blocker

- [Hallazgos que impiden el merge.]

### important

- [Hallazgos que deberían corregirse antes del merge.]

### nit

- [Observaciones menores.]

## Preguntas abiertas

- [Las dudas que el revisor no pudo resolver con el contexto disponible.]

## Veredicto

[`merge` —el PR está listo— | `improve` —necesita cambios— | `blocked` —el
contexto no alcanza para juzgar con justicia—. Un único veredicto, seguido si
procede de las verificaciones ejecutadas.]
