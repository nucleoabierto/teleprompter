# Template de Especificación de Modelo

Template para documentar modelos de datos con campos, índices, validaciones, relaciones y ACLs.

## Formato

```markdown
### [ModelName] (Modelo)
- **Tabla**: [table_name]
- **Campos**:
  - [field_name]: [type], [constraint]
  - [field_name]: [type], [constraint]
- **Índices**:
  - [index_name] (purpose)
  - [index_name] (purpose)
- **Validaciones**:
  - [field]: [validation rule]
  - [field]: [validation rule]
- **Relaciones**:
  - [relation_type]: [RelatedModel]
  - [relation_type]: [RelatedModel]
- **ACLs**:
  - [role/actor]: [permissions]
  - [role/actor]: [permissions]
```

## Ejemplo

### User (Modelo)

- **Tabla**: users
- **Campos**:
  - id: UUID, PK
  - email: string, unique, not null
  - name: string, not null
  - organization_id: UUID, FK → organizations.id
  - role: enum(admin, member, viewer), default=member
  - created_at: timestamp, not null
  - updated_at: timestamp, not null
  - deleted_at: timestamp, nullable (soft delete)
- **Índices**:
  - idx_organization_id (query by org)
  - idx_email (lookup by email)
- **Validaciones**:
  - email: valid format, non-empty
  - name: 1-255 chars
  - organization_id: must exist in organizations table
- **Relaciones**:
  - belongs_to: Organization
  - has_many: api_keys, audit_logs
- **ACLs**:
  - Org admin puede CRUD todos los users en su org
  - User puede leer su propio perfil
  - User NO puede cambiar su propio role

## Guía de uso

- **Campos**: Documentar tipo, PK/FK, constraints (unique, not null, default)
- **Índices**: Listar índices con propósito (query por X, lookup por Y)
- **Validaciones**: Reglas de validación por campo
- **Relaciones**: Tipo de relación (belongs_to, has_many, has_one, many_to_many)
- **ACLs**: Permisos por rol o actor (CRUD, read-only, restricciones específicas)
