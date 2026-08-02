# Guía de escritura directa

Rúbrica de auditoría para todo el contenido de un skill: `SKILL.md`, `description` YAML, referencias (`references/`), assets (`assets/`), scripts (`scripts/`) y cualquier documentación asociada.

Los skills deben decirle al agente qué hacer cuando falta información — no solo qué evitar.

**Principio central**: las prohibiciones vagas (`inventar`, `alucinar`, `no adivines`) fallan silenciosamente. Empareja cada regla de manejo de "gaps" con una acción concreta: preguntar, detener, listar bajo Preguntas abiertas, o citar evidencia.

**Contexto de aplicación**: esta guía aplica durante la revisión de skills nuevos o modificados, y durante la creación de contenido para SKILL.md, referencias, assets y scripts. El objetivo es que el agente tenga instrucciones ejecutables, no solo restricciones.

## Contenido

### "Scan" (requerido en toda revisión)

Busca en todos los archivos del skill bajo revisión (`SKILL.md`, `description` YAML, `references/`, `assets/`, `scripts/`) frases vagas:

```text
invent | alucin | inventar | adivinar | asumir | suponer
usar juicio | usar tu criterio | con cuidado | cuando aplique | según sea necesario
ayuda con | asiste | maneja | algo como | etc. | etcétera
no .* sin  (líneas negativas sin sustituto positivo en el mismo bullet)
```

Registra cada "hit" con referencia de línea y archivo. Para cada "hit", marca pass | partial | fail.

**Ejemplo de hit**:

```text
file: references/file-discovery.md
line: 42
evidence: "no inventes respuestas"
veredicto: fail (sin sustituto en el mismo bullet)
```

### Veredicto por "hit"

- **pass**: El mismo "bullet" o la oración adyacente proporciona un sustituto directo (preguntar, detener, Preguntas abiertas, evidencia, hermano nombrado)
- **partial**: El sustituto existe pero está separado (sección diferente) o el texto aún combina la frase vaga con la corrección
- **fail**: Solo prohibición vaga o relleno — sin acción concreta

### Reemplazos vago → directo

- **No inventes / alucines / fabriques…** → Coloca lo desconocido en Preguntas abiertas. Antes de Fase B, haz una pregunta enfocada (ej: "¿Qué criterios de aceptación faltan?")
- **No adivines / asumas…** → Detén hasta que `<input requerido>` se resuelva desde `<lista de fuentes>`
- **Usa juicio / cuando aplique / según sea necesario** → Nombra la decisión: Si `<condición>`, entonces `<acción>`; si no, `<acción alternativa>`
- **Ayuda con / asiste / maneja** → Nombra entregable + verbo: Escribe / Lee / Puntúa + ruta o artefacto
- **etc. / etcétera** → Lista el conjunto cerrado o apunta a `references/`
- **No expandas el alcance** → Estaciona items fuera de alcance en `<sección>` — no en commits

Patrón aceptable: frontera de una línea + ruta directa en la misma línea. Ver el ejemplo en la sección "Ejemplos y evidencia".

### Lenguaje activo y específico

Prefiere el lenguaje activo y específico sobre el pasivo y genérico.

- "Se debe considerar que…" → "Considera…"
- "Es recomendable que…" → "Recomienda…"
- "El sistema debe ser capaz de…" → "El sistema debe…"
- "Se realizó una revisión de…" → "Revisamos…"
- "Para lograr el objetivo…" → "Para lograr <objetivo específico>…"

Usa voz activa cuando el sujeto es conocido. Usa verbos de acción directa.

### Consistencia de terminología

Usa un concepto, una palabra en todo el documento. No mezcles sinónimos para el mismo concepto.

| Inconsistente (evitar)               | Consistente (preferir)           |
|--------------------------------------|----------------------------------|
| customer / client / user             | `user` (o el término de dominio) |
| feature / functionality / capability | `feature`                        |
| repo / repository / codebase         | `repository`                     |
| fix / correction / patch             | `fix`                            |
| workflow / flujo                     | `workflow` (término técnico)     |

Si necesitas introducir un sinónimo, hazlo explícito: "user (también llamado customer en el dominio de ventas)".

### Longitud y estructura de párrafos

