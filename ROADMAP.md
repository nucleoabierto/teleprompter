# Roadmap

## Dirección

Que el paquete sea un canal completo del mantenedor al repositorio
destino: hoy el producto distribuye e instala configuración de
agentes desde GitHub; la dirección es que cada instalación entregue
también el criterio para adaptarla y que lo instalado mantenga un
ciclo de vida —visible, contrastable, actualizable—.

## Now

- 1. docs/epics/003-personalizacion-guiada.md — Personalización
  guiada
  - Estado: pendiente de arrancar.
  - Justificación: es la única línea comprometida tras cerrar el
    motor y la distribución remota, y completa el canal
    mantenedor→destino: la entrega de la guía de adaptación es lo
    que diferencia al producto de un copiador de archivos.

## Next

- Ninguna línea validada todavía. Las siguientes candidatas son las
  ideas del ciclo de vida del paquete (`Later`), que entran al
  índice cuando pasen por el flujo de idea a tarea.

## Later

- **Ciclo de vida del paquete instalado** — ideas
  `004-listado-paquetes-instalados`, `005-deteccion-deriva` y
  `006-actualizacion-entre-versiones`: registro legible, contraste
  con el disco y actualización entre versiones; se presuponen en ese
  orden y aprovechan el registro que D007 ya fijó.
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
