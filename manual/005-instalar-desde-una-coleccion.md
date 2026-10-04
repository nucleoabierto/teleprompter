# Instalar desde una colección

Un repositorio puede agrupar varios paquetes: su `teleprompter.json`
declara `collection: true` y un índice `packages` de rutas. El
consumidor selecciona qué paquete instalar por nombre y cada paquete
elegido se instala como una unidad independiente —con su plan, su
guía y su entrada en el registro—. La colección en sí no se instala:
no es un paquete. El contrato del manifiesto de colección está en la
[sección Colecciones de la especificación](https://github.com/nucleoabierto/teleprompter/blob/master/docs/especificacion-paquete.md);
la mecánica detallada, en la [referencia](referencia-install.md#colecciones).

## Para el consumidor

```text
teleprompter install <user/repo[@ref]> --package <nombre> [destino]
teleprompter install --path <colección> --package <nombre> [destino]
```

`--package` es repetible para instalar varios paquetes de una vez.
Sin selección, la operación imprime el índice de la colección —nombre,
versión y descripción de cada paquete— y aborta sin escribir: es la
forma de descubrir qué ofrece un repositorio antes de elegir. Una vez
instalados, los paquetes se gestionan por separado:
[`list`](002-listar-paquetes-instalados.md), [`check`](003-verificar-recursos-instalados.md),
[`guide`](referencia-guide.md) y [`update`](004-actualizar-un-paquete.md)
operan sobre cada paquete, no sobre la colección.

## Para el mantenedor

Declarar una colección es añadir un `teleprompter.json` en la raíz
del repositorio con `collection: true` y la lista de rutas de sus
paquetes; el `name` y la `version` de cada paquete viven en su propio
manifiesto, nunca en el índice. La
[colección de referencia](https://github.com/nucleoabierto/teleprompter/tree/master/examples/coleccion-skills)
del propio proyecto agrupa los skills del ciclo de tareas, uno por
paquete, junto a [la misma familia empaquetada como un solo
paquete](https://github.com/nucleoabierto/teleprompter/tree/master/examples/paquete-unico)
—el contraste entre las dos formas es el ejemplo—.

## Escenarios

- **Una colección sin selección imprime el índice y no escribe
  nada.** — módulos `test/cli.test.js` («a collection without
  --package prints the index and writes nothing») y
  `test/e2e.test.js` («the reference collection installs a selected
  member end to end», fase de descubrimiento)
- **`--package` instala el miembro elegido de una colección local.** —
  módulo `test/cli.test.js`, «--package installs the selected member
  of a local collection»
- **Una colección remota resuelve el miembro dentro del árbol
  descargado.** — módulo `test/cli.test.js`, «--package on a remote
  collection resolves inside the fetched tree»
- **Varios `--package` instalan cada miembro en orden, con su propia
  entrada de registro.** — módulo `test/cli.test.js`, «several
  --package flags install each member in order with its own lock
  entry»
- **Repetir el mismo nombre instala el paquete una sola vez.** —
  módulo `test/cli.test.js`, «a repeated --package name installs the
  member once»
- **Un nombre ausente del índice aborta listando los disponibles.** —
  módulo `test/cli.test.js`, «--package with a name absent from the
  index lists the available ones»
- **`--package` sobre un origen que no es colección es un error de
  invocación.** — módulo `test/cli.test.js`, «--package with a
  package origin (not a collection) is an error»
- **Un fallo en la unidad N deja instaladas las anteriores.** —
  módulo `test/cli.test.js`, «a failure on the Nth unit leaves the
  previous ones installed»
- **`update` re-resuelve el mismo paquete a través del índice.** —
  módulos `test/cli.test.js` («update re-resolves the recorded member
  of a local collection», «update re-fetches the recorded remote
  collection and updates the member») y `test/e2e.test.js`
- **Un paquete retirado del índice aborta con «ya no está en la
  colección».** — módulo `test/cli.test.js`, «update reports a member
  retired from the collection index»
- **`list`, `check` y `guide` tratan el paquete de colección como
  cualquier otro.** — módulo `test/cli.test.js`, «list, check and
  guide treat a collection-installed package like any other»
- **La colección de referencia se instala de principio a fin con el
  binario real.** — módulo `test/e2e.test.js`, «the reference
  collection installs a selected member end to end» y «the
  single-package example installs the whole familia as one
  deliverable»
