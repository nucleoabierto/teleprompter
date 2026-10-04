# Publicación por CI con trusted publishing

## Estado

[x] Completada

## Tipo

mantenimiento

## Objetivo

Materializar el endurecimiento de la cadena de release: publicar
desde CI con trusted publishing (OIDC), sin tokens npm de larga vida
y con provenance automático vinculando el tarball al commit y al
workflow. Publicar pasa a ser empujar el tag `v*` que la cadena
define, y la divergencia tag ↔ artefacto queda cerrada
estructuralmente.

## Dependencias

- 027-cadena-de-release — la decisión D018 determina si hay CI y qué
  evento dispara la publicación; si la cadena elegida es manual, esta
  tarea se descarta.

## Entrada

- Resultado de 027: el evento disparador (tag `v*` u otro) y la
  puerta de pruebas acordada.
- Requisitos de la plataforma: npm CLI ≥ 11.5.1, Node ≥ 22.14.0 en el
  runner (GitHub-hosted), repositorio público —todos cumplidos—.
- Configuración del trusted publisher en npmjs.com (o `npm trust
  github`): org `nucleoabierto`, repo `teleprompter`, nombre del
  archivo de workflow; paso manual del mantenedor con su sesión.

## Resultado esperado

- `.github/workflows/publish.yml` (primer workflow del repo) que, al
  empujar el disparador definido en 027, instala dependencias,
  ejecuta la suite y publica con OIDC.
- Trusted publisher configurado en npmjs.com para repo + workflow;
  sin secretos npm en el repositorio.
- La siguiente publicación real produce el badge de provenance en la
  página del paquete, verificable en npmjs.com.

## Criterios de calidad

- El workflow ejecuta la suite completa antes de `npm publish`; un
  fallo aborta la publicación.
- Ningún token npm vive en secretos ni en el repo: la autenticación
  es OIDC.
- La relación de confianza existe y coincide con el nombre real del
  archivo de workflow.

## Procedimiento sugerido

1. Escribir el workflow según el disparador acordado en 027.
2. Indicar al usuario la configuración del trusted publisher en
   npmjs.com (requiere su sesión 2FA) o con `npm trust github`.
3. Validar el flujo con `npm publish --dry-run` en CI o, si la
   cadena lo prevé, en la primera publicación real.

## Notas

- Con trusted publishing el provenance se emite por defecto; no hace
  falta `--provenance`.
- La configuración en npmjs.com es un paso del usuario, no del
  agente: la tarea lo deja explícito y no la da por hecha.
- Ejecutada el 2026-10-04:
  - `.github/workflows/publish.yml` creado: disparador `push` de
    tags `v*`; job `test` (suite completa) condición del job
    `publish`, que corre con `id-token: write`, actualiza npm a
    ≥11.5.1 y ejecuta `npm publish` —el provenance sale por
    defecto, sin bandera—. `prepublishOnly` vuelve a correr la
    suite dentro del publish.
  - Sin tokens: el workflow no referencia secretos y no hay
    `.npmrc` con credenciales; la autenticación es OIDC.
  - Validación local: `npm publish --dry-run` disparó
    `prepublishOnly` (suite completa en verde), empaquetó 32
    archivos y solo falló en «versión ya publicada», esperado. La
    validación real de OIDC ocurre en la primera publicación.
  - Pendiente del usuario (paso manual con su sesión 2FA):
    configurar el trusted publisher en npmjs.com → Settings del
    paquete → Trusted Publisher → GitHub Actions: org
    `nucleoabierto`, repo `teleprompter`, workflow `publish.yml`,
    sin environment. No había sesión npm local activa
    (`npm whoami` → 401), así que `npm trust github` no se pudo
    usar desde el agente.

## Revisión

- Subagente: 2026-10-04 — Aprueba
- Usuario: 2026-10-04 — Aprueba
