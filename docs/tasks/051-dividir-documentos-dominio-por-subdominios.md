# Dividir los documentos de dominio por subdominios

## Estado

[ ] Pendiente

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

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
