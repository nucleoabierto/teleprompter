# Registrar el commit obtenido en el origen del registro

## Estado

**[ ] Pendiente** | [~] En progreso | [r] En revisión | [x] Completada | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

El registro conserva el commit exacto que produjo cada instalación
remota: el origen `github` gana el campo `commit` con el SHA
resuelto, escrito al instalar y refrescado al actualizar.

## Dependencias

- 037 — aporta el SHA resuelto en el resultado de la
  obtención remota.

## Entrada

- `src/lock.js`: `isValidOrigin` (la forma válida del origen) y
  `writeLock` (donde el origen se persiste).
- `src/cli.js`: `originOf` (la construcción del origen registrado)
  y los flujos de `install` y `update` que lo producen.
- El resultado del fetch con el SHA resuelto, del Borrador 01.

## Resultado esperado

- Toda instalación remota registra `{type: github, repo, ref?,
  commit}` —`commit` siempre presente en orígenes `github`—; los
  orígenes `path` no lo llevan.
- `update` mantiene su semántica de avance: obtiene lo que el
  origen publica en ese momento y el `commit` registrado se mueve
  con él, de modo que el registro siempre dice qué árbol produjo la
  instalación vigente.
- Los locks escritos antes del campo siguen siendo válidos: el
  origen sin `commit` se acepta.

## Criterios de calidad

- Tras `install user/repo`, el `commit` registrado coincide con el
  SHA que la API de GitHub declara para la rama por defecto.
- Tras `update`, el `commit` refleja el SHA del contenido efectivamente
  instalado en esa invocación.
- Un lock previo sin `commit` pasa la validación y no rompe `list`,
  `check` ni `update`.
- La suite cubre los caminos nuevos y la cobertura sigue al 100 %.

## Procedimiento sugerido

1. Ampliar `isValidOrigin` para aceptar `commit` como string
   opcional en orígenes `github`.
2. Propagar el SHA resuelto desde el resultado de la obtención
   hasta `originOf`/`writeLock` en los flujos de `install` y
   `update`.
3. Cubrir con tests: install y update remotos registran el SHA,
   origen `path` sin campo, lock antiguo sin `commit` sigue válido.

## Notas

- La divergencia «el commit avanzó, la versión no» queda
  detectable comparando el `commit` registrado con la resolución
  actual del origen; exponerla corresponde a la línea de revisión
  de desactualizados (fuera de alcance de esta propuesta).

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
