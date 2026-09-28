# [Nombre del dominio]

## Propósito

[Una o dos frases: qué problema del negocio o del sistema cubre este dominio.]

## Referencia del modelo

[Hechos consultables: qué es el dominio y qué reglas cumple. Cada afirmación
lleva su ancla —el elemento de código donde vive, que permite detectar
deriva— y opcionalmente un Origen con la tarea o épica que la introdujo.]

- **Lenguaje ubicuo:**
  - **[Término]:** [definición en lenguaje del dominio]
    - Ancla: `[elemento de código]` en `[archivo]`
    - Origen: `[docs/tasks/NNN o épica, opcional]`
- **Entidades / estado:**
  - [Los objetos con identidad propia del dominio y su representación en código, con anclas]
- **Invariantes:**
  - [Cada regla que el dominio hace cumplir siempre, con su ancla al código que la defiende]
- **Operaciones:**
  - [Cada caso de uso o servicio del dominio, con su ancla]

## Explicación del dominio

[Contexto y juicio: por qué el dominio es así y dónde acaba.]

- **Fronteras:**
  - Dentro: [responsabilidades que pertenecen a este dominio]
  - Fuera: [responsabilidades cercanas que pertenecen a otros dominios o a infraestructura/presentación]
  - Relaciones: [otros dominios con los que interactúa y cómo]
- **Decisiones relevantes:**
  - [Enlaces a `docs/decisions/` que dan forma a este dominio, o «Ninguna»]

## Estado de salud

- Última revisión: [fecha]
- Divergencias conocidas: [lista o «Ninguna»]
