# Paso 1: Análisis del Proyecto

## Propósito

Analizar el proyecto para entender su contexto, tecnología y requisitos. Esta información será la base para configurar los agentes de manera precisa.

## Acciones a Realizar

### 1.0 Crear Archivo de Contexto

**Antes de comenzar el análisis:**

- Copiar `context-template.md` a `context.md` en la raíz del proyecto
- Este archivo servirá como memoria compartida entre todos los pasos

```bash
cp .teleprompter/agents-configuration/templates/context-template.md context.md
```

### 1.1 Examinar Archivos Clave

#### README.md

- Leer para entender el propósito y objetivos del proyecto
- Identificar el público objetivo y casos de uso
- Extraer el nombre oficial del proyecto

#### Archivos de Dependencias

- `package.json` (JavaScript/Node.js)
- `pyproject.toml` o `requirements.txt` (Python)
- `Cargo.toml` (Rust)
- `go.mod` (Go)
- Identificar lenguaje principal, versión y framework

#### Estructura de Carpetas

- Analizar `src/`, `lib/`, `app/` o directorios equivalentes
- Identificar patrones arquitectónicos
- Notar archivos de configuración (`.eslintrc`, `pytest.ini`, etc.)

### 1.2 Identificar Información del Proyecto

#### Nombre del Proyecto

- Extraer de README.md o package.json
- Usar el nombre oficial si existe

#### Lenguaje Principal

- Determinar del archivo de dependencias principal
- Notar la versión específica

#### Framework Principal

- React, Vue, Angular (Frontend)
- Express, Django, Spring (Backend)
- Next.js, Nuxt (Full-stack)

#### Dominio del Proyecto

- ecommerce, gestión de inventarios, CRM, educación, etc.
- Basarse en la descripción y funcionalidades

#### Objetivo Principal

- "automatizar procesos de negocio"
- "ayudar a los usuarios a gestionar su dieta"
- "facilitar la comunicación entre equipos"

#### Stakeholders Principales

- Usuarios finales, clientes, equipo de desarrollo, administradores

### 1.3 Analizar Stack Tecnológico

#### Librerías Clave

- Listar las 5-10 dependencias más importantes
- Agrupar por categoría (UI, datos, testing, etc.)

#### Herramientas de Desarrollo

- Linters (ESLint, Prettier, Ruff)
- Testing (Jest, Pytest, JUnit)
- Build tools (Vite, Webpack, Maven)

#### Base de Datos

- PostgreSQL, MongoDB, SQLite, etc.
- ORM/Query builder (Prisma, SQLAlchemy, etc.)

### 1.4 Actualización del Contexto

Al finalizar este paso, actualiza `context.md` con:

#### Información Básica

- Nombre del proyecto: Reemplaza `[PENDIENTE: Nombre del proyecto]`
- Lenguaje Principal: Reemplaza `[PENDIENTE: Lenguaje principal]` y versión
- Framework: Reemplaza `[PENDIENTE: Framework principal]`

#### Dominio y Objetivos

- Dominio: Reemplaza `[PENDIENTE: Dominio del proyecto]`
- Objetivo: Reemplaza `[PENDIENTE: Objetivo principal]`
- Stakeholders: Reemplaza `[PENDIENTE: Lista de stakeholders]`

#### Stack Tecnológico

- Lenguajes y Frameworks: Actualiza la sección correspondiente
- Librerías Clave: Lista las 5-10 librerías más importantes
- Base de Datos: Si aplica, actualiza esta sección

#### Estructura

- Directorios Principales: Lista los directorios principales y su propósito
- Patrón Arquitectónico: Describe el patrón y las capas principales

#### Progreso

- Marca "Paso 1: Análisis del Proyecto" como completado
- Actualiza "Última actualización" con fecha y hora actual
- Actualiza "Paso actual" a "Paso 2: Configuración Base"

### 1.5 Validación

Verifica que:

- [ ] Has creado el archivo `context.md` desde la plantilla
- [ ] Has leído el README.md completamente
- [ ] Has examinado el archivo de dependencias principal
- [ ] Has explorado la estructura de carpetas
- [ ] Has identificado todas las tecnologías clave
- [ ] Has documentado el dominio y objetivos del proyecto
- [ ] Has actualizado `context.md` con toda la información recopilada

## Siguiente Paso

Una vez completado el análisis y actualizado el contexto, continúa con Paso 2: Configuración Base (`02-base-setup.md`).
