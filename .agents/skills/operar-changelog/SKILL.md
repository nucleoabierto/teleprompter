---
name: operar-changelog
description: >
  Ejecuta las operaciones mecánicas del changelog del proyecto —localizar
  el archivo, volcar y buscar en los no liberados, anotar entradas por
  categoría, reportar el estado, proponer el bump semver, promover los no
  liberados a una versión y marcar versiones retiradas—, para que los
  consumidores deleguen la acción en lugar de re-describir el artefacto.
  Usar cuando un trabajo necesite leer o mutar el changelog con una
  operación del catálogo.
  Sinónimos: operar changelog, anotar entrada en el changelog, promover
  no liberados, bump semver, marcar versión retirada.
---

# Operar changelog

Instrucciones para que un agente ejecute las operaciones mecánicas del changelog del proyecto. El skill recibe la acción delegada del consumidor —qué hacer sobre el changelog, sin nombrar el artefacto ni su formato—, resuelve su ubicación desde la configuración de la instalación y la ejecuta con el script bash propio de `assets/`.

## Cuándo usar

- Cuando un skill necesite leer o mutar el changelog —localizarlo, volcar o buscar en los no liberados, anotar una entrada, conocer el estado del registro, obtener la propuesta de bump, promover una versión o marcar una retirada— y la acción sea una operación del catálogo.

## Cuándo no usar

- Para lecturas simples que el arnés resuelve directamente (`read`, `grep`, `git`): no se delegan.
- Para acciones con juicio —decidir la notabilidad de un cambio, elegir la categoría, redactar la entrada, curar los no liberados, confirmar el número de versión—: pertenecen al consumidor o al usuario.
- Para operaciones sobre otros artefactos del sistema: el índice de tareas, los archivos de tarea, las ideas y las series corresponden a `consultar-artefactos` y `actualizar-artefactos`; el registro de experiencias, a `operar-experiencias`.

## Entrada

- La acción delegada del consumidor: la operación del catálogo y sus términos, más el contenido cuando la operación lo requiere —las líneas de entrada en `anotar`, el cuerpo curado en `promover`—. El consumidor no nombra el artefacto ni pasa su ruta.
- La ubicación del changelog, resuelta de `assets/convenciones.sh` —la clave `archivo_changelog`, escrita por el instalador según `PERSONALIZE.md`—.

## Salida

- El resultado de la operación por stdout, en la forma que cada operación declara. El changelog ausente es un error con diagnóstico en las lecturas —excepto `localizar`, que informa de la ausencia con salida vacía— y una creación en `anotar`.

## Principios rectores

1. **Mecánica, nunca síntesis:** las operaciones devuelven lo que el changelog contiene o materializan el contenido dado; la notabilidad, la categoría, la redacción, la curación y el número de versión los decide siempre el consumidor o el usuario.
2. **La acción es semántica:** el consumidor delega qué hacer sobre el changelog —«los no liberados», «anotar esta entrada», «promover a esta versión»— sin nombrar el artefacto, su ubicación ni su formato; esos detalles los resuelve este skill.
3. **Escritura canónica, lectura tolerante:** las operaciones escriben la forma fija —las seis categorías en su orden canónico, `## [X.Y.Z] - fecha` al promover— y toleran el archivo real al leer: changelog con otro nombre, sin sección de no liberados, sin enlaces de pie.
4. **Falla sin escribir:** una entrada mal formada, una categoría desconocida, una versión duplicada o unos no liberados vacíos rechazan la mutación sin tocar el archivo.
5. **Contrato único:** el script recibe la entrada por argumentos o `stdin`, reserva stdout a datos parseables y stderr a diagnósticos, devuelve `0` en éxito —incluido el vacío legítimo— y `2` cuando falta la entrada (D033); añade `3` para «sin no liberados», el «nada que liberar» distinguible.

## Procedimiento

1. **Recibir la acción delegada:** el consumidor indica la operación y sus términos.
2. **Resolver la ubicación del changelog:** el valor de `archivo_changelog` en `assets/convenciones.sh` da la ruta convencional; cuando no existe, la operación `localizar` busca el archivo por sus nombres alternativos. Un archivo de configuración malformado hace fallar el script con diagnóstico antes de tocar nada.
3. **Ejecutar el script** `assets/changelog.sh` con la ruta resuelta, la operación y los términos dados; el contenido de `anotar` y `promover` entra por `stdin`.
4. **Devolver la salida al consumidor:** stdout es el dato; un código de salida distinto de cero se transmite con su diagnóstico, sin reinterpretarlo.

## Acciones

El consumidor delega la acción de dominio; el gestor resuelve la ubicación del changelog desde `assets/convenciones.sh` y la traduce a la operación del catálogo.

