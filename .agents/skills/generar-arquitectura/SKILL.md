---
name: generar-arquitectura
description: >-
  Genera documentación arquitectónica con diagramas de componentes, flujos de
  datos, integraciones y trade-offs. Salida:
  docs/<domain>/<EPIC-SLUG>-architecture.md con diagramas Mermaid. Úsalo
  cuando el usuario pida generar, diseñar o documentar arquitectura
  visualmente. No lo usas para especificar requisitos técnicos detallados
  (usar generar-trd) ni para documentar decisiones arquitectónicas (usar
  generar-adr).
---

# Generador de Arquitectura

Genera documentación arquitectónica completa con diagramas, componentes, flujos de datos, e integraciones. Complementa TRD con visualización arquitectónica.

Solo documentación: no implementa. Úsalo para comunicar arquitectura a stakeholders y equipo.

## Fase 0 — Resolver entrada

Requerido: `EPIC-SLUG` o `TRD-RUTA`.

Infiere desde:
- Ruta: `docs/**/<EPIC-SLUG>-trd.md`
- Contenido pegado: si el usuario pega el TRD
- TRD previo: busca el archivo más reciente de `*-trd.md`

Pregunta cuando falta: "¿Para qué epic genero arquitectura? (ruta de trd.md o epic slug)"

Declara inputs resueltos: epic, TRD leído.

## Fase A — Analizar TRD para Componentes

Lee el TRD y extrae:
1. **Componentes mencionados**: servicios, modelos, APIs, integraciones
2. **Flujos de datos**: cómo fluyen datos entre componentes
3. **Límites de contexto**: bounded contexts del epic
4. **Sistemas externos**: APIs terceros, servicios cloud, etc.

## Fase B — Diagrama de Componentes

Usa el template de C4 en `references/mermaid-c4-template.md` como guía.

Adapta el diagrama a los componentes extraídos del TRD:
- Reemplaza nodos de ejemplo con componentes reales del epic
- Ajusta relaciones según flujos de datos identificados
- Mantén estilo visual (emojis, colores) para consistencia

## Fase C — Diagrama de Flujos de Datos

Para cada flujo crítico, documenta visualmente usando el template en `references/mermaid-sequence-template.md`:

- Crea un diagrama por cada flujo principal identificado en el TRD
- Adapta participantes y mensajes al contexto del epic
- Usa `->>` para llamadas síncronas y `-->>` para respuestas/asíncronas

## Fase D — Diagrama de Deployment

```
### Topología de Deployment

graph LR
    subgraph "Development"
        D_Code["📝 Code<br/>(Git)"]
        D_DB["💾 Dev DB"]
        D_Cache["⚡ Dev Cache"]
    end
    
    subgraph "Staging"
        S_Container["🐳 Container<br/>(Auth Service)"]
        S_DB["💾 Staging DB"]
        S_Cache["⚡ Staging Cache"]
    end
    
    subgraph "Production"
        P_K8s["☸️ Kubernetes<br/>(3 replicas)"]
        P_DB["💾 Production DB<br/>(RDS)"]
        P_Cache["⚡ Production Cache<br/>(ElastiCache)"]
        P_Monitor["📊 Datadog"]
    end
    
    D_Code -->|CI/CD| S_Container
    S_Container -->|Deploy| P_K8s
    S_DB -->|Migrate| P_DB
    
    P_K8s -->|Metrics| P_Monitor
```

## Fase E — Matriz de Comunicación

Usa el template en `references/communication-matrix-template.md` como guía.

Documenta todas las comunicaciones inter-componente:
- Completa la tabla con protocolos, latencias, timeouts y estrategias de retry
- Aplica las reglas de diseño para decidir síncrono vs asíncrono
- Asegura que cada relación del diagrama de componentes esté documentada

## Fase F — Escalabilidad y Límites

```
### Capacidad y Límites

**Auth Service**:
- Max RPS: 10,000 (con 3 replicas)
- Max concurrent connections: 100,000
- Memory per replica: 512MB
- Disk: Stateless (ephemeral)
- Latency p99: <100ms

**Database**:
- Max connections: 100
- Read replicas: 2 (multi-AZ)
- Backup: Daily snapshots
- Max table size: 100GB (partition strategy)

**Cache**:
- Max size: 64GB
- Eviction: LRU
- TTL by key: 1h (sessions), 24h (data)

**Bottlenecks identificados**:
1. Database connections (shared pool)
   → Mitigación: Connection pooling (PgBouncer)
2. Cache hotspot (single node)
   → Mitigación: Cluster mode Redis
3. Gateway rate limiting
   → Mitigación: Token bucket algorithm
```

## Fase G — Resiliencia y Failover

