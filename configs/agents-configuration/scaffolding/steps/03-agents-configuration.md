# Paso 3: Configuración de Agentes

## Propósito

Generar y configurar los 4 archivos individuales de agentes con sus personalidades, especializaciones y placeholders específicos.

## Acciones a Realizar

### 3.1 Verificar Contexto Existente

**Antes de comenzar:**

- Confirma que `context.md` existe y contiene la información del Paso 1
- Lee la información básica del proyecto desde el contexto

**Información a leer del contexto:**

- Nombre del proyecto, lenguaje principal, framework
- Dominio, objetivos, stakeholders
- Stack tecnológico y estructura

### 3.2 Generar Archivos de Agentes

- Copiar cada archivo desde `.teleprompter/agents-configuration/templates/agents/` a `agents/` (raíz)
- Archivos a generar:
  - `agents/product-manager.md`
  - `agents/developer.md`
  - `agents/code-reviewer.md`
  - `agents/qa.md`

### 3.3 Configurar Product Manager

Archivo: `agents/product-manager.md`

Reemplazos requeridos (usar información de `context.md`):

- `{{PLACEHOLDER: programming_language}}` → lenguaje principal del proyecto
- `{{PLACEHOLDER: project_domain}}` → dominio/área del proyecto
- `{{PLACEHOLDER: project_objective}}` → objetivo principal del proyecto
- `{{PLACEHOLDER: stakeholders}}` → stakeholders principales

Secciones adicionales:

- `{{PLACEHOLDER: tools_methodologies}}` → herramientas y metodologías PM
- `{{PLACEHOLDER: team_integration}}` → integración con el equipo

### 3.4 Configurar Developer

Archivo: `agents/developer.md`

Reemplazos requeridos (usar información de `context.md`):

- `{{PLACEHOLDER: programming_language}}` → lenguaje principal del proyecto
- `{{PLACEHOLDER: project_domain}}` → dominio/área del proyecto
- `{{PLACEHOLDER: technical_focus}}` → foco técnico principal

Secciones adicionales:

- `{{PLACEHOLDER: tech_stack}}` → stack tecnológico del developer
- `{{PLACEHOLDER: patterns_architecture}}` → patrones y arquitecturas
- `{{PLACEHOLDER: team_integration}}` → integración con el equipo

### 3.5 Configurar Code Reviewer

Archivo: `agents/code-reviewer.md`

Reemplazos requeridos (usar información de `context.md`):

- `{{PLACEHOLDER: programming_language}}` → lenguaje principal del proyecto
- `{{PLACEHOLDER: code_quality_focus}}` → estándares de calidad
- `{{PLACEHOLDER: code_best_practices}}` → mejores prácticas de código

Secciones adicionales:

**Bloques a configurar:**

- `{{ PLACEHOLDER_START: reviewer_evaluation_criteria }}` → criterios de evaluación
- `{{ PLACEHOLDER_START: patterns_anti_patterns }}` → patrones y anti-patrones

### 3.6 Configurar QA

Archivo: `agents/qa.md`

Reemplazos requeridos (usar información de `context.md`):

- `{{PLACEHOLDER: programming_language}}` → lenguaje principal del proyecto
- `{{PLACEHOLDER: project_domain}}` → dominio/área del proyecto
- `{{PLACEHOLDER: automation_tools}}` → herramientas de automatización

Secciones adicionales:

**Bloques a configurar:**

- `{{ PLACEHOLDER_START: qa_tools_technologies }}` → herramientas y tecnologías
- `{{ PLACEHOLDER_START: qa_methodologies }}` → metodologías de testing
- `{{ PLACEHOLDER_START: qa_metrics_kpis }}` → métricas y KPIs
- `{{ PLACEHOLDER_START: qa_team_integration }}` → integración con el equipo

### 3.7 Actualizar Contexto con Configuración de Agentes

**Al finalizar la configuración de todos los agentes, actualiza `context.md`:**

**Configuración Específica de Agentes:**

- Completa todos los campos `[PENDIENTE]` en la sección "Configuración Específica de Agentes"
- Usa la información recopilada y las decisiones tomadas durante este paso

**Progreso:**

- Marca "Paso 3: Configuración de Agentes" como completado
- Actualiza "Última actualización" con fecha y hora actual
- Actualiza "Paso actual" a "Paso 4: Información del Proyecto"

**Archivos Generados:**

- Marca los 4 archivos de agentes como generados en la sección "Archivos Generados"

## Guía de Configuración

### Información Común para Todos los Agentes

**Lenguaje Principal:**

- Usa el lenguaje identificado en el Paso 1
- Incluye la versión si es relevante (ej: "TypeScript 5.0")

**Dominio del Proyecto:**

- Usa el dominio específico (ej: "ecommerce", "gestión de inventarios")
- Sé específico y descriptivo

### Especificaciones por Rol

Product Manager:

- Stakeholders: Lista los principales (usuarios, clientes, equipo)
- Objetivo: Describe el propósito principal del proyecto
- Metodologías: Scrum, Kanban, Lean, etc.

Developer:

- Focus Técnico: backend, frontend, fullstack, mobile, etc.
- Stack: Incluye frameworks, librerías, herramientas
- Patrones: SOLID, DDD, Clean Architecture, etc.

Code Reviewer:

- Calidad: clean code, patrones de diseño, mejores prácticas
- Seguridad: OWASP, validación de inputs, etc.
- Herramientas: SonarQube, ESLint, análisis estático

QA:

- Testing Types: unitario, integración, E2E, rendimiento
- Herramientas: Jest, Cypress, Playwright, etc.
- Métricas: cobertura, defect density, etc.

## Salida Esperada

Al finalizar este paso, deberías tener:

- 4 archivos de agentes en el directorio `agents/`
- Todos los placeholders reemplazados con información real
- Personalidades específicas para cada rol
- Secciones especializadas configuradas

## Validación

Verifica que:

- [ ] El archivo `context.md` existe y contiene la información del Paso 1
- [ ] Los 4 archivos existen en `agents/`
- [ ] No quedan placeholders `{{PLACEHOLDER...}}` sin reemplazar
- [ ] La información es consistente entre todos los agentes
- [ ] Cada agente tiene su personalidad distintiva
- [ ] Las secciones adicionales están configuradas
- [ ] Has actualizado `context.md` con la configuración específica de agentes
- [ ] Has marcado el progreso y archivos generados en `context.md`

## Tips

- Sé consistente: Usa la misma información base en todos los agentes
- Específico: Detalla las herramientas y metodologías reales del proyecto
- Revisa: Confirma que cada agente tenga su enfoque único

## Siguiente Paso

Una vez configurados los agentes, continúa con **Paso 4: Información del Proyecto** (`04-project-info.md`).
