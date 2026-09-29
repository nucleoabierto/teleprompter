# Motor de instalación

## Estado

[x] Planificada

## Objetivo

El producto tiene un instalador que lleva un paquete conforme al
formato definido a un repositorio con trabajo previo: verifica el
manifiesto y las precondiciones, presenta el plan antes de escribir,
resuelve colisiones con una política declarada y deja registro del
resultado —validado con la instalación real del paquete de referencia.

## Alcance

- **Dentro:** investigación de cómo instalan las herramientas
  comparables, definición del comportamiento del instalador (fases,
  política de colisiones, registro) con su descomposición en tareas,
  implementación del ejecutable e instalación real del paquete
  `ciclo-tareas` sobre un destino con historia.
- **Fuera:** contenido de las instrucciones de personalización,
  distribución de paquetes, actualización o desinstalación, y
  fusionado dentro de recursos.

## Piezas

- [x] docs/tasks/005-investigar-motores-instalacion.md — Investigar
  cómo instalan las herramientas comparables
- [x] docs/tasks/006-definir-comportamiento-instalador.md — Definir el
  comportamiento del instalador
- [x] docs/tasks/008-esqueleto-cli-y-verificacion.md — Esqueleto del
  CLI y verificación del paquete
- [x] docs/tasks/009-plan-de-instalacion.md — Plan de instalación y
  detección de colisiones
- [x] docs/tasks/010-ejecucion-y-registro.md — Ejecución del plan y
  registro de instalación
- [ ] docs/tasks/007-instalar-paquete-referencia.md — Instalar el
  paquete de referencia sobre un destino real

## Plan técnico

La épica introduce la primera base ejecutable del repositorio: hasta
ahora el proyecto producía solo documentos. El comportamiento del
instalador se fija como contrato antes de escribir código, siguiendo
el mismo patrón que la épica 001 (investigar → definir → construir →
validar con el caso real).

- **Orden:** investigación, definición del comportamiento con
  descomposición de la implementación, las tareas derivadas,
  validación con el paquete de referencia.
- **Dependencias:** la definición consume las conclusiones de la
  investigación; las tareas de implementación nacen de la definición;
  la validación cierra el conjunto y solo puede ejecutarse cuando
  aquellas existan y estén completas.
- **Decisiones transversales:** el instalador consume el contrato
  fijado por las decisiones D001–D004 (manifiesto JSON puro,
  cardinalidad, semver, mapa `install`); la elección de tecnología de
  implementación la toma la tarea 006 al descomponer el trabajo; las
  decisiones del comportamiento que sean costosas de revertir se
  registran en `docs/decisions/`.

## Criterio de cierre

El paquete `ciclo-tareas` queda instalado por el instalador sobre un
repositorio con trabajo previo —incluida una colisión resuelta por la
política— con plan previo y registro del resultado.

## Revisión

- Usuario: 2026-09-28 — Aprueba
