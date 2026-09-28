# Formatos de manifiesto de paquetes y plugins

> **Fecha:** 2026-09

## Propósito

Comparar cómo describen sus manifiestos los sistemas de paquetes y plugins
existentes, para extraer los campos y las decisiones que el formato de
paquete de Teleprompter debe considerar.

## Contexto

Teleprompter va a definir un formato declarativo para describir
configuración de agentes como trasladable
(`docs/proposals/001-formato-paquete/`). El manifiesto debe declarar
identidad, versión, mapa de instalación y precondiciones del repositorio
destino. Esta investigación alimenta la tarea de definición del formato
(`docs/tasks/002-definir-formato-paquete.md`).

## Análisis

### Sistemas comparados

Se cubrieron cuatro familias de sistemas: capacidades de agente, gestores
de paquetes, plugins de editor y plantillas de proyecto.

#### Capacidades de agente

- **SKILL.md (Agent Skills):** un skill es un directorio con `SKILL.md` y
  subdirectorios opcionales (`scripts/`, `references/`, `assets/`). El
  frontmatter YAML exige `name` (máx. 64 caracteres, minúsculas y guiones,
  debe coincidir con el nombre del directorio) y `description` (máx. 1024);
  admite `license`, `compatibility` (texto libre de máx. 500 caracteres
  para requisitos de entorno), `metadata` (pares clave-valor libres) y
  `allowed-tools` (experimental). No hay campo de versión: se sugiere
  llevarla en `metadata` [1].
- **skills.sh y su CLI:** `npx skills add <owner/repo>` instala skills para
  más de veinte agentes; los *packs* son colecciones no listadas que se
  instalan con un comando (`npx skills add https://skills.sh/p/<id>`) y se
  actualizan trayendo el contenido actual, sin anclaje de versión. Requisito
  de contenido: cada skill necesita un `SKILL.md` con `name` y
  `description`; el empaquetador omite archivos inválidos, binarios y
  archivos de más de 2 MB [2][3].
- **Claude Code `plugin.json`:** el manifiesto vive en
  `.claude-plugin/plugin.json` y es opcional; sin él se cargan los
  componentes de la disposición estándar (`skills/`, `commands/`,
  `agents/`, `hooks/`). El único campo requerido es `name` (kebab-case,
  espacio de nombres de los componentes); `version` es opcional. El
  manifiesto permite declarar rutas de componentes fuera de la
  disposición por defecto, `dependencies` a otros plugins y `userConfig`:
  opciones tipadas que el sistema pide al usuario al activar el plugin,
  con marca `sensitive` para credenciales. La política de campos
  desconocidos es mixta: a nivel superior se eliminan con aviso; dentro
  de objetos estrictos (`userConfig`, `channels`, `lspServers`,
  `monitors`) son error. Existe un validador propio,
  `claude plugin validate` [4].

#### Gestores de paquetes

- **npm `package.json`:** `name` y `version` (semver) forman la identidad
  al publicar. `files` es una lista blanca de patrones, con archivos
  siempre incluidos (`package.json`, `README`, `LICENSE`, `main`, `bin`) y
  siempre ignorados; `.npmignore` o, en su defecto, `.gitignore` actúan
  como lista negra. Las precondiciones del entorno son `engines` (rango
  semver, consultivo salvo `engine-strict`), `os`, `cpu` y `libc` (listas
  con negación `!`), y `devEngines` con `onFail` en `warn`, `error` o
  `ignore`. Las dependencias usan rangos semver y admiten URLs y repos
  git. `scripts` define el ciclo de vida (`preinstall`, `install`,
  `postinstall`); se admiten campos arbitrarios [5].
