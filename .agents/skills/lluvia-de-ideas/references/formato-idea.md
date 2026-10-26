# Formato del archivo de idea

Plantilla del archivo de idea del directorio de ideas: el artefacto que `lluvia-de-ideas` produce y que el flujo de idea a tarea consume como entrada persistida.

## Plantilla

```markdown
# [Nombre de la idea]: [subtítulo que la distingue]

> **Tipo:** idea de [funcionalidad | flujo | iteración | …] — tamaño
> [tarea | conjunto | épica] (complejidad [baja | media | alta])
> **Fecha:** [AAAA-MM]
> **Requiere:** [slug de la idea prerrequisito o `ninguna` — una
>   frase de por qué depende; solo cuando la hay]

## Problema

[Uno o dos párrafos. Situación actual, a quién afecta y qué cuesta o
impide. Sin lenguaje de solución.]

## Qué desbloquea

- **[Capacidad]:** [qué hace posible que hoy es imposible o difícil]

## Flujos de trabajo que se hacen viables

- [Escenarios de uso concretos que la idea habilita, en lenguaje del
  usuario]

## Ventajas como producto

- **[Ventaja]:** [qué aporta al producto más allá del problema
  inmediato: hábito, posicionamiento, base estructural]

## Tensión que introduce en el roadmap

[Un párrafo. Con qué otras ideas o trabajo existente compite o se
solapa, y qué condiciona el orden de ejecución. En ideas del mismo
origen, referencia a las hermanas por su slug.]
```

## Notas de formato

- El tipo y el tamaño de la cabecera son orientativos, no una clasificación cerrada: cualquier descripción honesta de la naturaleza y magnitud de la idea es válida.
- «Problema» y «Qué desbloquea» son las secciones que `descubrir-problema` consume como punto de partida: deben bastar para arrancar el diálogo sin rehacer la exploración. «Qué desbloquea» equivale a la «Oportunidad» del formato de salida de `descubrir-problema`: qué hace posible y qué mejora aporta.
- «Requiere» declara el slug de la idea prerrequisito —la que debe procesarse antes—; es lo que `idea-a-tarea` consulta para decidir el orden de procesamiento. Sin dependencia, la línea se omite.
- Cuando una idea fue procesada por el flujo, `idea-a-tarea` la marca como consumida delegando en `actualizar-artefactos`, que añade a la cabecera la marca de procesada con la referencia de la propuesta; el autor no la escribe.
- La numeración es una serie propia del directorio de ideas del proyecto evaluado.
