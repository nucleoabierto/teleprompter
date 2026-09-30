# Investigar la entrega de guía post-instalación en herramientas comparables

## Tipo

investigación

## Objetivo

Reunir evidencia externa sobre cómo las herramientas comparables
entregan al destinatario las instrucciones de adaptación tras
instalar: dónde se declaran, cómo se presentan al terminar y cómo se
consultan después. La investigación alimenta las decisiones de formato
y de entrega de los borradores siguientes.

## Dependencias

- Ninguna.

## Entrada

- La propuesta en `docs/proposals/003-personalizacion-guiada/`,
  especialmente «Solución» y «Fuera de alcance».
- La investigación previa del proyecto
  (`docs/research/…motores-instalacion` si existe) como punto de
  partida sobre herramientas comparables.

## Resultado esperado

- Una investigación en `docs/research/` con: los mecanismos que usan
  gestores y empaquetadores comparables para declarar instrucciones
  post-instalación (p. ej., caveats de Homebrew, mensajes de npm,
  notas de extensiones), cómo las presentan al instalar, cómo se
  consultan después, y una recomendación sobre dónde debe vivir la
  declaración en el paquete —campo del manifiesto, convención de
  archivo o combinación— y sobre la forma de entrega.

## Criterios de calidad

- Cada opción documentada con la fuente que la respalda.
- La recomendación responde a las dos preguntas de diseño: dónde se
  declara la guía y cómo se entrega (al instalar y en consulta
  posterior).
- Las limitaciones de la evidencia quedan declaradas.

## Procedimiento sugerido

1. Revisar la investigación previa sobre motores de instalación para
   recuperar el conjunto de herramientas comparables ya estudiadas.
2. Investigar los mecanismos de guía post-instalación de las más
   relevantes, con énfasis en declaración vs. presentación vs.
   consulta posterior.
3. Sintetizar la recomendación y registrarla en `docs/research/`
   siguiendo el formato de las investigaciones existentes.

## Notas

- La consulta posterior tiene una restricción propia del producto: el
  paquete remoto se descarga a un temporal que se elimina al
  terminar, así que para ser consultable después, la guía debe quedar
  materializada en el destino —como recurso instalado o referenciada
  en el registro—. La investigación debe tenerla en cuenta.
