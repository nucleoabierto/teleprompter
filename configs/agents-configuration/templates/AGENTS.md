# {{PLACEHOLDER: project_name: Nombre del Proyecto}}

<!--
================================================================================
INSTRUCCIONES PARA EL AGENTE GENERADOR (ELIMINAR ESTE BLOQUE AL FINALIZAR)
================================================================================
Propósito: Este archivo define 4 agentes especializados en archivos independientes que 
serán seleccionados automáticamente según la naturaleza de la solicitud del usuario.

Pasos para la generación:
1. Reemplaza `{{PLACEHOLDER: project_name}}` con el nombre real del proyecto.
2. Analiza el código fuente, archivos de configuración (package.json, pyproject.toml, etc.) y README.
3. Genera los 4 archivos individuales de agentes desde templates/agents/
4. Configura cada agente con sus placeholders específicos.
5. Ajusta las reglas de selección automática según el contexto del proyecto.
6. ELIMINA todos los comentarios HTML, incluyendo este encabezado y las instrucciones internas.
================================================================================
-->

## Agentes Disponibles

Este proyecto cuenta con 4 agentes especializados, cada uno diseñado para manejar diferentes tipos de solicitudes:

### 🎯 Product Manager

Especializado en estrategia del producto, requisitos de usuario y visión de negocio.
**Archivo:** `agents/product-manager.md`

### 💻 Developer  

Especializado en implementación técnica, arquitectura y desarrollo de código.
**Archivo:** `agents/developer.md`

### 🔍 Code Reviewer

Especializado en calidad de código, mejores prácticas y revisión técnica.
**Archivo:** `agents/code-reviewer.md`

### 🧪 QA

Especializado en testing, calidad y validación de funcionalidades.
**Archivo:** `agents/qa.md`

---

## Selección Automática de Agente

{{ PLACEHOLDER_START: agent_selection_rules: Reglas de Selección de Agente }}

<!-- INSTRUCCIONES PARA GENERACIÓN

Define las reglas para seleccionar automáticamente el agente más adecuado según la solicitud.
Estas reglas deben basarse en palabras clave, patrones y el contexto de la petición del usuario.

-->

### Reglas de Selección

**Seleccionar Product Manager cuando la solicitud incluye:**

- Palabras clave: "estrategia", "requisitos", "feature", "usuario", "negocio", "prioridad", "roadmap", "stakeholders", "métricas", "product"
- Contexto: Definición de funcionalidades, análisis de negocio, priorización de tareas
- Ejemplos: "¿Qué feature deberíamos construir?", "¿Cómo priorizamos estos requisitos?", "¿Qué métricas deberíamos seguir?"

**Seleccionar Developer cuando la solicitud incluye:**

- Palabras clave: "implementar", "código", "desarrollar", "arquitectura", "technical", "performance", "optimizar", "refactor", "api", "database"
- Contexto: Implementación técnica, arquitectura, optimización de código
- Ejemplos: "¿Cómo implementamos esta API?", "¿Cuál es la mejor arquitectura para esto?", "Optimiza este código"

**Seleccionar Code Reviewer cuando la solicitud incluye:**

- Palabras clave: "review", "calidad", "mejorar", "refactorizar", "clean code", "patrón", "seguridad", "mejores prácticas", "feedback"
- Contexto: Revisión de código existente, mejoras de calidad, sugerencias técnicas
- Ejemplos: "Review este código", "¿Cómo podemos mejorar esto?", "¿Sigue las mejores prácticas?"

**Seleccionar QA cuando la solicitud incluye:**

- Palabras clave: "test", "testing", "calidad", "bug", "error", "validar", "automatizar", "e2e", "unit test", "coverage"
- Contexto: Testing, calidad, validación de funcionalidades, automatización
- Ejemplos: "¿Cómo testeamos esto?", "¿Qué pruebas necesitamos?", "¿Hay bugs en este código?"

### Proceso de Selección

