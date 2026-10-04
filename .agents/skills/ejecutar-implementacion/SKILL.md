---
name: ejecutar-implementacion
description: >
  Ejecuta el desarrollo de una tarea siguiendo el plan técnico y
  la suite de pruebas esperada que la planeación dejó en su
  archivo, y devuelve el diff con el registro de desviaciones.
  Usar al ejecutar una tarea de tipo desarrollo o mantenimiento
  (refactoring) que ya tiene plan, invocado por el skill
  especialista `desarrollar-tarea` o directamente.
  Sinónimos: ejecutar implementación, implementar el plan,
  desarrollo siguiendo el plan, codificar la tarea.
---

# Ejecutar implementación

Instrucciones para que un agente ejecute el desarrollo de una tarea siguiendo el plan técnico y la suite de pruebas esperada registrados en su archivo. El skill orquesta la ejecución: delega las acciones del plan en subagentes, verifica lo que devuelven y confronta el trabajo con el plan a medida que avanza —no solo al final—; trata la desviación como señal de detenerse y reexaminar, y cada desviación queda registrada para replanificar o pedir confirmación al usuario. La salida es el diff de los cambios junto con el plan marcado y el registro de desviaciones.

## Cuándo usar

- Al ejecutar una tarea de tipo `desarrollo` o `mantenimiento (refactoring)` cuyo archivo ya contiene las secciones `## Plan técnico` y `## Suite de pruebas esperada`: invocado por `desarrollar-tarea`, la mitad de ejecución del flujo de desarrollo.
- Cuando el usuario pida implementar el plan de una tarea concreta.

## Cuándo no usar

- Para tareas que no modifican código: se ejecutan con el comportamiento general de `ejecutar-tareas`.
- Si la tarea aún no tiene plan: corresponde primero a `planear-implementacion`.
- Para revisar la implementación producida: eso corresponde a `revisar-implementacion`.

## Entrada

- El archivo de la tarea de desarrollo (`docs/tasks/NNN-slug.md`) con `## Plan técnico` y `## Suite de pruebas esperada` aprobados.
- El código base del subsistema afectado.
- El plan técnico de la épica, si la tarea pertenece a una, como guía de arquitectura vigente durante la ejecución.

## Salida

- El diff de los cambios de código que implementan la tarea.
- El `## Plan técnico` del archivo de la tarea con cada acción marcada `[x]` al verificarla.
- Una sección `## Desviaciones del plan` agregada al archivo de la tarea cuando hubo desviaciones, con cada desviación, su motivo y la decisión tomada. Si no hubo, no se agrega nada.

## Principios rectores

1. **El plan manda, la evidencia manda más:** la ejecución sigue las acciones del plan; cuando la evidencia nueva contradice el plan, el agente se detiene y reexamina en lugar de continuar por inercia.
2. **El agente orquesta, los subagentes implementan:** cada acción del plan se delega por defecto en un subagente; el agente prepara el contexto, verifica lo devuelto e integra el avance, y solo implementa directamente lo que la delegación no cubre.
3. **Chequeo continuo, no final:** cada acción implementada se confronta con el plan al terminarla, de modo que la desviación se detecta donde ocurre y no como sorpresa al final.
4. **La desviación se registra, no se oculta:** toda desviación queda documentada con su motivo y la decisión tomada; el registro es evidencia para la revisión y para el siguiente plan.
5. **Las pruebas verifican el qué:** la suite de pruebas esperada define el comportamiento a satisfacer; la implementación se juzga contra esas expectativas, no contra la forma interna que el agente prefiera.
6. **Convenciones del código base:** el código nuevo sigue los patrones de los archivos hermanos o de funcionalidad similar que el entendimiento del subsistema identificó.

## Procedimiento

### 1. Preparar la ejecución

1. **Leer el archivo de la tarea:** objetivo, criterios de calidad, `## Plan técnico` (con el resumen del subsistema) y `## Suite de pruebas esperada`. Si falta el plan o la suite, detenerse e invocar `planear-implementacion` o informar al usuario.
2. **Confirmar el punto de partida:** verificar que el estado del código base coincide con lo que el resumen del subsistema describe. Si difiere de forma relevante, tratarlo como evidencia nueva: registrarlo y reexaminar el plan antes de codificar.
3. **Incorporar las acciones a la lista de control de la sesión:** cada acción del `## Plan técnico` —leída con la operación `checklist` de `consultar-artefactos`— entra como un ítem individual —sustituyendo el ítem «ejecutar el plan» que la lista declara como paso del pipeline— en la herramienta de lista de tareas del arnés, o en su equivalente manual. Las acciones ya marcadas `[x]` entran como completadas; si la sesión es una reanudación, la lista se reconstruye desde la misma consulta. La lista es el instrumento de navegación en vivo: la checklist del plan sigue siendo la fuente de verdad del avance.

### 2. Implementar siguiendo el plan

