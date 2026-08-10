# Guía de Evaluación y Roadmap de Alcance

Esta guía define cómo evaluar el alcance de una idea y generar un plan de implementación. El output es un **documento de decisión** que combina evaluación estratégica con planificación táctica.

## Objetivo del documento

Responder estas 4 preguntas fundamentales:

1. ¿Merece esta idea inversión? (fail-fast estratégico)
2. ¿Es una funcionalidad o múltiples?
3. Si múltiples: ¿cuáles son y en qué orden?
4. ¿Qué decisiones pendientes bloquean el avance?

## Estructura del documento

### 1. Evaluación Estratégica (Fail-Fast)

**Propósito**: Decidir si invertir tiempo en esta idea o descartarla rápidamente.

**Formato**:

```markdown
## Evaluación Estratégica

- **Veredicto**: [Proceder | No proceder | Condicionado]
- **Alineación**: [Descripción de cómo se alinea (o no) con la visión del producto]
- **Tamaño**: [full | lite]
- **Justificación**: [Por qué este veredicto]
```

**Instrucciones**:

- Si "No proceder": detener aquí, el workflow termina
- Si "Condicionado": documentar qué condición debe cumplirse
- La justificación debe citar criterios específicos de `viability-gate-guide.md`

### 2. Clasificación de Alcance

**Propósito**: Determinar si la idea es una funcionalidad cohesiva o múltiples independientes.

**Formato**:

```markdown
## Clasificación de Alcance

- **Tipo**: [Funcionalidad única | Múltiples funcionalidades]
- **Justificación**: [Criterios específicos de scope-analysis-guide.md]
```

**Instrucciones**:

- Citar específicamente qué criterios aplicaron (ej: "3 bounded contexts impactados", "alta complejidad técnica")
- Si la clasificación fue ambigua, documentar el proceso de experimento mental y mapeo de código realizado
- Consulta [scope-analysis-guide.md](scope-analysis-guide.md) para la lógica completa de criterios, estrategia de fallo y experimento mental de implementación

### 3. Roadmap de Funcionalidades

**Propósito**: Si hay múltiples funcionalidades, definir qué son, su alcance, dependencias y orden.

**Formato**:

```markdown
## Roadmap de Funcionalidades

### [Nombre de funcionalidad 1]
- **Alcance**: [qué incluye]
- **Valor**: [valor para usuario]
- **Depende de**: [otras funcionalidades o "ninguno"]
- **Estado**: [bloqueada | lista | condicionada]

### [Nombre de funcionalidad 2]
- **Alcance**: [qué incluye]
- **Valor**: [valor para usuario]
- **Depende de**: [otras funcionalidades o "ninguno"]
- **Estado**: [bloqueada | lista | condicionada]
```

**Instrucciones**:

- **Nombre**: kebab-case, descriptivo (usado como heading de sección)
- **Alcance**: 1-2 frases específicas que delimiten claramente qué incluye y qué no (ej: "Email + push básicos para alertas críticas" vs "Email + push básicos")
- **Valor**: beneficio específico y diferenciado para el usuario, no técnico
- **Depende de**: nombres de otras funcionalidades o "ninguno"
- **Estado**: basado en decisiones pendientes (ver sección 5)

**Si es funcionalidad única**: usa una sola sección.

### 4. Desglose por Funcionalidad

**Propósito**: Para cada funcionalidad, definir fases de implementación y decisiones clave. Realiza la división de la forma más comprensiva posible, generando todas las sub funcionalidades o dividiendo el trabajo de forma que se pueda desarrollar de forma progresiva en pasos pequeños y autocontenidos.

**Formato**:

```markdown
## Desglose: [Nombre de funcionalidad]

### Fases
1. **[Fase 1]**: [descripción]
2. **[Fase 2]**: [descripción]

### Decisiones
- **Resuelta ([fecha])**: [decisión] - [rationale]
- **Pendiente**: [decisión] - [opciones con trade-offs]
```

**Instrucciones**:

- Mínimo 2 fases por funcionalidad (MVP + expansión)
- Las descripciones de fase deben ser específicas y detalladas (ej: "Infraestructura de envío: Configuración de SendGrid, setup de templates, sistema de colas")
- Cada fase debe representar un entregable tangible con valor incremental
- Decisiones resueltas incluyen fecha y justificación
- Decisiones pendientes alimentan la sección 5

### 5. Decisiones Pendientes y Next Steps

**Propósito**: Identificar qué bloquea el avance y definir próximos pasos.

**Formato**:

```markdown
## Decisiones Pendientes

### Críticas (bloquean avance)
- [Pregunta]: [opciones] - [impacto si no se resuelve]

### Importantes (afectan calidad)
- [Pregunta]: [opciones] - [impacto si no se resuelve]

### Menores (ideal resolver)
- [Pregunta]: [opciones] - [impacto si no se resuelve]

## Recomendación

- **Empezar con**: [funcionalidad]
- **Next step**: [priorizar-roadmap | evaluar-conectividad-tecnica | bloqueado]
- **Justificación**: [por qué este orden y next step]
```

**Instrucciones**:

- Clasificar según severidad de `advancement-gate-guide.md`
- Next step depende de: ¿hay críticas? → bloqueado; ¿múltiples funcionalidades? → priorizar-roadmap; ¿única? → evaluar-conectividad-tecnica

## Validación

El documento está completo cuando:

1. La evaluación estratégica tiene veredicto claro con justificación
2. La clasificación de alcance cita criterios específicos
3. El roadmap de funcionalidades tiene dependencias claras y alcances específicos
4. Cada funcionalidad tiene desglose con fases detalladas y decisiones
5. Las fases tienen descripciones específicas (no genéricas) que explican qué se entrega
6. Las decisiones pendientes están clasificadas por severidad (críticas/importantes/menores)
7. La recomendación tiene next step consistente con el estado

## Ejemplo Completo

Para un ejemplo completo del documento final, consulta [examples/example-scope-roadmap.md](examples/example-scope-roadmap.md).

## Principios de Diseño

1. **Un solo documento de verdad**: Evita redundancia entre roadmap y desglose
2. **Decisión-first**: Estructura alrededor de decisiones que deben tomarse
3. **Acción-oriented**: Cada sección lleva a una acción específica
4. **Minimalismo viable**: Solo información necesaria para avanzar al siguiente step
5. **Traceabilidad**: Decisiones pendientes conectadas claramente a funcionalidades específicas
