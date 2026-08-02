# Tabla de Análisis de Componentes

Template para análisis de componentes existentes vs nuevos en el codebase.

## Tabla de Componentes

| Componente      | Existe | Reutilizable | Necesita Refactor | Nota               |
|-----------------|--------|--------------|-------------------|--------------------|
| [Auth service]  | Sí     | Parcialmente | Sí (legacy)       | [Detalles]         |
| [Payment API]   | No     | N/A          | N/A               | Construcción nueva |
| [Queue service] | Sí     | Totalmente   | No                | Reutilizar         |

## Regla de Evaluación

- **Bajo riesgo**: Si existe y es reutilizable → proceder con integración
- **Riesgo medio**: Si existe pero necesita refactor → estimar esfuerzo de refactor
- **Riesgo alto**: Si no existe → construcción nueva desde cero

## Uso

Para cada epic o feature, evaluar los componentes requeridos y clasificar según la regla de evaluación. Documentar detalles específicos en la columna "Nota".
