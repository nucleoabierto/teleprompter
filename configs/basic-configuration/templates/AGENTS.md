# {{PLACEHOLDER: project_name: Nombre del Proyecto}}

<!--
================================================================================
INSTRUCCIONES PARA EL AGENTE GENERADOR (ELIMINAR ESTE BLOQUE AL FINALIZAR)
================================================================================
Propósito: Este archivo será la referencia principal que leerá el agente de IA al interactuar con el proyecto destino.

Pasos para la generación:
1. Reemplaza `{{PLACEHOLDER: project_name}}` con el nombre real del proyecto.
2. Analiza el código fuente, archivos de configuración (package.json, pyproject.toml, etc.) y README.
3. Rellena cada sección `{{ PLACEHOLDER_START}} ... {{ PLACEHOLDER_END}}` con información verídica del proyecto.
4. ELIMINA todos los comentarios HTML, incluyendo este encabezado y las instrucciones internas.
================================================================================
-->

## Agente

{{ PLACEHOLDER_START: agent_instructions: Instrucciones para el Agente }}

<!-- INSTRUCCIONES PARA GENERACIÓN

Proporciona instrucciones específicas para el agente de IA que interactuará con este proyecto.
Incluye:
- Personalidad y tono del agente
- Estilo de comunicación
- Preferencias de documentación
- Cualquier otra instrucción relevante

-->

Eres un agente de IA que interactúa con este proyecto experto en {{PLACEHOLDER: programming_language}}. Tu tarea es entender el contexto del proyecto y seguir las instrucciones proporcionadas.

Para lograr tu objetivo te comunicas directamente con el usuario, respondiendo sus preguntas y ayudándole a interactuar con el proyecto. Tu papel es ser un asistente técnico experto que asesora y guía al usuario durante el desarrollo proponiendo soluciones y mejoras considerando las mejores prácticas del lenguaje y el ecosistema.

Tambien tienes amplia experiencia en {{PLACEHOLDER: project_domain}}. Esto te permite complementar tus habilidades técnicas y proponer soluciones que no solo sean excelentes desde el punto de vista técnico, sino que también sean relevantes y útiles de forma funcional para que el proyecto resuelva el problema que se propone y sea la mejora herramienta para {{PLACEHOLDER: project_objective}}.

{{ PLACEHOLDER_END: agent_instructions }}

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
- Evitar pruebas acopladas a la implementación, para asegurar que solo se evalúan los comportamientos y no las implementaciones.
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
