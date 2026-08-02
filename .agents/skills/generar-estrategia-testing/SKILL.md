---
name: generar-estrategia-testing
description: >-
  Genera estrategia completa de testing usando metodología ZOMBIE con matriz
  de cobertura, casos por componente y datos de test. Salida:
  docs/<domain>/<EPIC-SLUG>-test-strategy.md. Úsalo cuando el usuario pida
  planificar, diseñar o definir estrategia de testing. No lo usas para sugerir
  casos de prueba concretos (usar sugerir-casos-prueba) ni para validar tests
  implementados (usar validar-casos-prueba-implementados).
---

# Generador de Test Strategy (ZOMBIE)

Genera estrategia completa de testing con la metodología ZOMBIE (Zero-bugs, One path, Many tests, Behavior-driven, Isolated, Exact). Define qué testeamos, cómo, y dónde.

Solo documentación: no escribe tests. Define la estrategia que los devs implementarán.

## Fase 0 — Resolver entrada

Requerido: `EPIC-SLUG` o `ARCHITECTURE-RUTA`.

Infiere desde:
- Ruta: `docs/**/<EPIC-SLUG>-architecture.md`
- Contenido pegado: si el usuario pega la arquitectura
- Architecture previo: busca el archivo más reciente de `*-architecture.md`

Pregunta cuando falta: "¿Para qué epic genero test strategy? (ruta de architecture.md o epic slug)"

Declara inputs resueltos: epic, arquitectura leída.

## Metodología ZOMBIE

Ver metodología completa en [references/zombie-methodology.md](references/zombie-methodology.md).

Resumen:
- **Z**ero-bugs: Eliminar bugs comunes (null checks, boundary conditions)
- **O**ne path: Happy path primero, edges después
- **M**any tests: Múltiples escenarios por función
- **B**ehavior-driven: Tests verifican comportamiento, no implementación
- **I**solated: Tests son independientes (no dependen de otros)
- **E**xact: Assertions específicas (no vagas)

## Fase A — Identificar Componentes Críticos

De la arquitectura, identifica:
1. **Componentes de riesgo alto**: Lógica de negocio crítica, datos sensibles, integraciones
2. **Componentes de riesgo medio**: APIs públicas, servicios
3. **Componentes de bajo riesgo**: Utilities, helpers

Usa el template de [references/criticality-matrix-template.md](references/criticality-matrix-template.md) para documentar la matriz de criticidad.

## Fase B — Estrategia ZOMBIE por Componente

Para cada componente crítico, define:

```
### Auth Service - Test Strategy (ZOMBIE)

#### Z - Zero-bugs (Errores comunes a evitar)
- ❌ Null pointer en JWT decode
  → ✅ Always validate token exists before decode
- ❌ Race condition en refresh token
  → ✅ Atomic transaction for token rotation
- ❌ Timing attack en password compare
  → ✅ Constant-time comparison

#### O - One path (Happy path primero)
**Happy path**: User → POST /login → valid creds → JWT token

```python
def test_login_valid_credentials():
    # Given
    user = create_user(email="user@example.com", password="correct_pass")
    
    # When
    response = login(email="user@example.com", password="correct_pass")
    
    # Then
    assert response.status_code == 200
    assert response.jwt_token exists
    assert jwt_decode(response.jwt_token).user_id == user.id
```

#### M - Many tests (Múltiples escenarios)

**Valid login scenarios**:
- Email + password correcto
- Username + password correcto (si soporta)
- Login después de reset password

**Invalid login scenarios**:
- Password incorrecto
- User no existe
- User desactivado
- User bloqueado por 2FA

**Edge cases**:
- Email con espacios (trimmed)
- Password con caracteres especiales
- Email case-insensitive
- Concurrent login attempts (race condition)
- Login after account deletion

**Security scenarios**:
- Brute force (5 intentos = lockout)
- Token expiration (stale token)
- Tampered token (modified)
- CSRF token mismatch

#### B - Behavior-driven (Qué hace, no cómo)

```python
# ❌ Implementation-focused (BAD)
def test_hash_function():
    assert hash("password") == "asfasfafasfasf"

