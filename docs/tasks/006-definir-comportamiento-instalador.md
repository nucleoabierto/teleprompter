# Definir el comportamiento del instalador

## Estado

[x] Completada

## Tipo

desarrollo

## Objetivo

Fijar el comportamiento del instalador de Teleprompter como contrato
previo a la implementación —las fases de la operación, la semántica de
la verificación, la política de colisiones y el formato del registro—
y descomponer ese comportamiento en las tareas de implementación que
lo construyen.

## Dependencias

- 005.

## Entrada

- El documento de investigación producido por la tarea 005.
- El contrato del manifiesto en `docs/especificacion-paquete.md` y las
  decisiones D001–D004 que lo rigen.
- El problema y la forma de solución de esta propuesta.

## Resultado esperado

- Las fases de la operación definidas: verificación del manifiesto y de
  las precondiciones, presentación del plan de instalación, ejecución
  y reporte del resultado.
- La política de colisiones definida: qué cuenta como colisión, qué
  opciones existen para resolverla y cuál es el comportamiento por
  defecto.
- El formato del registro de instalación definido: qué queda escrito,
  dónde y con qué contenido.
- Las decisiones costosas de revertir registradas con el mecanismo de
  decisiones de diseño del proyecto.
- El trabajo de implementación descompuesto en tareas creadas con el
  mecanismo de creación de tareas del proyecto, bajo la agrupación de
  la épica de esta propuesta.

## Criterios de calidad

- El comportamiento cubre el recorrido completo: nada se escribe en el
  destino antes de que la verificación y el plan hayan informado qué
  ocurrirá.
- Cada elemento del comportamiento tiene una razón de ser trazable al
  problema o a la investigación de apoyo.
- Las decisiones de diseño quedan registradas en `docs/decisions/`.
- Las tareas derivadas cubren el comportamiento definido sin solaparse
  y cada una es ejecutable de forma independiente.

## Procedimiento sugerido

1. Derivar del documento de investigación los comportamientos
   candidatos del instalador.
2. Definir las fases de la operación y su orden.
3. Definir la política de colisiones y el formato del registro.
4. Redactar el documento de definición del comportamiento.
5. Registrar las decisiones de diseño correspondientes.
6. Descomponer el trabajo de implementación en tareas según el
   comportamiento definido y crearlas bajo la agrupación de la épica.

## Contexto

- Archivos similares:
  - `docs/formato-paquete.md` — la tarea 002 de la épica anterior
    produjo el mismo tipo de entregable: un documento de definición
    interno del que derivan decisiones y trabajo posterior; sirve de
    modelo de estructura y nivel de detalle.
  - `docs/research/2026-09-motores-instalacion.md` — la entrada directa:
    sus siete decisiones candidatas son la materia prima de la
    definición.
  - `docs/research/2026-09-formatos-manifiesto.md` — precedente de
    cómo la investigación alimenta una definición.
  - `docs/especificacion-paquete.md` — el contrato que el instalador
    ejecuta: precondiciones (`requires.paths`) y mapa de instalación
    (`install`) ya fijados.
  - `docs/proposals/002-motor-instalacion/propuesta.md` — delimita el
    alcance: sin personalización, distribución, actualización ni
    merge de contenido.
  - `docs/epics/002-motor-instalacion.md` — la guía de arquitectura:
    comportamiento como contrato antes de código, y la descomposición
    en tareas de implementación como entregable.
- Patrones:
  - Documentos en Markdown en español, líneas envueltas, encabezados
    ATX y secciones nombradas.
  - Las decisiones costosas de revertir se registran en
    `docs/decisions/DNNN-slug.md` con el skill `decisiones-diseno` y
    su índice `docs/decisions/README.md`.
  - Las tareas derivadas se crean con el skill `crear-tareas` y se
    registran en `TODO.txt` bajo el encabezado del hito de la épica.
- Lecciones: ninguna aplica (`docs/lessons/` no existe todavía).
- Decisiones:
  - D001 — el manifiesto que el instalador lee es JSON puro
    `teleprompter.json`.
  - D002 — cardinalidad repo/paquete: el instalador consume paquetes,
    no colecciones.
  - D003 — la versión es semver explícita del manifiesto.
  - D004 — el mapa `install` es la lista explícita origen→destino que
    la ejecución aplica.

## Conectividad

Veredicto: **conectada**.

La tarea produce artefactos declarativos (la definición del
comportamiento, registros de decisión y las tareas derivadas), no
código. Todo lo que asume existe: la investigación de la tarea 005,
la especificación del paquete, la propuesta aprobada, el plan técnico
de la épica 002 y los mecanismos `decisiones-diseno` y `crear-tareas`
que materializan dos de sus entregables.

