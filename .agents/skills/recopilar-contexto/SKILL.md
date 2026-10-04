---
name: recopilar-contexto
description: >
  Reúne el contexto que una tarea de desarrollo necesita para
  planearse y ejecutarse con coherencia con el proyecto —el
  terreno del codebase y lo que la documentación y la memoria
  del proyecto ya declaran— y lo registra en el archivo de la
  tarea.
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
- El plan técnico de la épica que agrupa la tarea, si existe, y su PRD —`docs/prd/NNN-slug.md`, los casos de uso y el comportamiento esperado declarados— si lo tiene.
- Las capacidades de recuperación `consultar-lecciones` y `consultar-decisiones`.
- La documentación viva del proyecto evaluado: `docs/domains/` para el modelo del dominio y el directorio de documentación de producto para el comportamiento observable, si existen.

## Salida

- Una sección `## Contexto` agregada al archivo de la tarea, antes de la sección Revisión. Las fuentes habituales son siete —archivos similares identificados, patrones vigentes a seguir, documentación de dominio aplicable, documentación de producto aplicable, el PRD del conjunto cuando existe, lecciones aplicables y decisiones aplicables— y la lista es abierta: otra fuente pertinente al trabajo se añade como bullet propio.

## Principios rectores

1. **Recopilar, no planear:** el contexto describe el terreno —qué hay, qué patrones siguen, qué ya se decidió— sin decidir cómo actuar; las decisiones de implementación pertenecen a la planeación.
2. **Un solo artefacto por tarea:** el contexto vive en el archivo de la tarea, no en documentos paralelos.
3. **Las fuentes son guía, no corsé:** la lista —archivos similares, patrones, documentación de dominio, documentación de producto, el PRD del conjunto, lecciones y decisiones— es abierta y extensible; una fuente pertinente al trabajo que no figure se recopila igual. Si una fuente no aporta nada, se declara en lugar de forzar contenido.
4. **Sin repetir lo indexado:** documentos, lecciones y decisiones se citan por su ruta, nombre o identificador con una frase de por qué aplican; su contenido completo vive en sus archivos.
5. **Recolección idempotente:** si la tarea ya tiene `## Contexto` —su presencia se consulta con la operación `secciones` de `consultar-artefactos`—, no se rehace desde cero; se revisa y se enriquece solo donde falte.

## Procedimiento

1. **Leer el archivo de la tarea** para fijar qué se va a construir o cambiar y qué archivos previsiblemente tocará.
2. **Localizar los archivos del subsistema:** los que la tarea tocará y los archivos hermanos o de funcionalidad similar que sirven de modelo.
3. **Resumir los patrones vigentes** observados en esos archivos: estructura, convenciones y puntos de extensión que la tarea debe seguir.
4. **Localizar la documentación aplicable** partiendo de los índices de cada directorio: los documentos de `docs/domains/` —con su `README.md` como índice— que describen el dominio que la tarea toca, los del directorio de documentación de producto —funcionalidades, guías, referencia— que describen el comportamiento afectado y el PRD del conjunto de la tarea —`docs/prd/NNN-slug.md`— con los casos de uso `CU-N` que la tarea toca. Si el proyecto no tiene esos directorios o el conjunto no tiene PRD, la fuente correspondiente se declara sin aportación.
5. **Recuperar lecciones y decisiones** invocando `consultar-lecciones` y `consultar-decisiones` con la descripción del trabajo —archivos a tocar, tipo de acción, palabras clave.
6. **Escribir la sección `## Contexto`** en el archivo de la tarea —cuando no existe, insertada antes de `## Revisión` con `tarea.sh insertar-seccion` de `actualizar-artefactos`; cuando ya existe, enriquecida en su sitio—, con un bullet por fuente y sub-bullets para sus elementos:
   - `Archivos similares:` rutas de los archivos hermanos que sirven de modelo, con una frase de qué aportan.
   - `Patrones:` las convenciones vigentes que la implementación debe seguir.
   - `Dominio:` los documentos de `docs/domains/` aplicables, citados por ruta, con el concepto, invariante o frontera que rige el cambio.
   - `Producto:` los documentos de producto aplicables, citados por ruta, con la funcionalidad, flujo o referencia de uso que el cambio afecta.
   - `PRD:` los casos de uso `CU-N` del conjunto que la tarea toca, con el comportamiento esperado que declaran.
   - `Lecciones:` las notas aplicables, citadas por su nombre, con la regla concreta que aplicar.
   - `Decisiones:` las decisiones vigentes que rigen el cambio, citadas por su identificador, con lo que declaran.
   Las fuentes sin aportaciones se declaran («ninguna aplica») en lugar de omitirse, y una fuente pertinente no listada se añade como bullet propio.
7. **Informar al usuario** del contexto recopilado y de cualquier vacío detectado —archivos que no existen, patrones contradictorios, documentación desfasada— que pueda afectar a la planeación.

## Finalización

El skill ha terminado cuando:

- El archivo de la tarea contiene la sección `## Contexto` con las fuentes cubiertas o declaradas sin aportación.
- Los vacíos detectados se comunicaron al usuario.
