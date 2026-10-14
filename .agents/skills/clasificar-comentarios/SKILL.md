---
name: clasificar-comentarios
description: >
  Triage de la revisión recibida en un pull request propio del
  proyecto evaluado: lee los hilos de revisión abiertos en las tres
  superficies de la plataforma —hilos de línea, cuerpos de reviews y
  conversación—, omite los resueltos y los ya triagiados sin actividad
  posterior, clasifica cada hilo restante en corregir, responder o
  aplazar con la
  corrección o respuesta propuesta y su severidad, y produce el
  documento de triage persistido —estado local efímero, acumulable
  por rondas—.
  Usar cuando un PR propio haya recibido revisión y haya que decidir
  qué hacer con cada hilo, o como entrada del skill que aplica las
  correcciones.
  Sinónimos: clasificar comentarios, triage de revisión, triage de
  comentarios, revisión recibida, qué hago con estos comentarios.
---

# Clasificar comentarios

Instrucciones para que un agente convierta la revisión recibida en un *pull request* propio en un documento de triage accionable. Cada hilo abierto recibe exactamente un veredicto —`corregir`, `responder` o `aplazar`— con su propuesta concreta y la severidad que merece; la intención ambigua va a preguntas abiertas, nunca a suposición. El documento es la entrada natural del paso siguiente —aplicar correcciones, responder, resolver—, así que cada entrada lleva todo lo que ese paso necesita. Es la primera mitad del bloque autor: solo análisis —no responde, no resuelve, no modifica el cambio—.

## Cuándo usar

- Cuando un PR propio recibió comentarios de revisión y hay que decidir hilo a hilo qué hacer con ellos antes de actuar.
- Cuando llega una nueva ronda de revisión sobre un PR ya triagiado: el documento acumula —los hilos ya clasificados no se reclasifican—.

## Cuándo no usar

- Para revisar un PR ajeno: corresponde a `revisar-pr`, el bloque revisor.
- Para aplicar las correcciones, responder los hilos o resolverlos: eso es `mejorar-pr`, que consume el documento de triage.
- Para publicar comentarios propios como revisor: eso es `comentar-pr`.
- En repositorios sin remoto GitHub o sin `gh` autenticado: la revisión recibida vive en la plataforma.

## Entrada

- La referencia del PR: su número, o la rama actual cuando el usuario no da número.
- `gh` autenticado contra el remoto del repositorio evaluado.
- La plantilla del documento de triage: `assets/triage.md` de este skill.

## Salida

- El documento de triage persistido en el directorio de la convención `dir_revisiones_pr`, con el nombre `pr-<n>-triage-<yyyymmdd>.md` —el sufijo ordinal `-2`, `-3`… solo aplica si por alguna razón debe crearse un documento nuevo en una fecha ya usada—. Es estado local efímero fuera del control de versiones: `gestionar-pr` lo elimina al cerrar el PR junto con el resto de `pr-<n>-*.md`.
- Una entrada por hilo abierto o con actividad nueva: ubicación —ancla archivo:línea o superficie—, cita del comentario, veredicto, severidad, la propuesta que el veredicto exige y, en los aplazamientos, la razón.
- El resumen en chat: cuántos hilos entraron a cada veredicto y cuántos quedaron como preguntas abiertas.
- Un triage posterior sobre el mismo PR acumula: reutiliza el documento existente añadiendo las entradas nuevas con su ronda, nunca reclasifica.

## Principios rectores

1. **Cada hilo abierto, un veredicto:** nada queda sin clasificar y nada se clasifica dos veces; los resueltos y los ya triagiados no entran salvo por actividad posterior registrable o como contexto de uno abierto.
2. **El veredicto lleva propuesta:** `corregir` cita el código y la regla o intención del comentario con el arreglo concreto; `responder` lleva la respuesta redactada —y si la única respuesta honesta fuera «mira el código», el código no se explica solo y la propuesta es mejorarlo—; `aplazar` lleva su razón obligatoria.
3. **La ambigüedad no se adivina:** un hilo cuya intención no es clara va a preguntas abiertas del documento; una suposición silenciosa contamina la ejecución posterior.
4. **Solo análisis:** el skill no responde al revisor, no resuelve hilos y no toca el código; su producto es el documento —actuar sobre él es la mitad siguiente del bloque.

