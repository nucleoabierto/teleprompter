# Mostrar el diff de los archivos en conflicto

## Estado

[ ] Pendiente | [~] En progreso | [r] En revisión | [x] Completada | [!] Bloqueada

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

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
