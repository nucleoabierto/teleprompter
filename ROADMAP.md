# Roadmap

## Dirección

Que el paquete sea un canal completo del mantenedor al repositorio
destino. La primera parte está materializada: el producto distribuye,
instala, entrega el criterio para adaptar y mantiene un ciclo de vida
—visible, contrastable, actualizable—. La dirección pasa ahora al
alcance del canal: que el formato cubra colecciones de paquetes, que
la obtención remota sea robusta y que la distribución vía `npx` sea
real.

## Now

- Vacío: la épica `docs/epics/004-ciclo-de-vida-paquete-instalado.md`
  cerró con el comando `update` (020). No hay trabajo en vuelo; la
  siguiente línea arranca desde Next.

## Next

- 1. **Colecciones** — habilitar repositorios con varios paquetes y la
  selección entre ellos (`collection: true` ya está previsto en el
  formato).
  - Justificación: es la línea que más cambia la superficie pública
    del formato; resolverla antes de publicar evita que la primera
    versión en npm nazca ya necesitando una extensión incompatible.
- 2. **Endurecimiento de la obtención remota** — timeout, límite de
  tamaño y distinción de errores HTTP, residuales registrados en la
  revisión de la tarea 012.
  - Justificación: `update` hace que el fetch se invoque con mucha más
    frecuencia que en `install`, de modo que el costo de un fetch
    frágil creció con el ciclo de vida; protege lo ya publicado antes
    de ampliar el canal.
- 3. **Publicación a npm** — convertir `npx
  @nucleoabierto/teleprompter` en realidad; pendiente de decidir la
  cadena de release que D008 aplazó.
  - Justificación: cierra el canal —sin publicación, el ciclo de vida
    solo beneficia a quien clona el repo—; va después de colecciones y
    endurecimiento para que lo publicado sea ya la superficie
    definitiva y robusta.

## Later

- Vacío: las tres líneas pendientes pasaron a Next con la aprobación
  del usuario; no quedan temas de dirección sin compromiso.

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
- Usuario: 2026-10-01 — Aprueba (épica 004 cerrada; Now queda vacío y
  las tres líneas de Later pasan a Next, con colecciones en primera
  posición por su impacto sobre la superficie del formato)
