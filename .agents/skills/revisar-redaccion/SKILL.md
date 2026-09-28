---
name: revisar-redaccion
description: >
  Revisa la redacción de un texto en español desde la perspectiva del estilo.
  Tiene dos modos: preventivo (revisa el borrador propio antes de presentarlo
  al usuario) y reactivo (diagnostica un texto externo sin modificarlo).
  Diagnostica problemas de claridad, coherencia, cohesión, estructura, tono,
  precisión léxica, concisión, ritmo y fatiga del lector.
  Usar antes de presentar documentos o ideas largas consolidadas: informes,
  resultados de investigación, conclusiones, resúmenes extensos o cualquier
  texto que sintetice información de forma estructurada. También cuando se
  necesite un diagnóstico de redacción sobre un texto existente.
  Sinónimos: revisión de estilo, revisión de prosa, diagnóstico de redacción.
---

# Revisar redacción

Instrucciones para que un agente revise la redacción de un texto en español desde la perspectiva del estilo. El skill opera en dos modos: preventivo y reactivo.

## Modos de uso

### Modo preventivo

El agente revisa su propio borrador antes de presentarlo al usuario. Este modo se aplica de forma proactiva, sin que el usuario lo solicite.

**Cuándo activarlo:** antes de presentar texto consolidado o de alta densidad informativa. Esto incluye informes, resultados de investigación, conclusiones, documentos, resúmenes extensos o cualquier texto que sintetice ideas de forma estructurada.

**Cuándo ignorarlo:** mensajes de chat breves, respuestas puntuales, confirmaciones o texto que no consolida información.

**Salida:** el texto mejorado. El agente aplica las mejoras a su borrador y presenta la versión revisada. No produce un informe de diagnóstico.

### Modo reactivo

El agente revisa un texto proporcionado por el usuario y produce un diagnóstico sin modificar el original.

**Cuándo activarlo:** cuando el usuario solicita una revisión de redacción o de estilo sobre un texto.

**Salida:** un informe de revisión en formato Markdown, según la plantilla de la sección «Formato del informe».

## Cuándo no usar

- Para corregir ortografía, gramática, puntuación o tipografía: usar el skill de pulido mecánico.
- Para evaluar el contenido, la veracidad, la originalidad o la calidad sustantiva de las ideas.
- Para reescribir el texto completo o hacer edición de mesa.

Para las exclusiones durante la aplicación, ver «Qué no revisar».

## Entrada

- Un texto en español, o la ruta a un archivo que lo contenga.
- Opcionalmente, contexto sobre el propósito del texto y la audiencia destinataria. Si no se proporciona, el agente debe inferirlo y declararlo: en el informe (modo reactivo) o internamente (modo preventivo).

## Principios rectores

La revisión se basa en un conjunto de principios rectores que el agente debe aplicar durante la revisión. Cada hallazgo debe indicar qué principio se infringe.

Los principios están agrupados en cinco fuentes: los de los grandes ensayistas en español, los de alto impacto, los de lenguaje claro (ISO 24495-1), los de precisión semántica (SBVR) y el de preservación de la voz del autor.

Para el listado completo de principios, la correspondencia entre principios y niveles, y las categorías de severidad, leer `references/principios.md`.

## Qué revisar

Recorrer el texto párrafo por párrafo, de forma exhaustiva, y detectar problemas en cinco niveles: discursivo, rítmico, morfosintáctico, léxico y tono.

Para el detalle de qué verificar en cada nivel, leer `references/niveles.md`.

## Qué no revisar

- Ortografía (faltas, tildes, mayúsculas).
- Gramática (concordancias, tiempos verbales, etc.).
- Puntuación (signos de puntuación).
- Tipografía (comillas, cursivas, negritas, versalitas).
- Contenido (veracidad, originalidad, calidad sustantiva de las ideas).
- Reescritura completa del texto.
- Diseño y maquetación.

## Procedimiento

### Pasos comunes a ambos modos

1. **Leer el texto completo** una vez, sin anotar, para captar el propósito, la audiencia y el tono general.
2. **Inferir el contexto** (propósito y audiencia) si no se proporcionó.
3. **Evaluar el tono** actual y decidir un tono recomendado.
4. **Recorrer el texto párrafo por párrafo** y aplicar las verificaciones de cada nivel (discursivo, rítmico, morfosintáctico, léxico; el tono se evalúa en el paso anterior). Para cada hallazgo:
   - Anotar la ubicación (párrafo o fragmento citado).
   - Describir el problema.
   - Indicar el principio que se infringe.
   - Asignar la severidad.
   - Proponer una sugerencia de reformulación concreta.
5. **Verificar la coherencia global** al terminar el recorrido: contradicciones entre partes, términos usados con sentidos distintos, información implícita que el lector tendría que reconstruir.

### Modo preventivo

6. **Aplicar las mejoras** al borrador: incorporar las sugerencias de reformulación, ajustar el tono y resolver los hallazgos de coherencia global.
7. **Presentar el texto revisado** al usuario.

### Modo reactivo

6. **Redactar el informe** siguiendo la plantilla de la sección «Formato del informe». Reportar los hallazgos de coherencia global en «Observaciones generales» del resumen, o como hallazgos del nivel discursivo si corresponden a una ubicación específica.

## Finalización

El skill ha terminado cuando se han completado todos los pasos del procedimiento y se cumple la condición de salida del modo: presentar el texto revisado (modo preventivo) o redactar el informe con todas sus secciones (modo reactivo).

## Formato del informe (modo reactivo)

```
# Revisión de redacción: [título o identificador del texto]

## Contexto
- Propósito inferido: ...
- Audiencia destinataria inferida: ...

## Evaluación del tono
- Tono actual: ...
- Tono recomendado: ...
- Desviaciones: ...

## Hallazgos

### Nivel discursivo
| # | Ubicación | Problema | Principio infringido | Severidad | Sugerencia |
|---|-----------|----------|----------------------|-----------|------------|
| 1 | §3        | ...      | Claridad             | Alto      | ...        |

### Nivel rítmico
| # | Ubicación | Problema | Principio infringido | Severidad | Sugerencia |
|---|-----------|----------|----------------------|-----------|------------|
| 1 | §3        | ...      | Concisión            | Medio     | ...        |

### Nivel morfosintáctico
| # | Ubicación | Problema | Principio infringido | Severidad | Sugerencia |
|---|-----------|----------|----------------------|-----------|------------|
| 1 | §1        | ...      | Concisión            | Medio     | ...        |

### Nivel léxico
| # | Ubicación | Problema | Principio infringido | Severidad | Sugerencia |
|---|-----------|----------|----------------------|-----------|------------|
| 1 | §2        | ...      | Precisión léxica     | Bajo      | ...        |

## Resumen
- Hallazgos por nivel: discursivo (X), rítmico (Y), morfosintáctico (Z), léxico (W)
- Hallazgos por severidad: altos (X), medios (Y), bajos (Z)
- Observaciones generales: ...
```