# ✅ Behavior-focused (GOOD)
def test_password_protected():
    user = create_user(password="secret123")
    # Password stored is NOT "secret123"
    assert user.password_hash != "secret123"
    # But login with plain text works
    assert login("secret123").success == True
```

#### I - Isolated (Tests no dependen)

```python
# ❌ NOT isolated (BAD)
def test_create_user():
    user = User.create(email="u@test.com")
    # test_login_uses_user depende de este test
    
def test_login_uses_user():
    # Asume que test_create_user ya corrió
    # Si test_create_user falla, este tampoco corre

# ✅ Isolated (GOOD)
def test_create_user():
    user = create_user(email="u1@test.com")  # unique email
    assert user.id exists
    
def test_login_uses_user():
    user = create_user(email="u2@test.com")  # fresh user
    assert login(email="u2@test.com").success == True
```

#### E - Exact (Assertions específicas)

```python
# ❌ Vague (BAD)
def test_login():
    response = login()
    assert response is not None
    assert response.data is not None

# ✅ Exact (GOOD)
def test_login_returns_jwt():
    response = login(email="u@test.com", password="pass123")
    assert response.status_code == 200
    assert response.jwt_token is not None
    assert response.jwt_token.length > 100
    assert jwt_decode(response.jwt_token).exp > now()
    assert jwt_decode(response.jwt_token).user_id == expected_user_id
```

## Fase C — Matriz de Cobertura por Nivel

Usa el template de [references/coverage-matrix-template.md](references/coverage-matrix-template.md) para documentar la matriz de cobertura por nivel.

## Fase D — Datos de Test (Test Data Strategy)

```
### Test Data

**Fixtures (Datos conocidos)**:
- Valid user: id=1, email="alice@test.com"
- Admin user: id=2, email="admin@test.com", role=admin
- Inactive user: id=3, email="inactive@test.com", status=inactive

**Generators (Datos aleatorios)**:
- Random email: faker.email()
- Random UUID: uuid4()
- Random timestamp: faker.date_time()

**Strategies**:
- Use fixtures for deterministic behavior
- Use generators for concurrency/race condition tests
- Always clean up (teardown) after test
- Use transactions (rollback) to avoid test pollution
```

## Fase E — Testing por Tipo

### Unit Tests
```
### Unit Test Strategy

**Qué**: Función/clase aislada
**Dónde**: src/service/test_auth.py
**Mock**: Todas las dependencias (DB, API, Cache)
**Tiempo**: <10ms por test
**Count**: 1-3 tests por función

Ejemplo:
def test_validate_email():
    # No mocks needed (pure function)
    result = validate_email("user@example.com")
    assert result == True
    
    result = validate_email("invalid")
    assert result == False
```

### Integration Tests
```
### Integration Test Strategy

**Qué**: Función + dependencias reales (DB, cache)
**Dónde**: tests/integration/test_auth_integration.py
**Mock**: APIs externas solo (Stripe, SendGrid)
**Tiempo**: <100ms por test
**Setup**: Real test database, fresh state per test

Ejemplo:
def test_create_user_persists_to_db():
    # Real DB, no mocks
    user = user_service.create_user(email="new@test.com")
    
    # Query DB directly to verify
    db_user = db.query(User).filter_by(email="new@test.com")
    assert db_user.id == user.id
```

### E2E Tests
```
### E2E Test Strategy

**Qué**: Workflow completo (UI → API → DB)
**Dónde**: tests/e2e/test_auth_e2e.py
**Mock**: Nada (sistema completo)
**Tiempo**: <1s per test (puede ser más lento)
**Count**: Solo critical paths (5-10 tests)

Ejemplo:
def test_user_registration_complete_flow():
    # Start at homepage
    browser.get("https://app.test.com/signup")
    browser.fill("email", "newuser@test.com")
    browser.fill("password", "SecurePass123!")
    browser.click("Sign up")
    
    # Verify user created in DB
    user = db.query(User).filter_by(email="newuser@test.com")
    assert user exists
    
    # Verify email sent
    assert mailbox.find(to="newuser@test.com").subject == "Welcome!"
