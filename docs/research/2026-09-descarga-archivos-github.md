# Descarga de archivos de GitHub y extracción en Node

> **Fecha:** 2026-09

## Propósito

Determinar cómo descargar el árbol de un repositorio público de
GitHub por HTTP —sin git ni credenciales— y qué dependencias hacen
falta para extraerlo en Node 22, como entrada de la tarea 012
(`docs/tasks/012-origen-remoto-github.md`).

## Análisis

### Opción 1: URL directa de codeload

`https://codeload.github.com/{owner}/{repo}/tar.gz/{ref}`. Codeload
es el servicio dedicado de archivos de GitHub; resuelve ramas, tags
y SHAs sin prefijos `refs/`, y con `HEAD` (u omitido) sirve la rama
por defecto. Herramientas comparables como repomix la usan
directamente, con fallback a `master` [3][4].

- **Ventajas:** una sola petición, sin redirect; no consume la cuota
  de la API.
- **Desventajas:** endpoint no documentado como API estable; `HEAD`
  es comportamiento observado, no garantizado.

### Opción 2: endpoint de la REST API

`GET api.github.com/repos/{owner}/{repo}/tarball/{ref}` → 302 a
codeload. Documentado oficialmente; sin `ref` usa la rama por
defecto del repositorio [2].

- **Ventajas:** contrato oficial y estable; la rama por defecto es
  explícita.
- **Desventajas:** redirect extra y cuota sin autenticación
  (~60 req/h por IP) [2][3].

### Opción 3: URL `archive` de github.com

`github.com/{owner}/{repo}/archive/refs/heads/{rama}.tar.gz` —
documentada, pero exige saber de antemano si el ref es rama
(`refs/heads/`) o tag (`refs/tags/`), y también redirige a
codeload [1].

### Extracción del tar.gz

Node 22 trae `fetch` (sigue redirects solo) y `zlib` para gzip,
pero **no tiene parser de tar**. Opciones:

- **`tar` (npm):** extracción completa, detecta gzip y sanea rutas
  por defecto —rechaza `..`, rutas absolutas y escapes por
  symlink—; mantenido por el proyecto npm [5].
- **`tar-stream` (npm):** parser de streams de bajo nivel; habría
  que materializar cada entrada a mano [6].
- **binario `tar` del sistema:** cero dependencias; presente en
  macOS, Linux y Windows 10+ (`tar.exe`, bsdtar), pero añade una
  dependencia de plataforma y el saneo hay que pedirlo
  explícitamente.

Los archives de GitHub envuelven todo en un directorio raíz
`owner-repo-sha/`; la extracción debe eliminar ese primer
componente (`strip`) [1][4].

## Recomendación

**codeload directo + dependencia `tar`.**
`https://codeload.github.com/{owner}/{repo}/tar.gz/{ref|HEAD}` como
URL primaria —sin redirect ni cuota de API—, con el endpoint
`tarball` de la API como fallback documentado si `HEAD` no
resuelve. Para extraer, la dependencia `tar`: es la única opción
que sanea rutas hostiles por defecto, lo que importa al
descomprimir un archivo remoto, y mantiene todo en proceso
—testeable con `fetch` simulado y buffers reales—. Dependencias
resultantes: solo `tar`; HTTP con `fetch` global y gzip con
`zlib`.

## Limitaciones

- `tar.gz/HEAD` en codeload es comportamiento observado en
  terceros, no documentado; verificar al implementar y conservar
  el fallback.
- Las cuotas exactas de codeload no son públicas.
- Proxies, repositorios privados y credenciales quedan fuera de
  alcance (solo repositorios públicos).

## Referencias

- [1] GitHub Docs, «Downloading source code archives» —
  docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives
- [2] GitHub REST API, «Download a repository archive» —
  docs.github.com/en/rest/repos/contents
- [3] Stack Overflow, «How is codeload.github.com different to
  api.github.com?» — stackoverflow.com/q/60188254
- [4] repomix, `src/core/git/gitHubArchiveApi.ts` —
  github.com/yamadashy/repomix
- [5] npm, `tar` — npmjs.com/package/tar
- [6] `tar-stream` — github.com/nlf/tar-stream
