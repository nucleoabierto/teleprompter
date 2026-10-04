# Roadmap

## Dirección

Que el paquete sea un canal completo del mantenedor al repositorio
destino. El canal ya está abierto: el producto distribuye, instala,
entrega el criterio para adaptar, mantiene un ciclo de vida —visible,
contrastable, actualizable— y se publica en npm, ejecutable con
`npx`. La dirección pasa ahora al alcance y la gobernanza del canal:
que el formato cubra colecciones de paquetes, que la obtención remota
sea robusta y que la cadena de release haga de cada publicación un
acto repetible.

## Now

- 1. **Endurecimiento de la obtención remota** — timeout, límite de
  tamaño y distinción de errores HTTP, residuales registrados en la
  revisión de la tarea 012.
  - Justificación: `update` hace que el fetch se invoque con mucha
    más frecuencia que en `install`, de modo que el costo de un fetch
    frágil creció con el ciclo de vida; con Colecciones cerrada, es
    la única línea de Next y pasa a Now.

## Next

- Vacío: no quedan líneas comprometidas sin horizonte.

## Later

Ideas de la lluvia de 2026-10-04 (docs/ideas/007–010), en el orden
sugerido:

- 1. **Desinstalación de paquetes** — salida limpia del ciclo de
  vida: retirar un paquete y sus recursos registrados con plan
  visible (idea 007).
  - Justificación: el registro ya sabe qué retirar; es la pieza
    que hace creíble que el lock describe el estado real.
- 2. **Revisión de desactualizados** — consultar qué paquetes
  ofrecen versión nueva sin actualizar, y actualizar lo revisado
  en una invocación (idea 008).
  - Justificación: `update` hoy decide a ciegas; la revisión es
    el eslabón que falta del ciclo instalar → revisar →
    actualizar → retirar.
- 3. **Reproducción del destino desde el registro** — reinstalar de
  una vez lo que el lock de un repo declara, desde sus orígenes
  (idea 009).
  - Justificación: el lock pasa de bitácora a fuente reproducible;
    el onboarding del equipo deja de ser conocimiento tribal.
- 4. **Pin de obtención remota** — conservar el commit exacto
  detrás de cada instalación y hacer determinista la re-obtención
  (idea 010).
  - Justificación: hace verificable la promesa de D017 —la versión
    identifica el contenido—; complementa el endurecimiento del
    fetch de Now.

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
