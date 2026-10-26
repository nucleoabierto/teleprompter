# Roadmap

## Dirección

Que el paquete sea un canal completo del mantenedor al repositorio
destino. El canal ya está abierto y el formato ya cubre colecciones:
el producto distribuye, instala, entrega el criterio para adaptar,
mantiene un ciclo de vida —visible, contrastable, actualizable— y se
publica en npm con cadena de release repetible, ejecutable con `npx`.
La dirección pasa ahora a cerrar el ciclo y hacerlo fiable: que la
obtención remota sea robusta y determinista, que el ciclo tenga
salida —revisar, actualizar y retirar— y que el registro permita
reconstruir el destino.

## Now

- Vacío: la épica `docs/epics/008-desinstalacion-paquetes.md` cerró
  con la resolución de divergencias en la retirada (043). No hay
  trabajo en vuelo; la siguiente línea arranca desde Next.

## Next

Ideas de la lluvia de 2026-10-04 comprometidas (`docs/ideas/007–009`),
en el orden decidido en la revisión del 2026-10-04:

- 1. **Revisión de desactualizados** — consultar qué paquetes
  ofrecen versión nueva sin actualizar, y actualizar lo revisado
  en una invocación (idea 008).
  - Justificación: `update` hoy decide a ciegas; sondea orígenes
    remotos, así que rinde mejor con el fetch endurecido y pinneado
    —puede señalar el commit que avanzó sin bump, hoy invisible—.
- 2. **Reproducción del destino desde el registro** — reinstalar de
  una vez lo que el lock de un repo declara, desde sus orígenes
  (idea 009).
  - Justificación: la más dependiente del conjunto —consume los
    orígenes pinneados, la lectura del registro que comparte con la
    desinstalación y la mecánica multi-unidad que la revisión
    establece—; ejecutarla última la hace exacta en lugar de
    aproximada.

## Later

Vacío: las cuatro ideas de la lluvia quedaron comprometidas —el pin
en Now y el resto ordenado en Next.

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
- Usuario: 2026-10-01 — Aprueba (hito 5 cerrado: el saneamiento de la
  revisión 002 queda materializado —pipeline compartido, defensa de
  rutas registradas, error de ejecución tipado, escritura atómica del
  registro y guía retirada—; la base endurecida refuerza la línea
  «Endurecimiento de la obtención remota», que sigue segunda en Next)
- Usuario: 2026-10-02 — Aprueba (la línea «Publicación a npm» quedó
  materializada con 0.2.0 en el registry; lo que restaba —la cadena
  de release— se descompuso en la épica 005 y pasa a Now por ser
  pequeña, acotada y protectora de toda publicación futura)
- Usuario: 2026-10-04 — Aprueba (hito 6 cerrado: tags alineados con
  el contenido publicado, cadena documentada en `docs/release.md`
  con D018, trusted publishing materializado en CI y validado de
  punta a punta con el release 0.2.1 —provenance incluido—;
  Colecciones pasa a Now)
- Usuario: 2026-10-04 — Aprueba (hito 7 cerrado: la épica 006
  materializó las colecciones —selección por nombre con `--package`
  según D019, instalación local y remota por unidades atómicas,
  `origin.package` con re-resolución en `update`, colección de
  referencia e2e en `examples/` y manual renovado con Material—;
  Endurecimiento de la obtención remota pasa a Now)
- Usuario: 2026-10-04 — Aprueba (lluvia de ideas post-hito 7: de
  nueve candidatas evaluadas contra skills.sh, marketplaces de
  Claude Code y mise/aqua, cuatro entran a Later —desinstalación,
  revisión de desactualizados con su comando de revisión previa,
  reproducción del destino y pin de obtención—; las descartadas
  por ahora: alcance global, variantes por agente, andamiaje
  `init`, descubrimiento y orígenes remotos adicionales)
- Usuario: 2026-10-04 — Aprueba (replanificación de prioridades:
  el pin de obtención remota pasa a Now junto al endurecimiento
  del fetch —comparten superficie y el pin da base determinista
  a Next—; el ciclo de vida queda ordenado en Next: desinstalación,
  revisión de desactualizados, reproducción del destino; Later
  queda vacío y la Dirección se actualiza a cerrar el ciclo y
  hacerlo fiable)
- Usuario: 2026-10-12 — Aprueba (hito 8 cerrado: la épica 007
  materializó el pin de obtención remota —la obtención resuelve la
  referencia al commit exacto, la descarga se ancla a él y el
  registro conserva la procedencia junto al origen, en install y en
  update—; Desinstalación de paquetes pasa a Now)
- Usuario: 2026-10-18 — Aprueba (el hito 1 «Gestión de conflictos» entra en Now en primera posición —conjunto pequeño y definitivo cuya superficie de respaldo y diff consumirá la desinstalación, que queda segunda aún sin materializar)

