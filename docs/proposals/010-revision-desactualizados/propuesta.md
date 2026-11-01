# Revisión de desactualizados: saber qué hay nuevo antes de actualizar

## Estado

[a] Aprobada

## Problema

Quien mantiene un destino gestionado con Teleprompter no puede saber
qué paquetes instalados tienen una versión más reciente disponible
sin actuar sobre ellos. La única comparación existente ocurre dentro
de la propia actualización —ya decidida y sobre un paquete
concreto—, así que la información llega tarde: primero se decide
actuar, después se ve qué cambiaría. El registro guarda la versión
instalada y el origen de cada paquete, pero nada contrasta esa foto
con lo que cada origen publica hoy.

Afecta a quien administra el destino y crece con el número de
unidades: un destino poblado desde colecciones puede tener varios
paquetes, y comprobarlos exige sondear cada origen de forma
individual. El coste de no resolverlo es decidir a ciegas
—actualizar sin saber si hay novedad real, o mantener versiones
antiguas por desconocimiento— y no poder revisar periódicamente
sin efectos, porque toda comparación disponible arrastra la
operación que la produce.

## Oportunidad

Resolverlo cerraría el ciclo de vida —instalar, revisar,
actualizar, retirar— con el eslabón que hoy obliga a decidir sin
información, y llevaría la misma filosofía del plan visible a la
decisión previa: saber qué hay disponible antes de tocar nada.
Supera a las alternativas existentes —actualizar de a uno y leer
el plan después, o revisar cada origen a mano— en que la
comparación dejaría de depender de una operación con efectos y
cubriría todo el registro de una vez, orígenes locales incluidos.

## Forma de solución

El usuario gana un recorrido nuevo y sin efectos: pedir al producto
que recorra el registro, consulte lo que cada origen registrado
publica ahora y le devuelva la comparación —versión instalada
frente a versión disponible, por paquete— sin tocar ni el destino
ni el registro. Categoría: flujo nuevo —hoy no existe ningún
camino dentro del producto para ese objetivo; solo se logra
actuando—.

## Solución

Un comando `outdated` de la familia de consultas (`list`, `check`,
`guide`): recorre las entradas del registro, traduce cada origen
grabado a su fuente con la misma operación que `update` ya usa,
sondea la versión que cada origen publica y presenta una línea por
paquete —instalada, disponible y si está al día, desactualizado o
no se pudo consultar—. No escribe nada: ni el destino, ni el
registro, ni los respaldos. Admite un nombre de paquete opcional
para limitar la revisión, como `guide`. Los orígenes inalcanzables
degradan a aviso por paquete en lugar de abortar la revisión del
resto.

## Alternativas consideradas

- Enriquecer la consulta de inventario existente —que la lista de
  paquetes instalados muestre también la versión disponible—. Se
  descarta porque esa consulta es hoy instantánea y puramente local
  (solo lee el registro); meterle sondeos remotos rompería su
  carácter y haría que una lectura simple dependiera de la red.
- Reutilizar la actualización con su modo de solo-plan —recorrer
  `update` por cada paquete sin escribir—. Se descarta porque
  exige nombrar y procesar cada unidad por separado, recorre toda
  la maquinaria de conflicto para nada escribir, y nunca produce la
  foto agregada del registro que es justo lo que falta.
- Dejarlo fuera del producto —documentar cómo consultar cada
  origen a mano—. Se descarta porque el registro ya guarda todo
  lo necesario (versión y origen por paquete): resolverlo fuera
  duplicaría a mano lo que el producto ya sabe.

## Fuera de alcance

- Actualizar lo revisado en la misma invocación o en lote
  —decidido con el usuario: conjunto posterior—.
- Comparar contenido entre versiones —qué archivos cambiaron—;
  la revisión compara versiones, no diffs.
- Paquetes no instalados —la revisión solo recorre lo que el
  registro declara—.
- Programación o notificación periódica —la invocación es
  manual; que un CI la llame cae gratis, sin soporte dedicado—.
- Sondeo ligero del manifiesto remoto sin descargar el árbol —
  optimización posible sobre la obtención completa; la primera
  versión reutiliza la obtención existente—.
- Colecciones como unidad separada: si el origen grabado es una
  colección, la revisión se resuelve sobre el miembro grabado, sin
  listar hermanos.

## Investigaciones de apoyo

- Ninguna —el sondeo reutiliza la obtención remota ya
  endurecida y pinneada por la propuesta 008—.

## Borradores

- `docs/tasks/060-sondeo-version-publicada.md` — sondear la versión
  publicada de un origen
- `docs/tasks/061-comando-outdated.md` — el comando `outdated` de punta a
  punta (depende de 060)

## Revisión

- Usuario: 2026-10-29 — Aprueba
