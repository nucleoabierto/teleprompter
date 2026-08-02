# ADR-[Número]: [Título corto de la decisión]

**Status**: Accepted | Proposed | Deprecated | Superseded

**Context**
Describe el problema o pregunta que lleva a esta decisión.
¿Cuáles son las restricciones?
¿Por qué importa?

Ejemplo:
"Nuestro sistema de autenticación legacy no soporta 2FA.
El PRD requiere 2FA para usuarios nuevos.
Necesitamos decidir entre: (1) actualizar legacy auth,
(2) sistema de auth nuevo en paralelo,
(3) tercero (Auth0, Firebase)."

**Decision**
La decisión que tomamos (imperativo, claro, no ambiguo).

Ejemplo:
"Implementaremos autenticación nueva con JWT + TOTP,
en paralelo con legacy auth. Feature flag `new_auth_v2`
controla rollout. Deprecamos legacy en Q4 2025."

**Rationale**
¿Por qué esta decisión es la mejor?
¿Qué criterios evaluamos?

Ejemplo:
"Criterios: tiempo de implementación, costo, seguridad,
flexibilidad futura.

- Legacy update (1): 2 semanas, alto riesgo, toca 50+ archivos
- Nuevo en paralelo (2): 1 semana, bajo riesgo, aislado, fácil rollout
- Tercero (3): 2 días setup, pero vendor lock-in, costo $X/mes
Elegimos (2) porque menor riesgo + control total + bajo tiempo."

**Consequences**
¿Cuáles son las consecuencias de esta decisión?
Incluye positivos y negativos.

**Positivos**:

- Rollout seguro con feature flag
- No afecta users existentes
- Fácil rollback si hay issues

**Negativos**:

- Mantenemos 2 sistemas en paralelo (deuda temporal)
- Testing más complejo (ambos auth paths)
- Deprecation en Q4 = trabajo futuro

**Alternatives Considered**
¿Qué otras opciones evaluamos?
¿Por qué las rechazamos?

Ejemplo:

1. Actualizar legacy auth en lugar
   - Ventaja: un sistema, código más limpio
   - Desventaja: alto riesgo, 2 semanas, toca todo el código
   - Rechazado: riesgo demasiado alto
2. Tercero (Auth0)
   - Ventaja: quick setup, enterprise features
   - Desventaja: vendor lock-in, costo, cambio de UX
   - Rechazado: no tenemos budget este sprint

## References

- Link a TRD relevante
- Link a tareas que implementan esto
- Link a test strategy
- Link a feature flag config

## Related ADRs

- ADR-002: Feature flag strategy
- ADR-005: Data retention policy
