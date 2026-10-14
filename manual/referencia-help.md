# Referencia de `help`

```text
teleprompter help [<comando>]
teleprompter [<comando>] --help
```

Muestra la ayuda del CLI por stdout y termina con código `0` —es una
consulta, no un error de invocación.

## Formas

- `teleprompter help` — la ayuda general: qué hace la herramienta,
  una línea por comando con su sinopsis, las opciones y ejemplos.
- `teleprompter --help` — equivalente a `help` sin argumento.
- `teleprompter <comando> --help` — la ayuda del comando invocado:
  `install`, `guide`, `list`, `check`, `update` o el propio `help`.
  En la forma corta de instalación —`teleprompter user/repo --help`—
  el comando implícito es `install`.
- `teleprompter help <comando>` — la misma ayuda del comando, pedida
  por nombre.

`help` es un comando propio reservado en primera posición —un
repositorio llamado `help` se instala vía el alias `install`.

## Errores

- `help` con un nombre que no es un comando conocido, o con más de
  un argumento, es error de invocación: código `4` y la ayuda
  general por stderr —la misma salida que produce cualquier
  invocación inválida.
