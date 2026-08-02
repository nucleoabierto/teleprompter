# Ejemplos de Análisis de Impacto

## Mapeo de Dependencias

```python
# Buscar qué servicios usan this code
grep -r "def get_user" src/
# Resultado: user_service.py, auth_service.py, api.py

# Buscar qué métodos esos servicios exponen
grep -r "class.*Service" src/
# Resultado: UserService.get_user() used by AuthService.login()

# Buscar qué consume AuthService
grep -r "from auth_service import\|AuthService\(" .
# Resultado: app.py, tests/, integration_tests/
```

## Cambios de Comportamiento

### Nueva lógica
```python
# Antes: Email siempre enviado en login
def login(email, password):
    user = authenticate(email, password)
    send_login_email(user)  # ← Always
    return token

# Después: Email enviado solo si 2FA enabled
def login(email, password):
    user = authenticate(email, password)
    if user.two_factor_enabled:
        send_login_email(user)  # ← Conditional
    return token
```

### Cambio de orden/timing
```python
# Antes: Create user, then send email
def register(email):
    user = create_user(email)
    send_welcome_email(user)
    return user

# Después: Send email, then create user (async)
def register(email):
    enqueue_welcome_email(email)  # Async
    user = create_user(email)
    return user
```

### Cambio de responsabilidad
```python
# Antes: UserService calculates discount
def get_discounted_price(user_id):
    return calculate_discount(user_id)

# Después: PricingService hace el cálculo
def get_discounted_price(user_id):
    return pricing_service.calculate_discount(user_id)
```

## Performance Impact

### New Database Query
```python
# Antes: 1 query (get user)
def get_user_profile(user_id):
    return db.query(User).get(user_id)

# Después: 3 queries (user + preferences + notifications)
def get_user_profile(user_id):
    user = db.query(User).get(user_id)
    prefs = db.query(Preferences).filter_by(user_id=user_id)
    notifs = db.query(Notifications).filter_by(user_id=user_id)
    return {user, prefs, notifs}
```

### New External API Call
```python
# Antes: Local calculation
def verify_address(address):
    return address in known_addresses

# Después: Call external geocoding API
def verify_address(address):
    return geocoding_api.verify(address)
```

## Seguridad

### Nueva entrada de usuario
```python
# Antes: email validado (known format)
def create_user(email):
    return User.create(email=email)

# Después: Acepta campo nuevo `bio`
def create_user(email, bio):
    return User.create(email=email, bio=bio)
```

### Cambio en autenticación/autorización
```python
# Antes: Admin solo
def delete_user(user_id):
    require_admin()
    db.delete(User, user_id)

# Después: User o Admin
def delete_user(user_id):
    require(is_admin() or owns(user_id))  # ← More permissive
    db.delete(User, user_id)
```
