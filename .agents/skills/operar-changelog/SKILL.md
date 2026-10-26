---
name: operar-changelog
description: >
  Ejecuta las operaciones mecánicas del changelog del proyecto (localizar
  el archivo, volcar y buscar en los no liberados, anotar entradas por
  categoría, reportar el estado, proponer el bump semver, promover los no
  liberados a una versión y marcar versiones retiradas), para que los
  consumidores deleguen la acción en lugar de re-describir el artefacto.
  Usar cuando un trabajo necesite leer o mutar el changelog con una
  operación del catálogo.
  Sinónimos: operar changelog, anotar entrada en el changelog, promover
  no liberados, bump semver, marcar versión retirada.
---

# Operar changelog

Instrucciones para que un agente ejecute las operaciones mecánicas del changelog del proyecto. El skill recibe la acción delegada del consumidor (qué hacer sobre el changelog, sin nombrar el artefacto ni su formato) y la resuelve aplicando el documento de reglas `references/changelog.md`, que declara la ubicación convencional del archivo, su formato y cada operación: el agente opera el changelog directamente con las herramientas habituales.

## Cuándo usar

- Cuando un skill necesite leer o mutar el changelog (localizarlo, volcar o buscar en los no liberados, anotar una entrada, conocer el estado del registro, obtener la propuesta de bump, promover una versión o marcar una retirada) y la acción sea una operación del catálogo.

## Cuándo no usar

- Para lecturas simples que el arnés resuelve directamente (`read`, `grep`, `git`): no se delegan.
- Para acciones con juicio (decidir la notabilidad de un cambio, elegir la categoría, redactar la entrada, curar los no liberados, confirmar el número de versión): pertenecen al consumidor o al usuario.
- Para operaciones sobre otros artefactos del sistema: el índice de tareas, los archivos de tarea, las ideas y las series corresponden a `consultar-artefactos` y `actualizar-artefactos`; el registro de experiencias, a `operar-experiencias`.

## Entrada

- La acción delegada del consumidor: la operación del catálogo y sus términos, más el contenido cuando la operación lo requiere (las líneas de entrada en `anotar`, el cuerpo curado en `promover`). El consumidor no nombra el artefacto ni pasa su ruta.

## Salida

- El resultado de la operación, en la forma que cada operación declara. El changelog ausente es un fallo con diagnóstico en las lecturas (excepto `localizar`, que informa de la ausencia con vacío legítimo) y una creación en `anotar`.

## Principios rectores

1. **Mecánica, nunca síntesis:** las operaciones devuelven lo que el changelog contiene o materializan el contenido dado; la notabilidad, la categoría, la redacción, la curación y el número de versión los decide siempre el consumidor o el usuario.
2. **La acción es semántica:** el consumidor delega qué hacer sobre el changelog («los no liberados», «anotar esta entrada», «promover a esta versión») sin nombrar el artefacto, su ubicación ni su formato; esos detalles los resuelve este skill.
3. **Escritura canónica, lectura tolerante:** las operaciones escriben la forma fija (las seis categorías en su orden canónico, `## [X.Y.Z] - fecha` al promover) y toleran el archivo real al leer: changelog con otro nombre, sin sección de no liberados, sin enlaces de pie.
4. **Contrato único:** las operaciones devuelven datos parseables, reportan el vacío legítimo como tal y fallan con diagnóstico y sin escribir cuando no pueden ejecutarse (D035): una entrada mal formada, una categoría desconocida o una versión duplicada rechazan la mutación sin tocar el archivo. El «nada que liberar» (sección de no liberados ausente o vacía donde la operación la exige) se distingue siempre del resto de fallos.

## Procedimiento

1. **Recibir la acción delegada** del consumidor: la operación y sus términos.
2. **Resolver y operar:** el documento de reglas `references/changelog.md` declara la ubicación convencional del archivo y las reglas de cada operación (incluida la lectura tolerante del archivo real), y el agente opera el archivo directamente siguiéndolo; el contenido de `anotar` y `promover` lo da el consumidor.
3. **Transmitir el resultado:** el dato tal como las reglas lo producen; un fallo se comunica con su diagnóstico, sin reinterpretarlo.

## Acciones

El consumidor delega la acción de dominio; el gestor resuelve la ubicación del changelog desde su documento de reglas y la traduce a la operación del catálogo.

- «localizar el changelog del proyecto»: `localizar` sobre la raíz del proyecto.
- «los no liberados»: `volcar`.
- «las entradas de los no liberados que mencionan `<término>`»: `buscar` (la referencia a la agrupación identifica su entrada).
- «anotar esta entrada en la categoría `<categoría>`»: `anotar` con las líneas de entrada dadas por el consumidor.
- «el estado del changelog»: `estado`.
- «la propuesta de bump»: `bump`.
- «promover los no liberados a la versión `<X.Y.Z>`»: `promover` con el cuerpo curado dado por el consumidor.
- «marcar la versión `<X.Y.Z>` retirada»: `yank`.

## Catálogo de operaciones

Cada operación se resuelve aplicando la sección de su nombre en `references/changelog.md`, el documento de reglas del artefacto (el agente opera el archivo directamente con las herramientas habituales, sin scripts). Una operación sin resultados devuelve el vacío legítimo; una que no puede ejecutarse es fallo con diagnóstico, y el «nada que liberar» se distingue siempre del resto de fallos.

### `references/changelog.md`: el changelog (`CHANGELOG.md`)

- `localizar`
- `volcar`
- `buscar <término>`
- `anotar <categoría>`
- `estado`
- `bump`
- `promover <X.Y.Z>`
- `yank <X.Y.Z>`

## Finalización

El skill ha terminado cuando el consumidor recibió el resultado de la operación (o el diagnóstico si falló) tal como las reglas lo produjeron, y el changelog quedó mutado según la acción.

## Referencias

- `references/changelog.md`: el documento de reglas del changelog: formato, lectura tolerante, escritura canónica y la definición completa de cada operación.
- `docs/decisions/D035-reglas-declarativas-por-artefacto.md`: el mecanismo de delegación que estas operaciones cumplen.
- `PERSONALIZE.md` del paquete: los artefactos de estado que la instalación prepara y verifica.
