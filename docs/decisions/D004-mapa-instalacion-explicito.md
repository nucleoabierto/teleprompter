# D004: Mapa de instalación explícito origen-destino

## Estado

Aceptada

## Contexto

Un paquete de configuración de agentes instala recursos heterogéneos
—skills, reglas, documentos— en ubicaciones distintas del repositorio
destino. La pregunta era si el destino se deduce por convención de
subdirectorios (como el layout estándar de `plugin.json`) o se declara
explícitamente. El mapa de instalación es el rasgo menos resuelto de los
formatos encuestados: la mayoría delega el destino a la convención del
cliente.

## Decisión

Declaramos `install` en el manifiesto como lista obligatoria de
entradas `{ "source", "target" }` que mapean cada recurso del paquete a
la ruta relativa del repositorio destino donde se instala. No hay
disposición fija de recursos dentro del paquete ni deducción por
convención.

## Justificación

La propuesta exige que quien consume sepa «exactamente qué obtuvo» antes
de instalar; eso solo se logra si el destino de cada recurso es
inspeccionable en el manifiesto. La convención pura obliga al productor
a replicar en el paquete la estructura del destino, lo que acopla el
paquete a un layout concreto. El mapa explícito también hace visible el
efecto completo de la instalación —qué archivos toca y dónde— sin
ejecutar nada. La investigación recomendaba un modelo híbrido
—convención por defecto más entradas explícitas—; descartamos la
convención porque duplicaría las reglas de resolución (convención y
mapa) y haría ambiguo qué recurso va a cada sitio. El coste es
verbosidad en paquetes grandes, aceptable frente a la pérdida de
inspeccionabilidad.

## Referencias

- `docs/research/2026-09-formatos-manifiesto.md` — patrón «Mapa de
  instalación» y recomendación 6.
- `docs/proposals/001-formato-paquete/propuesta.md` — el contrato que la
  forma de solución declara.
