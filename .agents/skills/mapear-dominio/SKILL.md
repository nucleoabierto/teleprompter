---
name: mapear-dominio
description: >-
  Elabora una guía de dominio DDD estratégica autocontenida en disco
  (subdominios, bounded contexts, mapas de contexto, arqueología de código,
  comportamiento en ejecución y evaluación). Úsala cuando el equipo necesite
  una referencia de estudio persistente de límites de dominio; no la uses para
  radares de deuda técnica, PRDs, deep-dive puntual o diseño táctico profundo.
---

## Uso rápido

Invoca el skill con los parámetros en el orden indicado: `domain-mapping "<scope>" "<taskFolder>" ["<sourcesHint>"] [<mapState>] [<splitMode>]`. Por ejemplo, `domain-mapping "checkout" "docs/domain-maps/checkout" "src/sales, src/payments" "AS_IS"` inicia el mapeo del dominio de checkout enfocándose en los directorios de ventas y pagos. El parámetro `taskFolder` es obligatorio y debes solicitarlo si no se proporciona, ya que nunca debes escribir en la raíz del repositorio. El estado del mapa (`mapState`) por defecto es `AS_IS` para documentar el estado actual, y solo debes usar `TO_BE` cuando el usuario solicite explícitamente un rediseño. El modo de división (`splitMode`) se determina durante la fase de inventario según el tamaño y complejidad del dominio, por lo que no es necesario definirlo al inicio.

## Propósito

Este skill elabora una guía de dominio DDD estratégica autocontenida y revisable en disco para un producto, módulo o área específica. El objetivo principal es crear una referencia persistente que capture subdominios, bounded contexts, mapas de contexto, lenguaje ubicuo, arqueología de código, comportamiento en ejecución y evaluación del dominio. Es importante destacar que este skill no ejecuta workflows de refinement, execution o refactor, ni modifica el código de producto. La salida principal es el archivo `domain-map.md` (y sus partes enlazadas) dentro de un `taskFolder` acordado con el usuario.

No debes utilizar este skill para inventarios de deuda técnica orientados a correcciones, ya que existen skills específicos para análisis de cambios. Tampoco está diseñado para responder preguntas puntuales sin generar un mapa persistente, para crear PRDs de features, para realizar diseño táctico profundo (agregados, entidades, repositorios detallados) como cuerpo principal, ni para elaborar mapas organizativos complejos o Team Topologies completos como objetivo principal, aunque puedes incluir un anexo breve si hay evidencia clara de equipos.

## Cuándo usarlo y cuándo no

Debes usar este skill cuando el equipo necesite una guía de dominio persistente en disco que incluya subdominios, bounded contexts, mapas de contexto, lenguaje ubicuo, arqueología de código, comportamiento en ejecución y evaluación. Esta guía sirve como referencia de estudio duradera para entender los límites del dominio y cómo los diferentes contextos interactúan entre sí.

No debes usar este skill cuando el objetivo sea un inventario de deuda técnica orientado a correcciones, ya que para eso existen skills específicos de análisis de cambios. Tampoco es apropiado cuando se necesita modificar código o ejecutar refactor, ya que este skill es puramente analítico y documental. Si el usuario tiene una pregunta puntual sin interés en generar un mapa persistente, este skill no es el adecuado. Para PRDs o definición de features existen otros skills especializados, y este no debe usarse para diseño táctico profundo como cuerpo principal, aunque puede incluir anexos breves si es necesario. Finalmente, no está diseñado para crear mapas organizativos o Team Topologies completos como objetivo principal, aunque puedes incluir un anexo breve si hay evidencia clara de equipos.

Si el pedido del usuario cae en alguna de las categorías de "No", debes abortar con una frase que contraste claramente lo pedido con lo que hace este skill, y para encontrar el atajo correcto puedes usar `/help`.

## Entrada y salida

Las entradas requeridas para este skill son el `scope` (string obligatorio que define el producto, módulo o área a mapear) y el `taskFolder` (path obligatorio que indica la carpeta donde escribir la documentación, la cual debes solicitar si no se proporciona y nunca debe ser la raíz del repositorio). Opcionalmente puedes recibir un `sourcesHint` (string) para priorizar rutas o temas específicos, un `mapState` que puede ser `AS_IS` o `TO_BE` (con default `AS_IS`, usando `TO_BE` solo si el usuario solicita explícitamente un rediseño), y un `splitMode` que puede ser `single`, `by-domain` o `by-size` (el cual se decide durante la fase de inventario).

