# Categorías de forma de solución

Referencia del skill `proponer-forma-solucion`. Define las categorías en que puede caer la forma de una solución, la lista de verificación del nivel de abstracción y un ejemplo completo.

## Categorías

La forma de solución cae en una de estas categorías. La lista no es cerrada ni canónica: si una solución real no encaja en ninguna, se propone la categoría nueva con su definición y se valida con el usuario en lugar de forzar el encaje. La categoría orienta el refinamiento posterior: un flujo nuevo suele descomponerse en más tareas que un paso nuevo en un flujo existente.

### Cambio de UX

Cambia cómo se recorre un flujo existente sin añadir pantallas ni pasos: orden de pasos, valores por defecto, confirmaciones, mensajes, estados vacíos.

- Señal: el usuario hace lo mismo, pero con menos fricción o menos errores.

### Cambio de UI

Cambia la presentación de algo existente sin alterar el flujo: disposición de elementos, información visible, legibilidad, jerarquía visual.

- Señal: el usuario recorre el mismo flujo, pero percibe o entiende distinto lo que ve.

### Flujo nuevo

Añade un recorrido completo que no existe: una secuencia de pasos nueva para un objetivo que hoy no tiene camino en el producto.

- Señal: hoy el objetivo no se puede lograr dentro del producto, o se logra saliendo de él.

### Paso nuevo en un flujo existente

Inserta un paso en un flujo que ya existe: una validación, una elección, una confirmación, un punto de decisión.

- Señal: el flujo existe y funciona; le falta un eslabón.

### Cambio de proceso

Cambia cómo se hace un trabajo entre bastidores, sin tocar lo que el usuario ve ni recorre: automatizar un paso manual, cambiar un orden de operaciones interno, aplicar una política, capturar o producir información nueva.

- Señal: el resultado llega al usuario igual que antes, pero el trabajo interno que lo produce cambia.

### Fuera de alcance

La forma correcta de resolver el problema no pasa por este producto: corresponde a otro sistema, a un proceso humano o a no hacer nada.

- Señal: encajar la solución aquí exigiría deformar el propósito del producto, o el problema ya se resuelve mejor fuera.
- Si la categoría es esta, no hay alternativas ni fuera de alcance que listar: se justifica la conclusión y la capacidad termina.

## Lista de verificación del nivel de abstracción

Antes de presentar la forma de solución, verificar cada punto:

- [ ] El texto no menciona artefactos de implementación: archivos, funciones, clases, comandos, bibliotecas, esquemas, endpoints.
- [ ] El texto describe qué cambia para quien usa el producto, no qué se construye.
- [ ] El texto cabe en un párrafo: si necesita más, probablemente baja de nivel o mezcla varias formas.
- [ ] La categoría asignada es una sola. Si la solución parece caer en dos, elegir la dominante y mover la otra al fuera de alcance o a las alternativas.
- [ ] Las alternativas son formas distintas de resolver el mismo problema, no variantes de la elegida.
- [ ] Cada alternativa declara la razón de su rechazo en términos del problema, no de la implementación.
- [ ] El fuera de alcance lista lo que un lector razonable podría dar por incluido, no lo obvio.

## Ejemplo

**Problema validado:** el índice de lecciones aprendidas se mantiene a mano y la actualización manual se olvida o se hace de forma inconsistente; como el índice es el punto de entrada para recuperar lecciones aplicables a una tarea, una entrada ausente hace que el aprendizaje acumulado no se aproveche.

**Mala forma de solución (baja de nivel):**

> Crear un script en Python que recorra `docs/lessons/`, analice cada nota con expresiones regulares y regenere `README.md` invocándolo desde un hook de git.

Menciona lenguaje, mecanismo de parseo y mecanismo de ejecución: son decisiones de implementación que corresponden al refinamiento.

**Buena forma de solución:**

> Al consolidar lecciones, el índice se regenera a partir de las notas existentes en lugar de depender de que quien consolida lo actualice a mano. Categoría: cambio de proceso.

**Alternativas consideradas:**

- Recordatorio en el índice (cambio de UI): un aviso que pida revisar el índice al consolidar. Se descarta porque sigue dependiendo de la memoria y la disciplina, que es justo lo que falla hoy.
- Generación bajo demanda al leer (flujo nuevo): que quien recupera lecciones reconstruya el índice cada vez. Se descarta porque convierte cada consulta en una regeneración, más costosa y menos inspeccionable que mantener el índice como archivo.

**Fuera de alcance:**

- Validar la calidad del contenido de las entradas del índice (resúmenes o disparadores mal redactados).
- Regenerar los índices de otros directorios del proyecto que se mantengan a mano.
