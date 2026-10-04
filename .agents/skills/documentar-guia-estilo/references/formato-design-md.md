# Formato de DESIGN.md

Plantilla y reglas de redacción de la guía de estilo como contrato verificable. El `DESIGN.md` vive en la raíz del proyecto evaluado y lo consume el agente cada vez que escribe frontend (vía `aplicar-guia-estilo`). Para ver la expectativa de cada sección —un ejemplo completo que cumple estas reglas, con el mapeo sección→regla—, leer `ejemplo-design-md.md` junto a esta plantilla.

## Reglas de redacción

1. **Toda regla es comprobable:** valores concretos (hex, px/rem, familia tipográfica) y roles semánticos, nunca adjetivos («moderno», «limpio») sin traducción a valores.
2. **Cada regla declara su razón en dos dimensiones:** qué protege en la interfaz —la decisión mecánica y su trade-off— y qué cambia en la experiencia del usuario —percepción, acción, error, aprendizaje o accesibilidad—. La razón es la parte que el código no puede expresar: sin ella la guía es una transcripción tautológica del CSS, y ante un componente o pantalla nueva el lector no puede derivar su estilo ni anticipar su efecto en quien lo usa.
3. **Un nombre por valor:** cada token tiene un nombre semántico que describe su función (`--color-surface`, `--color-accent`), no su valor (`--color-red`).
4. **Los anti-patrones son reglas:** la sección de anti-patrones declara lo prohibido con la misma precisión que lo permitido —es la mitad del contrato, porque los modelos tienen estéticas por defecto que hay que vetar explícitamente—.
5. **Los principios se derivan de las decisiones:** la sección de principios extrae los valores que las decisiones existentes ya revelan —documentar la realidad, no aspiraciones—; cada principio declara su consecuencia verificable y arbitra las decisiones nuevas. Si una decisión futura contradice un principio, se revisa el principio o se justifica la excepción.
6. **El contrato de experiencia posee lo transversal:** las garantías de comportamiento que cruzan toda la interfaz viven en su sección —cada una declara qué garantiza y cómo se comprueba—; la experiencia de un componente concreto sigue viviendo en la razón de ese componente. Una garantía que no se pueda comprobar no entra, y la sección no declara funcionalidades: cualidades de interacción, no features del producto.
7. **Conciso y completo:** la guía cabe en unas 100-200 líneas. Lo que no está en la guía no está regulado: cubrir las decisiones que el código realmente toma.
8. **Sin tecnología del agente:** el documento habla del producto (colores, tipografía, componentes), no de herramientas ni de cómo se escribió.

## Estructura de secciones

```markdown
# Guía de estilo — [nombre del proyecto]

[Un párrafo de apertura: qué es la guía —contrato verificable en dos
mitades, visual y de comportamiento: todo valor visual del código
referencia los tokens declarados aquí y toda interacción cumple las
garantías del contrato de experiencia— y qué añade —los principios
que arbitran las decisiones y la razón de cada regla, el porqué de
la forma visual—.]

## Principios

[3-5 principios, una frase cada uno, derivados de las decisiones
existentes —no aspiraciones—. Cada uno declara su consecuencia
verificable y arbitra las decisiones nuevas: ante una duda estética,
el principio decide.]

## Atmósfera

[Mood y densidad en una o dos frases, seguidas de sus consecuencias
verificables: p. ej. «denso: la interfaz muestra datos, no prosa;
las etiquetas son la palabra más corta posible».]

## Color

Paleta con roles semánticos. Cada entrada: nombre, valor y función.

- `--color-background` `#ffffff` — fondo de la aplicación
- `--color-surface` `#f5f5f5` — tarjetas y secciones elevadas
- `--color-text` `#111111` — texto principal
- `--color-text-muted` `#777777` — metadatos y texto secundario
- `--color-accent` `#b83f45` — acciones primarias y foco
- `--color-danger` `#…` — destrucción y errores

