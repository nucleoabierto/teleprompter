---
name: investigar
description: >
  Realiza una investigación: descubre, analiza y sintetiza información sobre
  un tema, y produce un documento con conclusiones justificadas, referencias
  verificables y marca temporal.
  Usar cuando se pida investigar un tema, analizar opciones, comparar
  enfoques, recopilar mejores prácticas, especificar requisitos o verificar
  una hipótesis concreta con evidencia.
  Sinónimos: investigar, analizar, recopilar, comparar opciones, estudiar,
  verificar hipótesis, revisar estado del arte, especificar requisitos.
---

# Investigar

Instrucciones para que un agente realice una investigación: descubra, analice y sintetice información sobre un tema, y produzca un documento con conclusiones justificadas, referencias verificables y marca temporal.

## Cuándo usar

- Cuando se pida investigar un tema, formato, convención o mejor práctica.
- Cuando se necesite comparar enfoques u opciones antes de tomar una decisión.
- Cuando se quiera recopilar y sintetizar mejores prácticas de múltiples fuentes.
- Cuando se necesite especificar los requisitos de un dominio para un componente.
- Cuando una tarea requiera una investigación previa.

## Cuándo no usar

- Para responder una pregunta de chat con conocimiento del modelo: basta con una respuesta directa.
- Para buscar un dato concreto que una sola búsqueda resuelve: usar búsqueda web directamente.
- Para ejecutar un cambio en el proyecto: usar el skill correspondiente.
- Para registrar una decisión de diseño: la investigación precede a la decisión, pero no la registra.

## Entrada

- La pregunta o tema a investigar, formulada por el usuario o por la tarea que la motiva.
- El directorio de investigaciones del proyecto, acordado con el usuario o inferido de la convención del proyecto, para consultar investigaciones existentes y evitar duplicar trabajo.
- Acceso a búsqueda web y recuperación de páginas para recopilar fuentes.

## Salida

- Un documento de investigación en el directorio de investigaciones del proyecto, con el patrón definido en este skill, según el tipo de investigación.
- Nombre de archivo en formato `yyyy-mm-titulo.md` (p. ej., `2026-09-mejores-practicas-commits.md`).
- Marca temporal (año-mes) al principio del documento.
- Cada afirmación sustantiva con su fuente atribuible.

## Principios rectores

1. **Trazabilidad de fuentes:** cada afirmación sustantiva del documento final tiene una fuente atribuible. Si no hay fuente, la afirmación no entra o se marca explícitamente como inferencia del agente.
2. **Compresión al leer:** extraer y comprimir la información relevante en cuanto se lee, no acumular texto en bruto para resumir al final. El contexto de trabajo contiene afirmaciones estructuradas con su fuente, no documentos en bruto.
3. **Preferencia por fuentes primarias:** primaria sobre secundaria, reciente sobre antigua, específica sobre genérica, autorizada sobre agregadora.
4. **Calibración de la incertidumbre:** marcar lagunas, afirmaciones disputadas y límites del análisis. El agente tiene permiso explícito para omitir y para decir «no se pudo determinar».
5. **Condiciones de parada explícitas:** parar cuando las subpreguntas están cubiertas, cuando las búsquedas nuevas devuelven rendimientos decrecientes, o cuando se alcanza el presupuesto acordado con el usuario.
6. **Separación de exploración y síntesis:** primero recopilar evidencia, luego sintetizar el documento. No mezclar las dos fases.
7. **Marca temporal:** toda investigación incluye una marca temporal (año-mes) que permite al lector valorar si el conocimiento sigue vigente o ha cambiado.

## Tipos de investigación

El skill distingue dos tipos según la pregunta que responden. El tipo determina el procedimiento, las condiciones de parada y el formato de salida.

### Abierta (comparación de opciones)

La pregunta es amplia, con múltiples respuestas posibles. El agente debe descubrir qué aspectos investigar, comparar enfoques y proponer una recomendación.

- **Búsqueda divergente:** el agente amplía el alcance a medida que descubre nuevos ángulos.
- **Sin definición cerrada de «hecho»:** las condiciones de parada son un problema de diseño.
- **Calidad medida por:** cobertura, fidelidad de citas y calibración de la incertidumbre.
- **Ejemplos:** «¿Qué biblioteca de autenticación usar?», «¿Qué formato de configuración adoptar?», «¿Qué arquitectura de mensajería conviene a este sistema?».

