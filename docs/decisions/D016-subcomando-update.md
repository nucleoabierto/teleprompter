# D016: `update` como subcomando y las acciones `remove`/`keep`

## Estado

Aceptada

## Contexto

El registro ya recuerda de dónde vino cada instalación (D014) y el
plan de actualización sabe clasificar cada recurso entre la versión
entrante y el estado del destino (D015). Falta la superficie: cómo se
invoca la actualización y cómo se nombran el paquete y el origen.

## Decisión

`teleprompter update <paquete> [<user/repo[@ref]> | --path <dir>]
[--ref <ref>] [--force|--skip] [--dry-run]` es un comando propio de la
gramática: opera sobre el directorio de trabajo —sin destino— y nombra
el paquete por su `name` en el registro. El origen se resuelve en
orden: un origen explícito de la invocación sobrescribe el registrado
—y queda como `origin` nuevo—; si no, se usa el `origin` del registro
(`github` con su `ref` grabado o la rama por defecto, `path` con su
ruta absoluta); sin ninguno, es un error de invocación. `--ref`
sobrescribe el ref de un origen de repositorio y con `--path` —o un
origen local registrado— es un error. Si el origen obtenido publica un
`name` distinto del pedido, la invocación falla con código 4. La
ejecución añade dos acciones al vocabulario: `remove` —retirado
intacto o `removal` resuelto a favor de la versión— y `keep` —
`removal` conservado, que preserva la entrada previa del registro
como `identical`.

## Justificación

Operar sobre el directorio de trabajo replica el alcance que D011–D013
fijaron para las consultas y libera el segundo posicional para el
origen explícito —la única forma de «apuntar a otro sitio»— sin
ambigüedad con un destino. Sobrescribir el origen registrado —no solo
para esta ejecución sino en el lock— es coherente con «el registro
dice de dónde vino la última instalación». Pedir el nombre del paquete
mantiene la superficie mínima y permite al comando comprobar que el
origen publica exactamente ese paquete —un origen que cambió de nombre
no puede actualizar a otro por accidente—. Las acciones `remove`/`keep`
existen porque una resolución `overwrite`/`skip` sobre un retirado sin
contenido entrante no puede copiarse: `remove` elimina con la misma
guarda de rutas que toda escritura y `keep` conserva el registro
previo porque nada se escribió —el recurso sigue en disco con lo que
el lock anotó—. Consecuencias: `update` queda reservada como primera
palabra de la gramática; `--dry-run`, `--force` y `--skip` mantienen
su semántica de `install` sobre el plan de actualización.

## Referencias

- `docs/tasks/020-comando-update.md`
- `docs/decisions/D006-politica-colisiones.md`
- `docs/decisions/D014-campo-origin-del-registro.md`
- `docs/decisions/D015-plan-de-actualizacion-y-retirados.md`