- Párrafos de 1–3 oraciones para máxima legibilidad
- Una idea por párrafo
- Usa listas para enumerar items relacionados
- Separa conceptos distintos con headings o párrafos

Párrafos largos (>4 oraciones) dificultan la lectura rápida. Si un párrafo crece, divídelo.

### Ejemplos y evidencia

Cuando declares una regla o patrón, acompáñala con:

- Un ejemplo concreto (bloque de código, snippet de texto)
- Un contraejemplo de qué evitar
- Evidencia de por qué funciona (si aplica)

Ejemplo de patrón bien documentado:

```markdown
## Patrón aceptable

Pon lo desconocido en Preguntas abiertas. Antes de puntuar, haz una pregunta enfocada si faltan criterios de aceptación.
```

Inaceptable: una prohibición aislada sin instrucción "preguntar", "detener" o Preguntas abiertas en el mismo párrafo.

### Idioma y localización

- Español para descripciones de dominio del negocio
- Inglés para términos técnicos (session, engine, vector, token, etc.)
- Consistencia en todo el documento: no mezclar idiomas para el mismo concepto

Ejemplos:

- "sesión de base de datos" (correcto: dominio en español, técnico en inglés)
- "database session" (incorrecto: mezcla innecesaria)
- "token de autenticación" (correcto)
- "authentication token" (incorrecto si el resto del documento usa español)

## Formato

Una vez que el contenido es directo y específico, preséntalo con el formato adecuado.

### Uso de emojis

No uses emojis en `SKILL.md`, `description` YAML, `references/`, `assets/` ni en los artefactos generados por los skills. Los emojis degradan la legibilidad en terminales, no renderizan uniformemente en todos los editores, y añaden ruido visual sin valor semántico.

**Reemplazos canónicos**:

| Evitar (emoji) | Preferir (texto)          |
|----------------|---------------------------|
| `✅`           | `Pass` o `Sí`             |
| `⚠️`           | `Partial` o `Parcial`     |
| `❌`           | `Fail` o `No`             |
| `🚫`           | `Bloqueado`               |
| `📌`           | `Nota:` o `Importante:`   |
| `💡`           | `Sugerencia:`             |
| `🎯`           | `Objetivo:`               |

**Excepciones**:

- Símbolos tipográficos estándar (`→`, `—`, `≥`, `≤`) no son emojis y se permiten.
- Si el dominio del usuario requiere emojis (ej. producto dirigido a comunicación casual), documéntalo explícitamente en el skill.

### Uso de tablas

Usa tablas solo cuando cada celda contenga ≤50 caracteres y el número de filas sea acotado (≤10 filas). Para contenido extenso o con múltiples niveles de detalle, prefiere listas y sublistas.

**Usa tablas para:**

- Mapeos uno-a-uno (columna → valor) con contenido corto en cada celda
- Checklists de estado (pass/partial/missing, sí/no)
- Configuraciones con pocas filas y valores simples
- Tablas de referencia cruzada (ej: veredictos, estados, códigos)

**Usa listas para:**

- Contenido narrativo o explicativo
- Pasos secuenciales o procedimientos
- Explicaciones con múltiples niveles de detalle
- Contenido donde las celdas superarían 50 caracteres
- Listas con más de 10 items

**Ejemplo de tabla correcta** (mapeo uno-a-uno, celdas cortas):

| Pasivo (evitar)    | Activo (preferir) |
|--------------------|-------------------|
| "Se debe…"         | "…"               |
| "Es recomendable…" | "Recomienda…"     |

**Ejemplo de tabla incorrecta** (celdas largas, mejor como lista):

| Veredicto | Cuándo                                                                                                                                          |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| pass      | El mismo "bullet" o la oración adyacente proporciona un sustituto directo (preguntar, detener, Preguntas abiertas, evidencia, hermano nombrado) |
| partial   | El sustituto existe pero está separado (sección diferente) o el texto aún combina la frase vaga con la corrección                               |
| fail      | Solo prohibición vaga o relleno — sin acción concreta                                                                                           |

→ Mejor como lista:

- **pass**: El mismo "bullet" o la oración adyacente proporciona un sustituto directo (preguntar, detener, Preguntas abiertas, evidencia, hermano nombrado)
- **partial**: El sustituto existe pero está separado (sección diferente) o el texto aún combina la frase vaga con la corrección
- **fail**: Solo prohibición vaga o relleno — sin acción concreta

