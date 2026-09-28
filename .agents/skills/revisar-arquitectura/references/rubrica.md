# Rúbrica de revisión de arquitectura

Criterios de evaluación y catálogo de patrones y antipatrones para `revisar-arquitectura`. La rúbrica es abierta y extensible: los criterios son orientativos, no una taxonomía cerrada; cuando un dominio real presente una dimensión no cubierta, se evalúa y se añade al catálogo.

## Criterios de evaluación

Cada criterio se evalúa con evidencia del código y de `docs/domains/`, y recibe un veredicto: correcto, mejorable, deficiente o no evaluable, con su nivel de confianza.

### Lenguaje ubicuo

- ¿Los nombres del código (módulos, funciones, entidades, variables de dominio) coinciden con los términos del glosario del dominio?
- ¿Hay términos genéricos (`Entity`, `Item`, `Data`, `Manager`, `Helper`) donde el dominio tiene un nombre propio?
- ¿Hay sinónimos dispersos: dos nombres de código para el mismo concepto del glosario, o un mismo nombre para dos conceptos distintos?
- Detección: mecánica en parte —los términos del glosario están anclados a elementos de código; si el ancla ya no materializa el término, hay divergencia.

### Separación de capas

- ¿El modelo de dominio (entidades, invariantes, reglas) está separado de la infraestructura (persistencia, I/O) y de la presentación (UI, renderizado)?
- Si el dominio usa capas, la dirección correcta es infraestructura/presentación → dominio, nunca al revés; si el dominio no se organiza por capas, el criterio se evalúa como separación del modelo frente a detalles externos, o se declara «no evaluable».
- Antipatrón de referencia: *smart UI* —la lógica del dominio vive en la capa de presentación [1].

### Fronteras del contexto

- ¿Las fronteras declaradas en el documento de dominio (qué entra, qué queda fuera) se respetan en el código?
- ¿Hay fuga de modelo: conceptos de un dominio usados dentro de otro sin traducción, o «shared kernels» accidentales?
- Detección: comparar las fronteras documentadas con las dependencias reales del código.

### Invariantes y modelo

- ¿Cada invariante documentada tiene un defensor claro en el código (un solo lugar que la hace cumplir)?
- ¿Las entidades llevan comportamiento o son bolsas de datos anémicas manipuladas desde fuera?
- ¿Las operaciones del dominio están localizadas o dispersas por varios componentes?

### Acoplamiento y estructura

- ¿Hay dependencias cíclicas entre componentes? (detección mecánica: grafo de dependencias + algoritmo de ciclos)
- ¿Hay componentes que concentran varias responsabilidades arquitectónicas?
- ¿Hay funcionalidad del mismo dominio dispersa en componentes sin relación?
- Los umbrales son relativos al tamaño del sistema, no universales.

## Catálogo de patrones y antipatrones

Catálogo inicial, organizado por nivel. Es deliberadamente un subconjunto: cubre los smells arquitectónicos y los de diseño ligados al dominio, y deja fuera los smells de implementación (método largo, shotgun surgery, etc.), que corresponden a la revisión de código de cada tarea, no a esta. Cada entrada: nombre, nivel, señal de detección y estrategia.

### Nivel arquitectónico (grafo de dependencias entre componentes)

- **Dependencia cíclica:** dos o más componentes se dependen mutuamente, directa o transitivamente. Detección mecánica: componentes fuertemente conexos en el grafo de dependencias.
- **Componente dios (god component):** un componente excesivamente grande en relación con el resto del sistema. Detección: tamaño relativo, no umbral absoluto.
- **Concentración de características (feature concentration):** un componente realiza más de una preocupación arquitectónica (p. ej., dominio + persistencia + presentación). Detección: juicio sobre las responsabilidades mezcladas.
- **Funcionalidad dispersa (scattered functionality):** varios componentes no relacionados realizan la misma preocupación del dominio.
- **Dependencia inestable:** un componente depende de otros menos estables que él.
- **Interfaz ambigua:** un componente ofrece un único punto de entrada general que no declara sus capacidades.
- **Estructura densa / dependencia en hub:** dependencias excesivas sin estructura, o un componente por el que pasa todo.

### Nivel de diseño (violaciones de principios del dominio)

- **Modelo de dominio anémico:** las entidades son bolsas de datos y la lógica vive en servicios o en la capa de aplicación.
- **Feature envy:** un componente manipula más los datos de otro que los propios.
- **Fuga de lenguaje:** términos técnicos o de infraestructura (`localStorage`, `JSON`, `DOM`) aparecen en la capa de dominio.

### Nivel de juicio (requieren contexto, no mecánicos)

- **Abstracción prematura:** generalización sin un segundo caso de uso que la justifique.
- **Lava flow:** código muerto o prototípico que quedó integrado sin propósito claro.
- **Frontera difusa:** responsabilidades que cruzan la frontera declarada del dominio sin que nadie lo haya decidido.

## Formato de cada hallazgo

Todo hallazgo se reporta como orden de reparación, no como observación vaga:

- **Criterio o patrón:** qué elemento de la rúbrica se viola.
- **Evidencia:** elemento(s) de código y documento de dominio donde se observa.
- **Objetivo:** qué debería ser cierto tras la corrección.
- **Restricciones:** qué debe respetarse (decisiones registradas, fuera de alcance, compatibilidad).
- **Validación:** cómo comprobar que la corrección surtió efecto.
- **Confianza:** alta / media / baja, según cuánta evidencia soporta el hallazgo.
- **Derivado en:** ruta de la tarea o decisión que materializó el hallazgo; queda vacío hasta que el usuario apruebe la derivación.

## Referencias

- [1] Eric Evans, *Domain-Driven Design* (2003) — origen del antipatrón *smart UI* y de los patrones tácticos que usa la rúbrica.
