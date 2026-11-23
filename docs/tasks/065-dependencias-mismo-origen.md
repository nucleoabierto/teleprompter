# Dependencias dentro del mismo origen

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Un paquete declara qué otros paquetes del mismo origen lo completan, e
instalarlo trae consigo el conjunto declarado: los miembros se resuelven
dentro del árbol ya obtenido —mismo commit para todo el conjunto—, se
ordenan de modo que cada dependencia se instale antes que su
dependiente y el conjunto aborta sin escribir cuando la relación es
circular, la pieza no existe o la versión no satisface la restricción.

## Dependencias

- Ninguna.

## Entrada

- `docs/especificacion-paquete.md` — el contrato del manifiesto que
  gana el campo de dependencias.
- `docs/research/2026-11-dependencias-semver-gestores.md` — el modelo
  de aserción y el vocabulario de rangos elegido.
- `src/manifest.js`, `src/collection.js` — la validación del manifiesto
  y la resolución de miembros por nombre dentro del árbol obtenido.
- `src/commands.js` (`runInstall`, `runReinstall`) — el punto del flujo
  donde entra la resolución del conjunto y la maquinaria multi-unidad
  reutilizable: obtener todo antes de planear, abortar el conjunto sin
  escribir, una línea de plan por unidad.
- `src/plan.js` (`semverAtLeast`) — la comparación semver mínima sobre
  la que se apoya la evaluación de rangos.

## Resultado esperado

- `install` de un paquete con `dependencies` instala el paquete y todo
  su conjunto transitivo del mismo origen en una sola invocación, en
  orden de dependencia.
- Un «metapaquete» —paquete de composición cuya única función es
  declarar el conjunto— es válido e instalable.
- Un ciclo, un miembro inexistente o una restricción de versión
  insatisfecha aborta el conjunto antes de escribir nada, con
  diagnóstico legible.

## Criterios de calidad

- El manifiesto gana el campo `dependencies`: lista de entradas
  `{ "package", "version"? }`, documentada en
  `docs/especificacion-paquete.md` junto a `requires`, con las mismas
  reglas de validación (objeto conocido: campos desconocidos = error).
- Cada entrada nombra un miembro del mismo árbol por `package`; la
  ausencia de `version` equivale a «cualquier versión».
- `version` es una restricción semver del conjunto acotado npm —
  `^`, `~`, exacta `x.y.z`, comparadores (`>=`, `<=`, `>`, `<`), `*`—,
  verificada contra la `version` que el manifiesto del miembro
  declara; una restricción malformada invalida el manifiesto.
- `install` deja de ser obligatorio cuando el paquete declara
  `dependencies`: el spec queda coherente para paquetes de composición
  pura.
- La resolución es transitiva dentro del árbol; el conjunto se ordena
  topológicamente (dependencia antes que dependiente) y ese orden
  gobierna verificación, plan y ejecución.
- Un ciclo se detecta en la resolución y aborta el conjunto con la ruta
  legible del bucle (`a → b → a`), antes de cualquier escritura —
  destino, lock o respaldos—.
- Una dependencia sobre un miembro inexistente o una versión que no
  satisface todas las restricciones declaradas sobre la misma pieza
  aborta el conjunto con diagnóstico, sin escribir.
- `--package` conserva su semántica: solo se resuelve lo declarado por
  los miembros seleccionados.
- Cada pieza instalada queda en el lock como una instalación normal
  con el origen del conjunto — `reinstall` la reproduce sin cambios—.
- Suite en verde con cobertura total en `src/`; pruebas de ciclo,
  miembro inexistente, restricción satisfecha e insatisfecha, orden
  del conjunto, metapaquete puro y deduplicación de entradas
  repetidas.
- Documentación viva actualizada: spec, manual (referencia o guía
  según convenga), dominio de instalación y colección si aplica.

## Procedimiento sugerido

1. Extender el spec y `src/manifest.js` con el campo `dependencies` y
   la relajación de `install`; evaluador del conjunto acotado de rangos
   apoyado en la biblioteca `semver` (node-semver, o el fork
   cero-dependencias `@vltpkg/semver`), que además sustituye al
   comparador propio `semverAtLeast`.
2. Resolución del conjunto: tras obtener el árbol, recorrer las
   dependencias declaradas por los miembros seleccionados, verificar
   existencia y versión por miembro, detectar ciclos y producir el
   orden topológico —todo antes de planear.
3. Integración en `runInstall` reutilizando la mecánica multi-unidad:
   todas las unidades resueltas se verifican, planean y ejecutan como
   un conjunto, con la política de conflictos compartida.
4. Pruebas de unidad y de comando por cada criterio; e2e del
   metapaquete; documentación viva.

## Notas

- Las dependencias externas se prevén como la misma entrada con un
  campo de origen (borrador 02): diseñar el nombre y la forma del
  campo de modo que esa extensión no redefina la gramática.
- La identidad de una dependencia es el `package` nombrado —igual que
  `--package`—; el nombre del dependiente no necesita cualificación
  porque el árbol es un solo origen.
- Un paquete no puede depender de sí mismo: es un ciclo de longitud
  uno y aborta como los demás.
- El conjunto acotado del spec es el vocabulario que el formato
  *declara*; la biblioteca es solo el mecanismo que lo evalúa. Si el
  validador acepta la gramática entera de node-semver o exige el
  subconjunto documentado lo decide el plan —declarar el subconjunto
  mantiene la restricción prerelease fuera como el alcance fija—.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
