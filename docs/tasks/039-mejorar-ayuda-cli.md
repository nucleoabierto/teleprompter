# Mejorar el mensaje de ayuda del CLI

## Estado

[ ] Pendiente | [~] En progreso | [r] En revisión | **[x] Completada** | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

Sustituir la línea de uso monolítica actual —que comprime los cinco subcomandos en una sola línea difícil de leer— por una ayuda estructurada: descripción breve de la herramienta, sinopsis por subcomando, opciones y ejemplos de uso. El objetivo es que una persona que ejecuta `teleprompter` sin argumentos o `teleprompter --help` entienda de un vistazo qué hace cada subcomando y cómo invocarlo.

## Dependencias

- Ninguna

## Entrada

- `src/cli.js` — punto donde se emite el mensaje de uso actual.
- `test/cli.test.js` — suite existente que cubre la salida del CLI.
- `manual/` — documentación de referencia de los subcomandos, por si la ayuda debe quedar alineada con ella.

## Resultado esperado

- `src/cli.js` gana un comando de ayuda como cabe esperar de un CLI: `teleprompter help` y `teleprompter --help` imprimen por stdout la ayuda general formateada —descripción breve, una línea por subcomando con su sinopsis y qué hace, las opciones y ejemplos— y salen con código 0; `teleprompter help <subcomando>` imprime la ayuda de ese subcomando, igual que `teleprompter <subcomando> --help`. La invocación inválida sigue emitiendo la ayuda por stderr con el código de uso, ahora con el texto estructurado en lugar de la línea única.
- `test/cli.test.js` actualizado para cubrir la nueva salida y el nuevo comando.
- `manual/referencia-help.md` documenta el comando y entra en los índices del manual y en la navegación del sitio; el bloque de gramática de `docs/instalador.md` enumera `help`.

## Criterios de calidad

- `teleprompter help` y `teleprompter --help` muestran la ayuda general por stdout y salen con código 0.
- `teleprompter help <subcomando>` muestra la ayuda del subcomando indicado; un nombre desconocido es error de uso.
- `teleprompter <subcomando> --help` muestra la ayuda del subcomando invocado por stdout con código 0; en la forma corta de instalación el comando implícito es `install`.
- La ayuda general muestra cada subcomando (`install`, `guide`, `list`, `check`, `update`) con su sinopsis en líneas separadas y legibles en terminal, las opciones (`--path`, `--package`, `--force`, `--skip`, `--dry-run`, `--ref`) y al menos un ejemplo de uso.
- La invocación sin argumentos o inválida sigue saliendo con el código de uso y emite la ayuda estructurada por stderr.
- `npm test` queda en verde con la cobertura exigida (100 % de líneas, funciones y ramas en `src/`).

## Procedimiento sugerido

1. Diseñar el texto de ayuda nuevo a partir de la sinopsis actual y la referencia del manual.
2. Implementar el cambio en `src/cli.js` manteniendo las mismas condiciones de emisión.
3. Ajustar `test/cli.test.js` a la nueva salida y verificar la cobertura.

## Notas

- La ayuda actual es una única línea: `uso: teleprompter [install] <user/repo[@ref]> [destino] | --path <paquete> ... | guide [<paquete>] | list | check | update <paquete> ...`.

## Contexto

- Archivos similares:
  - `src/cli.js` — la constante `USAGE` (línea 22) es el mensaje a mejorar; `parseArgs` define la gramática real de cada subcomando y `main` lo emite por `err` con `EXIT_USAGE` (4) cuando la invocación no parsea. `bin/teleprompter.js` es solo el envoltorio.
  - `test/cli.test.js` — la suite ejerce `main` con `io` inyectable (`out`/`err` coleccionables, `run()` auxiliar); las aserciones de uso solo verifican `/uso:/` en `stderr[0]`, así que la nueva ayuda debe conservar esa marca o actualizar las aserciones.
- Patrones:
  - Mensajes de producto en español, minúscula inicial, sin puntuación final; las marcas internas (`uso:`, `aviso:`, `plan de instalación:`) son prefijos estables.
  - `main` es una capa de invocación delgada: parseo, delegación y mapeo a códigos de salida; la suite exige 100 % de cobertura de líneas, funciones y ramas sobre `src/`.
  - Gramática por subcomando fijada por decisión: `guide [<paquete>]`, `list` y `check` sin argumentos ni opciones, `update <paquete> [<repo>|--path <dir>] [--ref <ref>]`, `install` como alias de la forma corta. `guide` está reservado como primera palabra (D011).
- Dominio:
  - `docs/domains/002-instalacion.md` — el dominio de instalación cubre el pipeline install/update al que la ayuda alude.
- Producto:
  - `manual/referencia-{install,guide,list,check,update}.md` — una referencia por subcomando; fuente de las sinopsis que la ayuda debe reflejar. El manual no reproduce la línea `uso:` literal: no necesita cambio por esta tarea.
- PRD: ninguno — la tarea es suelta, no pertenece a un conjunto con PRD.
- Lecciones:
  - `docs/lessons/revision-tecnica-subagente.md` — en la revisión técnica de esta tarea el subagente debe poder ejecutar comandos (`git diff`, `npm test`), no un perfil de solo lectura.
