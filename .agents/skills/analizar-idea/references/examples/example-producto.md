---
idea_slug: marketplace-interno
domain: reportes
date: 2026-08-06
skill: analizar-idea
level: producto
input: "queremos que los equipos puedan compartir y reutilizar reportes entre ellos"
status: conditional
next: evaluar-alcance-idea
---

# Descripción narrativa: marketplace-interno

## Problema

El equipo que necesita un reporte vive un flujo roto desde el momento en que arranca una necesidad. Alguien pide un reporte, el equipo lo construye, lo entrega, y el ciclo se cierra para ese equipo. Pero el trabajo que hizo no queda visible para nadie más: el reporte vive dentro de la frontera del equipo, y la organización no tiene forma de saber que existe. A partir de ahí, el conocimiento de reportes deja de estar compartido y pasa a estar atrapado en el equipo que lo produjo. Ese es el problema de fondo: la organización produce reportes pero no los hace visibles; el descubrimiento queda delegado a la memoria y a las conversaciones informales, que son frágiles y no escalan.

Esa delegación se manifiesta en tres síntomas concretos que se repiten cada vez que un equipo necesita un reporte que otro ya hizo:

- **Reconstrucción**: un equipo necesita un reporte, no sabe que otro ya lo hizo, y lo vuelve a construir desde cero. El esfuerzo se duplica, el tiempo se pierde, y el resultado muchas veces es peor que el original porque no incorpora los aprendizajes del equipo que ya lo había resuelto. El eslabón que conectaba la necesidad con el trabajo ya hecho no existe.
- **Invisibilidad entre equipos**: no existe un lugar donde los reportes hechos sean descubribles por otros equipos. Cada equipo conoce los suyos, pero la frontera del equipo es la frontera del conocimiento. Un analista del equipo A no tiene forma de saber que el equipo B ya resolvió un problema similar, aunque estén sentados a la par.
- **Falta de reconocimiento**: los equipos que producen reportes buenos no ven su trabajo reconocido ni reutilizado más allá de su frontera. El esfuerzo de construir un reporte reutilizable no se ve recompensado porque nadie fuera del equipo sabe que existe. El trabajo bueno se queda adentro.

El workaround actual es exclusivamente informal: conversaciones entre equipos, canales de chat, o la memoria de personas que alguna vez vieron un reporte parecido. No hay mecanismo en la plataforma que haga el conocimiento de reportes visible más allá del equipo que lo produjo. El costo agregado no es trivial: esfuerzo duplicado a escala de organización, tiempo perdido en reconstruir lo que ya existe, y una cultura donde la colaboración alrededor de reportes es la excepción en lugar de la norma.

## Resultado

El estado final deseado es uno en el que el conocimiento de reportes cruza la frontera del equipo sin intervención manual. Un equipo construye un reporte y lo suelta al espacio compartido: no tiene que mandar mails, no tiene que avisar a nadie, no tiene que mantener ningún hilo de "esto lo hice yo, avisen si lo necesitan". Sigue con su trabajo con la confianza de que el marketplace hará visible el reporte por él, y que quien lo necesite lo encontrará sin tener que saber de antemano que existe.

El flujo del equipo después del cambio tiene dos caras: la del equipo que produce y la del equipo que consume.

- Un equipo que construye un reporte puede publicarlo para que otros lo encuentren. Su trabajo deja de estar atrapado en su frontera y se vuelve descubrible.
- Un equipo que necesita un reporte puede descubrir lo que ya existe, ver quién lo construyó, y arrancar desde ahí en lugar de desde cero, adaptándolo o usándolo tal cual.

La diferencia con hoy no es que los equipos hagan algo nuevo; es que dejan de tener que reconstruir, preguntar, mantener el conocimiento encerrado.

Lo que deja de pasar es observable y específico:

