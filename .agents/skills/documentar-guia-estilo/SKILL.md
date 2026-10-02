---
name: documentar-guia-estilo
description: >
  Mantiene la guía de estilo de diseño del proyecto evaluado —
  un DESIGN.md en su raíz que actúa como contrato verificable,
  materializado en el código como custom properties de CSS —
  tanto para definirla y revisarla en diálogo con el usuario como
  para mantenerla al día frente a los cambios del frontend.
  Usar para crear la guía de estilo de un proyecto, definir o
  actualizar decisiones de diseño, documentar la guía, o al
  cerrar una tarea que modificó frontend.
  Sinónimos: guía de estilo, design tokens, DESIGN.md, sistema
  de diseño, documentar diseño, actualizar guía de estilo.
---

# Documentar guía de estilo

Instrucciones para que un agente mantenga la guía de estilo de diseño de un proyecto. La guía vive en un `DESIGN.md` en la raíz del proyecto evaluado —el documento vive junto al código que gobierna— redactado como contrato verificable: valores concretos, roles semánticos y anti-patrones explícitos, no principios vagos. Sus decisiones se materializan en el código como custom properties de CSS (`:root`), que son la forma en que el código consume los tokens y en que las herramientas los cuentan.

## Cuándo usar

- Cuando un proyecto tiene frontend pero no tiene guía de estilo, y hay que crearla —sea extrayéndola del código o definiéndola en diálogo con el usuario—.
- Cuando el usuario quiera definir, discutir o revisar decisiones de diseño interactivamente, antes de que toquen el código.
- Al cerrar una tarea que modificó frontend (CSS, HTML con estilos, componentes visuales), con la ubicación de sus cambios como entrada.
- Cuando el usuario pida documentar o actualizar la guía de estilo, o una decisión de diseño nueva necesite incorporarse.

## Cuándo no usar

- Para aplicar la guía al escribir frontend ni para validar que un cambio la cumple: eso corresponde a `aplicar-guia-estilo`. Este skill mantiene el documento; aquel consume el documento.
- Para documentar el modelo del dominio (`documentar-dominio`) ni el comportamiento observable del producto (`documentar-producto`).
- Para registrar decisiones de diseño del propio sistema Factory: usar `decisiones-diseno`. Las decisiones estéticas del proyecto evaluado viven en su `DESIGN.md`.

## Entrada

- El código visual del proyecto evaluado (CSS, HTML, componentes) si se crea la guía por extracción, la ubicación de los cambios de la tarea si se mantiene en modo sensor —árbol de trabajo sin commitear o rango de commits, desde la que el skill reconstruye el diff con git—, o la dirección que el usuario traiga si se trabaja en modo interactivo —en este caso el código sirve de punto de partida, no de límite—.
- `DESIGN.md` existente en la raíz del proyecto evaluado, si lo hay.
- `references/formato-design-md.md` como plantilla de la guía: estructura de secciones y reglas de redacción del contrato.

## Salida

- `DESIGN.md` creado o actualizado en la raíz del proyecto evaluado, con las custom properties correspondientes en el código.
- O el veredicto explícito de «sin impacto»: el diff no altera decisiones declaradas en la guía.
- O un informe de deriva: discrepancias entre lo declarado y lo observado en el código, reportadas al usuario para que decida si entran a la guía, se corrigen en el código o quedan como excepción documentada.

## Principios rectores

1. **Contrato verificable, no mood board:** cada regla del `DESIGN.md` debe ser comprobable —valores concretos, roles y prohibiciones—; un principio que no se puede verificar contra el código no entra.
2. **Extraer o dialogar, pero no imponer:** las decisiones tienen dos fuentes legítimas —el código existente, que se extrae y normaliza, y el usuario, que decide en diálogo—. La dirección estética nunca es una invención del agente: cuando el código no la responde, el modo interactivo es el camino para obtenerla.
3. **La guía es la fuente, el código su materialización:** las decisiones entran por el `DESIGN.md` y se propagan a los tokens (`:root`) y a los usos en el mismo cambio; nunca se editan valores sueltos en componentes sin pasar por la guía.
4. **Sensor, no carga:** en modo mantenimiento la mayoría de las ejecuciones deben terminar en «sin impacto». Si casi siempre produce cambios, el umbral de relevancia está mal calibrado.
5. **La deriva se reporta, no se corrige:** una discrepancia detectada puede ser intencional; el agente la documenta y la eleva al usuario —la corrección silenciosa borra decisiones que nadie aprobó—.

## Procedimiento

