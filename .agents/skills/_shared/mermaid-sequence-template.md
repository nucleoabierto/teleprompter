# Template: Diagrama de Secuencia Mermaid

Template para diagramas de secuencia que documentan flujos de interacción entre componentes.

## Estructura del Diagrama

```mermaid
### Flujo: [Nombre del Flujo]

sequenceDiagram
    participant Client
    participant Gateway
    participant Auth Service
    participant User Service
    participant DB
    participant Email Service
    
    Client->>Gateway: POST /auth/register
    Gateway->>Auth Service: Validate credentials
    Auth Service->>DB: Create user
    DB-->>Auth Service: User ID
    Auth Service->>User Service: Initialize profile
    User Service->>DB: Create profile
    Auth Service->>Email Service: Send welcome email
    Email Service-->>Client: 200 OK + JWT
```

## Guía de Uso

- **Participantes**: Define un participant por cada componente involucrado en el flujo
- **Mensajes síncronos**: Usa `->>` para llamadas síncronas
- **Mensajes asíncronos**: Usa `-->>` para respuestas o mensajes asíncronos
- **Etiquetas**: Describe la acción en cada mensaje (POST, Validate, Create, etc.)
- **Flujos críticos**: Crea un diagrama por cada flujo principal del sistema