### Dirigida (síntesis de mejores prácticas o especificación de un dominio)

La pregunta es concreta sobre mejores prácticas, convenciones o especificaciones. El agente recopila evidencia de múltiples fuentes y la sintetiza en principios estructurados. Cuando la pregunta pide especificar un dominio para un componente, se añaden las secciones extensibles (`Alcance`, `Entradas`, `Salidas`) a la plantilla.

- **Búsqueda convergente:** el agente se enfoca en recopilar y sintetizar.
- **Definición más clara de «hecho»:** la síntesis está respaldada por las fuentes o no lo está.
- **Calidad medida por:** precisión, fidelidad de citas y solidez de la evidencia.
- **Ejemplos:** «¿Cuáles son las mejores prácticas para manejo de errores?», «¿Qué debe validar un linter de Python?», «¿Qué normativa aplica a la corrección de textos en español?».

## Procedimiento

### 1. Definir el alcance

1. **Identificar el tipo de investigación** (abierta o dirigida) según las definiciones anteriores.
2. **Descomponer la pregunta en subpreguntas** si es abierta. Cada subpregunta debe tener un alcance acotado y no solapar con las demás.
3. **Acordar la profundidad con el usuario** si el arnés lo permite. Los niveles sugeridos:
   - **Rápida:** 1-2 búsquedas por subpregunta, una fuente por afirmación. Para preguntas acotadas.
   - **Media:** 2-3 búsquedas por subpregunta, 2-3 fuentes por afirmación clave. Para preguntas de complejidad moderada.
   - **Profunda:** 3-5 búsquedas por subpregunta, múltiples fuentes por afirmación, evaluación comparativa completa. Para preguntas complejas o de alto impacto.
   Si no se puede acordar, asumir profundidad media.
4. **Consultar el directorio de investigaciones del proyecto** para verificar si ya existe una investigación sobre el tema o uno relacionado. Si existe y está vigente según su marca temporal, referenciarla en lugar de duplicar.

### 2. Buscar y recopilar

5. **Formular búsquedas específicas.** Usar palabras clave, no lenguaje natural. Incluir marcadores temporales cuando la pregunta sea sobre estado actual. Probar consultas distintas si los primeros resultados no son prometedores.
6. **Leer los fragmentos de todos los resultados** antes de decidir cuáles recuperar completos. Los fragmentos son baratos y revelan resultados relevantes que el título no muestra.
7. **Recuperar las fuentes más prometedoras** (2-3 por subpregunta en profundidad media). Leer el contenido completo.
8. **Extraer afirmaciones al leer.** Por cada fuente, identificar las afirmaciones relevantes para la subpregunta y registrarlas junto con la fuente (autor o dominio, título, URL). No acumular texto en bruto: extraer y comprimir.
9. **Preferir fuentes primarias.** Si una fuente secundaria resume una primaria, buscar la primaria y citarla directamente. Si la primaria no es accesible, citar la secundaria y marcar la limitación.
10. **Reformular búsquedas si es necesario.** Si una subpregunta no encuentra respuestas satisfactorias, reformular la consulta o descomponer la subpregunta en términos más específicos.

### 3. Analizar

11. **Agrupar las afirmaciones por subpregunta o por tema.** Identificar convergencias (varias fuentes dicen lo mismo) y divergencias (fuentes en desacuerdo).
12. **Evaluar las opciones o enfoques** si la investigación es abierta y compara alternativas. Para cada opción, listar ventajas y desventajas.
13. **Comparar las opciones contra criterios relevantes** si hay tres o más opciones y la comparación aporta claridad. Usar lista anidada por defecto; usar tabla solo si las celdas contienen una o dos palabras y la estructura es regular.
14. **Organizar por categorías** si la investigación es de requisitos. Agrupar la normativa y recomendaciones por niveles o secciones del dominio.
15. **Identificar lagunas.** Marcar qué subpreguntas no tienen respuesta suficiente, qué fuentes no se pudieron acceder, qué afirmaciones están disputadas.

### 4. Sintetizar

