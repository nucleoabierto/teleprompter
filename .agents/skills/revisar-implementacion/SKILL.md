---
name: revisar-implementacion
description: >
  Revisión técnica de la implementación de una tarea de
  desarrollo: un subagente de contexto aislado revisa el diff
  contra las convenciones del proyecto y los archivos hermanos
  o de funcionalidad similar, y produce un informe con veredicto.
  Usar en el paso de revisión del ciclo de tareas cuando la tarea
  es de tipo desarrollo o mantenimiento (refactoring).
  Sinónimos: revisar implementación, revisión de código,
  revisión técnica del diff, revisión adversarial.
---

# Revisar implementación

Instrucciones para que un agente someta la implementación de una tarea de desarrollo a revisión técnica por un subagente independiente. El revisor arranca con contexto aislado —recibe el archivo de la tarea y dónde están los cambios, no el razonamiento del ejecutor— y reconstruye el diff por sí mismo desde git, con un rol explícitamente adversarial: verifica los criterios de calidad y la consistencia del diff con las convenciones del proyecto y con los archivos hermanos o de funcionalidad similar, y produce un informe con veredicto.

## Cuándo usar

- En el paso de revisión del ciclo de `ejecutar-tareas`, cuando la tarea en revisión se enrutó al sub-flujo de desarrollo (tipo `desarrollo` o `mantenimiento (refactoring)`).
- Cuando el usuario pida revisar una implementación concreta contra las convenciones del proyecto.

## Cuándo no usar

- Para tareas que no producen un diff de código (documentación, investigación, procesos): la revisión técnica general del ciclo las cubre.
- Para ejecutar las puertas mecánicas del proyecto (tests, lint, build): esa capa de la revisión está pospuesta.

## Entrada

- La ubicación de los cambios de la tarea: árbol de trabajo sin commitear (`git status` y `git diff`, incluidos los archivos nuevos) o el rango de commits de la tarea si ya están commiteados.
- El archivo de la tarea: objetivo, criterios de calidad y las secciones del sub-flujo de desarrollo —contexto, conectividad, plan, suite y desviaciones—, que son el objeto de la verificación nominal cuando existen.
- El código base del subsistema afectado, para la comparación con archivos hermanos.

## Salida

- Un informe de revisión con: cada criterio de calidad verificado contra el diff, la verificación nominal del plan —cada acción del plan técnico y cada expectativa de la suite de pruebas esperada contra su realización en el diff o su desviación registrada—, los hallazgos —cada uno citando la regla o el patrón concreto que infringe— y un veredicto: aprueba o solicita cambios.

## Principios rectores

1. **Contexto aislado:** el revisor ve el diff y los criterios, no el razonamiento del ejecutor; la separación de contextos es lo que neutraliza el sesgo de autoaprobación.
2. **Rol adversarial:** el revisor busca problemas, no confirma el trabajo; pero «no hay hallazgos» es un veredicto válido —un revisor obligado a producir hallazgos acaba inventándolos.
3. **Consistencia con el código base:** el diff se juzga también contra los archivos hermanos o de funcionalidad similar, no solo contra el enunciado de la tarea; el patrón canónico se extrae del código existente.
4. **Hallazgos citados:** cada hallazgo nombra la regla declarada del proyecto o el patrón concreto que infringe; una observación sin anclaje en una regla o patrón no es un hallazgo.
5. **La revisión no corre puertas ni reescribe:** el revisor no ejecuta las puertas mecánicas ni modifica el código; su ejecución se limita a reconstruir el diff con git y a consultas puntuales, y su producto es el informe.

## Procedimiento

### 1. Preparar el encargo

1. **Determinar dónde están los cambios** de la tarea: si están sin commitear, el árbol de trabajo (`git status`, `git diff`); si ya están commiteados, el rango de commits de la tarea por sus hashes. Esa ubicación —no el contenido del diff— es lo que se pasa al revisor.
2. **Reunir el archivo de la tarea** con su objetivo, criterios de calidad y las secciones del sub-flujo de desarrollo que existan (contexto, conectividad, plan técnico, suite, desviaciones).

### 2. Lanzar el revisor independiente

3. **Lanzar un subagente de contexto aislado y con capacidad de ejecutar comandos** —los necesita para obtener el diff con git por sí mismo— que recibe únicamente el archivo de la tarea y la ubicación de los cambios, sin el razonamiento del ejecutor. Su encargo:
   - **Obtener el diff por sí mismo** con git a partir de la ubicación indicada, incluidos los archivos nuevos.
   - **Verificar cada criterio de calidad** del archivo de tarea contra el diff.
   - **Revisar la consistencia con el código base:** leer al menos los archivos hermanos o de funcionalidad similar relevantes y comprobar que el diff sigue los patrones vigentes (estructura, nombrado, manejo de errores, estilo).
   - **Revisar las reglas declaradas del proyecto** que apliquen al cambio.
   - **Cotejar contra las lecciones aprendidas:** identificar las lecciones cuyos disparadores coincidan con los archivos y acciones del diff —la consulta por disparadores la resuelve `consultar-artefactos`—, leer las notas y verificar que el diff no repite errores ya aprendidos —aunque el ejecutor las haya aplicado bien, la revisión confirma independientemente.
   - **Verificar el plan nominalmente:** confrontar cada acción del plan técnico —enumerable con «las acciones del plan con su marca» de `consultar-artefactos`— con su realización en el diff y cada expectativa de la suite de pruebas esperada con la prueba que la cubre. Una acción no realizada solo es aceptable si figura en la sección de desviaciones con su motivo y decisión: la desviación registrada cuenta como realización declarada, y el revisor verifica que el registro exista y sea coherente con el diff.
   - **Distinguir en el veredicto:** «plan no seguido sin desviación registrada» es un hallazgo que solicita cambios; «desviación registrada» se reporta como tal y puede requerir confirmación del usuario en la puerta de ejecución.
   - **Buscar problemas no previstos:** invariantes rotos, casos borde ignorados, discrepancias entre lo declarado en la tarea y lo implementado.
   - **Producir el informe:** criterios verificados, verificación nominal del plan, hallazgos con la regla o patrón infringido citado, y veredicto.

### 3. Interpretar el informe

4. **Si el veredicto es solicita cambios:** corregir los problemas y repetir la revisión desde el paso 1 con el diff actualizado.
5. **Si el veredicto es aprueba:** devolver el informe al invocador junto con el resumen del trabajo. Sus observaciones alimentan los puntos de atención de la descripción del pull request; la aprobación humana del cambio corre por `gestionar-pr` —la puerta de ejecución—, no por la sesión.

## Finalización

El skill ha terminado cuando:

- El subagente produjo su informe con veredicto.
- Los cambios solicitados se corrigieron y se repitió la revisión, o el informe aprobado se devolvió al invocador.

## Referencias

- `docs/research/2026-09-flujo-desarrollo.md` — Fase de revisión contra convenciones, archivos hermanos y plan; la capa mecánica sigue pospuesta.
- `docs/research/flujo-revision-tareas.md` — Revisión dual, separación de contextos y rol adversarial del revisor.
- `docs/decisions/D031-flujo-desarrollo-dividido-en-planear-y-ejecutar.md` — La revisión de implementación como skill separado, invocado en el paso de revisión del ejecutor (sustituye a D020).
