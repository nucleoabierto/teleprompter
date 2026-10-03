# Definir y documentar la cadena de release

## Estado

[ ] Pendiente | [~] En progreso | [r] En revisión | [x] Completada | [!] Bloqueada

## Tipo

mantenimiento

## Objetivo

Fijar la cadena de release que D008 aplazó: el orden de los pasos,
sus responsables y sus puertas, desde que `liberar-version` promueve
el changelog hasta que la versión queda publicada y verificada en
npm. La publicación actual es manual e informal y ya produjo una
brecha tag ↔ artefacto (tarea 026); la cadena debe hacer ese estado
imposible por construcción.

## Dependencias

- Ninguna (la corrección de la tarea 026 conviene hacerla primero,
  pero no la bloquea)

## Entrada

- `docs/decisions/D008-implementacion-javascript-npx.md` — la
  consecuencia aplazada que esta tarea cierra.
- `.agents/skills/liberar-version/` — cubre changelog, bump semver y
  fuente de versión; deja fuera tag, publish y despliegue.
- `.agents/skills/mantener-changelog/` — el productor del material
  que `liberar-version` promueve.
- `package.json` — scripts, `files`, `bin`; hoy sin
  `prepublishOnly` ni `publishConfig`.
- Prácticas observadas: commits convencionales, tags `v*`,
  publicación manual con cuenta `gilmrjc` (2FA), dist-tag `legacy`
  usado una sola vez para 0.1.1 —no hay política de líneas de
  mantenimiento—.

## Resultado esperado

- Un documento de la cadena de release (ubicación a decidir:
  `docs/release.md` o equivalente) que nombre cada paso en orden —
  liberar-version → commit de release → tag → puerta de pruebas →
  publish → verificación con `npm view`/`npx` —, quién lo ejecuta y
  qué lo bloquea.
- `package.json` con la puerta de pruebas materializada (p. ej.
  `prepublishOnly` ejecutando la suite).
- La decisión registrada como D018 con `decisiones-diseno`, indexada
  con disparadores npm/release/publicación.
- Declaración explícita sobre dist-tags: `latest` como único tag en
  uso; `legacy` documentado como acción puntual sin política de
  líneas paralelas.

## Criterios de calidad

- Siguiendo el documento, un release completo no requiere decidir
  nada fuera de lo escrito: orden tag ↔ commit de release incluido.
- `npm publish` invoca la suite de pruebas automáticamente (o el
  documento declara y justifica por qué no hay puerta automática).
- D018 existe en `docs/decisions/` con su entrada en el índice.

## Procedimiento sugerido

1. Acordar con el usuario las piezas abiertas: orden tag ↔ commit de
   release, si la puerta es `prepublishOnly` o paso manual, y si la
   cadena termina en publish manual o adopta CI (tarea 028).
2. Escribir el documento de la cadena.
3. Materializar la puerta en `package.json`.
4. Registrar la decisión con `decisiones-diseno`.

## Notas

- La opción de trusted publishing (OIDC + provenance) se evalúa aquí
  como parte de la decisión; si se adopta, su materialización es la
  tarea 028.
- Requisitos de plataforma verificados: npm ≥ 11.5.1 y Node ≥ 22.14
  localmente; publicar exige 2FA o granular token con bypass-2FA;
  trusted publishing es GA desde julio de 2025 y el repo es público.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