## Plan técnico

Trabajo documental: el subsistema afectado es `docs/` —un documento
nuevo de definición del comportamiento—, `docs/decisions/` —entradas
nuevas— y `docs/tasks/` más `TODO.txt` —las tareas derivadas—. Sigue
el patrón de la tarea 002: la investigación alimenta una definición
que fija el contrato antes de cualquier código.

- [x] Derivar el comportamiento del instalador desde las siete
  decisiones candidatas de la investigación: fases de la operación
  (verificación del manifiesto y precondiciones → plan → ejecución →
  registro)
  - Aporta: fija la estructura del contrato; cada fase queda trazable
    a la evidencia.
  - Contexto: hay que decidir la forma concreta del «plan
    inspeccionable» (salida por recurso con estado, modelo
    copier/chezmoi) y si el plan se materializa como artefacto o es
    solo salida —la investigación lo dejó como extensión.
- [x] Definir la política de colisiones: qué cuenta como colisión
  (destino ocupado por contenido no instalado por la herramienta),
  opciones declaradas (omitir, sobrescribir, conservar copia de
  seguridad) y el defecto —abortar con informe completo de conflictos
  - Aporta: la pieza central de la seguridad de la operación.
- [x] Definir el formato del registro de instalación: ubicación en el
  destino, qué registra (paquete, versión, recursos, decisiones por
  colisión) y su papel como base de propiedad
  - Aporta: la memoria que habilita verificación precisa y repetición.
  - Contexto: update/desinstalación están fuera de alcance, pero el
    registro debe diseñarse sin bloquearlos (precedente:
    `.copier-answers.yml`, lock files de skills.sh).
- [x] Redactar el documento de definición del comportamiento en
  `docs/` (hermano de `formato-paquete.md`)
  - Aporta: materializa el contrato que guía la implementación.
- [x] Registrar las decisiones costosas de revertir en
  `docs/decisions/` (aborto total, política de colisiones, formato del
  registro, separación plan/ejecución)
  - Aporta: cumple el criterio de la tarea y fija lo no negociable.
- [x] Descomponer la implementación en tareas con `crear-tareas`,
  bajo el hito de la épica 002
  - Aporta: el entregable distintivo de esta tarea —el despiece con
    conocimiento del comportamiento ya definido— incluida la elección
    de tecnología, que la épica le asigna.

## Suite de pruebas esperada

Casos de uso: (UC1) un implementador sabe qué hace el instalador en
cada fase sin ambigüedad; (UC2) ante una colisión se conoce el
comportamiento por defecto y las opciones; (UC3) ante manifiesto
inválido o precondición incumplida queda claro que nada se escribe;
(UC4) el registro permite reconstruir qué quedó instalado; (UC5) el
despiece cubre el comportamiento.

- Una instalación sobre destino vacío queda descrita completa, fase a
  fase — UC1 (Z)
- El ciclo de un paquete de un solo recurso queda determinado por el
  contrato — UC1 (O)
- Un paquete con varios recursos y colisiones parciales queda
  cubierto: el plan distingue por recurso — UC1 (M)
- Colisión con contenido ajeno: defecto y opciones declarados — UC2
  (B)
- Manifiesto inválido o precondición incumplida abortan sin escribir
  — UC3 (E)
- El registro describe cada recurso instalado y cada decisión de
  colisión — UC4 (I)
- Cada decisión costosa de revertir tiene entrada en
  `docs/decisions/` — proceso (sin letra)
- Las tareas derivadas cubren el comportamiento sin solaparse y cada
  una es ejecutable de forma independiente — UC5 (M)

## Desviaciones del plan

- La política de colisiones quedó definida como resolución
  interactiva por defecto —aborto solo cuando no hay consola
  interactiva— con las opciones excluyentes `--force` y `--skip`, a
  petición del usuario durante la ejecución. El plan original
  proponía abortar por defecto con opciones de omitir, sobrescribir y
  conservar copia de seguridad; la opción `backup` quedó fuera.
- La elección de tecnología se resolvió como JavaScript distribuido
  por `npx` con el paquete npm `@nucleoabierto/teleprompter` (D008),
  a petición del usuario, en lugar del ejecutable Python sugerido en
  el borrador inicial.
- Las cuatro decisiones previstas en el plan quedaron registradas así:
  «separación plan/ejecución» y «aborto total» se fusionaron en D005;
  «política de colisiones» en D006; «formato del registro» en D007; y
  se añadió D008 para la tecnología.

## Revisión

- Subagente: 2026-09-28 — Solicita cambios (correcciones aplicadas y
  verificadas en segunda ronda)
- Usuario: 2026-09-28 — Aprueba
