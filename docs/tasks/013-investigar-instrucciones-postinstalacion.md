# Investigar la entrega de guía post-instalación en herramientas comparables

## Estado

[ ] Pendiente

## Tipo

investigación

## Objetivo

Reunir evidencia externa sobre cómo las herramientas comparables
entregan al destinatario las instrucciones de adaptación tras
instalar: cómo las presentan al terminar y cómo se consultan
después. La forma de la declaración ya está fijada —un campo
específico del manifiesto que apunta a un archivo de texto libre—,
así que la investigación alimenta las decisiones de entrega del
borrador 03.

## Dependencias

- Ninguna.

## Entrada

- La propuesta en `docs/proposals/003-personalizacion-guiada/`,
  especialmente «Solución» y «Fuera de alcance».
- La investigación previa del proyecto sobre motores de instalación
  en `docs/research/` como punto de partida sobre herramientas
  comparables.

## Resultado esperado

- Una investigación en `docs/research/` con: los mecanismos que usan
  gestores y empaquetadores comparables para presentar guía
  post-instalación (p. ej., caveats de Homebrew, mensajes de npm,
  notas de extensiones), cómo se consultan después, y una
  recomendación sobre la forma de entrega —qué se muestra al
  terminar la instalación y cómo se consulta el contenido después—.

## Criterios de calidad

- Cada opción documentada con la fuente que la respalda.
- La recomendación responde a las dos preguntas de diseño abiertas:
  qué muestra la instalación al terminar y cómo se materializa la
  consulta posterior en el destino.
- Las limitaciones de la evidencia quedan declaradas.

## Procedimiento sugerido

1. Revisar la investigación previa sobre motores de instalación para
   recuperar el conjunto de herramientas comparables ya estudiadas.
2. Investigar los mecanismos de guía post-instalación de las más
   relevantes, con énfasis en presentación al instalar y consulta
   posterior.
3. Sintetizar la recomendación y registrarla en `docs/research/`
   siguiendo el formato de las investigaciones existentes.

## Notas

- La consulta posterior tiene una restricción propia del producto: el
  paquete remoto se descarga a un temporal que se elimina al
  terminar, así que para ser consultable después, la guía debe quedar
  materializada en el destino —como recurso instalado o referenciada
  en el registro—. La investigación debe tenerla en cuenta.
- El formato del archivo de instrucciones es libre por decisión del
  usuario: texto dirigido a un agente, sin formato impuesto ni
  contenido ejecutable; la investigación no reabre esa cuestión.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
