---
name: planear-implementacion
description: >
  Produce el plan de una tarea de desarrollo antes de escribir
  código: entendimiento del subsistema afectado, plan técnico
  conceptual con storytelling y suite de pruebas esperada guiada
  por ZOMBIE con su letra declarada por expectativa.
  Usar al ejecutar una tarea de tipo desarrollo o mantenimiento
  (refactoring), invocado por `planear-tarea`, la mitad de planeación del flujo
  de desarrollo o directamente, cuando hay que planear la
  implementación antes de codificar.
  Sinónimos: planear implementación, plan técnico de la tarea,
  planeación de desarrollo, plan antes del código.
---

# Planear implementación

Instrucciones para que un agente produzca el plan de una tarea de desarrollo antes de escribir código. El skill entiende primero el subsistema afectado, redacta después un plan técnico a nivel conceptual en el que cada acción explica cómo aporta al desarrollo, y lo completa con la suite de pruebas esperada: expectativas sobre el comportamiento del sistema, trazables a casos de uso. Ambos artefactos se agregan al archivo de la tarea, manteniendo un solo artefacto por tarea.

## Cuándo usar

- Al ejecutar una tarea de tipo `desarrollo` o `mantenimiento (refactoring)`, antes de escribir código: invocado por `planear-tarea`, la mitad de planeación del flujo de desarrollo dentro de la tarea.
- Cuando el usuario pida planear la implementación de una tarea concreta, fuera del ciclo de ejecución.

## Cuándo no usar

- Para tareas que no modifican código (investigación, documentación, mantenimiento de proceso): se ejecutan con el comportamiento general de `ejecutar-tareas`. El mantenimiento sobre código sí pasa por este skill: es el perfil `refactoring` del tipo `mantenimiento`, enrutado al sub-flujo de desarrollo.
- Para producir la guía de arquitectura de un conjunto de tareas: eso corresponde a `planificar`, en la épica.
- Para ejecutar el plan ya redactado: eso corresponde a `ejecutar-implementacion`.

## Entrada

- El archivo de la tarea de desarrollo a planear (`docs/tasks/NNN-slug.md`), con su objetivo y criterios de calidad.
- La sección `## Contexto` de la tarea, recopilada por `recopilar-contexto`. Si la tarea no la tiene, invocar `recopilar-contexto` antes de empezar.
- El plan técnico de la épica que agrupa la tarea, si existe, como guía de arquitectura.
- El código base del subsistema afectado.

## Salida

- Dos secciones agregadas al archivo de la tarea, antes de la sección Revisión:
  - `## Plan técnico`: el entendimiento del subsistema como contexto general —incluidas las decisiones transversales que aplican a varias acciones— y la checklist de acciones a nivel conceptual. Cada acción es un ítem `- [ ]` con sub-bullets: `Aporta:` —cómo contribuye al desarrollo— y, solo cuando omitirlo haría probable un error, `Contexto:` —lo que un ejecutor sin contexto previo necesita y no está en el código ni en la tarea. Ejemplo de ítem:
    ```
    - [ ] Relajar `Storage.loadTasks` para devolver el valor parseado sin exigir array
      - Aporta: la persistencia tolera corrupción sin conocer la forma; la validación es del modelo
      - Contexto: la validación de forma vive en `isValidTask`; no duplicarla en la capa de almacenamiento
    ```
  - `## Suite de pruebas esperada`: las expectativas sobre lo que el sistema hace, cada una trazable a un caso de uso y anotada con la letra ZOMBIE que la derivó cuando aplica.

## Principios rectores

1. **Entender antes de planear:** el agente lee y resume el subsistema afectado antes de escribir el plan, para exponer malentendidos antes de que se conviertan en plan.
2. **La épica guía, la tarea detalla:** el plan técnico de la épica fija los patrones y las decisiones transversales; el plan de la tarea los sigue y los baja a las acciones de esa pieza. Si la tarea contradice la guía, se plantea la discrepancia al usuario en lugar de desviarse en silencio.
3. **Nivel conceptual como norma:** las acciones se expresan como operaciones sobre el diseño (crear una clase, agregar un método, dividir un módulo; la lista es abierta, no exhaustiva), sin rutas ni fragmentos de código. Se admiten referencias a archivos concretos solo cuando el detalle previene un error costoso.
4. **Storytelling técnico:** cada acción declara cómo aporta al desarrollo de la tarea; una acción sin justificación es ruido en el plan.
5. **Contexto declarado, no derivable:** el resumen del subsistema es el contexto general común a todas las acciones; el `Contexto:` de un ítem registra solo lo que la planeación descubrió y el ejecutor no puede inferir —un archivo hermano a imitar, una decisión tomada, una dependencia de orden entre acciones. Si la acción no lo necesita, el campo no se escribe.
6. **Acciones como unidades delegables:** la checklist hace visible el avance y permite que `ejecutar-implementacion` delegue ítems a subagentes; cada acción se formula como una unidad de trabajo comprensible por sí misma, apoyada en el contexto general y en su `Contexto:` propio.
7. **Las pruebas describen el qué, no el cómo:** la suite expresa expectativas sobre el comportamiento del sistema ante estímulos, ancladas en casos de uso, no en la implementación. Una prueba sin caso de uso asociado es de baja calidad.
8. **ZOMBIE es guía de generación, no taxonomía:** el acrónimo (*zero, one, many, boundary, interface, exception*) sirve para rebanar el problema y descubrir casos, de forma parcialmente secuencial; la suite declara qué letra derivó cada expectativa cuando aplica —la cobertura de los ejes queda visible— pero sigue sin acoplarse a la implementación.

