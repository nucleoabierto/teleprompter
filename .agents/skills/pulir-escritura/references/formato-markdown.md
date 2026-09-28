# Formato Markdown y edición objetiva de estructura

## Formato Markdown

Aplicar cuando el texto esté en Markdown:

- **Encabezados ATX** (`#`, `##`, `###`), sin saltar niveles. No terminar con signo de puntuación.
- **Un solo H1** por documento.
- **Líneas en blanco** antes y después de cada encabezado, lista, bloque de código, cita y tabla.
- **Tablas** solo para datos tabulares compactos: celdas con pocas palabras, estructura regular, todas las filas con el mismo número de columnas. Una tabla no es la opción correcta cuando:
  - Una celda necesita más de un par de frases.
  - Una celda contiene listas, párrafos o bloques de código.
  - Las columnas no son comparables entre sí (cada fila tendría un tipo de dato distinto).
  - La tabla tiene una sola columna de contenido (es una lista, no una tabla).
  - La tabla tiene una sola fila de datos (la información es un párrafo o una lista, no una comparación).
  - El contenido es una secuencia de pasos o instrucciones (es una lista ordenada).
  En esos casos, sustituir por una lista anidada, una lista de definición o encabezados con texto.
- **Listas** con marcador único `-`. Indentar elementos anidados con dos espacios.
- **Negritas** (`**`) solo para términos que se introducen o avisos críticos. No como sustituto de encabezados. No bloques enteros en negrita.
- **Cursivas** (`*`) para énfasis ligero, títulos de obras, extranjerismos no adaptados y metalenguaje. No combinar estilos en línea en el mismo fragmento.
- **Emojis** al mínimo. No depender solo de ellos para indicar estado o tipo.
- **Índice** en documentos de más de 3-4 pantallas. Preferir generación automática sobre manual.
- **Consistencia** de estilo en todo el documento.

## Edición objetiva de estructura

Reglas objetivas sobre la presentación del texto. No reescribe ni reorganiza ideas. La evaluación cualitativa corresponde a la revisión de redacción.

- **Párrafos largos:** detectar los que superen 10 líneas o 150 palabras. Si hay un punto natural objetivo, partir ahí; si no, señalar.
- **Párrafos de una sola oración:** detectar los de una sola oración breve (menos de 10 palabras) sin función narrativa. Señalar para posible fusión.
- **Oraciones largas:** detectar las que superen 40 palabras con subordinación abundante o más de dos incisos. Señalar sin reescribir. Aplicar correcciones de puntuación si las hay.
- **Espaciado entre párrafos:** unificar (un salto de línea en texto plano, o una línea en blanco en Markdown).
