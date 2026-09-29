# Motores de instalación: verificación, plan, colisiones y registro

> **Fecha:** 2026-09

## Propósito

Comparar cómo ejecutan la instalación las herramientas que llevan
contenido a un repositorio o directorio con trabajo previo, para
extraer las decisiones que el instalador de Teleprompter debe
considerar: verificación del destino, presentación del plan, políticas
de colisión, atomicidad y registro del resultado.

## Contexto

Teleprompter ya tiene definido el formato de paquete
(`docs/formato-paquete.md`): un manifiesto `teleprompter.json` declara
precondiciones (`requires`) y un mapa de instalación (`install`). La
propuesta `docs/proposals/002-motor-instalacion/` define el problema a
resolver: la instalación manual es una operación a ciegas, sin
validación previa ni registro. Esta investigación alimenta la tarea de
definición del comportamiento del instalador
(`docs/tasks/006-definir-comportamiento-instalador.md`) y reutiliza la
investigación de formatos de manifiesto
(`docs/research/2026-09-formatos-manifiesto.md`) como base de qué
contrato ejecuta la herramienta.

## Análisis

### Herramientas comparadas

Se cubrieron cinco familias: gestores de dotfiles, plantillas de
proyecto, gestores de paquetes de sistema, infraestructura como código
e instaladores de configuración de agentes.

#### Gestores de dotfiles

- **chezmoi:** calcula el estado objetivo de cada archivo y aplica los
  cambios mínimos. `chezmoi diff` muestra las diferencias antes de
  escribir; `chezmoi status` presenta un código de dos columnas —el
  último estado escrito contra el real, y el real contra el
  objetivo—; `-n`/`--dry-run` combinado con `-v` imprime los cambios
  como comandos aproximados sin tocar el destino. Si un archivo fue
  modificado localmente desde la última escritura, `apply` pregunta
  antes de sobrescribir, y `merge` abre una herramienta de mezcla
  [1][2][3].
- **GNU Stow:** planifica todas las operaciones antes de ejecutar y,
  si detecta cualquier conflicto —un destino existente que no es un
  enlace suyo—, aborta la operación completa sin escribir nada. `-n`
  simula sin modificar; `-c` recorre el árbol entero listando todos
  los conflictos. `--adopt` es la válvula de escape: mueve el archivo
  preexistente dentro del paquete y lo convierte en recurso gestionado
  [4][5]. El concepto clave es la **propiedad**: Stow solo toca lo que
  apunta dentro de su directorio y «nunca borra nada que no le
  pertenece» [6].
- **rcm:** `lsrc` es la fase de inspección: lista los mapeos
  origen→destino sin escribir. `rcup` pregunta antes de sobrescribir
  archivos existentes, y `rcup -g` genera un guion de shell con las
  operaciones exactas —un plan materializado como artefacto
  ejecutable [7].
- **Dotbot:** la política se declara por entrada en la configuración:
  `relink` actualiza solo enlaces, `force` elimina lo que haya —
  archivo o directorio— y `backup` conserva el destino previo con
  sufijo `.dotbot-backup.{timestamp}`. La distinción `relink`/`force`
  nació de un caso real: sobrescribir enlaces sin destruir archivos
  [8][9].

#### Plantillas de proyecto

- **copier:** `--pretend` ejecuta sin escribir. La salida informa cada
  archivo por estado (`create`, `identical`, `conflict`, `force`); ante
  un conflicto pregunta por archivo («Overwrite? [Y/n]»), y
  `--overwrite`/`--force` lo resuelven sin preguntar. Persiste las
  respuestas y la referencia de la plantilla en `.copier-answers.yml`,
  lo que habilita `copier update`: una actualización con diff
  inteligente que ante hunks irresolubles genera marcadores `inline`
  (estilo `git merge`) o archivos `.rej` según `--conflict`
  [10][11][12].
- **degit:** el destino debe estar vacío salvo `--force` o una
  confirmación interactiva. No hay plan ni registro: es el modelo más
  simple —y el menos seguro— de los encuestados [13].

#### Gestores de paquetes de sistema

- **dpkg:** mantiene una base de datos de propiedad: cada archivo del
  sistema pertenece a un paquete. Si el paquete a instalar contiene un
  archivo que ya pertenece a otro, la operación aborta con el error
  «trying to overwrite …, which is also in package …». La excepción
  declarada es el campo `Replaces`, que permite tomar posesión; la
  válvula operativa es `--force-overwrite`, documentada como
  excepcional («better to leave them alone») [14][15][16].

#### Infraestructura como código

- **Terraform:** es el modelo canónico de plan separado de ejecución.
  `terraform plan` refresca el estado real, lo compara con lo declarado
  y presenta las acciones propuestas sin ejecutarlas; con `-out=FILE`
  el plan se guarda como artefacto ejecutable. `terraform apply`
  recalcula el plan y exige confirmación (`yes`), o ejecuta un plan
  guardado sin repreguntar —pasar el plan es la aprobación. El archivo
  de estado registra los objetos gestionados y habilita que cada plan
  futuro difiera contra la realidad; el estado se bloquea durante la
  aplicación [17][18].

