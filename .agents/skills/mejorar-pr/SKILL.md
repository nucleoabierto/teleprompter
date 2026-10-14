---
name: mejorar-pr
description: >
  Aplicación del triage sobre un pull request propio del proyecto
  evaluado: a partir del documento de `clasificar-comentarios`,
  aplica las correcciones marcadas corregir al árbol de trabajo
  respetando las convenciones del proyecto, publica las respuestas
  —las redactadas de los responder, la de cada corregir citando su
  commit y las de aplazamiento con su razón— y resuelve los hilos
  atendidos —todo efecto lateral tras confirmación del usuario—.
  Usar cuando un PR propio tenga su triage producido y haya que
  aplicar las correcciones, responder al revisor y resolver los
  hilos.
  Sinónimos: mejorar PR, aplicar triage, responder hilos del PR,
  corregir el PR, cerrar la revisión recibida.
---

# Mejorar PR

Instrucciones para que un agente ejecute el documento de triage sobre un *pull request* propio. Cada entrada `corregir` se aplica al árbol de trabajo con las convenciones del proyecto; cada `responder` se publica con la respuesta redactada en el triage; cada `aplazar` queda documentado con su razón y su respuesta de aplazamiento; los hilos atendidos se resuelven. Es la segunda mitad del bloque autor y cierra el lazo de revisión: ningún efecto lateral —push, respuestas, resolución— ocurre sin confirmación del usuario.

## Cuándo usar

- Cuando un PR propio tiene su documento de triage y hay que aplicar las correcciones, responder a los revisores y resolver los hilos.
- Cuando una nueva ronda de triage acumuló entradas sin ejecutar sobre un PR ya mejorado: las entradas ya atendidas no se reprocesan.

## Cuándo no usar

- Para clasificar la revisión recibida: corresponde a `clasificar-comentarios`, que produce el triage que este skill consume.
- Para revisar un PR ajeno o publicar comentarios propios: eso es el bloque revisor —`revisar-pr` y `comentar-pr`—.
- Para decidir qué hacer con un comentario: el veredicto ya lo fijó el triage; este skill ejecuta, no reclasifica.
- En repositorios sin remoto GitHub o sin `gh` autenticado: responder y resolver operan sobre la plataforma.

## Entrada

- La referencia del PR: su número, o la rama actual cuando el usuario no da número.
- El documento de triage de `clasificar-comentarios` para ese PR, en el directorio de la convención `dir_revisiones_pr`.
- `gh` autenticado contra el remoto del repositorio evaluado.

## Salida

- Las correcciones aplicadas en la rama del PR y empujadas tras confirmación.
- Las respuestas publicadas en los hilos correspondientes y los hilos de línea atendidos resueltos —todo tras confirmación—.
- El documento de triage con cada entrada anotada con su resultado —la anotación hace idempotente una nueva ejecución—.
- El resumen en chat: qué se aplicó, qué se publicó, qué se resolvió.
- Sin confirmación del usuario, ningún efecto lateral.

## Principios rectores

1. **El triage es la fuente:** se ejecuta lo clasificado, no se reclasifica; una entrada con `resultado:` ya está atendida y se omite.
2. **El conflicto se eleva, no se resuelve en silencio:** una corrección que contradice el cambio o una convención del proyecto se presenta al usuario; aplicarla en silencio traiciona al revisor y descartarla en silencio traiciona el triage.
3. **Puerta humana literal:** el push, la publicación de respuestas y la resolución de hilos ocurren solo tras la confirmación; lo descartado simplemente no llega.
4. **Cada efecto sobre su hilo:** la respuesta va al hilo del que salió, por el endpoint que dicta su identificador; nada se publica en el hilo equivocado.

## Procedimiento

### 1. Resolver el PR, el árbol y el triage

