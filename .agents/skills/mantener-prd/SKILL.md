---
name: mantener-prd
description: >
  Crea y mantiene el PRD de un conjunto de trabajo —el documento de
  producto en docs/prd/ que declara los casos de uso con su ID y el
  comportamiento esperado antes de que las tareas se planeen—, lo
  sincroniza con las desviaciones de la ejecución al cerrar cada
  tarea y lo conserva como registro al agotarse el conjunto.
  Usar al crear una épica o un conjunto con comportamiento de
  producto, al cerrar una tarea que lo desvíe, o cuando se pida
  crear o actualizar el PRD de un conjunto.
  Sinónimos: mantener PRD, crear PRD, documento de producto, PRD,
  requisitos de producto, casos de uso.
---

# Mantener el PRD del conjunto

Instrucciones para que un agente cree y mantenga el PRD de un conjunto de trabajo: el documento de producto que declara —antes de que las tareas se planeen— qué problema resuelve el conjunto, para quién, qué casos de uso cubre y qué comportamiento se espera del sistema. El PRD es la mitad de producto que falta entre la propuesta y la épica: la épica guía el cómo (arquitectura), el PRD declara el qué (comportamiento esperado) — y da a los casos de uso un dueño que no sea el propio planner de cada tarea.

## Cuándo usar

- Al crear una épica —invocado por `planificar`— o un conjunto con comportamiento de producto observable: redacta el PRD con la información de la propuesta y de las piezas, y lo presenta en la misma puerta humana que la épica.
- Al cerrar una tarea cuyo diff desvió el comportamiento declarado en el PRD —sensor de cierre, como `documentar-producto`—.
- Cuando el usuario pida crear, revisar o actualizar el PRD de un conjunto.

## Cuándo no usar

- Para documentar el comportamiento ya construido: eso corresponde a `documentar-producto`, que ancla escenarios a la suite; el PRD declara lo intentado, la documentación de producto describe lo logrado.
- Para la guía de arquitectura del conjunto: eso es la épica (`planificar`).
- Para evaluar la oportunidad o el problema antes de proponer solución: eso vive en el flujo de idea a tarea (`descubrir-problema`, `proponer-forma-solucion`); el PRD hereda ese enmarcado, no lo repite.
- Para conjuntos sin comportamiento observable de producto: no hay PRD que declarar.

## Entrada

- **Creación:** la propuesta aprobada —problema, oportunidad, forma de solución, fuera de alcance— y las piezas del conjunto (sus archivos de tarea), comunicadas por `planificar`; o la intención del conjunto que el usuario traiga.
- **Sensor:** la ubicación de los cambios de la tarea —árbol de trabajo sin commitear o rango de commits— y el PRD vigente del conjunto.
- `assets/prd.md` como plantilla del documento.

## Salida

- `docs/prd/NNN-slug.md` creado o actualizado, con los casos de uso identificados como `CU-N` y el comportamiento esperado por área de funcionalidad.
- O el veredicto «sin impacto»: el diff no desvía ningún comportamiento declarado.
- O una laguna elevada al usuario: la tarea necesita un caso de uso que el PRD no declara.

## Principios rectores

1. **El PRD responde qué y por qué, nunca cómo:** casos de uso y comportamiento esperado en lenguaje de negocio, sin arquitectura, sin tareas, sin rutas —el cómo vive en la épica y en los planes, que referencian al PRD—.
2. **Los casos de uso tienen dueño antes de planear:** el planner de una tarea los extrae del PRD y los baja; una necesidad no cubierta es una laguna que se eleva o una actualización del PRD, nunca una invención silenciosa. La propagación de los requisitos es de vocabulario y comportamiento —la suite traza al `CU-N`; la documentación de producto redacta desde el mismo lenguaje de negocio con su texto público limpio de identificadores internos: la remontada al PRD corre por el ancla a la prueba—.
3. **Compacto por diseño:** el PRD compite por el contexto del agente con el código; cada sección declara lo que la planeación necesita y nada más.
4. **Vivo mientras el conjunto vive:** las desviaciones de ejecución que cambian comportamiento actualizan el PRD en el mismo cierre; un PRD desactualizado es peor que ninguno, porque ancla la planeación a una intención caducada.
5. **Registro, no ciclo propio:** el PRD no lleva Estado ni Revisión propios —su vigencia es la de la épica que lo porta y su aprobación la da la puerta humana de la épica—; al agotarse el conjunto queda como registro histórico, y el comportamiento vivo lo documenta `documentar-producto`.

## Procedimiento

### Creación (invocado por `planificar` al crear la épica)

1. **Reunir el enmarcado:** de la propuesta aprobada, el problema, la oportunidad y el fuera de alcance; de las piezas, los objetivos y resultados esperados. Sin propuesta, partir de la intención del conjunto y las piezas.
2. **Redactar el PRD** siguiendo `assets/prd.md`: problema y objetivo de producto; usuarios; casos de uso como `CU-N` en lenguaje de negocio —quién busca qué y qué ocurre—, con sus variantes y bordes; comportamiento esperado por área de funcionalidad, observable y sin nombrar funciones ni archivos; criterios de éxito a nivel producto; fuera de alcance de producto.
3. **Aplicar revisión de redacción y pulido mecánico en modo preventivo** —`revisar-redaccion` y `pulir-escritura` si el arnés lo permite—.
4. **Presentar el PRD junto con el borrador de épica** en la misma puerta humana: el usuario aprueba o pide cambios de ambos a la vez. Si lo rechaza, no crear el archivo.
5. **Materializar** `docs/prd/NNN-slug.md` con el número de la épica que lo porta, e informar de su ruta para que las piezas lo referencien.

### Sensor de cierre (invocado por el ciclo al cerrar una tarea del conjunto)

6. **Evaluar el impacto del diff** —reconstruido con git desde la ubicación indicada— contra el comportamiento declarado: ¿el cambio desvía, extiende o invalida un caso de uso o una regla de comportamiento? Si no, emitir «sin impacto» y terminar.
7. **Actualizar el PRD** con la desviación aprobada —el caso de uso o la regla afectada queda con el comportamiento real— y registrar el motivo de la cambio en la propia línea. Si la desviación no estaba aprobada, elevarla al usuario como cualquier desviación de planeación.
8. **Informar del resultado:** «sin impacto» o PRD actualizado.

### Cierre del conjunto

9. **Al agotarse la agrupación** —invocado por `cerrar-conjunto`—, el PRD queda como registro histórico en `docs/prd/`: no se archiva a otro directorio ni se reescribe; el comportamiento vivo del producto lo documenta `documentar-producto` desde ese momento.

## Finalización

El skill ha terminado cuando:

- **Creación:** el PRD existe en `docs/prd/` con los casos de uso identificados, aprobado junto con la épica.
- **Sensor:** se emitió «sin impacto» o el PRD quedó actualizado con la desviación.
- **Cierre:** el PRD quedó como registro y se informó de ello.

## Referencias

- `assets/prd.md` — Plantilla del PRD. Leer antes de redactar.
- `docs/research/2026-10-prd-planeacion-producto.md` — Investigación que motiva el skill: qué contiene, dónde vive y cómo se consume.
- `docs/decisions/D019-epica-como-artefacto-de-planeacion.md` — La épica como guía de arquitectura: la frontera entre el qué y el cómo del conjunto.
