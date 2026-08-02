# Guía de Ejemplos de Test Cases

Este documento centraliza las referencias a los ejemplos de test cases disponibles en `assets/test-case-examples.md`.

## Secciones de Ejemplos Disponibles

| Sección                        | Descripción                                                                                                                  | Ubicación en assets/test-case-examples.md |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| Ejemplo de Análisis de Función | Ejemplo completo de cómo analizar una función/método público (entrada, salida, comportamiento, efectos secundarios, errores) | Sección "Ejemplo de Análisis de Función"  |
| Happy Path Test Cases          | Ejemplos de casos de prueba para el flujo normal                                                                             | Sección "Happy Path Test Cases"           |
| Edge Cases Test Cases          | Ejemplos de casos en límites y valores especiales (zero, mínimo, máximo, rounding, precision)                                | Sección "Edge Cases Test Cases"           |
| Error Cases Test Cases         | Ejemplos de casos para entradas inválidas y condiciones de error                                                             | Sección "Error Cases Test Cases"          |
| Boundary Cases Test Cases      | Ejemplos de casos para valores justo en límites definidos                                                                    | Sección "Boundary Cases Test Cases"       |
| Side Effects Test Cases        | Ejemplos de casos para validar efectos secundarios (logging, DB updates, cache changes)                                      | Sección "Side Effects Test Cases"         |
| Concurrency Test Cases         | Ejemplos de casos para comportamiento bajo acceso concurrente                                                                | Sección "Concurrency Test Cases"          |
| Integration Test Cases         | Ejemplos de casos para interacción con otras funciones/componentes                                                           | Sección "Integration Test Cases"          |
| Test Case Matrix               | Ejemplo de matriz de cobertura con columnas: Caso, Tipo, Unit, Integration, E2E, Manual                                      | Sección "Test Case Matrix"                |

## Uso

Cuando necesites ejemplos específicos para cualquier fase del análisis de test cases, consulta la sección correspondiente en `assets/test-case-examples.md` usando la tabla anterior como guía.

## Referencias Adicionales

- **ZOMBIE Methodology**: `references/zombie-methodology.md` - Metodología completa de análisis de test cases
- **Coverage Matrix Template**: `references/coverage-matrix-template.md` - Plantilla de matriz de cobertura
- **Criticality Matrix Template**: `references/criticality-matrix-template.md` - Plantilla de matriz de criticidad
