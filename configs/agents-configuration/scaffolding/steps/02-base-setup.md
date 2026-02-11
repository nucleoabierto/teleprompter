# Paso 2: Configuración Base

## Propósito

Crear la estructura base del proyecto y configurar el archivo principal `AGENTS.md` con la información fundamental del proyecto.

## Acciones a Realizar

### 2.1 Verificar Contexto Existente

#### Antes de comenzar

- Confirma que `context.md` existe en la raíz del proyecto
- Lee la información básica recopilada en el Paso 1

#### Información a leer del contexto

- Nombre del proyecto
- Lenguaje principal y framework
- Información básica del dominio

### 2.2 Crear Directorio de Agentes

#### Crear directorio `agents/` en la raíz del proyecto**

```bash
mkdir agents
```

Este directorio contendrá los archivos individuales de cada agente.

### 2.3 Generar Archivo AGENTS.md Principal

#### Copiar plantilla base**

- Copiar contenido de `.teleprompter/agents-configuration/templates/AGENTS.md` a `AGENTS.md` (raíz)
- Este archivo servirá como índice y sistema de selección

#### Reemplazar placeholder principal

- Buscar `{{PLACEHOLDER: project_name}}`
- Reemplazar con el nombre real del proyecto (leído desde `context.md`)

### 2.4 Actualizar Contexto

#### Al finalizar este paso, actualiza `context.md`

- Marca "Paso 2: Configuración Base" como completado
- Actualiza "Última actualización" con fecha y hora actual
- Actualiza "Paso actual" a "Paso 3: Configuración de Agentes"

### 2.5 Verificar Estructura Base

#### Confirmar que tienes

- [ ] Directorio `agents/` creado en la raíz
- [ ] Archivo `AGENTS.md` en la raíz con el nombre del proyecto
- [ ] Referencias correctas a los archivos de agentes individuales

### 2.6 Validación

Verifica que:

- [ ] El archivo `context.md` existe y es legible
- [ ] El directorio `agents/` existe en la raíz del proyecto
- [ ] `AGENTS.md` se ha creado y contiene el nombre correcto del proyecto
- [ ] Las referencias a archivos individuales (`agents/product-manager.md`, etc.) son correctas
- [ ] No hay errores de sintaxis en el archivo `AGENTS.md`
- [ ] Has actualizado `context.md` con el progreso de este paso

## Tips

- Verifica el nombre del proyecto: Asegúrate de usar el nombre oficial, no un placeholder
- Confirma las rutas: Las referencias a archivos deben ser relativas a la raíz
- Revisa la estructura: El directorio `agents/` debe estar al mismo nivel que `src/`, `package.json`, etc.

## Siguiente Paso

Una vez completada la configuración base, continúa con **Paso 3: Configuración de Agentes** (`03-agents-configuration.md`).
