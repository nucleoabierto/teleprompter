# Ejemplo: Scope Roadmap Completo

Ejemplo de un scope-roadmap para un sistema de notificaciones con múltiples funcionalidades, mostrando diferentes patrones de desglose de fases.

```markdown
---
idea_slug: sistema-notificaciones
domain: plataforma
date: 2025-01-15
skill: evaluar-alcance-idea
profile: full
status: conditional
next: priorizar-roadmap
---

## Evaluación Estratégica

- **Veredicto**: Proceder
- **Alineación**: Alineado con roadmap Q1 2025 de "Mejorar engagement de usuarios"
- **Tamaño**: full
- **Justificación**: Producto externo, impacta múltiples bounded contexts

## Clasificación de Alcance

- **Tipo**: Múltiples funcionalidades
- **Justificación**: Impacta 3 bounded contexts (auth, messaging, analytics), con componentes que pueden entregarse independientemente

## Roadmap de Funcionalidades

### notificaciones-core
- **Alcance**: Email + push básicos para alertas críticas
- **Valor**: Usuarios reciben notificaciones importantes en tiempo real
- **Depende de**: auth-core
- **Estado**: lista

### preferencias-usuario
- **Alcance**: Gestión completa de canales, frecuencias, horarios y reglas de notificación
- **Valor**: Control granular sobre qué notificaciones recibir y cuándo
- **Depende de**: notificaciones-core
- **Estado**: condicionada

### analytics-integration
- **Alcance**: Tracking de engagement, dashboards y reportes de efectividad
- **Valor**: Visibilidad sobre el impacto de las notificaciones en el comportamiento del usuario
- **Depende de**: preferencias-usuario
- **Estado**: lista

## Desglose: notificaciones-core

### Fases
1. **Infraestructura de envío**: Configuración de SendGrid para emails transactionales, setup de templates base, sistema de colas para procesamiento asíncrono, manejo de errores y reintentos
2. **Integración con auth**: Conexión con sistema de usuarios existente, validación de emails, gestión de preferencias básicas (on/off), endpoints de API para envío programático
3. **Implementación de push**: Integración con FCM para Android y APNS para iOS, registro de dispositivos, manejo de tokens expirados, sistema de fallback cuando push falla
4. **Plantillas y contenido**: Diseño de templates para diferentes tipos de alertas (seguridad, transacciones, recordatorios), sistema de variables dinámicas, A/B testing básico de subject lines
5. **Monitoreo y alertas**: Métricas de entregabilidad, tracking de opens/clicks, alertas cuando tasas de entrega caen por debajo del umbral, dashboard de estado del sistema

### Decisiones
- **Resuelta (2025-01-15)**: Proveedor email = SendGrid (balance costo/entregabilidad, API robusta)
- **Resuelta (2025-01-15)**: Sistema de colas = RabbitMQ (ya integrado en plataforma, reduce latencia)
- **Pendiente**: ¿Incluir SMS en MVP o fase posterior? Opciones: Sí (mayor alcance, más costo, complejidad adicional) vs No (entrega más rápida, alcance limitado a email/push)
- **Pendiente**: ¿Política de reintentos para emails fallidos? Opciones: 3 reintentos con backoff exponencial (mayor entregabilidad, más carga) vs 1 reintento simple (menor carga, menor entregabilidad)

## Desglose: preferencias-usuario

### Fases
1. **UI básica de toggle**: Pantalla de configuración con switches on/off por tipo de notificación, almacenamiento en DB existente, integración con auth-core
2. **Gestión de canales**: Selección de canales por tipo (email, push, SMS), preferencias por dispositivo, manejo de dispositivos múltiples
3. **Frecuencias y horarios**: Configuración de frecuencia (inmediata, diaria, semanal), horarios de silencio (modo no molestar), zonas horarias por usuario
4. **Reglas avanzadas**: Sistema de reglas condicionales (ej: "solo notificaciones de seguridad fuera de horario laboral"), categorización por urgencia, filtros por contenido
5. **Preferencias por defecto**: Sistema de defaults inteligentes basados en comportamiento del usuario, onboarding guiado de preferencias, capacidad de exportar/importar configuraciones

### Decisiones
- **Resuelta (2025-01-15)**: Almacenar preferencias en DB existente (sin nuevo bounded context, reduce complejidad)
- **Resuelta (2025-01-15)**: UI basada en componentes existentes (consistencia visual, menor desarrollo)
- **Pendiente**: ¿Default opt-in u opt-out para nuevos usuarios? Opciones: Opt-in (menos spam, menor adopción, compliance GDPR-friendly) vs Opt-out (mayor adopción, riesgo spam, requiere manejo cuidadoso)
- **Pendiente**: ¿Complejidad de reglas avanzadas? Opciones: Reglas simples (if/then básico, fácil de usar) vs Motor de reglas completo (flexibilidad máxima, curva de aprendizaje alta)

## Desglose: analytics-integration

### Fases
1. **Eventos básicos**: Tracking de sent, delivered, opened, clicked, bounced, complained, integración con Mixpanel existente
2. **Dashboard de alto nivel**: Métricas clave (tasa de entrega, tasa de apertura, tasa de clic), comparación temporal, filtros por tipo de notificación
3. **Análisis por cohorte**: Segmentación por comportamiento del usuario, análisis de retención post-notificación, identificación de usuarios desenganchados
4. **A/B testing framework**: Integración con sistema de experiments existente, test de subject lines, timing y contenido, análisis estadístico automático
5. **Reportes y exportación**: Generación de reportes PDF, exportación a CSV, alertas automáticas cuando métricas caen, integración con Slack para notificaciones de equipo

### Decisiones
- **Resuelta (2025-01-15)**: Usar Mixpanel (ya integrado en plataforma, reduce setup)
- **Resuelta (2025-01-15)**: Dashboards en herramienta existente (Grafana) para consistencia
- **Pendiente**: ¿Nivel de detalle en eventos? Opciones: Eventos agregados (menor volumen, menor costo, menos granularidad) vs Eventos individuales (máxima granularidad, mayor costo, más storage)
- **Pendiente**: ¿Frecuencia de reportes automáticos? Opciones: Diaria (mayor visibilidad, más ruido) vs Semanal (balance, menos ruido) vs Mensual (menos visibilidad, menos overhead)

## Decisiones Pendientes

### Importantes (afectan calidad)
- ¿Incluir SMS en MVP o fase posterior? (notificaciones-core) - Opciones: Sí vs No - Impacto: Alcance vs Velocidad de entrega
- ¿Default opt-in u opt-out para nuevos usuarios? (preferencias-usuario) - Opciones: Opt-in vs Opt-out - Impacto: Adopción vs Riesgo spam y compliance
- ¿Nivel de detalle en eventos de analytics? (analytics-integration) - Opciones: Agregados vs Individuales - Impacto: Granularidad vs Costo de storage

### Menores (ideal resolver)
- ¿Política de reintentos para emails fallidos? (notificaciones-core) - Opciones: 3 reintentos vs 1 reintento - Impacto: Entregabilidad vs Carga del sistema
- ¿Complejidad de reglas avanzadas? (preferencias-usuario) - Opciones: Reglas simples vs Motor completo - Impacto: Usabilidad vs Flexibilidad
- ¿Frecuencia de reportes automáticos? (analytics-integration) - Opciones: Diaria vs Semanal vs Mensual - Impacto: Visibilidad vs Overhead

## Recomendación

- **Empezar con**: notificaciones-core
- **Next step**: priorizar-roadmap
- **Justificación**: notificaciones-core desbloquea las otras dos funcionalidades y entrega valor inmediato (alertas críticas). Hay decisiones importantes pendientes (SMS, defaults opt-in) que requieren input del usuario antes de implementar, pero no bloquean el avance de la infraestructura base.
```

## Características de este ejemplo

- **Múltiples funcionalidades**: 3 funcionalidades con diferentes niveles de complejidad
- **Patrones de desglose variados**:
  - `notificaciones-core`: 5 fases (feature complejo con múltiples componentes técnicos)
  - `preferencias-usuario`: 5 fases (feature de usuario con evolución progresiva)
  - `analytics-integration`: 5 fases (feature de datos con capas de profundidad)
- **Fases explícitas y detalladas**: Cada fase tiene descripción específica de qué se entrega, no solo nombres genéricos
- **Dependencias claras**: auth-core → notificaciones-core → preferencias-usuario → analytics-integration
- **Decisiones mixtas**: Mezcla de decisiones resueltas (con fechas y rationale) y pendientes (con opciones y trade-offs)
- **Clasificación por severidad**: Decisiones divididas en Importantes y Menores según impacto
- **Status condicionado**: Hay decisiones importantes pendientes que requieren input del usuario
- **Value proposition claro**: Cada funcionalidad tiene un valor específico y diferenciado para el usuario
- **Evolución progresiva**: Cada funcionalidad muestra un camino desde MVP hasta funcionalidad avanzada
