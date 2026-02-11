# 🎬 Teleprompter

> Un CLI ágil para estandarizar y compartir configuraciones de agentes de IA entre tus proyectos.

Teleprompter elimina la necesidad de copiar y pegar manualmente "prompts", plantillas y flujos de trabajo cada vez que inicias un nuevo proyecto con agentes de Inteligencia Artificial. Con un solo comando, puedes inicializar tu entorno de IA a partir de configuraciones locales o repositorios remotos en GitHub.

## ✨ Características

- 🚀 **Inicialización rápida:** Configura tu proyecto en segundos.
- 📦 **Soporte para GitHub:** Descarga configuraciones directamente desde cualquier repositorio público (`owner/repo`).
- 🛠️ **Estructura estandarizada:** Mantén tus `templates`, `scaffolding` y metadatos organizados de forma predecible.
- 🔍 **Descubrimiento:** Lista y filtra configuraciones disponibles fácilmente.
- ⚡ **Sin dependencias globales:** Ejecútalo directamente con `npx`.

## 🚀 Instalación y Uso

No es necesario instalar el paquete de forma global. Puedes ejecutarlo directamente usando `npx` (requiere Node.js >= 22.0.0):

### 1. Inicializar una configuración

**Usar la configuración básica por defecto:**

```bash
npx teleprompter
```

**Usar una configuración desde GitHub:**

```bash
npx teleprompter usuario/repositorio
```

### 2. Explorar y gestionar

**Listar configuraciones disponibles:**

```bash
npx teleprompter list
npx teleprompter list --criteria
```

**Mostrar instrucciones de uso (Bootstrap):**

```bash
npx teleprompter bootstrap
```

## ⚙️ Opciones del CLI

| Opción            | Descripción                                           | Ejemplo                                   |
|-------------------|-------------------------------------------------------|-------------------------------------------|
| `--dir <ruta>`    | Especifica el directorio base del proyecto.           | `npx teleprompter --dir ./mi-app`         |
| `--force`         | Sobrescribe la configuración existente sin preguntar. | `npx teleprompter --force`                |
| `--branch <rama>` | Rama del repositorio de GitHub (por defecto: `main`). | `npx teleprompter user/repo --branch dev` |

## 📁 Estructura de la Configuración

Cuando inicializas Teleprompter, los archivos se copian al directorio `.teleprompter/<nombre-configuracion>/` en tu proyecto. Una configuración estándar tiene la siguiente estructura:

```text
<nombre-configuracion>/
├── script.yaml          # Metadatos (nombre, descripción, criterios de uso)
├── templates/           # Plantillas de texto/código que el agente consumirá
└── scaffolding/         # Flujos de trabajo y pasos que el agente debe seguir
```

### Ejemplo de `script.yaml`

Este archivo define el comportamiento y propósito de la configuración:

```yaml
name: Basic Configuration
description: Configuración mínima para empezar con agentes.
bootstrap: |
  Ejecuta los workflows en .teleprompter/basic-configuration/scaffolding/
  y revisa las plantillas en templates/.
criteria:
  - usar cuando se requiere una configuración básica
```

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
