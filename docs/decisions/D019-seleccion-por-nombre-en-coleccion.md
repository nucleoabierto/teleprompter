# D019: Selección de paquete en colección por nombre

## Estado

Aceptada

## Contexto

El formato ya declara colecciones —un manifiesto `collection: true`
con un índice `packages` por ruta— pero el instalador las rechaza y
no existe forma de nombrar qué paquete del conjunto se quiere. La
gramática vigente (`install <user/repo[@ref]> [destino] | --path
<dir> [destino]`) tiene ocupados el posicional libre (destino) y el
sigil `@` (ref), y el registro (D014) solo identifica el repositorio
origen, no el paquete dentro de él. La selección es el eje de la
épica de colecciones: su forma condiciona la instalación, el
`origin` y el ciclo de vida.

## Decisión

El paquete se selecciona por nombre con la opción `--package
<nombre>`, repetible y válida con orígenes `github` y `path`. Ante
una colección sin selección, `install` aborta sin escribir e imprime
el índice (nombre, versión y descripción de cada paquete); `--package`
con un origen que no es colección es un error, igual que un nombre
ausente del índice. Cada paquete seleccionado se instala como unidad
independiente. El `origin` gana el campo opcional `package`, que
registra el nombre elegido —no la ruta— y permite a `update`
re-resolver el mismo paquete a través del índice.

## Justificación

El nombre es el patrón dominante en las herramientas comparables
(Claude Code `name@marketplace`, npm `-w`, skills.sh `--skill`) y el
único coherente con el contrato: el índice solo declara rutas y el
nombre vive en el manifiesto de cada paquete, con identidad
garantizada porque `name` debe coincidir con el directorio.
`--package` evita las dos ambigüedades disponibles —un posicional
colisionaría con `destino` y `@` ya denota `ref`— y se deduplica al
repetirse porque la selección es un conjunto. El error con índice
impreso, en lugar de un selector interactivo, sigue la regla del
proyecto «plan completo o aborto total» y funciona en CI sin
excepciones. Registrar el nombre y no la ruta en `origin` deja que
el índice reubique paquetes sin romper orígenes; un lock anterior
sin `package` sigue siendo válido y describe un paquete
no-colección. La selección múltiple se ejecuta secuencialmente en
el orden de los flags con cada paquete como unidad atómica (D005):
un fallo en la unidad N deja instaladas las anteriores, y
`--force`, `--skip` y `--dry-run` aplican a todas las unidades. La
resolución nombre → ruta usa el basename de cada entrada del
índice —idéntico al nombre por `checkName`—, así que un miembro
con manifiesto inválido solo falla si se selecciona; en el índice
impreso se muestra marcado. `update` no admite `--package`: un
origen explícito que sea colección se resuelve por el nombre del
paquete que se actualiza. Consecuencias aceptadas: no hay comodín
«todos» ni selector interactivo en esta versión, un índice con
nombres duplicados se declara ambiguo para la selección, y una
colección que apunta a otra colección es un error —las colecciones
no se anidan.

## Referencias

- `docs/research/2026-10-seleccion-paquetes-colecciones.md` — la
  evidencia de patrones de selección.
- `docs/decisions/D002-cardinalidad-repo-paquete.md` — el contrato
  de colección que esta decisión materializa.
- `docs/decisions/D014-campo-origin-del-registro.md` — el campo que
  `package` extiende.
- `docs/tasks/031-definir-comportamiento-colecciones.md`
