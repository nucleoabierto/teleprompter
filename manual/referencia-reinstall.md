# Referencia de `reinstall`

```text
teleprompter reinstall [--force|--skip] [--dry-run]
```

Reinstala todo lo que el registro del repositorio declara: recorre
`teleprompter-lock.json`, obtiene cada paquete anclado al commit que
su origen registró y restaura el destino al estado declarado. Se
ejecuta desde la raíz del repositorio destino —no acepta destino,
origen ni selección parcial—.

## Qué hace

Trabaja como conjunto: cada fase termina completa antes de que la
siguiente empiece, y ninguna escritura ocurre hasta que el conjunto
entero se muestra ejecutable.

1. **Obtención.** Cada entrada del registro se reobtiene desde su
   origen: un `github` baja el `commit` registrado —el árbol exacto
   que la instalación consumió, no lo que el `ref` publica hoy—; un
   `path` vuelve a leer el directorio registrado. Las entradas de
   colección re-resuelven el miembro por el `package` grabado en su
   origen, como `update`. Todo se obtiene antes de planear nada.
2. **Plan.** Cada unidad se verifica sobre el árbol anclado y su plan
   de instalación se muestra etiquetado por nombre —`plan de
   instalación de "<paquete>":`—, todos antes de la primera decisión.
   Las marcas son las de `install`: `identical` cuando el destino ya
   contiene lo declarado, `create` cuando falta y `conflict` cuando
   diverge o es ajeno. Una unidad que ya coincide con lo declarado —
   recursos y guía gestionada intactos— se anuncia `ya está conforme`
   y no produce acciones ni reescritura.
3. **Decisión y preflight.** Las divergencias se resuelven con la
   política compartida: en consola interactiva se pregunta cada una
   mostrando antes su diff, `--force` las restaura todas, `--skip`
   las conserva todas y, sin consola ni opciones, se listan con su
   diff y el conjunto aborta sin escribir. La guía gestionada y la
   raíz de respaldos se validan antes de escribir.
4. **Ejecución.** Unidad a unidad, como una instalación: se aplica el
   plan, se materializa la guía gestionada y se reescribe la entrada
   en forma de instalación —el `origin` registrado se conserva
   intacto, `commit` y `package` incluidos, e `installedAt` se
   renueva—. Lo sobrescrito por decisión se respalda antes bajo
   `.teleprompter/backups/` y el resultado lo anuncia con
   `respaldo:` y `reinstalado: <paquete>@<versión>`.

La guía gestionada es territorio del instalador, no una divergencia
decidible: si difiere de lo declarado se restaura en cada ejecución
—también con `--skip`, que solo conserva los recursos en conflicto—,
como en `install` y `update`.

Sin registro, o con uno vacío o ilegible, responde `no hay paquetes
instalados` —con `aviso:` cuando el archivo es ilegible—.

## Unidades no reproducibles

Una entrada es no reproducible cuando su registro no alcanza para
volver a obtenerla: sin `origin`, un `github` sin `commit` registrado,
una ruta local desaparecida, un `repo` inválido o un miembro que la
colección ya no contiene. Cada una se diagnostica `la unidad "…" no
es reproducible: <motivo>` —los miembros disueltos además listan los
disponibles— y, tras intentar todas, la operación aborta sin escribir
nada: las unidades que sí se obtuvieron tampoco se tocan. Un origen
remoto inalcanzable no es un problema de reproducción: es un `error
de obtención` con el mismo corte.

## Errores

| Situación                                              | Código |
|--------------------------------------------------------|--------|
| Argumentos, o una opción que no aplica (`--path`, `--ref`, `--package`) | `4` |
| Una unidad no reproducible —sin origen, sin commit, ruta o miembro ausente— | `4` |
| Manifiesto inválido en alguna unidad obtenida             | `1`    |
| Plan no ejecutable: precondiciones incumplidas, divergencias sin resolver, guía o respaldo fuera del destino | `2` |
| Error de ejecución a mitad —reporta lo aplicado y las unidades pendientes— | `3` |
| Error de obtención de un origen remoto                  | `5`    |
