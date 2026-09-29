# Instalar el paquete de referencia sobre un destino real

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Validar el instalador de extremo a extremo instalando el paquete de
referencia `ciclo-tareas` sobre un repositorio con trabajo previo,
incluida una colisión provocada, y comprobar que el recorrido completo
—verificación, plan, ejecución y registro— se comporta como el
contrato declara.

## Dependencias

- 008.
- 009.
- 010.

## Entrada

- El instalador implementado por las tareas derivadas de la tarea 006.
- El paquete de referencia `packages/ciclo-tareas/` y su manifiesto.
- El comportamiento definido por la tarea 006 como referencia de lo
  esperado.

## Resultado esperado

- Una instalación real del paquete `ciclo-tareas` sobre un destino con
  trabajo previo, con el plan presentado antes de escribir y el
  registro producido después.
- Una colisión provocada —un recurso del paquete que ya existe en el
  destino— resuelta por la política declarada y dejada constancia en
  el registro.
- Las fricciones encontradas durante la instalación documentadas como
  correcciones al instalador o al manifiesto.

## Criterios de calidad

- La instalación se ejecuta contra un destino que no es un
  repositorio vacío: contiene archivos propios y al menos un recurso
  que colisiona con el paquete.
- El plan presentado coincide con lo que la ejecución hizo.
- El registro permite reconstruir qué se instaló y cómo se resolvió
  la colisión.
- Las fricciones encontradas quedan resueltas o documentadas, no
  acumuladas.

## Procedimiento sugerido

1. Preparar un repositorio destino con trabajo previo y una colisión
   provocada con el paquete.
2. Ejecutar la verificación y el plan, y comprobar que reflejan la
   colisión antes de escribir.
3. Ejecutar la instalación y comprobar el resultado contra el plan.
4. Revisar el registro producido.
5. Documentar las fricciones y corregirlas en el instalador o en el
   manifiesto.

## Plan técnico

La validación es un test e2e reproducible (`test/e2e.test.js`) que
ejercita el binario real con `execFileSync` sobre un destino con
trabajo previo construido en cada ejecución — el destino no es un
fixture congelado sino un escenario que se recrea en tmpdir, así que
la prueba corre en cada `npm test`.

- [x] Destino con historia: README propio, `.agents/skills/` ya
  existente (satisface `requires`), un skill ajeno al paquete y
  `.agents/skills/ejecutar-tareas/SKILL.md` con contenido local — la
  colisión provocada
- [x] Sin flags en consola no interactiva → código 2, conflicto
  listado, destino intacto
- [x] `--skip` → los otros skills se crean, el conflictivo intacto,
  lock registra `skip` sin hash
- [x] `--force` → sobrescribe; lock registra `overwrite` con hash;
  una pasada más informa `identical`
- [x] Fricciones del ejercicio real documentadas en la tarea

Resultado del ejercicio: el recorrido completo con el binario real se
comportó según el contrato a la primera —aborto no interactivo con el
conflicto listado y destino intacto, `--skip` conservando el trabajo
local, `--force` reemplazándolo y una reinstalación totalmente
`identical`—. Fricciones encontradas: ninguna; el escenario no
requirió correcciones al instalador ni al manifiesto.

## Suite de pruebas esperada

UC1 el recorrido completo funciona con el binario real; UC2 la
colisión se detecta y resuelve por política; UC3 el registro
reconstruye lo ocurrido.

- Sin flags no interactivo con conflicto → código 2, destino intacto
  — UC2 (B)
- `--skip` instala lo no conflictivo, registra omisión sin hash —
  UC1/UC3 (M)
- `--force` sobrescribe y registra `overwrite` con hash — UC1/UC3 (M)
- Reinstalación → `identical` sin escrituras — UC1 (Z)
- El lock reconstruye acción por recurso — UC3 (I)
- Fricciones documentadas en la tarea — proceso (sin letra)

## Revisión

- Subagente: Aprueba — el test ejercita el binario real sobre trabajo
  previo genuino con colisión real, determinista y autocontenido.
  Observaciones menores aplicadas: `process.execPath` en lugar de
  `node` del PATH, aserción del formato del hash y verificación de la
  marca `conflict` en la salida del plan. Desviación benéfica
  registrada: `spawnSync` en lugar de `execFileSync` para capturar
  códigos de salida no cero sin excepción.
- Usuario: aprobada tras la revisión.