- **`pkg.json` (packspec):** subconjunto de `package.json` para declarar
  dependencias sobre URLs arbitrarias, pensado para plugins de Vim y
  Emacs sin registro central. `repository.url` es el único campo
  requerido; `name` es cosmético y no se usa en resolución ni en rutas;
  `version` se omite deliberadamente porque la versión la porta el repo
  git (tags, con prefijo `v` habitual). `dependencies` asocia cada URL a
  un rango npm, con extensiones: `HEAD`, ids de commit y tags. `engines`
  declara el host (`nvim`, `vim`). No hay campo de versión de la espec
  (su ausencia equivale a 1.0.0) y quedan fuera de ámbito empaquetar,
  publicar y desinstalar. La espec de cliente exige `git`, avisar ante
  incompatibilidad de versión del host y resolver dependencias
  transitivamente. La razón de ser JSON puro: formato legible por máquina
  y sin efectos laterales —los formatos Turing-completos «invitan a
  comportamiento ad hoc desbordado» [6][7].

#### Plugins de editor

- **Manifiesto de extensión de VS Code:** reutiliza `package.json` con
  campos obligatorios `name` (minúsculas, único en el Marketplace),
  `publisher`, `version` semver y `engines.vscode` (obligatorio y no
  admite `*`). `contributes` es un mapa semántico hacia los puntos de
  contribución del host (`languages`, `grammars`, `snippets`, cada uno con
  sus rutas). `activationEvents` declara cuándo se activa la extensión;
  `extensionDependencies` y `extensionPack` relacionan extensiones; el
  script `vscode:uninstall` es el hook de desinstalación [8].
- **Obsidian `manifest.json`:** campos requeridos `id` (minúsculas y
  guiones, sin `obsidian` ni sufijo `plugin`), `name`, `version` semver
  `x.y.z`, `minAppVersion`, `author` y `description`; `isDesktopOnly`
  marca si el plugin solo funciona en escritorio. Un archivo aparte,
  `versions.json`, asocia cada versión del plugin a su `minAppVersion`,
  de modo que un usuario con una app antigua recibe la última versión
  compatible del plugin [9].

#### Plantillas de proyecto

- **`copier.yml`:** distingue dos tipos de configuración. Los ajustes del
  motor llevan prefijo `_` (`_min_copier_version`, `_tasks`,
  `_exclude`, `_subdirectory`); el resto de claves son preguntas al
  usuario con esquema rico: `type` (`bool`, `int`, `path`, `yaml`…),
  `help`, `choices` (fijas, validadas o dinámicas por plantilla),
  `default` (templable, con `UNSET` para forzar respuesta), `secret` (la
  respuesta no se persiste), `validator` (Jinja) y `when` (condicional).
  Las respuestas se guardan en `.copier-answers.yml` y alimentan
  actualizaciones posteriores; la prioridad es CLI > pregunta > respuestas
  previas > defaults. El árbol de la plantilla es el mapa de instalación:
  cada ruta se renderiza hacia el destino, con nombres templables [10].
- **`cookiecutter.json`:** diccionario clave-valor donde una lista como
  valor produce una variable de elección (la primera opción es el
  default); el contexto del usuario (`default_context`) puede
  preconfigurar respuestas. Personalización por renderizado Jinja, sin
  validadores ni persistencia de respuestas [11].

### Patrones y divergencias

**Identidad.** Todos los formatos exigen un nombre con restricciones
léxicas parecidas (minúsculas, guiones, longitud acotada). La unicidad se
resuelve de tres maneras: registro central (npm, Marketplace de VS Code,
directorio de Obsidian), fuente direccionable (`pkg.json` usa la URL como
clave de dependencia; skills.sh instala por `owner/repo`) o convención
local (SKILL.md obliga a que `name` coincida con el directorio; Obsidian
espera `id` igual a la carpeta) [1][5][6][8][9].

**Versionado.** Hay dos estrategias. La versión semver declarada en el
manifiesto domina donde hay registro o distribución de artefactos (npm, VS
Code, Obsidian; en `plugin.json` es opcional). La alternativa es derivar
la versión del VCS: `pkg.json` la omite porque exige git; skills.sh
siempre instala el contenido actual del repo; copier registra el commit
de la plantilla en el archivo de respuestas. La segunda estrategia solo
funciona cuando cada paquete controla sus propios tags o commits
[2][5][6][8][9][10].

