# Plan de instalación y detección de colisiones

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Implementar la generación del plan inspeccionable: la salida por
recurso con su estado (`create`, `identical`, `conflict`,
`managed-update`), la detección de colisiones contra
`teleprompter-lock.json` y el aborto de la operación cuando el plan no
es ejecutable —sin escribir nada en el destino.

## Dependencias

- 006.
- 008.

## Entrada

- El contrato de comportamiento en `docs/instalador.md` —secciones
  «El plan» y «Colisiones»— y las decisiones D005 y D006.
- El esqueleto del CLI y la verificación producidos por la tarea 008.
- El formato del registro en la decisión D007, que el plan consulta
  para distinguir recursos propios de ajenos.

## Resultado esperado

- La salida del plan lista cada recurso `install` con su `target` y su
  estado, a la manera de `terraform plan` y `chezmoi status`.
- La detección de colisiones distingue destino libre, destino ocupado
  por contenido ajeno y recurso propio modificado (`managed-update`)
  consultando `teleprompter-lock.json` si existe.
- Con colisiones presentes: en consola interactiva el plan se muestra
  y se entra a la resolución interactiva por recurso; sin consola
  interactiva la operación lista los conflictos y aborta sin escribir.
- Las opciones `--force` y `--skip` resuelven todas las colisiones por
  adelantado; declarar ambas es un error de invocación.
- El modo de solo-plan (`--dry-run`) produce la misma salida del plan
  y termina sin ejecutar ni registrar.

## Criterios de calidad

- El plan completo se calcula antes de escribir; un plan no ejecutable
  aborta la operación entera (D005).
- La marca de cada recurso coincide con la definición del contrato.
- Ninguna escritura ocurre en esta fase, ni siquiera del registro.

## Procedimiento sugerido

1. Leer `teleprompter-lock.json` del destino si existe.
2. Clasificar cada recurso `install` según el estado del destino y el
   registro.
3. Presentar el plan por recurso con su estado.
4. Implementar el aborto con informe de conflictos y el punto de
   entrada a la resolución interactiva.
5. Implementar el análisis de `--force`/`--skip` como opciones
   excluyentes y el modo de solo-plan que termina tras presentar el
   plan.

## Plan técnico

Extiende el CLI con la fase de plan: `src/lock.js` (lectura del
registro), `src/plan.js` (clasificación por recurso) y `src/prompt.js`
(resolución interactiva); `src/cli.js` orquesta verificación → plan
con los flags `--force`/`--skip`/`--dry-run`. La resolución
interactiva se mueve desde la tarea 010: forma parte de fijar el plan
—un plan no ejecutable solo se conoce tras resolver los conflictos.

- [x] `src/lock.js` — leer `teleprompter-lock.json` del destino:
  ausente → vacío; corrupto → aviso y vacío (se trata como «sin
  historia»)
- [x] `src/plan.js` — `buildPlan`: por cada entrada `install`,
  `create` si el destino no existe, `identical` si el hash coincide,
  `managed-update` si el hash del destino coincide con el registrado
  en el lock, `conflict` en caso contrario; añade las acciones `mkdir`
  de las precondiciones con `create: true`
- [x] Resolución de conflictos: `--force`/`--skip` excluyentes
  resuelven todos; en consola interactiva sin flags se pregunta por
  cada conflicto (`src/prompt.js` con `node:readline`, inyectable);
  sin consola se informa y aborta con código 2
- [x] Salida del plan por recurso con marca; `--dry-run` presenta el
  plan y termina sin ejecutar ni registrar (0 si ejecutable, 2 si no)
- [x] `main()` pasa a `async`; `bin` y tests se adaptan; cobertura
  100 % se mantiene con el prompt testeado en proceso sobre streams
  falsos

Desviaciones: `src/prompt.js` usa `node:readline/promises` en lugar de
la API de callbacks de `node:readline` —misma módulo, pero
`question()` devuelve promesa, lo que permite `await` directo en la
resolución interactiva. Se añadió `src/hash.js` (hash SHA-256 de
archivos y árboles de directorio) que el plan no preveía como módulo
propio.

## Suite de pruebas esperada

Casos de uso: (UC1) el plan se muestra por recurso antes de escribir;
(UC2) las colisiones se resuelven por flags, interacción o aborto;
(UC3) el plan nunca escribe; (UC4) el lock distingue propio de ajeno.

- Destino vacío: todo `create`, plan ejecutable, `--dry-run` → 0 —
  UC1 (Z)
- Paquete de un recurso sobre destino idéntico → `identical` — UC1 (O)
- Varios recursos con estados mixtos en un solo plan — UC1 (M)
- `conflict` cuando el destino difiere sin registro; `managed-update`
  cuando el hash coincide con el lock; registrado pero modificado →
  `conflict` — UC4 (B)
- `--force`/`--skip` juntos → código 4; solos resuelven todos los
  conflictos — UC2 (B)
- Interactiva: respuestas «sobrescribir»/«omitir» por recurso
  resuelven el plan — UC2 (I)
- No interactiva con conflictos sin resolver → informe y código 2,
  sin escrituras — UC3 (E)
- Lock ausente o corrupto → plan se calcula con aviso — UC4 (Z)

## Revisión

- Subagente: ronda 1 — Solicita cambios: M1 lock con forma inesperada
  rompe el proceso (validación estructural añadida a `readLock`); M2
  `managed-update` ignoraba la condición de versión del contrato
  (semver ≥ registrado ahora exigido); M3 `statSync` seguía enlaces
  simbólicos (`lstat` + hoja con destino del enlace); B1 resolución no
  visible junto a la marca con flags (líneas `target → resolución`
  unificadas); B2 archivo y directorio vacíos hasheaban igual
  (marcadores `dir`/`/`); B3 `createAsker` sin defecto (interactiva
  sin asker aborta como no-interactiva); B5 excepciones salían con
  código 1 (bin envuelve en try/catch → código 3). B4 se deja
  anotado: el asker inyectado forma parte de la API interna y un EOF
  de stdin con pregunta pendiente es un caso límite sin tratamiento.
- Subagente: ronda 2 — Aprueba. Hallazgos nuevos resueltos en la
  misma pasada: `existsSync` seguía enlaces al detectar ocupación
  (unificado `hasEntry` con `lstat` en `paths.js`, usado también por
  `manifest.js` y `requires.js`); dominios de hash separados
  (`file`/`link`/`dir`); `isValidLock` exige `version` y `sha256`
  tipado. Anotados para la tarea 010: la escritura `overwrite` debe
  eliminar el destino antes de escribir (nunca a través de un
  enlace), y la fusión del registro entre paquetes.
- Usuario: aprobada tras la segunda ronda de revisión.
