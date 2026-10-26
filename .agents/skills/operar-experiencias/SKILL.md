---
name: operar-experiencias
description: >
  Ejecuta las operaciones mecánicas sobre el registro de experiencias del
  proyecto (identificadores únicos, listado y filtrado de entradas,
  anexado en forma canónica y marcado de consolidadas) preservando el
  invariante append-only, para que los consumidores deleguen la acción
  en lugar de re-describir el artefacto.
  Usar cuando un trabajo necesite leer o mutar el registro de
  experiencias con una operación del catálogo.
  Sinónimos: operar experiencias, registro de experiencias, anexar
  entrada, marcar consolidada, id único de experiencia.
---

# Operar experiencias

Instrucciones para que un agente ejecute las operaciones mecánicas del registro de experiencias del proyecto. El skill recibe la acción delegada del consumidor (qué hacer sobre el registro, sin nombrar el artefacto ni su formato) y la resuelve aplicando el documento de reglas `references/experiencias.md`, que declara la ubicación del registro, su formato y cada operación: el agente opera el archivo directamente con las herramientas habituales.

## Cuándo usar

- Cuando un skill necesite leer o mutar el registro de experiencias (generar un `Id`, listar entradas por estado o por tarea, anexar una entrada nueva o marcar entradas como consolidadas) y la acción sea una operación del catálogo.

## Cuándo no usar

- Para lecturas simples que el arnés resuelve directamente (`read`, `grep`, `git`): no se delegan.
- Para acciones con juicio (detectar la corrección, decidir la equivalencia de «misma corrección», clasificar la consolidación, redactar el contenido de la entrada): pertenecen al consumidor.
- Para operaciones sobre otros artefactos del sistema: el índice de tareas, los archivos de tarea, las ideas y las series corresponden a `consultar-artefactos` y `actualizar-artefactos`.

## Entrada

- La acción delegada del consumidor: la operación del catálogo y sus términos, más el contenido de la entrada cuando la operación es `anexar`. El consumidor no nombra el artefacto ni pasa su ruta.

## Salida

- El resultado de la operación, en la forma que cada operación declara. El registro ausente es un fallo con diagnóstico en las lecturas y una creación en las escrituras; la ausencia de resultados es vacío legítimo.

## Principios rectores

1. **Mecánica, nunca síntesis:** las operaciones devuelven lo que el registro contiene o materializan la entrada dada; el contenido lo redacta siempre el consumidor.
2. **La acción es semántica:** el consumidor delega qué hacer sobre el registro («las pendientes», «anexar esta entrada», «marcar consolidadas») sin nombrar el artefacto, su ubicación ni su formato; esos detalles los resuelve este skill.
3. **Append-only:** las entradas nunca se editan ni se borran; la única mutación admitida sobre una entrada es el marcado de `Estado` pendiente a consolidada.
4. **Escritura canónica, lectura tolerante:** la lectura acepta las variantes existentes (campos envueltos, entradas sin `Estado`, separación irregular entre entradas) y la escritura produce siempre la forma canónica: un campo por línea, sin envolver.
5. **Contrato único:** las operaciones devuelven datos parseables (las entradas tal como están escritas), reportan el vacío legítimo como tal y fallan con diagnóstico cuando no pueden ejecutarse (D035); el anexado de una entrada fuera de la forma canónica o con `Id` duplicado se rechaza sin tocar el registro.

## Procedimiento

1. **Recibir la acción delegada** del consumidor: la operación y sus términos.
2. **Resolver y operar:** el documento de reglas `references/experiencias.md` declara la ubicación del registro y las reglas de cada operación (incluida la lectura tolerante), y el agente opera el archivo directamente siguiéndolo; el cuerpo de la entrada en `anexar` lo da el consumidor.
3. **Transmitir el resultado:** el dato tal como las reglas lo producen; un fallo se comunica con su diagnóstico, sin reinterpretarlo.

## Acciones

El consumidor delega la acción de dominio; el gestor resuelve la ubicación del registro desde su documento de reglas y la traduce a la operación del catálogo.

- «un identificador para la entrada nueva»: `id` (pasando los `Id` ya asignados del mismo lote si los hay).
- «las experiencias [pendientes|consolidadas]»: `listar`.
- «las experiencias de la tarea `<ref>`»: `por-tarea` (la referencia es de dominio).
- «anexar esta entrada»: `anexar` con la entrada dada por el consumidor en forma canónica.
- «marcar consolidadas las entradas `<id>…`»: `marcar`.

## Catálogo de operaciones

Cada operación se resuelve aplicando la sección de su nombre en `references/experiencias.md`, el documento de reglas del artefacto (el agente opera el registro directamente con las herramientas habituales, sin scripts). Una operación sin resultados devuelve el vacío legítimo; una que no puede ejecutarse es fallo con diagnóstico y sin escribir.

### `references/experiencias.md`: el registro de experiencias (`EXPERIENCIAS.md`)

- `id [ocupado…]`
- `listar [pendiente|consolidada]`
- `por-tarea <ref>`
- `anexar`
- `marcar <id>…`

## Finalización

El skill ha terminado cuando el consumidor recibió el resultado de la operación (o el diagnóstico si falló) tal como las reglas lo produjeron, y el registro quedó mutado según la acción.

## Referencias

- `references/experiencias.md`: el documento de reglas del registro de experiencias: formato, lectura tolerante, escritura canónica y la definición completa de cada operación.
- `docs/decisions/D035-reglas-declarativas-por-artefacto.md`: el mecanismo de delegación que estas operaciones cumplen.
- `PERSONALIZE.md` del paquete: los artefactos de estado que la instalación prepara y verifica.