**Declaración de contenido.** Domina la convención sobre configuración:
estructura de directorios fija (`scripts/`, `references/`, `assets/` en
SKILL.md; la disposición estándar del plugin de Claude Code) y manifiesto
reservado para excepciones —`plugin.json` es directamente opcional
[1][4]. La lista blanca explícita de npm (`files`) existe como patrón,
pero los paquetes de contenido declarativo prefieren «todo el directorio,
con tipos por subcarpeta» [5].

**Cardinalidad repositorio ↔ paquete.** Tres arquitecturas coexisten:

- **1:1 estricto.** `pkg.json` exige un único manifiesto de nivel
  superior por repo («this may be relaxed in the future», reconoce la
  espec); VS Code y Obsidian publican un artefacto por manifiesto
  [6][8][9].
- **Detección por escaneo, sin índice.** skills.sh incluye cada
  `SKILL.md` válido que encuentre en un repo; el skill es la unidad y
  ningún archivo describe el conjunto [1][2].
- **Índice global que apunta a paquetes.** `marketplace.json` de Claude
  Code lista un array `plugins` donde cada entrada declara `name` y
  `source` —ruta relativa dentro del repo, repo GitHub externo o
  `git-subdir` para monorepos— y admite campos de `plugin.json` inline;
  npm `workspaces` aplica el mismo patrón con globs a directorios hijos,
  cada uno con su `package.json`; `extensionPack` empaqueta por IDs y
  `_subdirectory` de copier permite varias plantillas por repo
  [5][8][10][12]. La documentación de Claude Code advierte que el
  desfase entre el `name` de la entrada y el del manifiesto del plugin
  es una fuente habitual de fallos de instalación [12].

**Mapa de instalación.** Es el rasgo más escaso: el destino suele ser
convención del cliente (`node_modules`, el directorio `pack` de Neovim,
la carpeta del plugin). Los precedentes más cercanos son `contributes` de
VS Code (mapa semántico hacia puntos de contribución del host), las rutas
de componentes de `plugin.json` (origen → tipo de componente) y el árbol
de copier (mapa literal origen → destino, con nombres templables)
[4][8][10].

**Precondiciones del destino.** Tres niveles de expresividad:

- Estructuradas y verificadas: `engines.vscode` obligatorio y sin `*`;
  `minAppVersion` de Obsidian con `versions.json` para ofrecer una
  versión anterior compatible; `engines` de `pkg.json` con obligación del
  cliente de advertir incompatibilidad [6][7][8][9].
- Estructuradas y consultivas: `engines` de npm produce avisos salvo
  `engine-strict`; `os`, `cpu` y `libc` admiten negación; `devEngines`
  permite elegir `warn`, `error` o `ignore` [5].
- Texto libre: `compatibility` de SKILL.md describe el entorno en prosa
  (máx. 500 caracteres) y no es verificable [1].

La precondición sobre la propia herramienta también existe: copier declara
`_min_copier_version` [10].

**Personalización.** El espectro va de ninguna (`pkg.json`; SKILL.md
delega la adaptación a las instrucciones en prosa) a prompts declarados
en el manifiesto (`userConfig` de `plugin.json`, con tipo, descripción y
marca `sensitive`; `contributes.configuration` de VS Code) y de ahí al
cuestionario completo de copier —validación, condicionales, secretos,
respuestas persistidas— o las variables de elección de cookiecutter
[1][4][6][8][10][11]. Solo copier persiste las respuestas para permitir
re-renderizado y actualizaciones [10].

**Orden de aplicación.** El mecanismo establecido son hooks ejecutables:
`preinstall`/`install`/`postinstall` de npm, `vscode:uninstall` de VS
Code, `_tasks` de copier tras el renderizado [5][8][10]. Ningún formato
declara orden de aplicación en el manifiesto; packspec mantiene los
scripts como cuestión abierta y fuera del núcleo, y npm documenta la
ausencia de scripts de desinstalación como decisión de diseño [6][7]. La
alternativa declarativa a los hooks son las dependencias entre paquetes
(`dependencies` de `plugin.json`, `extensionDependencies` de VS Code),
que inducen orden sin código [4][8].

