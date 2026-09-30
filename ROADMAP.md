# Roadmap

## Dirección

Que el paquete sea un canal completo del mantenedor al repositorio
destino: hoy el producto distribuye e instala configuración de
agentes desde GitHub; la dirección es que cada instalación entregue
también el criterio para adaptarla y que lo instalado mantenga un
ciclo de vida —visible, contrastable, actualizable—.

## Now

- Ninguna línea comprometida: la épica 002 y la tarea 012 cerraron
  el trabajo ejecutable; la propuesta `003-personalizacion-guiada`
  está en revisión y no es línea del roadmap hasta que se apruebe y
  planifique.

## Next

- Ninguna línea validada todavía. La primera candidata es la
  propuesta de personalización guiada si se aprueba: es la única
  pieza con problema y forma de solución validados, y la entrega de
  la guía es lo que diferencia al producto de un copiador de
  archivos.

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
