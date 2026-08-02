# Ejemplos de Test Cases

Este archivo contiene ejemplos de código Python para diferentes tipos de test cases, usados como referencia en el skill `sugerir-casos-prueba`.

## Ejemplo de Análisis de Función

```python
### Función: calculate_discount(price: float, tier: str) -> float

**Entrada**:
- price: float >= 0 (USD)
- tier: str in ['bronze', 'silver', 'gold', 'platinum']

**Salida**:
- float >= 0 (discounted price)

**Comportamiento**:
- Apply discount based on tier
- bronze: 0%, silver: 5%, gold: 10%, platinum: 20%
- Round to 2 decimals (cents)

**Efectos secundarios**:
- Log discount transaction (audit trail)

**Errores**:
- price < 0: InvalidPriceError
- tier not in valid list: InvalidTierError
- price > 1M: OverflowError
```

## Happy Path Test Cases

```python
def test_calculate_discount_bronze():
    """Tier bronze gets 0% discount."""
    price = 100.0
    result = calculate_discount(price, 'bronze')
    assert result == 100.0

def test_calculate_discount_silver():
    """Tier silver gets 5% discount."""
    price = 100.0
    result = calculate_discount(price, 'silver')
    assert result == 95.0

def test_calculate_discount_gold():
    """Tier gold gets 10% discount."""
    price = 100.0
    result = calculate_discount(price, 'gold')
    assert result == 90.0

def test_calculate_discount_platinum():
    """Tier platinum gets 20% discount."""
    price = 100.0
    result = calculate_discount(price, 'platinum')
    assert result == 80.0
```

**Regla**: 1 test per happy path variation (aquí: 4 tiers = 4 tests)

## Edge Cases Test Cases

```python
def test_calculate_discount_zero_price():
    """Zero price remains zero."""
    result = calculate_discount(0.0, 'gold')
    assert result == 0.0

def test_calculate_discount_very_small_price():
    """Penny gets discounted correctly."""
    result = calculate_discount(0.01, 'gold')
    assert result == 0.01  # 10% of $0.01 = $0.001 → rounds to $0.01

def test_calculate_discount_very_large_price():
    """Large price doesn't overflow."""
    result = calculate_discount(999999.99, 'gold')
    assert result == 899999.99  # Doesn't overflow

def test_calculate_discount_rounding():
    """Rounding to cents (2 decimals)."""
    result = calculate_discount(33.33, 'silver')
    assert result == 31.66  # 33.33 * 0.95 = 31.6635 → 31.66

def test_calculate_discount_precision():
    """Very precise values handled correctly."""
    result = calculate_discount(100.001, 'gold')
    assert abs(result - 90.0009) < 0.01  # Floating point tolerance
```

**Casos**:

- Zero value
- Minimum value (0.01)
- Maximum value (999999.99)
- Rounding edge cases (0.005 → round up/down?)
- Floating point precision

## Error Cases Test Cases

```python
def test_calculate_discount_negative_price():
    """Negative price raises InvalidPriceError."""
    with pytest.raises(InvalidPriceError):
        calculate_discount(-50.0, 'gold')

def test_calculate_discount_invalid_tier():
    """Invalid tier raises InvalidTierError."""
    with pytest.raises(InvalidTierError):
        calculate_discount(100.0, 'invalid')

def test_calculate_discount_missing_tier():
    """Missing tier raises InvalidTierError."""
    with pytest.raises(InvalidTierError):
        calculate_discount(100.0, '')

def test_calculate_discount_null_tier():
    """None tier raises InvalidTierError."""
    with pytest.raises(InvalidTierError):
        calculate_discount(100.0, None)

def test_calculate_discount_wrong_type_price():
    """String price raises TypeError."""
    with pytest.raises(TypeError):
        calculate_discount("100.0", 'gold')

def test_calculate_discount_wrong_type_tier():
    """Integer tier raises TypeError."""
    with pytest.raises(TypeError):
        calculate_discount(100.0, 123)

def test_calculate_discount_infinity():
    """Infinity price raises OverflowError."""
    with pytest.raises(OverflowError):
        calculate_discount(float('inf'), 'gold')

def test_calculate_discount_nan():
    """NaN price raises ValueError."""
    with pytest.raises(ValueError):
        calculate_discount(float('nan'), 'gold')
```

**Regla**: 1 test per error path (lista todos los Raises en docstring)

