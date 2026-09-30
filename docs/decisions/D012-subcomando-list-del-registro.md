# D012: `list` como subcomando de consulta del registro

## Estado

Aceptada

## Contexto

El registro `teleprompter-lock.json` es la memoria de propiedad
del sistema (D007), pero solo existía para uso interno: nadie lo
presentaba. La pregunta «qué paquetes tengo instalados» necesitaba
una invocación dentro de la gramática del CLI, con el mismo
alcance que `guide` fijó (D011): ejecutarse dentro del proyecto,
sobre el directorio de trabajo.

## Decisión

`teleprompter list` es un comando propio de la gramática, junto a
`install` y `guide`: no admite argumentos ni opciones, lee el
registro del directorio de trabajo y muestra una entrada por
paquete instalado —nombre, versión, fecha y recursos escritos— en
lenguaje de producto.

## Justificación

La consulta del registro es una operación distinta de la
instalación y de la consulta de la guía: un subcomando propio la
mantiene fuera de ambas gramáticas y replica el patrón que D011
fijó. Operar solo sobre el directorio de trabajo sostiene la
gramática mínima: el `dest` posicional de `install` no se
arrastra a un comando que solo lee. La salida traduce el registro
a lenguaje de producto —sin hashes ni acciones internas— y las
entradas `skip`, que registran una omisión y no un recurso
escrito, no se listan. Sin instalaciones la respuesta lo dice con
código `0` —es una respuesta, no un fallo—, a diferencia de
`guide`, donde no haber guía que mostrar sí es error de
invocación. Consecuencias: `list` queda reservada como primera
palabra de la gramática, sin coste real —la especificación remota
exige la forma `user/repo` y el origen local exige `--path`, así
que ninguna instalación válida empezaba por `list`—, y cualquier
argumento u opción es un error de invocación (código 4).

## Referencias

- `docs/tasks/016-listar-paquetes-instalados.md`
- `docs/decisions/D007-registro-teleprompter-lock.md`
- `docs/decisions/D011-subcomando-guide-de-consulta.md`
- `docs/proposals/004-listado-paquetes-instalados/`
