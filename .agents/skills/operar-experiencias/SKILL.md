---
name: operar-experiencias
description: >
  Ejecuta las operaciones mecánicas sobre el registro de experiencias del
  proyecto —identificadores únicos, listado y filtrado de entradas,
  anexado en forma canónica y marcado de consolidadas— preservando el
  invariante append-only, para que los consumidores deleguen la acción
  en lugar de re-describir el artefacto.
  Usar cuando un trabajo necesite leer o mutar el registro de
  experiencias con una operación del catálogo.
  Sinónimos: operar experiencias, registro de experiencias, anexar
  entrada, marcar consolidada, id único de experiencia.
---

# Operar experiencias

Instrucciones para que un agente ejecute las operaciones mecánicas del registro de experiencias del proyecto. El skill recibe la acción delegada del consumidor —qué hacer sobre el registro, sin nombrar el artefacto ni su formato—, resuelve su ubicación desde la configuración de la instalación y la ejecuta con el script bash propio de `assets/`.

## Cuándo usar

- Cuando un skill necesite leer o mutar el registro de experiencias —generar un `Id`, listar entradas por estado o por tarea, anexar una entrada nueva o marcar entradas como consolidadas— y la acción sea una operación del catálogo.

## Cuándo no usar

- Para lecturas simples que el arnés resuelve directamente (`read`, `grep`, `git`): no se delegan.
- Para acciones con juicio —detectar la corrección, decidir la equivalencia de «misma corrección», clasificar la consolidación, redactar el contenido de la entrada—: pertenecen al consumidor.
- Para operaciones sobre otros artefactos del sistema: el índice de tareas, los archivos de tarea, las ideas y las series corresponden a `consultar-artefactos` y `actualizar-artefactos`.

## Entrada

- La acción delegada del consumidor: la operación del catálogo y sus términos, más el contenido de la entrada cuando la operación es `anexar`. El consumidor no nombra el artefacto ni pasa su ruta.
- La ubicación del registro de experiencias, resuelta de `assets/convenciones.sh` —la clave `archivo_experiencias`, escrita por el instalador según `PERSONALIZE.md`—.

## Salida

- El resultado de la operación por stdout, en la forma que cada operación declara. El registro ausente es un error con diagnóstico en las lecturas y una creación en las escrituras; la ausencia de resultados es salida vacía legítima.

## Principios rectores

1. **Mecánica, nunca síntesis:** las operaciones devuelven lo que el registro contiene o materializan la entrada dada; el contenido lo redacta siempre el consumidor.
2. **La acción es semántica:** el consumidor delega qué hacer sobre el registro —«las pendientes», «anexar esta entrada», «marcar consolidadas»— sin nombrar el artefacto, su ubicación ni su formato; esos detalles los resuelve este skill.
3. **Append-only:** las entradas nunca se editan ni se borran; la única mutación admitida sobre una entrada es el marcado de `Estado` pendiente a consolidada.
4. **Escritura canónica, lectura tolerante:** el parser acepta las variantes existentes —campos envueltos, entradas sin `Estado`, separación irregular entre entradas— y la escritura produce siempre la forma canónica: un campo por línea, sin envolver.
5. **Falla sin escribir:** una entrada que no cumple la forma canónica o un `Id` duplicado rechazan el anexado sin tocar el registro.
6. **Contrato único:** el script recibe la entrada por argumentos o `stdin`, reserva stdout a datos parseables y stderr a diagnósticos, devuelve `0` en éxito —incluido el vacío legítimo— y `2` cuando falta la entrada (D033).

## Procedimiento

1. **Recibir la acción delegada:** el consumidor indica la operación y sus términos.
2. **Resolver la ubicación del registro:** el valor de `archivo_experiencias` en `assets/convenciones.sh`; un archivo de configuración malformado hace fallar el script con diagnóstico antes de tocar nada.
3. **Ejecutar el script** `assets/experiencias.sh` con la ruta resuelta, la operación y los términos dados; el cuerpo de la entrada en `anexar` entra por `stdin`.
4. **Devolver la salida al consumidor:** stdout es el dato; un código de salida distinto de cero se transmite con su diagnóstico, sin reinterpretarlo.

## Acciones

El consumidor delega la acción de dominio; el gestor resuelve la ubicación del registro desde `assets/convenciones.sh` y la traduce a la operación del catálogo.

- «un identificador para la entrada nueva»: `id` —pasando los `Id` ya asignados del mismo lote si los hay—.
- «las experiencias [pendientes|consolidadas]»: `listar`.
- «las experiencias de la tarea `<ref>`»: `por-tarea` —la referencia es de dominio—.
- «anexar esta entrada»: `anexar` con la entrada en forma canónica por `stdin` —el contenido lo redacta el consumidor—.
- «marcar consolidadas las entradas `<id>…`»: `marcar`.

## Catálogo de operaciones

El script `assets/experiencias.sh` se invoca como `experiencias.sh <registro> <operación> [términos]`, donde `<registro>` es la ruta resuelta en el paso 2. Las entradas se emiten tal como están escritas —el bloque `- Id:` con sus campos— separadas por una línea en blanco.

### `id [ocupado…]`

Emite por stdout un `Id` único con formato `AAAAMMDDTHHMMSS`: el timestamp actual o, si colisiona con un `Id` del registro o con algún `<ocupado>` dado —los ya asignados a otras entradas del mismo lote—, uno posterior obtenido reintentando cada segundo. El registro ausente no es error: la escritura posterior lo creará. Falla con exit `1` si no logra un `Id` único en diez intentos.

### `listar [pendiente|consolidada]`

Emite todas las entradas del registro; con el estado como término, solo las de ese estado. Sin resultados, salida vacía con exit `0`. Registro ausente: exit `2`.

### `por-tarea <ref>`

Emite las entradas cuyo campo `Tarea` contiene la subcadena `<ref>`; la ruta del archivo de tarea identifica sus entradas. Sin resultados, salida vacía con exit `0`. Registro ausente: exit `2`.

### `anexar`

Lee la entrada de `stdin` y la añade al final del registro, fijando `Estado: pendiente`. La forma canónica exigida es:

```markdown
- Id: AAAAMMDDTHHMMSS
  Tarea: <referencia a la tarea>
  Esperado: <texto>
  Obtenido: <texto>
  Corrección: <texto>
```

Un campo por línea, sin envolver; cualquier otra forma —campos envueltos, ausentes o de más, `Id` mal formado o ya presente en el registro— rechaza la operación con diagnóstico y sin escribir. Si el registro no existe, lo crea con la cabecera append-only antes de anexar.

### `marcar <id>…`

Cambia `Estado: pendiente` a `consolidada` en la línea `Estado:` de cada entrada cuyo `Id` se indica, sin tocar nada más del archivo. Un `Id` ausente, ya consolidado o cuya entrada no tiene campo `Estado` produce un aviso a stderr sin abortar el lote: el resto se procesa. Exit `0` si todos los `Id` quedaron marcados; `1` si alguno falló.

## Finalización

El skill ha terminado cuando el consumidor recibió el resultado de la operación —o el diagnóstico si falló— tal como el script lo produjo, y el registro quedó mutado según la acción.

## Referencias

- `docs/decisions/D033-pasos-mecanicos-skills-utilidad-scripts.md` — el mecanismo de delegación y el contrato de los scripts que estas operaciones cumplen.
- `PERSONALIZE.md` del paquete — la configuración de la instalación que declara la ubicación del registro.
