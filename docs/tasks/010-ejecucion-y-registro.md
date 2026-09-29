# Ejecución del plan y registro de instalación

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Implementar la ejecución del plan ya resuelto —la copia de recursos
al destino según sus acciones— y la escritura del registro
`teleprompter-lock.json` con lo instalado. La resolución interactiva
de colisiones pertenece a la fase de plan y la construye la tarea 009.

## Dependencias

- 006.
- 008.
- 009.

## Entrada

- El contrato de comportamiento en `docs/instalador.md` —la fase de
  ejecución de «La operación» y las secciones «El registro» y
  «Resultado y errores»— y las decisiones D005, D006 y D007.
- El plan de instalación producido por la tarea 009.
- Anotaciones de la revisión de 009 que pertenecen a esta fase:
  un `overwrite` debe eliminar el destino antes de escribir —nunca
  escribir a través de un enlace simbólico, que apuntaría fuera de la
  raíz— y al fusionar el registro hay que decidir qué ocurre cuando un
  paquete sobrescribe un recurso registrado por otro paquete.

## Resultado esperado

- La copia materializa cada acción del plan bajo el destino:
  `create` instala el recurso, `overwrite` reemplaza el destino (lo
  que incluye los recursos marcados `managed-update` en el plan) y
  `skip` lo deja intacto.
- `teleprompter-lock.json` queda escrito en la raíz del destino con
  `name`, `version`, `installedAt` y una entrada por recurso con
  `target`, acción (`create`, `overwrite`, `skip`) y hash SHA-256 del
  contenido escrito —las entradas `skip` registran la decisión sin
  hash.
- La salida final informa cada recurso con la acción realizada y los
  códigos de salida distinguen éxito, plan no ejecutable, manifiesto
  inválido y error de ejecución.

## Criterios de calidad

- La ejecución reproduce el plan: ninguna acción distinta de lo
  anunciado ocurre sobre el destino.
- El registro permite reconstruir qué se instaló, con qué acción y
  qué contenido —incluidas las decisiones `skip`.
- Un error a mitad de ejecución deja constancia de lo ya aplicado en
  la salida; la verificación previa ya garantiza que no hay fallos
  evitables.

## Procedimiento sugerido

1. Copiar cada recurso según su acción, calculando el hash del
   contenido escrito.
2. Escribir `teleprompter-lock.json` fusionando con el registro
   previo si existe.
3. Implementar la salida final y los códigos de salida del contrato.

## Plan técnico

Completa el motor: `src/execute.js` materializa el plan y `writeLock`
en `src/lock.js` escribe el registro; `src/cli.js` cierra el flujo
verificar → plan → resolver → ejecutar → registrar → informe final.

- [x] `src/execute.js` — `executePlan(pkgDir, destDir, plan)`: crea
  los `mkdirs`, luego aplica por recurso la acción derivada de la
  marca (`create`→crear, `identical`→nada, `managed-update`→
  `overwrite`, `conflict`→su `resolution`). `overwrite` elimina el
  destino antes de escribir —nunca a través de un enlace— y copia
  archivos, árboles y enlaces según su tipo; devuelve las acciones por
  recurso
- [x] `src/lock.js` — `writeLock`: fusiona con el registro existente
  preservando los demás paquetes; cada entrada lleva `target`, acción
  y `sha256` del contenido escrito (rehash post-escritura); `skip` sin
  hash
- [x] `src/cli.js` — tras el plan resuelto fuera de `--dry-run`:
  ejecuta, escribe el lock, informa cada recurso con la acción
  realizada y anuncia `personalization` si existe; errores de
  ejecución → código 3 con lo ya aplicado informado
- [x] Cobertura 100 % mantenida

Desviaciones: los recursos `identical` no se registran en el lock —el
contrato solo contempla acciones `create`/`overwrite`/`skip`—, así que
un recurso idéntico pero nunca escrito por la herramienta se comporta
como ajeno en instalaciones futuras (conservador). Los enlaces se
copian como enlaces (`verbatimSymlinks`) para que el hash de lo
escrito coincida con el del paquete.

## Suite de pruebas esperada

UC1 la ejecución materializa exactamente el plan; UC2 el registro
refleja lo realizado; UC3 el informe final y los códigos cumplen el
contrato.

- Destino vacío: recursos copiados, lock con `create`+hash, código 0
  — UC1 (Z)
- Reinstalar el mismo paquete: todo `identical`, lock sin duplicados
  — UC1 (O)
- Plan mixto (`create`+`managed-update`+`skip`): cada recurso aplica
  solo su acción — UC1 (M)
- `overwrite` sobre archivo, directorio y enlace: destino reemplazado
  entero, nunca a través del enlace — UC1 (B)
- `skip` en el lock sin `sha256`; paquetes ajenos preservados — UC2 (B)
- `--dry-run` no escribe recursos ni lock — UC2 (E)
- `personalization` declarado → la salida informa su ubicación — UC3 (I)
- Error a mitad de ejecución → código 3 con lo aplicado informado —
  UC3 (E)

## Revisión

- Subagente: ronda 1 — Solicita cambios: M1 `writeLock` descartaba la
  propiedad de recursos `identical` ya registrados (ahora conserva la
  entrada previa); M2 la copia de enlaces no creaba directorios padre
  (mkdir común en `copyResource`); M3 la garantía anti-enlaces solo
  cubría la hoja — los padres podían ser enlaces que escapaban de la
  raíz (nuevo `resolvesUnder` verificado en plan y en ejecución); B1
  los `mkdir` entran en el informe `applied`; B2 `conflict` sin
  resolución lanza error explícito; B3 el informe de error usa las
  acciones aunque falle `writeLock`; B4 ancestro archivo →
  `conflict`; B5 añadidos tests de overwrite sobre directorio y
  `target` duplicado (nueva validación en el manifiesto).
- Subagente: ronda 2 — Aprueba. Sus observaciones menores también se
  cerraron: `requires` con `create` que escapa por enlace ahora es
  precondición incumplida (código 2, nada escrito); el dedup de
  targets normaliza y rechaza además targets anidados y
  `teleprompter-lock.json` (reservado); el `rm` de un overwrite cuya
  copia falla queda informado en `applied`. Quedan sin tratar por
  ínfimos: TOCTOU entre comprobación y escritura, y FIFOs que podrían
  bloquear el hash.
- Usuario: aprobada tras la segunda ronda de revisión.
