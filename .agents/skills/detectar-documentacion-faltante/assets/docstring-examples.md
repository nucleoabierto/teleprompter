# Docstring Examples

## Well Documented Public Function

```python
def calculate_discount(price: float, customer_tier: str) -> float:
    """
    Calculate product discount based on customer tier.
    
    Args:
        price: Product price in USD
        customer_tier: One of 'bronze', 'silver', 'gold'
    
    Returns:
        Discounted price
    
    Raises:
        ValueError: If tier is invalid
    
    Example:
        >>> calculate_discount(100.0, 'gold')
        80.0
    """
    ...
```

## Poorly Documented (Missing Docstring)

```python
def apply_tax(price, tax_rate):
    return price * (1 + tax_rate)
```

## Incomplete Docstring

```python
def get_user_by_id(user_id: int) -> User:
    """Get user by ID."""
    # Falta: Args, Returns, Raises, Example
```

## Well Commented Private Function

```python
def _calculate_rolling_average(values: List[float], window: int) -> float:
    # Use deque for efficient sliding window (O(1) add/remove)
    queue = deque(maxlen=window)
    for value in values:
        queue.append(value)
    # Return average only when window is full
    return sum(queue) / len(queue) if len(queue) == window else None
```

## Complex Logic Without Comments

```python
def _fibonacci_memo(n, cache={}):
    return cache.get(n) or (n if n < 2 else _fibonacci_memo(n-1) + _fibonacci_memo(n-2))
```

## Public API With Example

```python
def create_user(email: str, password: str) -> User:
    """
    Create new user.
    
    Example:
        >>> user = create_user("alice@example.com", "SecurePass123!")
        >>> user.email
        'alice@example.com'
    """
```

## Public API Without Example

```python
def update_user_role(user_id: int, role: str) -> bool:
    """Update user role to admin, moderator, or viewer."""
    # Falta: Example de cómo usar
```

## Edge Cases Documented

```python
def divide(numerator: float, denominator: float) -> float:
    """
    Divide two numbers.
    
    Args:
        numerator: Number to divide
        denominator: Number to divide by
    
    Raises:
        ZeroDivisionError: If denominator is 0
        TypeError: If either arg is not numeric
    
    Note:
        - Returns inf if numerator is very large
        - Returns nan if both are 0 (0/0)
    """
    return numerator / denominator
```

## Edge Cases Not Documented

```python
def find_max(items: List[int]) -> int:
    """Return the maximum item."""
    # Qué pasa si lista vacía? No documentado.
```

## Well Formed TODO

```python
# TODO: Implementar invalidación de cache por TTL. Actualmente el cache
# nunca expira, por lo que se sirve data stale indefinidamente. Agregar
# expiración de 5 minutos para que las entradas se refresquen.
def calculate_expensive_value():
    ...
```

## Poorly Formed TODO/FIXME

```python
# TODO: fix this
def some_function():
    ...

# FIXME: hack
data = hack_data()

# TODO: Cache invalidation strategy (ticket #ALE-042)
# Referencia efímera: el ticket puede desaparecer y el lector futuro
# no sabrá qué queda pendiente ni por qué.
```
