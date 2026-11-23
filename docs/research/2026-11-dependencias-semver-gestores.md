# Restricciones de versión en dependencias: cómo lo hacen los gestores

**Fecha:** 2026-11
**Tipo:** abierta (comparación de opciones)

## Propósito

Determinar, con evidencia de gestores de paquetes establecidos, qué
modelo de restricción de versión encaja en las dependencias entre
paquetes Teleprompter (propuesta 012): vocabulario de rangos, semántica
de resolución y tratamiento de restricciones compuestas en el grafo.

## Contexto

El formato fija que «la autoridad de la versión es el manifiesto, no el
VCS» (`docs/especificacion-paquete.md`): los refs (`@v2`, rama, ruta)
son localizadores del árbol y la versión solo existe dentro del
`teleprompter.json` obtenido. No existe registro que enumere versiones
publicadas de un paquete. La obtención remota ancla cada unidad a un
commit exacto (épica 008/010). Internamente existe comparación semver
mínima (`semverAtLeast`, usada por `update`/`outdated`); no hay
biblioteca semver ni parser de rangos.

## Análisis

### Modelos observados

- **npm (node-semver + npm-pick-manifest):** la restricción es una
  *selección*. El rango (`^1.2.3` = `>=1.2.3 <2.0.0`, `~`, `1.2.x`,
  comparadores, `||`, `*`) se reescribe a conjuntos de comparadores y
  el resolvedor elige la máxima versión que satisface **entre las
  publicadas en el registro**, con reglas propias para prereleases y
  preferencia por `latest` [1][2]. `npm install` escribe `^` por
  defecto; el lockfile fija el resultado.
- **Cargo:** mismo esquema —resolver con unificación de versiones y
  backtracking, preferencia por la más alta, `Cargo.lock` fija—; una
  versión a secas (`1.2`) equivale a `^1.2` por defecto [3].
- **pip (resolvelib):** especificadores PEP 440 (`>=`, `<`, `==`,
  `~=`) resueltos contra PyPI con backtracking; restricciones
  conjuntamente imposibles producen `ResolutionImpossible` [4].
- **Go modules (MVS):** modelo distinto. Cada `require` nombra un
  *piso* de versión, no un rango a resolver: la lista de compilación es
  el máximo de los pisos exigidos por módulo. Determinista sin
  lockfile, evita el Version-SAT (NP-completo), y escoge «las versiones
  más cercanas a las que el autor desarrolló» [5][6][7].

### Semántica frente a enumeración

Los dos primeros bloques (npm/Cargo/pip) comparten el núcleo: la
restricción *selecciona* entre versiones **enumerables** en un índice.
Go muestra la alternativa: la restricción *valida* un piso sobre lo que
el grafo ya nombró —la directiva `require` nombra a la vez el mínimo y
la elección— y obtiene repetibilidad sin registro ni SAT.

### Composición de restricciones en el grafo

Los rangos componen de formas no visibles localmente: dos manifiestos
individualmente satisfacibles pueden ser conjuntamente imposibles
(`foo>=2` y `foo<2`), y el conflicto solo emerge al recorrer el grafo
[2]. MVS lo resuelve tomando el requisito máximo por módulo; un modelo
de aserción exige que la versión obtenida satisfaga **toda**
restricción declarada sobre la misma unidad.

### Determinismo

npm/Cargo necesitan el lockfile para congelar lo que el resolvedor
eligió; Go lo obtiene gratis del propio algoritmo. Teleprompter ya
obtiene determinismo por el pin de commit —más fuerte que ambos—; la
restricción añade una capa de verificación, no de selección.

## Recomendación

Para Teleprompter la evidencia sugiere:

- **Restricción como aserción, no como selección** —el precedente es
  el `require` de Go, no el rango de npm—: la referencia de la pieza
  (miembro del árbol u origen externo) sigue eligiendo qué se obtiene,
  y la restricción valida la `version` que el manifiesto obtenido
  declara. Insatisfecha → unidad no satisfacible → conjunto aborta
  antes de escribir, como las demás verificaciones. El modelo npm de
  «resolver a la máxima publicada» es impracticable sin un índice de
  versiones que el formato no tiene.
- **Vocabulario acotado npm** para expresar la restricción —`^`, `~`,
  exacta, comparadores (`>=`, `<=`, `>`, `<`), `*`—: es el lenguaje que
  los mantenedores ya escriben; los convenios Go (piso) y Cargo
  (`1.2` = `^1.2`) documentan que un vocabulario pequeño basta.
- **Unión de restricciones por paquete:** cuando varias piezas del
  grafo exigen rangos sobre la misma unidad, la versión obtenida debe
  satisfacerlas todas; insatisfacción → aborto con diagnóstico, en la
  línea de `ResolutionImpossible`/MVS.
- **Prereleases fuera del conjunto inicial:** las reglas de prerelease
  de node-semver son un dominio propio [2]; la versión del formato es
  `x.y.z` y basta cubrirla.
- **Evaluador sobre biblioteca:** la evaluación del conjunto se apoya
  en `semver` (node-semver, la implementación de referencia) o en el
  fork cero-dependencias `@vltpkg/semver`, en lugar de un parser
  propio —los casos borde de la gramática (caret bajo `0.x`,
  parciales, conjuntos de comparadores) son terreno de bugs
  silenciosos que la biblioteca ya resuelve—; sustituye además al
  comparador propio `semverAtLeast`. El vocabulario declarado por el
  formato sigue siendo el subconjunto acotado.

## Limitaciones

- No se ejecutó ningún resolvedor: la evidencia es documental.
- La convención de tags semver en orígenes GitHub (posible vía futura
  para enumerar versiones) no se estudió; queda fuera por decisión del
  modelo de aserción.

## Referencias

- [1] npm, node-semver range grammar — github.com/npm/node-semver
- [2] «How Package Lockfiles Actually Work», debtman.dev —
  debtman.dev/blog/how-package-lockfiles-actually-work
- [3] The Cargo Book, «Dependency Resolution» —
  doc.rust-lang.org/stable/cargo/reference/resolver.html
- [4] CHAINS research project (KTH), «Dependency Resolution Algorithms
  in Different Ecosystems» — chains.proj.kth.se/dependency-resolution
- [5] Go Modules Reference, «Minimal version selection» —
  go.dev/ref/mod
- [6] Russ Cox, «The Principles of Versioning in Go» —
  research.swtch.com/vgo-principles.pdf
- [7] Sourcegraph, «Resolve Go dependencies with minimal version
  selection» — sourcegraph.com/blog/
  the-pain-that-minimal-version-selection-solves
