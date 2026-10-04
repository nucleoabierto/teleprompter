# `origin` de colección y ciclo de vida por paquete

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Extender el `origin` registrado en el lock para que identifique el
paquete dentro del repositorio de origen, y verificar que el ciclo de
vida funciona por paquete instalado desde colección: `update`
resuelve el mismo paquete al reintentar el origen, y `list`, `check`
y `guide` no necesitan conocer que el paquete vino de una colección.

## Dependencias

- Tarea 032 — la instalación desde colección materializada.

## Entrada

- `src/lock.js` y `docs/decisions/D014-campo-origin-del-registro.md`
  — el registro guarda `origin: github | path` con `repo`/`ref` o
  ruta absoluta.
- `src/update` (`update`, `buildUpdatePlan`) — re-resuelve el origen
  registrado.
- La extensión del `origin` decidida en la tarea 031.

## Resultado esperado

- El `origin` de una instalación desde colección registra la
  identidad del paquete dentro del origen (p. ej. su ruta o nombre
  del índice), sin romper los orígenes ya registrados de paquetes
  sueltos.
- `update` sobre un paquete de colección re-descarga el origen,
  resuelve el mismo paquete y actualiza; `guide` y `check` se
  comportan igual que con cualquier otra instalación.

## Criterios de calidad

- `update` de un paquete instalado desde colección aplica las
  versiones nuevas del mismo paquete, no de otro del índice.
- Los locks con `origin` de paquete suelto (sin datos de colección)
  siguen funcionando sin migración.
- La suite cubre update desde colección local y el caso de paquete
  retirado del índice entre versiones.

## Procedimiento sugerido

1. Planear la implementación (sub-flujo de desarrollo).
2. Extender el esquema del `origin` y su escritura en el pipeline
   de instalación.
3. Hacer que `update` resuelva colección → paquete registrado.

## Contexto

- Archivos similares:
  - `src/cli.js` (`runUpdate`) — resuelve la fuente desde el
    `origin` registrado o explícita, obtiene una vez y corre el
    pipeline de actualización con `checkVerified(..., parsed.pkg)`
    como guardián de identidad; `executeAndReport` reescribe el
    `origin` desde `originOf(source)` — sin ajuste, una
    actualización desde colección **perdería** el campo `package`.
  - `src/lock.js` (`isValidOrigin`) — valida la forma del `origin`;
    no restringe claves extra, así que el `package` escrito por 032
    pasa; falta exigir string cuando está presente.
  - `src/collection.js` — `isCollectionDir`, `resolveSelection` y
    `describeIndex` de la tarea 032, reutilizables tal cual.
- Patrones: la identidad del paquete en `update` es `parsed.pkg`
  (la clave del lock); `checkVerified` ya falla un origen que
  publica otro paquete; errores por `EXIT_*` con mensajes en
  español.
- Dominio: `docs/domains/001-paquete.md` — el paquete instalado es
  la unidad del ciclo de vida; la colección no es entidad.
- Producto: `manual/referencia-update.md` describe `update`; su
  actualización con colecciones es de la tarea 035.
- Lecciones: `docs/lessons/` sin notas consolidadas.
- Decisiones:
  - D019 — `origin.package` registra el nombre (no la ruta);
    `update` re-resuelve nombre → ruta por el índice; no admite
    `--package`; un origen explícito que sea colección se resuelve
    por el nombre del paquete que se actualiza; nombre desaparecido
    → error «ya no está en la colección».
  - D014 — forma y opcionalidad del `origin` que esta tarea tipa.
  - D017 — semver inmutable: la versión nueva viene del manifiesto
    del miembro re-obtenido.

## Conectividad

Veredicto: **conectada**.

- Toda la infraestructura existe: 032 dejó `isCollectionDir`,
  `resolveSelection` y el validador de colección; `runUpdate` ya
  tiene el punto de inserción natural (entre obtención y
  verificación) y el guardián de identidad (`expectedName`).
