# Rúbrica y validación

Rúbrica fija de revisión y estrategias de validación del cumplimiento de la guía de estilo. Leer antes de validar cualquier trabajo de frontend.

## Rúbrica de revisión

La crítica no es «que quede mejor»: es una lista verificable de dimensiones. Para cada una, el veredicto es pasa / falla con evidencia, o «no evaluable» declarado.

- **Disciplina de tokens:** todo color, tamaño, espaciado, radio y sombra referencia `var(--…)` del `:root`; ningún literal fuera de la declaración de tokens. Dimensión determinista.
- **Roles correctos:** los tokens usados corresponden al rol declarado en la guía (un `--color-danger` no se usa para énfasis, el acento solo donde la guía lo permite).
- **Reutilización:** los componentes y patrones nuevos reutilizan los ya declarados en la guía antes de crear variantes.
- **Estados cubiertos:** lo escrito contempla los estados que la guía declara —loading, empty, error, disabled, hover, focus— según lo que aplique al componente.
- **Densidad y composición:** la densidad de información y el layout siguen lo declarado en la sección de atmósfera y layout de la guía. Dimensión heurística.
- **Anti-patrones:** nada de lo vetado en la sección de anti-patrones aparece en el diff. Dimensión determinista cuando el veto es un valor, heurística cuando es una estética.
- **Contrato de experiencia:** las garantías de comportamiento que la guía declara —foco visible, presupuestos de transición, áreas de toque, salidas de estado— se cumplen en lo escrito, cada una con la comprobación que declara. Determinista cuando la garantía es un valor o una regla CSS, heurística cuando exige interactuar.
- **Responsive:** el comportamiento sigue lo declarado en la sección de layout; no hay overflow ni rupturas en los breakpoints que la guía cubre. Determinista si se puede renderizar.

## Validación estática (nivel 1)

Barata y rápida, pero insuficiente sola: el código puede pasarla y verse mal. Nunca es la firma final cuando se puede renderizar.

- **Con linter** (si el proyecto tiene stylelint o similar): reglas que prohíban literales fuera del archivo de tokens —`color-no-hex`, `color-named`, `function-disallowed-list`— o plugins que exijan `var(--…)` por propiedad; el archivo de tokens queda excluido del lint.
- **Sin linter**: búsqueda ad hoc en el diff o los archivos tocados —`#hex`, `rgb(`, `px`/`rem`/`em` literales fuera de `:root`, colores con nombre— y contrastar cada hallazgo con los tokens declarados.
- **Cobertura como métrica:** cuando interese vigilar la adopción en el tiempo, contar usos tokenizados frente a literales da un número observable, no solo un pasa/falla.

## Validación renderizada (nivel 2)

Autoritativa: captura lo que el usuario vería. Requiere que el proyecto sea servible (dev server o HTML estático abrible en navegador).

- **Captura:** screenshot por estado y breakpoint relevante con navegador headless o la herramienta de preview disponible; incluir modo oscuro si la guía lo declara.
- **Chequeos deterministas in-page:** overflow horizontal, texto cortado o solapado, objetivos táctiles, errores de consola. Fallan → el trabajo no pasa.
- **Crítica visual:** confrontar los screenshots con la guía y la rúbrica; iterar hasta pasar o declarar el límite.
- **Subjetivo escala:** lo que la rúbrica no puede convertir en criterio (¿esta densidad es la adecuada para este producto?) se eleva al usuario con la evidencia, no se decide por el agente.

## Degradación

- **Servible sin linter:** nivel 2 completo + búsqueda ad hoc de literales.
- **Con linter pero no servible:** nivel 1 completo; se declara que no hubo evidencia renderizada.
- **Ni linter ni servible:** búsqueda ad hoc + repaso de rúbrica sobre el diff; el veredicto declara explícitamente que la evidencia es solo estática y manual.
