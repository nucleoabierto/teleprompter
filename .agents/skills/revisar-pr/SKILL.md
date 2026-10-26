---
name: revisar-pr
description: >
  Revisión independiente de un pull request del proyecto evaluado:
  un subagente de contexto aislado reconstruye el diff, el historial
  y los hilos de revisión existentes, confronta el cambio con la
  intención declarada, las convenciones, los archivos hermanos y las
  lecciones del proyecto, y produce un informe persistido con
  hallazgos por severidad y un veredicto.
  Usar cuando se pida revisar un pull request, evaluar un PR ajeno
  u obtener un veredicto fundamentado sobre un PR.
  Sinónimos: revisar PR, revisar pull request, revisión de PR,
  revisar un PR ajeno, informe de revisión de PR.
---

# Revisar PR

Instrucciones para que un agente someta un *pull request* del proyecto evaluado —lo haya producido el ciclo de tareas o no— a una revisión independiente por un subagente de contexto aislado con rol adversarial. El revisor reconstruye el diff y la intención del cambio, lo confronta con las convenciones, los archivos hermanos y la memoria del proyecto, y produce un informe persistido con hallazgos por severidad y un veredicto. Es el bloque revisor de la revisión como capacidad del producto: el informe alimenta la decisión del usuario y la capacidad hermana que publica comentarios.

## Cuándo usar

- Cuando el usuario pida revisar un *pull request* del proyecto evaluado —abierto por otro agente, un colaborador o cualquier flujo—.
- Cuando se quiera un veredicto fundamentado sobre si un PR está listo, antes de comentarlo, pedir cambios o fusionarlo.

## Cuándo no usar

- Para la revisión técnica de una tarea del ciclo de desarrollo: corresponde a `revisar-implementacion`, cuyo contrato es el archivo de tarea.
- Para diffs que no son un *pull request* —el árbol de trabajo local, rangos de commits—.
- Para producir comentarios publicables a partir del informe: corresponde a `comentar-pr`.
- Para ejecutar las puertas mecánicas del proyecto evaluado (tests, lint, build): el skill es solo análisis.
- En repositorios sin remoto GitHub o sin `gh` autenticado: la revisión opera sobre el PR en la plataforma.

## Entrada

- La referencia del PR: su número, o la rama actual cuando el usuario no da número.
- `gh` autenticado contra el remoto del repositorio evaluado.

## Salida

- Un informe de revisión persistido en el directorio de informes de revisión de PR del proyecto evaluado —`.git/factory/pr-reviews` por defecto, literal embebido—, nombrado `pr-<numero>-<fecha>.md` con la fecha en `yyyymmdd`; el nombre admite re-revisiones del mismo PR y, si el archivo ya existe, lleva un sufijo ordinal al final (`pr-<numero>-<fecha>-2.md`, `-3`…) para no sobrescribirlo. El informe sigue la plantilla `assets/informe.md` —cabecera, resumen del cambio, intención reconstruida con sus fuentes, hallazgos por severidad, preguntas abiertas y veredicto único (`merge`/`improve`/`blocked`)— y es estado local efímero: con el valor por defecto de la convención queda bajo el directorio git del repositorio, fuera del control de versiones, y `gestionar-pr` lo elimina al cerrar el PR —un cierre por otra vía puede dejarlo huérfano; borrarlo a mano no tiene efecto—.
- El resumen del veredicto en chat, con la ruta del informe.

## Principios rectores

1. **Contexto aislado:** el revisor recibe la referencia del PR y reconstruye todo por sí mismo —diff, intención, hilos—; no ve el razonamiento del agente que lo invoca. La separación de contextos es lo que neutraliza el sesgo de autoaprobación.
2. **Rol adversarial:** el revisor busca problemas, no confirma el trabajo; pero «no hay hallazgos» es un veredicto válido —un revisor obligado a producir hallazgos acaba inventándolos—.
3. **Intención reconstruida, no supuesta:** contra qué se juzga el cambio sale de la descripción del PR y de los artefactos del proyecto; lo no reconstruible va a preguntas abiertas, nunca a suposiciones.
4. **Sin duplicar lo resuelto:** los hilos ya resueltos no vuelven al informe; un hallazgo que repite feedback resuelto es ruido para el autor.
5. **Hallazgos citados:** cada hallazgo nombra la regla declarada del proyecto o el patrón concreto que infringe; una observación sin anclaje en una regla o patrón no es un hallazgo.
6. **Solo análisis:** el skill no publica comentarios, no corrige código y no fusiona; la publicación corre por `comentar-pr` y el merge es una puerta humana.