El skill tiene tres entradas que se combinan: el modo interactivo (diálogo con el usuario), la creación por extracción (desde el código) y el mantenimiento sensor (desde el diff). El modo interactivo puede preceder a cualquiera de los otros dos: primero se decide en diálogo, después se materializa.

### Modo interactivo: definir o actualizar por diálogo

Usar cuando el usuario quiere decidir el diseño conversando —una guía nueva que el código aún no puede responder, o una actualización deliberada de la existente—.

1. **Presentar el estado.** Si existe `DESIGN.md`, resumir las decisiones vigentes por sección; si no existe, presentar lo que el código sugiere (si hay frontend) o partir de cero.
2. **Dialogar por secciones.** Recorrer las secciones de la guía con el usuario —atmósfera, color, tipografía, espaciado y forma, componentes, estados, layout, movimiento, anti-patrones— proponiendo opciones concretas con valores cuando el usuario no traiga una preferencia. La lista de secciones es la de `references/formato-design-md.md` y es abierta: el usuario decide qué secciones deliberar.
3. **Consolidar lo decidido.** Redactar el `DESIGN.md` nuevo o los cambios sobre el existente y presentarlos al usuario para aprobación antes de materializar.
4. **Materializar.** Declarar o actualizar las custom properties en `:root` y propagar los valores decididos a los usos afectados en el mismo cambio.

### Creación por extracción (no existe `DESIGN.md`)

1. **Extraer las decisiones reales.** Recorrer el CSS y los componentes del proyecto y recopilar los valores usados: colores, tipografías, tamaños, espaciados, radios, sombras. Agruparlos por lo que hacen (fondos, textos, acentos, bordes), no por donde aparecen.
2. **Proponer dirección y tokens.** Presentar al usuario la propuesta: atmósfera visual del proyecto, paleta con roles semánticos, escala tipográfica, unidades de espaciado y anti-patrones —partiendo de lo extraído, con las normalizaciones señaladas (valores casi iguales que convienen unir, literales que se vuelven token). Esperar la aprobación del usuario antes de materializar. Si el usuario quiere discutir la propuesta en lugar de aprobarla, continuar en modo interactivo.
3. **Materializar.** Escribir el `DESIGN.md` con `references/formato-design-md.md` y declarar las custom properties en `:root` del archivo de estilos principal, sustituyendo los literales por `var(--…)` en los usos.
4. **Informar** de la guía creada y de los valores que cambiaron al normalizarse.

### Mantenimiento sensor (existe `DESIGN.md`, entrada por ubicación de cambios)

5. **Evaluar el impacto del diff.** Reconstruir el diff con git a partir de la ubicación indicada —`git status` y `git diff` en el árbol de trabajo, o el rango de commits por sus hashes— y contrastarlo con la guía: ¿introduce valores visuales nuevos (color, tamaño, espaciado, radio, sombra) no cubiertos por un token?, ¿añade un componente o estado que la guía no describe?, ¿modifica valores de tokens existentes? La lista es orientativa, abierta y extensible. Si ninguna aplica, emitir «sin impacto» y terminar.
6. **Clasificar el impacto:**
   - **Decisión nueva aprobada** (la tarea incorpora un cambio de diseño acordado): actualizar el `DESIGN.md` y propagar a los tokens y usos afectados en el mismo cambio.
   - **Deriva** (el código diverge de la guía sin decisión que lo justifique): no corregir; redactar el informe de deriva con las discrepancias concretas y elevarlo al usuario. El usuario puede resolverla en modo interactivo: o la deriva se corrige en el código, o la guía se actualiza para reflejar la decisión.
7. **Informar del resultado:** «sin impacto», guía actualizada con su propagación, o deriva reportada.

## Finalización

El skill ha terminado cuando se cumple una de las ramas:

- **Modo interactivo:** las decisiones dialogadas quedaron escritas en el `DESIGN.md` con aprobación del usuario y materializadas en los tokens y usos.
- **Creación:** el `DESIGN.md` existe en la raíz del proyecto con la estructura de la plantilla, los tokens están declarados en `:root` y los literales principales están sustituidos.
- **Sin impacto:** se emitió el veredicto explícito y no se modificó ningún archivo.
- **Sensor con impacto:** la guía está actualizada y propagada al código, o el informe de deriva está presentado al usuario.

## Referencias

- `references/formato-design-md.md` — Estructura del `DESIGN.md` contrato: secciones, reglas de redacción verificable y ejemplo. Leer antes de crear o actualizar la guía.
- `docs/research/2026-09-guias-estilo-frontend-agentes.md` — Investigación que motiva el skill: guía como contrato, tokens como custom properties, deriva reportada en lugar de corregida.
