# Descubrimiento de archivos (compartido)

Protocolo común que los skills siguen para obtener la fuente de entrada (ticket, brief, plan, review, diff o PR). Aplica a cualquier skill que reciba un `*-SLUG`, una `RUTA-LOCAL`, un `PR-NUMBER` o contenido pegado.

Sigue este orden estricto. Solo baja al siguiente escalón si el anterior no resuelve.

## 1. Vía contexto

Intenta resolver la fuente desde lo que ya está disponible sin pedir nada al usuario:

- **Ruta explícita**: si el argumento es una ruta existente, léela con `read`.
- **Slug → ruta**: si el argumento es un slug (ej. `ALE-008-...`, `CONTEXT-...`, `PLAN-...`), resuélvelo a ruta buscando en disco con `find_file_by_name` (patrón `**/<slug>*.md` o el que aplique) y léela con `read`. Si hay varios candidatos, prefiere el más específico y verifica el título/encabezado.
- **Contenido pegado**: si el usuario pegó el contenido del ticket/brief/diff en el chat, úsalo directamente sin buscar archivo.
- **Archivos abiertos en el IDE**: si la metadata del IDE lista un archivo abierto cuyo nombre/contenido coincide con el tipo esperado, úsalo y cita la ruta.
- **PR local**: si el argumento es `PR-NUMBER` y hay un diff local accesible vía `git`, cárgalo con `git diff <base>...HEAD` y `git log <base>..HEAD`. Si no hay rama/PR local, baja a la vía solicitud directa.
- **Integraciones MCP**: si el skill requiere contexto de tu herramienta de gestión de tareas o documentación de referencia y el argumento es un ID o URL, intenta cargar vía MCP:
  - **Herramienta de gestión de tareas**: usa `mcp_call_tool` con el servidor correspondiente para obtener descripción, AC, comentarios y attachments.
  - **Documentación de referencia**: usa `mcp_call_tool` con el servidor correspondiente para fetch (URL/ID) o search cuando se necesita contexto de TDD/spec/design.

## 2. Vía solicitud directa

Si la vía contexto no resuelve, pide al usuario en el chat:

- La **ruta** al archivo, o
- El **contenido** pegado del ticket/brief/diff, o
- El **PR-NUMBER** accesible localmente (rama con diff vs base), o
- La **URL de tu herramienta de gestión de tareas o documentación** si el skill requiere contexto de estas integraciones.

Cuando el usuario responda, vuelve a la vía contexto para cargarlo. No inventes contenido mientras esperas.

## 3. Vía invocación

Si la fuente no existe y otro skill puede producirla, no la inventes: sugiere al usuario invocar el skill productor adecuado primero y detente hasta que la fuente exista.

Mapeo de slugs → skill productor:

| Slug / tipo esperada        | Skill que la produce        |
|-----------------------------|-----------------------------|
| `TICKET-SLUG`               | `create-ticket`             |
| `CONTEXT-DOC-SLUG`          | `context-brief`             |
| `PLAN-DOC-SLUG`             | `planning-implementation`   |
| `REVIEW-DOC-SLUG`           | `pr-review`                 |

Ejemplo: si `implementing` recibe un `PLAN-DOC-SLUG` que no existe tras las vías 1 y 2, detente y sugiere al usuario invocar `planning-implementation` para generarlo antes de reintentar.

## Manejo de fallos de MCP

Asume que los servidores MCP correspondientes están instalados y autenticados para skills que los requieren. Cuando una llamada MCP falla con errores de autenticación, conexión o herramienta no encontrada:

- **Detén** la fase actual del skill.
- Informa al usuario qué servidor falló y en qué categoría (herramienta de gestión de tareas, documentación, etc.).
- Pide al usuario que instale, autentique o habilite el servidor MCP antes de continuar.
- Si faltan datos del ticket o documentación, coloca los desconocidos en Preguntas abiertas; no crees AC especulativos.

### Protocolo de descubrimiento de documentación de referencia

Cuando `REFERENCE-DOC-SOURCE` no está en el mensaje:

1. Lee el ticket de tu herramienta de gestión de tareas — extrae enlaces a documentación de referencia de la descripción y comentarios.
2. Si el ticket nombra un documento ("ver TDD", "design spec") pero no tiene URL, ejecuta búsqueda en tu herramienta de documentación con el ID del ticket y palabras clave del título.
3. Obtén cada candidato; prefiere páginas tituladas como TDD, spec, design, epic o investigation.
4. Registra el título + URL de la página obtenida en la línea de inputs resueltos y en secciones de índice de fuentes.

No pegues secretos, PII de clientes desde tu documentación de referencia en documentos locales. Resume en su lugar.

## Reglas de precedencia para conflictos entre fuentes

Cuando múltiples fuentes contienen información contradictoria:

- **Criterios de aceptación / alcance del ticket** — Tu herramienta de gestión de tareas gana a menos que el usuario indique explícitamente que la documentación de referencia es canónica.
- **Arquitectura / TDD / intención de diseño** — Las páginas TDD/spec de tu documentación de referencia ganan cuando están enlazadas desde el ticket o citadas por el usuario.
- **Estado del codebase / artefactos de workflow local** — El research brief local gana cuando está presente y es reciente.

Reporta las discrepancias en la sección de Preguntas abiertas del entregable.

## Orden de carga al construir contexto

Para skills que integran múltiples fuentes (local + herramienta de gestión de tareas + documentación de referencia):

1. Resuelve `TICKET-ID` (si el skill está basado en tickets).
2. Carga documentos locales — prefiere `docs/**/<TICKET-ID>-research-brief.md` para contexto de workflow; también verifica ticket-review, triage, implementation-plan y review docs.
3. Carga documentación de referencia — URLs en el mensaje del usuario; enlaces en el ticket de tu herramienta de gestión de tareas (descripción, comentarios, attachments); busca por `<TICKET-ID>` o título del ticket cuando el ticket carece de detalle o referencia un documento.
4. Carga tu herramienta de gestión de tareas — siempre para skills basados en tickets; trata como autoridad para AC y metadata del ticket; reconcilia conflictos con documentación/docs locales y nota discrepancias en Preguntas abiertas.

## Reglas comunes

- Si la fuente no existe, reporta el vacío y baja al siguiente escalón; coloca los desconocidos en Preguntas abiertas.
- **Cita la ruta** real usada en el entregable (índice de fuentes / notas).
- **Sin commits ni publicación**: este protocolo solo lee archivos locales, contenido del chat o datos vía MCP (desde tu herramienta de gestión de tareas, documentación, etc.); nunca crea commits, push ni PR.
- **Prefiere evidencia sobre especulación**: si la fuente está parcial, anota los vacíos en Preguntas abiertas en lugar de rellenarlos.
- **Reporta inputs resueltos**: después de la fase de descubrimiento, declara en chat las fuentes resueltas (ej: `Resolved: TICKET-ID=ALE-008, CONTEXT-DOC=docs/.../ALE-008-research-brief.md, REFERENCE-DOC=https://...TDD`). Omite líneas para fuentes no usadas.
