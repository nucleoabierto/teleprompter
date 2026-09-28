---
name: revisar-arquitectura
description: >
  Evalúa la arquitectura de un dominio con criterios de Domain
  Driven Design —lenguaje ubicuo, capas, fronteras, invariantes,
  acoplamiento y catálogo de smells— y produce un informe con
  evidencia, hallazgos priorizados y recomendaciones como
  órdenes de reparación, persistido en docs/architecture-reviews/ del
  proyecto evaluado, sin implementar cambios.
  Usar bajo demanda sobre un dominio, o cuando documentar-dominio
  detecte divergencia estructural entre el código y lo documentado.
  Sinónimos: revisar arquitectura, revisión de arquitectura,
  evaluar dominio, auditoría DDD, revisión estructural.
---

# Revisar arquitectura

Instrucciones para que un agente evalúe la arquitectura de un dominio con criterios de Domain Driven Design. El resultado es un informe persistido en `docs/architecture-reviews/` del proyecto evaluado: no implementa cambios ni los ordena directamente —los hallazgos derivan en tareas vía `crear-tareas` o en decisiones vía `decisiones-diseno`, siempre con aprobación del usuario.

## Cuándo usar

- Cuando el usuario pida revisar la arquitectura de un dominio o del sistema.
- Cuando `documentar-dominio` detecte divergencia estructural entre el código y la documentación del dominio y la recomiende.
- Cuando un dominio haya acumulado cambios suficientes para que una evaluación profunda aporte más que el sensor continuo.

## Cuándo no usar

- Para la revisión del diff de una tarea concreta: eso corresponde a `revisar-implementacion`.
- Para actualizar la documentación del dominio: eso corresponde a `documentar-dominio`, que puede recomendar esta revisión.
- Para implementar las mejoras detectadas: el informe las propone; la ejecución pasa por el ciclo de tareas.

## Entrada

- El dominio a evaluar: su código y, si existe, su documento en `docs/domains/` (glosario, modelo y fronteras declaradas —la intención contra la que se evalúa).
- `docs/decisions/` para las decisiones que dan forma al dominio y que la evaluación debe respetar.
- `references/rubrica.md` como criterios de evaluación y catálogo de patrones y antipatrones.

## Salida

- Un informe de revisión de arquitectura persistido en `docs/architecture-reviews/` del proyecto que contiene el dominio evaluado —la misma regla que `docs/domains/`: junto al código del dominio. Nomenclatura `NNN-slug.md` con serie numerada propia, consistente con `docs/tasks/` y `docs/decisions/`; sin índice propio: la serie basta.
- Contenido del informe:
  - Cabecera con bullets etiquetados: fecha, dominio evaluado y su alcance, intención declarada (documento de dominio, si existe) y decisiones respetadas.
  - Veredicto por criterio de la rúbrica (correcto, mejorable, deficiente, no evaluable) con su evidencia y nivel de confianza.
  - Hallazgos priorizados como órdenes de reparación, con el formato de `references/rubrica.md`.
  - Recomendaciones.
- El informe persistido es el origen estable: las tareas y decisiones que se deriven lo referencian por su ruta, y cada hallazgo registra en su campo «Derivado en» la tarea o decisión que lo materializó (el único campo del informe que se actualiza tras la emisión).
- El informe se presenta también al usuario en resumen; no modifica código por sí mismo.

## Principios rectores

1. **Evalúa, no prescribe:** la rúbrica evalúa el dominio con DDD; las conclusiones (separar capas, extraer un componente, renombrar para el lenguaje ubicuo) emergen de los hallazgos, no de una arquitectura preferida de antemano.
2. **Intención declarada primero:** una violación solo existe contra una frontera, regla o glosario declarados; si el dominio no tiene documentación, la primera observación es esa ausencia, y el resto de la evaluación se hace contra el modelo que el código evidencia.
3. **Determinismo y juicio:** lo mecánicamente comprobable (ciclos de dependencias, tamaño relativo, anclas del glosario rotas) se verifica con evidencia; lo semántico se evalúa con la rúbrica y declara su nivel de confianza.
4. **Órdenes de reparación:** cada hallazgo lleva criterio, evidencia, objetivo, restricciones y validación; una observación sin anclaje no es un hallazgo.
5. **Sin implementación:** el skill no toca el código; sus hallazgos se materializan como tareas o decisiones aprobadas por el usuario.

## Procedimiento

1. **Delimitar el dominio y su intención.** Fijar qué código cubre el dominio y leer su documento en `docs/domains/` si existe, más las decisiones que lo afectan. Si no hay documento, reconstruir el modelo que el código evidencia y anotar la ausencia como primer hallazgo.
2. **Recopilar evidencia.** Recorrer el código del dominio: estructura de módulos, grafo de dependencias, nombres frente al glosario, dónde se defienden las invariantes, qué mezcla cada componente.
3. **Evaluar por criterio.** Aplicar la rúbrica de `references/rubrica.md`: lenguaje ubicuo, separación de capas, fronteras, invariantes y modelo, acoplamiento y estructura, y el catálogo de smells. Cada veredicto con su evidencia y confianza; los criterios son abiertos y extensibles —si el dominio presenta una dimensión no cubierta, se evalúa y se propone su adición a la rúbrica.
4. **Priorizar hallazgos.** Ordenar por impacto en la mantenibilidad del dominio: primero lo que contradice la intención declarada o hace cumplir fronteras, después lo que degrada el modelo, al final lo cosmético.
5. **Emitir el informe** con la estructura de «Salida»: escribir el archivo en `docs/architecture-reviews/` y presentar un resumen al usuario.
6. **Derivar con aprobación.** Si el usuario aprueba actuar sobre los hallazgos, darlos de alta con `crear-tareas` (correcciones) o `decisiones-diseno` (cambios de criterio arquitectónico); las tareas y decisiones creadas referencian el informe por su ruta, y el campo «Derivado en» de cada hallazgo se actualiza con lo creado. Sin aprobación, no se crea nada.

## Finalización

El skill ha terminado cuando:

- El informe está persistido en `docs/architecture-reviews/` con veredicto por criterio, evidencia y confianza.
- Los hallazgos están priorizados y redactados como órdenes de reparación.
- El usuario decidió qué se deriva a tareas o decisiones (o nada).

## Referencias

- `references/rubrica.md` — Criterios de evaluación y catálogo de patrones y antipatrones con sus estrategias de detección. Leer antes de evaluar.
- `docs/research/2026-09-revision-arquitectura-y-documentacion-dominio.md` — Investigación que motiva el skill: métodos de evaluación de arquitectura, catálogo de smells y la división sensor continuo / evaluación profunda.
