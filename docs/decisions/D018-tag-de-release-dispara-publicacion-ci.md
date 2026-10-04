# D018: El tag de release dispara la publicación por CI

## Estado

Aceptada

## Contexto

La publicación a npm era manual e informal y ya produjo una brecha
tag ↔ artefacto: los tags `v*` creados retroactivamente no
identificaban el contenido publicado (tarea 026). Hay que fijar la
cadena de release que D008 aplazó: orden tag ↔ commit de release ↔
publish, puerta de pruebas y si la publicación se mantiene manual
(cuenta individual con 2FA) o se adopta CI con trusted publishing, GA
desde julio de 2025 y disponible por ser el repositorio público.

## Decisión

El tag `vX.Y.Z` anotado sobre el commit de release es la
declaración del release y dispara el workflow de CI que corre la
suite y publica ese árbol con `npm publish` y trusted publishing
(OIDC, provenance por defecto). La puerta de pruebas es doble: un job de tests
condición del job de publish en CI, y `prepublishOnly: npm test` en
`package.json` para cualquier publish, incluido el manual.
`latest` es el único dist-tag en uso; `legacy` queda como acción
puntual sin política de líneas paralelas de mantenimiento.

## Justificación

El tag como señal convierte la identidad tag ↔ artefacto en
construcción y no en verificación: CI publica el checkout del tag y
el provenance atestigua la correspondencia ante terceros —la brecha
de 026 se vuelve imposible por diseño—. La alternativa «publish
primero, tag después» elimina los tags huérfanos, pero convierte
el tag en efecto secundario, exige escritura a git desde CI y
reintroduce la ambigüedad si master avanza entre publish y tag.
Trusted publishing elimina tokens y 2FA interactiva y añade
provenance; frente a la publicación manual reduce el paso humano a
empujar un tag. `prepublishOnly` cubre además el publish manual de
emergencia, que la puerta de CI sola no alcanza. Consecuencia
negativa aceptada: un publish fallido deja un tag huérfano que hay
que mover o borrar —la cadena documenta la corrección—. Renunciamos
a líneas paralelas de mantenimiento: el volumen del proyecto no las
justifica.

## Referencias

- `docs/release.md` — la cadena que materializa la decisión.
- `docs/tasks/026-alinear-tags-con-contenido-publicado.md` — la
  brecha tag ↔ artefacto que motiva la decisión.
- `docs/decisions/D008-implementacion-javascript-npx.md` — la
  consecuencia aplazada que esta decisión cierra.
- `docs/tasks/028-trusted-publishing-ci.md` — la materialización en
  CI.