La salida principal es el archivo canónico `domain-map.md` en la raíz de `taskFolder`, complementado con archivos de apoyo como `domain_map_process/session.md` y `domain_map_process/context.md`. Dependiendo del tamaño y complejidad del dominio, puedes generar partes opcionales como `domain-map/<slug>.md` o `domain-map/bc-<slug>.md` que se enlazan desde el índice. Finalmente, debes incluir un bloque de evaluación de salida dentro de `domain-map.md` (o del índice si hay división) que contenga la rúbrica de evaluación y el estado `Listo para`.

## Convenciones locales

Debes trabajar siempre con archivos locales o directamente en el chat. Cuando el usuario proporciona una ruta de archivo como fuente, debes leerla usando la herramienta `read`. Si falta el parámetro `taskFolder`, debes solicitarlo al usuario y nunca escribir el archivo canónico en la raíz del repositorio. De igual manera, si falta el `scope`, debes pedirlo al usuario en lugar de inventar el dominio completo. Los archivos de apoyo deben persistirse en el directorio `domain_map_process/` mientras que el archivo canónico debe ser `domain-map.md`. Para estructurar las secciones canónicas, debes usar como guía los templates en `templates/`, eligiendo entre `domain-map-template-single.md` (dominios simples), `domain-map-template-divided.md` (dominios complejos) o consultando `domain-map-examples.md` para referencias de ejemplos completos.

## Referencias compartidas

| Referencia | Rol |
|------------|-----|
| [file-discovery.md](references/file-discovery.md) | Resolución de entradas (Fase 0) |

## Estrategia de fallo

Cuando te encuentres con situaciones que requieren manejo especial, sigue estas directrices. Si falta el `scope`, debes pedir el alcance al usuario en lugar de inventar el dominio. Si falta el `taskFolder`, solicita la ruta y nunca escribas en la raíz del repositorio. Cuando la evidencia sea insuficiente, mapea solo lo observable y marca claramente los supuestos, evitando inventar bounded contexts sin evidencia. Si parece haber un solo contexto, debes crear un canvas completo con justificación de por qué no se divide el dominio. Cuando el mapa crezca o haya dos o más dominios, debes proponer la división, migrar a la estructura `domain-map/` y actualizar el índice. Si alguna parte carece de enlace, debes corregirlo antes de cerrar. Si el usuario pide táctica profunda, puedes incluir un anexo de máximo 10 líneas o diferir la solicitud, pero nunca sustituir la guía principal. Si el usuario solicita `TO_BE`, debes declarar explícitamente `mapState=TO_BE` y no mezclarlo con `AS_IS` sin etiquetar claramente. Si encuentras diagramas ASCII o flechas D→U, debes reescribirlos como Mermaid con la dirección correcta U→D antes de persistir. Si todo está etiquetado como CustomerSupplier, debes revisar la primera capa y degradar a UpstreamDownstream si no hay backlog compartido. Si la evaluación resulta en `bloqueado`, no debes cerrar como listo, sino listar los huecos y completar una iteración. Finalmente, si la puntuación no sube a 9 o más tras dos rondas, debes detenerte e informar los bloqueos restantes en lugar de iterar indefinidamente.

## Resumen del flujo

El flujo de trabajo se divide en cuatro fases principales. La Fase 0 consiste en resolver las entradas, validando y declarando los parámetros obligatorios `scope` y `taskFolder`. La Fase A carga el contexto, fijando el alcance, la carpeta y el estado del mapa, asegurando que `scope`, `taskFolder` y `mapState` estén declarados. La Fase B elabora el mapa descubriendo subdominios, bounded contexts, relaciones y comportamiento, produciendo subdominios, canvases, al menos dos mapas y al menos dos historias. Finalmente, la Fase C persiste los resultados escribiendo `domain-map.md` (y sus partes si aplica) y evaluando la calidad, entregando un documento en disco con la sección `## Evaluación de salida`.

## Fase 0 — Resolver entradas

En esta fase debes validar que tienes los parámetros requeridos: `scope` (string) y `taskFolder` (path). Los parámetros opcionales incluyen `sourcesHint` (string), `mapState` (que puede ser `AS_IS` o `TO_BE`) y `splitMode` (que puede ser `single`, `by-domain` o `by-size`). Una vez resueltas las entradas, debes declararlas en el chat antes de proceder a la siguiente fase.

