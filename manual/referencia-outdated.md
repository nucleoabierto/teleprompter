# Referencia de `outdated`

```text
teleprompter outdated [<paquete>]
```

Revisa lo que el origen registrado de cada paquete instalado publica
hoy frente a la versión instalada. Se ejecuta desde la raíz del
repositorio destino y no escribe nada: ni el destino, ni el
registro, ni respaldos —consulta cada origen y presenta la
comparación.

Sin nombre revisa todas las entradas del registro; con nombre, solo
la de ese paquete. Por paquete muestra una línea con la versión
instalada, la que el origen publica y el estado:

```text
versiones frente al origen:
  ciclo-tareas@1.0.0 → 1.0.0 — al día
  crear-tareas@1.0.0 → 1.2.0 — desactualizado
  guias@1.0.0 — no consultable: error de obtención: 404
```

- `al día` — el origen no publica nada más reciente que lo
  instalado: la versión publicada es la misma o menor.
- `desactualizado` — el origen publica una versión más reciente.
- `no consultable` — la entrada no registra origen, el origen
  registrado ya no se puede interpretar o el sondeo falló —un
  directorio local desaparecido, un repositorio inalcanzable—; el
  motivo va en la propia línea y la revisión del resto continúa.

Un origen que no responde no aborta la revisión ni es un fallo: el
informe termina con código `0` aunque ningún origen conteste —
como `check`, la información no es un error.

La comparación es por versión: el número del manifiesto instalado
contra el que el origen publica ahora —la misma lectura que una
actualización haría del mismo origen, colecciones incluidas por su
miembro grabado—. `outdated` informa qué hay disponible; cambiar de
versión es trabajo de `update`.

Sin instalaciones registradas responde `no hay paquetes
instalados`: es una respuesta, no un fallo. Un registro ilegible o
corrupto añade un `aviso:` y responde lo mismo —como el resto de
lecturas del lock, la corrupción degrada a «sin historia»—.

## Errores

| Situación                               | Código |
|-----------------------------------------|--------|
| Más de un paquete, u opciones           | `4`    |
| El paquete nombrado no está instalado   | `4`    |
