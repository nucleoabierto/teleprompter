---
name: evaluar-conectividad-epic
description: >-
  Evalúa prerequisitos técnicos y conectividad de un epic específico con el
  codebase actual. Genera assessment de prerequisitos y bridge roadmap cuando
  el epic está desconectado. Úsalo después de seleccionar un epic del plan de
  epics y antes de dividir el epic en tareas. No lo usas para evaluar
  conectividad de funcionalidades (usar evaluar-conectividad-tecnica) ni para
  validar viabilidad técnica (usar validar-viabilidad-tecnica).
---

# Evaluar Conectividad Epic

Evalúa prerequisitos técnicos y conectividad de un epic específico con el codebase actual. Genera assessment de prerequisitos y bridge roadmap cuando el epic está desconectado. Úsalo después de seleccionar un epic del plan de epics y antes de dividir el epic en tareas. No lo usas para evaluar conectividad de funcionalidades (usar evaluar-conectividad-tecnica) ni para validar viabilidad técnica (usar validar-viabilidad-tecnica).

## Input

- Ruta al documento de plan de epics: `docs/<domain>/initiatives/<PRD-SLUG>/epics/epic-plan.md`
- Epic seleccionado (slug o ID)
- (Opcional) Contexto técnico adicional: stack actual, arquitectura existente

## Output

- Assessment de prerequisitos: `docs/<domain>/initiatives/<PRD-SLUG>/epics/<EPIC-SLUG>/prerequisites-assessment.md` con:
  - Análisis de prerequisitos existentes vs requeridos
  - Veredicto: Conectado vs Desconectado
  - Lista de prerequisitos faltantes
- Bridge roadmap (si aplica): `docs/<domain>/initiatives/<PRD-SLUG>/epics/<EPIC-SLUG>/bridge-roadmap.md` con:
  - Features puente para construir infraestructura necesaria
  - Secuencia de implementación
  - Estimaciones por feature puente
  - `Ready for: dividir-epic` (si conectado) o `Ready for: implementar-bridge` (si desconectado)

## Fases

### Fase A: Analizar epic seleccionado
- Leer `docs/<domain>/initiatives/<PRD-SLUG>/epics/epic-plan.md`
- Extraer detalles del epic seleccionado: AC, alcance, dependencias
- Identificar requisitos técnicos implícitos: auth, DB, APIs, servicios, frontend, monitoring
- Mapear contexto técnico adicional si provisto

### Fase B: Analizar codebase actual
- Explorar el codebase para identificar infraestructura existente:
  - **Auth**: ¿Sistema de autenticación existe? ¿OAuth, JWT, session-based?
  - **DB**: ¿Qué DBs existen? ¿PostgreSQL, MongoDB, Redis? ¿Esquemas actuales?
  - **APIs**: ¿Qué APIs existen? ¿REST, GraphQL, gRPC? ¿Endpoints relevantes?
  - **Servicios**: ¿Qué microservicios o módulos existen? ¿Monolith vs distributed?
  - **Frontend**: ¿Qué framework? ¿React, Vue, Angular? ¿State management?
  - **Monitoring**: ¿Hay logging, metrics, tracing? ¿Prometheus, Grafana, ELK?
  - **Infraestructura**: ¿Cloud provider? ¿AWS, GCP, Azure? ¿Kubernetes, serverless?

### Fase C: Comparar prerequisitos vs existentes
Para cada requisito técnico del epic:
- Verificar si existe en el codebase
- Si existe, evaluar si es suficiente para el epic (capacidad, escalabilidad, features)
- Si no existe, marcar como prerequisito faltante
- Si existe pero es insuficiente, marcar como prerequisito a mejorar

### Fase D: Generar veredicto de conectividad
- **Conectado**: Todos los prerequisitos existen y son suficientes
- **Parcialmente conectado**: La mayoría de prerequisitos existen, algunos faltantes o insuficientes
- **Desconectado**: Infraestructura crítica faltante (ej: no hay DB, no hay sistema de auth)

### Fase E: Generar bridge roadmap (si desconectado)
Si el epic está desconectado o parcialmente conectado:
- Identificar features puente necesarias para construir prerequisitos faltantes
- Para cada feature puente:
  - Definir alcance y AC
  - Estimar esfuerzo (1-8 puntos)
  - Identificar dependencias con otras features puente
- Secuenciar features puente en orden lógico
- Generar `docs/<domain>/initiatives/<PRD-SLUG>/epics/<EPIC-SLUG>/bridge-roadmap.md` con:
  - Lista de features puente con estimaciones
  - Secuencia de implementación
  - Timeline sugerido
  - Trade-offs (¿implementar bridge vs cambiar arquitectura del epic?)
  - `Ready for: implementar-bridge`

### Fase F: Escribir assessment de prerequisitos
Generar `docs/<domain>/initiatives/<PRD-SLUG>/epics/<EPIC-SLUG>/prerequisites-assessment.md` con:
- Resumen del epic y sus requisitos técnicos
- Análisis de infraestructura existente
- Matriz de prerequisitos vs existentes
- Veredicto de conectividad (Conectado/Parcialmente conectado/Desconectado)
- Lista de prerequisitos faltantes o insuficientes
- Recomendación: proceder a dividir-epic (si conectado) o implementar bridge roadmap (si desconectado)
- `Ready for: dividir-epic` o `Ready for: implementar-bridge`

## Referencias

- `evaluar-conectividad-tecnica/SKILL.md` - Skill similar para funcionalidades
- `evaluar-conectividad-tecnica/assets/prerequisites-assessment-template.md` - Template para assessment
- `evaluar-conectividad-tecnica/assets/bridge-roadmap-template.md` - Template para bridge roadmap
- `_shared/infrastructure-analysis-table.md` - Template para análisis de infraestructura

## Autoevaluación

- ¿Analizaste todos los prerequisitos técnicos del epic?
- ¿Exploraste el codebase para identificar infraestructura existente?
- ¿Comparaste prerequisitos vs existentes sistemáticamente?
- ¿Generaste veredicto claro de conectividad?
- ¿Si está desconectado, generaste bridge roadmap con features puente secuenciadas?
- ¿El assessment tiene `Ready for: dividir-epic` o `Ready for: implementar-bridge`?
