# Template Canónico para Orquestadores

Este template define la estructura estándar para skills de tipo orquestador que ejecutan múltiples skills hijos en secuencia.

## Estructura Base

```markdown
# [Nombre del Orquestador] (Orquestador)

Orquestador que ejecuta [descripción del workflow completo].

**Workflow**:
1. `[skill-hijo-1]` → [qué hace]
2. `[skill-hijo-2]` → [qué hace]
3. `[skill-hijo-3]` → [qué hace]
4. [acción final de consolidación]

Solo análisis: no modifica código. [propósito del orquestador].

## Fase 0 — Resolver entrada

[Ver referencia compartida: phase0-plan-branch-input.md]

## Fase A — Ejecutar [Skill Hijo 1]

1. Invoca `[skill-hijo-1]` con entrada
2. Carga resultado: `[ruta-archivo-salida]`
3. Extrae:
   - [dato clave 1]
   - [dato clave 2]
   - [dato clave 3]

## Fase B — Ejecutar [Skill Hijo 2]

1. Invoca `[skill-hijo-2]` con entrada
2. Carga resultado: `[ruta-archivo-salida]`
3. Extrae:
   - [dato clave 1]
   - [dato clave 2]
   - [dato clave 3]

## Fase C — Ejecutar [Skill Hijo 3]

1. Invoca `[skill-hijo-3]` con entrada
2. Carga resultado: `[ruta-archivo-salida]`
3. Extrae:
   - [dato clave 1]
   - [dato clave 2]
   - [dato clave 3]

## Fase D — Consolidar Hallazgos

[Template de reporte consolidado con datos de las fases anteriores]

## Fase E — Generar Checklist de Acción

[Ver template: action-checklist-template.md]

## Fase F — Escribir Reporte Consolidado

Estructura:

1. **Resumen ejecutivo**: [métricas clave]
2. **Hallazgos de [tipo 1]**: [categorías]
3. **Hallazgos de [tipo 2]**: [categorías]
4. **Hallazgos de [tipo 3]**: [categorías]
5. **Checklist de acción**: [categorías]
6. **Timeline consolidado**: [cuándo está listo]
7. **Recomendaciones**: [qué hacer primero]
8. **Ready for**: `[ready-for-pr | needs-fixes | high-risk | blocked]`

## Salida

Escribe en: `[ruta-archivo-salida]`

**Secciones requeridas**:
- [lista de secciones requeridas]

Ready for valores:
- `ready-for-pr`: [condiciones]
- `needs-fixes`: [condiciones]
- `high-risk`: [condiciones]
- `blocked`: [condiciones]
```

## Convenciones

- Usar Fase 0 con referencia compartida para resolución de entrada
- Cada fase (A, B, C, ...) corresponde a un skill hijo
- Fase D siempre es consolidación de hallazgos
- Fase E siempre es checklist de acción (template compartido)
- Fase F siempre es escritura del reporte final
- La sección "Ready for" debe tener valores específicos para el contexto del orquestador
