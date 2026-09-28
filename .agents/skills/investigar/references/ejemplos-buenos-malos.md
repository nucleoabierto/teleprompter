# Ejemplos de investigaciones buenas y malas

Este documento muestra qué hace buena o mala a una investigación, con ejemplos genéricos y contraejemplos. Los ejemplos son ilustrativos: muestran la estructura y la calidad esperada, no son investigaciones reales.

## Investigaciones buenas

### Investigación abierta: elección de biblioteca de autenticación

**Por qué es buena:**

- **Propósito claro:** define exactamente qué pregunta (qué biblioteca de autenticación usar para un proyecto web).
- **Análisis de opciones reales:** tres bibliotecas concretas, no vagas, con ventajas y desventajas de cada una.
- **Evaluación comparativa explícita:** lista anidada con criterios relevantes (seguridad, facilidad de integración, mantenimiento, comunidad).
- **Recomendación justificada:** explica por qué la opción elegida supera a las demás en el contexto del proyecto.
- **Marca temporal:** indica cuándo se realizó la investigación.
- **Referencias con autor y dominio.**

### Investigación dirigida: mejores prácticas para manejo de errores

**Por qué es buena:**

- **Propósito claro y acotado.**
- **Síntesis de múltiples fuentes** en principios estructurados (categorías de errores, estrategias de propagación, logging).
- **No compara alternativas** porque la pregunta no lo requiere: va directamente de hallazgos a conclusión.
- **Cada afirmación con su fuente citada.**
- **Marca temporal.**
- **Referencias con autor y dominio.**

### Investigación dirigida con especificación de dominio: qué debe validar un linter de Python

**Por qué es buena:**

- **Propósito claro:** define el dominio a especificar (validación de código Python) y para qué componente servirá.
- **Alcance explícito:** qué cubre y qué no.
- **Hallazgos organizados por categorías:** estilo, errores comunes, complejidad, seguridad. Cada categoría con sus reglas.
- **Conclusión que sintetiza** las categorías en una visión integrada del dominio.
- **Distinción clara frente a herramientas relacionadas:** declara qué no valida, no solo qué valida.
- **Referencias a fuentes normativas** (PEP 8, documentación de Python).
- **Marca temporal.**

## Investigaciones malas (contraejemplos)

### Resumen de una sola fuente

```markdown
# Mejores prácticas para commits

> **Fecha:** 2026-09

## Propósito

Investigar mejores prácticas para commits.

## Análisis

Según conventionalcommits.org, los commits deben tener un tipo, un ámbito
opcional y una descripción. Los tipos son feat, fix, docs, style, refactor,
perf, test, build, ci y chore.

## Referencias

- conventionalcommits.org
```

**Por qué es mala:**

- **Una sola fuente:** no hay síntesis ni comparación.
- **Sin análisis crítico:** transcribe la fuente sin evaluarla.
- **Sin criterios de calidad:** no define qué hace bueno a un commit más allá de la estructura.
- **Referencia sin autor ni título.**

### Lista de enlaces sin síntesis

```markdown
# Formatos para decisiones de diseño

> **Fecha:** 2026-09

## Propósito

Investigar formatos para decisiones de diseño.

## Fuentes encontradas

- ADR: adr.github.io
- MADR: github.com/adr/madr
- RFC: varios
- Documento de principios: varios blogs

## Referencias

- Varios
```

**Por qué es mala:**

- **Sin análisis:** lista enlaces sin describir los enfoques.
- **Sin evaluación comparativa:** no compara las opciones.
- **Sin recomendación:** no concluye nada.
- **Referencias sin autor ni título.**

### Afirmaciones sin trazabilidad

```markdown
# Investigación sobre hitos

> **Fecha:** 2026-09

## Propósito

Investigar cómo organizar tareas por hitos.

## Análisis

La mayoría de proyectos usan hitos para agrupar tareas. Los hitos mejoran
la legibilidad y facilitan el seguimiento del progreso. Los proyectos
pequeños suelen prescindir de ellos porque añaden ceremonia.

## Recomendación

Usar hitos con encabezados.
```

**Por qué es mala:**

