# Registro

## Propósito

Conservar la memoria de lo instalado —qué escribió la herramienta,
dónde y de dónde vino— para distinguir lo propio de lo ajeno,
verificar la deriva y responder qué hay y en qué estado quedó.

## Referencia del modelo

- **Lenguaje ubicuo:**
  - **Registro (lock):** `teleprompter-lock.json` en la raíz del
    destino; por paquete guarda `version`, `installedAt` y `files`
    con `target`, acción y `sha256` —las entradas `skip` no llevan
    hash— y `personalization` con la ruta gestionada de la guía
    cuando el manifiesto la declara; `origin` registra de dónde vino
    la instalación —`{type:'github',repo,ref?,commit}` o
    `{type:'path',path}` absoluta—, opcional en entradas escritas
    antes del campo; `commit` es el commit resuelto de la
    obtención, también opcional —los locks previos no lo llevan—; una
    instalación desde colección añade
    `package` con el nombre del miembro y el origen apunta a la
    raíz de la colección. Es la memoria que distingue lo propio de
    lo ajeno. El lock es dato no confiable también en sus claves:
    las lecturas por nombre solo reconocen entradas propias —una
    clave heredada como `__proto__` o `constructor` se lee como
    ausente—; la guarda es de pertenencia, así que una entrada
    `__proto__` propia sigue resolviéndose.
    - Ancla: `readLock`, `isValidLock`, `writeLock`, `lockEntry`,
      `lockEntries` e `isWritten` en `src/lock.js` —la forma del
      registro solo se navega desde ese módulo, `lockEntry` lleva
      la guarda de propiedad propia e `isWritten` nombra la entrada
      registrada como escrita (toda `action` salvo `skip`)— y
      `originOf` en `src/commands.js`; D007, D014, D019
  - **Propiedad:** un recurso es propio cuando el destino actual
    hashea igual que lo que el registro anotó para él.
    - Ancla: `recorded.get(target) === destHash` en `src/plan.js`
  - **Deriva:** el estado de un recurso registrado al confrontarlo
    con el disco —`intact` (el hash coincide), `modified` (difiere),
    `missing` (la ruta ya no existe) o `unverifiable` (sin `sha256`
    registrado, lectura fallida o ruta que escapa del destino); el
    informe los presenta como `intacto`, `modificado`, `ausente` y
    `no verificable`.
    - Ancla: `classifyResource` en `src/drift.js`, que aplica el
      nivel cadena de la defensa de rutas registradas
      (`recordedChainSafe` en `src/paths.js`); contrato en
      `docs/instalador.md` «La verificación del estado»
- **Entidades / estado:**
  - Hash de recurso — SHA-256 sobre dominios separados (`file\n`,
    `link\n`, `dir\n`) para que tipos distintos nunca colisionen;
    los árboles ordenan sus entradas para que el digest sea
    independiente del orden de lectura.
    - Ancla: `hashPath` en `src/hash.js`
- **Invariantes:**
  - Un lock ilegible o con estructura inesperada degrada a «sin
    historia» con aviso, nunca a crash.
    Ancla: `readLock`/`isValidLock` en `src/lock.js`
  - `.teleprompter/` es propiedad de la herramienta, igual que el lock:
    la guía declarada se copia ahí fuera del plan y sin detección de
    colisiones, y el respaldo de los conflictos sobrescritos vive en
    `backups/` —en ambos casos su destino se verifica escribible
    **antes** de escribir nada: un escape hace el plan no ejecutable
    (D005)—.
    Ancla: `installPersonalization` y `backupConflict` en
    `src/execute.js`, `MANAGED_DIR` en `src/paths.js` y la
    pre-verificación en `src/commands.js`; D010
  - Un recurso `identical` conserva el registro previo que sigue
    siendo veraz —una omisión `skip`, un hash que coincide— y
    registra el recurso en los demás casos: el paquete lo gestiona
    lo escribiera quien lo escribiera, y un hash registrado que el
    disco desmiente no sobrevive.
    Ancla: `writeLock` en `src/lock.js`
- **Operaciones:**
  - Registrar la instalación: fusiona el lock preservando otros
    paquetes; `identical` conserva el registro previo veraz o se
    registra con su acción y su hash, y `skip` va sin hash; la
    guía gestionada se añade a `files` y al campo `personalization`
    sin figurar entre las acciones del plan. La escritura es
    atómica —temporal en el mismo directorio + `rename`—, así que un
    corte a mitad deja el lock anterior o el nuevo, nunca uno
    truncado.
    - Ancla: `writeLock` en `src/lock.js`
  - Consultar la guía: `teleprompter guide [<paquete>]` lee el campo
    `personalization` del registro del directorio de trabajo y
    muestra el mismo bloque; no hay destino ni opciones de
    instalación. Sin guía que mostrar es código 4; la ruta
    registrada insegura o el archivo ausente es código 3 —el lock
    es dato versionado y se revalida antes de leer.
    - Ancla: `showGuide` en `src/queries.js`, que aplica el nivel hoja de
      la defensa de rutas registradas (`resolveRecordedPath` en
      `src/paths.js`); D011
  - Consultar el registro: `teleprompter list` lee el registro del
    directorio de trabajo —sin argumentos ni opciones— y muestra una
    entrada por paquete con `nombre@version`, `installedAt` y los
    `target` escritos; las entradas `skip` no se listan —registran
    una omisión— y no se exponen hashes ni acciones. Sin
    instalaciones responde «no hay paquetes instalados» con código
    0: es una respuesta, no un fallo.
    - Ancla: `showList` en `src/queries.js`; D012
  - Verificar el estado de lo instalado: `teleprompter check`
    confronta el registro del directorio de trabajo con el disco
    —sin argumentos ni opciones— y muestra por paquete una marca de
    deriva por recurso registrado; las entradas `skip` no se
    verifican y encontrar deriva no es un fallo —la consulta siempre
    termina con código 0—.
    - Ancla: `showCheck` en `src/queries.js` y `classifyResource` en
      `src/drift.js`; D013

## Explicación del dominio

- **Fronteras:**
  - Dentro: la forma del lock, su lectura y escritura, la propiedad,
    la deriva, las consultas sobre él y el territorio gestionado
    `.teleprompter/`.
  - Fuera: las acciones que producen los contenidos registrados
    (ciclo de vida, dominio 002) y la política que resuelve los
    conflictos (dominio 004).
  - Relaciones: el ciclo de vida escribe el registro al terminar;
    las consultas lo leen sin modificarlo.
- **Decisiones relevantes:**
  - `docs/decisions/D007` — `teleprompter-lock.json` como memoria de
    propiedad.
  - `docs/decisions/D010` — `.teleprompter/` como ubicación gestionada
    de la guía de personalización.
  - `docs/decisions/D011` — `guide` como subcomando de consulta sobre
    el directorio de trabajo.
  - `docs/decisions/D012` — `list` como subcomando de consulta del
    registro sobre el directorio de trabajo.
  - `docs/decisions/D013` — `check` como subcomando de verificación
    del estado de los recursos instalados.
  - `docs/decisions/D014` — `origin` en el registro: la procedencia
    reobtenible de cada instalación.

## Estado de salud

- Última revisión: 2026-10-29 (tarea
  `docs/tasks/057-nombrar-predicados-forma-lock.md`)
- Divergencias conocidas: cuando un paquete sobrescribe un recurso
  registrado por otro, la entrada del primero queda intacta aunque su
  contenido ya no coincida —el plan siguiente lo marcará `conflict` en
  el paquete viejo, que es conservador pero puede sorprender.
