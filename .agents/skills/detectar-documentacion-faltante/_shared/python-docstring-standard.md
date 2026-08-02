# Python Docstring Standard (Google Style)

## Function Docstring Template

```python
def function_name(arg1: type, arg2: type) -> return_type:
    """
    Brief description of what the function does.

    Args:
        arg1: Description of arg1
        arg2: Description of arg2

    Returns:
        Description of return value

    Raises:
        ExceptionType: When this exception occurs

    Example:
        >>> function_name(value1, value2)
        expected_result
    """
```

## Class Docstring Template

```python
class ClassName:
    """
    Brief description of the class.

    Attributes:
        attr1: Description of attr1
        attr2: Description of attr2

    Example:
        >>> obj = ClassName()
        >>> obj.method()
        expected_result
    """
```

## Required Sections

- **Description**: Brief one-line summary
- **Args**: For all parameters (including optional)
- **Returns**: For non-None return values
- **Raises**: For all documented exceptions
- **Example**: For public APIs

## Optional Sections

- **Attributes**: For class attributes
- **Note**: Additional context
- **Todo**: Known limitations or future work
