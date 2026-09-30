# D011: `guide` como subcomando de consulta sobre el directorio de trabajo

## Estado

Aceptada

## Contexto

La guía de personalización queda materializada en el destino y
registrada en el lock (D010), y la instalación la entrega al final de
su resultado. La consulta posterior necesitaba una invocación dentro
de la gramática del CLI —subcomando, opción o convención— y alcance:
el usuario fijó que debe ejecutarse dentro del proyecto.

## Decisión

`teleprompter guide [<paquete>]` es un comando propio de la
gramática, junto a la forma `install`: opera siempre sobre el
directorio de trabajo —sin `destino` ni opciones de instalación—,
lee el campo `personalization` del registro y muestra el bloque de
cada paquete con guía, o solo el del paquete indicado.

## Justificación

La consulta es una operación distinta de la instalación: un
subcomando propio la mantiene fuera de la gramática de `install`,
como `brew info` frente a `brew install` en el precedente
encuestado. Operar solo sobre el directorio de trabajo sigue la
convención del usuario —la guía se consulta desde dentro del
proyecto— y mantiene la gramática mínima: el `dest` posicional de
`install` no se arrastra a un comando que solo lee. Consecuencias:
`guide` queda reservado como primera palabra —un repositorio llamado
`guide` se instala vía el alias `install`—; los errores de resolución
son de invocación (código 4) y la lectura del archivo registrado
fallida es de ejecución (código 3).

## Referencias

- `docs/tasks/015-entregar-personalizacion-al-instalar.md`
- `docs/epics/003-personalizacion-guiada.md`
- `docs/research/2026-09-guia-postinstalacion.md`
- `docs/decisions/D010-ubicacion-gestionada-guia-personalizacion.md`
