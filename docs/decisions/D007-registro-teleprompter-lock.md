# D007: Registro de instalación `teleprompter-lock.json`

## Estado

Aceptada

## Contexto

La instalación necesita memoria: distinguir lo que la herramienta
instaló de lo preexistente es lo que habilita la detección precisa de
colisiones y la repetición predecible de la operación. Los precedentes
convergen: el estado de Terraform habilita cada plan, la base de dpkg
la detección de colisiones, `.copier-answers.yml` las actualizaciones
y `skills-lock.json` el listado y la verificación de lo instalado.

## Decisión

Escribimos `teleprompter-lock.json` en la raíz del destino tras cada
instalación ejecutada: un archivo JSON versionable que registra, por
paquete, `name`, `version`, `installedAt` y una entrada por recurso
con su `target`, la acción realizada y el hash SHA-256 del contenido
escrito.

## Justificación

El registro no es un log de auditoría sino la base de propiedad del
sistema: sin él no hay forma de saber si un destino ocupado es propio
(`managed-update`) o ajeno (`conflict`), ni si fue modificado desde la
instalación. Ubicarlo en la raíz del destino y en JSON versionable
sigue el precedente de `skills-lock.json` de ámbito de proyecto. El
nombre replica el de `teleprompter.json` para que el par
contrato/registro sea reconocible. La actualización y la
desinstalación quedan fuera de alcance, pero este formato las
prepara: saber qué es propio y en qué versión quedó es su
precondición.

## Referencias

- `docs/research/2026-09-motores-instalacion.md` — rec. 5.
- `docs/instalador.md` — sección «El registro».
- `docs/especificacion-paquete.md` — el manifiesto gemelo.