## Fase A — Cargar y arrancar

Comienza resolviendo la ruta `taskFolder` (que puede ser absoluta o relativa) y creando los archivos `domain_map_process/session.md` y `domain_map_process/context.md`. Si existe un `domain-map.md`, `domain-map/` o `domain-map-*.md` previo, debes resumirlo y proponer de dos a cuatro opciones al usuario usando la herramienta `ask_user_question`, las cuales pueden incluir consolidar, reestructurar, empezar de nuevo o una opción sugerida. Luego fija el `scope`, el `sourcesHint` y el `mapState` (con default `AS_IS`). El criterio de salida de esta fase es tener el `scope` escrito, un `taskFolder` válido, el `mapState` declarado y una decisión sobre el legado documentada en `session.md`.

## Fase B — Elaborar el mapa

### B.1 — Inventario y división

En esta subfase debes inventariar las capacidades del dominio recopilando evidencia concreta como rutas de código, comandos relevantes y artefactos existentes en disco. Con base en este inventario, debes decidir el `splitMode` más apropiado según el tamaño y complejidad del dominio. Luego elabora un borrador de subdominios clasificándolos como Núcleo, Soporte o Genérico junto con los criterios de clasificación utilizados. El criterio de salida de esta subfase es tener una tabla de subdominios con evidencia y el `splitMode` decidido.

### B.2 — Bounded contexts + arqueología

Diseña los bounded contexts evitando la simplificación de "carpeta igual contexto", y en su lugar define cada contexto con su propósito, límites claros, clasificación estratégica, roles de dominio que desempeña, interfaz pública que expone, lenguaje ubicuo con sus anti-términos correspondientes, comunicación de entrada y salida tipada (que puede ser comando, consulta, evento o documento/archivo), reglas de negocio en el límite y ownership tentativo. Para cada bounded context clasificado como Núcleo, debes completar la arqueología de código que incluye cómo entrar al contexto, qué leer después, identificar fósiles o trampas potenciales, y encontrar el ancla de contrato o prueba. Para los contextos de Soporte y Genérico, basta con una ficha corta que incluya propósito, límites y una línea de arqueología. El criterio de salida es que todo contexto Núcleo tenga un canvas completo con interfaz y mensajes tipados más arqueología, los contextos de Soporte tengan al menos una ficha, y ningún contexto quede sin límites definidos.

### B.3 — Mapas de contexto por perspectiva

Debes elegir al menos dos perspectivas distintas del catálogo disponible y formular la pregunta específica que cada mapa responderá. Para cada mapa, incluye una leyenda que contenga solo los tipos y roles utilizados en ese mapa específico, una tabla de dos capas que describa las relaciones, y un diagrama Mermaid con la dirección correcta de upstream a downstream. Si hay cinco o más bounded contexts, debes incluir también una matriz upstream por downstream. Es importante discriminar correctamente entre CustomerSupplier y UpstreamDownstream, apilar roles cuando sea aplicable, y demarcar claramente si existe un Big Ball of Mud. El criterio de salida es tener al menos dos mapas de perspectivas distintas, cero diagramas ASCII, y cada arista debe tener su tipo en la primera capa y roles si aplican en la segunda capa.

### B.4 — Ejecución, bloques estructurales, navegación

Debes crear al menos dos historias de dominio que sigan el patrón actor, acción y artefacto, e incluir al menos una historia que contenga un error o umbral. Los bloques estructurales deben ser ligeros, mostrando desde el punto de entrada hasta los módulos con máximo dos niveles de profundidad, y debes aclarar explícitamente que no son diagramas C4 ni context maps. Incluye una guía de estudio estructurada en tres pasadas y un índice si el documento es suficientemente largo. Finalmente, documenta la polisemia, la trazabilidad entre subdominios y bounded contexts, las decisiones de frontera, preguntas de estudio y supuestos. El criterio de salida es tener historias, bloques y guía de estudio completos, polisemia y trazabilidad completas, y al menos tres preguntas de estudio.

## Fase C — Persistir y evaluar

### C.1 — Persistir

