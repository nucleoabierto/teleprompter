# Referencia de `check`

```text
teleprompter check
```

Verifica el estado de los recursos que Teleprompter instaló en el
repositorio destino. Se ejecuta desde la raíz del destino —no acepta
argumentos ni opciones— y contrasta `teleprompter-lock.json` con lo
que el disco contiene: no reinstala ni vuelve a descargar nada.

Por cada paquete instalado muestra su `nombre@version` y una línea
por recurso registrado con una marca de estado:

```text
estado de los recursos:
  ciclo-tareas@1.0.0
    intacto         .agents/skills/crear-tareas/SKILL.md
    modificado      .agents/skills/ejecutar-tareas/SKILL.md
    ausente         .agents/skills/commit/SKILL.md
    no verificable  .teleprompter/ciclo-tareas/PERSONALIZE.md
```

- `intacto` — el recurso sigue conteniendo lo que la instalación
  escribió.
- `modificado` — el recurso existe pero su contenido difiere de lo
  registrado.
- `ausente` — la ruta registrada ya no existe en el destino.
- `no verificable` — el registro no guardó una referencia con la que
  comparar, el recurso no se puede leer, o la ruta registrada no es
  segura —sale del destino por un `..` o un enlace—.

Los recursos que la instalación omitió por colisión no se verifican
—la herramienta no escribió nada ahí— y el informe no muestra hashes
ni acciones internas. Encontrar deriva no es un fallo: el informe
termina con código `0` haya o no recursos modificados o ausentes.

Sin instalaciones registradas responde `no hay paquetes
instalados`: es una respuesta, no un fallo. Un registro ilegible o
corrupto añade un `aviso:` y responde lo mismo —como el resto de
lecturas del lock, la corrupción degrada a «sin historia»—.

## Errores

| Situación                               | Código |
|-----------------------------------------|--------|
| Argumentos u opciones de cualquier tipo | `4`    |
