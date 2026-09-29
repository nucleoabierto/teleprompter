# Decisiones de diseño

Índice de las decisiones que dan forma al proyecto y son costosas de
revertir. Cada decisión vive en un archivo `DNNN-slug.md` de este
directorio.

Cada entrada del índice declara el archivo, un resumen de una frase, su
estado y sus disparadores: los archivos, artefactos y palabras clave que
hacen aplicable la decisión. Los disparadores son el contrato de
descubrimiento: quien vaya a tocar algo listado aquí debe leer la
decisión antes de actuar.

## Decisiones

- [D001-manifiesto-json-puro.md](D001-manifiesto-json-puro.md) — el
  manifiesto del paquete es JSON puro llamado `teleprompter.json`.
  - Disparadores: `teleprompter.json`, manifiesto, formato de datos,
    JSON, paquete
  - Estado: Aceptada
- [D002-cardinalidad-repo-paquete.md](D002-cardinalidad-repo-paquete.md)
  — un repositorio puede contener uno o varios paquetes; el campo
  `collection` del manifiesto discrimina paquete y colección.
  - Disparadores: `collection`, `packages`, colección, cardinalidad,
    monorepo, varios paquetes
  - Estado: Aceptada
- [D003-version-semver-en-manifiesto.md](D003-version-semver-en-manifiesto.md)
  — la versión del paquete es semver explícita en el manifiesto, no
  derivada del VCS.
  - Disparadores: `version`, semver, versionado, manifiesto
  - Estado: Aceptada
- [D004-mapa-instalacion-explicito.md](D004-mapa-instalacion-explicito.md)
  — el manifiesto declara `install`, una lista de entradas
  origen-destino, sin deducción por convención.
  - Disparadores: `install`, mapa de instalación, source, target,
    manifiesto
  - Estado: Aceptada
- [D005-plan-completo-aborto-total.md](D005-plan-completo-aborto-total.md)
  — el instalador calcula el plan completo antes de escribir y aborta
  la operación entera si no es ejecutable.
  - Disparadores: instalador, plan, aborto, verificación, ejecución
  - Estado: Aceptada
- [D006-politica-colisiones.md](D006-politica-colisiones.md) — ante una
  colisión se resuelve interactivamente en consola interactiva y se
  aborta sin ella; `--force` y `--skip` resuelven por adelantado y son
  excluyentes.
  - Disparadores: colisión, `--force`, `--skip`, conflicto,
    interactivo, sobrescritura
  - Estado: Aceptada
- [D007-registro-teleprompter-lock.md](D007-registro-teleprompter-lock.md)
  — cada instalación escribe `teleprompter-lock.json` en la raíz del
  destino con los recursos instalados, sus acciones y sus hashes.
  - Disparadores: `teleprompter-lock.json`, registro, lock, propiedad,
    `managed-update`, hash
  - Estado: Aceptada
- [D008-implementacion-javascript-npx.md](D008-implementacion-javascript-npx.md)
  — el instalador es JavaScript distribuido como el paquete npm
  `@nucleoabierto/teleprompter`, ejecutable con `npx`.
  - Disparadores: `npx`, npm, `@nucleoabierto`, JavaScript, CLI,
    distribución
  - Estado: Aceptada
