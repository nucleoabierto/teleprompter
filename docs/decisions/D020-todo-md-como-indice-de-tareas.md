# D020: `TODO.md` como nombre del índice de tareas

## Estado

Aceptada

## Contexto

El índice de tareas del proyecto se llamaba `TODO.txt`, nombre
heredado de antes de que el paquete de skills hiciera configurable
la convención. La actualización a factory 0.4.0 introdujo el
catálogo de convenciones —`convenciones.sh` en cada gestor de
artefactos—, donde `indice_tareas` vale `TODO.md` por defecto. El
proyecto podía conservar `TODO.txt` como excepción personalizada o
adoptar el nombre de la convención.

## Decisión

Usamos `TODO.md` como nombre del índice de tareas, el valor por
defecto del catálogo de convenciones. Cambia solo el nombre: el
contenido, las marcas y las secciones del índice no se tocan.

## Justificación

Cada desviación respecto a la convención del paquete es una clave
personalizada que mantener en los `convenciones.sh` de los cuatro
gestores y reescribir tras cada reinstalación. `TODO.txt` no
aportaba nada frente a `TODO.md` —el contenido ya era Markdown—,
así que adoptar el defecto elimina una personalización sin valor y
deja al proyecto en el camino trillado que el paquete documenta y
ejemplifica. La alternativa —conservar `TODO.txt` declarando la
excepción— era legítima pero compraba una seña de identidad sin
beneficio funcional; el nombre nunca fue decisión registrada y no
hay historia que proteger. Consecuencia aceptada: los archivos de
las tareas ya cerradas siguen nombrando `TODO.txt` y se conservan
como registro fiel del momento en que se escribieron.

## Referencias

- `.teleprompter/factory/PERSONALIZE.md` — el catálogo de
  convenciones del paquete, con `indice_tareas` entre sus claves.
- `docs/decisions/D010-ubicacion-gestionada-guia-personalizacion.md`
  — dónde vive la guía de personalización de un paquete instalado.