### Formato de código

Especifica siempre el lenguaje en los bloques de código. Además, usa cuatro backticks cuando se incluyan bloques de código anidados:

````markdown
```python
def example():
    pass
```

```bash
npm install
```

```markdown
# Markdown example
```
````

Esto habilita resaltado de sintaxis y claridad de contexto.

### Headings y estructura jerárquica

Usa una jerarquía de headings clara y consistente:

- `#` para el título del documento (uno solo)
- `##` para secciones principales
- `###` para subsecciones
- `####` para sub-subsecciones (evitar ir más profundo)

Reglas:

- No saltar niveles (ej: de `##` a `####` sin `###`)
- Cada heading debe ser único en el documento
- Los headings deben ser descriptivos y autónomos (el lector debe entender el contenido solo leyendo el heading)
- Evita headings genéricos como "Información adicional" o "Notas"
- Archivos de referencia >100 líneas incluyen un TOC al inicio (sección `## Contenido` con anchors a cada `##`)

### Referencias y links

- Usa rutas relativas para archivos del mismo proyecto: `[documento](./references/doc.md)`
- Usa URLs completas para recursos externos: `[Herramienta](https://example.com)`
- Para referencias cruzadas dentro del mismo documento, usa anchors: `[sección](#heading)`
- Evita links rotos: verifica que cada link funcione
- Los archivos de `references/` evitan menciones directas a skills específicos por nombre — el routing y las fronteras entre skills viven en `SKILL.md`, no en las referencias. Las referencias describen lógica de proceso, no orquestación

Cuando referencies un archivo externo, incluye su relevancia:

```markdown
Ver [file-discovery.md](references/file-discovery.md) para el protocolo de resolución de entradas.
```

## Proceso de revisión

### Checklist de escritura directa (para revisar-skills)

Llena la tabla del checklist en [audit-checklists.md](./audit-checklists.md#auditoría-de-escritura-directa). Aplica el scan y verificación a todos los archivos del skill (SKILL.md, references/, assets/, scripts/). Requisito para pasar dimensión 4 y límites estrictos: [scoring-rubric.md](./scoring-rubric.md).

### Formato de corrección de hallazgo

Cuando se marque texto vago, la corrección debe ser una oración de reemplazo lista para pegar, no "sé más directo":

```text
file: <archivo del skill (SKILL.md, references/foo.md, assets/bar.json, etc.)>
section/line: <sección y línea de referencia>
impact: important
evidence:
  <excerpt de prohibición vaga>
hallazgo: Prohibición vaga sin acción concreta (direct-writing-guide)
fix: Pon lo desconocido en Preguntas abiertas. Si faltan criterios de aceptación después de Fase A, haz una pregunta enfocada antes de puntuar.
```

### Revisión y autocorrección

Antes de considerar un skill completo, verifica todos sus archivos:

1. **Scan de frases vagas**: ejecuta la búsqueda del scan en todos los archivos y marca cada "hit"
2. **Consistencia de terminología**: busca sinónimos mezclados en todo el skill (grep manual)
3. **Longitud de párrafos**: identifica párrafos >4 oraciones en archivos markdown y divídelos
4. **Links rotos**: verifica cada link interno y externo en todo el skill
5. **Ejemplos**: cada regla o patrón tiene al menos un ejemplo en el archivo correspondiente
6. **Headings**: jerarquía correcta, sin saltos de nivel, sin duplicados en todos los archivos markdown
7. **Bloques de código**: todos tienen lenguaje especificado
8. **Tablas vs listas**: las tablas son cortas y acotadas; si no, conviértelas a listas

### Checklist rápido de pre-publicación

- [ ] Sin frases vagas sin sustituto (scan pass)
- [ ] Sin voz pasiva innecesaria
- [ ] Terminología consistente (un concepto, una palabra)
- [ ] Párrafos ≤3 oraciones
- [ ] Cada regla tiene ejemplo
- [ ] Bloques de código con lenguaje
- [ ] Links verificados
- [ ] Headings jerárquicos y únicos
- [ ] TOC presente en archivos de referencia >100 líneas
- [ ] Tablas cortas o convertidas a listas
- [ ] Idioma consistente (español para dominio, inglés para técnico)
