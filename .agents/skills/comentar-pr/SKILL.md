---
name: comentar-pr
description: >
  Publicación de comentarios de revisión en un pull request del
  proyecto evaluado: a partir del informe de `revisar-pr`, redacta
  cada hallazgo como un comentario autocontenido en formato
  conventional comments —anclado a línea con propuesta de código o
  pseudocódigo, o general en el cuerpo de la review—, presenta el
  lote al usuario y lo publica como una sola review solo tras su
  confirmación.
  Usar cuando se quiera publicar en el PR los hallazgos de un
  informe de revisión, comentar un PR con el resultado de
  `revisar-pr` o convertir un informe en feedback publicable.
  Sinónimos: comentar PR, publicar comentarios de revisión,
  comentarios de PR, publicar la revisión.
---

# Comentar PR

Instrucciones para que un agente convierta los hallazgos de un informe de `revisar-pr` en comentarios publicables sobre el *pull request* revisado. Cada comentario es autocontenido —el autor lo entiende sin el informe—, sigue la convención *conventional comments* y, cuando el hallazgo apunta a un lugar del diff, se ancla a esa línea con una propuesta concreta. El lote completo se presenta al usuario y nada llega a la plataforma sin su confirmación; la publicación es una única review con todos los comentarios aprobados. Es la mitad de publicación del bloque revisor: el informe es la evidencia, los comentarios son la acción publicada.

## Cuándo usar

- Cuando existe un informe de `revisar-pr` para el PR y el usuario quiere llevar sus hallazgos al autor como comentarios de revisión.

## Cuándo no usar

- Para revisar un PR: corresponde a `revisar-pr`, que produce el informe que este skill consume.
- Para responder a comentarios que el autor dejó en un PR propio: ese es el bloque autor —`clasificar-comentarios` y `mejorar-pr`—.
- Para difusión de cualquier texto que no venga del informe de revisión: los comentarios son la traducción publicable de hallazgos concretos, no un canal libre.
- Para cualquier otro efecto sobre el PR: el skill solo publica comentarios —no resuelve hilos, no responde en nombre del usuario a comentarios del autor, no edita el PR ni lo fusiona—.
- En repositorios sin remoto GitHub o sin `gh` autenticado: la publicación opera sobre el PR en la plataforma.

## Entrada

- La referencia del PR: su número, o la rama actual cuando el usuario no da número.
- El informe de `revisar-pr` para ese PR, en el directorio de la convención `dir_revisiones_pr`.
- `gh` autenticado contra el remoto del repositorio evaluado.

## Salida

- Una review `COMMENT` publicada en el PR con los comentarios aprobados —los anclados como comentarios de línea y los generales en el cuerpo de la review—.
- El resumen en chat de qué se publicó, con el enlace de la review.
- Sin confirmación del usuario, ningún efecto lateral.

## Principios rectores

1. **El informe es la fuente:** los comentarios traducen hallazgos del informe, no inventan revisión nueva; un hallazgo sin anclaje en regla o patrón no era hallazgo y no se comenta.
2. **Autocontención:** el autor puede no tener el informe ni los artefactos internos del proyecto evaluado; cada comentario expresa el problema, el lugar y la razón por sí solo.
3. **Puerta humana literal:** el lote completo se presenta antes de publicar nada; lo aprobado se publica, lo descartado simplemente no llega —sin artefacto de rechazados—.
4. **Una sola review:** todos los comentarios aprobados viajan en una única llamada de publicación; el autor recibe una revisión coherente, no una lluvia de notificaciones.

## Procedimiento

### 1. Resolver el PR y el informe

1. **Resolver el PR:** con número dado, `gh pr view <n>`; sin número, el PR de la rama actual con `gh pr view`. Si no resuelve a un PR abierto, informar y terminar.
2. **Localizar el informe más reciente del PR** en el directorio que resuelve la convención `dir_revisiones_pr` de `consultar-artefactos` —patrón `pr-<n>-<yyyymmdd>*.md`: la fecha sigue inmediata al número, así los documentos de triage `pr-<n>-triage-*.md` de `clasificar-comentarios` no casan; el de mayor fecha y sufijo ordinal—. Cuando el valor resuelto empieza por `.git/`, sustituir ese prefijo por `git rev-parse --git-common-dir`. Si no hay informe para el PR, informar de que no hay nada que comentar —sugerir `revisar-pr`— y terminar.
3. **Verificar la frescura del informe:** el SHA head actual —`gh pr view <n> --json headRefOid`— debe coincidir con el que el informe registra como revisado en su cabecera; si difiere o el informe no lo registra, el informe está obsoleto —informar al usuario y proponer `revisar-pr` de nuevo antes de publicar, porque los hallazgos podrían ya no aplicar—.
4. **Obtener el diff** —`gh pr diff <n>`— para el anclaje, y **cargar lo ya publicado** en el PR —`gh api --paginate repos/:owner/:repo/pulls/<n>/comments` para los comentarios de línea, `gh api --paginate repos/:owner/:repo/pulls/<n>/reviews` para los generales, que viajan en el `body` de las reviews, y `gh api --paginate repos/:owner/:repo/issues/<n>/comments` para los sueltos en la conversación— para no republicar un hallazgo que ya está en la plataforma.