## Procedimiento

### 1. Entender el subsistema

1. **Leer el archivo de la tarea** para fijar objetivo, alcance y criterios de calidad.
2. **Leer el plan técnico de la épica**, si la tarea figura bajo un encabezado con comentario `<!-- épica: ... -->` en `TODO.txt` o referencia una épica; esa guía de arquitectura es el marco del plan.
3. **Apoyarse en la sección `## Contexto` de la tarea:** lo ya recopilado por `recopilar-contexto` es el punto de partida. Completar la exploración solo donde el contexto tenga vacíos respecto a lo que el plan necesita —una pieza del subsistema no cubierta, un patrón dudoso—, sin repetir desde cero lo ya recopilado.
4. **Redactar el resumen del subsistema** en dos o tres frases: qué hace, qué patrón sigue y dónde encaja el cambio. Si la lectura revela un malentendido en la propia tarea, plantearlo al usuario antes de seguir.

### 2. Redactar el plan técnico

5. **Listar las acciones como checklist** que realizan el objetivo de la tarea, en orden de implementación cuando el orden importe. Cada ítem `- [ ]` declara la acción a nivel conceptual y lleva sub-bullets anidados: `Aporta:` con la explicación de cómo contribuye al desarrollo, y `Contexto:` solo cuando la planeación descubrió algo que el ejecutor no puede inferir del código ni de la tarea y cuya omisión haría probable un error.
6. **Añadir detalle solo donde previene errores costosos:** una referencia a archivo o una decisión de implementación concreta se incluye cuando omitirla haría probable un error; no porque el plan parezca más minucioso. El `Contexto:` por ítem sigue esta misma regla.
7. **Verificar la guía de la épica:** cada acción del plan sigue los patrones y decisiones transversales que la épica declara; si el plan necesita apartarse, se explicita la discrepancia al usuario.

### 3. Redactar la suite de pruebas esperada

8. **Extraer los casos de uso** del objetivo y los criterios de calidad de la tarea.
9. **Generar casos con ZOMBIE como guía interna:** para cada comportamiento, recorrer el eje de progresión (*zero, one, many*) y el de bordes (*boundary, interface, exception*), empezando por el caso más simple y actualizando la lista de forma iterativa.
10. **Expresar cada caso como expectativa de comportamiento:** qué hace el sistema ante qué estímulo, con el resultado observable; sin nombrar funciones, clases ni detalles internos. La expectativa termina con la letra ZOMBIE que la derivó entre paréntesis —`(Z)`, `(O)`, `(M)`, `(B)`, `(I)` o `(E)`— cuando un parámetro ZOMBIE aplicó de verdad; las pruebas de regresión o de arnés van sin anotar.
11. **Trazar cada prueba a su caso de uso:** cada expectativa indica de qué caso de uso deriva; si una prueba no encuentra anclaje, se descarta o se plantea el caso de uso que falta.

### 4. Puerta humana

12. **Aplicar revisión de redacción y pulido mecánico en modo preventivo.** Si el arnés lo permite, invocar `revisar-redaccion` y, con su salida, `pulir-escritura`; de lo contrario, realizar el equivalente manualmente.
13. **Presentar el plan y la suite al usuario** para aprobación. Si solicita cambios, ajustar y repetir la presentación. Si lo rechaza, no escribir nada en el archivo de la tarea y terminar informando del rechazo.

### 5. Materializar el plan

14. **Agregar las dos secciones al archivo de la tarea**, antes de la sección Revisión: `## Plan técnico` con el resumen del subsistema y la checklist de acciones con sus `Aporta:` y `Contexto:`, y `## Suite de pruebas esperada` con las expectativas trazadas.
15. **Informar al usuario** de que el plan quedó en el archivo de la tarea, listo para la fase de ejecución.

## Finalización

El skill ha terminado cuando:

- El subsistema afectado quedó resumido y los malentendidos se resolvieron con el usuario.
- El usuario aprobó el plan técnico y la suite.
- El archivo de la tarea contiene las secciones `## Plan técnico` y `## Suite de pruebas esperada`, o se informó del rechazo sin escribir nada.

## Referencias

- `docs/research/2026-09-flujo-desarrollo.md` — Fases de planeación técnica y de testing, con los ajustes aprobados (entendimiento previo, granularidad flexible).
- `docs/decisions/D031-flujo-desarrollo-dividido-en-planear-y-ejecutar.md` — El flujo de desarrollo dividido en `planear-tarea` y `desarrollar-tarea` (sustituye a D020).
- James Grenning, «TDD Guided by ZOMBIES» — blog.wingman-sw.com/tdd-guided-by-zombies — Guía de generación de casos de prueba.
