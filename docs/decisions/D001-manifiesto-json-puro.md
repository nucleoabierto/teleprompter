# D001: Manifiesto de paquete como JSON puro en `teleprompter.json`

## Estado

Aceptada

## Contexto

El formato de paquete de Teleprompter necesita un archivo de manifiesto
que el mantenedor escribe y el instalador lee. Las opciones sobre la mesa
eran el formato de datos (JSON, YAML, TOML o un formato ejecutable) y el
nombre del archivo, que debe ser detectable sin ambigüedad dentro de un
repositorio que puede contener otros manifiestos (`package.json` de npm,
`manifest.json`, etc.).

## Decisión

Usamos JSON puro para el manifiesto, con el nombre `teleprompter.json`
en la raíz del directorio de paquete. El manifiesto no ejecuta nada: se
inspecciona y valida completo antes de actuar.

## Justificación

JSON es el formato de todos los precedentes declarativos encuestados
(`package.json`, `pkg.json`, `manifest.json`, `plugin.json`,
`marketplace.json`): legible por máquina, sin efectos laterales y
validable antes de ejecutar código —los formatos Turing-completos
invitan a comportamiento ad hoc, como advierte packspec. YAML quedó
descartado: su uso en el proyecto se limita al frontmatter embebido en
Markdown, y su tipado implícito añade ambigüedad a un contrato que debe
ser estricto. El nombre `teleprompter.json` evita la colisión con
`package.json` y `manifest.json`, que un repositorio destino puede tener
ya con otro significado.

## Referencias

- `docs/research/2026-09-formatos-manifiesto.md` — recomendaciones 1 y 2.
- `docs/tasks/002-definir-formato-paquete.md` — la tarea que aplica la
  decisión.
