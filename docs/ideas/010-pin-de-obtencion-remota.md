# Pin de obtención remota: el commit exacto detrás de cada instalación

> **Tipo:** idea de funcionalidad — tamaño tarea (complejidad baja)
> **Fecha:** 2026-10
> **Orden sugerido:** 4 de 4 — pequeña y protectora; cierra la
> brecha de reproducibilidad que las hermanas dejan abierta

## Problema

Un `origin` registrado sin `ref` significa «la rama por defecto en
el momento de la obtención»: dos actualizaciones en días distintos
pueden traer contenido distinto para la misma versión declarada. La
promesa de D017 —la versión identifica el contenido— depende del
mantenedor, no del canal: si el repo avanza sin bump, el consumidor
no tiene forma de saber qué árbol produjo su instalación, ni de
volver a él.

## Qué desbloquea

- **Procedencia registrada:** el `origin` puede conservar el commit
  exacto que se obtuvo, no solo la rama.
- **Re-obtención determinista:** actualizar o reinstalar contra el
  commit pinneado —o avanzar explícitamente— deja de ser una
  lotería.

## Flujos de trabajo que se hacen viables

- Reinstalar un paquete meses después y obtener exactamente el
  contenido de la instalación original.
- Detectar que el mantenedor avanzó la rama sin bump: el commit
  cambió, la versión no —la señal que hoy es invisible.
- Auditar de qué árbol exacto salió cada paquete instalado.

## Ventajas como producto

- **Semver creíble:** la promesa «la versión identifica el
  contenido» deja de depender de la disciplina y pasa a ser
  verificable por el canal.
- **Precedente de ecosistema:** los lockfiles de mise/aqua pinnean
  checksums y provenance por la misma razón.

## Tensión que introduce en el roadmap

Es la pieza que hace honestas a las demás ideas del conjunto:
`009-reproduccion-destino-registro.md` promete reconstruir lo
instalado y `008-revision-outdated-actualizacion.md` compara contra
lo que el origen publica —ambas mejoran si la obtención es
determinista—. Introduce su propia decisión de política: pin por
defecto frente a pin explícito, y qué significa «avanzar» cuando el
origen está pinneado. Se solapa con la línea «Endurecimiento de la
obtención remota» en Now —timeout, límites y errores HTTP—: el
endurecimiento hace el fetch robusto, el pin lo hace reproducible;
son complementarios y conviene ejecutar el endurecimiento primero.
