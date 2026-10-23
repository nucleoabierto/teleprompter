# Mostrar el diff de los archivos en conflicto

## Estado

[ ] Pendiente | [~] En progreso | [r] En revisión | **[x] Completada** | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

Hoy un conflicto se anuncia solo por su ruta —`conflicto sin resolver: X` en la salida no interactiva, `colisión en X` en la interactiva— sin mostrar qué cambia. La tarea añade el diff entre el contenido del destino y el del paquete en ambas superficies. Cuando el recurso en conflicto es una carpeta, el diff se resuelve archivo a archivo: se muestran solo los diffs de los archivos que efectivamente difieren, sin diffs vacíos de los que coinciden.

## Dependencias

- Ninguna

## Entrada

- `src/plan.js` — los conflictos llevan `source` (ruta en el paquete) y `target` (destino); un recurso puede ser archivo o carpeta.
- `src/cli.js` — `settleConflicts`: las dos superficies donde el conflicto se anuncia —el listado de `conflicto sin resolver` y la pregunta interactiva—.
- `src/hash.js` — la comparación actual es por hash del recurso completo; el detalle por archivo de una carpeta requiere recorrer su contenido.
- `test/` — la suite que cubre las colisiones y la salida del CLI.

## Resultado esperado

- Cada conflicto anunciado va acompañado del diff entre el contenido del destino y el entrante del paquete; en la consola interactiva el diff se muestra antes de la pregunta —o bajo demanda, si la ejecución decide otra forma—.
- Un conflicto sobre una carpeta muestra el diff de cada archivo interno que difiere; los archivos idénticos dentro de la carpeta no producen salida.
- Los conflictos `removal` —sin `source` que comparar— reciben un tratamiento consistente que la tarea decide: qué se muestra del contenido que se retiraría.
- `test/` cubre el diff de archivo, el diff de carpeta limitado a las diferencias reales y la ausencia de diffs vacíos.

## Criterios de calidad

- El diff mostrado corresponde al contenido real: destino contra recurso entrante, archivo por archivo.
- Una carpeta en conflicto produce diffs solo de sus archivos divergentes —ningún diff vacío ni de archivos idénticos—.
- La resolución de conflictos sigue funcionando tras mostrar el diff, en modo interactivo y no interactivo.
- `npm test` queda en verde con la cobertura exigida —100 % de líneas, funciones y ramas en `src/`—.

## Procedimiento sugerido

1. Decidir el formato del diff —unificado u otro— y su implementación, preferiblemente sin dependencia externa.
2. Resolver el detalle por archivo para los recursos carpeta, comparando contenidos individuales.
3. Integrar la emisión del diff en `settleConflicts`, en las dos superficies, y cubrirlo en la suite.

## Notas

- El formato elegido queda en la decisión de la tarea; conviene que sea legible en terminal sin colores que la prueba no pueda verificar, o que el color sea prescindible.

## Contexto

- Archivos similares:
  - `src/cli.js` — `settleConflicts` concentra las dos superficies del conflicto: el listado `conflicto sin resolver: <target>` por `err` y la pregunta interactiva `colisión en <target>` / `¿quitar?` vía `io.createAsker`; es el punto de integración.
  - `src/plan.js` — una entrada de conflicto lleva `source` (ruta dentro del paquete), `target` (ruta destino relativa) y, en los retirados, `removal: true` sin `source`; `resolveConflicts` asigna `resolution` `overwrite`|`skip` por conflicto.
  - `src/hash.js` — `hashPath` y su `collect` interno recorren un árbol con `lstat` (archivo, symlink como enlace, directorio con marcador): el modelo para el detalle por archivo de una carpeta en conflicto.
  - `src/execute.js` — `copyResource` distingue archivo/enlace/directorio con `lstat`; el recurso puede tener cualquiera de las tres formas.
  - `test/cli.test.js` — los conflictos se ejercitan con `writePkg` + `run(argv, io)` y `createAsker` falso que captura preguntas; `installed(...)` fija el escenario de `update`.