1. **Resolver el PR:** con número dado, `gh pr view <n>`; sin número, el PR de la rama actual con `gh pr view`. Si no resuelve a un PR abierto, informar y terminar.
2. **Situar el árbol en la rama del PR:** las correcciones se aplican sobre el cambio —si la rama actual no es la head del PR, `gh pr checkout <n>`— y se deja al día con el head remoto —`git pull` si la rama local va atrás—.
3. **Localizar el triage más reciente del PR** en el directorio que resuelve la convención `dir_revisiones_pr` de `consultar-artefactos` —patrón `pr-<n>-triage-*.md`, el de mayor fecha y sufijo—. Cuando el valor resuelto empieza por `.git/`, sustituir ese prefijo por `git rev-parse --git-common-dir`. Si no hay triage para el PR, informar de que no hay nada que mejorar —sugerir `clasificar-comentarios`— y terminar.
4. **Verificar la frescura del triage en ambos sentidos:** cargar los hilos de la plataforma **con su estado** en las tres superficies con `--paginate` —hilos de línea GraphQL con `isResolved` e `isOutdated`, cuerpos de reviews, conversación—:
   - Un hilo abierto sin entrada **ni pregunta abierta** registrada en el triage —la comparación se hace por el `hilo:`— significa revisión nueva no clasificada: informar al usuario. Por defecto se propone `clasificar-comentarios` antes de actuar, porque un triage incompleto ejecuta a ciegas; si el usuario decide ejecutar lo ya triagiado, las entradas sin ejecutar proceden igual.
   - La misma alarma cubre la actividad posterior: un hilo registrado cuyo par (`visto:`, `estado:`) ya no describe la plataforma —comentarios más recientes que el `visto:` más reciente registrado, o `estado: resuelto` que reaparece abierto—. La transición inversa, `abierto` que aparece resuelto, la gestiona la regla de omisión de la entrada sin ejecutar —dos viñetas más abajo—, no la alarma.
   - El filtro por cuenta autenticada —`gh api user`— opera sobre el ítem suelto y sobre el cómputo del último comentario del hilo: lo que el propio flujo publicó no es revisión del revisor ni actividad nueva —salvo los ítems que terminan con `<!-- factory:revision -->`, la salida del bloque revisor, que sí cuentan como revisión y como actividad—.
   - Una entrada sin ejecutar cuyo hilo ya aparece resuelto en la plataforma se omite y se anota `resultado: resuelto en plataforma` —ejecutarla publicaría o corregiría sobre un tema cerrado—. Dos excepciones: la entrada que registró `estado: resuelto` —nació de actividad sobre un hilo cerrado y ejecutarla es precisamente su propósito— y la que lleva la anotación `pendiente` —la cubre la superación del paso siguiente, que preserva su commit local—. Una entrada cuyo hilo ya no aparece en la recarga se anota `resultado: omitido — hilo no localizado`.
   - Si el head del PR difiere del `head triagiado` que registra el documento —un push intermedio movió el cambio—, las entradas sin ejecutar se revalidan contra el estado actual. Las `corregir` se revalidan antes de aplicarse —un `isOutdated` puede indicar que la observación ya quedó atendida— y las `responder`/`aplazar` antes de entrar al lote —la refutación que cita código debe seguir siendo cierta—. Si la premisa ya no aplica, se anota `resultado: omitido — premisa obsoleta`; las anotaciones sobre una entrada `pendiente` conservan siempre la referencia a su commit local, que sigue aplicado en la rama.
   - Las preguntas abiertas sin `resultado:` se presentan al usuario como pendientes de su respuesta; no disparan la alarma ni se ejecutan. Si el usuario resuelve la ambigüedad, el hilo se promueve a entrada clasificada en el documento —veredicto, severidad, propuesta, `visto:`, `estado:` y su `ronda:`—, la pregunta queda anotada `resultado: promovida a entrada` y la entrada entra a la ejecución de la misma ronda. Una pregunta declinada en esa puerta o cuyo hilo aparece resuelto en la recarga se anota `resultado: omitido — <motivo>` —terminal, igual que en las entradas— para que no se re-presente en cada ejecución; la anotación deja el par (`visto:`, `estado:`) al día con la plataforma, igual que en las entradas, para que una reapertura posterior no quede invisible.

### 2. Aplicar las correcciones

5. **Separar las entradas sin ejecutar por veredicto:** las que llevan `resultado:` terminal se omiten; una anotación con `pendiente` —un `corregir` commiteado con el push pospuesto— se retoma donde quedó, no se reaplica. Cuando varias entradas sin ejecutar comparten `hilo:` —el hilo reentró con actividad nueva—, manda la de mayor `ronda:` y las anteriores se anotan `resultado: omitido — superada por la ronda N`. Una anotación `pendiente` cuyo hilo se resolvió o reentró antes de retomarse queda superada igual —se anota con su commit local referenciado para no perderlo—. Si no queda nada sin ejecutar, las preguntas abiertas sin `resultado:` se presentan igual antes de informar y terminar.
6. **Aplicar cada `corregir` sobre el árbol de trabajo** en orden de severidad —`blocker`, `important`, `nit`— siguiendo su `propuesta` —que ya cita el código y la regla o intención—, respetando las convenciones del proyecto y las lecciones aplicables —`consultar-lecciones` por los disparadores del cambio—. Una corrección que contradice el cambio o una convención se presenta al usuario con el conflicto; no se aplica ni se descarta en silencio.
7. **Verificar, presentar el diff y, tras confirmación, commitear y empujar:** correr las verificaciones que correspondan del proyecto evaluado —como en la ronda de `gestionar-pr`—, presentar el diff aplicado por corrección y, solo tras la confirmación, commitear en la rama con el skill `commit` y `git push`. Una corrección que el usuario rechaza en la puerta se revierte del árbol antes de commitear —nunca llega al commit— y se anota `resultado: omitido — <motivo>`: dejarla aplicada divergiría del remoto sin registro. Si el usuario aprueba el commit pero pospone el push, la entrada se anota `resultado: aplicado en <sha> — pendiente de push y respuesta` —no es terminal: la ronda siguiente la retoma—. Sin `corregir` pendientes no hay árbol que tocar ni push que pedir.