## Boundary Cases Test Cases

**Límites definidos**:

- Price: [0, 1000000)
- Tier: 4 options

**Tests**:

```python
def test_price_boundary_zero():
    """Minimum price boundary."""
    assert calculate_discount(0.0, 'gold') == 0.0

def test_price_boundary_just_under_million():
    """Just under max price."""
    assert calculate_discount(999999.99, 'gold') == 899999.99

def test_price_boundary_at_million():
    """At max price should raise."""
    with pytest.raises(OverflowError):
        calculate_discount(1000000.0, 'gold')

def test_price_boundary_just_over_million():
    """Over max price should raise."""
    with pytest.raises(OverflowError):
        calculate_discount(1000000.01, 'gold')
```

## Side Effects Test Cases

**Side effect**: Log transaction in audit trail

```python
def test_calculate_discount_logs_transaction(mock_audit_log):
    """Discount transaction is logged."""
    calculate_discount(100.0, 'gold')
    
    # Verify log was called
    mock_audit_log.log.assert_called_once()
    call_args = mock_audit_log.log.call_args
    assert call_args[0][0] == 'discount_applied'
    assert call_args[0][1]['price'] == 100.0
    assert call_args[0][1]['tier'] == 'gold'
    assert call_args[0][1]['discount_amount'] == 10.0

def test_calculate_discount_audit_includes_timestamp(mock_audit_log):
    """Audit log includes timestamp."""
    calculate_discount(100.0, 'gold')
    call_args = mock_audit_log.log.call_args
    assert 'timestamp' in call_args[0][1]
    assert call_args[0][1]['timestamp'] is not None

def test_calculate_discount_audit_on_error(mock_audit_log):
    """Error cases also logged (for security)."""
    with pytest.raises(InvalidPriceError):
        calculate_discount(-50.0, 'gold')
    
    # Verify error was logged
    mock_audit_log.log_error.assert_called_once()
```

**Regla**: Mock side effects, assert they occurred

## Concurrency Test Cases

Si discount_percentage se actualiza en otro thread:

```python
def test_calculate_discount_concurrent_tier_change():
    """Discount is atomic even if tier changes mid-call."""
    import threading
    
    results = []
    
    def calculate_and_store():
        result = calculate_discount(100.0, 'gold')
        results.append(result)
    
    # Multiple threads calling simultaneously
    threads = [threading.Thread(target=calculate_and_store) for _ in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    
    # All results should be 90.0 (10% discount)
    # NOT mixed (some 90.0, some 95.0)
    assert all(r == 90.0 for r in results)
```

**Regla**: If función usa estado compartido, test concurrency

## Integration Test Cases

```python
def test_discount_then_tax():
    """Discount applied before tax (order matters)."""
    # $100 → 10% discount → $90 → 8% tax → $97.20
    discounted = calculate_discount(100.0, 'gold')
    with_tax = apply_tax(discounted, 0.08)
    assert with_tax == 97.20

def test_tax_then_discount():
    """Tax before discount gives different result."""
    # $100 → 8% tax → $108 → 10% discount → $97.20
    # Same result, but shows order doesn't matter for tax+discount
    with_tax = apply_tax(100.0, 0.08)
    discounted = calculate_discount(with_tax, 'gold')
    assert discounted == 97.20
```

**Regla**: If multiple functions work together, test the combination

## Test Case Matrix

| Caso | Tipo | Unit | Integration | E2E | Manual |
| --- | --- | --- | --- | --- | --- |
| Happy path (4 tiers) | Happy | 4 tests | - | - | - |
| Zero price | Edge | 1 test | - | - | - |
| Small/large price | Edge | 2 tests | - | - | - |
| Rounding | Edge | 2 tests | - | - | - |
| Negative price | Error | 1 test | - | - | - |
| Invalid tier | Error | 3 tests | - | - | - |
| Type errors | Error | 2 tests | - | - | - |
| Infinity/NaN | Error | 2 tests | - | - | - |
| Boundary @ 0 | Boundary | 1 test | - | - | - |
| Boundary @ max | Boundary | 3 tests | - | - | - |
| Audit logging | Side effect | 3 tests | 1 test | - | - |
| Concurrency | Concurrency | 1 test | - | - | - |
| Integration with tax | Integration | - | 2 tests | - | - |

**Total**: 27 unit tests, 3 integration tests, 0 E2E, 0 manual
