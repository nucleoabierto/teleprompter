# Cadena de release a npm

## Estado

[x] Planificada | [ ] Completada

## Objetivo

Cerrar la línea «Publicación a npm» del roadmap: el paquete ya está
publicado y `npx` funciona; lo que la épica materializa es la cadena
de release que D008 aplazó —procedimiento documentado con su puerta
de pruebas, tags consistentes con el registry y la decisión
registrada (D018)—.

## Alcance

- **Dentro:** corrección de los tags históricos; definición y
  documentación de la cadena (orden de pasos, puerta de pruebas,
  política de dist-tags); decisión sobre trusted publishing y, si se
  adopta, su materialización en CI.
- **Fuera:** publicar versiones nuevas; mantener líneas paralelas de
  mantenimiento (el dist-tag `legacy` fue una acción puntual);
  cambios al formato del paquete; las otras líneas de Next
  (colecciones, endurecimiento de la obtención remota).

## Piezas

- [ ] docs/tasks/026-alinear-tags-con-contenido-publicado.md —
  Alinear los tags de release con el contenido publicado
- [ ] docs/tasks/027-cadena-de-release.md — Definir y documentar la
  cadena de release
- [ ] docs/tasks/028-trusted-publishing-ci.md — Publicación por CI
  con trusted publishing

## Plan técnico

La anotación de la versión ya está cubierta por los skills
`mantener-changelog` y `liberar-version`; el conjunto define lo que
falta después de ellos: tag → pruebas → publish → verificación.

- **Orden:** 026 (correctivo independiente) → 027 (la decisión eje
  del conjunto) → 028 (materializa la opción elegida en 027).
- **Dependencias:** 028 depende de 027 y su existencia está
  condicionada: si D018 elige cadena manual, la pieza se descarta.
  026 no depende de nada y puede ejecutarse ya.
- **Decisiones transversales:** los tags `v*` identifican el
  artefacto publicado, no el commit del bump de versión; `latest` es
  el único dist-tag en uso; la puerta de pruebas es obligatoria antes
  de publicar (suite al 100 % de cobertura).

## Criterio de cierre

Un release futuro puede ejecutarse siguiendo solo el documento
producido: procedimiento escrito, puerta materializada, decisión
registrada y tags históricos consistentes con el registry.

## Revisión

- Usuario: 2026-10-02 — Aprueba