#### Instaladores de configuración de agentes

- **skills.sh CLI (`npx skills add`):** instala skills en directorios
  de agentes, por enlace simbólico (defecto) o por copia (`--copy`).
  Ofrece `-l/--list` para inspeccionar sin instalar, `-y/--yes` para
  omitir las confirmaciones y `--all` para una instalación plena sin
  preguntas. Mantiene dos archivos de bloqueo: `./skills-lock.json`
  para el ámbito de proyecto —pensado para versionarse, con hash
  SHA-256 del contenido por skill— y `~/.agents/.skill-lock.json` para
  el ámbito global, que registra fuente, hash e instantes de
  instalación y actualización [19][20].
- **lash:** instalador dirigido por manifiesto (`lash.json`): el mismo
  archivo guía instalar y desinstalar, leído hacia delante y hacia
  atrás. Es idempotente, hace copia de seguridad (`{path}.lash-backup`)
  antes de reemplazar un archivo existente y ofrece `status` para
  comparar lo instalado contra lo declarado [21].

### Patrones y divergencias

**Verificación previa.** El espectro va de «destino vacío o abortar»
(degit) a verificación completa del plan antes de ejecutar (Stow
calcula todos los conflictos y aborta la operación entera; Terraform
refresca el estado real antes de proponer). La idea transversal es la
propiedad: dpkg, Stow, chezmoi y lash distinguen lo que la herramienta
gestiona de lo que existe en el destino, y solo esa distinción hace la
verificación precisa —un destino ocupado por lo propio no es lo mismo
que uno ocupado por lo ajeno [1][4][14][21].

**Presentación del plan.** Tres grados: ninguno (degit), informe en
texto (`lsrc`, `chezmoi diff`, `--dry-run` verboso) y artefacto
materializado —`terraform plan -out` y `rcup -g` convierten el plan en
un archivo o guion que una ejecución posterior consume sin recalcular
[7][13][17][18]. La salida por recurso con estado (`create`,
`identical`, `conflict` de copier; los códigos de dos columnas de
`chezmoi status`) es el formato que más información da por línea
[3][10].

**Políticas de colisión.** Cuatro patrones, no excluyentes:

- Abortar: el defecto en Stow, dpkg y degit —la colisión con lo no
  gestionado detiene todo [4][13][14].
- Preguntar por recurso: chezmoi (solo si el destino cambió desde la
  última escritura), copier y rcm [1][7][10].
- Resolver por opción: `--force-overwrite` (dpkg), `--force`
  (copier/degit), `force`/`relink`/`backup` por entrada (Dotbot)
  [8][13][14].
- Incorporar o conservar: `--adopt` de Stow mueve lo preexistente al
  paquete; las copias de seguridad de Dotbot y lash preservan lo
  reemplazado [5][21].

El merge de contenido solo aparece en copier update, y exige estado
persistido (el archivo de respuestas) más VCS en ambos lados [11].

**Atomicidad.** Stow y Terraform son todo-o-nada: el plan se calcula
completo y un conflicto irresoluble aborta antes de la primera
escritura [4][17]. copier y chezmoi aplican por archivo: la operación
puede quedar a medias, mitigado por el registro y la idempotencia
[1][10]. dpkg aborta el paquete ante la colisión pero el resto del
sistema ya desempaquetado no se revierte [14].

**Registro del resultado.** Los sistemas que mantienen un registro lo
usan siempre para lo mismo: saber qué es suyo en la próxima operación.
El estado de Terraform habilita el siguiente plan; la base de dpkg, la
detección de colisiones; `.copier-answers.yml`, las actualizaciones;
el manifest de lash, la desinstalación simétrica; el snapshot de
chezmoi, detectar la deriva local [10][14][17][21]. El registro no es
un log de auditoría sino la memoria que convierte cada operación en
repetible.

## Recomendación

Decisiones candidatas para el comportamiento del instalador de
Teleprompter, cada una derivada de la evidencia anterior:

1. **Verificación completa antes de escribir, con aborto total.** El
   instalador calcula el conjunto completo de acciones —precondiciones,
   recursos, colisiones— y solo escribe si el plan es ejecutable
   entero. Modelo Stow/Terraform: una operación a medias es el modo de
   fallo que el problema describe [4][17].
2. **El plan es una salida inspeccionable, separable de la ejecución.**
   Una fase de verificación presenta el plan —qué se copiará, qué
   colisiona, qué precondición falla— sin escribir; la ejecución lo
   consume. Materializarlo como archivo (modelo `plan -out`/`rcup -g`)
   queda como extensión, no como requisito [7][17].
3. **Colisión por defecto = abortar con informe.** Un destino ocupado
   por contenido no instalado por la herramienta detiene la operación
   y lista todos los conflictos (modelo `-c` de Stow, error de dpkg).
   Es el defecto conservador de todos los encuestados [4][5][14].