### 2. Redactar el lote

5. **Seleccionar los hallazgos comentables:** todos los `blocker` e `important` del informe se proponen como comentarios; un `nit` solo entra al lote si es objetivo y tiene impacto real en el código —los nits de estilo, de preferencia personal o fuera de alcance se descartan sin presentar, porque una opinión no es una sugerencia de mejora—; las preguntas abiertas se ofrecen como comentarios `question` —el usuario decide si van—. En todos los casos se omiten los que ya tienen un comentario publicado equivalente. Si el lote queda vacío —informe sin hallazgos, veredicto `merge`, o todos los nits descartados— informar de que no hay nada que comentar y terminar.
6. **Decidir la colocación de cada comentario:**
   - **Anclado a línea** cuando el hallazgo apunta a un lugar concreto del diff —una línea o un bloque—. El anclaje del informe —`archivo:línea`— se proyecta sobre el diff para obtener `path`, `line` y `side` del payload: `RIGHT` para líneas añadidas o de contexto, `LEFT` cuando el ancla es una línea eliminada; un bloque se ancla con `start_line`/`start_side` además de `line`/`side` —`start_*` es la primera línea del rango y `line`/`side` la última; invertirlos produce un error de la API—. Si la línea exacta no está en el diff, se ancla a la línea añadida más próxima del mismo archivo.
   - **General** —cuerpo de la review— cuando el hallazgo es transversal (un patrón repetido en varios archivos, una decisión de diseño) o cuando su anclaje no cae dentro del diff. Nada se descarta por no anclar.
7. **Redactar cada comentario en formato *conventional comments*** —`tipo` derivado de la severidad: `blocker` → `issue (blocking)`, `important` → `issue` o `suggestion` según el arreglo sea escribible, `nit` → `nitpick` para la observación sin arreglo escribible o `suggestion` cuando propone un cambio concreto, pregunta abierta → `question`—.
   - Todo comentario anclado lleva propuesta concreta: un bloque ` ```suggestion ` con el código de reemplazo cuando el arreglo es localizable y escribible —la plataforma lo ofrece aplicable—, o pseudocódigo/descripción del arreglo cuando no cabe en un diff de líneas.
   - El comentario general lleva la propuesta en prosa —qué cambiaría y dónde—.
   - El comentario nunca remite al informe ni a artefactos que el autor pueda no tener; la regla o el patrón infringido se cita por nombre y se explica en una frase.

### 3. Confirmar y publicar

8. **Presentar el lote completo al usuario:** por cada comentario, su colocación —archivo y línea, o «general»—, su tipo y su cuerpo redactado; más el cuerpo de la review si lleva comentarios generales. El usuario aprueba en bloque, descarta o edita; lo descartado no se publica y no deja artefacto.
9. **Publicar como una sola review** —solo tras la confirmación— con `gh api repos/:owner/:repo/pulls/<n>/reviews -X POST --input -` y el JSON `{commit_id, event: "COMMENT", body, comments: [{path, line, side, body}]}` —`commit_id` es el SHA verificado en el paso 3— —con `start_line`/`start_side` cuando el comentario cubre un bloque—. El campo `body` es obligatorio en una review `COMMENT`: lleva los comentarios generales y, cuando no los hay, una frase de contexto del lote —qué se revisó y cuántos comentarios anclados trae—. Todo cuerpo publicado —el de cada comentario anclado y el `body` de la review— termina con el marcador invisible `<!-- factory:revision -->`: es lo que distingue la salida del bloque revisor de las respuestas del propio flujo cuando el autor ejecuta la revisión mediante el agente y ambos comparten cuenta autenticada —`clasificar-comentarios` admite lo marcado como revisión—.
10. **Informar del resumen:** qué se publicó, dónde quedó cada comentario y el enlace de la review. El informe no muta —es evidencia de la revisión, no de la publicación—.

## Finalización

El skill ha terminado cuando:

- El lote fue presentado completo y el usuario decidió; lo aprobado está publicado como una sola review en el PR —o nada se publicó si todo fue descartado—.
- El usuario recibió el resumen con el enlace de la review.

## Referencias

- `.agents/skills/revisar-pr/SKILL.md` — El productor del informe que este skill consume; la plantilla del informe vive en su `assets/informe.md`.
- `.agents/skills/gestionar-pr/SKILL.md` — Los patrones de `gh` sobre PRs del paquete.
