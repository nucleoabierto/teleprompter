# Personalización guiada

## Estado

[x] Planificada

## Objetivo

Un paquete declara las instrucciones de personalización del
mantenedor mediante un campo del manifiesto que apunta a un archivo
de texto libre, y una instalación con éxito las entrega al final del
resultado, con consulta posterior sobre el destino instalado.

## Alcance

- **Dentro:** investigación de la entrega post-instalación en
  herramientas comparables, el campo de declaración con su
  validación de referencia, la especificación para mantenedores, el
  paquete de referencia con instrucciones reales, la entrega al
  final de la instalación y la consulta posterior.
- **Fuera:** aplicar la personalización, definir o validar el
  formato del archivo de instrucciones, plantillas o sustitución de
  variables en los recursos, colecciones.

## Piezas

- [ ] docs/tasks/013-investigar-instrucciones-postinstalacion.md —
  Investigar la entrega de guía post-instalación en herramientas
  comparables
- [ ] docs/tasks/014-declarar-personalizacion-en-el-formato.md —
  Declarar las instrucciones de personalización en el formato de
  paquete
- [ ] docs/tasks/015-entregar-personalizacion-al-instalar.md —
  Entregar las instrucciones al instalar y bajo demanda

## Plan técnico

La épica extiende el contrato del formato y el flujo del instalador
sin tocar el motor: la declaración vive en el manifiesto y la
entrega es un paso al final del resultado existente.

- **Orden:** 013 y 014 en paralelo —la forma de la declaración ya
  está fijada y la investigación solo alimenta la entrega—; 015 al
  final, consumiendo ambas.
- **Dependencias:** 015 necesita la declaración de 014 y la
  recomendación de 013.
- **Decisiones transversales:** el campo apunta a un archivo; su
  contenido es texto libre para un agente —no validado ni
  ejecutable—; la guía se materializa en el destino porque el origen
  remoto es temporal; la entrega ocurre tras el registro, solo en
  instalación exitosa.

## Criterio de cierre

Instalar el paquete de referencia —por `user/repo` o `--path`—
muestra sus instrucciones de personalización al final del resultado,
y el mismo contenido se consulta después sobre el destino sin
reinstalar ni redescargar.

## Revisión

- Usuario: 2026-09-29 — Aprueba
