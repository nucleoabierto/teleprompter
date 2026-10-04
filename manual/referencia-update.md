# Referencia de `update`

```text
teleprompter update <paquete> [<user/repo[@ref]>] [--ref <ref>]
teleprompter update <paquete> --path <paquete>
teleprompter update <paquete> [--force | --skip] [--dry-run]
```

Lleva un paquete instalado a la versión que publica su origen. Se
ejecuta desde la raíz del repositorio destino —no acepta destino— y
nombra el paquete por su `name` en `teleprompter-lock.json`.

## El origen

- Sin indicación, reobtiene el paquete desde el origen que la
  instalación registró: el repositorio con su `ref` —o la rama por
  defecto— o el directorio de `--path`.
- Un posicional `user/repo[@ref]` o `--path <dir>` lo sobrescribe y
  queda registrado como nuevo origen.
- `--ref` sobrescribe el ref de un origen de repositorio; con un
  origen local es un error de invocación.

## Orígenes de colección

Si el origen registrado —o el explícito— es una colección, la
actualización re-resuelve el mismo paquete: busca su nombre en el
índice del árbol recién obtenido y actualiza ese miembro, no otro.
El origen reescrito conserva el nombre elegido, así que las
actualizaciones siguientes siguen resolviendo por el índice —el
mantenedor puede reubicar el paquete dentro del repositorio sin
romper orígenes registrados—.

- Si el paquete ya no figura en el índice, la operación aborta con
  código `4` —«ya no está en la colección»— listando los
  disponibles, sin escribir nada.
- Si el mantenedor disolvió la colección en un paquete único con el
  mismo nombre, la actualización sigue funcionando sobre él.
- `update` no acepta `--package`: el paquete a actualizar se nombra
  como argumento, y ese mismo nombre resuelve al miembro.

## Qué hace

Verifica la versión entrante y presenta el plan de actualización
completo antes de escribir nada: `create`, `identical`, `update`
—la versión cambió el recurso y el destino sigue intacto— y
`retire` —la versión retira contenido intacto—. Si el mapa cambia
de granularidad —un directorio instalado pasa a declararse por
hijos, o hijos colapsan en un directorio— el retirado baja a lo
abandonado: los targets entrantes y lo que está en su camino quedan
en disco, y solo se elimina lo que la versión nueva ya no cubre
bajo el directorio registrado. Lo que la versión
cambió sobre una edición local, y los retirados modificados, se
resuelven como las colisiones de `install`: pregunta interactiva,
`--force`, `--skip` o aborto sin consola —para un retirado la
pregunta es quitarlo, no sobrescribirlo—.

Si el paquete ya está en la versión que publica el origen, responde
`ya está en esa versión` sin escribir nada. Terminada la ejecución,
el registro queda a la versión nueva con el origen efectivo.

## Errores

| Situación                                              | Código |
|--------------------------------------------------------|--------|
| El paquete no está instalado                           | `4`    |
| No hay origen registrado ni se indica uno              | `4`    |
| El origen obtenido publica otro paquete                | `4`    |
| El paquete ya no está en la colección del origen       | `4`    |
| `--ref` con un origen local, `--ref` con `--path`, o argumentos de más | `4` |
| Manifiesto del origen inválido                         | `1`    |
| Precondición incumplida o decisiones pendientes sin consola | `2` |
| Error de ejecución                                     | `3`    |
| Origen remoto inaccesible                              | `5`    |
