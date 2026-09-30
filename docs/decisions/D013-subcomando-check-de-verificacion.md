# D013: `check` como subcomando de verificación del estado instalado

## Estado

Aceptada

## Contexto

El registro `teleprompter-lock.json` sabe lo que la herramienta
escribió y con qué hash (D007), y `list` ya lo presenta como
superficie de producto (D012). La pregunta «¿en qué estado quedó lo
instalado?» exige confrontar ese registro con el disco dentro de la
gramática del CLI, con el mismo alcance que fijaron `guide` y
`list`: ejecutarse dentro del proyecto, sobre el directorio de
trabajo.

## Decisión

`teleprompter check` es un comando propio de la gramática, junto a
`install`, `guide` y `list`: no admite argumentos ni opciones, lee
el registro del directorio de trabajo y por cada paquete instalado
muestra una marca de deriva por recurso registrado —`intacto`,
`modificado`, `ausente` o `no verificable`— sin exponer hashes.

## Justificación

La verificación del estado es una consulta distinta del listado:
`list` responde qué se instaló y `check` cómo quedó, así que un
subcomando propio replica el patrón que D011 fijó, como ya hizo
D012. Operar solo sobre el directorio de trabajo mantiene la
gramática mínima. Las marcas son lenguaje de producto: `intacto` y
`modificado` salen de comparar el contenido actual con el hash
registrado; `ausente` es la ruta desaparecida; `no verificable`
declara honestamente la entrada sin `sha256` —válida según el
contrato del lock—, el recurso ilegible o la ruta registrada que
escapa del destino —el lock es dato no confiable y sus rutas se
revalidan antes de leer, como en `guide`—, en lugar de omitirla
como un `skip`. La deriva es información, no un fallo: el comando
termina con código `0` haya o no deriva. Consecuencias: `check`
queda reservada como primera palabra de la gramática y cualquier
argumento u opción es un error de invocación (código 4); la
clasificación vive en `src/drift.js`, separada de la presentación,
porque el plan de actualización la consume también.

## Referencias

- `docs/tasks/017-verificar-recursos-instalados.md`
- `docs/decisions/D007-registro-teleprompter-lock.md`
- `docs/decisions/D011-subcomando-guide-de-consulta.md`
- `docs/decisions/D012-subcomando-list-del-registro.md`