- Los reportes ya no se reconstruyen desde cero cuando otro equipo ya los hizo.
- El conocimiento de "qué reportes existen" ya no se limita a la frontera del equipo.
- Los equipos que producen reportes buenos ven su trabajo reconocido y reutilizado más allá de su equipo.

Las señales de que el resultado se alcanzó son medibles sin mirar la implementación: los equipos descubren reportes existentes antes de construir, el número de reportes reconstruidos desde cero baja, los equipos productores ven reutilización de su trabajo, y la colaboración entre equipos alrededor de reportes se vuelve tema común en lugar de excepción.

## Solución

El producto que entrega ese resultado es un marketplace interno de reportes. Un espacio compartido donde los reportes viven como artefactos públicos. Un equipo que construye un reporte lo publica; un equipo que necesita un reporte lo descubre, ve quién lo construyó, y arranca desde ahí en lugar de desde cero. El marketplace hace visible el conocimiento de reportes en toda la organización: qué existe, quién lo hizo, cuánto se ha reutilizado. La experiencia central es la de **descubrir antes de construir**: antes de arrancar un reporte desde cero, vas al marketplace a ver si alguien ya lo resolvió. Si lo hizo, lo reutilizas o lo adaptas; si no, lo construyes y lo publicas para que el próximo lo encuentre. No es algo que el equipo tenga que ir a preguntar, es el marketplace el que hace visible lo que ya existe cuando alguien lo necesita.

### Forma del producto

El producto es un espacio compartido donde los reportes viven como artefactos públicos. No es un catálogo de datos, no es un data warehouse, no es una herramienta de reportes nueva. Es un lugar al que se va cuando se necesita un reporte, no algo que llega a uno. Se parece más a recorrer una biblioteca compartida que a usar una herramienta: vas ahí cuando necesitas algo, encuentras algo cercano a lo que buscas, lo adaptas o lo usas tal cual. Es un espacio de visibilidad: un reporte, una publicación, un descubrimiento.

Se acopla a los reportes que ya se generan en la organización, pero como un territorio nuevo, no como una extensión de un módulo existente. Los equipos ya construyen reportes con las herramientas que tienen: el analista de Sales Ops arma su pipeline trimestral, el de Finance su reporte de burn rate, el de Customer Success su análisis de churn mensual. Lo que cambia no es cómo se construyen, sino qué pasa después: el trabajo publicado deja de estar atrapado en la frontera del equipo y se vuelve alcanzable por cualquiera que lo necesite. Hay un nuevo lugar al que ir, pero no a construir sino a descubrir. El marketplace no genera el reporte, lo hace visible.

### Fronteras — qué no es

- No es una herramienta de **colaboración en tiempo real**: no hay edición concurrente de un mismo reporte entre equipos. La reutilización es "encontrar y adaptar", no "co-construir".
- No es un **catálogo de datos ni un data warehouse**: el marketplace indexa reportes, no los datos subyacentes. Los reportes son los artefactos publicables; los datos quedan donde están.
- No es un **sistema de permisos por equipo**: la pertenencia y los permisos entre equipos son un habilitador, no parte del producto. Si la plataforma no los soporta, es una dependencia que el análisis debe resolver.
- No es un **sistema de versionamiento de reportes**: el marketplace publica reportes; el control de versiones de un reporte adaptado es decisión del equipo que lo adapta, no del marketplace.
- No es una **herramienta de reportes nueva**: el marketplace no genera reportes, los hace visibles y reutilizables. La generación sigue siendo trabajo de las herramientas existentes.

### Comportamientos clave del producto

Estos son los comportamientos que el producto debe entregar, descritos en términos de experiencia. Cada uno es una unidad de producto que un análisis posterior puede expandir y descomponer.

