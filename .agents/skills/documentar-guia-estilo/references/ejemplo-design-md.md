# Ejemplo de DESIGN.md

Ejemplo completo de una guía que cumple las reglas de `formato-design-md.md`, para un proyecto ficticio —una libreta de notas—. Es la expectativa: lo que cada sección muestra aquí es lo que se espera de esa sección en cualquier proyecto. Al final, «Qué demuestra cada parte» mapea las secciones con las reglas de redacción. No se copia en proyectos: se lee junto a la plantilla.

---

# Guía de estilo — libreta

Contrato verificable de la aplicación en dos mitades —visual y de comportamiento. Todo valor visual en el código debe referenciar los tokens declarados aquí —un literal fuera de la declaración de tokens es deriva— y toda interacción debe cumplir las garantías del contrato de experiencia. Además del contrato, la guía documenta los principios que arbitran las decisiones y la razón de cada regla en dos dimensiones —qué protege en la interfaz y qué cambia en la experiencia del usuario—: es el porqué de la forma visual, para que un componente o pantalla nueva se diseñe con criterio sin recurrir al código.

## Principios

- **El contenido es la interfaz.** Consecuencia: el chrome —barras, botones, bordes— se retira hasta lo mínimo; el texto de la nota lleva la tipografía más legible de la escala. En experiencia: el usuario lee y escribe sin decoración compitiendo por su atención.
- **Las acciones viven donde el ojo está.** Consecuencia: no hay barra de herramientas global; cada superficie lleva sus acciones contextuales. En experiencia: el usuario actúa sobre lo que está mirando sin buscar el comando en otro lugar de la pantalla.
- **El borrado es recuperable.** Consecuencia: nada se destruye sin pasar por la papelera, y la papelera es visible. En experiencia: el error más costoso —perder una nota— tiene siempre un camino de vuelta.

## Atmósfera

Silenciosa y textual: la interfaz desaparece detrás de las notas. Densa en la lista, generosa en la lectura.

## Color

| Token                | Valor      | Rol                                    |
| -------------------- | ---------- | -------------------------------------- |
| `--color-background` | `#fafaf8`  | fondo de página                        |
| `--color-surface`    | `#ffffff`  | tarjeta de nota y campos               |
| `--color-text`       | `#1a1a1a`  | texto de la nota                       |
| `--color-text-muted` | `#8a8a85`  | fechas, contadores, acciones discretas |
| `--color-accent`     | `#2f6f4f`  | acción primaria y selección            |
| `--color-border`     | `#e5e5e0`  | separadores y bordes de campo          |

Reglas de combinación: el acento solo en la acción primaria de cada superficie y en la nota seleccionada —nunca como fondo de texto ni en decoración—. En interfaz, un solo color de acción mantiene la señal inequívoca; en experiencia, el usuario aprende que lo verde es lo activo y encuentra la acción sin leer etiquetas. Texto siempre sobre `--color-background` o `--color-surface` —el par de mayor contraste disponible: lectura prolongada sin esfuerzo—.

## Tipografía

| Rol          | Familia       | Tamaño           | Peso | Altura de línea |
| ------------ | ------------- | ---------------- | ---- | --------------- |
| Nota (lectura) | `--font-serif` | `--font-note` 17px | 400  | 1.6           |
| Lista        | `--font-sans` | `--font-list` 15px | 400  | 1.4           |
| Etiqueta     | `--font-sans` | `--font-label` 13px | 500 | 1.3           |

Reglas: la lectura usa serif y la interfaz sans —la familia distingue el contenido del chrome sin recurrir al color; en experiencia, el usuario reconoce «esto es una nota» por la forma de la letra antes que por la pantalla en que está—; el tamaño mínimo es 13px —por debajo, las etiquetas dejan de ser legibles en pantallas densas—.

## Espaciado y forma

- Unidad base: 8px; los espaciados son múltiplos de ella —el ritmo constante hace la lista predecible: la atención queda en el contenido, no en los huecos—.
- Radios: `--radius` 6px para tarjetas y campos; sin píldoras —un solo radio elimina la decisión por componente—.
- Sin sombras: la separación la hacen el fondo y el borde —la página es plana y la profundidad no se gasta en jerarquías falsas—.
- Contenedor: ancho máximo `--container-max` 680px para lectura, centrado —la longitud de línea que el ojo lee sin perder el renglón—.

## Componentes

- **Tarjeta de nota** (lista): fondo `--color-surface`, borde `--color-border`, radio `--radius`, padding `--space-2`; título en `--font-list`, extracto en `--color-text-muted` —la tarjeta es el objeto de la lista: el borde la delimita sin sombra y el extracto apagado deja el título mandar—.
- **Editor de nota**: ancho completo del contenedor, sin tarjeta —el texto sobre el fondo directo—; barra contextual con las acciones de la nota en `--color-text-muted`, acciones destructivas en `--color-danger` —escribir ocurre en el lugar sin marcos que resten; las acciones de la nota están a la vista, no en un menú que haya que recordar—.
- **Papelera** (pendiente de implementación): sección listada al pie con las notas borradas y su restauración en un toque —el borrado recuperable necesita un lugar visible, no un comando oculto—.
- **Acción destructiva** (borrar nota): botón de texto en `--color-danger`; pide confirmación inline en la propia tarjeta —la destrucción accidental es el error más costoso: el paso extra la vuelve deliberada sin sacar al usuario de contexto—.

