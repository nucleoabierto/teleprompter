# Medios del harness

Selección de rama, escalera de preferencia de medios y diseño de interacciones para la Fase A de [harness](../SKILL.md).

Todos los medios son autónomos — ejecutables sin arrancar la app, loguearse, o agregar rutas de dev.

## Rama lógica vs UI

Elige una rama antes de seleccionar un medio:

- **Lógica**
  - Objetivo de visibilidad: Modelo de estado, reducer, sync, o comportamiento de servicio
  - Forma del harness: Demo de terminal interactiva, HTML de demo, o runner scriptado sobre módulos reales
- **UI**
  - Objetivo de visibilidad: Layout, comportamiento del DOM, estado del lado del cliente, o interacción visual
  - Forma del harness: HTML de demo autónomo (o carpeta pequeña) con lógica extraída y fixtures sintéticos

Default cuando es ambiguo: backend/servicio → Lógica; página o componente → UI (extrae en HTML de demo; no arranques la app). Declara la asunción en el chat.

## Escalera de preferencia de medios

Elige el medio autónomo más pequeño que pueda revelar el comportamiento (gana la primera coincidencia):

1. Script de seed + output por consola (script one-off)
2. Demo de terminal interactiva (Lógica) — módulo de lógica real + shell desechable delgado; expone estado completo después de cada paso; un comando para ejecutar
3. Runner de escenarios scriptado — script local desechable con output escalonado (no módulos de tests)
4. HTML de demo autónomo — un archivo o carpeta pequeña colocado cerca del código bajo exploración; abre en un navegador (`file://` o servidor estático local); botones/controles manejan el estado; importa o inlinea módulos reales cuando sea factible, de lo contrario solo fixtures sintéticos
5. Carpeta de demo pequeña — HTML + CSS + JS cuando un archivo es demasiado ajustado; todavía sin paso de build a menos que el proyecto anfitrión ya tenga uno; todavía ejecutable vía servidor estático o `file://`

Si la escalera apunta a un medio más pesado de lo que el objetivo de visibilidad necesita, detente y pregunta si simplificar el objetivo o graduar el demo en el producto.

## Guía de extracción UI

Cuando la rama es UI, construye HTML de demo autónomo — no conectes en la app principal:

- **Ver layout o comportamiento del DOM**
  - Usa: HTML de demo `*-harness.html` con markup/CSS extraído y estado sintético
  - Evita: Arrancar la app, rutas de dev
- **Visualizar estado del lado del cliente o transiciones**
  - Usa: HTML de demo con botones manejando módulos de lógica extraídos
  - Evita: Tests `render()`, filtros de tests
- **Comparar opciones de layout**
  - Usa: Variantes side-by-side en un archivo HTML de demo
  - Evita: `?variant=` en una ruta existente
- **Explicar arquitectura / flujo de datos**
  - Usa: Notas del harness + diagrama + punteros de código en el HTML
  - Evita: Reimplementar lógica de producción inline sin importar módulos reales
- **Verificar lógica rápidamente**
  - Usa: Tests unitarios existentes (separados del demo)
  - Evita: Construir un nuevo "test de lección"

## Ejemplos de interacciones

Define 3–5 interacciones que enseñen el sistema: paso, limpieza, toggle flag, inyectar conflicto, ciclo de variantes.
