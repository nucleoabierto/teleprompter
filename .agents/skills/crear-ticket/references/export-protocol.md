# Protocolo de exportación de tickets

El borrador es un markdown genérico que puede exportarse a cualquier herramienta de gestión. Cuando el usuario solicite exportar:

## Pasos de exportación

1. Identifica la herramienta de destino
2. Mapea los metadatos genéricos al formato específico de la herramienta:
   - Proyecto → project/team en la herramienta
   - Epic padre → parent issue/epic
   - Estimación → estimate points/field
   - Prioridad → priority field
   - Relaciones → depends on/blocks/related links
   - Etiquetas → labels/tags
3. Crea el ticket en la herramienta usando el MCP correspondiente o instrucciones manuales
4. Actualiza el archivo local con el ID de la herramienta asignado (si aplica)

## Metadatos genéricos

Los metadatos son independientes de la herramienta de gestión y pueden mapearse a cualquier sistema:

- Proyecto / área
- Epic padre (referencia por ID o slug genérico)
- Estimación (puntos + T-shirt size)
- Prioridad (cuando se conozca y sea útil)
- Relaciones: bloqueadoPor / bloquea / relacionadoCon cuando hay una cadena de dependencia real (referencia por ID o slug de ticket)
- Etiquetas (labels) solo cuando se conozcan y sean útiles