- **Sin fuentes:** «la mayoría de proyectos», «los proyectos pequeños» son afirmaciones sin atribución.
- **Sin evidencia:** no hay URLs, no hay autores, no hay fuentes verificables.
- **Recomendación sin justificación:** no explica por qué encabezados sobre otras opciones.
- **Sin referencias.**

### Investigación que no calibra la incertidumbre

```markdown
# Formato para decisiones

> **Fecha:** 2026-09

## Propósito

Investigar el mejor formato para decisiones de diseño.

## Análisis

ADR es el mejor formato. Es el más usado y el más documentado.

## Recomendación

Adoptar ADR canónico.
```

**Por qué es mala:**

- **Sin evaluación de alternativas:** asume que ADR es el mejor sin comparar.
- **Sin calibración:** no reconoce que ADR puede ser excesivo para proyectos pequeños.
- **Sin justificación contextual:** no explica por qué ADR encaja con este proyecto en particular.
- **Sin sección de limitaciones.**
- **Sin referencias.**

### Recopilación normativa sin organización

```markdown
# Requisitos del linter

> **Fecha:** 2026-09

## Propósito

Recopilar normativa para un linter de Python.

## Hallazgos

PEP 8 dice que se usan 4 espacios para indentación. Los imports van al
principio. Los nombres de funciones van en snake_case. Las constantes van
en MAYUSCULAS. También hay normas sobre longitud de línea: 79 caracteres.
Los espacios alrededor de operadores. Los comentarios deben ser completos.
etc.

## Referencias

- PEP 8
```

**Por qué es mala:**

- **Sin organización:** la normativa se lista como un párrafo continuo, sin categorías ni estructura.
- **Sin distinción de niveles:** mezcla estilo, errores comunes y convenciones sin separarlas.
- **Sin síntesis:** transcribe normas sin procesarlas ni organizarlas para el componente.
- **Sin conclusión:** no integra los hallazgos en una visión del dominio.
- **Referencias sin autor ni título.**

### Investigación sin marca temporal

```markdown
# Mejores prácticas para autenticación

## Propósito

Investigar mejores prácticas para autenticación web.
```

**Por qué es mala:**

- **Sin marca temporal:** el lector no puede valorar si el conocimiento sigue vigente. En un campo que evoluciona rápido, la fecha es esencial para decidir si conviene revalidar.

### Investigación con nombre de archivo sin fecha

Archivo: `mejores-practicas-autenticacion.md`

**Por qué es mala:**

- **Sin fecha en el nombre:** el nombre no indica cuándo se realizó la investigación. Los archivos no se ordenan cronológicamente y no se ve visualmente cómo se han ido añadiendo investigaciones al proyecto. El nombre debería ser `2026-09-mejores-practicas-autenticacion.md`.

## Señales de una investigación buena

- Incluye marca temporal (año-mes) en el documento y en el nombre del archivo (`yyyy-mm-titulo.md`).
- El propósito responde a una pregunta concreta y declarada.
- El análisis describe opciones reales con ventajas y desventajas (abierta), o recopila y sintetiza evidencia en hallazgos organizados (dirigida).
- La evaluación comparativa usa lista anidada por defecto y tabla solo para datos compactos (abierta).
- La recomendación explica por qué sobre las demás opciones (abierta).
- Los hallazgos están organizados por categorías cuando la investigación especifica un dominio (dirigida con especificación).
- Cada afirmación sustantiva tiene su fuente citada.
- Las lagunas y limitaciones están declaradas en una sección `Limitaciones`.
- Las referencias tienen autor o dominio identificable y URL, en un solo formato (citas numeradas o citas con autor).

## Señales de una investigación mala

- Sin marca temporal en el documento o en el nombre del archivo.
- Una sola fuente sin síntesis ni análisis crítico.
- Lista de enlaces sin descripción ni comparación.
- Afirmaciones sin atribución («la mayoría de…», «se suele…»).
- Recomendación sin justificación contextual.
- Hallazgos como párrafo continuo sin organizar por categorías (dirigida con especificación).
- Tablas con celdas que contienen párrafos o listas (usar lista anidada en su lugar).
- Sin sección de limitaciones cuando hay lagunas declarables.
- Referencias sin autor ni título, o con formatos mezclados.
