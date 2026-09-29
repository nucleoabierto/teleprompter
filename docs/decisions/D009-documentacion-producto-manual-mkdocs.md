# D009: Documentación de producto en `manual/` publicada con MkDocs

## Estado

Aceptada

## Contexto

La documentación de producto necesita un hogar separado de `docs/` —la
documentación de proceso— y una forma de publicarse como sitio
navegable. Parte de esa documentación viaja además en el paquete npm, y
MkDocs exige que todo lo servido cuelgue de un único `docs_dir`.

## Decisión

Mantenemos la documentación de producto en `manual/`, un directorio
propio en la raíz, y la publicamos con MkDocs (`mkdocs.yml` en la raíz,
`docs_dir: manual`, ejecutado con `pipx`). `manual/index.md` es la
portada del sitio y `manual/README.md` el índice del directorio en el
repositorio y el tarball, excluido del build con `exclude_docs`.

## Justificación

Un directorio propio mantiene la frontera con `docs/` sin mezclar
audiencias y viaja entero en el paquete vía `files`. MkDocs genera el
sitio sin añadir dependencias Python al repositorio: `pipx run` lo
ejecuta al vuelo. Separar `index.md` (portada del sitio) de `README.md`
(índice del directorio) preserva el índice navegable en GitHub y npm
sin que el sitio lo duplique. Los enlaces desde `manual/` hacia `docs/`
se escriben como URLs absolutas del repositorio en `master`, porque el
sitio generado no puede resolver rutas fuera de `docs_dir`.

## Referencias

- docs/tasks/011-documentacion-publica.md
- docs/research/2026-09-mejores-practicas-readme.md
