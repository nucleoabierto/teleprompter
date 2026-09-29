# Esqueleto del CLI y verificación del paquete

## Estado

[ ] Pendiente

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

## Criterios de calidad

- Toda la validación ocurre antes de cualquier efecto sobre el
  destino (D005).
- Los errores nombran el campo o la ruta concreta que falla.
- La implementación no introduce dependencias ajenas al contrato
  definido en `docs/instalador.md`.

## Procedimiento sugerido

1. Crear el paquete npm con su binario y el análisis de argumentos.
2. Implementar la carga y validación del manifiesto.
3. Implementar la comprobación de `requires.paths` contra el destino.
4. Cubrir con casos: manifiesto válido, manifiesto inválido,
   precondiciones cumplidas e incumplidas.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
