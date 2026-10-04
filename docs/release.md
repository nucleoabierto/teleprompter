# Cadena de release

La cadena de release fija el orden, los responsables y las puertas
desde que se decide liberar una versión hasta que queda publicada y
verificada en npm. El invariante que la gobierna: el tag `v*` es la
declaración del release y el artefacto publicado se produce desde
ese commit etiquetado —tag, artefacto y enlace comparativo del
changelog identifican siempre lo mismo (D018).

## Prerrequisitos

- `master` en verde y el árbol de trabajo limpio, sin trabajo en
  vuelo.
- `CHANGELOG.md` con los no liberados acumulados por
  `mantener-changelog`.
- Trusted publishing configurado en npm para este repositorio
  (OIDC; la configuración concreta la materializa
  `docs/tasks/028-trusted-publishing-ci.md`).

## Pasos

### 1. Liberar la versión — agente + usuario, local

El skill `liberar-version` cura los no liberados del changelog,
propone el bump semver justificado por los tipos de cambio y, tras
la confirmación del usuario, promueve la sección a `## [X.Y.Z] -
fecha` y actualiza `version` en `package.json`.

**Bloqueado por:** la confirmación del usuario sobre el número de
versión y la curación propuesta.

### 2. Commit de release — agente, local

Un solo commit con el changelog promovido y el bump de versión,
mensaje `chore: release X.Y.Z`, push a `master`.

**Bloqueado por:** nada; es consecuencia directa del paso 1.

### 3. Tag — agente, local

`git tag -a vX.Y.Z <commit-de-release> -m vX.Y.Z` y
`git push origin vX.Y.Z`. El tag anota el commit de release —no un
commit anterior ni posterior— y su push dispara el workflow de
publicación (`on: push`, tags `v*`).

**Bloqueado por:** que el paso 2 haya empujado el commit a
`origin/master`.

### 4. Puerta de pruebas — CI

El workflow corre la suite (`npm test`, cobertura al 100 %) como
job previo al de publicación: si falla, el job de publish no
arranca. Además `package.json` declara `prepublishOnly: npm test`,
que vuelve a ejecutar la suite dentro del propio `npm publish`:
publicar con pruebas rotas es imposible desde cualquier entorno,
incluido un publish manual de emergencia.

**Bloqueado por:** la suite en verde en el commit etiquetado.

### 5. Publish — CI

El workflow hace checkout del tag y publica `npm publish` con
trusted publishing: sin tokens ni 2FA interactiva, y con la
atestación de provenance —emitida por defecto— que vincula el
artefacto al commit etiquetado.

**Bloqueado por:** la puerta del paso 4.

### 6. Verificación — agente, local

`npm view @nucleoabierto/teleprompter@X.Y.Z dist.shasum` debe
coincidir con el `npm pack` ejecutado sobre el tag, y
`npx @nucleoabierto/teleprompter@X.Y.Z --help` (o equivalente)
debe responder la versión nueva.

**Bloqueado por:** la propagación del registry —suele ser
inmediata—.

## Fallos

- **Publish fallido tras tag:** el tag queda apuntando a un commit
  no publicado. Corregir la causa y repetir desde el paso 3 —mover
  el tag si el contenido del release cambió (`git tag -f` +
  `git push -f`, ejecutado con el repo limpio)—; si la causa es
  externa, basta reintentar el workflow sobre el mismo tag.
- **Artefacto publicado divergente del tag:** no debería ocurrir
  por construcción (el publish corre sobre el checkout del tag).
  Si ocurre, la corrección es la de la tarea 026: verificar el
  commit cuyo `npm pack` reproduce el `shasum` publicado y mover el
  tag allí.
- **CI no disponible:** como último recurso se publica a mano desde
  el checkout del tag ya empujado —`git checkout vX.Y.Z` y
  `npm publish`— de modo que el artefacto siga siendo el árbol
  etiquetado; `prepublishOnly` corre la suite igualmente.

## Dist-tags

`latest` es el único dist-tag en uso: todo `npm publish` cae en él
por defecto. El proyecto no mantiene líneas paralelas de
mantenimiento: no hay política de backports ni de dist-tags
adicionales.
