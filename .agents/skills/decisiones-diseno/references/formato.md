# Formato de las decisiones

## Plantilla

Cada decisión sigue esta plantilla:

```markdown
# DNNN: Título breve de la decisión

## Estado

Aceptada | Sustituida por DNNN | Obsoleta

## Contexto

[Qué problema o situación motivó la decisión. Dos a cuatro frases. Describe las
fuerzas en juego, sin justificar la decisión todavía.]

## Decisión

[Qué se decidió. Frases claras y concretas, en primera persona del plural:
«Usamos…», «Mantenemos…». Una a tres frases.]

## Justificación

[Por qué se tomó esta decisión y no otra. Qué alternativas se consideraron, si
aporta valor listarlas. Qué consecuencias tiene.]

## Referencias

- [Enlaces a tareas, investigaciones u otros documentos relacionados, si los hay.]
```

## Reglas del formato

1. Una decisión por archivo, numerada secuencialmente (`D001`, `D002`, …).
2. El título es una frase nominal breve que describe la decisión, no el problema.
3. El estado se actualiza cuando una decisión posterior la sustituye o la deja obsoleta. La decisión original no se reescribe: se marca y se enlaza a la sustituta.
4. El contexto describe las fuerzas, no la justificación. La justificación va en su propia sección.
5. La decisión se escribe en presente y en primera persona del plural.
6. Las referencias son opcionales; se incluyen solo si enlazan a documentos existentes en el repositorio.
7. Las decisiones se escriben en español y en Markdown, como el resto del proyecto.

## Ejemplo

```markdown
# D001: TODO.txt como índice único de tareas

## Estado

Aceptada

## Contexto

El proyecto necesita un mecanismo para seguir el estado de las tareas a lo largo del
tiempo. Las opciones van desde un gestor externo (Linear, GitHub Issues) hasta un
archivo de texto plano en el repositorio. El proyecto prioriza la simplicidad, la
trazabilidad en git y la independencia de herramientas externas.

## Decisión

Mantenemos `TODO.txt` como índice único de tareas. Cada tarea se documenta en un
archivo individual bajo `docs/tasks/` y se referencia desde `TODO.txt`.

## Justificación

Un archivo de texto plano en el repositorio es versionable, inspeccionable sin
herramientas externas y suficiente para el volumen actual. Un gestor externo
añadiría una dependencia y una fuente de verdad paralela. El formato de una línea
por tarea con estado entre corchetes es legible y procesable por el skill
`ejecutar-tareas`.
```
