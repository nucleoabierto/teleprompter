# Reproducción del destino: reinstalar lo que el registro declara

## Estado

[a] Aprobada

## Problema

En un repositorio que usa Teleprompter, los recursos instalados
viajan versionados junto al registro: clonar no deja nada que
reconstruir. Sin apoyo del producto, el punto limpio es la reinstalación
completa: cuando una personalización se generó mal, o
cuando la infraestructura del proyecto que alimenta la
personalización cambió y todas las adaptaciones deben rehacerse
bajo la nueva. En esos casos la recuperación sana es volver a un
estado limpio reinstalando todo lo que el registro declara, aun a
costa de perder las adaptaciones anteriores.

Hoy esa operación se hace a mano: retirar cada paquete y volver a
instalar cada origen uno por uno, repitiendo las mismas
resoluciones y dependiendo de que quien lo hace conozca la lista
completa. Afecta por igual al mantenedor que trabaja solo —su
propio repo en varias máquinas o entornos— y a equipos cuya
configuración de agentes vive en el repositorio compartido.
Ocurre raramente, pero cada ocurrencia es costosa y fácil de dejar
a medias: un paquete olvidado o una personalización vieja mezclada
con la nueva rompe justo el punto limpio que se buscaba.

## Oportunidad

Resolverlo convierte el registro de bitácora en fuente de
reconstrucción: la vuelta a un estado limpio sería una sola
lectura del registro, con la procedencia exacta que quedó
registrada, en lugar de una secuencia manual de retiradas e
instalaciones. Supera a la alternativa actual en completitud
—nada queda olvidado ni mezclado— y en fidelidad —los orígenes
y commits son los registrados, no los que se tecleen de memoria—.
La misma lectura cubre de paso los casos donde el disco y el
registro divergen.

## Forma de solución

El CLI aprende una invocación nueva que consume el registro como
lista de reproducción. Leída la declaración completa, devuelve el
destino al estado que cada paquete registró: obtiene cada origen
anclado a su commit registrado y reinstala cada unidad como
retirada de lo instalado seguida de la copia de lo obtenido. El
conjunto se muestra en un plan previo a escribir, y las
divergencias locales se deciden con la política de conflictos
vigente.

Para quien opera, la vuelta a un punto limpio
pasa de una receta manual de retiradas e instalaciones repetidas
a una sola operación; los orígenes que no responden se reportan
con su motivo, no en silencio. Categoría: flujo nuevo.

## Solución

Un comando `reinstall` de la familia de las operaciones dirigidas
por el registro (`update`, `uninstall`): se ejecuta en la raíz
del destino, recorre el registro y obtiene cada unidad desde su
origen registrado anclado al commit que la instalación dejó
grabado. Por unidad el plan es el de una instalación sobre ese
árbol: lo intacto queda, lo ausente se crea, lo divergente y lo
ajeno en un target se deciden con la política de conflictos
vigente —restaurar lo declarado con respaldo en
`.teleprompter/backups/` o conservar lo local—.

La obtención y el plan de todo el conjunto se
completan antes de escribir: un origen inalcanzable, ausente o no
anclable aborta la operación sin tocar nada, reportando la unidad
y el motivo. Acepta `--force`, `--skip` y `--dry-run` como sus
hermanas, y deja cada entrada reescrita como la de una
instalación. El nombre quedó `reinstall` —instalar otra vez lo
declarado— frente a `reproduce` y a extender `install` sin
espec, que sobrecargaban la lectura.

## Alternativas consideradas

- `update` en lote sobre el registro —extender el comando de
  actualización a todos los paquetes—. Se descarta para este
  problema porque la actualización avanza cada paquete a lo que
  publica hoy su origen —no vuelve a lo declarado— y un paquete
  al día no produce plan, así que no puede restaurar una
  personalización rota sin mover versión. Responde a «qué hay
  nuevo», que es la idea 008 «Revisión de desactualizados»
  (`docs/ideas/008-revision-outdated-actualizacion.md`): revisar lo
  instalado frente a lo publicado sin escribir nada y, con esa
  revisión, actualizar en una sola invocación lo que señala, sabiendo
  de antemano qué cambia. La revisión ya existe como `outdated`
  (épica 009); lo pendiente de la idea es la actualización en lote.
  La reproducción responde a «vuelve a lo declarado».
- Receta manual sobre los comandos actuales —retirar e instalar
  cada paquete, o un script externo que lea el registro e invoque
  la instalación en bucle—. Se descarta porque mantiene la
  fricción descrita (N procesos, orden y conocimiento en quien
  opera) y duplica fuera del producto lo que ya sabe hacer dentro
  —leer el registro, obtener orígenes anclados, decidir
  conflictos— sin plan conjunto.
- El registro como manifiesto compartible entre repos —reproducir
  desde una copia ajena—. Se descarta como forma dominante:
  responde a «compartir conjuntos», no a «punto limpio», y queda
  como extensión posible fuera de alcance.

## Fuera de alcance

- Reinstalar a lo publicado hoy por cada origen —mover
  versiones—: la reproducción ancla a lo registrado; re-resolver
  a lo último es la actualización en lote de lo revisado, la parte
  pendiente de la idea 008 «Revisión de desactualizados»: actualizar
  en una sola invocación lo que `outdated` señala, sin nombrar cada
  paquete.
- Preservar o restaurar las personalizaciones perdidas: el
  escenario las descarta a propósito; el respaldo en
  `.teleprompter/backups/` sigue siendo la única red.
- Reproducir un subconjunto del registro —selección por
  paquete—: la operación consume la declaración completa; para
  un solo paquete ya cubre la receta retirar-instalar.
- Consumir el registro de otro repositorio como manifiesto
  importable —compartir conjuntos entre repos—.
- Reejecutar la personalización: el producto entrega el punto
  limpio; la adaptación sigue siendo trabajo del agente después.

## Investigaciones de apoyo

- Ninguna —la reproducción reutiliza la obtención anclada de la
  épica 007, los vocabularios de retirada e instalación del plan
  y la política de conflictos vigente—.

## Borradores

- `docs/tasks/063-reobtencion-anclada-commit.md` — reobtener el
  origen anclado al commit registrado
- `docs/tasks/064-comando-reinstall.md` — el comando `reinstall`
  de punta a punta (depende de 063)

## Revisión

- Usuario: 2026-11-09 — Solicita cambios (aprueba el enmarcado;
  revisar la descomposición del desarrollo y el nombre del
  comando)
- Usuario: 2026-11-09 — Aprueba
