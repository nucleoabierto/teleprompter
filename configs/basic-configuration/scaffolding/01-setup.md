# Paso 1: Generación de AGENTS.md

## Propósito

Generar el archivo `AGENTS.md` en la raíz del proyecto a partir de la plantilla `.teleprompter/basic-configuration/templates/AGENTS.md`. Este archivo será la referencia principal para agentes de IA que interactúen con el repositorio.

## Procedimiento

Ejecuta estos pasos secuencialmente. Cada paso depende del anterior.

### 1. Análisis del Proyecto

- **Entrada:** `README.md`, archivos de dependencias (`package.json`, `pyproject.toml`, etc.), estructura de carpetas
- **Salida:** Identificación de nombre del proyecto, lenguaje principal, framework, librerías clave

### 2. Creación Base

- **Acción:** Copiar contenido de `.teleprompter/basic-configuration/templates/AGENTS.md` a `AGENTS.md` (raíz)
- **Reemplazo:** `{{PLACEHOLDER: project_name}}` → nombre real del proyecto

### 3. Configuración del Agente

- **Ubicación:** Sección "Agente"
- **Reemplazos requeridos:**
  - `{{PLACEHOLDER: programming_language}}` → lenguaje principal del proyecto
  - `{{PLACEHOLDER: project_domain}}` → dominio/área del proyecto (ej: "ecommerce", "gestion de inventarios", "gestion de clientes", "registro de dieta")
  - `{{PLACEHOLDER: project_objective}}` → objetivo principal del proyecto (ej: "automatizar procesos", "ayudar a los usuarios a gestionar su dieta y su ingesta calórica")
- **Personalización:** Ajustar el tono y personalidad del agente según las preferencias del proyecto

### 4. Stack Tecnológico

- **Ubicación:** Sección "Stack Tecnológico"
- **Datos requeridos:** Lenguaje principal + versión, framework, librerías principales
- **Fuente:** Archivos de dependencias del paso 1

### 5. Estructura y Arquitectura

- **Ubicación:** Secciones "Estructura del proyecto" y "Arquitectura General"
- **Estructura:** Lista directorios principales (excluir `node_modules`, `dist`, etc.)
- **Arquitectura:** Identificar patrón (MVC, Hexagonal, Clean, etc.) basado en estructura

### 6. Comandos de Desarrollo

- **Ubicación:** Sección "Comandos útiles"
- **Fuente:** Scripts en archivos de configuración
- **Comandos requeridos:** test, lint, format, type-check
- **Acción:** Reemplazar placeholders con comandos reales

### 7. Configuración de Pruebas

- **Ubicación:** Sección "Pruebas"
- **Framework:** Identificar (Jest, Pytest, etc.) y versión
- **Estrategia:** Mantener reglas fijas + añadir estrategias específicas del proyecto

### 8. Estilo y Documentación

- **Ubicación:** Secciones "Estilo" y "Documentación"
- **Fuentes:** `.eslintrc`, `eslint.config.js`, `.prettierrc`, `ruff.toml`, `flake8`, `pyproject.toml` (sección [tool.ruff], [tool.black], etc.)
- **Datos:** Linter/formatter, convenciones de nomenclatura, formato de comentarios
- **Análisis de reglas:**
  - Para ESLint: Identificar configuración base (`extends`, `rules`) y reglas específicas del proyecto
  - Para Prettier: Extraer configuración de `.prettierrc` o sección en `package.json`
  - Para Python: Revisar `ruff.toml` o sección `[tool.ruff]` en `pyproject.toml`
  - Listar las 5-10 reglas más importantes o características distintivas

### 9. Limpieza Final

- **Eliminar:** Bloque "INSTRUCCIONES PARA EL AGENTE GENERADOR" (inicio del archivo)
- **Eliminar:** Todos los comentarios HTML `<!-- INSTRUCCIONES PARA GENERACIÓN ... -->`
- **Eliminar:** Todas las etiquetas `{{ PLACEHOLDER_START ... }}` y `{{ PLACEHOLDER_END ... }}`

## Validación

Verifica que se cumplen todos los criterios:

- [ ] `AGENTS.md` existe en raíz del proyecto
- [ ] Sección "Agente" completada con placeholders reemplazados
- [ ] No quedan placeholders `{{PLACEHOLDER...}}`
- [ ] No quedan comentarios HTML `<!-- ... -->`
- [ ] Comandos coinciden con `package.json` (u homólogo)
- [ ] Stack tecnológico coincide con dependencias instaladas

## Directiva de Consulta

**Si existe ambigüedad en cualquier sección (patrón arquitectónico, framework de testing, estructura, etc.), solicita aclaración al usuario antes de continuar.** La precisión del archivo `AGENTS.md` es crítica para el funcionamiento correcto de los agentes.