1. **Publicar un reporte al marketplace**: un equipo que construye un reporte puede publicarlo para que otros lo descubran. El reporte pasa de ser visible solo dentro de su equipo a ser visible en toda la organización.
2. **Descubrir reportes existentes**: un equipo que necesita un reporte puede buscar o navegar el marketplace para encontrar lo que ya existe, en lugar de arrancar desde cero.
3. **Identificar el autor de un reporte**: cada reporte publicado muestra quién lo construyó, para que el consumidor sepa de qué equipo viene y pueda contactar si necesita contexto.
4. **Reutilizar o adaptar un reporte**: un equipo que encuentra un reporte cercano a lo que necesita puede usarlo tal cual o adaptarlo a su contexto. La adaptación es "tomar y modificar", no co-edición.
5. **Hacer visible la reutilización**: el marketplace muestra cuánto se ha reutilizado un reporte, para que el esfuerzo de publicar se vea recompensado y los equipos productores reciban reconocimiento.
6. **Navegar por la biblioteca de reportes**: el usuario puede recorrer el marketplace por categoría, equipo, o popularidad, no solo buscar. La navegación es parte de la experiencia de descubrimiento.

### Escenarios y variantes

El comportamiento central tiene variantes que el producto necesita resolver. Cada una es una decisión de producto que el análisis posterior debe trabajar:

- **Reporte que es específico a un equipo**: si un reporte es muy específico a un dominio de un equipo, ¿se publica igual, o el marketplace filtra por relevancia entre equipos? La cobertura compite con el ruido.
- **Reporte que se desactualiza**: si un reporte publicado deja de funcionar o se desactualiza, ¿el marketplace lo marca, lo oculta, o queda visible con advertencia? La integridad del catálogo compite con la frescura.
- **Equipo que no quiere compartir**: si un equipo prefiere no publicar sus reportes, ¿la publicación es opt-in por defecto, obligatoria, o configurable por equipo? La cultura de compartir compite con la autonomía de equipo.
- **Reporte adaptado que mejora al original**: si un equipo adapta un reporte y lo mejora, ¿publica la adaptación como nuevo reporte, o contribuye de vuelta al original? La bifurcación compite con la contribución.
- **Muchos reportes similares**: si varios equipos publican reportes muy parecidos, ¿el marketplace los agrupa, los deduplica, o los deja coexistir? La saturación del catálogo compite con la transparencia.

Estas variantes son decisiones de experiencia que definen la forma final del producto. Dejarlas abiertas en esta etapa es correcto, pero identificarlas aquí permite que el análisis posterior las trabaje de forma explícita en lugar de descubrirlas tarde.

### Beneficiarios

- **Primario: los equipos que consumen reportes (analistas, leads)**: dejan de reconstruir desde cero, libera el tiempo que le dedicaban a duplicar trabajo, y pueden concentrarse en adaptar o construir lo que de verdad no existe con la confianza de que el marketplace les mostrará lo que ya está hecho.
- **Secundario: los equipos que producen reportes**: ven su trabajo reconocido y reutilizado más allá de su frontera, lo que recompensa el esfuerzo de construir reportes reutilizables.
- **Secundario: la organización**: reduce el esfuerzo duplicado a escala y fomenta una cultura de colaboración entre equipos alrededor de los reportes.

## Suposiciones y dependencias

- Los reportes son suficientemente portables entre equipos (dominios de datos similares) para que reutilizarlos tenga sentido.
- Los equipos están dispuestos a compartir sus reportes (no hay bloqueo cultural ni político).
- Existe una noción identificable de "equipo" en la organización que el producto puede usar como unidad de permiso y pertenencia.
- La plataforma actual soporta identificar al autor/equipo de un reporte.
- No hay datos cuantitativos sobre cuántos reportes se duplican entre equipos: se documenta como suposición; el análisis posterior debe confirmar.

## Decisiones diferidas al análisis posterior

