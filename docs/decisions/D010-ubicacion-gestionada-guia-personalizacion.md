# D010: Ubicación gestionada `.teleprompter/` para la guía de personalización

## Estado

Aceptada

## Contexto

Un paquete declara su archivo de instrucciones de personalización con el
campo `personalization` del manifiesto. La guía debe llegar al
repositorio destino para ser consultable tras la instalación —el origen
remoto es un temporal que se elimina—, y había que decidir quién elige
dónde aterriza: el mantenedor, mediante una entrada más de `install`, o
la herramienta, mediante una convención propia.

## Decisión

La herramienta fija la ubicación: el archivo declarado se copia a
`.teleprompter/<paquete>/<archivo>` en el destino, sin pasar por el mapa
`install`. `.teleprompter/` es un namespace reservado, como
`teleprompter-lock.json`: ningún `target` de `install` puede apuntar
dentro de él. El registro recuerda la ruta en el campo `personalization`
de la entrada del paquete.

## Justificación

Las instrucciones son del mantenedor, pero la ruta donde quedan es
convención de la herramienta: el contrato ya separa lo que instala el
paquete (`install`) de lo que gestiona Teleprompter (el lock). Una
ubicación fija hace la consulta posterior computable sin reconstruir
nada, evita que cada mantenedor disperse la guía por el árbol del usuario
a su criterio y trata el archivo con el mismo estatuto que el lock —
propiedad de la herramienta, no del mapa—. La alternativa de exigirla en
`install` habría duplicado la declaración y convertido una garantía del
sistema en una obligación del autor. Consecuencias: el archivo no aparece
entre los recursos del plan —el campo ya lo nombra— aunque sí se registra
en `files` como contenido escrito, y el namespace reservado se valida
igual que el target reservado del lock.

## Referencias

- `docs/tasks/014-declarar-personalizacion-en-el-formato.md`
- `docs/epics/003-personalizacion-guiada.md`
- `docs/research/2026-09-guia-postinstalacion.md`