**Extensibilidad y validación.** npm y `pkg.json` admiten campos
arbitrarios; SKILL.md y `plugin.json` reservan un contenedor `metadata`
libre, y `plugin.json` añade un espacio `experimental` para campos
inestables. La política más refinada es la de Claude Code: campo
desconocido de nivel superior → se elimina con aviso; campo desconocido
dentro de un objeto estricto → error de carga. Un validador propio
(`claude plugin validate`, con `--strict` para CI) completa el contrato
[1][4][5][6].

**Secretos.** Los paquetes no transportan credenciales: `userConfig`
marca las entradas sensibles y las pide al usuario en el destino;
skills.sh advierte explícitamente que no se incluyan secretos en un pack
[2][4].

## Recomendación

Decisiones candidatas para el formato de paquete de Teleprompter, cada
una derivada de la evidencia anterior:

1. **Manifiesto único en la raíz del paquete, en formato de datos puro
   (JSON o YAML), sin ejecutar nada.** Es la opción de todos los sistemas
   declarativos encuestados y la que packspec justifica con más detalle:
   un formato no ejecutable se puede inspeccionar, validar y procesar
   entero antes de actuar [4][5][6][8][9].
2. **`name` requerido, kebab-case, con reglas léxicas explícitas.** Es la
   constante de todos los sistemas; copiar las restricciones de SKILL.md
   (longitud acotada, alfabeto, coincidencia con el directorio del
   paquete) que son las más concretas [1][4][9].
3. **`version` semver explícita en el manifiesto.** El modelo de
   `pkg.json` —versión derivada de tags git— no aplica si los paquetes
   de Teleprompter conviven dentro de un repositorio sin tags por
   paquete, que es el escenario que anticipa la propuesta (el paquete
   de referencia empaqueta la configuración de este mismo repositorio).
   npm, VS Code y Obsidian declaran la versión en el manifiesto por la
   misma razón estructural: el artefacto no controla su VCS [5][8][9].
4. **El paquete es un directorio con su manifiesto; el repositorio puede
   contener uno o varios.** Caso base: un manifiesto en la raíz define un
   paquete único. Para varios, un manifiesto de colección en la raíz
   —modelo `marketplace.json`— lista entradas por ruta; su presencia es
   la señal de detección, sin escaneo del árbol. Cada entrada referencia
   solo la ruta del paquete: `name` y `version` se leen del manifiesto
   del propio paquete, evitando la duplicación que la documentación de
   Claude Code señala como fuente habitual de fallos [12]. El escaneo
   puro de skills.sh se descarta: sin índice no se puede inspeccionar el
   contenido de un repo sin recorrerlo entero [1][2].
5. **Precondiciones estructuradas y verificables, no texto libre.** La
   sección de precondiciones debe poder comprobarse antes de instalar:
   archivos o directorios requeridos en el destino, herramientas con
   rango semver (modelo `engines`), y un comportamiento de fallo
   explícito —bloquear, con `devEngines.onFail` como precedente de
   severidad configurable [5][6][8]. El texto libre de `compatibility` se
   descarta: no es verificable [1].
6. **Mapa de instalación explícito con convención por defecto.** Es el
   rasgo distintivo del paquete de Teleprompter y el menos resuelto en la
   industria. Modelo híbrido: disposición estándar de recursos (como el
   layout de `plugin.json` o los subdirectorios de SKILL.md) más entradas
   origen → destino en el manifiesto para los casos no convencionales
   [1][4][10].
7. **Personalización declarada, no interpretada.** El manifiesto declara
   que existen instrucciones de personalización y dónde viven (fuera de
   alcance su contenido, según la propuesta), y puede declarar entradas
   tipadas al estilo `userConfig` —tipo, descripción, default,
   `sensitive`— sin implementar el cuestionario completo de copier
   [4][10].
