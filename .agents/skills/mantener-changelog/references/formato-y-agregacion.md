# Formato y política de agregación del changelog

Material de referencia del skill `mantener-changelog`: la estructura del archivo, la plantilla de inicialización, los criterios para decidir si un cambio merece entrada y la política de agregación por agrupación.

## Estructura del archivo

El changelog sigue Keep a Changelog 2.0.0:

- Preámbulo `# Changelog` con una frase que declara el formato seguido y el esquema de versionado del proyecto.
- `## [Unreleased]` como primera sección: la zona de preparación donde se acumulan los cambios no liberados.
- Una sección `## [X.Y.Z] - YYYY-MM-DD` por versión liberada, la más reciente primero.
- Enlaces de referencia al final —`[Unreleased]: <url comparativa>`, `[X.Y.Z]: <url comparativa>`— cuando el repositorio está alojado en un host que soporta diffs comparativos; si no, se omiten.

Dentro de cada sección, las entradas se agrupan en las seis categorías fijas, que aparecen como encabezados `###` y solo cuando tienen entradas:

- `Added` — funcionalidad nueva.
- `Changed` — cambio en funcionalidad existente.
- `Deprecated` — funcionalidad marcada para retirada.
- `Removed` — funcionalidad retirada.
- `Fixed` — corrección de errores.
- `Security` — corrección de vulnerabilidades.

Las categorías no crecen a propósito: el tipo de cambio va en la categoría y el porqué importa va en la redacción de la línea.

## Plantilla de inicialización

Cuando el proyecto evaluado no tiene changelog y hay un cambio que registrar, se crea `CHANGELOG.md` en su raíz con esta forma. El preámbulo se redacta en el idioma del proyecto; el texto de la plantilla es orientativo:

```markdown
# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/en/2.0.0/)
y el proyecto se adhiere a [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

## Criterios de notabilidad

Un cambio merece entrada cuando tiene impacto observable para el consumidor del producto:

- **Entran:** funcionalidad nueva, cambio de comportamiento, deprecación, retirada de funcionalidad, corrección de errores y corrección de vulnerabilidades. También refactorings, cambios de entornos soportados y documentación nueva cuando tienen efecto para el consumidor.
- **Quedan fuera:** trabajo de proceso interno, dotfiles, dependencias de desarrollo, cambios de estilo o formato de código, y cambios que se anulan entre sí dentro del mismo periodo no liberado.

Los cambios incompatibles con la interfaz pública —API, CLI, formato de archivo o configuración, según lo que el proyecto declare— se marcan en línea con el prefijo `**Breaking:**` dentro de su categoría, no en una sección aparte.

## Política de agregación

La unidad de entrada es el cambio notable para el usuario, no la tarea que lo produjo. Para decidir dónde escribe el cambio:

1. Si la tarea pertenece a una agrupación —épica, propuesta o encabezado ligero del índice de tareas— y esa agrupación ya tiene entrada en los no liberados, el cambio se fusiona en ella: se reformula la línea si la nueva contribución la amplía, o no se escribe nada si ya está cubierta.
2. Si la agrupación no tiene entrada todavía y el conjunto es notable como unidad, se crea la entrada de la agrupación, que las tareas siguientes del conjunto irán absorbiendo.
3. Solo una tarea suelta y notable —sin agrupación, o en una agrupación que no es notable como unidad— genera entrada propia.

El enlace de la entrada apunta al artefacto de la agrupación —el documento de épica o propuesta— cuando existe, y a la tarea cuando no hay agrupación. El enlace va entre paréntesis al final de la línea.

## Redacción de entradas

- Una línea por entrada, autodescriptiva: el lector entiende qué cambió sin abrir la referencia.
- Voz consistente con las entradas existentes e idioma del changelog tal como esté.
- Las explicaciones largas —motivación, migración, detalle— viven en la referencia enlazada, no en la entrada.
- Una entrada por cambio: un cambio repartido en varias tareas se lista una sola vez.

## Correspondencia con semver

La clasificación en categorías hace derivable el bump de versión, que el proceso de liberación calcula en su momento:

- `Removed` y entradas con `**Breaking:**` → major.
- `Added`, `Deprecated` y `Changed` compatible → minor.
- `Fixed` y `Security` → patch, salvo que sean incompatibles.

Cuando conviven varios tipos, la señal más fuerte presente manda. La responsabilidad de este skill es clasificar con precisión y marcar las rupturas; calcular y aplicar el bump corresponde al skill de liberación.