## Procedimiento

### 1. Resolver el PR y la ubicación del informe

1. **Resolver el PR:** con número dado, `gh pr view <n>`; sin número, el PR de la rama actual con `gh pr view`. Si el número no resuelve a un PR —inexistente o inaccesible— o la rama no tiene PR, informar de que no hay nada que revisar y terminar. El invocador solo necesita el número —para el nombre del informe—; todo lo demás lo reconstruye el revisor.
2. **Resolver la ubicación del informe:** el directorio de informes de revisión de PR —`.git/factory/pr-reviews` por defecto, literal embebido—, crearlo si no existe y fijar el nombre `pr-<numero>-<fecha>.md` con la fecha del día en `yyyymmdd` —con el sufijo ordinal si el archivo ya existe—. Cuando el valor resuelto empieza por `.git/`, sustituir ese prefijo por el directorio git real del repositorio —`git rev-parse --git-common-dir`—: en *worktrees* y submódulos `.git` es un archivo, no un directorio.

### 2. Lanzar el revisor independiente

3. **Lanzar un subagente de contexto aislado y con capacidad de ejecutar comandos** —los necesita para `gh` y `git`— que recibe únicamente la referencia del PR, la ruta del informe y la ruta de la plantilla `assets/informe.md`, sin el razonamiento del agente. Su encargo, con el alcance acotado a los puntos de mayor riesgo:
   - **Reconstruir el diff y el historial** del PR por sí mismo: `gh pr diff <n>` y los commits de la rama contra su base.
   - **Reconstruir la intención del cambio** desde la descripción del PR y los artefactos del proyecto evaluado cuando existan —la tarea o épica referenciada, la documentación de dominio o de producto afectada, las reglas declaradas—; la lista de fuentes es abierta. Lo no reconstruible va a preguntas abiertas; si impide juzgar con justicia, el veredicto es `blocked`.
   - **Cargar los comentarios de revisión existentes** —hilos inline abiertos y resueltos (el estado lo expone la API GraphQL en `reviewThreads.isResolved`), comentarios de nivel PR y cuerpos de reviews (`gh pr view <n> --comments`)— para no duplicar feedback ya resuelto.
   - **Revisar la consistencia con el código base:** leer una muestra de los archivos hermanos o de funcionalidad similar **del árbol del PR —su rama head, nunca el checkout local, que puede estar en cualquier rama**— y comprobar que el diff sigue los patrones vigentes (estructura, nombrado, manejo de errores, estilo); si el checkout estuviera en la propia head, leer los hermanos por `git show <head>:<ruta>` o el ref del PR, porque el árbol local ya contiene el diff y la comparación sería circular.
   - **Revisar las reglas declaradas del proyecto** que apliquen al cambio.
   - **Cotejar contra las lecciones aprendidas:** identificar las lecciones cuyos disparadores coincidan con los archivos y acciones del diff —la consulta por disparadores la resuelve `consultar-artefactos`— y verificar que el diff no repite errores ya aprendidos.
   - **Buscar problemas no previstos:** casos borde ignorados, efectos de segundo orden sobre llamantes e invariantes, discrepancias entre la intención reconstruida y lo implementado.
   - **Producir el informe** en la ruta indicada, siguiendo la plantilla recibida, y devolver el veredicto con un resumen.

### 3. Entregar

4. **Presentar el resumen del veredicto** al usuario con la ruta del informe persistido y sus hallazgos por severidad. La decisión sobre el PR queda del usuario: publicar comentarios corresponde a `comentar-pr` y fusionar es una puerta humana.

## Finalización

El skill ha terminado cuando:

- El informe está persistido en el directorio de informes de revisión de PR, con hallazgos por severidad, preguntas abiertas y un único veredicto.
- El usuario recibió el resumen del veredicto y la ruta del informe.

## Referencias

- `assets/informe.md` — Plantilla del informe de revisión; el subagente la sigue al producirlo.
- `.agents/skills/revisar-implementacion/SKILL.md` — La revisión interna del ciclo de tareas, de la que este skill toma los principios sin el contrato de archivo de tarea.
