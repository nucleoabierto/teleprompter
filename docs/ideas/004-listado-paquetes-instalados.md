# Listado de paquetes instalados: el registro visible para el usuario

> **Tipo:** idea de funcionalidad — tamaño tarea (complejidad baja)
> **Fecha:** 2026-09
> **Orden sugerido:** 1 de 3 — es la más pequeña del conjunto y
> convierte el registro en superficie de producto que sus hermanas
> consumen.
> **Procesada en:** docs/proposals/004-listado-paquetes-instalados/

## Problema

Cada instalación deja un `teleprompter-lock.json` en el repositorio
destino con el paquete, la versión y los recursos escritos, pero ese
registro solo existe para uso interno del instalador: nadie lo
presenta. Quien recibe un repositorio con recursos instalados —o quien
vuelve al suyo tiempo después— no tiene forma de saber qué paquetes
hay, de qué versión son ni qué archivos les pertenecen sin abrir un
JSON y entender su formato.

## Qué desbloquea

- **Respuesta a «qué tengo instalado»:** una invocación del CLI que
  lee el registro y lo muestra en lenguaje de producto: paquete,
  versión, fecha y recursos.
- **Registro como superficie:** el lock deja de ser un detalle de
  implementación y pasa a ser la fuente de verdad que el usuario
  puede consultar.
- **Base de composición:** cualquier operación futura sobre lo
  instalado parte de una lectura del registro ya resuelta y
  presentable.

## Flujos de trabajo que se hacen viables

- Un usuario ejecuta `teleprompter list` en su repositorio y ve qué
  paquetes instaló, con qué versión y qué recursos trajeron.
- Un agente del repositorio consulta lo instalado antes de proponer
  cambios que podrían pisar recursos gestionados.
- Alguien que hereda un proyecto descubre de dónde salieron sus
  `.agents/skills/` sin revisar el historial de commits.

## Ventajas como producto

- **Confianza por transparencia:** el instalador que muestra lo que
  escribió genera más confianza que el que escribe y calla; el
  registro deja de ser una promesa implícita.
- **Costo asimétrico:** la infraestructura ya está pagada —el lock
  existe y se escribe en cada instalación—; el valor es alto frente
  a un esfuerzo pequeño.

## Tensión que introduce en el roadmap

Comparte objeto con `deteccion-deriva` y
`actualizacion-entre-versiones`: las tres leen el registro, pero esta
solo lo presenta —no compara ni decide—, así que su enunciado se
sostiene sola. Va primero porque es la frontera mínima entre el lock
y el usuario; sus hermanas presuponen esa lectura y le añaden
semántica propia. Si el formato del lock cambiara después, las tres
se resentirían por igual.