Escribe los documentos según el `splitMode` decidido, recordando que `domain-map.md` es el documento final y no debe incluir narrativa del proceso. Actualiza el archivo `context.md` con el `splitMode`, `mapState`, rutas y fecha. Es fundamental que `domain-map.md` nunca desaparezca y que toda parte enlazada esté accesible desde el índice. El criterio de salida es tener el archivo canónico y sus partes en disco, enlaces íntegros, lectura rápida visible y el `mapState` declarado.

### C.2 — Evaluación de salida

Aplica la rúbrica de evaluación citando evidencia del propio entregable y asigna exactamente un estado `Listo para`. Si el resultado es `bloqueado` o la puntuación global es menor a 7, debes volver a la fase que tiene los huecos para corregirlos, con un máximo de dos ciclos de mejora en la misma invocación. Registra el resultado de la evaluación dentro del bloque `## Evaluación de salida` en `domain-map.md`. El criterio de salida es tener el bloque de evaluación completo y el `Listo para` diferente de `bloqueado`, o que el usuario haya aceptado cerrar con huecos explícitos.

## Contrato de contenido (el conjunto debe cumplirlo)

El entregable completo debe incluir navegación mediante índice y guía de estudio estructurada en tres pasadas. El estado del mapa debe declararse explícitamente como `AS_IS` (por defecto) o `TO_BE` en la sección de contexto y alcance. Los subdominios deben clasificarse como Núcleo, Soporte o Genérico con evidencia y criterios claros. Cada bounded context debe tener un canvas completo para los de Núcleo y una ficha corta para los de Soporte, incluyendo interfaz pública y mensajes tipados. La arqueología de código es obligatoria para cada bounded context de Núcleo, especificando cómo entrar, qué leer después, fósiles o trampas, y pruebas o anclas de contrato. Se requieren al menos dos mapas de contexto pequeños por perspectivas distintas, cada uno con leyenda aplicada, tabla de relaciones de dos capas y diagrama Mermaid con dirección upstream a downstream, más matriz upstream por downstream si hay cinco o más bounded contexts. El comportamiento en ejecución debe documentarse mediante al menos dos historias de dominio siguiendo el patrón actor, acción y artefacto, incluyendo el camino feliz y al menos un fallo o umbral. Los bloques estructurales deben ser ligeros, mostrando puntos de entrada y módulos con máximo dos niveles solo para propósitos de arqueología. Finalmente, se debe documentar la polisemia, trazabilidad entre subdominios y bounded contexts, decisiones de frontera, preguntas de estudio y supuestos, junto con una evaluación de salida que incluya rúbrica y estado `Listo para`. Un entregable que solo liste carpetas no cumple con el contrato, ni un mapa que idealice el futuro sin evidencia pero se presente como `AS_IS`.

## Semántica de context map (2 capas)

Cada arista en el mapa de contexto tiene un tipo de relación en la primera capa y, si es aplicable, roles de integración apilables en la segunda capa. Es importante notar que los roles no son mutuamente excluyentes, por lo que una misma arista puede tener múltiples roles.

### Capa 1 — Tipo de relación

El tipo Partnership indica que el fallo de entrega de uno de los contextos implica el fallo del otro, requiriendo coordinación bilateral en una relación simétrica. SharedKernel representa un subconjunto explícito y pequeño de modelo o código compartido, donde cualquier cambio requiere consulta bilateral en una relación también simétrica. UpstreamDownstream describe una relación asimétrica donde el upstream influye en el downstream, pero el downstream no empuja la planificación del upstream. CustomerSupplier es similar a UpstreamDownstream pero con la diferencia de que las prioridades del downstream factorizan en el backlog del upstream, manteniendo la asimetría. SeparateWays indica que no hay integración relevante entre los contextos, correspondiendo a una relación de equipo tipo Free. Finalmente, BigBallOfMud representa una zona de modelos mezclados o fronteras rotas que debe demarcarse claramente sin propagar el modelo.

### Capa 2 — Roles de integración (apilables)

El rol OHS (Open Host Service) en el upstream indica un protocolo o API estable abierto a varios consumidores, como cuando el contexto de Catálogo expone su API de productos a los contextos de Pedidos y Facturación. El rol PL (Published Language) en el upstream representa un lenguaje o formato publicado de intercambio, como JSON Schema, Protobuf o iCal entre contextos. El rol Conformist en el downstream significa que este adopta el modelo del upstream sin traducirlo, como cuando el contexto de Notificaciones usa el payload de Pedidos tal cual. El rol ACL (Anti-Corruption Layer) en el downstream indica que este traduce o protege su modelo frente al upstream, como cuando Checkout adapta un ERP legado a su propio modelo.

