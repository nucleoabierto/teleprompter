# Esqueleto del CLI y verificación del paquete

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Construir la base del ejecutable `@nucleoabierto/teleprompter`: el
comando invocable por `npx`, la lectura y validación del manifiesto
`teleprompter.json` y la comprobación de las precondiciones del
paquete contra el repositorio destino, abortando sin escribir cuando
la entrada no es válida.

## Dependencias

- 006.

## Entrada

- El contrato de comportamiento en `docs/instalador.md` —la sección
  «La operación» (fases de verificación del manifiesto y de
  precondiciones) y «Distribución»— y las decisiones D005 y D008.
- La especificación del manifiesto en
  `docs/especificacion-paquete.md` (D001–D004), que fija qué valida la
  verificación.
- El paquete de referencia `packages/ciclo-tareas/` como caso
  concreto de entrada válida.

## Resultado esperado

- Un comando ejecutable —`npx @nucleoabierto/teleprompter` en desarrollo
  equivale a invocar el binario del paquete npm local— que acepta la
  ruta del paquete y la ruta del destino.
- Validación del manifiesto conforme a la especificación: campos
  obligatorios, semver, entradas `install` bien formadas, `requires`
  y rechazo de manifiestos `collection` y `format` desconocidos.
- Comprobación de `requires.paths` contra el destino.
- Ninguna escritura cuando la verificación falla, con salida y código
  de error que distinguen manifiesto inválido de precondición
  incumplida.
- La verificación devuelve un resultado estructurado —el manifiesto
  validado y las acciones de precondición anotadas— que la generación
  del plan (tarea 009) consume sin revalidar.

## Criterios de calidad

- Toda la validación ocurre antes de cualquier efecto sobre el
  destino (D005).
- Los errores nombran el campo o la ruta concreta que falla.
- La implementación no introduce dependencias ajenas al contrato
  definido en `docs/instalador.md`.
- `bin/` es una capa delgada: parsea argumentos, invoca `src/` y
  traduce el resultado a salida y códigos de salida; la lógica de
  dominio no vive en el binario.
- Cobertura del 100 %: el script de pruebas (`npm test`) ejecuta
  `node --test` con cobertura V8 y umbrales de líneas, funciones y
  ramas en 100; la suite falla por debajo de ellos.

## Procedimiento sugerido

1. Crear el paquete npm con su binario y el análisis de argumentos.
2. Implementar la carga y validación del manifiesto.
3. Implementar la comprobación de `requires.paths` contra el destino.
4. Cubrir con casos: manifiesto válido, manifiesto inválido,
   precondiciones cumplidas e incumplidas —con `node:test` +
   `node:assert`, sin dependencias, y cobertura del 100 % exigida por
   los umbrales del runner (`node --test` con cobertura V8).

## Contexto

- Archivos similares: ninguno — esta tarea introduce la primera base
  de código del repositorio (hasta ahora solo contenía `docs/` y
  `packages/`); el diseño del paquete npm queda fijado por esta tarea.
- Patrones:
  - El comportamiento a implementar es el contrato de
    `docs/instalador.md`; el manifiesto a validar es el de
    `docs/especificacion-paquete.md`.
  - JavaScript distribuido como `@nucleoabierto/teleprompter` por
    `npx` (D008); Node disponible en el entorno: v24.
  - Documentación y mensajes del proyecto en español.
- Lecciones: ninguna aplica (`docs/lessons/` no existe todavía).
- Decisiones:
  - D001–D004 — la especificación del manifiesto que la verificación
    valida (JSON puro, `collection` no instalable, semver explícita,
    `install` explícito con rutas seguras).
  - D005 — plan completo antes de escribir; la verificación es la
    primera barrera, sin efectos sobre el destino.
  - D008 — tecnología y distribución.

## Conectividad

Veredicto: **conectada**.

