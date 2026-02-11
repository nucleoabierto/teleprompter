# Generación de Configuración Multi-Agente

## Propósito

Este proceso genera una configuración completa de 4 agentes especializados para tu proyecto, cada uno con su propia personalidad, especialización y archivo individual.

## Visión General

### Agentes a Generar

1. **🎯 Product Manager** - Estrategia del producto, requisitos y visión de negocio
2. **💻 Developer** - Implementación técnica, arquitectura y desarrollo
3. **🔍 Code Reviewer** - Calidad de código, mejores prácticas y seguridad
4. **🧪 QA** - Testing, calidad y validación funcional

### Estructura Final

```text
proyecto/
├── AGENTS.md                 # Archivo principal con selección automática
└── agents/                   # Directorio con archivos individuales
    ├── product-manager.md    # 🎯 Agente Product Manager
    ├── developer.md          # 💻 Agente Developer
    ├── code-reviewer.md      # 🔍 Agente Code Reviewer
    └── qa.md                 # 🧪 Agente QA
```

## Proceso Paso a Paso

Sigue estos pasos en orden secuencial. Cada paso depende del anterior.

### Archivo de Contexto Compartido

**Importante:** El proceso utiliza un archivo `context.md` que sirve como memoria compartida entre los pasos:

- Propósito: Almacenar información recopilada que se comparte entre pasos
- Creación: Se genera en el Paso 1 con la plantilla `context-template.md`
- Uso: Cada paso lee y actualiza la información según corresponda
- Eliminación: Se elimina automáticamente en el Paso 5 durante la limpieza

**Ventajas:**

- Evita perder información entre pasos
- Facilita la consistencia de datos
- Permite reanudar el proceso si se interrumpe
- Sirve como registro del progreso

### Paso 1: Análisis del Proyecto

**Archivo:** `01-analysis.md`

Analiza tu proyecto para entender:

- Nombre y propósito del proyecto
- Lenguaje principal y stack tecnológico
- Dominio y objetivos del negocio
- Stakeholders principales

Acción clave: Crea `context.md` con la información básica recopilada

Salida: Información base para configurar los agentes

---

### Paso 2: Configuración Base

**Archivo:** `02-base-setup.md`

Crea la estructura base:

- Directorio `agents/`
- Archivo `AGENTS.md` principal
- Configuración inicial del nombre del proyecto

Uso de contexto: Lee información básica de `context.md`

Salida: Estructura lista para recibir agentes

---

### Paso 3: Configuración de Agentes

**Archivo:** `03-agents-configuration.md`

Genera y configura los 4 archivos individuales:

- Copiar plantillas de agentes
- Reemplazar placeholders específicos
- Configurar personalidades y especializaciones

Uso de contexto: Lee y actualiza configuración específica de agentes en `context.md`

Salida: 4 agentes completamente configurados

---

### Paso 4: Información del Proyecto

**Archivo:** `04-project-info.md`

Configura la información técnica en `AGENTS.md`:

- Stack tecnológico completo
- Estructura y arquitectura del proyecto
- Comandos de desarrollo
- Configuración de pruebas y estilo
- Reglas de selección automática

Uso de contexto: Lee información técnica de `context.md` y actualiza datos finales

Salida: Documentación técnica completa

---

### Paso 5: Limpieza Final

**Archivo:** `05-cleanup.md`

Realiza la limpieza final:

- Eliminar instrucciones de generación
- Remover comentarios HTML
- Limpiar placeholders restantes
- Eliminar archivo `context.md`
- Validación final del sistema

Acción final: Elimina `context.md` ya no es necesario

Salida: Sistema listo para producción

## Prerrequisitos

### Información Necesaria

- Nombre oficial del proyecto
- Acceso a archivos de configuración (`package.json`, `pyproject.toml`, etc.)
- Comprensión básica del stack tecnológico
- Conocimiento del dominio del proyecto

### Archivos Requeridos

- `README.md` (o documentación del proyecto)
- Archivo de dependencias principal
- Estructura de carpetas del proyecto

### Herramientas Necesarias

- Acceso de lectura a archivos del proyecto
- Editor de texto para modificar archivos
- Comprensión básica de Markdown

## Resultado Final

Al completar todos los pasos tendrás:

### ✅ Sistema Multi-Agente Completo

- 4 agentes especializados con personalidades únicas
- Selección automática según la solicitud del usuario
- Archivos individuales mantenibles

### ✅ Documentación Técnica

- Stack tecnológico completo y actualizado
- Comandos de desarrollo funcionales
- Guías de estilo y pruebas específicas

### ✅ Estructura Escalable

- Fácil de añadir nuevos agentes
- Simple de modificar existentes
- Organización modular y mantenible

### ✅ Proceso Eficiente

- Memoria compartida entre pasos (context.md)
- Validación continua del progreso
- Limpieza automática de archivos temporales

## Tips para el Proceso

### Durante el Análisis

- **Sé exhaustivo:** Revisa todos los archivos de configuración
- **Toma notas:** Documenta la información importante
- **Valida:** Confirma que entiendes el propósito del proyecto

### Durante la Configuración

- **Sé consistente:** Usa la misma información en todos los agentes
- **Sé específico:** Incluye detalles relevantes para cada rol
- **Revisa:** Verifica que no queden placeholders sin reemplazar

### Durante la Limpieza

- **Sé metódico:** Sigue el checklist sistemáticamente
- **Verifica:** Confirma que todo se vea profesional
- **Prueba:** Asegura que las referencias funcionen

## Soporte y Troubleshooting

### Si tienes dudas durante el proceso

- Revisa los ejemplos en cada paso
- Consulta las plantillas de referencia
- Verifica la validación al final de cada paso
- Usa el archivo `context.md` como guía de progreso

### Problemas Comunes

**El archivo `context.md` no existe:**

- Asegúrate de haber ejecutado el Paso 1 completamente
- Copia manualmente `context-template.md` a `context.md`

**Los placeholders no se reemplazan:**

- Verifica que estés usando la información correcta del contexto
- Confirma que los nombres de placeholders coincidan exactamente

**Los archivos de agentes no se generan:**

- Verifica que el directorio `agents/` exista
- Confirma que las plantillas existan en `templates/agents/`

### Recuperación del Proceso

Si el proceso se interrumpe:

1. Revisa el estado actual en `context.md`
2. Continúa desde el último paso completado
3. Si `context.md` se perdió, reinicia desde el Paso 1

## ¡Comienza

Empieza con el **Paso 1: Análisis del Proyecto** (`01-analysis.md`) cuando estés listo.

---

**Nota:** Este proceso ha sido diseñado para ser robusto y recuperable. No dudes en consultar los archivos de referencia o reiniciar pasos si es necesario.
