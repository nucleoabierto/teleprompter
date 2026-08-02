# Metodología ZOMBIE

Metodología de testing sistemática para asegurar calidad y robustez.

## Principios

**Z**ero-bugs: Eliminar bugs comunes (null checks, boundary conditions)
**O**ne path: Happy path primero, edges después
**M**any tests: Múltiples escenarios por función
**B**ehavior-driven: Tests verifican comportamiento, no implementación
**I**solated: Tests son independientes (no dependen de otros)
**E**xact: Assertions específicas (no vagas)

## Aplicación por Componente

Para cada componente crítico, aplica ZOMBIE de la siguiente manera:

### Z - Zero-bugs (Errores comunes a evitar)

Identifica y documenta errores comunes con sus mitigaciones:

- ❌ Error común → ✅ Mitigación específica

### O - One path (Happy path primero)

Define el happy path principal antes de explorar edge cases.

### M - Many tests (Múltiples escenarios)

Documenta:

- Valid scenarios
- Invalid scenarios
- Edge cases
- Security scenarios

### B - Behavior-driven (Qué hace, no cómo)

Enfócate en el comportamiento observable, no en detalles de implementación.

### I - Isolated (Tests no dependen)

Asegura que cada test sea independiente y no dependa del estado de otros tests.

### E - Exact (Assertions específicas)

Usa assertions específicas y medibles, evitando checks vagos.
