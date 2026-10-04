# Colecciones: instalar paquetes de un repositorio multi-paquete

## Estado

[a] Aprobada

## Problema

La configuración de agentes rara vez viene de a una pieza: los
paquetes afines se agrupan naturalmente en un solo repositorio, pero
hoy ese repositorio no se puede distribuir como conjunto. El formato
ya contempla el caso —un manifiesto con `collection: true` declara
el índice de paquetes de un repositorio—, sin embargo el instalador
lo rechaza: el único camino instalable es un `teleprompter.json` de
paquete en la raíz, sin forma de nombrar qué paquete se quiere.

La fricción cae sobre los dos lados del canal. El mantenedor que
agrupa varios paquetes en un repositorio no tiene cómo publicarlos
juntos: le queda partir el conjunto en un repositorio por paquete
—fragmentando versionado, documentación y gobernanza de lo que
conceptualmente es una sola familia— o renunciar a la forma
colección que el formato ya le ofrece. El consumidor que apunta a un
repositorio con varios paquetes no tiene cómo elegir: ni selección,
ni descubrimiento de qué contiene el repo antes de instalar.

## Oportunidad

Materializar lo que el formato ya declara cierra la brecha
especificación ↔ instalador sin añadir conceptos nuevos: el
mantenedor distribuye una familia de paquetes desde un solo
repositorio con ciclo de vida unificado, y el consumidor descubre y
selecciona qué instala. Supera la alternativa vigente —un
repositorio por paquete— que multiplica la gobernanza justo donde
la agrupación es lo natural, y es coherente con la decisión ya
tomada de que el nombre y la versión de cada paquete viven en su
propio manifiesto, no en el índice.

## Forma de solución

Apuntar a un repositorio que contiene varios paquetes deja de ser un
callejón sin salida: `install` descubre que el destino es una
colección y el consumidor declara qué paquete (o paquetes) del
índice instala —con la posibilidad de ver primero qué ofrece el
repo—; una vez instalados, el ciclo de vida sigue siendo por
paquete (`list`, `check`, `guide`, `update` operan sobre lo
instalado, no sobre la colección). Categoría: paso nuevo en un flujo
existente — el flujo de instalación existe y funciona; le falta el
eslabón que resuelve colección → paquete(s) elegido(s).

## Solución

`install` aprende a resolver manifiestos de colección: cuando el
destino —local o remoto— describe una colección, el consumidor
nombra qué paquete(s) del índice instala, y puede conocer el
contenido del índice antes de decidir. El registro extiende el
`origin` de cada instalación para identificar el paquete dentro del
repositorio, de modo que `update` resuelva el mismo paquete al
reintentar el origen y `list`/`check`/`guide` sigan operando por
paquete instalado, sin trato especial a la colección.

## Alternativas consideradas

- Instalar todo el conjunto (la colección como unidad instalable):
  se descarta porque impone al consumidor aceptar targets que quizá
  no quiere y contradice el propósito del índice —listar para
  elegir—; además la especificación declara la colección contenedor
  puro, no instalable.
- Direccionar subdirectorios sin colección
  (`install user/repo/subdir`): se descarta porque prescinde del
  índice que D002 ya fijó —el consumidor tendría que conocer la
  estructura interna del repo sin poder descubrirla, y el mantenedor
  pierde la forma de declarar que los paquetes forman una familia.
- Mantener el rechazo (un repositorio = un paquete instalable): se
  descarta porque deja el campo `collection` especificado pero
  inutilizable —la brecha que motiva la línea— y empuja al
  mantenedor a fragmentar repos.

## Fuera de alcance

- Colecciones anidadas (una colección que contiene otras): la
  especificación solo contempla paquetes como entradas.
- Dependencias o restricciones de versión entre paquetes de una
  colección: no hay concepto de dependencia entre paquetes en el
  formato.
- Instalar la colección como unidad atómica («todo el conjunto de
  golpe») más allá de seleccionar explícitamente varios paquetes.
- Gestión de la colección como entidad en el ciclo de vida
  (`update`, `guide`, `check` actuando sobre la colección misma):
  se gestiona por paquete instalado.
- Cambios en la superficie pública del formato: `collection` y
  `packages` ya están especificados; la línea materializa lo
  declarado, salvo que el trabajo descubra ajustes menores.

## Investigaciones de apoyo

- `docs/research/2026-10-seleccion-paquetes-colecciones.md` —
  patrones de selección del consumidor en herramientas
  multi-paquete (Claude Code, skills.sh, npm workspaces, VS Code),
  ejecutada durante el refinamiento de esta propuesta.

## Tareas materializadas

- `docs/tasks/031-definir-comportamiento-colecciones.md` — Definir
  el comportamiento de instalación desde colecciones
- `docs/tasks/032-instalar-desde-coleccion.md` — Instalar el
  paquete seleccionado de una colección (depende de 031)
- `docs/tasks/033-origen-y-ciclo-de-vida-coleccion.md` — `origin`
  de colección en el registro y ciclo de vida por paquete (depende
  de 032)
- `docs/tasks/034-coleccion-referencia-e2e.md` — Empaquetar una
  colección de referencia e instalarla de extremo a extremo
  (depende de 032 y 033)
- `docs/tasks/035-documentar-colecciones.md` — Documentar las
  colecciones en el manual (depende de 034)

## Revisión

- Usuario: 2026-10-04 — Aprueba
