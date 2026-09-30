# Detección de deriva: verificar el estado de lo instalado

## Estado

[a] Aprobada

## Problema

Cada recurso que una instalación deja en el repositorio destino pasa a
convivir con el trabajo del usuario: se edita, se adapta, a veces se
borra. La herramienta recuerda cómo quedó cada recurso en el momento
de escribirlo, pero nada contrasta esa memoria con lo que hay hoy en
disco. El resultado es una incertidumbre silenciosa: frente a un
recurso instalado no se puede distinguir «sigue tal cual se instaló»
de «lo modifiqué a propósito» ni de «falta o está roto».

Afecta a quien instala paquetes y a los agentes que operan sobre el
repositorio destino, desde el momento en que empiezan a adaptar lo
instalado —que es justo lo que la personalización guiada fomenta—.
El coste de no resolverlo es doble: las ediciones locales quedan
indistinguibles del estado prístino, y cualquier decisión posterior
sobre lo instalado —conservarlo, regenerarlo, reemplazarlo— se toma
a ciegas, con riesgo de pisar trabajo del usuario o de asumir intacto
lo que ya no lo está.

## Oportunidad

Resolverlo convierte la memoria de la instalación en diagnóstico: el
estado real del destino pasa a ser una pregunta respondible —qué
sigue intacto, qué se adaptó, qué falta— y las ediciones del usuario
dejan de ser indistinguibles para ser información reconocida. Supera
a la alternativa actual —comparar a mano o no comparar— con un coste
acotado, porque la comparación de contenidos ya existe como insumo
interno del instalador: el esfuerzo es de clasificación y
presentación, no de mecanismo. Además, es la base de información que
cualquier operación posterior sobre lo instalado necesita para
decidir con criterio.

## Forma de solución

Quien está dentro de un repositorio destino puede preguntar al
producto «en qué estado está lo instalado» y recibe, por cada recurso
registrado, su estado real —intacto, modificado o ausente— en
lenguaje de producto: una consulta hermana del listado de paquetes
que compara lo que la instalación escribió con lo que el disco
contiene ahora. Categoría: flujo nuevo — hoy ese objetivo no tiene
camino dentro del producto.

## Solución

Una consulta nueva del CLI, hermana de `list` y `guide` (D011, D012):
se ejecuta dentro del repositorio destino, lee el registro de
instalación y, para cada recurso registrado, recomputa su contenido
contra el disco y lo clasifica —intacto si coincide con lo escrito,
modificado si difiere, ausente si ya no está—. El informe se agrupa
por paquete y responde en lenguaje de producto, sin exponer hashes ni
detalles internos; un destino en el que todo sigue intacto lo dice
explícitamente, como el listado dice «no hay paquetes instalados».

Las entradas que registran una omisión (`skip`) no escribieron nada y
no participan de la comparación; un registro ausente o corrupto se
trata como el resto de lecturas del lock. El diagnóstico informa: no
restaura, no regenera ni decide sobre la deriva.

## Alternativas consideradas

- Extender el listado de paquetes con el estado por recurso (cambio
  de UI sobre la consulta existente): se descarta porque mezcla dos
  preguntas distintas —«qué tengo» y «en qué estado está»— y
  convierte una consulta ligera de inventario en un diagnóstico que
  toca disco; además, esa consulta ya tiene su contrato fijado por
  D012.
- Informar la deriva solo durante la instalación (paso nuevo en un
  flujo existente): se descarta porque la deriva se acumula entre
  operaciones y el problema es poder consultarla en cualquier
  momento, no solo al instalar.
- Documentar un procedimiento de comparación manual (fuera de
  código): se descarta porque mantiene al usuario interpretando
  detalles internos —hashes y formato del registro— que la propuesta
  004 ya fijó como frontera del producto.

## Fuera de alcance

- Actuar sobre la deriva detectada: restaurar, regenerar o actualizar
  recursos. El diagnóstico informa para que la decisión sea del
  usuario.
- Comparar contra versiones nuevas del paquete en el origen: eso
  presupone la actualización entre versiones (idea 006).
- Recursos presentes en el destino que el registro no conoce: la
  pregunta es por lo gestionado.
- Salida estructurada para máquinas (`--json` u otros formatos): la
  consulta responde en lenguaje de producto, como sus hermanas.

## Investigaciones de apoyo

Ninguna — la comparación de contenidos ya existe como `hashPath`
(`src/hash.js`), insumo del instalador, y el patrón de consulta sobre
el registro está fijado por D011 y D012.

## Tareas

- `docs/tasks/017-verificar-recursos-instalados.md` — Verificar el
  estado de los recursos instalados (borrador
  `01-verificar-recursos-instalados.md`)

## Revisión

- Usuario: 2026-09-30 — Aprueba el enmarcado del problema, la
  oportunidad y la forma de solución en el diálogo de descubrimiento.
- Usuario: 2026-09-30 — Aprueba la propuesta.