- Patrones:
  - Salida al usuario en español por los canales inyectados `out`/`err`; preguntas interactivas solo vía `io.createAsker` cuando `io.interactive`.
  - Sin dependencias externas para esto: el paquete solo depende de `tar`; el diff se implementa sobre `node:fs`.
  - Recorrido de árboles siempre con `lstatSync`: un symlink se compara como enlace, nunca se sigue.
  - La lectura del contenido entrante usa `pkgDir` + `source` del recurso; la del destino `destDir` + `target`.
- Dominio: `docs/domains/002-instalacion.md` — concepto **Resolución** (anclas `settleConflicts`/`resolveConflicts`/`createAsker`) e invariante del plan completo antes de escribir; el diff es lectura previa a la resolución, no escritura.
- Producto: `manual/referencia-install.md` §Colisiones y `manual/referencia-update.md` — describen las dos superficies que cambian; `manual/001-instalar-un-paquete.md` y `manual/004-actualizar-un-paquete.md` escenifican el flujo.
- PRD: ninguna — el hito 1 es agrupación ligera sin épica ni PRD.
- Lecciones: `revision-tecnica-subagente` — la revisión técnica de esta tarea se lanza con subagente capaz de ejecutar comandos.
- Decisiones: D006 — política de colisiones: interactiva en consola, lista y aborta sin consola, `--force`/`--skip` por adelantado; el diff se integra en esas mismas superficies. D005 — plan completo antes de escribir: mostrar el diff es lectura, no afecta al invariante.

## Conectividad

Conectada.

Todo lo que la tarea asume existe con la forma esperada: las entradas de conflicto llevan `source`/`target` (los `removal` van sin `source`, marcados `removal: true`), `settleConflicts` concentra las dos superficies de anuncio, `io` es inyectable en la suite y `hash.js`/`execute.js` muestran el recorrido con `lstat` que el detalle por archivo necesita. El generador del diff —el formato unificado sin dependencia externa— es la capacidad que la propia tarea crea dentro de su alcance, no infraestructura ausente.

## Plan técnico

`settleConflicts` (`src/cli.js`) aplica la política de colisiones D006 sobre `plan.conflicts`: `--force`/`--skip` resuelven sin anuncio, la consola interactiva pregunta por cada conflicto y la no interactiva los lista y aborta. Cada conflicto lleva `source` —ruta dentro del paquete— y `target` —ruta relativa del destino—, salvo los `removal`, que van sin `source`; hoy el contenido se compara solo por hash de recurso completo (`hashPath`). El cambio añade la capacidad de diff archivo a archivo y la emite en las dos superficies donde el conflicto se anuncia: las flags no anuncian, así que no emiten diff.

- [x] Crear `src/diff.js` con el diff unificado línea a línea entre dos contenidos de texto —cabeceras `---`/`+++`, hunks `@@` con líneas de contexto— sin dependencia externa
  - Aporta: la pieza base reutilizable que el resto de acciones compone
  - Contexto: el proyecto exige 100 % de cobertura en `src/`; el algoritmo debe quedar compacto y con ramas ejercitables por la suite
- [x] Añadir la comparación recurso a recurso de un conflicto: recorrido con `lstat` de ambos lados, unión ordenada de hojas —archivos, enlaces comparados por su destino y directorios vacíos—, emitiendo bloque de diff solo para las hojas que difieren; las unilaterales se muestran como contenido íntegro añadido o retirado
  - Aporta: resuelve el detalle por archivo de una carpeta en conflicto y descarta los iguales, cumpliendo «sin diffs vacíos»
  - Contexto: `hash.js#collect` es el modelo del recorrido; la divergencia de tipo —archivo contra carpeta— emerge sola al comparar hojas; en un `removal` el lado entrante queda vacío y todo el contenido local se muestra como retirado
- [x] Emitir el diff en la superficie no interactiva de `settleConflicts`: tras cada `conflicto sin resolver: <target>`, sus bloques por `err`
  - Aporta: la lista que precede al aborto muestra qué cambiaría cada conflicto
- [x] Emitir el diff en la superficie interactiva de `settleConflicts`: antes de cada `asker.ask`, el bloque por `out`
  - Aporta: la decisión interactiva se toma viendo el cambio —D006: cada conflicto se decide viéndolo—
  - Contexto: el diff va por `out`, no por el stream del asker —queda en el canal estándar que la suite captura—
