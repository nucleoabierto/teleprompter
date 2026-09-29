# Revisión de arquitectura 001: motor de instalación

- **Fecha:** 2026-09-28
- **Dominio evaluado:** el instalador de Teleprompter —aún sin código;
  la evaluación cubre su contrato (`docs/instalador.md`), las
  decisiones que lo fijan (D005–D008) y el plan de la tarea 008, que
  introduce la primera base de código.
- **Intención declarada:** no hay documento en `docs/domains/`; la
  intención se toma de `docs/instalador.md` (contrato de
  comportamiento), `docs/especificacion-paquete.md` (modelo de
  entrada) y `docs/epics/002-motor-instalacion.md` (guía de
  arquitectura de la épica).
- **Decisiones respetadas:** D001–D004 (contrato del manifiesto),
  D005–D008 (comportamiento y tecnología del instalador).

## Veredictos por criterio

### Lenguaje ubicuo — mejorable (confianza alta)

El contrato mantiene un vocabulario consistente: «paquete»,
«destino», «plan», «recurso», «colisión», «registro». Sin embargo hay
dos vocabularios no reconciliados explícitamente: las marcas del plan
(`create`, `identical`, `conflict`, `managed-update`) y las acciones
del registro (`create`, `overwrite`, `skip`). Que `managed-update` se
ejecute como `overwrite` está implícito pero no declarado en
`docs/instalador.md` —un implementador tiene que deducirlo (la tarea
010 lo aclara, el contrato no).

### Separación de capas — correcto (confianza media)

El plan de la tarea 008 separa el dominio (`src/manifest.js`,
`src/requires.js`: validación pura de manifiesto y precondiciones) de
la capa de invocación (`bin/teleprompter.js`: parseo de argumentos,
salida, códigos de salida). El contrato ya impone la separación
principal: plan calculado y ejecutado son fases distintas (D005). La
confianza es media porque no hay código que lo confirme todavía; el
riesgo conocido es que `bin/` acumule lógica de dominio a medida que
crezcan las opciones (`--force`, `--skip`, `--dry-run`, resolución
interactiva).

### Fronteras del contexto — correcto (confianza alta)

Las fronteras declaradas se respetan en el contrato: el instalador lee
el paquete y escribe solo en el destino; `personalization` se entrega
y presenta sin interpretarla; no hay fusión de contenido ni
update/uninstall (fuera de alcance declarado). `teleprompter-lock.json`
es la frontera de propiedad bien delimitada: el único archivo que la
herramienta considera suyo en la raíz del destino.

### Invariantes y modelo — correcto (confianza media)

Las invariantes tienen defensores claros y localizados:

- Todo-o-nada (D005): defendida por la frontera plan/ejecución.
- Seguridad de rutas (ni absolutas ni `..`): defendida en la
  validación del manifiesto, asignada a `src/manifest.js`.
- Propiedad del registro (D007): defendida por la comparación de
  hashes al clasificar `conflict` vs. `managed-update`.

### Acoplamiento y estructura — correcto (confianza media)

El grafo planeado es lineal y sin ciclos: `bin` → `src/manifest` →
`src/requires` → (009) generación del plan → (010) ejecución y
registro. Ningún componente concentra más de una preocupación
arquitectónica en el diseño. El despiece 008→009→010 sigue las fases
del contrato, lo que mantiene la funcionalidad localizada.

## Hallazgos

### H1 — Doble vocabulario plan/registro sin correspondencia declarada

- **Criterio o patrón:** lenguaje ubicuo —sinónimos dispersos.
- **Evidencia:** `docs/instalador.md` define cuatro marcas del plan
  («El plan») y tres acciones del registro («El registro») sin declarar
  la correspondencia `managed-update` → `overwrite`.
- **Objetivo:** el contrato declara que `managed-update` e `identical`
  no son acciones sino estados del plan, y que su ejecución es
  `overwrite` y nula respectivamente.
- **Restricciones:** no alterar las marcas ni las acciones ya fijadas;
  solo declarar la correspondencia.
- **Validación:** un implementador puede derivar la acción del
  registro de cualquier marca del plan sin ambigüedad.
- **Confianza:** alta.
- **Derivado en:** `docs/instalador.md` (corrección aplicada en la revisión del plan de la tarea 008).

### H2 — El contrato de datos entre verificación y plan no está fijado

- **Criterio o patrón:** interfaz ambigua.
- **Evidencia:** `docs/instalador.md` dice que las `paths` con
  `create: true` «se anotan como acciones de creación en el plan», pero
  la tarea 008 no declara qué estructura devuelve la verificación para
  que la 009 construya el plan —arriesga que 009 reimplemente la
  anotación.
- **Objetivo:** la verificación devuelve un resultado estructurado
  (manifiesto validado + acciones de precondición) que la generación
  del plan consume, declarado en la tarea 008.
- **Restricciones:** sin sobreingeniería —una estructura interna, no
  un formato publicado.
- **Validación:** la tarea 009 implementa el plan consumiendo el
  resultado de la verificación sin revalidar el manifiesto.
- **Confianza:** alta.
- **Derivado en:** `docs/tasks/008-esqueleto-cli-y-verificacion.md` (plan corregido).

### H3 — El código de salida para error de invocación no está definido

- **Criterio o patrón:** frontera difusa en el contrato.
- **Evidencia:** `docs/instalador.md` fija códigos 0–3 para éxito,
  manifiesto inválido, plan no ejecutable y error de ejecución; la
  invocación incorrecta (sin argumentos, rutas inexistentes) no tiene
  código asignado —el plan de 008 la presenta sin código.
- **Objetivo:** el contrato fija el código para uso incorrecto de la
  invocación (p. ej. reservar 1 para manifiesto inválido y usar otro
  para invocación, o declarar que comparte código).
- **Restricciones:** no renumerar los códigos ya aprobados salvo que
  la corrección lo justifique.
- **Validación:** todo camino de salida del CLI tiene un código
  declarado.
- **Confianza:** alta.
- **Derivado en:** `docs/instalador.md` (corrección aplicada en la revisión del plan de la tarea 008).

### H4 — Ausencia de documento de dominio para «instalación»

- **Criterio o patrón:** intención declarada —el dominio no tiene
  documento en `docs/domains/`; esta revisión evaluó contra
  `docs/instalador.md`, que cumple la función de contrato pero no la
  de modelo de dominio (glosario, invariantes, fronteras).
- **Evidencia:** `docs/` no contiene `domains/`.
- **Objetivo:** cuando la épica produzca código, evaluar con
  `documentar-dominio` si el dominio amerita documento propio
  (glosario: paquete, destino, plan, colisión, registro, propiedad).
- **Restricciones:** crearlo solo si el dominio lo justifica; no
  duplicar lo que `docs/instalador.md` ya dice.
- **Validación:** existe `docs/domains/instalacion.md` o una decisión
  registrada de no crearlo.
- **Confianza:** media.
- **Derivado en:** pendiente — evaluación con `documentar-dominio` al cierre de la épica 002.

## Recomendaciones

1. Resolver H1–H3 como pequeñas correcciones al contrato
   (`docs/instalador.md`) y al plan de la tarea 008 antes de aprobarlo:
   son baratas ahora y costosas una vez implementadas.
2. Añadir al plan de la tarea 008 un criterio explícito de capa
   delgada: `bin/` solo parsea, invoca y traduce a códigos de salida;
   la lógica vive en `src/`.
3. Dejar H4 para el cierre de la épica, cuando `documentar-dominio`
   evalúe el diff acumulado.
