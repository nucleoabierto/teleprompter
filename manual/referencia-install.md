# Referencia de `install`

```text
teleprompter [install] <user/repo[@ref]> [destino] [--ref <ref>]
teleprompter [install] --path <paquete> [destino]

Opciones comunes: [--force|--skip] [--dry-run]
```

Instala un paquete en el repositorio cuya raíz es `destino` —por
defecto, el directorio de trabajo—. `install` es un alias opcional de
la forma corta.

## El origen

- `<user/repo>`: descarga el tarball público del repositorio de
  GitHub por HTTP —sin git ni credenciales—, lo extrae en un
  directorio temporal y usa la raíz del árbol como paquete. El
  temporal se elimina al terminar, también en error y en `--dry-run`.
  La referencia se elige con `@ref` o `--ref` —declarar ambas es un
  error de invocación—; sin indicación se descarga la rama por
  defecto. Un repositorio inaccesible o una referencia inexistente
  abortan con código `5`.
- `--path <paquete>`: usa el directorio local como origen y el
  argumento posicional `user/repo` no se procesa —de declararse, se
  interpreta como `destino`.

`destino` y el directorio de `--path` deben ser directorios
existentes.

## Fases

La operación ejecuta cuatro fases en orden:

1. **Verificación.** Valida el manifiesto `teleprompter.json` contra la
   [especificación](https://github.com/nucleoabierto/teleprompter/blob/master/docs/especificacion-paquete.md); un manifiesto
   inválido aborta con código `1`. Después comprueba las
   precondiciones `requires.paths` sobre el destino: cada ruta que no
   existe y no declara `create: true` aborta con código `2`; las que
   declaran `create: true` aparecen en el plan como acciones `mkdir`.
2. **Plan.** Calcula el conjunto completo de acciones y lo presenta
   antes de escribir nada. Un plan no ejecutable —precondición
   incumplida o colisión sin resolver— aborta la operación entera:
   ni recursos ni registro.
3. **Ejecución.** Solo se ejecuta un plan válido, en el orden
   presentado.
4. **Registro.** Escribe `teleprompter-lock.json` en la raíz del
   destino. Es parte de la operación, no un efecto secundario.

## Marcas del plan

Una marca por línea, antes de cualquier escritura:

- `mkdir` — creación de una ruta de precondición con `create: true`.
- `create` — el destino no existe; se instalará el recurso.
- `identical` — el destino ya contiene exactamente el recurso del
  paquete; no hay nada que escribir.
- `conflict` — el destino existe con contenido distinto y no consta
  instalado por Teleprompter, o consta pero fue modificado localmente
  desde entonces. Requiere resolución.
- `managed-update` — el destino existe con contenido distinto, pero el
  registro lo reconoce como propio (su contenido coincide con el hash
  anotado) y el paquete ofrece una versión igual o posterior a la
  registrada. Se sobrescribe sin preguntar.

En el resultado final, `conflict` y `managed-update` aparecen como
`overwrite` cuando se escribieron, y `skip` cuando se omitieron.

## Colisiones

Una colisión es un `conflict` del plan. La primera respuesta es la
resolución interactiva: en una consola interactiva se pregunta por cada
recurso si se sobrescribe o se omite. En una invocación no interactiva
sin opciones, la operación lista los conflictos y aborta con código `2`
sin escribir nada.

Dos opciones excluyentes resuelven todas las colisiones por adelantado:

- `--force` — el recurso del paquete sobrescribe el destino en cada
  colisión. Es destructivo y nunca es el comportamiento por defecto.
- `--skip` — el recurso en conflicto no se instala; el resto del plan
  se ejecuta y la omisión queda en el registro como `skip`.

Declarar ambas es un error de invocación (código `4`). La resolución
decide por recurso completo: el contenido no se fusiona.

## `--dry-run`

Ejecuta las fases de verificación y plan —incluida, si procede, la
resolución de colisiones— y termina con código `0` sin escribir
recursos ni registro.

## El registro

Cada instalación escribe `teleprompter-lock.json` en la raíz del
destino: un JSON pensado para versionarse con el repositorio:

```json
{
  "packages": {
    "ciclo-tareas": {
      "version": "1.0.0",
      "installedAt": "2026-09-28T10:00:00.000Z",
      "files": [
        {
          "target": ".agents/skills/ejecutar-tareas/SKILL.md",
          "action": "create",
          "sha256": "…"
        }
      ]
    }
  }
}
```

`packages` se indexa por el `name` del manifiesto y cada entrada
contiene `version`, `installedAt` y `files`: una entrada por recurso
con su `target`, la acción realizada (`create`, `overwrite`, `skip`) y
el SHA-256 del contenido escrito —las entradas `skip` no llevan hash.
Los registros de otros paquetes instalados en el mismo destino se
conservan. Un registro ausente no bloquea la operación: se ignora en
silencio y se trata como si no hubiera instalaciones previas; un
registro existente pero ilegible o malformado se ignora igualmente, con
un aviso.

## Personalización

Si el manifiesto declara `personalization`, el instalador copia el
archivo de instrucciones a `.teleprompter/<paquete>/<archivo>` dentro
del destino —un espacio gestionado por la herramienta, igual que el
registro—, recuerda su ubicación en `teleprompter-lock.json` y la
anuncia al final de la salida. El contenido del archivo es texto libre
del mantenedor: nunca se valida ni se ejecuta. Ningún `target` de
`install` puede apuntar dentro de `.teleprompter/`.

## Códigos de salida

| Código | Significado                                                     |
|--------|-----------------------------------------------------------------|
| `0`    | Éxito                                                           |
| `1`    | Manifiesto inválido                                             |
| `2`    | Plan no ejecutable: precondiciones incumplidas o colisiones     |
| `3`    | Error de ejecución (informa de lo ya aplicado antes de fallar)  |
| `4`    | Error de invocación: argumentos ausentes o rutas que no existen |
| `5`    | Error de obtención: repositorio inaccesible, referencia inexistente o archivo corrupto |