8. **Sin hooks ejecutables ni orden en el manifiesto.** El orden de
   aplicación lo determina el instalador; si hiciera falta, dependencias
   entre paquetes como lista de nombres (modelo `plugin.json`) inducen
   orden sin ejecutar código. Los hooks de ciclo de vida son el
   mecanismo sobre el que las fuentes muestran más cautela: npm
   documenta la ausencia de scripts de desinstalación como decisión de
   diseño y packspec mantiene los scripts como cuestión abierta fuera
   del núcleo de la espec [4][5][6][7].
9. **Extensibilidad acotada con política de campos desconocidos.**
   Contenedor `metadata` libre (precedente compartido por SKILL.md,
   `plugin.json` y `package.json`) y política de Claude Code: desconocido
   de nivel superior se ignora con aviso, desconocido dentro de objetos
   conocidos es error. Prever un validador propio como parte del
   contrato [1][4][5].
10. **Identificador de la versión del formato.** packspec optó por no
   tenerlo (ausencia = 1.0.0); dado que la especificación de Teleprompter
   se definirá y refinará en las tareas siguientes, conviene un campo
   opcional —por ejemplo `format`— cuya ausencia equivalga a la primera
   versión: el mismo ahorro de packspec sin cerrar la puerta a cambios
   incompatibles [6].
11. **Los paquetes no transportan secretos.** Las entradas sensibles se
    declaran y se piden en el destino; el paquete nunca contiene
    credenciales (precedente `userConfig.sensitive` y la advertencia de
    skills.sh) [2][4].

## Limitaciones

- La documentación de `plugin.json` describe un formato reciente y en
  evolución (contenedor `experimental`, campos que cambian entre
  versiones); los detalles concretos pueden quedar desfasados antes que
  el resto de la investigación [4].
- `pkg.json` es una especificación en curso con cuestiones abiertas
  (scripts de ciclo de vida, artefactos no-git); sus decisiones
  documentadas pueden no estar cerradas [6][7].
- La página del manifiesto de Obsidian no se pudo recuperar completa; los
  campos citados se verificaron contra la referencia de la API TypeScript
  y los fragmentos de la propia documentación devueltos por búsqueda [9].
- No se encuestaron formatos de paquetes de infraestructura (Helm
  `Chart.yaml` + `values.yaml`, kustomize), la familia más cercana a
  «configuración trasladable con personalización por valores». Si la
  definición del formato necesitara un modelo de valores reescribibles
  por capas, conviene una consulta dirigida a esa familia.
- Las fuentes se consultaron en 2026-09; las versiones citadas son las
  vigentes en esa fecha (npm CLI 11, documentación estable de copier y
  cookiecutter).

## Referencias

- [1] Agent Skills, «Specification» —
  github.com/agentskills/agentskills/blob/main/docs/specification.mdx
- [2] Vercel, «skills.sh — Packs» — skills.sh/docs/packs
- [3] Vercel, «skills.sh — CLI Reference» — skills.sh/docs/cli
- [4] Anthropic, «Plugin manifest reference» —
  docs.claude.com/en/docs/claude-code/plugins-reference
- [5] npm, «package.json» — docs.npmjs.com/cli/v11/configuring-npm/package-json
- [6] packspec, «pkg.json format specification» — packspec.org/spec.html
- [7] packspec, «pkg.json client specification» — packspec.org/client-spec.html
- [8] Microsoft, «Extension Manifest» —
  code.visualstudio.com/api/references/extension-manifest
- [9] Obsidian, «Manifest» y «Versions» — docs.obsidian.md/Reference/Manifest,
  docs.obsidian.md/Reference/Versions
- [10] Copier, «Configuring a template» —
  copier.readthedocs.io/en/stable/configuring/
- [11] Cookiecutter, «Choice Variables» —
  cookiecutter.readthedocs.io/en/stable/advanced/choice_variables.html
- [12] Anthropic, «Create a marketplace» —
  docs.claude.com/en/docs/claude-code/plugin-marketplaces
