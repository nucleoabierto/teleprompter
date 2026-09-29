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
      ]
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

El registro es la base de propiedad del sistema: permite distinguir lo
instalado por la herramienta de lo preexistente (habilita
`managed-update` y la detección de colisiones precisa) y hace la
operación repetible y auditable (rec. 5). La actualización y la
desinstalación están fuera de alcance, pero el registro está diseñado
para sostenerlas: saber qué es propio y en qué versión quedó es su
precondición (precedentes: estado de Terraform, base de dpkg,
`.copier-answers.yml`, manifest de lash).

## Resultado y errores

La ejecución informa el resultado con las mismas marcas del plan más
`skip` y `overwrite` según lo realizado. Si el manifiesto declara
`personalization`, la salida final informa de la ubicación de las
instrucciones —la instalación las entrega y presenta, sin decidir su
contenido (propuesta 002)—.

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
