# Guarda de propiedad propia en las lecturas del lock

## Estado

**[ ] Pendiente** | [~] En progreso | [r] En revisión | [x] Completada | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

Las lecturas del registro resuelven `lock.packages[name]` sin guarda
de propiedad propia: una clave heredada como `__proto__` o
`constructor` resuelve un miembro de `Object.prototype` en lugar de
«no instalado», así que un comando invocado con ese nombre opera
sobre un objeto que nadie instaló. La tarea hace que las lecturas
del lock reconozcan solo las entradas propias del registro.

## Dependencias

- Ninguna.

## Entrada

- `src/lock.js` — `lockEntry` devuelve `lock.packages[name]` sin
  comprobar que la clave sea propia; el defecto lo encontró la
  revisión técnica de la tarea 043 (preexistente, no introducido por
  ella). Conviene auditar cualquier otro acceso `lock.packages[...]`
  o equivalente.
- `src/cli.js` — los comandos que resuelven un paquete por nombre a
  través de `lockEntry` (`uninstall`, `update`, `guide`) son la
  superficie observable del defecto.
- El lock es dato no confiable (misma familia de defensas que las
  rutas registradas): la corrección pertenece al lector, no a los
  comandos.
- `src/manifest.js` — `NAME_RE` admite nombres como `constructor`,
  que colisionan con miembros heredados aunque sean nombres válidos.

## Resultado esperado

- `uninstall`, `update` y `guide` invocados con un nombre que solo
  existe como propiedad heredada (`__proto__`, `constructor`,
  `hasOwnProperty`, …) responden «no está instalado» —código 4— como
  cualquier paquete ausente.
- Una entrada propia legítima sigue resolviéndose —incluida una
  clave `__proto__` real, que `JSON.parse` materializa como
  propiedad propia—: la guarda es de pertenencia, no una lista
  negra de nombres.
- `lockEntries` y las escrituras del registro conservan su
  comportamiento.

## Criterios de calidad

- `uninstall __proto__` termina con código 4 y mensaje de paquete no
  instalado, no con éxito; lo mismo en `update` y `guide`.
- Un nombre válido según `NAME_RE` que colisiona con un miembro
  heredado (p. ej. `constructor`) se trata como no instalado salvo
  que la entrada exista como propiedad propia.
- Un lock con una entrada `__proto__` propia —escrita por
  `JSON.parse`— sigue siendo legible por los comandos.
- `npm test` en verde con el 100 % de cobertura exigido en `src/`.

## Procedimiento sugerido

1. Añadir la guarda de propiedad propia en `lockEntry`
   (`Object.hasOwn` o equivalente) y auditar los demás accesos por
   nombre al registro.
2. Cubrir en la suite las claves heredadas en los comandos que
   leen por nombre, más el caso de una entrada `__proto__` propia.

## Notas

- Defecto descubierto durante la revisión técnica de la tarea 043;
  es preexistente y quedó fuera de su alcance.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