Las reglas duras para la semántica de context map son las siguientes. No debes etiquetar todo como CustomerSupplier, ya que si no hay influencia real en la planificación del upstream debes usar UpstreamDownstream, posiblemente con Conformist o ACL. Partnership y SharedKernel no deben forzar una distinción upstream/downstream falsa, por lo que si hay asimetría real debes usar UpstreamDownstream o CustomerSupplier. Para SharedKernel debes declarar su alcance claramente y priorizar piezas de baja volatilidad, ya que si crece sin consulta se convierte en un riesgo hacia BigBallOfMud o acoplamiento excesivo. Una arista puede llevar varios roles simultáneos, como OHS+PL, o evolucionar de Conformist a ACL con el tiempo. Partnership sirve para coordinar equipos y contextos, pero debes evitar ciclos runtime de dependencias duras. Finalmente, los mapas organizacionales o Team Topologies solo deben incluirse como anexo de máximo 15 líneas si hay evidencia clara de equipos.

### Catálogo de perspectivas (elige ≥2 distintas)

1. **Runtime / ciclo mecánico** — ¿quién escribe qué artefacto en ejecución?
2. **Propagación de modelo / PL** — ¿qué lenguaje publicado viaja entre contextos?
3. **Frontera semántica / polisemia** — ¿dónde el mismo término cambia de significado?
4. **Influencia de planificación** — ¿hay CustomerSupplier real o solo UpstreamDownstream?
5. **Ownership / dependencia de entrega** — ¿quién debe coordinar releases? (solo con evidencia)

### Convención Mermaid

- Flecha siempre **upstream → downstream** (influencia).
- Nodos = bounded contexts (no carpetas).
- Etiqueta = tipo + roles, p. ej. `U/D + OHS+PL→ACL` o `Partnership`.
- BBoM: nodo o subgrafo marcado; sin aristas que "legitimen" el lodo como modelo limpio.
- Cero ASCII art.

## Disposición de archivos

- **`single`**: Un dominio; la guía cabe en un `.md` — Solo `domain-map.md`
- **`by-domain`**: ≥2 dominios claros — Índice + `domain-map/<dominio>.md`
- **`by-size`**: Un dominio con muchos canvases — Índice + partes `bc-*.md` / dominio

**Reglas:** (1) `domain-map.md` nunca desaparece. (2) Toda parte enlazada desde el índice. (3) El contrato se cumple en el **conjunto**. (4) Nombres kebab-case ASCII. (5) Antes de dividir: 2–4 alternativas + "Otra" + sugerida.

## Rúbrica de evaluación de salida (1–10)

- **Navegación / estudio**
  - 0–3: Sin índice ni guía
  - 4–6: Solo Lectura rápida
  - 7–8: Guía 3 pasadas
  - 9–10: Guía + índice + preguntas de estudio
- **Subdominios**
  - 0–3: Lista sin evidencia
  - 4–6: Evidencia parcial
  - 7–8: Núcleo/Soporte/Genérico + criterios
  - 9–10: Tensiones explícitas
- **Canvases + arqueología**
  - 0–3: Nombres sueltos
  - 4–6: Canvases sin arqueología / sin mensajes tipados
  - 7–8: Núcleo con arqueología + interfaz
  - 9–10: Núcleo+Soporte coherentes
- **Mapas de contexto**
  - 0–3: Uno confuso / ASCII / todo C/S
  - 4–6: Un solo mapa completo
  - 7–8: ≥2 perspectivas; capa 1+2
  - 9–10: Roles apilados bien discriminados; BBoM si aplica
- **Ejecución + bloques**
  - 0–3: Ausente
  - 4–6: Solo uno de los dos
  - 7–8: Historias + bloques acotados
  - 9–10: Historias con fallo + bloques ≠ C4
- **Lenguaje / polisemia**
  - 0–3: Ausente
  - 4–6: Glosario débil
  - 7–8: Polisemia con mitigación
  - 9–10: Anti-términos por BC
- **Autocontención del doc**
  - 0–3: Depende del chat/legado
  - 4–6: Huecos "ver X externo"
  - 7–8: Se entiende solo
  - 9–10: Preguntas de estudio respondibles; AS_IS claro