- Comportamiento ante reportes específicos a un equipo (¿publicación universal o filtrada por relevancia entre equipos?).
- Comportamiento ante reportes desactualizados (¿marcado, oculto, o visible con advertencia?).
- Política de publicación (¿opt-in, obligatoria, o configurable por equipo?).
- Comportamiento ante adaptaciones que mejoran al original (¿nuevo reporte o contribución de vuelta?).
- Comportamiento ante reportes similares (¿agrupación, deduplicación, o coexistencia?).
- Si la idea contiene múltiples funcionalidades (descubrir + compartir + reutilizar) o es una sola.
- Alineación con la visión de producto (¿la colaboración entre equipos es un norte explícito?).

## Gate de avance

- **Inventario de preguntas identificadas**:
  - [Crítica] ¿El producto conecta el problema y el estado final?: Estado: resuelta (el marketplace conecta la duplicación de esfuerzo con el descubrimiento y reutilización entre equipos).
  - [Crítica] ¿El producto se describe en términos de experiencia, no de implementación?: Estado: resuelta (la narrativa describe publicar, buscar, navegar y reutilizar; sin stack ni arquitectura).
  - [Importante] ¿El beneficiario está claro?: Estado: resuelta (equipos que consumen reportes + equipos que los producen + organización).
  - [Importante] ¿La idea contiene múltiples funcionalidades?: Estado: pendiente (sospecha documentada como decisión diferida; descubrir + compartir + reutilizar podría ser más de una funcionalidad).
  - [Importante] ¿La visión de producto incluye colaboración entre equipos como norte explícito?: Estado: pendiente (el usuario fue alertado y eligió avanzar con valor por defecto conservador).
  - [Importante] ¿El equipo de platform/identity tiene capacidad para habilitar permisos entre equipos?: Estado: pendiente (el usuario fue alertado y eligió avanzar con valor por defecto conservador).
  - [Menor] ¿Hay datos de cuántos reportes se duplican entre equipos?: Estado: resuelta (no hay datos; se documenta como suposición).
- **Alerta al usuario**: Sí (se presentaron 3 preguntas Importantes pendientes al usuario: sospecha de múltiples funcionalidades, alineación con visión, capacidad de platform). El usuario eligió avanzar con valor por defecto conservador.
- **Estado final de avance**: Condicionado (`status: conditional`, `next: evaluar-alcance-idea`). Las preguntas pendientes se heredan en `evaluar-alcance-idea`.

## Preguntas Abiertas (resueltas/pendientes)

### Resueltas

- **Pregunta**: ¿Hay datos de cuántos reportes se duplican entre equipos?
- **Impacto**: Podría justificar urgencia pero no bloquea la descripción del producto.
- **Severidad**: Menor
- **Propuesta**: No hay datos — se documenta como suposición en Suposiciones y dependencias.
- **Estado**: Resuelta (se documenta como suposición).

### Pendientes

- **Pregunta**: ¿La idea contiene múltiples funcionalidades (descubrir + compartir + reutilizar) o es una sola?
- **Impacto**: Define si `evaluar-alcance-idea` debe dividir la idea en sub-funcionalidades. Afecta toda la planificación downstream.
- **Severidad**: Importante
- **Propuesta**: `evaluar-alcance-idea` evalúa si el espacio se divide en funcionalidades individuales con alcance propio.
- **Estado**: Pendiente (usuario eligió avanzar con valor por defecto conservador).

- **Pregunta**: ¿La visión de producto incluye colaboración entre equipos como norte explícito?
- **Impacto**: Define si la idea está alineada estratégicamente o es tangencial. Afecta priorización.
- **Severidad**: Importante
- **Propuesta**: Revisar documento de visión con product lead.
- **Estado**: Pendiente (usuario eligió avanzar con valor por defecto conservador).

- **Pregunta**: ¿El equipo de platform/identity tiene capacidad para habilitar permisos entre equipos?
- **Impacto**: Los permisos actuales son por usuario, no por equipo. Afecta viabilidad técnica y timeline.
- **Severidad**: Importante
- **Propuesta**: Reunión con líder de platform para confirmar capacidad.
- **Estado**: Pendiente (usuario eligió avanzar con valor por defecto conservador).