4. **Política de colisiones declarada por opción, no interactiva por
   defecto.** Las resoluciones se piden explícitamente: omitir el
   recurso, sobrescribirlo o conservar el destino previo como copia de
   seguridad (modelo `backup` de Dotbot/lash, menos invasivo que el
   `--adopt` de Stow, pensado para enlaces). La pregunta interactiva
   por archivo puede coexistir, pero una invocación no interactiva debe
   poder resolverlo todo por adelantado [8][10][21].
5. **Registro de instalación en el destino.** Cada instalación escribe
   qué se instaló, de qué paquete y versión, y cómo se resolvió cada
   colisión. No es un log: es la base de propiedad que habilita
   verificación precisa, repetición predecible y —fuera de alcance
   hoy— actualización y desinstalación (precedentes: estado de
   Terraform, base de dpkg, `.copier-answers.yml`, manifest de lash)
   [10][14][17][21].
6. **Salida por recurso con estado.** El plan y el resultado se
   informan recurso a recurso con marcas de estado (modelo
   `create`/`identical`/`conflict` de copier y columnas de `chezmoi
   status`): es el formato que da más información por línea y el que
   hace al plan verificable contra la ejecución [3][10].
7. **Sin merge de contenido.** La resolución decide por recurso
   completo; la mezcla dentro de archivos (modelo copier update) exige
   estado y VCS que no existen en el contexto de Teleprompter [11].

## Limitaciones

- Las fuentes se consultaron en 2026-09; los detalles citados son los
  vigentes en esa fecha.
- Los archivos de bloqueo de skills.sh están documentados como
  característica en evolución: un issue abierto propone convertirlos
  en base de verificación (`ci`, `verify`, `--frozen-lockfile`), así
  que su formato puede cambiar [19][20].
- El manual de Stow advierte que la simulación puede reportar falsos
  conflictos: la verificación sobre el árbol real puede divergir del
  plan calculado [6].
- No se encuestaron instaladores de entornos de desarrollo completos
  (devcontainers, devbox) ni herramientas solo Windows; la familia de
  gestores de dotfiles está sobrerrepresentada porque es la más
  cercana al problema —copiar configuración a un árbol con historia.

## Referencias

- [1] chezmoi, «apply», «diff» y banderas globales —
  chezmoi.io/reference/commands/apply, chezmoi.io/reference/commands/diff,
  chezmoi.io/reference/command-line-flags/global
- [2] chezmoi, «Quick start» — chezmoi.io/quick-start
- [3] chezmoi, «status» — chezmoi.io/reference/commands/status
- [4] GNU Stow manual (opciones y conflictos) —
  gnu.ist.utl.pt/software/stow/manual.html
- [5] stow(8) manpage — manpages.ubuntu.com/manpages/resolute/en/man8/stow.8.html
- [6] Manual de Stow, sección «Conflicts» y noción de propiedad —
  gnu.ist.utl.pt/software/stow/manual.html
- [7] thoughtbot, «RCM(7)» — thoughtbot.github.io/rcm
- [8] Dotbot README — github.com/anishathalye/dotbot
- [9] Dotbot issue #34 — github.com/anishathalye/dotbot/issues/34
- [10] copier, «Configuring» — copier.readthedocs.io/en/latest/configuring
- [11] copier, «Updating a project» — copier.readthedocs.io/en/v9.7.0/updating
- [12] copier, «CLI reference» — copier.readthedocs.io/en/v9.3.0/reference/cli
- [13] degit, «Usage» — unpkg.com/degit@3.10.0/docs/USAGE.md
- [14] Debian Handbook, «Manipulating Packages with dpkg» —
  debian.org/doc/manuals/debian-handbook/sect.manipulating-packages-with-dpkg.html
- [15] Raphaël Hertzog, «Understanding dpkg's file overwrite error» —
  raphaelhertzog.com/2011/08/01/understanding-dpkgs-file-overwrite-error
- [16] dpkg(1) manpage — man7.org/linux/man-pages/man1/dpkg.1.html
- [17] HashiCorp, «Terraform CLI: run workflow» y referencias de
  `plan`/`apply` — developer.hashicorp.com/terraform/cli/run,
  developer.hashicorp.com/terraform/cli/commands/plan,
  developer.hashicorp.com/terraform/cli/commands/apply
- [18] HashiCorp, «Core Terraform workflow» —
  developer.hashicorp.com/terraform/intro/core-workflow
- [19] Vercel Labs, skills CLI README —
  github.com/vercel-labs/skills, cdn.jsdelivr.net/npm/skills/README.md
- [20] Vercel Labs, «Lock files» —
  vercel-labs-skills.mintlify.app/advanced/lock-files; código fuente
  `src/skill-lock.ts` y `src/local-lock.ts` en
  github.com/vercel-labs/skills; propuesta de verificación en
  github.com/vercel-labs/skills/issues/500
- [21] lash README — github.com/johntrandall/lash
