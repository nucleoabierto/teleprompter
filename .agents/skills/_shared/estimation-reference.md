# Patrón de Referencia para Estimación de Complejidad

**Sistema**: Puntos Fibonacci (1, 2, 3, 5, 8, 13, 21, 34)
**Basado en**: Actividades tipo del proyecto
**Última actualización**: 2026-07-31

---

## Tabla de Referencia: Puntos → Tiempo

| Puntos | Valor Subjetivo   | Valor Objetivo y Medible |
|--------|-------------------|--------------------------|
| **1**  | Un par de horas   | 0 - 3 horas              |
| **2**  | Medio día         | 3 - 6 horas              |
| **3**  | Un día            | 6 - 12 horas             |
| **5**  | Media semana      | 2 - 4 días               |
| **8**  | Una semana        | 4 - 8 días               |
| **13** | Un par de semanas | 1 - 3 semanas            |
| **21** | Un par de meses   | 1 - 3 meses              |
| **34** | Medio año         | 4 - 8 meses              |

---

## Ejemplos de Referencia: Actividades Tipo

### 1 Punto (0-3 horas)

**Actividad**: Agregar un campo en un formulario

- Modificar: 1 tabla (1 columna nueva)
- Frontend: 1 campo adicional en form
- Tests: 1 test unitario mínimo
- Complejidad: Mínima (sin lógica nueva)
- Riesgo: Bajo

**Ejemplos**:

- Cambiar label de campo existente
- Agregar campo de entrada simple (text, number)
- Ajuste de estilos menor
- Documentación de cambio mínimo

---

### 2 Puntos (3-6 horas)

**Actividad**: Agregar una tabla nueva

- Crear: 1 tabla nueva en DB con 3-5 columnas básicas
- Backend: 1 modelo + basic CRUD operations
- Frontend: Listado simple (sin filtros)
- Tests: 3-5 tests unitarios
- Complejidad: Baja (operaciones CRUD estándar)
- Riesgo: Bajo-Medio

**Ejemplos**:

- Crear tabla `categories` con campos estándar
- Agregar endpoints básicos GET, POST
- Listar items en tabla simple
- Validaciones básicas (not null, unique)
- Sin integraciones externas

---

### 3 Puntos (6-12 horas)

**Actividad**: Construir un formulario nuevo (front) incluyendo controlador (back)

- Backend: Endpoint que procesa datos del formulario
- Frontend: Formulario completo con validación
- DB: Cambio de schema moderado (nueva tabla O múltiples columnas)
- Tests: 8-10 tests (unit + integration)
- Complejidad: Media (lógica de negocio moderada)
- Riesgo: Medio

**Ejemplos**:

- Crear formulario de usuario con validation frontend+backend
- Endpoint POST con lógica de negocio (ej: calcular descuento, verificar stock)
- Integraciones menores (ej: enviar email notificación)
- Manejo de errores implementado
- Logging y auditoría básica

---

### 5 Puntos (2-4 días)

**Actividad**: Crear una página/sección nueva (front)

- Frontend: Página completa con múltiples componentes
- Backend: 3-5 endpoints relacionados
- DB: Schema nuevo moderado o expansión significativa
- Tests: 15-20 tests (unit + integration + E2E basic)
- Complejidad: Media-Alta (flujo de usuario completo)
- Riesgo: Medio

**Ejemplos**:

- Crear dashboard con gráficos y filtros
- Página de perfil de usuario con edición
- Listado con paginación, búsqueda, filtros
- Integración con API externa (simple)
- Manejo de estado más complejo (Redux/Context)

---

### 8 Puntos (4-8 días)

**Actividad**: Crear un flujo de acciones básico

- Frontend: Flujo multi-paso con lógica condicional
- Backend: 5-8 endpoints con lógica de negocio compleja
- DB: Schema migration moderada
- Tests: 25-35 tests completos
- Complejidad: Alta (comportamiento complejo)
- Riesgo: Medio-Alto

**Ejemplos**:

- Flujo de checkout (producto → pago → confirmación)
- Sistema de autenticación básico (login, logout, refresh)
- Importación/exportación de datos (CSV, JSON)
- Integración con payment gateway (Stripe, etc.)
- Feature flag implementation

---

### 13 Puntos (1-3 semanas)

**Actividad**: Crear un flujo de acciones avanzado

- Frontend: Flujo complejo con múltiples estados
- Backend: 8-15 endpoints, integraciones múltiples
- DB: Schema migration significativa
- Tests: 50+ tests (todas las categorías)
- Complejidad: Muy Alta (comportamiento muy complejo)
- Riesgo: Alto

**Ejemplos**:

- Sistema de notificaciones completo (email, SMS, push)
- Two-factor authentication implementation
- Advanced search con indexación
- Workflow engine básico
- Role-based access control (RBAC)
- Data analytics dashboard

---

### 21 Puntos (1-3 meses)

**Actividad**: Migrar un monolito hacia microservicios

- Arquitectura: Refactor mayor del sistema
- Services: Crear 3-5 microservicios nuevos
- Infrastructure: Setup de orquestación (Docker, K8s)
- DB: Múltiples schemas, sincronización entre servicios
- Tests: Suite completa con tests de integración cross-service
- Complejidad: Extrema (cambio arquitectónico)
- Riesgo: Muy Alto

**Ejemplos**:

