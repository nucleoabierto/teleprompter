# PRD — Revisión de desactualizados

Quien mantiene un destino gestionado no puede saber qué paquetes
instalados tienen una versión más reciente disponible sin actuar
sobre ellos: la única comparación existente ocurre dentro de la
propia actualización, ya decidida. El conjunto busca la revisión
sin efectos: contrastar lo instalado con lo que cada origen
registrado publica, todo el registro de una vez, sin tocar nada.

## Usuarios

Quien mantiene un repositorio destino con paquetes instalados y
quiere decidir actualizaciones con información, además de
procesos automatizados que revisan sin efectos.

## Casos de uso

- **CU-1 — Revisar todo lo instalado:** el consumidor pide la
  revisión y obtiene una línea por paquete con versión instalada,
  versión publicada y estado.
  - Un paquete al día lo indica; uno desactualizado muestra ambas
    versiones.
  - Un origen inalcanzable se reporta en su línea sin impedir la
    revisión del resto.
  - Nada se escribe: ni el destino ni el registro ni temporales
    residuales.
- **CU-2 — Revisar un paquete concreto:** con nombre, la revisión
  cubre solo esa entrada.
  - Un nombre no instalado es error de invocación.
- **CU-3 — Orígenes de cada forma:** la revisión resuelve los
  orígenes registrados —repositorio remoto, directorio local y
  miembro de colección grabado— por igual.

## Comportamiento esperado

- **Solo lectura:** ningún camino escribe —destino, registro,
  respaldos, temporales—.
- La versión publicada es la misma que una actualización
  obtendría del mismo origen: la comparación informa la decisión
  real, no una aproximación.
- El registro vacío o corrupto se comporta como en las demás
  consultas —«no hay paquetes instalados» o degradación a sin
  historial con su aviso—.

## Criterios de éxito

- Saber qué hay desactualizado sin actuar sobre nada.
- La revisión completa es una sola invocación sea cual sea el
  número de unidades del registro.

## Fuera de alcance

- Actualizar lo revisado en la misma invocación o en lote.
- Comparar contenido entre versiones —la revisión compara
  versiones, no diffs—.
- Paquetes no instalados; programación o notificación periódica;
  sondeo ligero del manifiesto remoto; paralelización de sondeos.
