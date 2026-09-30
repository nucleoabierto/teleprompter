# Listado de paquetes instalados: el registro como consulta

## Estado

[a] Aprobada

## Problema

Cada instalación deja un `teleprompter-lock.json` con qué paquete se
instaló, en qué versión, cuándo y qué recursos escribió — pero ese
registro solo existe como memoria interna del instalador. Quien
recibe un repositorio con recursos ya instalados, o vuelve al suyo
tiempo después, no puede responder «qué paquetes tengo, de dónde
salieron estos archivos» sin abrir un JSON y conocer su formato.

El coste es opacidad: lo que la herramienta sabe con certeza, el
usuario solo puede reconocerlo leyendo un detalle de implementación.
Un agente que opera en el repositorio tampoco tiene forma de saber
qué recursos son gestionados antes de proponer cambios que podrían
pisarlos.

## Oportunidad

Convertir el registro en superficie de producto: una respuesta en
lenguaje de producto a «qué tengo instalado». La infraestructura ya
está pagada —el lock existe y se escribe en cada instalación—, así
que el esfuerzo es pequeño frente al valor: transparencia (la
herramienta muestra lo que escribió), una frontera legible entre el
lock y el usuario, y una lectura del registro ya resuelta que las
operaciones siguientes —detección de deriva, actualización—
presuponen.

## Forma de solución

Quien está dentro de un repositorio destino puede preguntar al
producto «qué paquetes tengo instalados» y recibe la respuesta en
lenguaje de producto —nombre, versión, cuándo y qué recursos
trajeron— leyendo el registro que la instalación ya escribe.
Categoría: flujo nuevo — hoy ese objetivo no tiene camino dentro del
producto.

## Solución

Una consulta nueva del CLI, hermana de la que la épica de
personalización introdujo para la guía: se ejecuta dentro del
repositorio destino, lee el registro de instalación y presenta, por
cada paquete instalado, su nombre y versión, cuándo se instaló y los
recursos que escribió —sin exponer detalles internos que no responden
a la pregunta, como hashes o acciones—. Sin instalaciones previas, la
respuesta lo dice claramente en lugar de fallar o quedar vacía.

## Alternativas consideradas

- Mostrarlo solo al instalar (paso nuevo en el flujo de instalación):
  imprimir el estado tras cada `install`. Se descarta porque el
  problema es la consulta posterior —quien hereda un repo o vuelve
  meses después no acaba de instalar nada— y porque ensucia la salida
  de cada instalación.
- Documentar la lectura del registro (fuera de código): enseñar al
  usuario a interpretar el JSON o a usar `jq`. Se descarta porque
  mantiene al usuario interpretando un detalle de implementación
  —justo la fricción del problema— y rompe la promesa de que el lock
  es formato interno.
- Escribir un informe legible en el destino al instalar (cambio de
  proceso): materializar un archivo tipo `INSTALLED.md`. Se descarta
  porque duplica el registro —dos fuentes que divergen en cuanto
  algo cambie— y contamina el árbol del usuario con un artefacto
  derivado.

## Fuera de alcance

- Comparar lo registrado con el disco (detección de deriva) ni actuar
  sobre ello (actualizar, desinstalar).
- Salida para máquinas (`--json` u otros formatos estructurados): la
  consulta es para el usuario o el agente, en lenguaje de producto.
- Listar paquetes disponibles para instalar: no existe registro ni
  índice remoto; solo lo instalado en este destino.
- Detalle interno del registro que no responde a la pregunta (hashes,
  acciones por archivo).

## Investigaciones de apoyo

Ninguna — el patrón de consulta sobre el destino ya tiene precedente
en la herramienta y el registro a leer está fijado por D007.

## Tareas

- `docs/tasks/016-listar-paquetes-instalados.md` — Listar los
  paquetes instalados (borrador `01-listar-paquetes-instalados.md`)

## Revisión

- Usuario: 2026-09-30 — Aprueba el enmarcado del problema, la
  oportunidad y la forma de solución en el diálogo de descubrimiento.
- Usuario: 2026-09-30 — Aprueba la propuesta.
