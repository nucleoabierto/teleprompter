---
name: prueba-concepto
description: >
  Ejecuta una prueba de concepto: valida una hipótesis técnica con
  código desechable —un test, un script temporal, un prototipo
  mínimo— y produce una conclusión con la evidencia observada, para
  que la planeación se apoye en ejecución real y no solo en lectura.
  Usar cuando el plan técnico o los borradores de una propuesta
  quedan colgados de algo que el código puede responder mejor que la
  investigación teórica, o cuando se pida validar una hipótesis
  técnica con código.
  Sinónimos: prueba de concepto, spike, sondeo técnico, prototipo de
  validación, validación empírica, probar hipótesis.
---

# Probar una hipótesis con código

Instrucciones para que un agente ejecute una prueba de concepto: formule la hipótesis como afirmación falsable, construya la prueba mínima que puede refutarla, observe el resultado y concluya con evidencia. La prueba resuelve incertidumbre activa —lo que la lectura del código y la investigación teórica no responden— y su conclusión alimenta la planeación que la motivó.

## Cuándo usar

- Durante la planeación técnica de una tarea, cuando el plan queda colgado de una hipótesis que el código puede responder: si una API soporta el caso, si un enfoque rinde lo suficiente, si dos piezas encajan como el plan supone.
- Durante el refinamiento de una propuesta, cuando la evidencia que una tarea necesita es activa y no teórica.
- Cuando el usuario pide validar una hipótesis técnica con código antes de decidir.

## Cuándo no usar

- Para evidencia teórica —mejores prácticas, comparación documental, estado del arte—: eso corresponde a `investigar`.
- Para entender el subsistema al planear: eso corresponde a `recopilar-contexto`; la prueba de concepto valida hipótesis, no describe el terreno.
- Para las pruebas de la suite de la tarea: esas las define la `## Suite de pruebas esperada` y las escribe la ejecución; la prueba de concepto es previa y desechable.
- Para implementar la solución: el código de la prueba no entra al producto; la implementación corresponde a `ejecutar-implementacion`.

## Entrada

- La hipótesis a validar, con la decisión de la planeación que depende de su resultado.
- El código base del proyecto evaluado y sus herramientas —test runner, dependencias—.
- El presupuesto de la prueba —tiempo o alcance—, acordado con el usuario o asumido prudente si el arnés no permite acordarlo.

## Salida

- La conclusión: hipótesis confirmada, refutada o matizada, con la evidencia observada —salidas, mediciones, fallos—.
- La conclusión incorporada al artefacto de planeación que motivó la prueba: el plan técnico o la propuesta se ajustan con lo aprendido.
- La ubicación del código desechable producido, para revisarlo o descartarlo.

## Principios rectores

1. **Hipótesis falsable antes que exploración:** la prueba valida una afirmación concreta con criterio de éxito declarado. Si no se puede formular la hipótesis, la incertidumbre es de otro tipo: teórica (`investigar`) o de terreno (`recopilar-contexto`).
2. **Código desechable, conclusión durable:** el código de la prueba no entra al producto y se descarta al cerrar la planeación; lo que persiste es la conclusión, registrada en el plan o la propuesta. Si el usuario pide conservar el código, se ubica donde decida y queda referenciado.
3. **Evidencia, no impresión:** la conclusión cita lo observado —la salida real, la medición, el fallo—, no la sensación de que funciona. Lo observado se registra aunque contradiga lo esperado: ahí está el valor.
4. **Presupuesto explícito:** la prueba tiene techo de tiempo o alcance. Si se agota sin respuesta, la conclusión declara la no-resolución —que también es evidencia: la planeación sabe que la hipótesis sigue abierta y decide con eso—.
5. **La conclusión cambia la planeación o no valía la prueba:** el plan o la propuesta se ajustan con lo aprendido antes de continuar; una prueba cuyo resultado no afecta ninguna decisión no debía ejecutarse.

## Procedimiento

### 1. Formular la hipótesis

1. **Expresar la hipótesis como afirmación falsable** con su criterio de éxito: qué se observaría si es cierta y qué si es falsa —p. ej. «la librería X serializa el modelo completo sin pérdida en menos de 50ms»—.
2. **Identificar la decisión que depende del resultado:** qué acción del plan o qué borrador cambia si la hipótesis se refuta. Si no hay ninguna, no hay prueba que ejecutar: la incertidumbre es curiosidad, no riesgo de la planeación.
3. **Acordar el presupuesto** con el usuario si el arnés lo permite: cuánto tiempo o cuántos intentos merece la pregunta.

### 2. Diseñar la prueba mínima

4. **Elegir la forma más corta que puede refutar la hipótesis:** un test aislado si la incertidumbre es de comportamiento; un script temporal que ejercite la integración real si es de compatibilidad; un prototipo mínimo si es de encaje arquitectónico; una medición si es de rendimiento. La prueba mínima es la que descarta más con menos código.
5. **Ubicar el código fuera del producto:** directorio temporal del arnés o rama desechable, según lo que el arnés permita; nunca dentro del código de producción ni de la suite.

### 3. Ejecutar y concluir

6. **Ejecutar la prueba y registrar lo observado**, no lo esperado: salidas reales, mediciones, errores completos.
7. **Concluir** dentro del presupuesto: confirmada, refutada o matizada —con las condiciones bajo las que vale—. Si el presupuesto se agota sin respuesta, concluir «no resuelta» y declarar qué falta para resolverla.
8. **Ajustar la planeación con la conclusión:** la acción del plan o el borrador afectado se reescriben con lo aprendido —o la decisión que dependía de la hipótesis se replantea—. En la propuesta, el resultado se referencia en «Investigaciones de apoyo»; en el plan, en el resumen del subsistema o en el `Contexto:` de la acción afectada.

### 4. Cerrar

9. **Descartar el código desechable** al cerrar la planeación, salvo que el usuario pida conservarlo.
10. **Informar al usuario** de la conclusión, la evidencia que la sostiene y el ajuste que produjo en la planeación.

## Finalización

El skill ha terminado cuando:

- La hipótesis quedó confirmada, refutada, matizada o declarada no resuelta, con la evidencia observada.
- La planeación que motivó la prueba quedó ajustada con la conclusión, o se informó de que no requería ajuste.
- El código desechable está descartado o su conservación acordada con el usuario.
