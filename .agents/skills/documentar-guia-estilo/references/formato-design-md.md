# Formato de DESIGN.md

Plantilla y reglas de redacción de la guía de estilo como contrato verificable. El `DESIGN.md` vive en la raíz del proyecto evaluado y lo consume el agente cada vez que escribe frontend (vía `aplicar-guia-estilo`).

## Reglas de redacción

1. **Toda regla es comprobable:** valores concretos (hex, px/rem, familia tipográfica) y roles semánticos, nunca adjetivos («moderno», «limpio») sin traducción a valores.
2. **Un nombre por valor:** cada token tiene un nombre semántico que describe su función (`--color-surface`, `--color-accent`), no su valor (`--color-red`).
3. **Los anti-patrones son reglas:** la sección de anti-patrones declara lo prohibido con la misma precisión que lo permitido —es la mitad del contrato, porque los modelos tienen estéticas por defecto que hay que vetar explícitamente—.
4. **Conciso y completo:** la guía cabe en unas 100-200 líneas. Lo que no está en la guía no está regulado: cubrir las decisiones que el código realmente toma.
5. **Sin tecnología del agente:** el documento habla del producto (colores, tipografía, componentes), no de herramientas ni de cómo se escribió.

## Estructura de secciones

```markdown
# Guía de estilo — [nombre del proyecto]

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

Reglas de combinación: [qué pares están vetados por contraste,
dónde puede aparecer el acento y dónde no.]

## Tipografía

Tabla de roles, no prosa:

| Rol | Familia | Tamaño | Peso | Altura de línea |
|-----|---------|--------|------|-----------------|
| Título | system-ui | 48px | 200 | 1.1 |
| Cuerpo | system-ui | 16px | 400 | 1.5 |
| Datos | ui-monospace | 13px | 400 | 1.4 |

[Reglas: tracking negativo permitido solo en títulos, tamaño mínimo
de cuerpo, etc.]

## Espaciado y forma

- Unidad base: [4px | 8px]; los espaciados son múltiplos de ella.
- Radios permitidos: [0 | 4px | pill] y para qué.
- Sombras: [permitidas o no, con la escala exacta].
- Contenedor: ancho máximo y gutters.

## Componentes

Por cada componente con reglas propias (botones, inputs, tarjetas,
navegación): su forma, padding, estados (default, hover, focus,
disabled) y variantes, con valores de token.

## Estados

Cómo se ven los estados obligatorios: loading, empty, error,
deshabilitado. [Regla verificable por estado.]

## Layout

[Estructura de página: regiones, orden, comportamiento responsive
mínimo —qué colapsa y cuándo.]

## Movimiento

[Duraciones, easings, qué se anima y qué nunca se anima. Si el
proyecto no anima, declararlo: «sin animación salvo transiciones
de estado de ≤150ms».]

## Anti-patrones

Prohibido:
- Valores literales de color, tamaño o espaciado fuera de `:root`.
- [Estéticas vetadas del proyecto: gradientes, iconos emoji como
  ilustración, sombras si no se usan, etc.]
```

## Notas de aplicación

- La guía declara las custom properties; su declaración vive en `:root` del archivo de estilos principal del proyecto y los valores del `DESIGN.md` deben coincidir con los del código.
- Si el proyecto tiene varios temas (claro/oscuro), cada rol declara sus valores por tema en la misma sección.
- Las secciones son la estructura completa pero no una camisa de fuerza: un proyecto puede omitir «Movimiento» si declara que no anima, y puede añadir secciones (iconografía, imágenes) cuando su producto las necesite.
