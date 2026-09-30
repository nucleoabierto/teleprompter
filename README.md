# Teleprompter

Instalador de paquetes de configuración para repositorios.

Teleprompter lleva un paquete —un directorio con un manifiesto
`teleprompter.json` y recursos como skills o archivos de configuración—
a un repositorio con trabajo previo. Calcula el plan completo antes de
escribir nada, resuelve las colisiones con lo que ya existe y deja un
registro auditable de la instalación en `teleprompter-lock.json`.

## Requisitos

- Node.js 22 o superior.

## Instalación

No hace falta instalar nada: el CLI se ejecuta directamente con `npx`:

```sh
npx @nucleoabierto/teleprompter user/repo
```

También puede instalarse como herramienta global:

```sh
npm install -g @nucleoabierto/teleprompter
teleprompter user/repo
```

## Uso

El primer argumento es el origen del paquete. `user/repo` descarga el
tarball público del repositorio de GitHub —sin git ni credenciales—
y usa la raíz del árbol como paquete; la referencia se elige con
`user/repo@ref` o `--ref <ref>` (la rama por defecto si no se indica).
Para un paquete local se usa `--path <directorio>`, que no procesa el
argumento `user/repo`. El segundo argumento posicional es el destino
de la copia —la raíz del repositorio donde instalar— y por defecto es
el directorio de trabajo:

```sh
teleprompter nucleoabierto/mi-paquete          # remoto, destino: pwd
teleprompter nucleoabierto/mi-paquete ./destino
teleprompter nucleoabierto/mi-paquete@v1.2.0 ./destino
teleprompter --path ./mi-paquete ./destino     # local
teleprompter install nucleoabierto/mi-paquete  # alias
```

Antes de escribir nada, el instalador verifica el manifiesto y
las precondiciones del paquete, calcula el plan completo y lo presenta
recurso a recurso:

```text
$ teleprompter nucleoabierto/mi-paquete ./mi-repo
obteniendo: nucleoabierto/mi-paquete
verificado: mi-paquete@1.0.0
plan de instalación:
  mkdir          .agents/skills/
  create         .agents/skills/mi-skill/SKILL.md
  identical      .agents/skills/otro-skill/SKILL.md
  conflict       .agents/config.json
```

El plan muestra `mkdir` para las rutas de precondición a crear y una
marca por recurso: `create`, `identical`, `conflict` o `managed-update`
(el destino contiene lo que una instalación anterior registró y el
paquete ofrece una versión igual o posterior). Cuando hay
colisiones —el destino existe con contenido distinto y no consta como
instalado por Teleprompter, o fue modificado desde la instalación— una
consola interactiva pregunta por cada
recurso; sin ella, la operación aborta sin escribir nada. Dos opciones
mutuamente excluyentes resuelven las colisiones por adelantado:

| Opción    | Efecto                                               |
|-----------|------------------------------------------------------|
| `--force` | El recurso del paquete sobrescribe cada colisión     |
| `--skip`  | Cada colisión se omite y la omisión queda registrada |

Independiente de ellas, `--dry-run` muestra el plan y termina sin
escribir nada.

Terminada la ejecución se escribe `teleprompter-lock.json` en la raíz
del destino: qué recursos instaló Teleprompter, con qué acción y con
qué hash. Si el paquete declara instrucciones de personalización, su
contenido se entrega tal cual al final del resultado y queda
consultable después —desde la raíz del destino— con
`teleprompter guide [<paquete>]`. El propio registro se consulta con
`teleprompter list`, que muestra una entrada por paquete instalado:
nombre, versión, fecha de instalación y recursos escritos.

### Códigos de salida

| Código | Significado                                          |
|--------|------------------------------------------------------|
| `0`    | Éxito                                                |
| `1`    | Manifiesto inválido                                  |
| `2`    | Plan no ejecutable (precondiciones o colisiones)     |
| `3`    | Error de ejecución                                   |
| `4`    | Error de invocación (argumentos o rutas)             |
| `5`    | Error de obtención del repositorio remoto            |

## Documentación

- [manual/](manual/README.md) — guía de uso y referencia completa de la
  operación `install`.
- [docs/especificacion-paquete.md](docs/especificacion-paquete.md) —
  cómo escribir el manifiesto `teleprompter.json` de un paquete propio.

## Licencia

[MIT](LICENSE).
