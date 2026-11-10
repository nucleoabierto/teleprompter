# PRD — Reproducción del destino

En un repositorio que usa Teleprompter los recursos instalados
viajan versionados junto al registro: cuando una personalización
sale mal o la infraestructura del proyecto que la alimenta
cambia, volver a un punto limpio exige reinstalar todo lo
declarado —hoy solo a mano, paquete a paquete—. El conjunto
busca la reinstalación completa como una sola operación:
devolver el destino al estado que el registro declara.

## Usuarios

Quien mantiene un repositorio destino —el mantenedor solo en
varias máquinas o el equipo cuya configuración de agentes vive
en el repositorio— y los procesos que reinstalan el estado
declarado.

## Casos de uso

- **CU-1 — Reinstalar todo lo declarado:** el consumidor pide la
  reinstalación y ve el plan del conjunto por unidad antes de
  que nada se escriba; confirmado —o sin decisiones pendientes—
  el destino queda en el estado declarado.
  - Una unidad ya conforme se anuncia como tal, sin acciones.
  - Un recurso borrado a mano reaparece con el contenido
    declarado.
  - Un recurso con cambios locales es una divergencia a decidir:
    restaurar lo declarado —con respaldo— o conservarlo.
- **CU-2 — Ensayar la reinstalación:** el modo de solo-plan
  muestra el conjunto completo sin escribir nada.
- **CU-3 — Una unidad no reproducible:** un origen que no
  responde, una entrada sin origen o sin commit, una ruta local
  desaparecida o un miembro disuelto de su colección abortan la
  operación antes de escribir, listando las unidades afectadas
  con su motivo.

## Comportamiento esperado

- **Conjunto antes que escritura:** la obtención y el plan de
  todas las unidades preceden a cualquier escritura; nada cambia
  si el conjunto no es ejecutable.
- **Anclaje:** cada unidad se reinstala desde el commit que su
  origen registró, no de lo que ese origen publica hoy.
- **Divergencias:** se deciden con la política vigente —pregunta
  con diff, `--force` que restaura, `--skip` que conserva, o
  listado y aborto—; lo restaurado se respalda.
- El registro vacío o corrupto se comporta como en las demás
  operaciones —«no hay paquetes instalados» o degradación con
  aviso—.

## Criterios de éxito

- Volver a un punto limpio es una sola invocación sea cual sea
  el número de unidades.
- Tras una reinstalación que restaura divergencias, la
  verificación de la deriva no reporta nada.

## Fuera de alcance

- Reinstalar un subconjunto del registro o a lo publicado hoy
  por cada origen.
- Preservar o recuperar las personalizaciones descartadas;
  re-ejecutar la personalización.
- Consumir el registro de otro repositorio como manifiesto
  importable; retirar targets que la entrada declara pero el
  manifiesto no trae.
