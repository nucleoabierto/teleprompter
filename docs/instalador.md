# El instalador de Teleprompter

Define el comportamiento del instalador: la herramienta que lleva un
paquete conforme a `docs/formato-paquete.md` a un repositorio con
trabajo previo. Es la definición interna del comportamiento: deriva de
la investigación de motores de instalación
(`docs/research/2026-09-motores-instalacion.md`, citada como «rec. N»)
y sirve de contrato para las tareas de implementación. Cada
comportamiento lleva su razón de ser entre paréntesis.

## El origen del paquete

El paquete puede venir de un repositorio público de GitHub o de un
directorio local:

```sh
teleprompter <user/repo[@ref]> [destino]     # origen remoto
teleprompter --path <paquete> [destino]      # origen local
teleprompter install …                       # alias de ambas formas
teleprompter guide [<paquete>]               # consulta la guía instalada
teleprompter list                            # lista los paquetes instalados
teleprompter check                           # verifica el estado de los recursos instalados
teleprompter update <paquete> [<origen>]     # actualiza un paquete instalado
```

- `user/repo` descarga el tarball público del repositorio por HTTP
  —sin git ni credenciales— desde `codeload.github.com`, con el
  endpoint `tarball` de la API como alternativa, y lo extrae en un
  directorio temporal que se elimina al terminar, también en caso de
  error y en `--dry-run`. El paquete es la raíz del árbol extraído.
- La referencia se elige con `@ref` en el argumento o con `--ref`
  (declarar ambas es un error de invocación); sin indicación se
  descarga la rama por defecto del repositorio.
- `--path` toma un directorio local como origen y el argumento
  posicional `user/repo` no se procesa.
- `destino` es el segundo parámetro posicional; omitido, es el
  directorio de trabajo.

La obtención sucede antes de la verificación: un repositorio
inaccesible, una referencia inexistente o un archivo corrupto abortan
con el código `5` sin tocar el destino.

## La operación

Instalar es ejecutar cuatro fases en orden —verificación, plan,
ejecución y registro— sobre dos entradas: el directorio del paquete
ya resuelto —descargado o local— y la raíz del repositorio destino
(rec. 1 y 2).

1. **Verificación.** Se lee el `teleprompter.json` del paquete y se
   valida contra la especificación; un manifiesto inválido aborta la
   operación. Después se comprueban las precondiciones `requires` sobre
   el destino: cada entrada `paths` cuya ruta no existe y no declara
   `create: true` aborta la operación; las que declaran
   `create: true` se anotan como acciones de creación en el plan
   (rec. 1).
2. **Plan.** Se calcula el conjunto completo de acciones —crear rutas
   de precondición, instalar cada entrada de `install`, detectar
   colisiones— y se presenta al usuario antes de escribir nada (rec. 1
   y 2). Un plan no ejecutable —precondición incumplida o colisión sin
   resolver— aborta la operación entera: nada se escribe, ni recursos
   ni registro.
3. **Ejecución.** Solo se ejecuta un plan válido, en el orden
   presentado. Cada acción aplica la política de colisiones declarada
   (véase «Colisiones»).
4. **Registro.** Terminada la ejecución, se escribe el registro de
   instalación en el destino (véase «El registro»). El registro es
   parte de la operación, no un efecto secundario opcional (rec. 5).

Las fases de verificación y plan son consultables por separado: la
herramienta ofrece un modo de solo-plan que produce la misma salida sin
ejecutar ni registrar —el equivalente a `--dry-run`— (rec. 2). El plan
es salida legible; materializarlo como archivo ejecutable queda como
extensión futura (modelo `terraform plan -out`, `rcup -g`), no como
requisito (rec. 2).

## El plan

El plan se informa recurso a recurso con una marca de estado por
línea, antes de cualquier escritura (rec. 6):

- `create` — el destino no existe; se instalará el recurso.
- `identical` — el destino existe y es idéntico al recurso del
  paquete; no hay nada que hacer. Reinstalar un paquete ya instalado
  es una operación válida e inocua (rec. 6).
- `conflict` — el destino existe con contenido distinto y no está
  registrado como instalado por Teleprompter. Junto a la marca se
  indica la resolución que aplicará la política vigente.
