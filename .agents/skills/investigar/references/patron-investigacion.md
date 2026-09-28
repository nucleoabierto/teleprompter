# Patrón de investigación

Plantillas y estructura para los documentos de investigación. Hay dos tipos de investigación: abierta (comparación de opciones) y dirigida (síntesis de mejores prácticas o especificación de un dominio). Las plantillas son guías, no camisas de fuerza: adaptar las secciones a la pregunta, pero mantener la marca temporal, el propósito y las referencias siempre.

## Elementos comunes

### Fecha

Toda investigación incluye una marca temporal al principio del documento, justo después del título, en formato año-mes:

```markdown
# Título de la investigación

> **Fecha:** 2026-09
```

La marca temporal permite al lector valorar si el conocimiento sigue vigente o si ha cambiado. La investigación tiene validez cuando usa fuentes, pero las fuentes pueden dejar de ser válidas cuando hay nuevas investigaciones que presentan nueva evidencia. La fecha es la referencia para decidir si conviene revalidar.

### Nombre del archivo

El archivo se nombra en formato `yyyy-mm-titulo.md` (p. ej., `2026-09-investigacion-por-agentes.md`). Así la fecha es visible en el nombre, los archivos se ordenan cronológicamente por defecto y se ve visualmente cómo se han ido añadiendo investigaciones al proyecto.

### Propósito

Una frase, ocasionalmente dos, que define qué pregunta la investigación intenta responder. No justifica la investigación ni la contextualiza: eso va en «Contexto».

**Ejemplo:**

> Investigar cómo organizar un índice de tareas agrupando tareas por hitos, fases o proyectos, y proponer un formato concreto que mantenga la simplicidad del índice actual.

### Contexto

La situación o problema que motiva la investigación. Describe las fuerzas en juego sin justificar la decisión todavía. Omitir si la pregunta se basta por sí sola.

**Ejemplo:**

> El sistema actual marca una tarea como completada cuando el agente termina de ejecutarla, sin un paso de revisión intermedio. El agente que ejecuta es el mismo que decide que está completa. Esto presenta el problema estructural del **sesgo de autoaprobación**…

### Limitaciones

Sección opcional donde se declaran las lagunas, las afirmaciones disputadas, los límites del análisis y la naturaleza de las fuentes. La investigación honesta marca lo que no sabe. Omitir solo si la investigación no tiene limitaciones declarables, lo cual es raro.

**Ejemplo:**

> Esta investigación se basa en literatura académica reciente (2025-2026) y guías prácticas de la industria. Las fuentes académicas son preprints y pueden no haber pasado por revisión por pares. Los principios extraídos son estables porque derivan de limitaciones estructurales de los LLMs, no de implementaciones específicas.

### Referencias

Lista de fuentes consultadas, con autor o dominio identificable y URL. Hay dos formatos de cita:

- **Citas numeradas** cuando hay muchas afirmaciones con fuentes distintas: `[1]` en el texto y lista numerada al final.
- **Citas con autor o dominio** cuando hay pocas fuentes: `[Autor, «Título» — url]` directamente en la lista.

Usar un solo formato por documento. Mezclar formatos confunde al lector.

**Ejemplo (citas con autor):**

```markdown
## Referencias

- Conventional Commits — conventionalcommits.org/en/v1.0.0/
- Tim Pope, «A Note About Git Commit Messages» — tbaggery.com
- Chris Beams, «How to Write a Git Commit Message» — cbea.ms/git-commit/
```

**Ejemplo (citas numeradas):**

```markdown
## Referencias

- [1] Conventional Commits — conventionalcommits.org/en/v1.0.0/
- [2] Tim Pope, «A Note About Git Commit Messages» — tbaggery.com
- [3] Chris Beams, «How to Write a Git Commit Message» — cbea.ms/git-commit/
```

## Plantilla: investigación abierta