**Puntuación global:** promedio redondeado de los 7 criterios.

Un mapa debe cumplir estos estándares antes de poder puntuar ≥ 9:

- Las secciones requeridas del contrato de contenido están presentes con contenido real.
- ≥2 mapas de perspectivas distintas con capa 1+2 + Mermaid U→D.
- ≥2 historias + arqueología + interfaz/mensajes en cada Núcleo.
- Rúbrica rellenada y un solo `Listo para`.
- Sin pedir al lector que salga a URLs o a skills ajenas para completar el sentido del mapa.

Verificación rápida de 9 vs 8: si el lector necesitaría consultar fuentes externas o el chat para entender el mapa, puntúa ≤ 8. Si el mapa se sostiene solo con solo nits de redacción, puntúa ≥ 9.

Mejora el mapa en **como máximo 2** rondas de revisión hasta que la puntuación sea ≥ 9. Si sigue por debajo de 9 después de 2 rondas, detente e informa los bloqueos en lugar de iterar indefinidamente.

**Listo para** (exactamente uno; literales de contrato — no traducir): `fusionar-solo-detalles` | `mejorar` | `bloqueado`.

- `fusionar-solo-detalles` — puntuación ≥ 8 y sin criterio < 6.
- `mejorar` — puntuación 6–7, o algún criterio 4–5 sin romper usabilidad.
- `bloqueado` — puntuación ≤ 5, o falta contrato obligatorio (p. ej. sin Mermaid, sin arqueología en Núcleo, sin evaluación, capas de relación mezcladas/omitidas).

## Mal resultado (evitar)

- Carpetas disfrazadas de subdominios/BCs.
- Un solo mapa de contexto "dios" o diagrama ASCII.
- Todo etiquetado CustomerSupplier sin evidencia de backlog compartido.
- Canvases Núcleo sin arqueología, sin interfaz pública o sin tipo de mensaje.
- Confundir bloques estructurales con C4 o con el context map.
- Presentar deseo (`TO_BE`) como `AS_IS`.
- Cerrar solo en el chat o con código "de ejemplo".
- Referencias a URLs externas o "abre el documento X" para entender el mapa.
- Evaluación omitida o `Listo para` múltiple/ambiguo.
- Narrativa de "en esta sesión hicimos…" dentro del canónico.

## Autoevaluación antes de terminar

- ¿Se cumplieron los criterios de salida de las fases 0, A, B y C?
- ¿`scope` y `taskFolder` resueltos y declarados?
- ¿`mapState` declarado y coherente con el contenido?
- ¿≥2 mapas de perspectivas distintas con capa 1+2 + Mermaid U→D?
- ¿≥2 historias + arqueología + interfaz/mensajes en cada Núcleo?
- ¿Rúbrica rellenada y un solo `Listo para`?
- ¿Sin pedir al lector que salga a URLs o a skills ajenas para completar el sentido del mapa?
- ¿Entregables persistidos en disco (`domain-map.md` + `domain_map_process/`)?

## Termina cuando

Los criterios de las fases 0, A, B y C se cumplen (o `bloqueado` se documentó con aceptación del usuario); `domain-map.md` (+ partes) y `domain_map_process/` están persistidos.

## Encabezados del canónico

Tras el `#` del título del índice/`single`: orden **`## Contexto y alcance`** → **`## Lectura rápida`** → resto según la plantilla incluida. La Lectura rápida resume dominio, contextos clave, relación crítica y pendientes (sin historial de redacción).

## Handoff

```text
## Handoff

**Skill:** domain-mapping
**Scope:** <scope>
**TaskFolder:** <taskFolder>
**MapState:** <AS_IS | TO_BE>
**SplitMode:** <single | by-domain | by-size>

### Entregables
- `domain-map.md` (canónico)
- `domain_map_process/session.md`
- `domain_map_process/context.md`
- Partes opcionales: `domain-map/<slug>.md` o `domain-map/bc-<slug>.md`

### Evaluación
- Puntuación global: <X/10>
- Listo para: <fusionar-solo-detalles | mejorar | bloqueado>
- Observaciones: <breve resumen de hallazgos principales>

### Próximo paso sugerido
<según Listo para: fusionar, mejorar con iteración adicional, o desbloquear dependencias>
```
