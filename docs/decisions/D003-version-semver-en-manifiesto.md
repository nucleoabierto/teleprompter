# D003: Versión semver explícita en el manifiesto

## Estado

Aceptada

## Contexto

El contrato del manifiesto debe declarar la versión del paquete. Hay dos
estrategias en la industria: declarar la versión en el manifiesto (npm,
VS Code, Obsidian) o derivarla del VCS (packspec la omite porque exige
git y usa sus tags; skills.sh instala siempre el contenido actual).

## Decisión

Declaramos `version` en el manifiesto como semver `x.y.z` obligatorio.
La autoridad de la versión es el manifiesto, no el VCS del repositorio
que aloja el paquete.

## Justificación

La derivación por VCS solo funciona cuando cada paquete controla sus
propios tags o commits. Como los paquetes de Teleprompter pueden
convivir en un repositorio con otro contenido (D002), los tags del repo
son del repo, no del paquete. Declarar la versión en el manifiesto es la
opción estructuralmente equivalente de npm, VS Code y Obsidian, y hace
la versión inspeccionable sin acceso al historial git.

## Referencias

- `docs/research/2026-09-formatos-manifiesto.md` — patrón «Versionado»
  y recomendación 3.
- `docs/formato-paquete.md` — el contrato que la decisión fija.