```markdown
# Título de la investigación

> **Fecha:** YYYY-MM

## Propósito

[Una frase que define qué pregunta la investigación intenta responder.]

## Contexto

[La situación o problema que motiva la investigación, cuando aplica. Omitir
si la pregunta se basta por sí sola.]

## Análisis

[Enumeración y descripción de las opciones, enfoques o dimensiones
investigadas, con ventajas y desventajas de cada una. Cada afirmación con
su fuente citada.]

## Evaluación comparativa

[Comparación de las opciones contra criterios relevantes. Usar lista anidada
por defecto. Usar tabla solo si las celdas contienen una o dos palabras y la
estructura es regular. Omitir si la investigación no compara alternativas.]

## Recomendación

[La opción elegida o la caracterización del estado del tema, con justificación
explícita.]

## Formato o procedimiento

[Cuando la investigación produce un formato, procedimiento o conjunto de
reglas, se detalla aquí con plantilla y ejemplos. Omitir si no aplica.]

## Limitaciones

[Lagunas, afirmaciones disputadas, límites del análisis y naturaleza de las
fuentes. Omitir solo si no hay limitaciones declarables.]

## Referencias

- [Autor o dominio, «Título» — url]
```

### Secciones específicas de la abierta

#### Análisis

Enumeración y descripción de las opciones. Cada opción con un encabezado de nivel 3 y dos subsecciones: ventajas y desventajas. Cada afirmación breve, con su fuente citada. No volcar texto en bruto: extraer y comprimir.

**Ejemplo:**

```markdown
### 1. Secciones con encabezados

Agrupar las tareas bajo encabezados dentro del propio índice.

**Ventajas:**
- El índice sigue en un solo archivo, fácil de inspeccionar.
- Los grupos son visibles de un vistazo.

**Desventajas:**
- El archivo crece en longitud con los encabezados.
- Si un grupo tiene muchas entradas completadas, añade ruido visual.
```

#### Evaluación comparativa

Comparación de las opciones contra criterios relevantes para la pregunta. Los criterios deben ser específicos, no genéricos. Omitir si la investigación no compara alternativas.

**Usar lista anidada por defecto.** Es más legible cuando las celdas contienen frases o explicaciones.

**Ejemplo de lista anidada:**

```markdown
### Simplicidad
- **Opción A:** alta. No requiere herramientas adicionales.
- **Opción B:** media. Requiere configurar un archivo de manifiesto.
- **Opción C:** baja. Requiere un servicio externo y configuración de red.

### Escalabilidad
- **Opción A:** media. Funciona hasta unos cien elementos.
- **Opción B:** alta. Diseñada para miles de elementos.
- **Opción C:** alta. Diseñada para entornos distribuidos.
```

**Usar tabla solo cuando** las celdas contienen una o dos palabras y la estructura es regular (todas las filas tienen el mismo número de columnas).

**Ejemplo de tabla válida:**

```markdown
| Criterio | Opción A | Opción B | Opción C |
|----------|----------|----------|----------|
| Simplicidad | Alta | Media | Baja |
| Escalabilidad | Media | Alta | Alta |
| Trazabilidad | Alta | Baja | Alta |
```

#### Recomendación

La opción elegida, en negrita en la primera línea, seguida de la justificación. Explicar por qué sobre las demás, no solo describirla.

**Ejemplo:**

> **Secciones con encabezados** dentro del índice.
>
> Es el enfoque que mejor equilibra estructura y simplicidad para el tamaño actual del proyecto:
>
> - No requiere cambios en el sistema existente: las entradas mantienen su formato.
> - Los grupos son visibles al ojear el archivo.

#### Formato o procedimiento

Cuando la investigación produce un formato, procedimiento o conjunto de reglas, se detalla aquí con plantilla, reglas y ejemplos. Omitir si no aplica.

**Ejemplo:**

```markdown
### Reglas del formato

1. Los grupos se introducen con encabezados de nivel 2.
2. Las entradas se listan bajo el grupo al que pertenecen, manteniendo el formato actual.
3. Los grupos se numeran secuencialmente y se ordenan cronológicamente.
```

## Plantilla: investigación dirigida

La investigación dirigida recopila evidencia de múltiples fuentes y la sintetiza en principios estructurados. Cuando la pregunta pide especificar un dominio para un componente, se añaden las secciones extensibles (`Alcance`, `Entradas`, `Salidas`).

