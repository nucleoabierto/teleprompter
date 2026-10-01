# D015: Vocabulario del plan de actualización y política de retirados

## Estado

Aceptada

## Contexto

El registro sabe qué escribió la herramienta, con qué hash y desde
dónde (D007, D014), y `check` ya clasifica la deriva de cada recurso
contra el disco (D013). Actualizar un paquete instalado exige un plan
propio —hermano del de instalación y completo antes de escribir
(D005)— que decida recurso a recurso combinando dos comparaciones: lo
que la versión nueva trae frente a lo registrado y lo que el usuario
hizo con lo instalado. La pregunta delicada es qué hacer con los
recursos que la versión nueva ya no trae: eliminar es destructivo y
conservar deja restos huérfanos.

## Decisión

El plan de actualización clasifica cada recurso del manifiesto
entrante con las marcas `create` —destino ausente, sea nuevo o
borrado por el usuario—, `identical`, `update` —la versión cambió el
recurso (contenido entrante ≠ hash registrado) y el destino sigue
intacto, con versión entrante ≥ registrada— y `conflict` —el destino
difiere del registrado, o sigue intacto pero la versión entrante es
un downgrade que no puede gestionar la sobrescritura—. Los recursos
registrados que la versión ya no trae se retiran: intactos se
eliminan automáticamente con la marca `retire`;
modificados o no verificables degradan a `conflict` marcado como
eliminación —`overwrite` quita, `skip` conserva—; los ya ausentes
del disco desaparecen del plan sin marca. Una versión entrante igual
a la registrada no produce plan: `upToDate`.

## Justificación

La política de retirados replica la noción de propiedad que ya gobierna
las sobrescrituras: lo que la herramienta escribió y sigue intacto lo
gestiona ella —una eliminación de recurso intacto es la operación
simétrica del `update` seguro—, y cualquier rastro de trabajo ajeno
degrada a decisión del usuario, igual que una edición local degrada un
`managed-update`. Reinstalar lo que el usuario borró (`create`) es el
comportamiento simétrico: el manifiesto manda. Las entradas `skip`
nunca se retiran porque nunca se escribieron, y el `target` de
`personalization` tampoco mientras el manifiesto entrante la siga
declarando —la guía gestionada se reescribe en cada instalación—; si
la versión nueva abandona el campo, la guía anterior se retira como
cualquier recurso propio. Consecuencias: `conflict` para un retirado
reutiliza la maquinaria de resolución existente (D006) con `overwrite` =
eliminar, sin introducir resoluciones nuevas; la marca `removal` en la
entrada distingue la eliminación pendiente de una sobrescritura, y
`retired` en el plan lista solo las eliminaciones automáticas.

## Referencias

- `docs/tasks/019-plan-de-actualizacion.md`
- `docs/decisions/D005-plan-completo-aborto-total.md`
- `docs/decisions/D006-politica-colisiones.md`
- `docs/decisions/D013-subcomando-check-de-verificacion.md`
