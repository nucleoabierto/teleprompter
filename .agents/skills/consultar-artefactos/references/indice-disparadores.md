# Reglas del índice por disparadores

Reglas del artefacto «índice por disparadores»: los `README.md` que indexan las entradas de un directorio por sus disparadores (hoy el índice de decisiones en `docs/decisions/README.md` y el de lecciones en `docs/lessons/README.md`). Hogar: `consultar-artefactos`, único gestor que lo opera (su escritura no está delegada: los consumidores añaden entradas directamente y este documento les sirve de guía de formato).

## Ubicación y literales

- Cada directorio indexado lleva su `README.md` como índice: `docs/decisions/README.md`, `docs/lessons/README.md`.
- Los literales llevan los valores por defecto de la convención; un proyecto que difiere los edita aquí.

## Formato del artefacto

- Una entrada por documento indexado: la línea de primer nivel `- <archivo>` con el nombre del archivo.
- Sus datos van en subviñetas sangradas: `  - Disparadores: <lista>`, `  - Resumen: <una frase>` y `  - Estado: <estado>` opcional. La escritura declara `Disparadores` siempre en primera posición (para que una búsqueda los encuentre sin arrastrar el resumen); la lectura no exige ese orden.
- Los bloques de comentario `<!--`…`-->` documentan el formato y no son entradas.

## Operación de lectura

Índice ausente: fallo. Sin coincidencias: vacío legítimo.

### `coincidencias <término>…`

`archivo<TAB>estado<TAB>resumen` por cada entrada cuya línea `  - Disparadores: <lista>` (la línea completa, incluido el propio nombre del campo) contiene algún `<término>` como subcadena, insensible a mayúsculas (una línea por entrada aunque casen varios términos, en el orden del índice); `estado` va vacío cuando la entrada no lo declara. Los bloques de comentario `<!--`…`-->` se ignoran por completo. La coincidencia es léxica: el cotejo semántico (qué entradas vigentes proceden) es juicio del consumidor.
