---
name: gestionar-pr
description: >
  Gestiona el pull request de una tarea como vehículo de revisión: lo abre
  con una descripción orientada al revisor —qué cambia, por qué, dónde
  mirar y qué feedback se pide—, conduce el bucle de comentarios como un
  plan de mejoras que devuelve el trabajo a revisión hasta la aprobación,
  y lo fusiona tras la puerta de cierre. Usar en el cierre de una tarea
  —apertura tras la aprobación de la revisión técnica, cierre tras la
  aprobación del paquete— o cuando se pida abrir, atender o fusionar un
  pull request.
  Sinónimos: abrir PR, crear pull request, atender comentarios del PR,
  bucle de revisión del PR, fusionar PR, merge de la tarea.
---

# Gestionar PR

Instrucciones para que un agente gestione el pull request de una tarea como vehículo de revisión del cambio. Tiene dos momentos de invocación: la **apertura** —commitea el trabajo en la rama, abre el PR con una descripción orientada al revisor y conduce el bucle de comentarios hasta que el usuario lo aprueba— y el **cierre** —fusiona el PR tras la aprobación del paquete de cierre y deja el repositorio en la rama principal—. El PR es un punto de revisión adicional sobre el cambio ejecutado, no un instrumento de alineación ni de planeación: el plan aprobado ya vive en el archivo de la tarea y no se resume en la descripción.

## Cuándo usar

- En el ciclo de `ejecutar-tareas`, en sus dos momentos: la apertura, cuando la revisión técnica de la tarea aprueba; el cierre, cuando el usuario aprueba el paquete de cierre tras los sensores.
- Cuando el usuario pida abrir, atender los comentarios o fusionar un pull request.

## Cuándo no usar

- Como herramienta de alineación o planeación: la descripción del PR no sustituye al plan aprobado ni lo renegocia.
- En repositorios sin remoto GitHub o sin `gh` autenticado: el skill opera sobre `gh` y el remoto del repositorio.
- Para la revisión técnica independiente: corresponde a `revisar-implementacion` o al subagente genérico del ciclo, que corren antes de la apertura.

## Entrada

- El archivo de la tarea: objetivo, criterios de calidad y las secciones del sub-flujo de desarrollo cuando existen —de él salen el qué y el porqué de la descripción—.
- El informe de la revisión técnica aprobada: sus observaciones alimentan los puntos de atención para el revisor.
- La rama de la tarea —creada por el ejecutor al inicio de la iteración— con el trabajo en el árbol, commiteado o sin commitear.
- El resultado de las pruebas o verificaciones ejecutadas durante la tarea, si las hubo.

## Salida

- Apertura: un PR abierto en GitHub con descripción orientada al revisor, aprobado por el usuario —la puerta de ejecución del ciclo— tras el bucle de comentarios que haga falta; se informa al invocador del número del PR y del bucle corrido.
- Cierre: el PR fusionado en la rama principal con un solo commit, la rama de la tarea eliminada y el repositorio local de vuelta en la rama principal actualizada.

## Principios rectores

1. **El PR revisa el cambio, no el plan:** la descripción orienta al revisor sobre el diff —qué cambia, por qué, dónde mirar—; el plan aprobado y las desviaciones ya están en el archivo de la tarea y no se resumen.
2. **El revisor es el usuario:** la aprobación del PR es una puerta humana; ni el agente ni una herramienta automática aprueban en su nombre.
3. **Comentarios como plan de mejoras:** cada ronda de comentarios se clasifica y se convierte en acciones concretas; el trabajo modificado vuelve a revisión, no se da por bueno.
4. **Rondas por lotes:** los comentarios de una ronda se procesan juntos —un plan de mejoras, los cambios agrupados en commits, una respuesta por comentario y una nueva pasada de revisión—.
5. **Una rama por tarea:** todo el ciclo —trabajo, rondas de comentarios, escrituras de los sensores, cierre— aterriza en la rama de la tarea; el merge squash deja un commit por tarea en la principal.

## Procedimiento

### Apertura

1. **Commitear el trabajo** de la tarea en la rama —si aún está sin commitear— con el skill `commit`, incluyendo solo los cambios de la tarea —con las marcas de estado de su archivo—: el árbol puede contener cambios ajenos que no entran. Empujar la rama con `git push -u origin <rama>`.
2. **Componer la descripción orientada al revisor** con el material de la entrada:
   - **Qué cambia y por qué:** el objetivo y el resultado de la tarea, en una o dos frases.
   - **Puntos de atención:** lo que la revisión técnica observó o donde el cambio merece mirada —las zonas del diff a revisar, no un resumen de archivos tocados—.
   - **Cómo navegar el cambio:** orden de lectura sugerido cuando el diff abarca varios archivos.
   - **Pruebas:** qué verificaciones corrieron y su resultado, o la declaración de que el cambio no las tiene.
   - **Capturas o evidencia visual:** cuando el cambio toca UI.
   - **Feedback pedido:** qué tipo de revisión se espera —corrección, enfoque, cobertura—; pedir un tipo de feedback concreto es lo que más diferencia una descripción eficaz.
   - Referencia al archivo de la tarea para el plan y las desviaciones, sin reescribirlos.
