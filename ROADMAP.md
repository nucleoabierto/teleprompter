# Roadmap

## Dirección

Que el paquete sea un canal completo del mantenedor al repositorio
destino: hoy el producto distribuye e instala configuración de
agentes desde GitHub; la dirección es que cada instalación entregue
también el criterio para adaptarla y que lo instalado mantenga un
ciclo de vida —visible, contrastable, actualizable—.

## Now

- 1. Hito «Ciclo de vida del paquete instalado» — primera pieza:
  `docs/tasks/016-listar-paquetes-instalados.md` (propuesta 004
  aprobada)
  - Estado: pendiente de arrancar.
  - Justificación: es la pieza mínima del ciclo de vida —convierte
    el registro en superficie legible— y sus hermanas (deriva y
    actualización, ideas 005 y 006) presuponen esa lectura.

## Next

- Las ideas 005 (detección de deriva) y 006 (actualización entre
  versiones) completarían el hito cuando pasen por el flujo de idea
  a tarea; `list` es su precondición.

## Later

- **Ciclo de vida del paquete instalado** — las ideas
  `005-deteccion-deriva` y `006-actualizacion-entre-versiones`
  siguen pendientes de propuesta; la primera pieza (listado) ya está
  comprometida en Now.
- **Publicación a npm** — convertir `npx @nucleoabierto/teleprompter`
  en realidad; pendiente de decidir la cadena de release que D008
  aplazó.
- **Colecciones** — el formato ya prevé `collection: true`;
  habilitaría repositorios con varios paquetes y la selección entre
  ellos.
- **Endurecimiento de la obtención remota** — residuales registrados
  en la revisión de la tarea 012: timeout, límite de tamaño y
  distinción de errores HTTP.

## No ahora

- **Repositorios privados y autenticación** — fuera del alcance
  público actual; se reconsidera si el producto lo necesita.
- **Ejecución de código del paquete** (hooks o scripts de
  adaptación) — descartada en la propuesta 003 por romper el
  carácter declarativo.
- **Sustitución de variables en los recursos** — descartada como
  forma dominante en la misma revisión; se reconsidera si el texto
  libre resulta insuficiente.

## Revisión

- Usuario: 2026-09-29 — Aprueba
