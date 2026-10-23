# Resolución de divergencias en la retirada

## Estado

**[ ] Pendiente** | [~] En progreso | [r] En revisión | [x] Completada | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

Convertir los recursos registrados con deriva en decisiones del flujo de
desinstalación, con la misma política de conflictos del resto del
producto: en consola interactiva se pregunta por cada uno mostrando el
diff del contenido local que se retiraría, `--force` los retira todos,
`--skip` los conserva todos y, sin consola ni flags, se listan con su
diff y la operación aborta sin escribir. Una divergencia decidida a
retirar se respalda antes de borrarse; una conservada queda en disco y
fuera del registro del paquete retirado.

## Dependencias

- 042.

## Entrada

- `src/cli.js` — `settleConflicts` y su superficie de anuncio
  (listado no interactivo y pregunta interactiva), `parseArgs` con
  `--force`/`--skip` mutuamente excluyentes.
- `src/diff.js` — `diffResource` ya trata un conflicto `removal` como
  lado entrante vacío: el contenido local se muestra como retirado.
- `src/plan.js` y `src/drift.js` — los conflictos `removal` del plan de
  actualización (`remove`/`keep`, D016) como modelo de la decisión.
- `src/execute.js` — `backupConflict`: la copia previa al paso
  destructivo en `.teleprompter/backups/<operación>/`.
- `test/` — las coberturas de conflicto de `update` como modelo.

## Resultado esperado

- Un recurso registrado modificado localmente se anuncia con el diff del
  contenido local que se retiraría y se decide quitar o conservar —
  interactiva, `--force`, `--skip` o aborto con listado según el
  contexto de invocación.
- Una divergencia decidida a retirar se respalda en
  `.teleprompter/backups/` antes de borrarse y el resultado lo anuncia
  con `respaldo:`.
- Conservar deja el recurso en disco y fuera del registro: deja de
  pertenecer al paquete retirado sin que el registro mienta.
- Un directorio registrado con contenido local no registrado diverge y
  recibe el mismo tratamiento —decisión, no borrado a ciegas—.
- El plan de retirada se sigue presentando completo antes de decidir ni
  borrar nada.

## Criterios de calidad

- La política aplicada es la de conflictos del producto (D006): mismas
  superficies, mismas flags y misma exclusión mutua.
- El diff anunciado corresponde al contenido local real que se
  retiraría; los intactos no producen anuncio.
- El respaldo precede a todo borrado decidido, como en `install` y
  `update`.
- El registro queda coherente en cualquier combinación de decisiones:
  lo retirado deja de constar y lo conservado queda sin paquete dueño.
- `npm test` en verde con el 100 % de cobertura exigido en `src/`.

## Procedimiento sugerido

1. Pasar los conservados-por-deriva del plan de retirada a conflictos
   `removal` —el borrador 01 ya los clasifica— y engancharlos a
   `settleConflicts` con el diff local como lado retirado.
2. Resolver `remove`/`keep` por respuesta y por flag, con las mismas
   reglas de exclusión y de aborto no interactivo.
3. Respaldar el contenido divergente decidido a retirar antes de
   borrarlo, reutilizando la mecánica de respaldo.
4. Cubrir la suite: cada superficie de decisión, respaldo de lo
   retirado, conservación y registro resultante.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