- `managed-update` — el destino existe con contenido distinto, pero el
  registro lo reconoce como instalado por Teleprompter: el contenido
  previo coincide con el hash anotado y el paquete ofrece ahora una
  versión igual o posterior del recurso. La sobrescritura es segura
  porque el recurso es propio (rec. 5).

Un destino registrado como instalado pero modificado localmente desde
entonces —el contenido actual no coincide con lo que el registro
anotó— se trata como `conflict`, no como `managed-update`: la
modificación local es trabajo ajeno a la herramienta y merece la misma
protección (precedente: chezmoi pregunta cuando el destino cambió
desde su última escritura; rec. 3).

Las marcas del plan no son acciones del registro: la ejecución traduce
`create` a `create`, `conflict` y `managed-update` a `overwrite`,
`identical` a ninguna escritura, y `skip` —resolución, no marca— a
`skip`.

## Colisiones

Una **colisión** es una entrada de `install` cuyo `target` existe en
el destino con contenido distinto y no está registrado como instalado
por Teleprompter —o lo está, pero fue modificado después— (rec. 3 y 5,
con la noción de propiedad de Stow y dpkg).

La primera respuesta a una colisión es la **resolución interactiva**:
en una consola interactiva, el instalador presenta el plan con sus
conflictos y pregunta por cada recurso en conflicto si se instala
sobrescribiendo el destino o se omite (precedentes: copier pregunta
por archivo con «Overwrite? [Y/n]» y chezmoi cuando el destino cambió
desde su última escritura; rec. 4). En una invocación no interactiva
no hay proceso de resolución posible: la operación lista todos los
conflictos del plan y aborta sin escribir nada (modelo Stow; rec. 3).

Dos opciones excluyentes resuelven todas las colisiones por
adelantado y evitan la interacción (rec. 4):

- `--force` — el recurso del paquete reemplaza al destino en cada
  colisión (precedente `--force-overwrite` de dpkg, documentado como
  excepcional).
- `--skip` — el recurso en conflicto no se instala; el resto del plan
  se ejecuta y la omisión queda en el registro.

Las dos opciones son mutuamente excluyentes: declarar ambas es un
error de invocación. `--force` es destructivo y nunca es el defecto;
`--skip` es la opción conservadora. El contenido no se fusiona: la
resolución decide por recurso completo (fuera de alcance, según la
propuesta).

## El registro

Cada instalación ejecutada escribe `teleprompter-lock.json` en la
raíz del destino: un archivo JSON pensado para versionarse con el
repositorio (rec. 5, siguiendo el precedente de `skills-lock.json`).

La raíz del registro es un objeto con una clave `packages`, un objeto
indexado por el `name` de cada paquete instalado —varios paquetes
pueden coexistir en el mismo destino—:

```json
{
  "packages": {
    "ciclo-tareas": {
      "version": "1.0.0",
      "installedAt": "2026-09-28T10:00:00Z",
      "files": [
        { "target": ".agents/skills/ejecutar-tareas/SKILL.md",
          "action": "create",
          "sha256": "…" }
      ],
      "origin": { "type": "github", "repo": "nucleoabierto/ciclo-tareas" }
    }
  }
}
```

Cada entrada de paquete contiene:

- `version` del manifiesto instalado.
- `installedAt` — instante de la instalación.
- `files` — una entrada por recurso instalado: su `target`, la acción
  realizada (`create`, `overwrite`, `skip`), y el hash SHA-256 del
  contenido escrito. Las entradas `skip` registran la decisión sin
  hash.
- `origin` — de dónde vino la instalación, para que una operación
  posterior pueda reobtener el paquete sin pedir el origen de nuevo:
  `{ "type": "github", "repo": "owner/name", "ref": "…" }` para un
  origen remoto —`ref` solo cuando el usuario la indicó; ausente es
  la rama por defecto en el momento de la obtención— o
  `{ "type": "path", "path": "/abs" }` para un origen local, en forma
  absoluta. Las entradas escritas antes de este campo carecen de él:
  su origen es desconocido.