16. **Redactar el documento** siguiendo el patrón de `references/patron-investigacion.md`. Usar la estructura correspondiente al tipo:
    - **Abierta:** Fecha, Propósito, Contexto (si aplica), Análisis, Evaluación comparativa (si aplica), Recomendación, Formato o procedimiento (si aplica), Limitaciones (si aplica), Referencias.
    - **Dirigida:** Fecha, Propósito, Alcance (obligatoria si especifica un dominio), Entradas (si aplica), Salidas (si aplica), Hallazgos, Conclusión, Limitaciones (si aplica), Referencias.
17. **Preservar la atribución.** Cada afirmación sustantiva del documento debe tener su fuente citada. Si una afirmación no tiene fuente, omitirla o marcarla como inferencia.
18. **Justificar la recomendación.** En investigaciones abiertas, explicar por qué la opción elegida supera a las demás, no solo describirla.
19. **Declarar la incertidumbre.** Incluir las lagunas, las afirmaciones disputadas y los límites del análisis en la sección `Limitaciones`.
20. **Mantener un tono técnico, directo y neutral.** Sin adornos ni retórica. Cada párrafo desarrolla una idea principal.

### 5. Revisar y presentar

21. **Revisar la redacción y pulir mecánicamente** el borrador antes de presentarlo al usuario. Si el arnés dispone de skills o herramientas de revisión de redacción y pulido mecánico, invocarlos en modo preventivo. Si no, aplicar manualmente los criterios mínimos: verificar ortografía y tildes, consistencia de comillas y formato, estructura de encabezados, y que cada párrafo desarrolle una idea principal.
22. **Presentar el documento al usuario** para aprobación. Si solicita cambios, ajustar y repetir desde el paso correspondiente. Si lo rechaza, no crear archivo y terminar.
23. **Tras la aprobación, crear el archivo** en el directorio de investigaciones del proyecto con nombre en formato `yyyy-mm-titulo.md` (p. ej., `2026-09-mejores-practicas-commits.md`).

## Condiciones de parada

La investigación termina cuando se cumple alguna de estas condiciones:

- **Cobertura:** todas las subpreguntas están investigadas a profundidad aceptable.
- **Rendimientos decrecientes:** las búsquedas nuevas devuelven las mismas fuentes o afirmaciones ya cubiertas.
- **Presupuesto:** se alcanza el techo de búsquedas o de tiempo acordado con el usuario.
- **Rechazo del usuario:** el usuario decide que la pregunta no necesita más investigación.

No parar demasiado pronto: si una subpregunta clave no tiene respuesta, intentar reformular la búsqueda antes de concluir. No parar demasiado tarde: si las búsquedas nuevas no aportan información nueva, sintetizar con lo que se tiene y declarar las lagunas.

## Formato de salida

El documento de investigación sigue el patrón definido en `references/patron-investigacion.md`, que contiene las plantillas para cada tipo, con la estructura de cada sección y ejemplos incrustados.

Las secciones obligatorias según el tipo:

- **Abierta:** Fecha, Propósito, Análisis, Recomendación, Referencias. (Contexto, Evaluación comparativa, Formato o procedimiento y Limitaciones son opcionales según la pregunta.)
- **Dirigida:** Fecha, Propósito, Hallazgos, Conclusión, Referencias. (Alcance, Entradas, Salidas y Limitaciones son opcionales según la pregunta.)

Ver `references/ejemplos-buenos-malos.md` para ejemplos de investigaciones buenas y malas, con explicación de qué las hace buenas o malas.

## Finalización

El skill ha terminado cuando:

- El usuario ha aprobado el documento.
- El archivo está creado en el directorio de investigaciones del proyecto, con nombre `yyyy-mm-titulo.md`.
- El documento incluye la marca temporal.
- Cada afirmación sustantiva tiene su fuente citada.
- El documento sigue el patrón según su tipo.
- Las lagunas y limitaciones están declaradas.

## Referencias

- `references/patron-investigacion.md` — Plantillas para cada tipo de investigación, con la estructura de cada sección y ejemplos incrustados. Leer al redactar el documento.
- `references/ejemplos-buenos-malos.md` — Ejemplos de investigaciones buenas y malas, con explicación de qué las hace buenas o malas. Leer cuando haya duda sobre la calidad esperada.