La tarea asume el contrato de comportamiento y la especificación del
manifiesto, ambos existentes y aprobados, y el paquete de referencia
`packages/ciclo-tareas/` como caso de entrada válida. La ausencia de
código previo no es un bloqueo: crear el paquete npm es precisamente
el objetivo de la tarea.

## Plan técnico

Primera base de código del repositorio: un paquete npm en la raíz
(`package.json` + `bin/` + `src/`), publicable como
`@nucleoabierto/teleprompter` e invocable por `npx` (D008). Sin
dependencias externas; `node:test` + `node:assert` para las pruebas.

- [x] Crear el paquete npm: `package.json` (`"type": "module"`, `bin`,
  `files`), binario `bin/teleprompter.js` con shebang que acepta
  `install <paquete> <destino>` —capa delgada: parsea, invoca `src/`
  y traduce a salida y códigos de salida
  - Aporta: la superficie invocable que las tareas 009 y 010
    extienden.
- [x] Implementar `src/manifest.js`: carga y validación del
  `teleprompter.json` según la especificación —campos obligatorios,
  `format`, semver, `install` bien formado con rutas seguras,
  `requires`, rechazo de `collection`— con código de salida 1
  - Aporta: la primera fase de verificación del contrato.
- [x] Implementar `src/requires.js`: comprobación de `requires.paths`
  contra el destino, con `create: true` anotado para el plan; la
  incumplida aborta con código 2
  - Aporta: la segunda mitad de la verificación.
- [x] La verificación devuelve un resultado estructurado —manifiesto
  validado y acciones de precondición— que la generación del plan
  (009) consumirá sin revalidar
  - Aporta: la interfaz entre verificación y plan (hallazgo H2 de
    `docs/architecture-reviews/001-motor-instalacion.md`).
- [x] Escribir pruebas en `test/` con `node:test` + `node:assert`
  sobre el paquete de referencia y fixtures; `npm test` ejecuta el
  runner con cobertura V8 y umbrales del 100 % en líneas, funciones y
  ramas
  - Aporta: la verificación del contrato y la disciplina de cobertura
    desde la primera tarea de código.

## Suite de pruebas esperada

Casos de uso: (UC1) invocar el binario ejecuta la verificación; (UC2)
un manifiesto inválido aborta con código 1 sin escribir; (UC3) una
precondición incumplida aborta con código 2 sin escribir; (UC4) la
verificación acepta el paquete de referencia.

- `install` sin argumentos o con ruta inexistente → código 4 — UC1 (Z)
- El manifiesto de `packages/ciclo-tareas` valida y sus `requires` se
  comprueban — UC4 (O)
- Manifiesto con campos ausentes, `format` desconocido, semver
  malformada o `collection: true` → código 1 — UC2 (M)
- `install` con `target` absoluto o con `..` → código 1 — UC2 (B)
- `requires.paths` inexistente sin `create` → código 2; con
  `create: true` pasa — UC3 (B)
- Ningún caso de fallo escribe en el destino — UC2/UC3 (E)
- La salida de error nombra el campo o la ruta que falla — UC2/UC3 (I)
- Cobertura del 100 % en líneas, funciones y ramas — proceso (sin
  letra)

## Desviaciones del plan

- El parseo de argumentos y la traducción a códigos de salida viven en
  `src/cli.js` (`main()`), no en `bin/`: el plan decía que `bin/`
  parseaba, pero mover la capa de invocación a `src/` la hace
  testeable sin spawn y mantiene `bin/` aún más delgado (4 líneas).
  Cumple la intención del plan —la lógica no vive en el binario— y la
  suite añade un test con `execFileSync` que ejerce el binario real.

## Revisión

- Subagente: 2026-09-28 — Solicita cambios (primera ronda: duda sobre
  cobertura de ramas, resuelta por ejecución —100 % real—; correcciones
  menores aplicadas: test del binario real, `isDirectory`, ruta en el
  error de JSON, semver sin ceros a la izquierda, rutas Windows).
  Segunda ronda: Aprueba (gap de `collection` no booleano corregido).
- Usuario: 2026-09-28 — Aprueba