- «localizar el changelog del proyecto»: `localizar` sobre la raíz —primero la ruta configurada, después las alternativas del formato—.
- «los no liberados»: `volcar`.
- «las entradas de los no liberados que mencionan `<término>`»: `buscar` —la referencia a la agrupación identifica su entrada—.
- «anotar esta entrada en la categoría `<categoría>`»: `anotar` con las líneas de entrada por `stdin`.
- «el estado del changelog»: `estado`.
- «la propuesta de bump»: `bump`.
- «promover los no liberados a la versión `<X.Y.Z>`»: `promover` con el cuerpo curado por `stdin`.
- «marcar la versión `<X.Y.Z>` retirada»: `yank`.

## Catálogo de operaciones

El script `assets/changelog.sh` se invoca como `changelog.sh <objetivo> <operación> [términos]`, donde `<objetivo>` es la ruta resuelta del changelog —en `localizar`, el directorio donde buscarlo—. Las categorías válidas son las seis fijas: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` y `Security`.

### `localizar`

Emite por stdout la ruta del changelog hallado bajo `<objetivo>` —`CHANGELOG.md` y sus alternativas (`CHANGELOG`, `CHANGELOG.txt`, `CHANGELOG.rst`, `HISTORY`, `NEWS` y otras formas comunes, incluidas las variantes en mayúsculas)—. Cuando no lo encuentra, salida vacía con exit `0`. Directorio ausente: exit `2`.

### `volcar`

Emite el cuerpo de la sección de no liberados tal como está escrito —sus `###` y entradas—. Sección vacía: salida vacía con exit `0`. Changelog ausente: exit `2`; sin sección de no liberados: exit `3` con diagnóstico.

### `buscar <término>`

Emite las líneas de entrada de los no liberados que contienen la subcadena `<término>` —la referencia al artefacto de una agrupación identifica su entrada—. Sin resultados, salida vacía con exit `0`. Mismos errores que `volcar`.

### `anotar <categoría>`

Lee las líneas de entrada de `stdin` y las añade al final de la `### <categoría>` de los no liberados; si la categoría falta, crea su `###` en la posición que le da el orden canónico. La categoría debe ser una de las seis fijas —otro valor es invocación inválida, exit `2`— y cada línea no vacía debe ser una viñeta `- `; un `stdin` vacío o con líneas de otra forma rechaza con exit `1` sin escribir. Si el changelog no existe, lo crea con su plantilla —sección de no liberados incluida—; si el archivo existe pero no tiene esa sección, la abre antes de la primera versión liberada.

### `estado`

Emite tres líneas parseables:

- `no-liberados: con-entradas|vacio|ausente` — vacío es sin entradas, aunque haya `###`
- `ultima-version: X.Y.Z|ninguna`
- `enlaces: presentes|ausentes` — presentes cuando el pie mantiene la línea `[Unreleased]:` de enlaces comparativos

Changelog ausente: exit `2`.

### `bump`

Emite el bump semver que proponen las categorías presentes en los no liberados —`major` ante `**Breaking:**` en línea o `Removed`; `minor` ante `Added`, `Changed` o `Deprecated`; `patch` ante `Fixed` o `Security`; `ninguno` si no hay categorías— más la lista de categorías presentes en orden canónico:

- `bump: major|minor|patch|ninguno`
- `categorias: <lista>|ninguna`

La propuesta es la señal fuerte bruta: la convención sobre versiones `0.x` y la interfaz pública del proyecto las interpreta el consumidor. Sin sección de no liberados: exit `3`.

### `promover <X.Y.Z>`

Promueve los no liberados a `## [X.Y.Z] - <fecha del día>`, abriendo una sección `## [Unreleased]` vacía encima. Lee el cuerpo curado de `stdin` —vacío, usa el contenido existente— y lo escribe bajo la nueva sección. Cuando el archivo tiene línea `[Unreleased]:` al pie, la actualiza para comparar la nueva versión con `HEAD` y añade `[X.Y.Z]:` —`compare` contra la versión anterior o `releases/tag` en la primera— derivando base y prefijo de etiqueta de la línea existente; si esa línea no encaja el patrón `compare/<prefijo>X.Y.Z...HEAD` el pie no se toca —avisa por stderr— y sin enlaces no los crea. La mutación es atómica: el archivo se escribe completo o no se toca. Versión mal formada: exit `2`; duplicada: exit `1`; sin no liberados o vacíos: exit `3` —el «nada que liberar» distinguible.

### `yank <X.Y.Z>`

Añade ` [YANKED]` al encabezado de la versión sin tocar nada más del archivo. Versión mal formada: exit `2`; inexistente: exit `1`; ya marcada: diagnóstico y exit `0` sin reescribir.

## Finalización

El skill ha terminado cuando el consumidor recibió el resultado de la operación —o el diagnóstico si falló— tal como el script lo produjo, y el changelog quedó mutado según la acción.

## Referencias

- `docs/decisions/D033-pasos-mecanicos-skills-utilidad-scripts.md` — el mecanismo de delegación y el contrato de los scripts que estas operaciones cumplen.
- `PERSONALIZE.md` del paquete — la configuración de la instalación que declara la ubicación del changelog.
