---
name: proponer-forma-solucion
description: >
  Determina, dado un problema formulado, la forma que tomaría la
  solución a alto nivel dentro del contexto del producto —categoría,
  alternativas descartadas y fuera de alcance— sin entrar en detalles
  de implementación. Segunda capacidad del flujo de idea a tarea.
  Usar cuando ya se tenga un problema validado con su oportunidad y se
  necesite decidir la forma de la solución antes de descomponerla en
  tareas.
  Sinónimos: proponer solución, forma de solución, categorizar solución,
  enfoque de solución, propuesta de solución.
---

# Proponer la forma de solución

Instrucciones para que un agente determine, dado un problema formulado, la forma que tomaría la solución a alto nivel dentro del contexto del producto, sin entrar en detalles de implementación. Es la segunda capacidad del flujo de idea a tarea: toma la salida de `descubrir-problema` y su salida alimenta el refinamiento con borradores.

## Cuándo usar

- Cuando se tenga un problema validado con su oportunidad y se necesite decidir la forma de la solución.
- Como segunda capacidad del flujo de idea a tarea, invocada por el orquestador del flujo.

## Cuándo no usar

- Cuando la idea aún no está formulada como problema validado: usar `descubrir-problema` primero.
- Para descomponer la solución en tareas: esa es la capacidad siguiente del flujo (refinamiento con borradores).
- Para decidir detalles de implementación (arquitectura, bibliotecas, código): este skill opera a un nivel anterior.
- Cuando la solicitud ya trae la solución articulada y solo falta crear tareas: usar `crear-tareas` en modo independiente.

## Entrada

- El problema y la oportunidad, salida validada de `descubrir-problema`.
- El contexto del producto o del proyecto necesario para situar la solución: visión, flujos y pantallas existentes, convenciones.

## Salida

- **Forma de solución:** qué cambia para el usuario a alto nivel y en qué categoría cae (cambio de UX, cambio de UI, flujo nuevo, paso nuevo en un flujo existente, cambio de proceso o fuera de alcance).
- **Alternativas consideradas:** al menos dos, con la razón de su rechazo.
- **Fuera de alcance:** lista explícita de lo que podría asumirse dentro y no se incluye.
- La salida se presenta al usuario en la conversación; no se crea ningún archivo en esta capacidad. El material pasa a la capacidad siguiente del flujo.

## Principios rectores

1. **Forma, no implementación:** la salida describe qué cambia y dónde encaja en el producto, no cómo se construye. Si la propuesta menciona clases, archivos, comandos o bibliotecas, está un nivel por debajo de lo que corresponde.
2. **Decisión informada:** la forma elegida se justifica contra alternativas reales. Proponer sin alternativas no es decidir, es afirmar.
3. **El fuera de alcance cierra supuestos:** todo lo que un lector razonable podría asumir incluido y no lo está queda listado explícitamente.
4. **Fuera de alcance también es una respuesta:** si la forma correcta es no hacer nada en este producto, la capacidad lo dice y la propuesta termina ahí.
5. **Validación explícita:** la capacidad no termina hasta que el usuario confirma que la forma de solución es la correcta; si el arnés no permite el diálogo, se presenta con las suposiciones declaradas. El agente no decide solo.

## Procedimiento

### 1. Situar la solución en el producto

1. **Recuperar el contexto del producto** necesario: qué flujos, pantallas o procesos existen hoy donde el problema se manifiesta.
2. **Determinar la forma que tomaría la solución** dentro de ese contexto: qué cambia para el usuario y dónde.

### 2. Categorizar

3. **Asignar la categoría** según las definiciones de `references/categorias-solucion.md`: cambio de UX, cambio de UI, flujo nuevo, paso nuevo en un flujo existente, cambio de proceso o fuera de alcance. Si ninguna encaja, proponer la categoría nueva con su definición y validarla con el usuario.
4. **Si la categoría es fuera de alcance,** justificarlo, validarlo con el usuario y terminar sin forma de solución.

### 3. Considerar alternativas

5. **Listar al menos dos alternativas** a la forma elegida. Deben ser formas distintas de resolver el mismo problema, no variaciones de la misma idea.
6. **Documentar la razón de rechazo de cada alternativa:** por qué la forma elegida la supera para este problema y este contexto.

### 4. Definir el fuera de alcance

7. **Listar explícitamente lo que queda fuera.** Pensar en lo que un lector podría dar por incluido: extensiones naturales, casos límite, mejoras adyacentes.

### 5. Formular y validar

8. **Redactar la salida** según el «Formato de salida»: forma de solución, alternativas y fuera de alcance. Verificar contra `references/categorias-solucion.md` que la forma no contiene detalles de implementación.
9. **Revisar la redacción y pulir mecánicamente** el borrador. Si el arnés lo permite, invocar `revisar-redaccion` en modo preventivo y, con su salida, `pulir-escritura` en modo preventivo; de lo contrario, realizar el equivalente manualmente.
10. **Presentar la salida al usuario** y preguntar si la forma de solución es la correcta. Si el arnés no permite el diálogo interactivo, presentar la propuesta con las suposiciones declaradas explícitamente.
11. **Si el usuario pide cambios,** ajustar y repetir desde el paso correspondiente.
12. **Si el usuario aprueba,** entregar la salida (forma de solución + alternativas + fuera de alcance) a quien invocó el skill: el usuario, para continuar con el refinamiento con borradores, o el orquestador del flujo de idea a tarea.
13. **Si el usuario decide no continuar,** terminar sin salida.

## Formato de salida

```markdown
## Forma de solución

[Un párrafo. Qué cambia para el usuario y dónde encaja en el producto.
Categoría: cambio de UX | cambio de UI | flujo nuevo | paso nuevo en un
flujo existente | cambio de proceso. Sin detalles de implementación.]

## Alternativas consideradas

- [Alternativa 1]: [por qué se descarta].
- [Alternativa 2]: [por qué se descarta].

## Fuera de alcance

- [Lo que explícitamente no se incluye.]
```

Si la categoría resulta ser fuera de alcance, la salida es solo la justificación de esa conclusión: no hay forma de solución, alternativas ni fuera de alcance que listar.

## Finalización

El skill ha terminado cuando ocurre una de estas tres cosas:

- El usuario ha validado la forma de solución, las alternativas y el fuera de alcance, y la salida se ha entregado a la capacidad siguiente del flujo.
- La categoría resultó ser fuera de alcance y el usuario validó esa conclusión.
- El usuario decidió no continuar.

## Referencias

- `references/categorias-solucion.md` — Definiciones de las categorías de forma de solución, lista de verificación de nivel de abstracción y un ejemplo completo. Leer al categorizar y al redactar la salida.