- El caso «el mantenedor disolvió la colección en un paquete suelto
  con el mismo nombre» ya funciona sin código nuevo: el manifiesto
  raíz deja de ser colección, `verifyPackage` lo acepta y
  `checkVerified` valida el nombre — el fallback es gratuito.
- Único cambio de contrato: `isValidOrigin` exige `package` string
  cuando está presente — localizado en `lock.js`.

## Plan técnico

**Subsistema:** `runUpdate` resuelve la fuente (registrada o
explícita), obtiene el árbol y verifica el paquete raíz. Con
colecciones, la verificación debe apuntar al miembro que el lock
registra: el índice re-resuelve nombre → ruta en el árbol recién
obtenido, y el `origin` reescrito debe conservar el nombre elegido.

- [x] Tipar `package` en `isValidOrigin` (`lock.js`): string
  opcional en ambos tipos de origen
  - Aporta: el contrato del lock valida el campo nuevo; un
    `package` no-string degrada el lock a corrupto como el resto
    de las formas inválidas
- [x] Resolver el miembro en `runUpdate` tras obtener: si el árbol
  es colección, `resolveSelection` con el nombre del paquete que se
  actualiza y verificar ese directorio; ausente → error «ya no está
  en la colección» con disponibles
  - Aporta: la re-resolución de D019 — cubre el origen registrado
    y el explícito con el mismo camino
  - Contexto: `resolveSelection` deduplica y devuelve unidades
    `{name, dir}`; aquí siempre hay exactamente un nombre
- [x] Conservar `package` en el `origin` reescrito: cuando la
  fuente resuelta es colección, `originOf(source)` gana
  `package: <nombre>` en la llamada a `executeAndReport`
  - Aporta: actualizar no degrada el registro — el origen sigue
    re-resoluble en actualizaciones futuras
- [x] Verificar que `list`, `check` y `guide` operan sobre la
  entrada del lock sin conocer la colección (pruebas de humo)
  - Aporta: el criterio de que el ciclo de vida sigue siendo por
    paquete, sin cambios en esos subcomandos

## Suite de pruebas esperada

- **Re-resolución desde colección** (caso de uso principal)
  - `update` de un paquete instalado desde colección local aplica
    la versión nueva del mismo miembro, no de otro (M)
  - `update` desde el `origin` remoto registrado re-obtiene el repo
    y actualiza el miembro registrado (O)
  - `update` con origen explícito que es colección resuelve por el
    nombre del paquete que se actualiza (I)
  - el `origin` reescrito tras el `update` conserva `type`/`repo`/
    `ref`/`package` (I)
  - `--ref` sobre un origen de colección cambia la referencia de
    obtención (B)
- **Bordes** (casos de uso de degradación)
  - paquete retirado del índice → error «ya no está en la
    colección» con disponibles, nada escrito (E)
  - colección disuelta en paquete suelto con el mismo nombre → el
    `update` sigue funcionando (B)
  - lock con `origin.package` no-string → lock corrupto con aviso,
    no crash (E)
- **Ciclo de vida por paquete** (caso de uso de independencia)
  - `list` muestra el paquete de colección como cualquier otro (I)
  - `check` verifica sus archivos (I)
  - `guide` entrega su personalización (I)
- **Regresión**: `update` de paquetes sueltos sin `package` —suite
  actual en verde— (sin letra)

## Notas

- Observación de la revisión (cosmética, no bloqueante): ante un
  índice con basename duplicado, `update` colapsa el fallo al
  mensaje «ya no está en la colección» mientras `install` muestra
  el error preciso de ambigüedad — mismo código de salida y mismo
  efecto (nada escrito); quedó para un ajuste futuro si se desea.
- La prueba «update aborts when the collection manifest itself is
  invalid» cubre el camino `EXIT_MANIFEST` de colección corrupta
  durante la re-resolución.

## Revisión

- Subagente: 2026-10-04 — Aprueba
- Usuario: 2026-10-04 — Aprueba