```
### Estrategia de Alta Disponibilidad

**Auth Service Failover**:
- Normal: 3 replicas (load balanced)
- 1 down: Continue (2 replicas, degraded)
- 2 down: Error (1 replica, circuit breaker opens)
- Recovery: Auto-restart via Kubernetes

**Database Failover**:
- Primary: PostgreSQL (primary)
- Standby: PostgreSQL replica (hot standby)
- Failover: Auto (10-30s RTO)
- Backup: S3 snapshots (1h frequency)

**Cache Failover**:
- Mode: Redis Cluster
- Loss: <0.1% data (cluster has replicas)
- Recovery: Auto-healing via cluster

**Circuit Breaker Strategy**:
- Stripe payment fails: Use queue + retry
- Email service down: Log error + continue
- Database down: 503 Service Unavailable
```

## Fase H — Seguridad y Compliance

```
### Seguridad Arquitectónica

**Autenticación**:
- JWT tokens (RS256 signing)
- Token rotation every 1h
- Refresh tokens in secure httpOnly cookies
- PKCE for OAuth flows

**Autorización**:
- RBAC (Role-Based Access Control)
- Per-endpoint auth checks
- Row-level security in DB

**Data Protection**:
- Encryption in transit: TLS 1.3
- Encryption at rest: KMS (AWS)
- PII fields: Encrypted (sensitive columns)

**Network**:
- Private VPC (no public IPs)
- Security groups (firewall rules)
- WAF on Gateway (OWASP top 10)

**Compliance**:
- GDPR: Data residency (EU), right to deletion
- CCPA: Audit logs, consent tracking
- SOC 2: 90-day logs, immutable backups
```

## Fase I — Monitoreo y Observabilidad

```
### Estrategia de Observabilidad

**Logs**:
- Centralized: Datadog
- Retention: 30 days
- Level: DEBUG (dev), INFO (prod)
- Trace IDs: Correlate requests

**Metrics**:
- Request latency (p50, p95, p99)
- Error rate (4xx, 5xx by endpoint)
- Database query time
- Cache hit rate
- Queue depth

**Traces**:
- Distributed tracing (OpenTelemetry)
- Sample rate: 10% (production), 100% (staging)
- Trace spans: Service boundaries

**Alerts**:
- Error rate > 1%: Page oncall
- Latency p99 > 500ms: Warning
- Database connection pool > 80%: Warning
- Cache miss rate > 50%: Investigate
```

## Fase J — Escribir Documentación de Arquitectura

Estructura:

1. **Resumen ejecutivo**: Qué es la arquitectura, decisiones clave
2. **Diagrama de componentes**: Visual C4 Level 2
3. **Diagrama de flujos**: Secuencia de interacciones principales
4. **Diagrama de deployment**: Cómo se deploya en dev/staging/prod
5. **Matriz de comunicación**: Protocolos, latencias, timeouts
6. **Escalabilidad y límites**: Capacidades, bottlenecks
7. **Resiliencia y failover**: HA strategy, recovery RPO/RTO
8. **Seguridad**: Auth, authorization, encryption, compliance
9. **Monitoreo**: Logs, metrics, traces, alertas
10. **Trade-offs**: Decisiones y por qué (enlace a ADRs)
11. **Preguntas abiertas**: Clarificaciones arquitectónicas
12. **Ready for**: `implementation-ready` o `architecture-review`

## Salida

Escribe en: `docs/<domain>/<EPIC-SLUG>-architecture.md`

**Secciones requeridas**:
- Resumen ejecutivo
- Diagrama de componentes (Mermaid)
- Diagrama de flujos principales (Mermaid sequence)
- Diagrama de deployment (Mermaid)
- Matriz de comunicación inter-componentes
- Escalabilidad: capacidades y bottlenecks
- Resiliencia: failover strategy, RPO/RTO
- Seguridad: autenticación, autorización, encryption, compliance
- Monitoreo y observabilidad
- Trade-offs y enlace a ADRs
- Preguntas abiertas
- Ready for (`implementation-ready`, `architecture-review`, `spike`)

Ready for valores:
- `implementation-ready`: Arquitectura clara, listo para implementar
- `architecture-review`: Requiere revisión de arquitecto
- `spike`: Componente desconocido, necesita validación técnica
- `blocked`: Conflicto arquitectónico con sistema existente

## Autoevaluación

Antes de finalizar, verifica:

**Completitud**:
- [ ] Todos los componentes del TRD están representados en el diagrama
- [ ] Cada flujo crítico tiene su diagrama de secuencia
- [ ] La matriz de comunicación cubre todas las relaciones del diagrama
- [ ] Secciones de escalabilidad, resiliencia, seguridad y monitoreo están completas

**Calidad**:
- [ ] Diagramas Mermaid son válidos y renderizan correctamente
- [ ] Latencias y timeouts son realistas para el contexto
- [ ] Trade-offs están documentados con justificación
- [ ] Preguntas abiertas son específicas y accionables

**Consistencia**:
- [ ] Nomenclatura de componentes es consistente entre diagramas
- [ ] Protocolos en matriz coinciden con relaciones en diagramas
- [ ] Estrategias de retry están alineadas con reglas de latencia
- [ ] Decisiones arquitectónicas no contradicen el TRD