El registro es la base de propiedad del sistema: permite distinguir lo
instalado por la herramienta de lo preexistente (habilita
`managed-update` y la detección de colisiones precisa) y hace la
operación repetible y auditable (rec. 5). La actualización y la
desinstalación están fuera de alcance, pero el registro está diseñado
para sostenerlas: saber qué es propio y en qué versión quedó es su
precondición (precedentes: estado de Terraform, base de dpkg,
`.copier-answers.yml`, manifest de lash).

## La consulta de la guía

`teleprompter guide [<paquete>]` —ejecutado dentro del repositorio
destino, sin argumento de destino— relee lo que el registro anotó:
muestra el contenido de cada guía registrada en `personalization`,
o solo la del paquete indicado, con el mismo bloque que la entrega
de la instalación. Que no haya guía que mostrar —paquete no
instalado, paquete sin declaración o ningún paquete con guía— es un
error de invocación; la ruta registrada insegura —`..` o enlaces que
salen del destino— o el archivo ausente o ilegible es un error de
ejecución.

## La consulta del registro

`teleprompter list` —ejecutado dentro del repositorio destino, sin
argumentos ni opciones— traduce el registro a lenguaje de producto:
una entrada por paquete instalado con su `nombre@version`, el
instante `installedAt` de la instalación y una línea por recurso que
la herramienta escribió —las entradas `skip` registran una omisión,
no un recurso, y no se listan—. Un paquete con guía de
personalización la señala con la invocación `guide` que la consulta.
No se exponen hashes ni acciones internas: la respuesta a «qué
tengo instalado» no exige conocer el formato del lock.

Sin instalaciones registradas —lock ausente, vacío o ilegible— la
consulta responde «no hay paquetes instalados» con código `0`: es
una respuesta, no un fallo; un registro corrupto añade el mismo
aviso que el resto de lecturas del lock.

## La verificación del estado

`teleprompter check` —ejecutado dentro del repositorio destino, sin
argumentos ni opciones— confronta el registro con el disco: por cada
paquete instalado muestra `nombre@version` y una línea por recurso
registrado con su marca de deriva:

- `intacto` — el contenido actual coincide con el hash registrado.
- `modificado` — el recurso existe pero difiere de lo anotado.
- `ausente` — la ruta registrada ya no existe.
- `no verificable` — la entrada no guardó `sha256` con el que
  comparar, el recurso no se puede leer, o la ruta registrada no es
  segura —un `..` o un enlace en su cadena de padres que sale del
  destino—: el registro es dato versionado y se revalida antes de
  leer, como en `guide`.

Las entradas `skip` no se verifican: registran una omisión, no un
recurso escrito. El informe es lenguaje de producto —no expone
hashes ni acciones internas— y la deriva es información, no un
fallo: la consulta termina con código `0` haya o no deriva. Sin
instalaciones responde «no hay paquetes instalados», y un registro
corrupto añade el mismo aviso que el resto de lecturas del lock.

## El plan de actualización

Actualizar un paquete registrado con una versión distinta calcula un
plan propio —completo antes de escribir, como el de instalación
(D005)— que clasifica cada recurso por lo que la versión nueva trae y
lo que el usuario hizo con lo instalado. La versión entrante igual a
la registrada no produce plan: el paquete ya está en esa versión.

- `create` — el destino no existe: recurso nuevo en la versión, o
  registrado y borrado del destino —se vuelve a escribir en ambos
  casos—.
- `identical` — el destino ya contiene el contenido entrante.
- `update` — la versión cambió el recurso (el contenido entrante
  difiere del hash registrado) y el destino sigue intacto; la
  sobrescritura es segura. Exige versión entrante ≥ registrada: un
  downgrade degrada a `conflict` como en la instalación.
- `conflict` — ninguna otra marca aplica: el destino difiere del
  registrado —edición local o contenido ajeno—, o el destino sigue
  intacto pero la versión entrante no puede gestionar la
  sobrescritura —un downgrade—; requiere la misma decisión que una
  colisión (`overwrite`/`skip`, D006).
- `retire` — registrado en el lock pero ausente del manifiesto
  entrante e intacto: la versión lo retira y el plan lo elimina.

