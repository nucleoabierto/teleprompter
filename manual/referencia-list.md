# Referencia de `list`

```text
teleprompter list
```

Muestra los paquetes instalados en el repositorio destino. Se
ejecuta desde la raíz del destino —no acepta argumentos ni
opciones— y lee `teleprompter-lock.json`: no reinstala ni vuelve a
descargar nada.

Por cada paquete instalado muestra una entrada con su
`nombre@version`, el instante en que se instaló y una línea por
recurso que la instalación escribió:

```text
paquetes instalados:
  ciclo-tareas@1.0.0 — instalado 2026-09-28T10:00:00.000Z
    guía: teleprompter guide ciclo-tareas
    .agents/skills/crear-tareas/SKILL.md
    .agents/skills/ejecutar-tareas/SKILL.md
    .agents/skills/commit/SKILL.md
    .teleprompter/ciclo-tareas/PERSONALIZE.md
```

La línea `guía:` solo aparece cuando el paquete declaró
instrucciones de personalización, consultables con
[`guide`](referencia-guide.md). Los recursos que la instalación
omitió por colisión no se listan —el registro anota la decisión,
pero la herramienta no escribió nada ahí— y tampoco se muestran los
hashes ni las acciones internas del registro.

Sin instalaciones registradas responde `no hay paquetes
instalados`: es una respuesta, no un fallo. Un registro ilegible o
corrupto añade un `aviso:` y responde lo mismo —como el resto de
lecturas del lock, la corrupción degrada a «sin historia»—.

## Errores

| Situación                               | Código |
|-----------------------------------------|--------|
| Argumentos u opciones de cualquier tipo | `4`    |
