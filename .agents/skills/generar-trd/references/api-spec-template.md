# Template de Especificación API

Template para documentar endpoints de API con autenticación, payloads, responses y rate limits.

## Formato

````markdown
### [METHOD] /path/to/endpoint
- **Autenticación**: [tipo de autenticación]
- **Body**:
  ```json
  {
    "field1": "type, constraint",
    "field2": "type, required/optional"
  }
  ```

- **Responses**:
  - [status]: [Status Name] → `{response_schema}`
  - [status]: [Error Name] → `{error_schema}`
- **Rate limit**: [limit description]
- **Side effects**:
  - [efecto secundario 1]
  - [efecto secundario 2]
````

## Ejemplo

### POST /api/v1/users

- **Autenticación**: Bearer token (OAuth2)
- **Body**:

  ```json
  {
    "email": "string, required, unique",
    "name": "string, required",
    "organization_id": "uuid, required"
  }
  ```

- **Responses**:
  - 201: Created → `{id, email, name, created_at}`
  - 400: Bad Request → `{error: "email already exists"}`
  - 401: Unauthorized
  - 422: Validation Error
- **Rate limit**: 100 req/min per user
- **Side effects**:
  - Envia email de bienvenida (async)
  - Crea default workspace para user

## Guía de uso

- **Autenticación**: Especificar el tipo (Bearer token, API key, OAuth2, etc.)
- **Body**: Documentar cada campo con tipo y restricciones
- **Responses**: Listar códigos de estado relevantes con esquemas de respuesta
- **Rate limit**: Especificar límites si aplica
- **Side effects**: Documentar efectos secundarios asíncronos o colaterales
