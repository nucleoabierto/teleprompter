# Selección de paquetes en repositorios multi-paquete

**Fecha:** 2026-10
**Tipo:** abierta (comparación de opciones)

## Propósito

Determinar, con evidencia de herramientas comparables, cómo nombra el
consumidor el paquete que quiere dentro de un repositorio multi-paquete,
qué ocurre cuando no lo nombra y si la selección admite varios paquetes.
Alimenta la definición del comportamiento de `install` sobre
colecciones (propuesta 007, tarea 031).

## Contexto

El formato ya fija el lado del mantenedor: manifiesto con
`collection: true` e índice `packages` por ruta, con `name` y
`version` leídos del manifiesto de cada paquete (D002,
`docs/especificacion-paquete.md`). La gramática actual del CLI es
`install <user/repo[@ref]> [destino] | --path <paquete> [destino]`,
con `@` ya ocupado por `ref` y un posicional opcional para el destino.

## Análisis

### Gramáticas de selección observadas

- **Claude Code (marketplaces):** modelo de dos pasos —
  `/plugin marketplace add owner/repo` registra la colección bajo un
  nombre y `/plugin install <plugin>@<marketplace>` instala un
  miembro por **nombre**, no por ruta. La instalación interactiva
  `/plugin` ofrece un navegador de descubrimiento; el CLI
  `claude plugin install` es la vía no interactiva [1][2].
- **skills.sh CLI:** `npx skills add owner/repo` instala desde un repo
  multi-skill con varias sintaxis de filtrado: `owner/repo@skill-name`,
  `--skill <nombre>` repetible, `--skill '*'` para todos, URL directa
  a la subruta (`/tree/main/skills/<nombre>`) y `--list` para
  descubrir el contenido sin instalar [3][4].
- **npm workspaces:** `npm install -w <nombre>` selecciona un espacio
  por el `name` de su `package.json`; también nombre de paquete, no
  ruta [5].
- **VS Code extension packs:** el paquete agrupa por IDs y su
  instalación trae el conjunto completo —selección inexistente— [6].

### Comportamiento sin selección

- skills.sh abre un **selector interactivo** de skills y agentes;
  `--list` y `-y` cubren la vía no interactiva [3][4].
- Claude Code separa descubrimiento (`/plugin` navegador) de
  instalación explícita por nombre [1].
- npm workspaces exige `-w`: sin nombre no hay selección.
- VS Code instala todo el pack sin preguntar [6].

### Cardinalidad de la selección

- skills.sh admite varios (`--skill` repetible) y el comodín `'*'` [3].
- Claude Code instala un plugin por comando [1].
- npm `-w` es repetible [5].

## Evaluación comparativa

- Selección por **nombre** es el patrón dominante (Claude Code, npm,
  skills.sh en su sintaxis `@skill` y `--skill`): coherente con D002
  —el nombre vive en el manifiesto del paquete— y con el lock, que
  ya registra paquetes por nombre.
- Selección por **ruta** existe (subrutas URL de skills.sh,
  `git-subdir` de marketplace.json, `_subdirectory` de copier) pero
  como mecanismo del mantenedor, no del consumidor.
- El comodín «todos» solo lo ofrece skills.sh; los demás resuelven
  por nombre explícito o instalan todo el conjunto por diseño.

## Recomendación

Para teleprompter la evidencia sugiere:

- **Selección por nombre de paquete, no por ruta** — es el patrón
  común y el único coherente con el lock por nombre.
- **Flag sobre posicional o `@`:** `install <origen> <paquete>`
  colisiona con el posicional `destino`, y `@` ya denota `ref`;
  `--skill`-style (`--package <nombre>`) evita ambas ambigüedades.
- **Sin selección, error con el índice impreso** (o selector
  interactivo, que el CLI ya puede sostener con su asker): las dos
  vías tienen precedente; la decisión queda en la tarea 031.
- **Selección múltiple por flag repetible** es barata de soportar y
  tiene precedente (skills.sh, npm `-w`); el comodín `'*'` puede
  evaluarse aparte.

## Limitaciones

- El comportamiento por defecto de `skills add` sin `--skill` se
  infiere de la documentación (selector interactivo) sin ejecución
  propia.
- No se estudió el comportamiento de actualización por paquete en
  estas herramientas; las tareas 032 y 033 lo validan sobre nuestra
  propia implementación.

## Referencias

- [1] Anthropic, «Discover and install plugins» —
  code.claude.com/docs/en/discover-plugins
- [2] Anthropic, «Plugin marketplaces» —
  code.claude.com/docs/en/plugin-marketplaces
- [3] Vercel Labs, «skills add» — vercel-labs-skills.mintlify.app/commands/add
- [4] Skills Documentation, «CLI» — skills.sh/docs/cli
- [5] npm, «workspaces» — docs.npmjs.com/cli/using-npm/workspaces
- [6] `docs/research/2026-09-formatos-manifiesto.md` — patrón
  «Cardinalidad repositorio ↔ paquete» (extensionPack, workspaces,
  marketplace.json).
