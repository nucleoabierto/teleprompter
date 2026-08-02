# Template: Matriz de Comunicación Inter-Componente

Template para documentar la comunicación entre componentes del sistema.

## Estructura de la Matriz

```markdown
### Inter-component Communication

| De      | A       | Protocolo | Latencia | Timeout | Retry       |
|---------|---------|-----------|----------|---------|-------------|
| Client  | Gateway | HTTP/REST | <100ms   | 30s     | 3x          |
| Gateway | Auth    | gRPC      | <50ms    | 10s     | 2x          |
| Auth    | DB      | SQL       | <20ms    | 5s      | None        |
| Auth    | Queue   | AMQP      | <100ms   | N/A     | Auto        |
| Service | Cache   | Redis     | <5ms     | 2s      | Fallback DB |
| Queue   | Stripe  | Webhook   | <500ms   | 60s     | 24h retry   |

**Reglas**:
- <100ms: Sincrónico (REST/gRPC)
- 100-500ms: Asincrónico recomendado (queue)
- >500ms: Definitivamente asincrónico
```

## Guía de Uso

- **De/A**: Origen y destino de la comunicación
- **Protocolo**: Tipo de protocolo (HTTP/REST, gRPC, SQL, AMQP, Redis, Webhook, etc.)
- **Latencia**: Latencia esperada (ej: <100ms, <50ms, <20ms, <5ms, <500ms)
- **Timeout**: Tiempo máximo de espera (ej: 30s, 10s, 5s, 2s, 60s, N/A)
- **Retry**: Estrategia de reintentos (ej: 3x, 2x, None, Auto, Fallback DB, 24h retry)

## Reglas de Diseño

Documenta las reglas de diseño para decidir entre comunicación síncrona y asíncrona basándose en latencia:

- **<100ms**: Sincrónico (REST/gRPC) - respuesta inmediata aceptable
- **100-500ms**: Asincrónico recomendado (queue) - puede causar fricción en UX
- **>500ms**: Definitivamente asincrónico - bloquearía la experiencia del usuario