```

## Fase F — Escenarios Críticos (Security, Performance)

```
### Escenarios Críticos

#### Security Testing
- SQL injection (prepared statements)
- XSS (HTML escaping)
- CSRF (token validation)
- Brute force (rate limiting)
- Privilege escalation (role checks)

#### Performance Testing
- 1000 concurrent logins → <1s latency
- Cache miss → DB fallback works
- Database connection pool exhaustion → graceful degradation

#### Reliability Testing
- Service down → circuit breaker activates
- Network timeout → retry logic works
- Stale data → cache invalidation works
```

## Fase G — Validaciones por Layer

```
### Validaciones por Capa

**API Layer**:
- Request validation (schema)
- Response format (status, body)
- Error handling (4xx, 5xx)
- Rate limiting
- Authentication headers

**Service Layer**:
- Business logic correctness
- Error handling
- Logging
- Side effects (email, cache update)

**Data Layer**:
- Schema constraints (unique, not null)
- Foreign key relationships
- Transaction atomicity
- Query performance (< 100ms)

**External Integration**:
- API contract validation
- Retry behavior
- Timeout handling
- Webhook signature verification
```

## Fase H — Escribir Test Strategy

Estructura:

1. **Resumen ejecutivo**: Estrategia ZOMBIE para epic
2. **Matriz de criticidad**: Componentes por riesgo
3. **ZOMBIE por componente**: Z, O, M, B, I, E
4. **Matriz de cobertura**: Unit/Integration/E2E goals
5. **Test data strategy**: Fixtures, generators
6. **Unit test strategy**: Scope, mocks, timing
7. **Integration test strategy**: Real DB/cache
8. **E2E test strategy**: Complete workflows
9. **Escenarios críticos**: Security, performance, reliability
10. **Validaciones por layer**: API, Service, Data, External
11. **Preguntas abiertas**: Clarificaciones
12. **Ready for**: `implementation-ready` o `blocked`

## Salida

Escribe en: `docs/<domain>/<EPIC-SLUG>-test-strategy.md`

**Secciones requeridas**:
- Resumen ejecutivo con ZOMBIE
- Matriz de criticidad de componentes
- ZOMBIE desagregado por componente crítico
- Matriz de cobertura (Unit/Integration/E2E)
- Test data strategy (fixtures, generators)
- Unit testing strategy con ejemplos
- Integration testing strategy
- E2E testing strategy
- Escenarios críticos (security, performance, reliability)
- Validaciones por layer
- Preguntas abiertas
- Ready for (`implementation-ready`, `blocked`)

Ready for valores:
- `implementation-ready`: Test strategy clara, devs pueden implementar
- `blocked`: Unknowns sobre testing, necesita clarificación
- `refine-strategy`: Test strategy incompleta

## Autoevaluación

Antes de finalizar, verifica:

- [ ] **Entradas resueltas**: EPIC-SLUG o ARCHITECTURE-RUTA identificado correctamente
- [ ] **Arquitectura leída**: Documento de arquitectura existe y es accesible
- [ ] **Componentes identificados**: Todos los componentes de la arquitectura están clasificados por criticidad
- [ ] **Matriz de criticidad completa**: Cada componente tiene nivel de riesgo y justificación
- [ ] **ZOMBIE aplicado**: Cada componente crítico tiene estrategia ZOMBIE desagregada
- [ ] **Matriz de cobertura definida**: Objetivos de cobertura por nivel (Unit/Integration/E2E/Manual)
- [ ] **Test data strategy**: Fixtures y generators documentados
- [ ] **Estrategias por tipo**: Unit, Integration, E2E con ejemplos claros
- [ ] **Escenarios críticos**: Security, performance, reliability identificados
- [ ] **Validaciones por layer**: API, Service, Data, External documentadas
- [ ] **Preguntas abiertas**: Unknowns documentados en sección específica
- [ ] **Ready for valor correcto**: `implementation-ready`, `blocked` o `refine-strategy` según estado
- [ ] **Archivo escrito**: docs/<domain>/<EPIC-SLUG>-test-strategy.md creado con todas las secciones
- [ ] **Referencias usadas**: Templates de _shared referenced correctamente en el documento generado
