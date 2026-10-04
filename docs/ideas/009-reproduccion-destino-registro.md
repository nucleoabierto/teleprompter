# Reproducción del destino: reconstruir lo instalado desde el registro

> **Tipo:** idea de funcionalidad — tamaño conjunto (complejidad media)
> **Fecha:** 2026-10
> **Orden sugerido:** 3 de 4 — el dato ya está registrado; falta el
> camino para consumirlo

## Problema

Al clonar un repositorio que ya usa Teleprompter, no hay forma de
reinstalar lo que su registro declara: cada persona del equipo
tendría que saber qué paquetes se instalaron y de dónde vinieron. El
registro `teleprompter-lock.json` —versionado con el repo— ya
describe cada paquete instalado con su origen, pero ninguna operación
lo consume como lista de reproducción.

## Qué desbloquea

- **Reconstrucción del destino:** instalar de una vez todos los
  paquetes que el registro declara, desde sus orígenes registrados.
- **Onboarding del equipo:** un clon nuevo llega al estado de
  configuración de agentes que el repositorio documenta, sin
  conocimiento tribal.

## Flujos de trabajo que se hacen viables

- Clonar el proyecto y reconstruir su configuración de agentes con
  una invocación.
- Auditar qué debería estar instalado —el registro— contra lo que
  está —el disco—: la brecha es lo que falta reproducir.
- Compartir un conjunto de paquetes entre repos copiando su
  registro.

## Ventajas como producto

- **El registro como contrato:** el lock pasa de bitácora a fuente
  reproducible, el mismo salto que `package-lock.json` dio en npm.
- **Distribución natural:** los propios ejemplos del repo
  (`examples/`) se convierten en casos de uso directos.

## Tensión que introduce en el roadmap

Reutiliza la instalación por unidades de colección (D019) y la
lectura del registro que `007-desinstalacion-paquetes.md` también
consume —implementarlas en ese orden las comparte. Depende de que
los orígenes registrados sigan vivos: los `origin` sin `ref` no
pinnean el commit, lo que conecta con
`010-pin-de-obtencion-remota.md` —reproducir exactamente exige
obtener exactamente—. Los orígenes muertos o retirados necesitan una
historia de error clara, no silencio.
