# Guía de resolución de dominio

Lógica completa para determinar `domain` durante la Fase B.

## Qué es `domain`

`domain` es la carpeta raíz de organización persistente que agrupa todos los artefactos del workflow de PRD.

## Cómo informa el nivel de la idea

El diagnóstico de nivel (Producto vs Feature) de la Fase A informa la lógica de resolución:

- **Feature** → el dominio es el del producto existente que extiende. No crea dominio nuevo.
- **Producto** → puede definir un espacio nuevo (dominio nuevo) o encajar en un área existente si la iniciativa cae bajo un dominio ya cubierto.

## Pasos

### 1. Inventariar dominios existentes

Lista las carpetas de dominios en `docs/`. Si `docs/` no tiene estructura de dominios, no hay candidatos existentes.

### 2. Inferir candidatos desde la idea

Deriva 1–3 candidatos en kebab-case del área de producto que la idea describe (no del nombre técnico). Ej: "notificaciones push" → `reportes` (si extiende reportes) o `notificaciones` (si es un espacio nuevo). El dominio refleja un área de producto, no un módulo técnico.

### 3. Filtrar por nivel

- **Feature**: los candidatos se restringen a dominios existentes en `docs/`. Si la idea extiende un producto cuyo dominio ya está documentado, ese es el candidato. Si no hay `docs/` con dominios, infiere del módulo del codebase que el feature extiende y propónlo como candidato único.
- **Producto**: los candidatos pueden ser dominios existentes (si la iniciativa encaja en un área ya cubierta) o un dominio nuevo derivado del área de producto.

### 4. Decidir

- **0 candidatos**: pregunta al usuario por el dominio. No inventes.
- **1 candidato**: úsalo. No requiere confirmación si la inferencia es clara.
- **>1 candidatos**: usa `ask_user_question` con los candidatos para que el usuario decida. Incluye siempre una opción "Otro" para que el usuario proponga un dominio no listado.

## Reglas

- El dominio es kebab-case, representa un área de producto (no técnica: "reportes" no "reporting-service").
- Si no hay evidencia suficiente para inferir, pregunta al usuario.
- El dominio se declara en el frontmatter del artefacto (`domain: <valor>`) y se usa en todos los paths de salida (`docs/<domain>/idea/<IDEA-SLUG>/idea-analysis.md`, `docs/<domain>/README.md`).
