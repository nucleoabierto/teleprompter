# Dominio: configuracion-ia

Dominio para la gestión y distribución de configuraciones de agentes de IA. Incluye herramientas para empaquetar, instalar, versionar y personalizar configuraciones compartidas entre repositorios.

## Puntos de entrada

| Quiero…                                   | Ir a                                                                     |
|-------------------------------------------|--------------------------------------------------------------------------|
| Ver el análisis de la idea original       | [idea/teleprompter/idea-analysis.md](idea/teleprompter/idea-analysis.md) |
| Ver el roadmap consolidado del dominio    | roadmap.md (pendiente)                                                   |
| Conocer a los usuarios (personas)         | personas/README.md (pendiente)                                           |
| Ver las decisiones arquitectónicas (ADRs) | adr/README.md (pendiente)                                                |
| Ver el PRD activo                         | initiatives/ (pendiente)                                                 |
| Ver el estado global de los epics del PRD | initiatives/ (pendiente)                                                 |

## Estructura del dominio

```text
docs/configuracion-ia/
├── README.md                           # Índice del dominio (este archivo)
├── idea/                               # Análisis de ideas brutas
│   └── teleprompter/
│       └── idea-analysis.md            # Descripción narrativa del producto
├── initiatives/                        # Iniciativas y PRDs (pendiente)
├── personas/                           # Personas canónicas del dominio (pendiente)
├── adr/                                # Architecture Decision Records (pendiente)
└── roadmap.md                          # Roadmap consolidado del dominio (pendiente)
```

## Convenciones

- **Dominio como carpeta raíz**: `docs/configuracion-ia/...`
- **README.md como índice**: cada carpeta navegable usa `README.md` como índice (no `INDEX.md`)
- **Personas canónicas**: se almacenan en `personas/` (una por archivo, compartidas entre iniciativas)
- **Roadmap consolidado**: el roadmap global del dominio vive en `roadmap.md`
- **ADRs planos**: las decisiones arquitectónicas se almacenan en `adr/` con numeración global
- **STATUS.md por epic**: cada epic tiene un archivo de estado de seguimiento
- **Nombres explícitos**:
  - `product-viability.md` para viabilidad de producto
  - `technical-viability-assessment.md` para viabilidad técnica
  - `epic-prioritization.md` para priorización de epics dentro de un PRD
  - `feature-prioritization.md` para priorización de features/PRDs entre sí
- **Formato de slugs**:
  - Ideas: `<IDEA-SLUG>/idea-analysis.md` (subdirectorio)
  - PRDs: `initiatives/<PRD-SLUG>/prd.md`
  - Epics: `initiatives/<PRD-SLUG>/epics/<EPIC-SLUG>/`
