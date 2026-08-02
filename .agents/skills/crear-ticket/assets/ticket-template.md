# Plantilla de ticket genérico

Estructura canónica para redacción de tickets agnósticos a herramientas de gestión.

## Secciones requeridas

1. **Problema** — qué está mal o falta, quién/qué se ve afectado, por qué ahora
2. **Alcance** — Dentro del alcance / Fuera del alcance
3. **Requisitos** — lista de bullets; incluye rutas de archivo, flags, diseños, o comandos cuando se conozcan
4. **Testing / QA** — expectativas de CI y/o pasos en staging (Setup → Pasos → Expectativas). Si no se necesita QA, di **QA no requerido** y por qué.
5. **Criterios de aceptación** — checkboxes binarios que definen el done
6. **Preguntas abiertas** — solo preguntas de producto, infra, o datos sin resolver
7. **Referencias** — documentos relacionados (por slug o ID), design docs, PRs, rutas de código clave

## Secciones opcionales (puerta estricta)

Añade estas secciones **solo cuando el INPUT las requiera** (no añadir "por si acaso"):

- **Feature flag / Acceso** — solo si el INPUT menciona un flag, rollout, o control de acceso
- **Orden de rollout cross-repo** — solo si el INPUT abarca múltiples repos o el orden de deploy importa
- **Metadatos de producción** (aplicación, ¿PII?, SecCom, runtime, comandos dry-run vs real-run) — solo si el INPUT es ops/migración/production run
- **Causa raíz / Esperado vs Actual** — solo para defectos cuando el INPUT declara o implica un bug
- **Link de diseño** (herramienta de diseño) — solo si el INPUT cita o requiere un diseño

## Reglas de redacción

- Prefiere evidencia sobre especulación; cita rutas y URLs.
- Pon cada incógnita en Preguntas abiertas; pregunta al usuario las respuestas.
- El out-of-scope explícito vence a la prosa larga.
- Enlaza documentos relacionados por slug o ID genérico (no usar formatos específicos de herramienta).
- Mantenlo escaneable: encabezados, párrafos cortos, tablas cuando sean útiles.
- Nunca incluyas secrets o PII de clientes; resume en su lugar.
- Nunca dejes líneas de template vacías.
