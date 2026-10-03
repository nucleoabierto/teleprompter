# Registrar los targets `identical` en el lock

## Estado

[ ] Pendiente | [~] En progreso | [r] En revisión | [x] Completada | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

El registro `teleprompter-lock.json` debe reflejar todo lo que el
paquete gestiona, no solo lo que la operación escribió. Hoy los
targets clasificados `identical` —el recurso ya existe con el mismo
contenido— no entran al registro: un `install` o `update` cuyo plan
sea todo `identical` marca el paquete como instalado sin registrar
un solo recurso. Se observó tras reinstalar factory 0.2.0 sobre
contenido idéntico: el lock quedó con solo `PERSONALIZE.md` y los
32 skills instalados quedaron desregistrados.

## Dependencias

- Ninguna

## Entrada

- `src/lock.js` — `writeLock` y la construcción de `files` a partir
  de los resultados de la ejecución.
- `src/execute.js` / `src/plan.js` — de dónde salen los resultados
  por target y la acción `identical`.
- `docs/decisions/D007` — el registro guarda los recursos
  instalados, sus acciones y sus hashes.

## Resultado esperado

- Toda entrada `identical` del plan produce su registro en `files`
  con su `sha256`, igual que las escritas.
- `check` verifica esos recursos como parte del paquete instalado.
- Prueba del caso: instalar sobre contenido idéntico registra todos
  los targets del manifiesto; cobertura 100 %.

## Criterios de calidad

- Instalar un paquete cuyos recursos ya existen con contenido
  idéntico produce un lock con todas sus entradas.
- La acción registrada es la real (`identical` u otra que el
  contrato defina), no una fingida como `create`/`overwrite`.

## Procedimiento sugerido

1. Prueba que instala sobre contenido idéntico y afirma el lock
   completo.
2. Hacer que la construcción de `files` incluya los resultados
   `identical`, decidiendo qué valor de `action` les corresponde en
   el contrato del registro.
3. Regresión: install normal, update y la escritura atómica (tarea
   022) siguen igual.

## Notas

- Defecto observado en la actualización real de factory 0.1.0 a
  0.2.0, junto al de la tarea 029; la reparación de este repo ya se
  hizo reinstalando.
- Conviene decidir el `action` registrado para `identical`
  explícitamente: `D007` guarda «las acciones» y la semántica del
  campo es contrato.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