1. **Analizar la solicitud** del usuario en busca de palabras clave y patrones
2. **Evaluar el contexto** y tipo de trabajo requerido
3. **Seleccionar el agente** con mayor coincidencia según las reglas
4. **Informar al usuario** qué agente ha sido seleccionado y por qué

{{ PLACEHOLDER_END: agent_selection_rules }}

---

## Referencia Rápida

### Stack Tecnológico

{{ PLACEHOLDER_START: project_stack: Stack Tecnológico }}

<!-- INSTRUCCIONES PARA GENERACIÓN

Revisa los archivos de dependencias (package.json, pyproject.toml, go.mod, etc.) y lista las tecnologías principales:
- Lenguaje(s) principal(es) y versión
- Framework principal
- Herramientas clave (bundlers, ORMs, etc.)

-->
- **Lenguaje Principal:** [Lenguaje] <!-- Ej: TypeScript 5.0 -->
- **Framework:** [Framework] <!-- Ej: React 18 / Next.js 14 -->
- **Librerías Clave:**
  - [Librería 1] <!-- Ej: TailwindCSS -->
  - [Librería 2] <!-- Ej: Prisma -->

{{ PLACEHOLDER_END: project_stack }}

### Estructura del proyecto

{{ PLACEHOLDER_START: project_structure: Estructura del Proyecto }}
<!-- INSTRUCCIONES PARA GENERACIÓN
Enumera los directorios principales del código fuente y describe brevemente su propósito.
Ignora directorios de dependencias o compilación (ej. node_modules, dist).

En el ejemplo se usa una lista de directorios, pero puedes adaptarlo a una estructura de árbol si es más compleja.

-->

- `[directorio/]` <!-- Ej: src/components --> - [Propósito] <!-- Ej: Componentes UI reutilizables -->
- `[directorio/]` <!-- Ej: src/utils --> - [Propósito] <!-- Ej: Funciones auxiliares y helpers -->

{{ PLACEHOLDER_END: project_structure }}

### Arquitectura General

{{ PLACEHOLDER_START: project_architecture: Arquitectura del Proyecto }}
<!-- INSTRUCCIONES PARA GENERACIÓN

Describe brevemente el patrón arquitectónico principal (MVC, Hexagonal, Clean Architecture, etc.)
y las responsabilidades de cada capa.

-->

- **Patrón Principal:** [Patrón] <!-- Ej: Clean Architecture -->
- **Capas Principales:**
  - `[Capa 1]`: [Responsabilidad] <!-- Ej: src/domain - Lógica de negocio y entidades puras -->
  - `[Capa 2]`: [Responsabilidad] <!-- Ej: src/application - Casos de uso y orquestación -->
  - `[Capa 3]`: [Responsabilidad] <!-- Ej: src/infrastructure - Implementaciones de bases de datos y APIs externas -->

{{ PLACEHOLDER_END: project_architecture }}

### Comandos útiles

{{ PLACEHOLDER_START: project_commands: Comandos del Proyecto }}
<!-- INSTRUCCIONES PARA GENERACIÓN
Extrae los comandos principales de desarrollo (test, lint, build, dev) y reemplaza la lista.
-->

- `[comando]` <!-- ej: npm run test --> - [Descripción]
- `[comando]` <!-- ej: npm run lint --> - [Descripción]

{{ PLACEHOLDER_END: project_commands }}

### Pruebas

{{ PLACEHOLDER_START: project_tests: Pruebas del Proyecto }}
<!-- INSTRUCCIONES PARA GENERACIÓN
Identifica el framework de pruebas utilizado y describe brevemente la estrategia de testing preferida.
-->

#### Framework

- **Framework**: [Framework de testing] <!-- Ej: "pytest" o "jest" -->
- **Versión**: [Versión] <!-- Ej: "7.4" o "N/A" -->

#### Estrategia

<!-- INSTRUCCIONES PARA GENERACIÓN
Describe la estrategia de pruebas real del proyecto y asegúrate de mantener las siguientes reglas base:
-->

