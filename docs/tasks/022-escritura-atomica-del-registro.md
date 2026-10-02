# Escritura atómica del registro

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

`writeLock` escribe `teleprompter-lock.json` con `writeFileSync`
directo: un corte a mitad de la escritura deja un JSON truncado que
`readLock` degrada a «sin historia», perdiendo de una vez toda la
memoria de propiedad de la que dependen `check`, `update` y la
detección de colisiones. Escribir vía archivo temporal + `rename`
hace el fallo binario: o el lock anterior o el nuevo, nunca uno
corrupto.

## Dependencias

- Ninguna

## Entrada

- `src/lock.js` (`writeLock`, líneas ~103-106)
- `docs/architecture-reviews/002-instalacion-tras-el-ciclo-de-vida.md`
  — hallazgo H5

## Resultado esperado

- `writeLock` escribe a un temporal en el **mismo directorio** (el
  rename solo es atómico dentro del mismo sistema de archivos) y lo
  renombra sobre `teleprompter-lock.json`; el temporal se limpia si
  la escritura falla.
- Mismo formato y contrato del lock; el temporal no debe colisionar
  con targets instalables ni quedar registrado.
- Prueba del camino feliz y del fallo de escritura que verifica que
  el lock previo sobrevive.

## Criterios de calidad

- Un `writeFileSync` que falle deja intacto el lock anterior y sin
  temporales residuales.
- El temporal vive en el directorio del destino y tiene nombre
  inequívoco de la herramienta (p. ej. `.teleprompter-lock.json.tmp`
  con sufijo único).
- Suite verde con cobertura 100 %.

## Procedimiento sugerido

1. Implementar tmp+rename en `writeLock` con `try/finally` de limpieza.
2. Añadir las pruebas de éxito y de fallo.

## Notas

- Afín a la línea «Endurecimiento de la obtención remota» del
  roadmap (Next): mismo espíritu de robustez de la base ya publicada.

## Contexto

- **Archivos similares:**
  - `src/lock.js` — `writeLock` construye `data` y la escribe con
    `writeFileSync` directo sobre `teleprompter-lock.json`;
    `readLock` degrada un JSON truncado a «sin historia» con aviso.
  - `src/cli.js` — `executeAndReport` es el único consumidor de
    `writeLock`; un fallo sale con código 3 tras informar de las
    acciones aplicadas.
  - `test/lock.test.js` — pruebas unitarias de las operaciones del
    módulo (`lockEntry`/`lockEntries`); las nuevas pruebas de
    `writeLock` conviven ahí.
  - `test/execute.test.js` — «a lock write failure exits 3…» siembra
    el lock como directorio: con temporal+rename el fallo se traslada
    del `writeFileSync` al `renameSync`, mismo código y mensaje.
- **Patrones:**
  - ESM de funciones; comentarios de bloque en inglés con el porqué.
  - Los tests invocan `main` en proceso: `process.pid` es un sufijo
    único determinista y sembrable.
- **Lecciones:**
  - `docs/lessons/` no existe: ninguna nota aplica.
  - `EXPERIENCIAS.md` (20260930T010326): la revisión técnica requiere
    un subagente capaz de ejecutar `git` y `npm test`.
- **Decisiones:**
  - D007 — el lock es la memoria de propiedad del instalador:
    perderla por una escritura truncada equivale a perder la historia
    completa; la atomicidad protege exactamente ese bien.

## Conectividad

**Veredicto: conectada.**

`writeLock` posee la escritura en un solo punto y el `rename` solo
exige un temporal en el mismo directorio — no hay infraestructura
previa que falte. El fallo de escritura ya tiene comportamiento
observable definido (código 3 + informe de aplicadas) que la suite
existe cubre, y el nombre temporal con `process.pid` es sembrable
desde los tests en proceso.

## Plan técnico

**Subsistema.** `writeLock` cierra cada instalación y actualización
escribiendo `teleprompter-lock.json` con `writeFileSync` directo. Un
corte a mitad deja un JSON truncado que `readLock` degrada a «sin
historia»: se pierde de golpe la memoria de propiedad de la que
dependen `check`, `update` y la detección de colisiones. Escribir a
un temporal en el mismo directorio y renombrar hace el fallo
binario: o el lock anterior o el nuevo, nunca uno corrupto.

- [x] Escribir el JSON a `teleprompter-lock.json.${process.pid}.tmp`
  en el directorio del destino —el `rename` solo es atómico dentro
  de un sistema de archivos—, `renameSync` sobre el nombre real y
  `finally` con `rmSync(tmp, { force: true, recursive: true })`
  - Aporta: el corte a mitad ya no puede truncar el registro;
    `recursive` cubre el caso de un directorio ocupando el nombre
    temporal y `force` el de que el rename ya consumiera el archivo
  - Contexto: el sufijo `process.pid` da unicidad entre ejecuciones
    concurrentes y el nombre lleva la marca de la herramienta; la
    prueba existente que siembra el lock como directorio sigue
    fallando —en el `renameSync`— con el mismo código 3
- [x] Añadir en `test/lock.test.js` el camino feliz —`writeLock`
  persiste un registro que `readLock` devuelve y no quedan
  temporales— y el fallo —un directorio plantado en el nombre
  temporal hace lanzar `writeLock`, deja el lock previo intacto byte
  a byte y sin temporales residuales—
  - Aporta: fija la atomicidad como contrato verificable

## Suite de pruebas esperada

Casos de uso: (1) registrar la instalación al cerrar el pipeline.

- Regresión: la suite existente cubre que el lock se escribe tras
  cada install/update y que su fallo sale con código 3 informando lo
  aplicado — caso 1.
- `writeLock` persiste el registro y no deja temporales en el
  destino (O) — caso 1.
- Una escritura que falla deja intacto el lock previo y sin
  temporales residuales (B) — caso 1.

## Desviaciones del plan

- La prueba existente «update reports applied actions when the lock
  write fails» (`test/cli.test.js`) sembraba el fallo con
  `chmod 444` sobre el lock —bajo `writeFileSync` directo eso
  impedía abrir el archivo para escribir—. Con temporal+rename los
  permisos del archivo viejo ya no bloquean nada: el rename solo
  exige escritura en el directorio. La siembra pasó a plantar un
  directorio en el nombre temporal —las aserciones quedaron
  intactas—. Motivo: la forma de provocar el fallo cambió con el
  mecanismo, no el contrato que la prueba verifica.
- Consecuencia inherente del mecanismo: el lock resultante lleva
  los permisos por defecto de un archivo nuevo en lugar de conservar
  los del archivo previo —un `chmod` manual sobre el lock ya no
  sobrevive a la siguiente escritura—.

## Revisión

- Subagente: 2026-10-01 — Aprueba
- Usuario: 2026-10-01 — Aprueba
