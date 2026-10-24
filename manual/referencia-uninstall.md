# Referencia de `uninstall`

```text
teleprompter uninstall <paquete> [--force|--skip] [--dry-run]
```

Retira del repositorio los recursos que un paquete instalado registró
en `teleprompter-lock.json`. Se ejecuta desde la raíz del repositorio
destino —no acepta destino ni origen— y nombra el paquete por su
`name` en el registro.

## Qué hace

Presenta el plan de retirada completo antes de borrar nada —una línea
por recurso registrado—. Cada recurso que sigue intacto se elimina
(`retire`): archivos, enlaces y directorios enteros, incluida la guía
de personalización gestionada. Cada recurso con deriva local
—modificado a mano o no verificable— es una divergencia que se decide
con la misma política de conflictos del resto del producto: en una
consola interactiva pregunta por cada una mostrando el diff del
contenido local que se retiraría, `--force` las retira todas,
`--skip` las conserva todas y, sin consola ni opciones, las lista con
su diff y aborta sin escribir. Lo decidido a retirar se respalda
antes bajo `.teleprompter/backups/` y el resultado lo anuncia con
`respaldo:`.

Los recursos registrados que ya no existen no producen acción, y las
entradas `skip` —que la instalación nunca escribió— tampoco se tocan:
caen con la entrada del paquete.

Terminada la retirada, el registro queda reescrito sin la entrada del
paquete —atómicamente, como toda escritura del lock— y el archivo
persiste aunque sea el último paquete. Lo conservado por decisión
deja de pertenecer al paquete: permanece en disco pero ya no figura
en el registro, así que `list` y `check` dejan de reportarlo.

## Errores

| Situación                                              | Código |
|--------------------------------------------------------|--------|
| El paquete no está instalado —incluido sin registro o registro ilegible— | `4`    |
| Argumentos de más o de menos, o una opción que no aplica (`--path`, `--ref`, `--package`) | `4` |
| Plan no ejecutable: divergencias sin resolver —sin consola ni opciones— o el respaldo no cabe bajo el destino | `2` |
| Error de ejecución a mitad de la retirada              | `3`    |
