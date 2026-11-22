# Reinstalar lo registrado

El usuario ejecuta `teleprompter reinstall` desde la raíz del
repositorio destino para restaurar todo lo que el registro declara:
cada paquete instalado se reobtiene anclado al commit que su origen
grabó y el destino vuelve al estado declarado, con las divergencias
decididas por la política de conflictos. El ciclo de vida de la
instalación está definido en el [dominio de
instalación](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/002-instalacion.md)
y la resolución de las divergencias, en el [dominio de resolución de
conflictos](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/004-resolucion-conflictos.md).

## Comportamiento

- **Todo lo registrado se reinstala como conjunto:** cada entrada del
  registro se obtiene antes de que nada se planee, todos los planes
  se muestran antes de que nada se decida y ninguna escritura ocurre
  hasta que el conjunto entero se muestra ejecutable.
- **La obtención se ancla al commit registrado:** el árbol que vuelve
  es el que la instalación consumió —no lo que el `ref` publica
  hoy—; un origen local relee la ruta registrada y un origen de
  colección re-resuelve el miembro grabado.
- **Una unidad ya conforme se anuncia como tal:** recursos y guía
  gestionada intactos no producen acciones ni reescritura.
- **Lo borrado a mano reaparece con el contenido declarado** y lo
  divergente se decide como en cualquier operación de escritura:
  pregunta interactiva con su diff, `--force` que lo restaura todo,
  `--skip` que conserva las divergencias, o listado con diff y aborto
  sin consola.
- **Lo decidido a restaurar se respalda antes** bajo
  `.teleprompter/backups/<fecha>-<paquete>@<versión>` y el resultado
  lo anuncia con `respaldo:`.
- **La guía gestionada se materializa de nuevo** como parte de cada
  unidad: borrada a mano o divergente, vuelve con el contenido del
  paquete —es territorio del instalador, no una divergencia que se
  decide; `--skip` no la conserva—.
- **Cada entrada reescrita queda como una instalación:** conserva el
  `origin` registrado —commit y miembro incluidos— y renueva su
  `installedAt`, así que la reproducción siguiente ancla al mismo
  árbol otra vez.
- **Una unidad no reproducible aborta el conjunto sin escribir:** sin
  origen, sin commit registrado, con la ruta local desaparecida o con
  el miembro disuelto, cada una se lista con su motivo y ninguna —
  ni las que sí se obtuvieron— escribe nada. Un origen remoto
  inalcanzable es error de obtención con el mismo corte.
- **`--dry-run` muestra el plan del conjunto por unidad** y corta sin
  escribir recursos, registro ni respaldos.
- **Un fallo a mitad de la ejecución reporta lo ya aplicado** —respaldo
  incluido— **y las unidades pendientes,** y sale con error de
  ejecución.
- **Sin registro, o con uno vacío o ilegible, responde «no hay
  paquetes instalados»** —con `aviso:` cuando el archivo es
  ilegible—.
- **Argumentos o una opción ajena son error de invocación:** la
  operación es sobre el conjunto entero; la selección parcial no
  existe.
- **Tras una reinstalación con `--force`, `check` describe el
  destino declarado:** todo recurso vuelve `intacto`.

Véase la [referencia de `reinstall`](referencia-reinstall.md) para la
gramática completa y los códigos de salida.