Los retirados siguen la política de propiedad (D015): intacto se
elimina automáticamente —lo propio y sin tocar se gestiona—;
modificado o no verificable degrada a `conflict` marcado como
eliminación, donde `overwrite` significa quitar y `skip` conservar;
ya ausente del disco desaparece del plan sin marca. Las entradas
`skip` nunca se retiran —no se escribieron— ni el target de
`personalization` mientras el manifiesto la siga declarando —la guía
gestionada se reescribe en cada instalación—. Cuando la versión
nueva declara otra guía, la registrada se retira incluso modificada:
deja de ser la guía del paquete y conservarla dejaría un archivo
que `guide` no puede mostrar; cuando la versión nueva abandona la
guía por completo, la anterior entra en los retirados como cualquier
recurso propio y su deriva se decide con `remove`/`keep`.

## La actualización

`teleprompter update <paquete>` —ejecutado dentro del repositorio
destino, como las consultas— lleva un paquete instalado a la versión
que publica su origen. El paquete se nombra por el `name` del
registro; no estar instalado es un error de invocación. El origen se
resuelve en este orden (D016):

1. Un origen explícito de la invocación —un posicional
   `user/repo[@ref]` o `--path <dir>`— sobrescribe el registrado y
   queda como `origin` en el registro, como toda instalación.
2. El `origin` registrado (D014): `github` reobtiene `repo` con su
   `ref` grabado —o la rama por defecto si no lo hay—; `path` usa el
   directorio registrado. `--ref` sobrescribe el ref de un origen
   github; con un origen `path` es un error de invocación.
3. Sin origen registrado ni explícito, la operación termina con un
   error de invocación que pide indicarlo.

Obtenido el origen, el flujo replica el de la instalación:
verificación, plan de actualización, resolución, ejecución y
registro. Si el manifiesto obtenido declara un `name` distinto del
paquete pedido, la operación es un error de invocación —el origen no
publica ese paquete—. Si la versión entrante es la registrada, la
respuesta es «ya está en esa versión» con código `0` sin escribir
nada.

Los `conflict` del plan se resuelven con la misma política que las
colisiones (D006): interactiva en consola, `--force`/`--skip`
excluyentes, aborto sin consola. La diferencia es la pregunta: un
conflicto marcado `removal` —un retirado con deriva— pregunta por
quitar, y su resolución se traduce a `remove`/`keep` en lugar de
`overwrite`/`skip`. Las acciones `remove` borran el recurso con la
misma guarda de rutas que toda escritura; `keep` conserva el
registro previo —el recurso sigue en disco con lo que el lock
anotó—. El registro post-actualización refleja la versión nueva, el
origen efectivo y exactamente los recursos que quedaron escritos.

## Resultado y errores

La ejecución informa el resultado con las mismas marcas del plan más
`skip` y `overwrite` según lo realizado. Si el manifiesto declara
`personalization`, el instalador copia el archivo de instrucciones a
`.teleprompter/<paquete>/<archivo>` —espacio gestionado, reservado
también a los `target` de `install` y a las rutas de `requires`—,
registra su ubicación en `teleprompter-lock.json` y entrega su
contenido tal cual al final del resultado, bajo el encabezado
`personalización (<ruta>):` —lo que se lee es la copia materializada
en el destino, no el fuente del paquete (modelo «caveats» de
Homebrew; véase `docs/research/2026-09-guia-postinstalacion.md`)—.
Un paquete sin guía no añade salida; `--dry-run` y los abortos no la
alcanzan.

Los códigos de salida son:

- `0` — éxito.
- `1` — manifiesto inválido.
- `2` — plan no ejecutable: precondiciones incumplidas o colisiones
  sin resolver.
- `3` — error de ejecución.
- `4` — error de invocación: argumentos ausentes o rutas que no
  existen.
- `5` — error de obtención: el repositorio remoto es inaccesible, la
  referencia no existe o el archivo descargado no se pudo extraer.

## Distribución

El instalador es un programa JavaScript distribuido como el paquete
npm `@nucleoabierto/teleprompter`, ejecutable sin instalación con
`npx @nucleoabierto/teleprompter` —el mismo patrón de invocación que
`npx skills add`— (decisión D008).