3. **Crear el PR** con `gh pr create` —título igual al asunto de Conventional Commits de la tarea, porque el merge squash lo usará como commit en la rama principal; cuerpo igual a la descripción— y presentar su URL al usuario. Si la rama ya tiene un PR abierto —una iteración retomada tras la apertura—, no se crea otro: `gh pr view` recupera su número y el bucle continúa desde el paso siguiente.
4. **Conducir el bucle de comentarios** hasta la aprobación. Cuando el usuario indique que dejó sus comentarios —o una pasada por `gh pr view <n> --comments` y `gh api repos/:owner/:repo/pulls/<n>/comments` muestre comentarios o reviews nuevas—:
   - **Clasificar cada comentario:** bloqueante → cambio que debe entrar; pregunta → se responde clarificando el código —si la respuesta sería «lee el hilo», el código falló y se mejora—; sugerencia o detalle menor → se aplica, o se justifica en el hilo por qué no se aplica; fuera de alcance → se da de alta con `crear-tareas` y se responde con la referencia; desacuerdo → se escala al usuario en la conversación.
   - **Formular el plan de mejoras:** la lista comentario → acción, presentada al usuario antes de tocar código.
   - **Ejecutar y verificar:** implementar las acciones, correr las verificaciones que correspondan y commitear la ronda en la rama con `commit`; `git push`.
   - **Responder y resolver:** una respuesta por comentario —qué cambió o la justificación— y los hilos atendidos se resuelven.
   - **Devolver a revisión:** pedir al usuario la nueva pasada; un cambio sustantivo exige revisión nueva, no se asimila en silencio.
5. **Confirmar la aprobación:** el usuario la comunica en sesión, o `gh pr view <n> --json reviews` muestra una review `APPROVED`. Informar al invocador del número del PR y del bucle corrido —rondas y comentarios atendidos—.

### Cierre

1. **Recibir la aprobación del paquete de cierre** del invocador: la puerta de cierre pertenece a `ejecutar-tareas`, este skill no la repite.
2. **Empujar la rama** con `git push`, para que el merge remoto incluya los últimos commits —los veredictos de la sección de revisión entre ellos—.
3. **Fusionar el PR** con `gh pr merge <n> --squash --delete-branch`, fijando el mensaje del commit resultante con `--subject` y `--body`: el commit del squash es el único que queda de la tarea en la rama principal, así que su mensaje se redacta con las reglas del skill `commit` —asunto convencional, el del título del PR, y cuerpo que explica el qué y el porqué del cambio completo—; sin fijarlo, el cuerpo por defecto concatena los mensajes de todos los commits de la rama, rondas y escrituras de sensores incluidas. El cuerpo termina con el pie `Closes #<n>` para que el commit conserve la referencia al PR que lo produjo. La opción `--delete-branch` borra la rama —local y remota— dejando la principal activa.
4. **Traer el merge:** `git pull` en la rama principal.
5. **Limpiar el informe local del PR:** si el PR fusionado tiene informes de `revisar-pr` en el directorio de informes de revisión de PR —`.git/factory/pr-reviews` por defecto, literal embebido— —archivos `pr-<n>-*.md`—, eliminarlos; cuando el valor resuelto empieza por `.git/`, sustituir ese prefijo por el directorio git real —`git rev-parse --git-common-dir`—, que en *worktrees* y submódulos `.git` es un archivo, no un directorio. El informe es estado local efímero y no sobrevive al cierre —un merge por otra vía puede dejarlo huérfano; borrarlo a mano no tiene efecto—.
6. **Informar** del merge y del estado del repositorio.

## Finalización

- Apertura: el PR está abierto, el usuario lo aprobó tras el bucle de comentarios y el invocador recibió el número de PR y el resumen del bucle.
- Cierre: el PR está fusionado, la rama eliminada, el repositorio local en la rama principal actualizada y los informes locales del PR eliminados si existían.

## Referencias

- `docs/research/2026-10-prs-punto-revision.md` — La recomendación que este skill materializa: descripción orientada al revisor, bucle de comentarios clasificado y las dos puertas humanas del ciclo.