Reglas de combinación con su razón: [qué pares están vetados por
contraste, dónde puede aparecer el acento y dónde no —y qué protege
cada restricción—.]

## Tipografía

Tabla de roles, no prosa:

| Rol | Familia | Tamaño | Peso | Altura de línea |
|-----|---------|--------|------|-----------------|
| Título | system-ui | 48px | 200 | 1.1 |
| Cuerpo | system-ui | 16px | 400 | 1.5 |
| Datos | ui-monospace | 13px | 400 | 1.4 |

[Reglas con su razón: tracking negativo permitido solo en títulos,
tamaño mínimo de cuerpo, etc.]

## Espaciado y forma

- Unidad base: [4px | 8px]; los espaciados son múltiplos de ella —[razón: la unidad única elimina los ajustes de ojo entre elementos]—.
- Radios permitidos: [0 | 4px | pill] y para qué —[razón de la distinción]—.
- Sombras: [permitidas o no, con la escala exacta] —[qué reserva la elevación]—.
- Contenedor: ancho máximo y gutters —[qué longitud de línea protege]—.

## Componentes

Por cada componente con reglas propias (botones, inputs, tarjetas,
navegación): su forma, padding, estados (default, hover, focus,
disabled) y variantes, con valores de token —y la razón de su
decisión: qué protege o qué trade-off resuelve—.

## Estados

Cómo se ven los estados obligatorios: loading, empty, error,
deshabilitado. [Regla verificable por estado, con su razón.]

## Layout

[Estructura de página: regiones, orden, comportamiento responsive
mínimo —qué colapsa y cuándo— y la razón de la estructura elegida.]

## Movimiento

[Duraciones, easings, qué se anima y qué nunca se anima. Si el
proyecto no anima, declararlo: «sin animación salvo transiciones
de estado de ≤150ms» —[razón: qué confirman las transiciones]—.]

## Contrato de experiencia

[Las garantías de comportamiento que cruzan toda la interfaz —lo que
el usuario puede esperar siempre, en cualquier pantalla—. Cada regla:
qué garantiza y cómo se comprueba (presupuesto de tiempo, tamaño de
toque, orden de teclado, presencia de la salida). Derivada de las
decisiones existentes, como los principios; la experiencia de un
componente concreto vive en la razón de ese componente, no aquí.]

- **[Nombre de la garantía]:** [qué garantiza —cómo se comprueba—.]

## Orientación para decisiones nuevas

[Cómo derivar el estilo de un componente o pantalla que la guía aún
no describe: qué rol elegir, qué estados son obligatorios, qué tokens
aplican, qué principios arbitran las dudas y qué impacto en la
experiencia del usuario debe declarar la razón. Es la capa generativa:
con ella un componente nuevo se diseña sin leer el código.]

## Anti-patrones

Prohibido:
- Valores literales de color, tamaño o espaciado fuera de `:root`.
- [Estéticas vetadas del proyecto: gradientes, iconos emoji como
  ilustración, sombras si no se usan, etc.]
```

## Notas de aplicación

- La guía declara las custom properties; su declaración vive en `:root` del archivo de estilos principal del proyecto y los valores del `DESIGN.md` deben coincidir con los del código.
- Los principios y las razones fundamentan el contrato sin sustituirlo: los valores siguen siendo la parte verificable y deben coincidir con el código; una razón que contradiga un valor vigente es un error de redacción, no una decisión.
- Un componente decidido pero aún sin implementar se marca «(pendiente de implementación)»: la guía documenta la decisión aprobada sin afirmar que el código la materializa; el validador la trata como brecha que el código debe alcanzar, no como deriva del código.
- Si el proyecto tiene varios temas (claro/oscuro), cada rol declara sus valores por tema en la misma sección.
- Las secciones son la estructura completa pero no una camisa de fuerza: un proyecto puede omitir «Movimiento» si declara que no anima, y puede añadir secciones (iconografía, imágenes) cuando su producto las necesite.