## Procedimiento

### 1. Resolver el PR y cargar la revisión recibida

1. **Resolver el PR:** con número dado, `gh pr view <n>`; sin número, el PR de la rama actual con `gh pr view`. Si no resuelve a un PR abierto, informar y terminar.
2. **Cargar los hilos en las tres superficies**, siempre con `--paginate` y conservando el `node_id` de cada uno —es el `hilo:` que la entrada registra—:
   - **Hilos de línea** con su estado —GraphQL `reviewThreads` del PR: `isResolved`, `isOutdated`, comentarios, `path` y `line`—.
   - **Cuerpos de reviews** —`gh api --paginate repos/:owner/:repo/pulls/<n>/reviews`: el comentario general de un revisor viaja en el `body`—.
   - **Conversación** —`gh api --paginate repos/:owner/:repo/issues/<n>/comments`: comentarios sueltos que no son review—.
3. **Descartar lo ya cerrado:** los hilos con `isResolved` no entran —salvo que un hilo abierto remita a ellos como contexto o que estén registrados en un triage previo, donde la réplica del revisor a una respuesta publicada puede aterrizar—; lo mismo aplica a respuestas del autor que ya cierran el tema. Los ítems cuyo autor es la cuenta autenticada —`gh api user`— tampoco entran: son respuestas del propio flujo, no revisión del revisor —excepción: los que terminan con el marcador `<!-- factory:revision -->`, la salida que `comentar-pr` publica en nombre del revisor cuando el autor ejecuta la revisión mediante el propio agente, que sí entran como revisión —la posición importa: una cita literal del cuerpo marcado no hereda la condición—. Si no queda ningún hilo abierto ni registrado con actividad nueva, informar de que no hay nada que triagiar y terminar.
4. **Obtener el diff del PR** —`gh pr diff <n>`— y, cuando la clasificación lo exija, los archivos del head —`git show <head>:<ruta>`, no el árbol local, que puede estar en otra rama—: la propuesta de `corregir` cita código real y la decisión sobre un hilo `isOutdated` necesita ver el estado actual del archivo.

### 2. Acumular sobre triages anteriores

5. **Localizar el documento previo del PR** en el directorio que resuelve la convención `dir_revisiones_pr` de `consultar-artefactos` —patrón `pr-<n>-triage-*.md`, el de mayor fecha y sufijo—. Cuando el valor resuelto empieza por `.git/`, sustituir ese prefijo por `git rev-parse --git-common-dir`.
6. **Omitir lo ya triagiado, salvo actividad nueva:** un hilo que ya tiene entrada en el documento —clasificado o en preguntas abiertas— no se reclasifica; solo entran los hilos abiertos sin registro. La comparación se hace por el `hilo:` registrado y, como *fallback*, por ancla, cita y autor —el ancla sola no basta: tras empujar correcciones las líneas derivan y `isOutdated` recoloca hilos—.
   - La excepción es la actividad posterior: un hilo registrado vuelve a entrar cuando su par (`visto:`, `estado:`) ya no describe la plataforma —comentarios ajenos más recientes que el `visto:` más reciente registrado, incluidos los de hilos ya resueltos donde aterriza la réplica del revisor, o un `estado: resuelto` registrado que reaparece abierto —la reapertura no genera comentario; la detecta el cambio de estado—; la pata de estado solo dispara en esta dirección —`resuelto`→`abierto`—: un `abierto` registrado que aparece resuelto no genera entrada —la absorbe la omisión de la ejecución—. Genera una entrada nueva en la ronda citando el mismo `hilo:` —las entradas previas no se tocan—. Lo que el propio flujo publicó no computa como actividad —los ítems que terminan con `<!-- factory:revision -->` sí computan: son revisión del revisor aunque los firme la cuenta autenticada—.
   - Si todos los abiertos ya están triagiados sin actividad nueva, informar de que la ronda no trae hilos nuevos y terminar.

