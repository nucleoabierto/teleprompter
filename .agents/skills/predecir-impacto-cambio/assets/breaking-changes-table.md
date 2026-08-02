# Breaking Changes

| Cambio                                              | Tipo   | Impacto                                 | Severidad |
| -----------------------------------------------------| --------| -----------------------------------------| -----------|
| DELETE endpoint `/users/{id}`                       | API    | Clients con hard-coded calls fallarán   | Alto      |
| Rename field `email` → `email_address`              | Schema | Queries/ORM que usan `email` fallarán   | Alto      |
| Change param type `status: string` → `status: enum` | API    | Clients sending strings harán error 422 | Medio     |
| Add required field `phone` (no default)             | Schema | Insert queries without phone fallarán   | Alto      |
| Reduce max request size 100MB → 10MB                | API    | Uploads grandes fallarán                | Medio     |