- [x] Cubrir la suite de pruebas esperada y mantener el 100 % de cobertura exigido
  - Aporta: cierra el criterio de calidad de la tarea

## Suite de pruebas esperada

Casos de uso derivados del objetivo —el hito 1 no tiene PRD—: CU-1 anuncio no interactivo del conflicto, CU-2 anuncio interactivo, CU-3 conflicto sobre carpeta, CU-4 conflicto de retirado.

- En la salida no interactiva, un conflicto de archivo muestra tras `conflicto sin resolver:` el diff unificado destino→paquete con las líneas `-`/`+` del contenido real. (CU-1, O)
- `--force` y `--skip` resuelven sin emitir diff: no hay superficie de anuncio. (CU-1, Z)
- En consola interactiva el diff del conflicto se imprime antes de la pregunta y la resolución sigue decidiendo igual que antes. (CU-2, I)
- Una carpeta en conflicto produce un bloque de diff por cada archivo interno divergente; los archivos idénticos no producen salida. (CU-3, M)
- Un archivo presente solo en el destino se muestra como retirado íntegro; uno solo en el paquete, como añadido íntegro. (CU-3, B)
- Un enlace simbólico divergente se muestra como cambio de su destino de enlace. (CU-3, B)
- Un conflicto `removal` muestra el contenido local que se retiraría, sin lado entrante. (CU-4, O)
- El comportamiento es idéntico en `install` y en `update`; la resolución interactiva y el aborto no interactivo siguen funcionando tras mostrar el diff. (regresión)

## Desviaciones del plan

- **La hoja compara `{kind, lines, eol}`, no solo contenido.** El plan asumía que «la divergencia de tipo emerge sola al comparar hojas»; la revisión mostró que los marcadores sintéticos colisionan con contenido real —un archivo que contiene `-> x` iguala al enlace `x`; un archivo sin salto final igualaba a otro cuya última línea era el propio marcador—, dejando un conflicto anunciado sin diff. El tipo y el fin-de-línea viajan fuera de `lines` y se comparan aparte; el binario tiene `kind` propio con huella sha256, y un bloque sin hunks nombra lo que difiere (`el tipo difiere`, `la nueva línea final difiere`, `archivo vacío`) en lugar de quedar vacío.
- **Guarda de cadena de ruta antes de leer cada lado del diff.** No figuraba en el plan: la revisión detectó que un `target` procedente del lock o una cadena con directorio enlazado leían contenido fuera de la raíz —incluida la variante en la que el separador final de un target de directorio hacía a `lstat` seguir el enlace de la hoja—. Cada lado normaliza separadores finales y pasa por `recordedChainSafe`; un lado inseguro degrada a `(ruta insegura)` sin volcar contenido —el mismo nivel de defensa de `drift.js`/`guide`—. Además, todo dato mostrado —rutas, destinos de enlace, líneas de contenido— pasa por un escape de caracteres de control (`show`: `\n`, `\r`, `\xNN`; el tabulador se conserva) que protege las cabeceras del diff, el anuncio `conflicto sin resolver:`, la pregunta interactiva y el propio contenido de forjar líneas o secuencias de terminal; la comparación opera siempre sobre el dato crudo. Las superficies previas que imprimen `target` en crudo (el plan, el eco de resolución) quedan fuera del alcance.
- **Clasificación por `readdir` con `withFileTypes` en lugar de `lstat` por hijo.** Elimina la ventana en la que una entrada que desaparece entre listado y stat lanzaba una excepción no controlada.
- **Cota del LCS y marcador binario.** Por robustez frente a entradas grandes (matriz acotada a 4M de celdas con degradación a marcador) y contenido no UTF-8 (marcador `(binario, sha256 …)` con huella, que además distingue dos binarios distintos); ambos añadidos tras la revisión dentro de la misma acción, sin cambiar el objetivo.

## Revisión

- Subagente: 2026-10-23 — Aprueba
- Usuario (ejecución): 2026-10-23 — Aprueba
- Usuario (cierre): 2026-10-23 — Aprueba
