# Roadmap

## Dirección

Que el paquete sea un canal completo del mantenedor al repositorio
destino. El canal ya está abierto y el formato ya cubre colecciones:
el producto distribuye, instala, entrega el criterio para adaptar,
mantiene un ciclo de vida completo —instalar, revisar, actualizar y
retirar, siempre con plan visible— y se publica en npm con cadena de
release repetible, ejecutable con `npx`. Lo que falta para cerrar el
círculo es hacer el ciclo informado —revisar qué ofrece versión
nueva antes de actualizar— y convertir el registro en fuente de
reconstrucción del destino.

## Now

- 1. Hito 2: Saneamiento de la complejidad interna — siete
  tareas derivadas de la revisión de arquitectura 005: unificar
  el fallo de GitHub y descomponer `fetchRepoTree`, despachar
  `executePlan`, compartir la clasificación de entrantes,
  reutilizar validadores de manifiesto, nombrar los predicados
  del lock, extraer el origen de `runUpdate` y adoptar
  `util.parseArgs`.
  - Estado: en curso —cuatro de siete tareas completadas.
  - Justificación: la revisión 005 detectó duplicaciones y
    operaciones largas justo donde la revisión de
    desactualizados añadirá un comando nuevo —parser,
    orquestación de `commands.js`, obtención remota—; sanear
    primero abarata ese trabajo y es acotado e invariante.
- 2. Revisión de desactualizados — consultar qué paquetes ofrecen
  versión nueva y actualizar lo revisado en una invocación (idea
  008; conjunto por planificar).
  - Estado: pendiente de arrancar.
  - Justificación: sus prerrequisitos ya están materializados —la
    obtención remota endurecida y pinneada le permite señalar el
    commit que avanzó sin bump, y la desinstalación dejó la lectura
    del registro por unidad—; va tras la 044 para no heredar el
    defecto de lectura en la superficie nueva que abre.

## Next

- 1. Reproducción del destino desde el registro — reinstalar de una
  vez lo que el lock de un repo declara, desde sus orígenes (idea
  009).
  - Justificación: la más dependiente del conjunto —consume los
    orígenes pinneados, la lectura del registro que comparte con la
    desinstalación y la mecánica multi-unidad que la revisión de
    desactualizados establece—; ejecutarla última la hace exacta en
    lugar de aproximada.

## Later

Vacío: las cuatro ideas de la lluvia de 2026-10-04 quedaron
comprometidas o materializadas —pin y desinstalación ya ejecutadas,
revisión y reproducción ordenadas entre Now y Next—.

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
- Usuario: 2026-10-26 — Aprueba (la épica 008 «Desinstalación de
  paquetes» cerró con la retirada end-to-end, las divergencias
  decididas con la política de conflictos y el respaldo previo; Now
  se repuebla con la 044 —defecto del lector del registro— primera
  por proteger la superficie que sigue, y la revisión de
  desactualizados segunda; la reproducción del destino queda sola en
  Next y la Dirección se actualiza a ciclo completo informado)
- Usuario: 2026-10-26 — Aprueba (la 044 cerrada y retirada de Now;
  las revisiones de arquitectura 003 y 004 derivan el hito
  «Saneamiento idiomático y estructural», que entra a Now en
  primera posición por abaratar las líneas siguientes, y la
  revisión de desactualizados queda segunda)
- Usuario: 2026-10-29 — Aprueba (hito 1 «Saneamiento idiomático y
  estructural» cerrado: las ocho tareas materializaron las
  correcciones de las revisiones 003 y 004 —primitivas
  compartidas, informes y predicados, invocación dividida en
  gramática, informes, consultas y ciclo de vida, forma canónica
  del plan, resolución de colección compartida y ejecución sin
  lado paquete— y los documentos de dominio quedaron divididos
  por subdominios sobre las fronteras asentadas; la revisión de
  desactualizados queda sola en Now)
