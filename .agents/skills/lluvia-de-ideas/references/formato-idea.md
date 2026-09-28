# Formato del archivo de idea

Plantilla de `docs/ideas/NNN-slug.md`: el artefacto que `lluvia-de-ideas` produce y que el flujo de idea a tarea consume como entrada persistida.

## Plantilla

```markdown
# [Nombre de la idea]: [subtítulo que la distingue]

> **Tipo:** idea de [funcionalidad | flujo | iteración | …] — tamaño
> [tarea | conjunto | épica] (complejidad [baja | media | alta])
> **Fecha:** [AAAA-MM]
> **Orden sugerido:** [N] de [M] — [una frase de por qué va en esa
> posición; solo cuando la propuesta originaria produjo varias ideas]

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
- «Orden sugerido» solo se escribe cuando una propuesta produce varias ideas: declara la posición de cada una en el orden propuesto al usuario, que es lo que `idea-a-tarea` consulta al presentar la siguiente pendiente. Una idea única no lleva la línea.
- Cuando una idea fue procesada por el flujo, `idea-a-tarea` añade a la cabecera la línea `> **Procesada en:** docs/proposals/NNN-slug/` para marcarla como consumida; el autor no la escribe.
- La numeración es una serie propia del directorio `docs/ideas/` del proyecto evaluado.