### 3. Responder

8. **Redactar el lote de respuestas** a partir del triage:
   - **`responder`:** la respuesta ya viene redactada en la `propuesta` de la entrada.
   - **`corregir`:** una respuesta breve que cita el commit donde quedó la corrección —el revisor ve qué cambió—. Solo entra al lote si el push del paso 7 aterrizó: citar un commit que no llegó al remoto publica una referencia rota, así que si el usuario pospone el push, estas respuestas se posponen con él.
   - **`aplazar`:** la respuesta de aplazamiento con su razón; cuando el aplazamiento produce trabajo posterior —fuera de alcance incluido— se ofrece registrarlo con `crear-tareas` y citar la referencia en la respuesta —convención de `gestionar-pr`—.
9. **Presentar el lote completo al usuario:** cada respuesta con el hilo al que va —ancla y autor—. El usuario aprueba, edita o descarta; lo descartado no se publica y queda anotado en el triage con `resultado: omitido — <motivo>` —sin anotación se repondría en cada ejecución—.
10. **Publicar tras confirmación** por el endpoint que dicta el `hilo:` de cada entrada:
    - `PRRT_…` —hilo de línea—: `addPullRequestReviewThreadReply` vía `gh api graphql` con `pullRequestReviewThreadId` y `body`.
    - Id de review o de comentario —cuerpo de review y conversación no tienen hilo—: un comentario de conversación vía `gh api repos/:owner/:repo/issues/<n>/comments -X POST` que cita a qué responde.

### 4. Resolver y cerrar la ronda

11. **Resolver los hilos atendidos:** solo los de línea —`PRRT_…`— con `resolveReviewThread` vía `gh api graphql` (`threadId`), después de que aterriza su resultado —`corregir` tras el push, `responder` y `aplazar` tras publicar la respuesta—; los cuerpos de review y la conversación no tienen resolución. Bajo la misma confirmación del lote.
12. **Anotar el resultado en el triage:** cada entrada ejecutada —o descartada en las puertas— gana el sub-ítem `resultado:` —`corregido en <sha>`, `respondido`, `aplazado` con la referencia de la tarea si se registró, `omitido — <motivo>`—. La anotación compone lo que pasó cuando hay más de un efecto —un `corregir` empujado con su respuesta descartada queda `corregido en <sha>; respuesta omitida`— y es lo que omite una ejecución posterior, salvo los valores con `pendiente`, que se retoman. Toda anotación —de ejecución o de omisión— deja el par (`visto:`, `estado:`) al día con la plataforma: `visto:` a la última actividad, incluida la respuesta publicada, y `estado:` al estado final del hilo. Es la línea base con la que la siguiente recarga detecta actividad posterior —incluida una reapertura—; sin ella la propia respuesta dispararía una falsa alarma.
13. **Informar del resumen:** qué se aplicó, qué se publicó, qué se resolvió —y que el diff corregido vuelve a ser candidato a una revisión: el lazo puede repetirse; el skill lo declara sin orquestarlo—.

## Finalización

El skill ha terminado cuando:

- Las correcciones `corregir` están aplicadas en la rama y empujadas tras confirmación —o el usuario las rechazó—.
- Las respuestas aprobadas están publicadas en sus hilos y los hilos de línea atendidos resueltos.
- Cada entrada ejecutada lleva su `resultado:` en el triage y el usuario recibió el resumen.

## Referencias

- `.agents/skills/clasificar-comentarios/SKILL.md` — El productor del documento de triage que este skill consume; la plantilla vive en su `assets/triage.md`.
- `.agents/skills/comentar-pr/SKILL.md` — Hermano que resuelve `dir_revisiones_pr` con la sustitución de `.git/` y publica tras confirmación.
- `.agents/skills/gestionar-pr/SKILL.md` — Convención «fuera de alcance → `crear-tareas` + responder con la referencia» y la limpieza de `pr-<n>-*.md` al cerrar.
