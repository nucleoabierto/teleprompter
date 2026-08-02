# Templates de mapa de dominio — Guía de referencia

Este directorio contiene tres templates para mapas de dominio DDD estratégicos. Elige el template apropiado según la complejidad del dominio que vas a documentar.

## Templates disponibles

### 1. `domain-map-template-single.md`

**Para:** Dominios simples con pocos bounded contexts (≤5)
**Características:**

- Todo en un solo archivo `domain-map.md`
- Estructura simplificada
- Ideal para documentación rápida o dominios bien delimitados
- Sin división por subdominios o tamaño

**Usa este template cuando:**

- El dominio tiene 3-5 bounded contexts máximo
- No necesitas dividir la documentación en múltiples archivos
- La documentación será relativamente corta (<50 páginas)
- El equipo prefiere un documento único para referencia

### 2. `domain-map-template-divided.md`

**Para:** Dominios complejos con muchos bounded contexts (>5) o subdominios múltiples
**Características:**

- Índice principal (`domain-map.md`) + archivos de cuerpo (`domain-map/<dominio-slug>.md`)
- Canvases pesados opcionales en archivos separados (`domain-map/bc-<contexto-slug>.md`)
- Estructura jerárquica para navegación
- Soporta división por subdominio (`by-domain`) o por tamaño (`by-size`)

**Usa este template cuando:**

- El dominio tiene más de 5 bounded contexts
- Hay múltiples subdominios con documentación extensa
- Necesitas modularizar la documentación para diferentes equipos
- El documento sería muy largo en un solo archivo (>50 páginas)

### 3. `domain-map-examples.md`

**Para:** Referencia de ejemplos completos
**Características:**

- Ejemplos concretos basados en un sistema de checkout e-commerce
- Muestra cómo completar cada sección con datos reales
- Incluye ejemplos de tablas, diagramas, canvas, arqueología
- Caso consistente para ilustrar todas las secciones

**Usa este documento cuando:**

- Necesitas ver ejemplos concretos de cómo completar una sección
- No estás seguro de qué nivel de detalle incluir
- Quieres ver un caso completo de principio a fin
- Estás entrenando a otros miembros del equipo en el uso de los templates

## Cómo elegir el template correcto

### Decision tree simple

```text
¿El dominio tiene >5 bounded contexts?
├─ Sí → usa `domain-map-template-divided.md`
└─ No → ¿La documentación será >50 páginas?
    ├─ Sí → usa `domain-map-template-divided.md`
    └─ No → usa `domain-map-template-single.md`
```

### Factores adicionales a considerar

- **Tamaño del equipo:** Equipos grandes pueden beneficiarse de la estructura dividida
- **Frecuencia de actualización:** Documentación que cambia frecuentemente puede ser más manejable dividida
- **Auditoría:** Si diferentes equipos son responsables de diferentes partes, la estructura dividida facilita el ownership
- **Onboarding:** Para nuevos miembros, un documento single puede ser más fácil de leer inicialmente

## Flujo de trabajo recomendado

1. **Revisa los ejemplos** en `domain-map-examples.md` para entender el nivel de detalle esperado
2. **Elige el template** apropiado según los criterios arriba
3. **Personaliza el template** con tu dominio específico
4. **Completa las secciones** en orden: Contexto → Subdominios → BCs → Mapas → Historias → Evaluación
5. **Valida la calidad** usando la rúbrica de evaluación al final
6. **Itera** si la puntuación es <9 o el estado es `mejorar`/`bloqueado`

## Convenciones comunes a todos los templates

Todos los templates comparten estas convenciones:

- **mapState:** Usa `AS_IS` por defecto, `TO_BE` solo para rediseños explícitos
- **Relaciones 2 capas:** Tipo (capa 1) + Roles (capa 2) para mapas con ≥3 bounded contexts
- **Mermaid:** Dirección siempre U→D (upstream a downstream)
- **Arqueología:** Obligatoria para BCs Núcleo, opcional para Soporte/Genérico
- **Evaluación:** Siempre incluir bloque con rúbrica y estado `Listo para`

## Migración entre templates

Si comenzaste con un template y necesitas cambiar:

### De single → divided

1. Crea el índice usando `domain-map-template-divided.md`
2. Mueve las secciones de subdominios/BCs a archivos `domain-map/<slug>.md`
3. Actualiza enlaces en el índice
4. Mantiene mapas globales e historias en el índice

### De divided → single

1. Crea nuevo archivo usando `domain-map-template-single.md`
2. Copia contenido de los archivos divididos al archivo único
3. Elimina secciones de índice y enlaces
4. Ajusta estructura para flujo lineal

## Soporte y preguntas

Para preguntas sobre el uso de estos templates:

- Revisa primero `domain-map-examples.md` para casos similares
- Consulta el skill `mapear-dominio` para detalles del proceso
- Verifica el SKILL.md del skill para criterios de calidad y evaluación