## Estados

- **Foco:** anillo en `--color-accent` (2px con offset) en todo elemento interactivo —el usuario de teclado siempre sabe dónde está—.
- **Seleccionada:** la tarjeta lleva borde `--color-accent` —la selección es un estado persistente que debe verse desde la distancia—.
- **Vacío:** mensaje centrado en `--color-text-muted` con la acción de crear la primera nota —el estado vacío orienta la salida en lugar de declarar la ausencia—.
- **Papelera con elementos:** contador visible en la etiqueta de la sección —el usuario sabe que hay recuperables sin entrar—.

## Layout

- Dos regiones apiladas: lista de notas y, al seleccionar, editor a continuación —una sola columna mantiene el orden de lectura igual al orden de uso—.
- La papelera lista al pie, separada por un separador doble —su posición marginal comunica que no es contenido de trabajo—.

## Movimiento

Sin animación. Las transiciones de estado (color, borde, opacidad) duran como máximo 120ms —confirman el gesto sin convertirse en espectáculo—.

## Contrato de experiencia

Las garantías de comportamiento que cruzan toda la interfaz. Cada una declara qué garantiza y cómo se comprueba; la experiencia de un componente concreto vive en la razón de ese componente.

- **El sistema confirma cada acción:** toda interacción produce feedback perceptible en ≤120ms. Comprobable: la duración de las transiciones en el CSS.
- **El teclado recorre todo lo interactivo:** todo elemento interactivo recibe foco visible, en el orden de lectura. Comprobable: recorrer toda la app con Tab.
- **El borrado siempre tiene vuelta:** toda destrucción pasa por la papelera y la restauración es un toque. Comprobable: no existe ruta de borrado que omita la papelera.
- **Ningún estado es un callejón sin salida:** el vacío ofrece la acción de salir de él. Comprobable: cada estado conserva una salida visible.

## Orientación para decisiones nuevas

Para un componente o pantalla que la guía aún no describe:

1. **Identifica el rol:** contenido, acción primaria, acción secundaria o acción destructiva. El rol determina el tratamiento: el contenido lleva serif y contraste pleno, el primario lleva acento, el secundario vive apagado, el destructivo pide confirmación.
2. **Todo valor desde los tokens:** ningún literal; si falta un token, la decisión es de la guía, no del componente —se eleva como laguna—.
3. **Estados obligatorios:** foco con anillo, vacío con salida, deshabilitado apagado.
4. **Densidad desde la unidad:** espaciado en múltiplos de 8px; separación por borde, no por sombra.
5. **Arbitra con los principios:** si la duda es estética, el principio decide —p. ej. una barra global de herramientas contradice «las acciones viven donde el ojo está»—.
6. **Declara el impacto en la experiencia:** la razón que entre en la guía dice qué cambia para el usuario —percepción, acción, error, aprendizaje o accesibilidad—, no solo qué protege en la interfaz.

## Anti-patrones

Prohibido:

- Valores literales de color, tamaño, espaciado, radio o sombra fuera de la declaración de tokens.
- Sombras y gradientes.
- Iconos sin etiqueta como única indicación de una acción.
- El estilo de foco por defecto del navegador sin personalizar.
- Borrado definitivo sin paso por la papelera.
- Prosa explicativa en la interfaz.

---

## Qué demuestra cada parte

- **Párrafo de apertura** — el modelo de dos planos: contrato verificable en dos mitades y fundamentación; declara qué se espera del código (tokens y garantías).
- **Principios** — regla 5: derivados de decisiones existentes (cada uno se sostiene en reglas reales de la guía: el chrome mínimo en Espaciado, las acciones contextuales en Componentes, la papelera en el contrato), con «Consecuencia» y «En experiencia».
- **Color** — reglas 1 y 2: tabla con valores concretos y roles semánticos; las reglas de combinación con las dos dimensiones («En interfaz…; en experiencia…»).
- **Tipografía** — la razón como decisión de producto, no como transcripción: la distinción serif/sans comunica contenido vs chrome.
- **Espaciado y forma** — cada valor con su razón integrada; «sin sombras» es una decisión declarada, no una omisión.
- **Componentes** — mecánica + razón en dos dimensiones; incluye un componente con el marcador «(pendiente de implementación)» (la papelera: decidida, sin código) y una confirmación inline como patrón de error.
- **Estados** — regla verificable por estado con su razón; el vacío como estado con salida.
- **Layout y Movimiento** — estructura y tiempo con su razón; el proyecto declara su presupuesto (120ms), propio de cada guía.
- **Contrato de experiencia** — regla 6: garantías transversales con su comprobación explícita; ninguna declara una funcionalidad y ninguna duplica la razón de un componente.
- **Orientación** — la capa generativa en pasos, con el arbitraje por principios y el paso 6 del impacto en la experiencia.
- **Anti-patrones** — regla 4: lo prohibido con la misma precisión que lo permitido, incluyendo la prohibición de comportamiento (borrado sin papelera), no solo de estilo.
