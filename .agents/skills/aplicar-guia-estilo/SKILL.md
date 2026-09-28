---
name: aplicar-guia-estilo
description: >
  Aplica la guía de estilo del proyecto evaluado al escribir o
  modificar frontend y valida que el resultado la cumple: todo
  valor visual proviene de los tokens declarados en el
  DESIGN.md y el cambio se verifica con evidencia —estática y,
  cuando el proyecto es servible, renderizada— antes de darse
  por conforme.
  Usar cuando un trabajo toque CSS, HTML o componentes visuales
  de un proyecto con DESIGN.md, o cuando se quiera validar que
  un cambio de frontend cumple la guía.
  Sinónimos: aplicar guía de estilo, validar diseño, cumplir
  DESIGN.md, revisar frontend, tokens antes que literales.
---

# Aplicar guía de estilo

Instrucciones para que un agente escriba frontend conforme a la guía de estilo del proyecto evaluado y verifique el cumplimiento antes de dar el trabajo por terminado. El `DESIGN.md` del proyecto es el contrato: se carga al contexto cuando la tarea toca frontend, sus tokens (`:root`) son la única fuente de valores visuales, y el resultado se valida con evidencia, no con la impresión del ejecutor.

## Cuándo usar

- Al escribir o modificar frontend —CSS, HTML con estilos, componentes visuales— en un proyecto que tiene `DESIGN.md`.
- Cuando se quiera validar que un cambio de frontend ya hecho cumple la guía.
- Cuando la revisión de una tarea con frontend necesite una verificación de diseño explícita.

## Cuándo no usar

- En proyectos sin `DESIGN.md`: la guía se crea con `documentar-guia-estilo`, no se improvisa aquí.
- Para actualizar la guía o resolver decisiones de diseño: eso corresponde a `documentar-guia-estilo`. Este skill consume el contrato vigente; si el trabajo exige una decisión que la guía no cubre, se reporta como deriva o laguna y se eleva al usuario, no se inventa.
- Para la revisión técnica del diff (convenciones, patrones del código): eso corresponde a `revisar-implementacion` o la revisión general del ciclo.

## Entrada

- `DESIGN.md` en la raíz del proyecto evaluado, como contrato vigente.
- El trabajo de frontend a realizar o el diff ya producido a validar.
- `references/rubrica-y-validacion.md` — la rúbrica de revisión y las estrategias de validación por niveles.

## Salida

- Frontend escrito o ajustado conforme a la guía: todos los valores visuales referencian tokens.
- Un veredicto de cumplimiento con la evidencia producida: qué se verificó estáticamente, qué se verificó renderizado (si aplica) y qué quedó sin poder verificar, declarado explícitamente.
- Si aparecen lagunas o deriva de la guía (decisión no cubierta, discrepancia con lo declarado), un reporte para el usuario —nunca una invención silenciosa—.

## Principios rectores

1. **Tokens antes que literales:** todo color, tamaño, espaciado, radio o sombra en el código nuevo proviene de `var(--…)` declarado en la guía; un literal fuera de `:root` es el indicador de deriva de mayor señal.
2. **La guía manda, el brief puede mandar más:** cuando el encargo del usuario contradice la guía, el encargo gana y la discrepancia se reporta para que la guía se actualice —no se resuelve en silencio—.
3. **Evidencia, no impresión:** «se ve bien» no es un veredicto; el cumplimiento se demuestra con chequeos concretos, estáticos o renderizados según lo que el proyecto permita.
4. **Autoridad por niveles:** los fallos deterministas bloquean el trabajo; los riesgos heurísticos se reportan; los juicios subjetivos escalan al usuario. No se disfrazan unos de otros.
5. **Sin herramienta no hay excusa, hay degradación:** si el proyecto no tiene linter ni es servible, la validación se degrada a chequeos ad hoc (búsqueda de literales, repaso contra la rúbrica) y la degradación se declara en el veredicto.

## Procedimiento

1. **Cargar la guía.** Leer el `DESIGN.md` del proyecto antes de escribir una línea de frontend; extraer los tokens disponibles y los anti-patrones vetados. Si no existe, detenerse y proponer `documentar-guia-estilo`.
2. **Escribir con la guía.** Todo valor visual referencia un token; los componentes reutilizan los patrones declarados; los anti-patrones están vetados. Si el trabajo exige un valor que la guía no cubre, parar y elevar la laguna al usuario.
3. **Validar estáticamente.** Verificar en el código producido que no hay valores literales fuera de `:root` (con linter si el proyecto lo tiene, con búsqueda ad hoc si no) y repasar el diff contra la rúbrica fija de `references/rubrica-y-validacion.md`.
4. **Validar renderizado cuando sea posible.** Si el proyecto es servible, capturar el resultado (screenshot por estado y breakpoint relevante) y confrontarlo con la guía y la rúbrica. Si no lo es, declararlo y no simular la evidencia.
5. **Emitir el veredicto.** Conforme con evidencia, o con la lista de fallos deterministas a corregir, riesgos heurísticos reportados y juicios elevados al usuario —declarando qué nivel de evidencia se pudo obtener—.

## Finalización

El skill ha terminado cuando:

- El frontend escrito referencia solo tokens de la guía, o las lagunas detectadas se elevaron al usuario.
- El veredicto declara qué se verificó, con qué nivel de evidencia, y qué quedó sin verificar.

## Referencias

- `references/rubrica-y-validacion.md` — Rúbrica fija de revisión y estrategias de validación estática y renderizada, con sus límites. Leer antes de validar.
- `docs/research/2026-09-guias-estilo-frontend-agentes.md` — Investigación que motiva el skill: dos niveles de evidencia, rúbrica de dimensiones fijas, degradación sin toolchain.
