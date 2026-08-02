# Diagrama de flujo del workflow

```
Idea bruta
    ↓
(opcional) analizar-idea → Veredicto: Proceder / Proceder condicional / No proceder
    ↓
    ├─→ No proceder → STOP (blocked)
    └─→ Proceder / Proceder condicional → Continúa
    ↓
evaluar-alcance-idea [GATE]
    ↓
    ├─→ Múltiples funcionalidades → Dividir en funcionalidades individuales
    └─→ Funcionalidad única → Continúa
    ↓
priorizar-roadmap [GATE]
    ↓
    ├─→ Hay items priorizables → Seleccionar funcionalidad más prioritaria
    └─→ Todos bloqueados → STOP (bloqueado)
    ↓
evaluar-conectividad-tecnica [GATE]
    ↓
    ├─→ Conectado → Continúa
    └─→ Desconectado → Generar features puente → priorizar-roadmap → Seleccionar feature puente
    ↓
capturar-requerimiento
    ↓
Requirements capturados
    ↓
(recomendado) mapear-assumptions → Assumptions mapeados (4 buckets + matriz risk vs evidence)
    ↓
(gate) construir-spike por feasibility assumption (si hay assumptions de feasibility de riesgo medio/alto y evidencia baja/media)
    ↓
validar-viabilidad-producto [GATE]
    ↓
    ├─→ No-Go → Actualizar estado roadmap → ¿Hay más funcionalidades? → Sí: siguiente, No: STOP
    ├─→ Conditional Go (riesgo técnico) → construir-spike → retoma el gate
    ├─→ Conditional Go (otro) → Resuelve condiciones manualmente → Continúa
    └─→ Go → Continúa
    ↓
definir-usuarios
    ↓
Personas definidas
    ↓
mapear-casos-uso
    ↓
Casos mapeados
    ↓
    (opcional) construir-demo → valida flujos con stakeholders
    ↓
(condicional al stage) disenar-experimentos
    ├─→ Stage = Growth/Scale → Diseña experimento (A/B + cohort)
    └─→ Stage = MVP → OMITE (criterios simplificados estado-específicos)
    ↓
generar-prd
    ↓
PRD formal + Criterios Experimentales
    ↓
Loop de procesamiento [GATE]
    ↓
    ├─→ Hay más funcionalidades → Actualizar estado → Seleccionar siguiente → Repite desde evaluar-conectividad-tecnica
    └─→ No hay más funcionalidades → Generar roadmap-state → Consolidate & Summary
    ↓
Generar roadmap.md consolidado del dominio
    ↓
Ready para: planificar-epics (por cada PRD)
```
