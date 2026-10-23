# Referencia de `uninstall`

```text
teleprompter uninstall <paquete> [--dry-run]
```

Retira del repositorio los recursos que un paquete instalado registró
en `teleprompter-lock.json`. Se ejecuta desde la raíz del repositorio
destino —no acepta destino ni origen— y nombra el paquete por su
`name` en el registro.

## Qué hace

Presenta el plan de retirada completo antes de borrar nada —una línea
por recurso registrado— y luego lo ejecuta: cada recurso que sigue
intacto se elimina (`retire`) —archivos, enlaces y directorios
enteros, incluida la guía de personalización gestionada— y cada
recurso con deriva local se conserva y se anuncia como `keep`, hasta
que la política de divergencias permita decidirlo. Los recursos
registrados que ya no existen no producen acción, y las entradas
`skip` —que la instalación nunca escribió— tampoco se tocan: caen
con la entrada del paquete.

Terminada la retirada, el registro queda reescrito sin la entrada del
paquete —atómicamente, como toda escritura del lock— y el archivo
persiste aunque sea el último paquete. Lo conservado por deriva deja
de pertenecer al paquete: permanece en disco pero ya no figura en el
registro, así que `list` y `check` dejan de reportarlo.

## Errores

| Situación                                              | Código |
|--------------------------------------------------------|--------|
| El paquete no está instalado —incluido sin registro o registro ilegible— | `4`    |
| Argumentos de más o de menos, o una opción que no aplica (`--path`, `--ref`, `--package`, `--force`, `--skip`) | `4` |
| Error de ejecución a mitad de la retirada              | `3`    |