4. **Recorrer las acciones del plan en su orden**, delegando cada una a un subagente según el paso 5 o ejecutándola directamente cuando la delegación no aplica. Al terminar cada acción —delegada o propia—, confrontar lo hecho con lo planeado: si coincide, marcarla `[x]` en `## Plan técnico` con `tarea.sh marcar-item` de `actualizar-artefactos` y completada en la lista de control antes de continuar; si no, pasar al manejo de desviaciones (paso 7). Con delegaciones en paralelo, la lista de control mantiene varios ítems en progreso a la vez. La checklist es el estado del avance: una ejecución interrumpida se retoma desde el primer ítem sin marcar, sin replanificar.
5. **Delegación por defecto a subagentes:** cada acción del plan se ejecuta en un subagente con capacidad de escritura sobre el mismo árbol de trabajo; el agente actúa como orquestador —prepara el contexto, verifica lo devuelto y marca el avance—. El subagente corre en primer plano o en segundo plano según el arnés; dos acciones delegadas en paralelo deben tocar archivos disjuntos, porque ambas trabajan sobre el mismo árbol de trabajo, y una acción delegada no adelanta a las que la preceden cuando el orden importa. El orquestador ejecuta directamente las acciones acopladas entre sí, las que dependen del entendimiento acumulado del subsistema y las que cuestan más en handoff que en ejecución —la lista es abierta y extensible—. Al delegar:
   - **Handoff:** pasar al subagente la acción y su `Contexto:` inline —no debe tener que adivinar qué parte del plan le toca—, más las rutas del archivo de la tarea —que contiene objetivo, criterios, plan, suite y el resumen del subsistema con sus convenciones— y de la épica si la hay. El subagente lee el archivo de la tarea por sí mismo; el orquestador no le transfiere su razonamiento acumulado.
   - **Retorno:** el subagente realiza el cambio en el código y devuelve la explicación de lo que hizo con la lista de archivos que tocó; no devuelve un diff para que el ejecutor lo aplique.
   - **Verificación y marcado:** el orquestador valora la complejidad del cambio a partir de la explicación devuelta y del tamaño de la acción, y con eso decide si revisa los cambios —reconstruyendo el diff con git desde los archivos tocados— o confía en ellos; solo después marca la acción. El subagente no marca su propio trabajo.
   - **Desviaciones del subagente:** si el subagente reporta que la acción se aparta del plan, la desviación entra al manejo del paso 7 como cualquier otra.
   - **Fallo del subagente:** si el subagente no puede completar la acción, el orquestador la retoma y la ejecuta directamente; el motivo queda registrado en la lista de control.
6. **Cubrir la suite de pruebas esperada** a medida que el comportamiento existe: el orquestador escribe o completa las pruebas que expresan las expectativas de la suite, trazables a los mismos casos de uso —un solo autor mantiene el estilo de la suite coherente—; si el plan declara la cobertura como acción propia, esa acción se delega como cualquier otra.
7. **Manejo de desviaciones:** al detectar que el trabajo se aparta del plan —una acción inviable, una acción que falta, un alcance que crece—, detenerse y:
   - **Registrar la desviación:** qué se apartó, qué evidencia lo motivó.
   - **Decidir el camino:** si la desviación es menor y no cambia el objetivo ni los criterios de la tarea, replanificar la acción afectada sustituyendo su ítem del `## Plan técnico` con `tarea.sh sustituir-item` de `actualizar-artefactos` —los ítems nuevos mantienen el formato de checklist con sus `Aporta:` y `Contexto:`— y la lista de control en consecuencia: el ítem desviado se sustituye por los nuevos; si cambia el objetivo, el alcance o la guía de la épica, pedir confirmación al usuario antes de continuar.

### 3. Cerrar la ejecución

8. **Verificación final contra el plan:** recorrer las acciones del plan y las expectativas de la suite y confirmar que cada ítem quedó marcado o registrado como desviación.
9. **Registrar las desviaciones:** si hubo, agregar `## Desviaciones del plan` al archivo de la tarea con `tarea.sh insertar-seccion` de `actualizar-artefactos` —la operación la coloca inmediatamente antes de `## Revisión`—, con una lista de desviaciones y para cada una su motivo y la decisión tomada.
10. **Informar al usuario** del diff producido y de las desviaciones registradas, listo para la fase de revisión.

## Finalización

El skill ha terminado cuando:

- Las acciones del plan quedaron marcadas `[x]` o registradas como desviaciones.
- La suite de pruebas esperada quedó cubierta por pruebas que expresan sus expectativas.
- Las desviaciones, si las hubo, constan en `## Desviaciones del plan` del archivo de la tarea con motivo y decisión.

## Referencias

- `docs/research/2026-09-flujo-desarrollo.md` — Fase de ejecución con el ajuste aprobado de revisión del plan durante el desarrollo.
- `docs/decisions/D031-flujo-desarrollo-dividido-en-planear-y-ejecutar.md` — El flujo de desarrollo dividido en `planear-tarea` y `desarrollar-tarea` (sustituye a D020).
