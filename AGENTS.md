# Teleprompter

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

### Reglas de Selección

**Seleccionar Product Manager cuando la solicitud incluye:**

- Palabras clave: "estrategia", "requisitos", "feature", "usuario", "negocio", "prioridad", "roadmap", "stakeholders", "métricas", "product"
- Contexto: Definición de funcionalidades, análisis de negocio, priorización de tareas
- Ejemplos: "¿Qué feature deberíamos construir?", "¿Cómo priorizamos estos requisitos?", "¿Qué métricas deberíamos seguir?"

**Seleccionar Developer cuando la solicitud incluye:**

- Palabras clave: "implementar", "código", "desarrollar", "arquitectura", "technical", "performance", "optimizar", "refactor", "api", "database", "cli"
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

---

## Referencia Rápida

### Stack Tecnológico

- **Lenguaje Principal:** TypeScript 5.9.3
- **Framework:** Node.js CLI Tool
- **Librerías Clave:**
  - Commander.js ^14.0.3 - Manejo de comandos CLI
  - Chalk ^5.6.2 - Colores en terminal
  - fs-extra ^11.3.3 - Operaciones de sistema de archivos mejoradas
  - YAML ^2.8.2 - Parseo de archivos YAML
  - tar ^7.5.7 - Manejo de archivos tar

### Estructura del proyecto

- `src/` - Código fuente principal del proyecto
- `src/commands/` - Comandos CLI (bootstrap, list, etc.)
- `src/core/` - Lógica central (detector, downloader, installer)
- `src/utils/` - Utilidades compartidas (cache, errors, github)
- `tests/` - Tests unitarios y de integración
- `configs/` - Configuraciones base y de agentes incluidas
- `bin/` - Punto de entrada CLI

### Arquitectura General

- **Patrón Principal:** Arquitectura modular con separación de responsabilidades
- **Capas Principales:**
  - `Comandos`: Interfaz de usuario y parsing de argumentos
  - `Core`: Lógica de negocio principal
  - `Utils`: Funciones auxiliares y helpers
  - `Tests`: Suite de pruebas organizada por módulos

### Comandos útiles

- `npm run build` - Compila TypeScript y copia configuraciones
- `npm test` - Ejecuta todos los tests con Node.js test runner
- `npm run test:unit` - Ejecuta tests unitarios
- `npm run test:coverage` - Ejecuta tests con cobertura (c8)
- `npm run test:watch` - Ejecuta tests en modo watch
- `npm run lint` - Análisis de código con ESLint
- `npm run lint:fix` - Corrige problemas de linting automáticamente
- `npm run typecheck` - Verifica tipos sin emitir archivos
- `npm run typedoc` - Genera documentación TypeDoc

### Pruebas

#### Framework

- **Framework**: Node.js Test Runner (nativo)
- **Versión**: Incluido en Node.js >= 22.0.0

#### Estrategia

- Probar usando una estrategia que ejercite las reglas de negocio, para asegurar que el comportamiento esperado se mantenga independientemente de cómo se implemente.
- Probar solo métodos públicos, para verificar que el comportamiento esperado se mantiene independientemente de cómo se implemente.
- Evitar pruebas acopladas a la implementación, para asegurar que solo se evalúen los comportamientos y no las implementaciones.
- Agregar pruebas para casos borde, para asegurar que el comportamiento se mantenga en límites extremos.
- Maximizar la cobertura de testing, para asegurar que el código se ha probado en todas sus posibles rutas.
- Mantener tests organizados por módulos siguiendo la estructura src/

### Estilo

- **Linter/Formatter Principal:** ESLint con @nucleoabierto/eslint-config-cardinal
- **Configuración Base:** @nucleoabierto/eslint-config-cardinal
- **Reglas Principales:**
  - secure-coding/no-hardcoded-credentials: error
  - @typescript-eslint/no-unused-vars: error
  - import-x/order: warn
  - prefer-const: error
  - max-len: 120
- **Convenciones Generales:**
  - Nomenclatura de variables/funciones: camelCase
  - Nomenclatura de clases/interfaces: PascalCase
  - Tipado: Siempre usar tipos explícitos y evitar el uso de `any`.
  - Longitud de línea: 120 caracteres

### Documentación

- **Estilo de Comentarios:** JSDoc para funciones y métodos públicos
- **Qué documentar:**
  - Interfaces y Tipos públicos.
  - Funciones complejas o métodos públicos (propósito, parámetros, valor de retorno).
  - Casos borde o decisiones de diseño poco intuitivas ("el porqué", no "el qué").
- **Qué NO documentar:**
  - Código obvio o autodescriptivo.
  - No generar comentarios redundantes tipo `// suma a y b` para `function sum(a, b)`.
- **Mantenimiento:** Al modificar una función, actualizar *siempre* su documentación asociada.