### 3. Clasificar cada hilo abierto

7. **Agrupar por tema cuando el volumen lo justifique** —varios hilos sobre el mismo archivo o la misma decisión— y delegar cada grupo en un subagente paralelo, siguiendo el patrón de delegación de `revisar-pr`/`ejecutar-tareas`; el encargo lleva el hilo, el diff y la intención reconstruida, y devuelve las entradas redactadas.
8. **Clasificar cada hilo en un veredicto con su propuesta:**
   - **`corregir`** —el comentario señala un problema real del cambio—: la propuesta describe el arreglo concreto citando el código afectado y la regla o intención del comentario que lo motiva. Un hilo abierto con `isOutdated` puede indicar que el código ya cambió desde el comentario: verificar contra el diff si la observación ya quedó atendida antes de clasificar `corregir`.
   - **`responder`** —el hilo es una pregunta, una discrepancia o algo que no pide cambio—: la propuesta es la respuesta redactada al revisor, incluida la refutación de un comentario incorrecto —se explica por qué la observación no aplica, con el código como evidencia—. Si la única respuesta honesta fuera «mira el código», el código no se explica solo y el veredicto es `corregir` con propuesta de clarificarlo. `aplazar` nunca cubre un comentario incorrecto: aplazarlo lo validaría implícitamente.
   - **`aplazar`** —el comentario es válido pero fuera del alcance del PR—: la razón del aplazamiento es obligatoria —fuera de alcance, trabajo posterior, requiere decisión ajena—.
9. **Asignar la severidad** que el hilo merece como revisor-autor —`blocker`, `important`, `nit`—: la misma escala del informe de `revisar-pr`, que ordena la ejecución posterior.
10. **Derivar la ambigüedad a preguntas abiertas:** un hilo cuya intención no se reconstruye del comentario ni del código no recibe veredicto —va a la lista de preguntas abiertas del documento con su `hilo:` registrado y lo que haría falta para decidir—.

### 4. Producir el documento

11. **Escribir el documento siguiendo `assets/triage.md`:** cabecera con fecha, PR, head triagiado —`gh pr view <n> --json headRefOid`— y ronda; resumen con los conteos por veredicto; una entrada por hilo como lista anidada; preguntas abiertas. En un triage acumulado, las entradas nuevas llevan su ronda y las previas no se tocan.
12. **Presentar el resumen en chat:** conteos por veredicto, preguntas abiertas si las hay y la ruta del documento —la entrada de `mejorar-pr`—.

## Finalización

El skill ha terminado cuando:

- Cada hilo abierto o con actividad posterior sin triagiar tiene su entrada en el documento —veredicto, severidad, propuesta— o su lugar en preguntas abiertas.
- El documento está persistido en `dir_revisiones_pr` como `pr-<n>-triage-<yyyymmdd>.md` y el usuario recibió el resumen.
- Ningún hilo fue respondido, resuelto ni corregido —solo clasificado—.

## Referencias

- `assets/triage.md` — La plantilla del documento de triage que este skill produce.
- `.agents/skills/revisar-pr/SKILL.md` — El bloque revisor: su plantilla `assets/informe.md` fija la escala de severidades que este documento reutiliza.
- `.agents/skills/comentar-pr/SKILL.md` — Hermano que ya resuelve `dir_revisiones_pr` con la sustitución de `.git/` y confronta el head del PR.
- `.agents/skills/gestionar-pr/SKILL.md` — Patrón «la respuesta es mejorar el código» y la limpieza de `pr-<n>-*.md` al cerrar.
