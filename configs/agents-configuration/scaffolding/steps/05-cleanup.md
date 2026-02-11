# Paso 5: Limpieza Final

## Propósito

Realizar la limpieza final de todos los archivos, eliminando instrucciones de generación y placeholders no utilizados para dejar los archivos listos para producción.

## Acciones a Realizar

### 5.1 Verificar Contexto Final

**Antes de comenzar la limpieza:**

- Confirma que `context.md` existe con toda la información del proceso
- Verifica que todos los pasos estén marcados como completados
- Revisa que todos los archivos estén generados según el contexto

### 5.2 Limpiar Archivo AGENTS.md Principal

**Eliminar bloques de instrucciones:**

- Eliminar el bloque "INSTRUCCIONES PARA EL AGENTE GENERADOR" (inicio del archivo)
- Eliminar todos los comentarios HTML `<!-- INSTRUCCIONES PARA GENERACIÓN ... -->`

**Eliminar etiquetas de placeholders:**

- Eliminar todas las etiquetas `{{ PLACEHOLDER_START ... }}` y `{{ PLACEHOLDER_END ... }}`
- Verificar que no queden placeholders sin reemplazar

### 5.3 Limpiar Archivos de Agentes

**Para cada archivo en `agents/`:**

- `agents/product-manager.md`
- `agents/developer.md`
- `agents/code-reviewer.md`
- `agents/qa.md`

**Acciones por archivo:**

- Eliminar todos los comentarios HTML `<!-- INSTRUCCIONES PARA GENERACIÓN ... -->`
- Eliminar todas las etiquetas `{{ PLACEHOLDER_START ... }}` y `{{ PLACEHOLDER_END ... }}`
- Verificar que no queden placeholders `{{PLACEHOLDER...}}` sin reemplazar

### 5.4 Eliminar Archivo de Contexto

**Acción final:**

- Eliminar el archivo `context.md` ya no es necesario
- Este archivo ha servido como memoria compartida durante el proceso

```bash
rm context.md
```

### 5.5 Actualizar Contexto Final (antes de eliminar)

**Antes de eliminar `context.md`, realiza una última actualización:**

- Marca "Paso 5: Limpieza Final" como completado
- Actualiza "Última actualización" con fecha y hora actual
- Actualiza "Paso actual" a "Proceso Completado"
- Verifica que todos los archivos generados estén marcados

**Luego elimina el archivo.**

### 5.6 Verificación Final

**Revisar todos los archivos:**

- `AGENTS.md` (raíz)
- `agents/product-manager.md`
- `agents/developer.md`
- `agents/code-reviewer.md`
- `agents/qa.md`

**Verificar que:**

- No quedan comentarios HTML `<!-- ... -->`
- No quedan etiquetas `{{ PLACEHOLDER_START ... }}` y `{{ PLACEHOLDER_END ... }}`
- No quedan placeholders `{{PLACEHOLDER...}}` sin reemplazar
- El contenido sea limpio y profesional
- **El archivo `context.md` ha sido eliminado**

## Validación Final Completa

Verifica que se cumplen todos los criterios del proyecto:

### Estructura

- [ ] `AGENTS.md` existe en raíz del proyecto
- [ ] Directorio `agents/` existe con los 4 archivos individuales
- [ ] Referencias a archivos individuales en AGENTS.md son correctas
- [ ] **`context.md` ha sido eliminado correctamente**

### Contenido

- [ ] Los 4 agentes están completamente configurados
- [ ] No quedan placeholders `{{PLACEHOLDER...}}` en ningún archivo
- [ ] No quedan comentarios HTML `<!-- ... -->` en ningún archivo
- [ ] Comandos coinciden con `package.json` (u homólogo)

### Calidad

- [ ] Stack tecnológico coincide con dependencias instaladas
- [ ] Reglas de selección de agente son lógicas para el proyecto
- [ ] El contenido es profesional y bien formateado
- [ ] **No quedan archivos temporales del proceso**

## Tips para la Limpieza

### Búsqueda Eficiente

- Usa búsqueda global para encontrar `<!--` y eliminar todos los comentarios HTML
- Busca `{{ PLACEHOLDER_` para encontrar todas las etiquetas
- Busca `{{PLACEHOLDER:` para encontrar placeholders restantes

### Verificación

- Lee cada archivo rápidamente para asegurar que se vea profesional
- Verifica que las secciones fluyan correctamente sin interrupciones
- Confirma que no haya texto de instrucciones visible

### Respaldo

- Considera hacer un respaldo antes de la limpieza masiva
- Si usas Git, confirma los cambios en pasos separados

## Salida Esperada

Al finalizar este paso, deberías tener:

- ✅ **5 archivos limpios** y profesionales
- ✅ **Sin instrucciones de generación** visibles
- ✅ **Sin placeholders** sin reemplazar
- ✅ **Contenido listo para uso** en producción
- ✅ **Sin archivos temporales** del proceso

## ¡Felicidades

Has completado la configuración multi-agente del proyecto. Ahora tienes:

- Un sistema de 4 agentes especializados
- Archivos individuales para cada agente
- Configuración automática de selección
- Documentación técnica completa
- Estructura mantenible y escalable

## Uso del Sistema

Los agentes están listos para ser utilizados:

- El sistema seleccionará automáticamente el agente adecuado según la solicitud
- Cada agente tiene su personalidad y especialización
- La configuración técnica está completa y actualizada

## Siguiente Paso

El sistema está completo. Puedes comenzar a usar los agentes o personalizarlos aún más según las necesidades específicas de tu proyecto.
