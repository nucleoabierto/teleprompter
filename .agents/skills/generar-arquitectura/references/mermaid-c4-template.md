# Template: Diagrama de Componentes C4 (Level 2)

Template para diagramas de componentes usando C4 Model en formato Mermaid.

## Estructura del Diagrama

```mermaid
### Diagrama de Componentes (C4 Model - Level 2)

[Dibujar en Mermaid]

graph TB
    Client["🖥️ Cliente<br/>(Web/Mobile)"]
    Gateway["🚪 API Gateway<br/>(Kong)"]
    Auth["🔐 Auth Service"]
    User["👤 User Service"]
    Profile["📋 Profile Service"]
    DB[("💾 Database<br/>(PostgreSQL)")]
    Cache[("⚡ Cache<br/>(Redis)")]
    Queue["📤 Message Queue<br/>(RabbitMQ)"]
    Stripe["💳 Stripe<br/>(External)"]
    
    Client -->|Request| Gateway
    Gateway -->|Route| Auth
    Gateway -->|Route| User
    Gateway -->|Route| Profile
    
    Auth -->|Query| DB
    User -->|Query| DB
    Profile -->|Query| DB
    
    User -->|Cache| Cache
    Profile -->|Cache| Cache
    
    User -->|Publish| Queue
    Queue -->|Consume| Stripe
    
    style Client fill:#e3f2fd
    style Gateway fill:#fff3e0
    style Auth fill:#f3e5f5
    style User fill:#e8f5e9
    style Profile fill:#e8f5e9
    style DB fill:#fce4ec
    style Cache fill:#fff9c4
    style Queue fill:#ffe0b2
    style Stripe fill:#f1f8e9
```

## Guía de Uso

- **Nodos**: Usa emojis para identificar tipos de componentes (🖥️ cliente, 🚪 gateway, 🔐 auth, 💾 database, etc.)
- **Relaciones**: Etiqueta cada flecha con el tipo de comunicación (Request, Route, Query, Cache, Publish, etc.)
- **Estilos**: Usa colores pastel para diferenciar tipos de componentes
- **Dirección**: `graph TB` (top-bottom) o `graph LR` (left-right) según el layout deseado
