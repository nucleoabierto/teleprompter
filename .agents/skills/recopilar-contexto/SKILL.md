---
name: recopilar-contexto
description: >
  Reúne el contexto que una tarea de desarrollo necesita para
  planearse y ejecutarse con coherencia —archivos similares,
  patrones vigentes del codebase, lecciones y decisiones
  aplicables— y lo registra en la sección Contexto del archivo
  de la tarea.
  Usar como paso previo a la planeación en el sub-flujo de
  desarrollo, o cuando el usuario pida preparar el contexto de
  una tarea concreta.
  Sinónimos: recopilar contexto, recoger contexto, preparar
  contexto de la tarea, brief de contexto.
---

# Recopilar contexto

Instrucciones para que un agente reúna el contexto que una tarea de desarrollo necesita antes de planearse, y lo deje registrado en el archivo de la tarea. La recolección lee y resume; no planea ni ejecuta.

## Cuándo usar

- Como paso previo a la planeación en el sub-flujo de desarrollo, invocado por `planear-tarea` antes de `planear-implementacion`.
- Cuando el usuario pida preparar el contexto de una tarea concreta, dentro o fuera del ciclo de ejecución.

## Cuándo no usar

- Para tareas que no modifican código (investigación, documentación, mantenimiento de proceso): su contexto lo recupera el ejecutor general al leer la tarea.
- Para recuperar solo lecciones o solo decisiones: usar `consultar-lecciones` o `consultar-decisiones` directamente.
- Para planear la implementación: eso corresponde a `planear-implementacion`, que consume el contexto recopilado aquí.

## Entrada

- El archivo de la tarea (`docs/tasks/NNN-slug.md`), con su objetivo, entrada y resultado esperado.
- El plan técnico de la épica que agrupa la tarea, si existe.
- Las capacidades de recuperación `consultar-lecciones` y `consultar-decisiones`.

## Salida

- Una sección `## Contexto` agregada al archivo de la tarea, antes de la sección Revisión, con cuatro fuentes: archivos similares identificados, patrones vigentes a seguir, lecciones aplicables y decisiones aplicables.

## Principios rectores

1. **Recopilar, no planear:** el contexto describe el terreno —qué hay, qué patrones siguen, qué ya se decidió— sin decidir cómo actuar; las decisiones de implementación pertenecen a la planeación.
2. **Un solo artefacto por tarea:** el contexto vive en el archivo de la tarea, no en documentos paralelos.
3. **Las cuatro fuentes:** el contexto cubre archivos similares, patrones, lecciones y decisiones; si una fuente no aporta nada, se declara en lugar de forzar contenido.
4. **Sin repetir lo indexado:** lecciones y decisiones se citan por su nombre o identificador con una frase de por qué aplican; su contenido completo vive en sus archivos.
5. **Recolección idempotente:** si la tarea ya tiene `## Contexto`, no se rehace desde cero; se revisa y se enriquece solo donde falte.

## Procedimiento

1. **Leer el archivo de la tarea** para fijar qué se va a construir o cambiar y qué archivos previsiblemente tocará.
2. **Localizar los archivos del subsistema:** los que la tarea tocará y los archivos hermanos o de funcionalidad similar que sirven de modelo.
3. **Resumir los patrones vigentes** observados en esos archivos: estructura, convenciones y puntos de extensión que la tarea debe seguir.
4. **Recuperar lecciones y decisiones** invocando `consultar-lecciones` y `consultar-decisiones` con la descripción del trabajo —archivos a tocar, tipo de acción, palabras clave.
5. **Escribir la sección `## Contexto`** en el archivo de la tarea, con un bullet por fuente y sub-bullets para sus elementos:
   - `Archivos similares:` rutas de los archivos hermanos que sirven de modelo, con una frase de qué aportan.
   - `Patrones:` las convenciones vigentes que la implementación debe seguir.
   - `Lecciones:` las notas aplicables, citadas por su nombre, con la regla concreta que aplicar.
   - `Decisiones:` las decisiones vigentes que rigen el cambio, citadas por su identificador, con lo que declaran.
   Las fuentes sin aportaciones se declaran («ninguna aplica») en lugar de omitirse.
6. **Informar al usuario** del contexto recopilado y de cualquier vacío detectado —archivos que no existen, patrones contradictorios— que pueda afectar a la planeación.

## Finalización

El skill ha terminado cuando:

- El archivo de la tarea contiene la sección `## Contexto` con las cuatro fuentes cubiertas o declaradas sin aportación.
- Los vacíos detectados se comunicaron al usuario.
