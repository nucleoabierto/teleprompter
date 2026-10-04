# Colecciones

## Estado

[x] Planificada | [ ] Completada

## Objetivo

Materializar lo que el formato ya declara: un consumidor puede
instalar uno o varios paquetes por nombre desde un repositorio
multi-paquete —local o remoto—, cada paquete instalado conserva su
ciclo de vida propio y la funcionalidad queda documentada en el
manual.

## Alcance

- **Dentro:** definición del comportamiento (gramática de
  selección, caso sin selección, cardinalidad, `origin`);
  instalación desde colección local y remota; ciclo de vida por
  paquete con `origin` de colección; colección de referencia con
  verificación e2e; documentación en `manual/`.
- **Fuera:** colecciones anidadas; dependencias o restricciones de
  versión entre paquetes; instalar la colección como unidad
  implícita; gestionar la colección como entidad del ciclo de
  vida; rediseño del formato más allá de ajustes de compatibilidad.

## Piezas

- [x] docs/tasks/031-definir-comportamiento-colecciones.md —
  Definir el comportamiento de instalación desde colecciones
- [x] docs/tasks/032-instalar-desde-coleccion.md — Instalar el
  paquete seleccionado de una colección
- [x] docs/tasks/033-origen-y-ciclo-de-vida-coleccion.md —
  `origin` de colección en el registro y ciclo de vida por paquete
- [x] docs/tasks/034-coleccion-referencia-e2e.md — Empaquetar una
  colección de referencia e instalarla de extremo a extremo
- [x] docs/tasks/035-documentar-colecciones.md — Documentar las
  colecciones en el manual

## Plan técnico

La selección atraviesa todo el conjunto: la gramática se decide en
la primera pieza —con la investigación y las preferencias del
usuario (nombre vía flag, error con índice impreso) como punto de
partida— y las demás la consumen. La instalación reutiliza el
pipeline existente: el fetch remoto ya extrae el repositorio
completo, de modo que el paquete elegido se resuelve dentro del
árbol obtenido; el índice `packages` del manifiesto de colección
es la única fuente de resolución nombre → ruta. Cada paquete
instalado sigue siendo una unidad independiente del registro y del
ciclo de vida; el `origin` solo gana la información necesaria para
re-resolver el mismo paquete al actualizar.

- **Orden:** 031 → 032 → 033 → 034 → 035.
- **Dependencias:** 032 consume la gramática de 031; 033 extiende
  lo que 032 instala; 034 verifica el resultado de ambas; 035
  documenta sobre el ejemplo de 034.
- **Decisiones transversales:** colección como contenedor puro no
  instalable (ya especificado); selección por nombre, no por ruta
  (investigación); el nombre y la versión viven en el manifiesto
  de cada paquete (D002).

## Criterio de cierre

Un consumidor instala por nombre uno o varios paquetes de una
colección local y remota, `list`/`check`/`guide`/`update` operan
sobre cada paquete instalado y el manual documenta la selección
con la colección de referencia como ejemplo.

## Revisión

- Usuario: 2026-10-04 — Aprueba