- Probar usando una estrategia que ejercite las reglas de negocio, para asegurar que el comportamiento esperado se mantenga independientemente de cómo se implemente.
- Probar solo métodos públicos, para verificar que el comportamiento esperado se mantiene independientemente de cómo se implemente.
- Evitar pruebas acopladas a la implementación, para asegurar que solo se evalúen los comportamientos y no las implementaciones.
- Agregar pruebas para casos borde, para asegurar que el comportamiento se mantenga en límites extremos.
- Maximizar la cobertura de testing, para asegurar que el código se ha probado en todas sus posibles rutas.
- [Custom rule 1] <!-- Ej: Mantener una estructura de pirámide de pruebas (unitarias, de integración y end-to-end) -->
- [Custom rule 2] <!-- Ej: Usa nombres descriptivos en las pruebas -->

{{ PLACEHOLDER_END: project_tests }}

### Estilo

{{ PLACEHOLDER_START: project_style: Estilo del Proyecto }}
<!-- INSTRUCCIONES PARA GENERACIÓN
Revisa los archivos de configuración de estilo y extrae las reglas principales.

Fuentes a revisar (según el lenguaje):
- JavaScript/TypeScript: .eslintrc, eslint.config.js, .prettierrc, package.json (pretier config)
- Python: ruff.toml, pyproject.toml (secciones [tool.ruff], [tool.black], [tool.isort])
- Go: .golangci.yml, go.mod
- Rust: .rustfmt.toml, clippy.toml

Analiza y extrae:
1. Herramienta principal de linting/formateo
2. Configuración base (extends, inherits, preset)
3. Reglas específicas importantes (5-10 reglas más relevantes)
4. Convenciones de nomenclatura y estilo
-->

- **Linter/Formatter Principal:** [Herramienta] <!-- Ej: ESLint + Prettier, Ruff, gofmt -->
- **Configuración Base:** [Configuración] <!-- Ej: @nucleoabierto/eslint-config-cardinal, ruff linter -->
- **Reglas Principales:**
  - [Regla 1] <!-- Ej: secure-coding/no-hardcoded-credentials: error -->
  - [Regla 2] <!-- Ej: @typescript-eslint/no-unused-vars: error -->
  - [Regla 3] <!-- Ej: import-x/order: warn -->
  - [Regla 4] <!-- Ej: prefer-const: error -->
  - [Regla 5] <!-- Ej: max-len: 120 -->
- **Convenciones Generales:**
  - Nomenclatura de variables/funciones: [Convención] <!-- Ej: camelCase, snake_case -->
  - Nomenclatura de clases/interfaces: [Convención] <!-- Ej: PascalCase, CamelCase -->
  - Tipado: Siempre usar tipos explícitos y evitar el uso de `any` (si aplica).
  - Longitud de línea: [Máximo] <!-- Ej: 120 caracteres -->

{{ PLACEHOLDER_END: project_style }}

### Documentación

{{ PLACEHOLDER_START: project_documentation: Documentación del Proyecto }}
<!-- INSTRUCCIONES PARA GENERACIÓN
Establece las reglas sobre cómo se debe documentar el código en este proyecto.
-->

- **Estilo de Comentarios:** [Estilo] <!-- Ej: JSDoc, Docstrings (Google/NumPy), YARD -->
- **Qué documentar:**
  - Interfaces y Tipos públicos.
  - Funciones complejas o métodos públicos (propósito, parámetros, valor de retorno).
  - Casos borde o decisiones de diseño poco intuitivas ("el porqué", no "el qué").
- **Qué NO documentar:**
  - Código obvio o autodescriptivo.
  - No generar comentarios redundantes tipo `// suma a y b` para `function sum(a, b)`.
- **Mantenimiento:** Al modificar una función, actualizar *siempre* su documentación asociada.

{{ PLACEHOLDER_END: project_documentation }}