- Decisiones:
  - D011/D012/D013/D016 — fijan la gramática de `guide`, `list`, `check` y `update`: comandos propios que operan sobre el directorio de trabajo, sin opciones de instalación; la ayuda debe describirlos fielmente.
  - D008 — implementación JavaScript sobre Node, ejecutable vía `npx`; relevante si la ayuda menciona la forma de invocación.

## Conectividad

Veredicto: **conectada**.

Todo lo que la tarea asume existe en el codebase con la forma esperada:

- `src/cli.js` concentra el mensaje en la constante `USAGE` y lo emite por `err` con `EXIT_USAGE` cuando `parseArgs` devuelve `null` —un único punto de cambio.
- `test/cli.test.js` ejerce `main` con `io` inyectable y las aserciones de uso solo exigen la marca `uso:` —la nueva ayuda puede conservar la marca o actualizar las aserciones dentro del alcance de la tarea.
- La gramática que la ayuda describirá está implementada en `parseArgs` y documentada en `manual/referencia-*.md`; no falta infraestructura.

## Plan técnico

Resumen del subsistema: `main` es una capa de invocación delgada —parsea con `parseArgs`, delega y mapea códigos—; cuando el parseo falla imprime la constante `USAGE` por `err` y devuelve `EXIT_USAGE` (4). `USAGE` es el único punto de emisión de la ayuda y hoy es una línea única que mezcla los cinco subcomandos. No existe `help` ni `--help` como forma reconocida: ambos caen en el camino de error.

- [x] Definir los textos de ayuda: un bloque general —descripción breve, una línea por subcomando con su sinopsis y qué hace, las opciones y ejemplos— y un bloque por subcomando con su sinopsis completa y el detalle de sus argumentos y opciones
  - Aporta: es el contenido del cambio pedido: la ayuda pasa de una línea monolítica a texto formateado como cabe esperar de un CLI
  - Contexto: conservar el prefijo `uso:` en la primera línea —la suite lo aserta—; las sinopsis deben reflejar la gramática real de `parseArgs` y las decisiones D011–D016 (`list`/`check` sin argumentos ni opciones, `guide [<paquete>]`, `update` con origen opcional y `--ref`, `install` como alias opcional); validado con el usuario el formato con secciones `comandos:`, `opciones:` y `ejemplos:`
- [x] Extender `parseArgs` para reconocer `help [<subcomando>]` como comando propio y `--help` como forma global equivalente a `help` sin argumento
  - Aporta: `help` funciona como consulta del CLI, no como error de invocación
  - Contexto: `help` pasa a ser palabra reservada en primera posición —mismo patrón que `guide` (D011)—; `--help` hay que interceptarla antes de que `splitArgs` la rechace como flag desconocida; un `<subcomando>` que no es nombre de comando conocido es error de uso
- [x] Mapear el comando en `main` a una función `showHelp` que imprime por `out` el bloque general o el del subcomando indicado y devuelve `EXIT_OK`; la ruta de error de uso sigue emitiendo por `err` con `EXIT_USAGE`, ahora con el bloque general completo
  - Aporta: separa la consulta —stdout, código 0— del error de invocación —stderr, código 4— y reutiliza el mismo texto en ambas vías
  - Contexto: `teleprompter` sin argumentos sigue siendo invocación inválida —la condición no cambia— pero el usuario ya no ve una línea críptica sino la ayuda completa
- [x] Actualizar `test/cli.test.js` con las expectativas de la suite de la tarea y ajustar las aserciones existentes sobre la salida de uso
  - Aporta: fija el contrato observable nuevo y mantiene la cobertura exigida

## Suite de pruebas esperada

Caso de uso: «el usuario consulta la ayuda» —derivado del objetivo; la tarea no pertenece a un conjunto con PRD.

- `teleprompter help` imprime la ayuda general por stdout y termina con código 0 (O)
- `teleprompter --help` imprime la misma ayuda general por stdout, código 0 (I)
- `teleprompter help <subcomando>` para cada uno de `install`, `guide`, `list`, `check`, `update` imprime la ayuda de ese subcomando por stdout, código 0 (M)
- `teleprompter <subcomando> --help` —incluida la forma corta de instalación, cuyo comando implícito es `install`— imprime la ayuda de ese comando por stdout, código 0 (I)
- `teleprompter help <nombre desconocido>` es error de uso (E)
- La invocación sin argumentos o con argumentos inválidos emite la ayuda general completa por stderr con `EXIT_USAGE`, como antes pero con el texto estructurado (regresión)
- La ayuda general muestra los cinco subcomandos con su sinopsis, las opciones `--path`, `--package`, `--force`, `--skip`, `--dry-run`, `--ref` y al menos un ejemplo (M)
- `npm test` queda en verde con la cobertura exigida —100 % de líneas, funciones y ramas en `src/`— (arnés)

## Revisión

- Subagente: 2026-10-18 — Aprueba
- Usuario (ejecución): 2026-10-18 — Aprueba
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
