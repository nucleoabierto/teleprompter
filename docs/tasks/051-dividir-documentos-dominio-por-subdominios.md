# Dividir los documentos de dominio por subdominios

## Estado

[x] Completada

## Tipo

mantenimiento

## Objetivo

Dividir `docs/domains/002-instalacion.md` —377 líneas que
aglutinan trece conceptos del lenguaje ubicuo más entidades,
invariantes y operaciones— en documentos por subdominio real,
ahora que las áreas del código se especializan con el hito de
saneamiento, de modo que cada concepto siga teniendo un solo
hogar y los anclas al código queden agrupadas por la frontera
que defienden.

## Dependencias

- docs/tasks/046-extraer-informes-y-predicados-cli.md
- docs/tasks/047-separar-gramatica-y-ayuda-cli.md
- docs/tasks/048-uniformar-forma-plan.md
- docs/tasks/049-extraer-resolucion-miembro-coleccion.md
- docs/tasks/050-declarar-forma-ejecucion-sin-paquete.md
- docs/tasks/052-separar-comandos-consulta-ciclo-vida.md

## Entrada

- `docs/domains/001-paquete.md` y `docs/domains/002-instalacion.md`
  —los documentos a dividir—.
- `docs/domains/README.md` —el índice que los lista—.
- Las costuras identificadas en la conversación de origen:
  registro (lock, propiedad, deriva, defensas de rutas
  registradas), resolución de conflictos (resolución, diff,
  respaldo, política `overwrite`/`skip`) y ciclo de vida
  (plan, marcas, ejecución, actualización, retirada).

## Resultado esperado

- `002-instalacion.md` dividido en documentos nuevos de la
  serie —la propuesta de costuras es punto de partida; la
  frontera exacta se decide al ejecutar, cuando las fronteras
  de módulos del hito ya estén asentadas—: cada concepto del
  lenguaje ubicuo, entidad, invariante y operación conserva un
  solo hogar.
- Cada documento mantiene sus anclas al código vigentes —los
  símbolos que las tareas 046–050 hayan movido apuntan al
  archivo nuevo—.
- `docs/domains/README.md` lista todos los documentos con su
  resumen de una línea.

## Criterios de calidad

- Ningún concepto queda duplicado ni huérfano: cada hecho del
  modelo vive en exactamente un documento; los demás lo
  referencian.
- Todas las anclas nombran un símbolo que existe en el archivo
  citado.
- El índice refleja la serie completa sin huecos.
- La política de conflictos no queda fragmentada entre
  documentos de ciclo de vida: se define una vez y se
  referencia.

## Procedimiento sugerido

1. Inventariar los conceptos, entidades, invariantes y
   operaciones del documento y agruparlos por subdominio.
2. Crear los documentos nuevos de la serie con la plantilla de
   dominio y repartir el contenido sin reformularlo.
3. Re-anclar las referencias que apunten a archivos movidos
   por las tareas del hito.
4. Actualizar el índice y los estados de salud.

## Notas

- Surgida de la conversación de cierre de la tarea 045: los
  dominios se hacen más pequeños a medida que las áreas se
  especializan. Se ejecuta al final del hito, cuando las
  fronteras de módulos ya están asentadas, para no re-anclar
  dos veces.

## Contexto

- `002-instalacion.md` (385 líneas) aglutina tres subdominios
  reales hoy separados en el código: ciclo de vida (plan,
  ejecución, update/uninstall —`plan.js`, `execute.js`,
  `commands.js`), registro (lock, propiedad, deriva, consultas
  —`lock.js`, `drift.js`, `queries.js`) y resolución de
  conflictos (política, diff, respaldo —`prompt.js`, `diff.js`,
  `backupConflict`/`backupName`).
- Inventario del documento: 13 conceptos de lenguaje ubicuo, 5
  entidades, 12 invariantes y 11 operaciones.
- `001-paquete.md` (97 líneas) figura como entrada pero ya es un
  solo subdominio —sirve de plantilla de formato (Propósito,
  Referencia del modelo, Explicación, Estado de salud)—; no se
  divide.
- Los anclas ya apuntan a los archivos vigentes —las tareas
  046–052 los re-anclaron al mover código—; el reparto no
  re-ancla símbolos, solo los reubica por subdominio.
- `docs/instalador.md` existe y sostiene las referencias de
  contrato citadas por los anclas.
- La serie sin huecos exige que `002` siga existiendo: la
  instalación como flujo es un subdominio propio —queda como
  el documento del ciclo de vida—.

## Conectividad

Verificada durante la recolección: inventario completo del
documento, plantilla de formato confirmada en `001`, contratos
referenciados existentes, ausencia de linter de documentación
—la verificación será mecánica sobre los anclas—. Veredicto:
**conectada**.

## Plan técnico

- [x] Crear `003-registro.md` con la plantilla de `001`:
  Registro (lock), Propiedad, Deriva; Hash de recurso;
  invariantes lock-ilegible, `identical` conserva registro y
  `.teleprompter/` gestionado; operaciones registrar, guide,
  list, check; D007, D011–D013, D014; la divergencia conocida.
- [x] Crear `004-resolucion-conflictos.md`: Resolución, Diff de
  conflicto, Respaldo; invariantes `--force`/`--skip`, no
  afirmativa = `skip`, anuncio sin leer fuera; D006; sección
  Operaciones mínima —la política es fase de los flujos—.
- [x] Reducir `002-instalacion.md` al ciclo de vida; ajustar
  solo Fronteras/Relaciones para declarar los subdominios.
- [x] Actualizar `docs/domains/README.md` con la serie completa.
- [x] Verificar: cada ancla nombra un símbolo existente en el
  archivo citado; inventario 13+5+12+11 sin duplicados ni
  huérfanos; `npm test` intacto.

## Decisiones

- `002` permanece como el documento del ciclo de vida: la serie
  no admite huecos y la instalación como flujo es subdominio
  propio.
- Commit resuelto → 002 (es el anclaje de la obtención; el
  campo registrado ya lo describe el concepto Registro).
- Hash de recurso → 003 (mecanismo de propiedad y deriva).
- `.teleprompter/` → 003 (territorio gestionado «igual que el
  lock»; su pre-verificación referencia D005, que queda en 002).
- Divergencia conocida → 003 (hecho sobre lo que el registro
  registra como verdad).
- Códigos de salida → 002 (tabla única; las consultas citan en
  línea los códigos que producen).
- Política de conflictos íntegra en 004 —definida una vez,
  referenciada desde 002—.

## Desviaciones

- Tras la revisión: corregidas las cuentas del inventario en este
  archivo (son 12 invariantes y 11 operaciones, no 13+12) y
  precisado el «Dentro» del 002 —el alta en el registro es
  dominio 003, ya lo declara «Relaciones»—.
- D010 quedó en la lista de decisiones del 003, donde vive el
  invariante de `.teleprompter/` que la cita —el plan la situaba
  en el 002—.

## Suite de pruebas esperada

- Verificación mecánica de anclas: cada `símbolo` citado existe
  en el `src/archivo.js` que el ancla nombra.
- Inventario completo repartido: 13 conceptos + 5 entidades +
  12 invariantes + 11 operaciones, cada hecho en exactamente un
  documento.
- `npm test` en verde —ningún archivo de código cambia—.

## Revisión

- Subagente: 2026-10-29 — Aprueba
- Usuario (ejecución): 2026-10-29 — Aprueba
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
