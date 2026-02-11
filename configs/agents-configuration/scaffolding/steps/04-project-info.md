# Paso 4: Información del Proyecto

## Propósito

Configurar las secciones técnicas del proyecto en el archivo `AGENTS.md` principal, incluyendo stack tecnológico, arquitectura, comandos y pruebas.

## Acciones a Realizar

### 4.1 Verificar Contexto Existente

**Antes de comenzar:**

- Confirma que `context.md` existe y contiene información de los pasos anteriores
- Lee la información técnica recopilada en el Paso 1
- Verifica la configuración de agentes del Paso 3

**Información a leer del contexto:**

- Stack tecnológico completo (lenguaje, framework, librerías)
- Estructura del proyecto y patrón arquitectónico
- Configuración específica de cada agente

### 4.2 Configurar Stack Tecnológico

**Ubicación:** Sección "Stack Tecnológico" en `AGENTS.md`

**Información requerida:**

- **Lenguaje Principal:** Lenguaje y versión (ej: "TypeScript 5.0")
- **Framework:** Framework principal (ej: "React 18", "Next.js 14")
- **Librerías Clave:** 5-10 librerías importantes del proyecto

**Fuente de datos:**

- `package.json`, `pyproject.toml`, `Cargo.toml`, etc.
- Archivos de configuración del proyecto

### 4.3 Configurar Estructura del Proyecto

**Ubicación:** Sección "Estructura del proyecto" en `AGENTS.md`

**Información requerida:**

- Lista los directorios principales del código fuente
- Describe brevemente el propósito de cada directorio
- Excluye directorios de dependencias (`node_modules`, `dist`, etc.)

**Fuente:** Información del contexto (sección "Estructura del Proyecto")

### 4.4 Configurar Arquitectura General

**Ubicación:** Sección "Arquitectura General" en `AGENTS.md`

**Información requerida:**

- **Patrón Principal:** Patrón arquitectónico (MVC, Hexagonal, Clean, etc.)
- **Capas Principales:** Describe las responsabilidades de cada capa

**Fuente:** Información del contexto (sección "Patrón Arquitectónico")

### 4.5 Configurar Comandos Útiles

**Ubicación:** Sección "Comandos útiles" en `AGENTS.md`

**Información requerida:**

- Comandos principales de desarrollo del proyecto
- Scripts de `package.json`, `Makefile`, etc.

**Comandos típicos:**

- `npm run test` - Ejecutar pruebas
- `npm run lint` - Análisis de código
- `npm run build` - Compilar proyecto
- `npm run dev` - Modo desarrollo

### 4.6 Configurar Pruebas

**Ubicación:** Sección "Pruebas" en `AGENTS.md`

**Framework:**

- Identificar el framework de testing (Jest, Pytest, etc.)
- Incluir la versión si es relevante

**Estrategia:**

- Mantener las reglas base existentes
- Añadir estrategias específicas del proyecto

**Reglas base a mantener:**

- Probar reglas de negocio, no implementación
- Probar solo métodos públicos
- Evitar pruebas acopladas a la implementación
- Agregar pruebas para casos borde
- Maximizar cobertura de testing

### 4.7 Configurar Estilo y Documentación

**Estilo (Sección "Estilo"):**

- **Linter/Formatter Principal:** Herramienta principal (ESLint, Prettier, Ruff)
- **Configuración Base:** Configuración base utilizada
- **Reglas Principales:** 5-10 reglas más importantes
- **Convenciones Generales:** Nomenclatura, tipado, longitud de línea

**Documentación (Sección "Documentación"):**

- **Estilo de Comentarios:** JSDoc, Docstrings, etc.
- **Qué documentar:** Interfaces, funciones complejas, decisiones de diseño
- **Qué NO documentar:** Código obvio, comentarios redundantes
- **Mantenimiento:** Actualizar documentación al modificar funciones

**Fuente:** Revisa archivos de configuración del proyecto

### 4.8 Configurar Selección de Agente

**Ubicación:** Sección "Selección Automática de Agente" en `AGENTS.md`

**Acciones:**

- Revisar y ajustar las reglas de selección según el contexto del proyecto
- Asegurar que las reglas cubran los casos de uso más comunes
- Validar que las palabras clave sean relevantes para el proyecto

**Reglas existentes a revisar:**

- **Product Manager:** estrategia, requisitos, feature, usuario, negocio
- **Developer:** implementar, código, arquitectura, technical, performance
- **Code Reviewer:** review, calidad, mejorar, patrón, seguridad
- **QA:** test, testing, calidad, bug, validar, automatizar

### 4.9 Actualizar Contexto con Información Final

**Al finalizar este paso, actualiza `context.md`:**

**Comandos de Desarrollo:**

- Completa la sección "Comandos de Desarrollo" con los comandos reales del proyecto

**Configuración de Calidad:**

- Completa las secciones de "Testing" y "Estilo y Linting" con información específica

**Progreso:**

- Marca "Paso 4: Información del Proyecto" como completado
- Actualiza "Última actualización" con fecha y hora actual
- Actualiza "Paso actual" a "Paso 5: Limpieza Final"

## Guía de Configuración

### Fuentes de Información

**Para Stack Tecnológico:**

- `package.json` - dependencies y devDependencies
- `pyproject.toml` - dependencies y project metadata
- `Cargo.toml` - dependencies y package information

**Para Comandos:**

- `package.json` - sección "scripts"
- `Makefile` - targets disponibles
- `README.md` - comandos mencionados en documentación

**Para Estilo:**

- `.eslintrc`, `eslint.config.js` - configuración ESLint
- `.prettierrc` - configuración Prettier
- `ruff.toml`, `pyproject.toml` - configuración Ruff/Black

**Para Pruebas:**

- `jest.config.js`, `pytest.ini` - configuración de testing
- `tests/` directorio - estructura de pruebas existente

## Salida Esperada

Al finalizar este paso, deberías tener:

- ✅ **Stack tecnológico** completo y preciso
- ✅ **Estructura del proyecto** bien documentada
- ✅ **Arquitectura** claramente definida
- ✅ **Comandos útiles** actualizados y funcionales
- ✅ **Configuración de pruebas** específica del proyecto
- ✅ **Estilo y documentación** configurados
- ✅ **Reglas de selección de agente** ajustadas

## Validación

Verifica que:

- [ ] El archivo `context.md` existe y contiene información de pasos anteriores
- [ ] El stack tecnológico coincide con las dependencias reales
- [ ] Los comandos funcionan realmente en el proyecto
- [ ] La arquitectura descrita coincide con la estructura real
- [ ] Las configuraciones de estilo/testing son las que usa el proyecto
- [ ] Las reglas de selección de agente son relevantes
- [ ] Has actualizado `context.md` con la información técnica final

## Tips

- **Verifica los comandos:** Ejecuta algunos comandos para confirmar que funcionan
- **Sé específico:** Incluye versiones cuando sea relevante
- **Sé consistente:** Usa la misma terminología que usa el proyecto

## Siguiente Paso

Una vez completada la información del proyecto, continúa con **Paso 5: Limpieza Final** (`05-cleanup.md`).