```markdown
# Título de la investigación

> **Fecha:** YYYY-MM

## Propósito

[La pregunta concreta a responder.]

## Alcance

[Qué cubre la investigación y qué no. Sección obligatoria cuando la pregunta
especifica un dominio; omitir en otro caso.]

## Entradas

[La entrada del componente que la investigación define, si aplica. Omitir
si la pregunta no especifica un componente.]

## Salidas

[La salida del componente, si aplica. Omitir si la pregunta no especifica
un componente.]

## Hallazgos

[Evidencia encontrada, organizada por fuente o por aspecto de la pregunta.
Cada hallazgo es una afirmación breve con su fuente citada. No volcar texto
en bruto: extraer y comprimir.]

## Conclusión

[La síntesis de los hallazgos en principios estructurados, reglas o
categorías del dominio. No introduce información nueva: integra lo que ya
apareció en hallazgos.]

## Limitaciones

[Lagunas, afirmaciones disputadas, límites del análisis y naturaleza de las
fuentes. Omitir solo si no hay limitaciones declarables.]

## Referencias

- [Autor o dominio, «Título» — url]
```

### Secciones específicas de la dirigida

#### Alcance

Qué cubre la investigación y qué no. Delimita el dominio para que la investigación sea manejable y no se desborde. Obligatoria cuando la pregunta especifica un dominio; omitir en otro caso.

**Ejemplo:**

```markdown
## Alcance

- **Idioma:** español.
- **Tipo de texto:** textos generales (artículos, informes, correos, documentación).
- **Profundidad:** exhaustiva, recorriendo el texto completo.
```

#### Hallazgos

Evidencia organizada por fuente o por aspecto de la pregunta. Cada hallazgo es una afirmación breve con su fuente citada. No volcar texto en bruto: extraer y comprimir. Cuando hay muchos hallazgos, organizarlos con subencabezados de nivel 3.

**Ejemplo:**

```markdown
### Estructura del mensaje

El mensaje de commit tiene un asunto y, opcionalmente, un cuerpo separado por
una línea en blanco [1]. El asunto debe limitarse a 50 caracteres, ir con
mayúscula inicial y no terminar con punto [2].

### Atomicidad

Un commit debe hacer una sola cosa. Mezclar cambios no relacionados dificulta
la revisión y el revert [1][3].
```

Cuando la investigación especifica un dominio, los hallazgos pueden organizarse por categorías del dominio en lugar de por aspecto de la pregunta:

**Ejemplo (organización por categorías):**

```markdown
### Ortografía

- **Uso de letras:** corrige errores en la representación gráfica de los fonemas
  (b/v, g/j, h, c/s/z, ll/y, x, etc.).
- **Tildes:** corrige acentuación errónea (faltas de tilde, tildes innecesarias,
  tilde diacrítica, diéresis).

### Puntuación

- **Signos de puntuación:** corrige el uso de punto, coma, punto y coma, dos
  puntos, puntos suspensivos.
- **Delimitadores:** corrige el uso de paréntesis, corchetes, rayas y comillas.
```

#### Conclusión

La síntesis de los hallazgos en principios estructurados, reglas o categorías. No introduce información nueva: integra lo que ya apareció en hallazgos.

**Ejemplo (síntesis de mejores prácticas):**

```markdown
## Conclusión

Las siete reglas universales para mensajes de commit son:

1. Separar asunto y cuerpo con una línea en blanco.
2. Limitar el asunto a 50 caracteres.
3. Escribir el asunto con mayúscula inicial.
4. No terminar el asunto con punto.
5. Usar voz imperativa en el asunto.
6. Envolver el cuerpo a 72 caracteres.
7. Usar el cuerpo para explicar el *porqué*, no el *qué*.
```

Cuando la investigación especifica un dominio, la conclusión puede ser una síntesis de las categorías en lugar de una lista de reglas. En ese caso, la conclusión resume cómo se organizan las categorías y qué cubre cada una.

## Adaptabilidad del patrón

El patrón no es rígido. Las investigaciones puramente técnicas pueden omitir la evaluación comparativa y ir directamente de análisis a recomendación. Las investigaciones de formato pueden incluir un formato o procedimiento detallado con plantilla y ejemplos. Las investigaciones que especifican un dominio añaden `Alcance`, `Entradas` y `Salidas`. El patrón se adapta al tipo de pregunta, pero siempre mantiene: fecha, propósito, hallazgos con fuentes, y referencias.
