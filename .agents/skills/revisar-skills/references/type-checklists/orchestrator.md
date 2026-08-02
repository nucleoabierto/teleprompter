# Orchestrator

Skills que coordinan múltiples pasos o skills hijos con gates entre ellos.

## Checklist requerido

- Workflow overview con diagrama de pasos
- Protocolo de delegación explícito
- Perfiles de delegación por paso
- Gates entre pasos con tabla de decisión
- Handoff block estructurado
- Checklist de orquestador con tracking
- Done when claro

## Checklist recomendado

- Referencias compartidas (workflow-catalog, file-discovery)
- Resume flags para reanudar workflow
- Estrategia de fallo por gate

## Anti-patrones

- Workflow sin gates o gates ambiguos
- Delegación sin handoff estructurado
- Mezcla de orquestación con implementación directa