- Extraer servicio de pagos del monolito
- Implementar message queue (RabbitMQ, Kafka)
- API Gateway + rate limiting + auth centralizado
- Logging centralizado y tracing distribuido
- Database per service migration
- Backwards compatibility durante migración

---

### 34 Puntos (4-8 meses)

**Actividad**: Iniciativa estratégica importante

- Scope: Feature completa o rearchitectura mayor
- Equipo: Múltiples devs, multiple sprints
- Complejidad: Sistema
- Riesgo: Crítico

**Ejemplos**:

- Reescribir frontend completo (monolito → SPA moderno)
- Cambio de base de datos (SQL → NoSQL)
- Escalabilidad: De 1000 a 1M usuarios
- Compliance overhaul (SOC2, GDPR, etc.)
- Multi-tenancy implementation
- Global distribution (multiple regions)

---

## Reglas de Estimación

### ✅ Cómo Usar Esta Tabla

1. **Identificar actividad tipo más similar** a la tarea
2. **Ajustar por complejidad adicional**:
   - +1 punto si hay integraciones no mencionadas
   - +1 punto si hay lógica de negocio compleja
   - +1 punto si afecta múltiples sistemas
   - -1 punto si es más simple que el ejemplo

3. **Considerar riesgo**:
   - Riesgo Alto: +1 punto (más testing, review)
   - Legacy code involved: +1-2 puntos
   - Unknown tech: +2-3 puntos

4. **Punto óptimo es 3-5**:
   - < 1 punto: Demasiado pequeño, combinar
   - 1-5 puntos: Tamaño ideal para sprint
   - 8+ puntos: Considerar dividir en tareas más pequeñas

### ❌ Evitar

- ❌ Estimar > 8 puntos (dividir en tareas pequeñas)
- ❌ Contar "puntos" como "horas" lineales (Fibonacci no es lineal)
- ❌ Overestimate por nerviosismo (usar estimación de equipo)
- ❌ Comprometer estimación bajo presión (estima realista)

### ⚠️ Factores de Multiplicador

| Factor | Multiplicador | Razón |
| -------- | --------------- | ------- |
| **Primer proyecto con tech stack** | ×2-3 | Learning curve |
| **Legacy/poorly documented code** | ×1.5-2 | Investigación extra |
| **Distributed team (async)** | ×1.2-1.5 | Comunicación overhead |
| **Hard deadline (no buffer)** | ×1.5-2 | Stress + rework |
| **New team member only** | ×2-3 | Onboarding |
| **High quality bar (perfeccionismo)** | ×1.2-1.5 | Extra polish |
| **Interrupciones esperadas** | ×1.2-1.5 | Context switching |

**Aplicación**: Base estimate × multiplicador = Estimate final

---

## Ejemplos de Ajuste

### Caso 1: Formulario simple → Complejo

**Base**: 3 puntos (formulario básico)

**Complejidad adicional**:

- +0 (es estándar CRUD)

**Riesgo**:

- Riesgo bajo (no tiene integraciones)

**Ajustes**:

- No hay

**Estimación final**: 3 puntos ✅

---

### Caso 2: Agregar tabla → Con integraciones

**Base**: 2 puntos (tabla nueva)

**Complejidad adicional**:

- +1 (lógica de negocio: calcular precio dinámico)
- +1 (integración con API externa: catálogo de precios)

**Riesgo**:

- Riesgo medio (depende de API externa)

**Ajustes**:

- +0 (no legacy, equipo experto)

**Estimación final**: 2 + 1 + 1 = 4 puntos → Round to 5 ✅

---

### Caso 3: Dashboard simple → Analytics complicado

**Base**: 5 puntos (página/sección nueva)

**Complejidad adicional**:

- +1 (gráficos avanzados con datos complejos)
- +1 (filtros dinámicos con combinaciones)
- +1 (performance optimization necesaria)

**Riesgo**:

- Riesgo alto (analytics puede tener bugs sutiles)

**Ajustes**:

- +1 (legacy data model, no documentada)
- +2 (equipo nuevo con tecnología)

**Estimación final**: 5 + 3 + 1 + 2 = 11 puntos → Round to 13 ✅

---

## Validación Post-Estimación

Después de estimar, preguntarse:

- ✅ ¿Esta tarea se puede completar en 1 sprint? (Si es 8+ → dividir)
- ✅ ¿El dev experimentado puede hacerlo en el tiempo estimado?
- ✅ ¿Hay investigación/spike incluida en la estimación?
- ✅ ¿Testing está incluido en tiempo estimado?
- ✅ ✅ ¿La estimación tiene buffer para unknowns?

Si alguna respuesta es "no" → Re-estimar o dividir tarea.

---

## Conversor Rápido: Puntos → Horas (Aproximado)

| Puntos | Horas (dev exp) | Horas (dev junior) |
| -------- | ----------------- | ------------------- |
| 1 | 2 | 3 |
| 2 | 4 | 6 |
| 3 | 8 | 12 |
| 5 | 20 | 32 |
| 8 | 32 | 48 |
| 13 | 60 | 90 |
| 21 | 120 | 180 |
| 34 | 240 | 360 |

**Nota**: Estos son ESFUERZO, no calendario (1 punto ≠ 2 horas calendario, porque hay meetings, interrupciones, etc.)

---

**Referencia actualizada y lista para usar en todos los skills de estimación.**
