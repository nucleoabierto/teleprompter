---
name: pulir-escritura
description: >
  Pule mecánicamente un texto en español corrigiendo ortografía, gramática
  evidente, puntuación, tipografía y formato Markdown, y aplicando edición
  objetiva de estructura, sin alterar el estilo ni el contenido.
  Tiene dos modos: preventivo (pule el borrador propio antes de escribirlo
  al archivo o presentarlo al usuario) y reactivo (pule un texto externo y
  escribe el texto corregido directamente en el archivo).
  Usar antes de escribir documentos o ideas largas consolidadas: informes,
  resultados de investigación, conclusiones, resúmenes extensos o cualquier
  texto que sintetice información de forma estructurada. También cuando se
  necesite corregir un texto existente.
  Requiere una revisión de redacción previa.
  Sinónimos: pulido mecánico, corrección ortotipográfica y de formato,
  normalización de texto.
---

# Pulir escritura

Instrucciones para que un agente pula mecánicamente un texto en español, corrigiendo ortografía, gramática evidente, puntuación, tipografía y formato, sin alterar el estilo ni el contenido. El skill opera en dos modos: preventivo y reactivo.

## Dependencia

El texto debe haber pasado por una revisión de redacción. Si no lo ha hecho, delegar primero al skill de revisión de redacción y aplicar el pulido sobre el resultado.

## Modos de uso

### Modo preventivo

El agente pula su propio borrador antes de escribirlo al archivo o presentarlo al usuario. Este modo se aplica de forma proactiva, sin que el usuario lo solicite.

**Cuándo activarlo:** antes de presentar texto consolidado o de alta densidad informativa. Esto incluye informes, resultados de investigación, conclusiones, documentos, resúmenes extensos o cualquier texto que sintetice ideas de forma estructurada.

**Cuándo ignorarlo:** mensajes de chat breves, respuestas puntuales, confirmaciones o texto que no consolida información.

**Salida:** el texto pulido, escrito directamente en el archivo o presentado al usuario. No produce un informe de cambios.

### Modo reactivo

El agente pule un texto proporcionado por el usuario y escribe el texto corregido directamente en el archivo.

**Cuándo activarlo:** cuando el usuario solicita una corrección ortotipográfica o de formato sobre un texto.

**Salida:** el texto corregido, escrito directamente en el archivo. No devuelve un informe separado.

## Cuándo no usar

- Para evaluar o mejorar el estilo (claridad, concisión, coherencia, cohesión, tono, riqueza léxica): usar el skill de revisión de redacción.
- Para reorganizar el orden de las ideas o reformular la progresión temática.
- Para evaluar el contenido, la veracidad o la calidad sustantiva de las ideas.

## Entrada

- Un texto en español, o la ruta a un archivo que lo contenga.
- Opcionalmente, un libro de estilo o criterios editoriales específicos. Si no se proporciona, se aplican las normas de la RAE y las recomendaciones de la Fundéu.

## Criterios de aplicación

- **Corrección directa:** los errores normativos inequívocos se corrigen directamente en el texto.
- **Casos dudosos:** cuando una corrección es ambigua o admite múltiples interpretaciones, se señala sin aplicar. El pulido mecánico solo corrige los errores que admiten una única solución normativa.
- **Consistencia sobre preferencia:** cuando no hay una norma estricta, se unifica el criterio a lo largo del texto, eligiendo la opción más frecuente o la recomendada por la RAE/Fundéu.
- **Mínima intervención:** se corrige solo lo necesario; no se reescriben oraciones ni se altera la estructura del texto.
- **Respeto a la voz del autor:** no se modifican elecciones estilísticas legítimas.

Se entiende por edición objetiva de estructura aquella que aplica reglas mecánicas verificables (longitud de párrafo, longitud de oración, espaciado, formato) sin emitir juicios sobre el orden argumental o la formulación de las ideas.

## Qué corrige y señala

Para el detalle de correcciones por categoría (ortografía, gramática evidente, puntuación, tipografía y ortotipografía), leer `references/categorias.md`.

Para las reglas de formato Markdown y edición objetiva de estructura, leer `references/formato-markdown.md`.

## Qué no corrige

- **Estilo:** no evalúa ni modifica la claridad, la concisión, la coherencia, la cohesión, el tono ni la riqueza léxica. Estos son principios subjetivos propios de la revisión de redacción.
- **Estructura del discurso y reescritura:** no reorganiza el orden de las ideas ni reformula oraciones para mejorar su redacción. Solo aplica reglas objetivas de edición (partir párrafos largos en puntos naturales, señalar oraciones excesivamente largas, unificar espaciado y formato).
- **Contenido:** no evalúa la veracidad, la originalidad ni la calidad sustantiva de las ideas.
- **Voz del autor:** no altera la voz ni el estilo del autor.

## Procedimiento

1. **Verificar la dependencia:** confirmar que el texto ha pasado por una revisión de redacción. Si no es así, delegar al skill de revisión de redacción y aplicar el pulido sobre el resultado.
2. **Leer el texto completo** una vez para identificar el criterio tipográfico predominante (tipo de comillas, uso de cursivas, estilo de cifras) y si el texto está en Markdown.
3. **Recorrer el texto** aplicando las correcciones en el siguiente orden. Los casos dudosos que surjan en cada fase se señalan sin aplicar:
   1. Ortografía (letras, tildes, unión/separación, mayúsculas).
   2. Gramática evidente (concordancia, régimen, tiempos verbales, pronombres).
   3. Puntuación (signos, comas, posición).
   4. Tipografía y ortotipografía (comillas, guiones, cursivas, espacios, abreviaturas, cifras, consistencia).
   5. Formato Markdown (encabezados, tablas frente a listas, negritas, cursivas, emojis, índice, consistencia de estilo), solo si el texto está en Markdown.
   6. Edición objetiva de estructura (partir párrafos largos en puntos naturales, señalar oraciones excesivamente largas, unificar espaciado y formato).
4. **Escribir el texto corregido** directamente en el archivo.

## Finalización

El skill ha terminado cuando se han completado todos los pasos del procedimiento y el texto corregido está escrito en el archivo.
