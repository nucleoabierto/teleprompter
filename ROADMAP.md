# Roadmap

## Dirección

Que el paquete sea un canal completo del mantenedor al repositorio
destino: hoy el producto distribuye e instala configuración de
agentes desde GitHub; la dirección es que cada instalación entregue
también el criterio para adaptarla y que lo instalado mantenga un
ciclo de vida —visible, contrastable, actualizable—.

## Now

- 1. `docs/epics/004-ciclo-de-vida-paquete-instalado.md` — Ciclo de
  vida del paquete instalado
  - Estado: en curso — 1 de 5 piezas completa (016); pendientes 017
    (verificación de deriva), 018 (origen en el registro), 019 (plan
    de actualización) y 020 (comando `update`).
  - Justificación: es el único trabajo comprometido y materializa la
    dirección: el listado ya hizo el registro legible; la
    verificación lo hace contrastable y habilita el plan de
    actualización, que con el origen registrado converge en
    `update`.

## Next

- Vacío: el ciclo de vida agota el trabajo validado. La siguiente
  línea se decidirá entre las de Later cuando el hito avance.

## Later

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
- Usuario: 2026-09-30 — Aprueba (ideas 005 y 006 promovidas a la
  épica 004; el hito queda en Now en curso y Later pierde la línea)
