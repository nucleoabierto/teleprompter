# Pin de obtención remota: el commit exacto detrás de cada instalación

## Estado

[x] Borrador | [x] Pendiente de revisión | [x] Aprobada | [ ] Descartada

## Problema

Cuando un paquete se instala desde un origen remoto sin referencia
explícita, el registro conserva el origen pero no el árbol concreto
que se obtuvo: «la rama por defecto en el momento de la obtención»
es un destino móvil. Dos instalaciones de la misma versión
declarada, en días distintos, pueden traer contenido distinto sin
que el consumidor pueda saberlo.

Esto afecta a quien consume el canal: no puede saber qué árbol
exacto produjo su instalación, no puede volver a él meses después y
no puede detectar que el mantenedor avanzó la rama sin cambiar la
versión —una situación que hoy es invisible por construcción.

El coste es que la promesa «la versión identifica el contenido»
(D017) depende de la disciplina del mantenedor y no del canal: sin
procedencia registrada ni re-obtención determinista, la
reproducibilidad y la auditoría de lo instalado son imposibles, y
las funciones que se apoyarían en ella —comparar contra el origen,
reconstruir el destino— heredan la misma incerteza.

## Oportunidad

Resolverlo convierte la procedencia en un hecho verificable en
lugar de una suposición: cada instalación sabría de qué árbol
salió, la re-obtención dejaría de ser una lotería y la divergencia
«el commit avanzó, la versión no» pasaría de invisible a
detectable. Supera la alternativa actual —confiar en la disciplina
del mantenedor— sin coste para el usuario, y sigue el precedente
del ecosistema (los lockfiles de mise/aqua pinnean provenance por
la misma razón). Además es la base que hace honestas a las ideas
hermanas ya comprometidas en Next.

## Forma de solución

Cada obtención remota deja registrado el commit exacto que
resolvió, de modo que toda instalación queda anclada a un árbol
concreto y auditable; la re-obtención vuelve a ese ancla en lugar
de perseguir la rama móvil, y avanzar sigue siendo la acción
explícita de siempre —`update` lleva el ancla a lo que el origen
publica en ese momento—. Para el usuario nada cambia en cómo se
invoca: la procedencia se captura como parte del trabajo que el
canal ya hace. Categoría: cambio de proceso.

## Solución

La obtención remota gana la resolución de la referencia pedida a su
commit exacto: un paso previo a la descarga que traduce la ref —o
su ausencia, la rama por defecto— al SHA concreto que el origen
sirve en ese momento, bajo los mismos presupuestos y diagnósticos
del fetch endurecido.

El registro conserva ese SHA junto al origen de cada paquete
instalado desde GitHub, escrito al instalar y refrescado al
actualizar: `update` mantiene su semántica de avance —obtiene lo
que el origen publica en ese momento— y el ancla se mueve con él,
de modo que el registro siempre dice «este árbol produjo esta
instalación». Los orígenes locales no llevan commit y los locks
previos sin él siguen siendo válidos.

## Alternativas consideradas

- Exigir referencia explícita en todo origen remoto (cambio de UX):
  obligar a declarar commit o tag en cada instalación, eliminando
  el comodín de rama por defecto. Se descarta porque traslada la
  carga al usuario —la rama por defecto es la forma cómoda y
  legítima de empezar— y convierte la procedencia en deber en
  lugar de hecho capturado.
- Pin solo bajo demanda (flujo nuevo): que el anclaje sea opt-in
  por paquete u opción. Se descarta porque reproduce el fallo que
  se quiere eliminar: quien más necesita la procedencia no la
  pedirá, y la divergencia silenciosa sigue invisible para todos
  los que no optaron.
- Mostrar la procedencia sin anclarla (cambio de UI): que
  `list`/`check` informen el commit obtenido sin cambiar la
  obtención. Se descarta porque resuelve solo la mitad débil del
  problema —auditoría sin determinismo: saber de qué árbol salió
  sin poder volver a él—.

## Fuera de alcance

- Hacer visible la señal «el origen avanzó sin bump» en
  `list`/`check`/`update`: el pin la hace detectable, pero
  exponerla es el trabajo de la línea de revisión de
  desactualizados (idea 008).
- Reconstruir el destino desde el registro: es la idea 009, para la
  que el pin es base, no implementación.
- Pinning de orígenes locales (`--path`): no hay commit remoto que
  anclar.
- Backfill de orígenes ya registrados en locks existentes.
- Verificación criptográfica del contenido (checksums, firmas): el
  pin registra el commit, no certifica su integridad.

## Investigaciones de apoyo

- Sondeo técnico (2026-10-12): el redirect de
  `api.github.com/repos/{o}/{r}/tarball` expone solo el nombre de
  la ref resuelta (`refs/heads/master`), no el SHA; el ETag de
  codeload es un hash de contenido, no el commit;
  `api.github.com/repos/{o}/{r}/commits/{ref}` devuelve el SHA
  exacto —verificado contra el commit real `cf2f536a`—. La
  resolución cuesta una llamada API extra por obtención.

## Borradores

- `docs/tasks/037-resolver-el-commit-en-la-obtencion.md` — Resolver el commit
  exacto en la obtención remota
- `docs/tasks/038-registrar-el-commit-en-el-origen.md` — Registrar el commit
  obtenido en el origen del registro (depende de 037)

## Revisión

- Usuario: 2026-10-12 — Aprueba
