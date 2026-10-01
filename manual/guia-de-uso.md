# Guía de uso

Cómo instalar un paquete Teleprompter en un repositorio, paso a paso.

## Requisitos

- Node.js 22 o superior.
- Un paquete: un repositorio público de GitHub o un directorio con un
  manifiesto `teleprompter.json` en su raíz. Este repositorio incluye
  uno de referencia en `packages/ciclo-tareas/`.
- El directorio del repositorio destino donde se instalarán los
  recursos —por defecto, el directorio de trabajo.

## Instalar un paquete

Desde la raíz del repositorio destino —o dando su ruta como segundo
argumento—:

```sh
npx @nucleoabierto/teleprompter nucleoabierto/ciclo-tareas .
```

`user/repo` descarga el tarball público del repositorio de GitHub y
usa su raíz como paquete —el `name` del manifiesto debe coincidir con
el nombre del repositorio, como exige la especificación—;
`user/repo@v1.0.0` o `--ref v1.0.0` eligen
la referencia (rama, tag o commit), y sin indicación se usa la rama
por defecto. Para un paquete en disco se usa `--path`:

```sh
npx @nucleoabierto/teleprompter --path /ruta/al/paquete .
```

El instalador trabaja en cuatro fases: verificación, plan, ejecución y
registro. Las dos primeras no escriben nada.

1. **Verificación.** Lee y valida el manifiesto del paquete y comprueba
   sus precondiciones sobre el destino. Si algo falla, la operación
   aborta antes de tocar el disco. Si todo va bien, verás:

```text
obteniendo: nucleoabierto/ciclo-tareas
verificado: ciclo-tareas@1.0.0
```

2. **Plan.** Se calculan todas las acciones antes de escribir y se
   muestran recurso a recurso con una marca por línea (`create`,
   `identical`, `conflict`, `managed-update`):

```text
plan de instalación:
 mkdir          .agents/skills/
 create         .agents/skills/crear-tareas/
 create         .agents/skills/ejecutar-tareas/
 create         .agents/skills/commit/
```

3. **Ejecución.** Si el plan no tiene colisiones, se ejecuta tal como se
   presentó. Si las hay, se resuelven antes de escribir: en una consola
   interactiva el instalador pregunta por cada recurso en conflicto;
   en una ejecución no interactiva la operación aborta. `--force` y
   `--skip` resuelven todas las colisiones por adelantado (véase la
   [referencia](referencia-install.md#colisiones)).

4. **Registro.** Terminada la ejecución se escribe
   `teleprompter-lock.json` en la raíz del destino y se informa del
   resultado:

```text
resultado:
 mkdir          .agents/skills/
 create         .agents/skills/crear-tareas/
 create         .agents/skills/ejecutar-tareas/
 create         .agents/skills/commit/
personalización (.teleprompter/ciclo-tareas/PERSONALIZE.md):
# Personalización de ciclo-tareas
…
instalado: ciclo-tareas@1.0.0
```

   El archivo de registro está pensado para versionarse con el
   repositorio: es lo que permite a Teleprompter distinguir lo que él
   instaló de lo que ya existía.

   Si el paquete declara instrucciones de personalización, su
   contenido se entrega tal cual al final del resultado —el bloque
   `personalización` anterior— y queda copiado en
   `.teleprompter/<paquete>/` dentro del destino.

## Consultar la guía de personalización

Las instrucciones que la instalación entregó se releen después con
`guide`, ejecutado desde la raíz del repositorio destino:

```sh
npx @nucleoabierto/teleprompter guide
npx @nucleoabierto/teleprompter guide ciclo-tareas   # solo ese paquete
```

Muestra el mismo contenido del archivo materializado —no reinstala ni
descarga nada—. Véase la [referencia de `guide`](referencia-guide.md).

## Listar los paquetes instalados

Desde la raíz del repositorio destino, `list` muestra qué paquetes
instaló Teleprompter —nombre, versión, fecha y recursos escritos—
leyendo el registro:

```sh
npx @nucleoabierto/teleprompter list
```

Véase la [referencia de `list`](referencia-list.md).

## Verificar el estado de los recursos instalados

Desde la raíz del repositorio destino, `check` confronta el registro
con el disco y muestra por cada recurso instalado si sigue `intacto`,
fue `modificado`, está `ausente` o es `no verificable`:

```sh
npx @nucleoabierto/teleprompter check
```

Véase la [referencia de `check`](referencia-check.md).

## Actualizar un paquete

Desde la raíz del repositorio destino, `update` lleva un paquete
instalado a la versión que publica su origen —el registrado al
instalarlo, salvo que se indique otro—:

```sh
npx @nucleoabierto/teleprompter update ciclo-tareas
npx @nucleoabierto/teleprompter update ciclo-tareas --ref v2.0.0
npx @nucleoabierto/teleprompter update ciclo-tareas otra/repo@main
```

El plan de actualización decide recurso a recurso: lo intacto que la
versión cambió se sobrescribe (`update`), lo nuevo se crea, lo que la
versión ya no trae se retira si sigue intacto (`retire`), y las
ediciones locales se resuelven como las colisiones de `install` —
interactiva, `--force`, `--skip` o aborto sin consola—. Si la versión
ya es la registrada, responde que ya está en esa versión.

Véase la [referencia de `update`](referencia-update.md).

## Inspeccionar sin instalar

`--dry-run` ejecuta solo la verificación y el plan, y termina sin
escribir ni registrar nada:

```sh
npx @nucleoabierto/teleprompter nucleoabierto/ciclo-tareas . --dry-run
```

Es la forma de ver qué haría una instalación —incluidas las colisiones
que habría que resolver— antes de decidir.

## Reinstalar

Reinstalar un paquete ya instalado es una operación válida e inocua:
los recursos que siguen idénticos se marcan `identical` y no se
escriben; los que difieren en contenido se actualizan
(`managed-update`) solo si el paquete ofrece una versión igual o
posterior a la registrada y el destino sigue conteniendo lo que la
instalación anterior escribió. Si un recurso instalado se modificó a
mano, se trata como colisión y pide resolución.
