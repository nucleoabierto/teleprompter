# Mejorar el mensaje de ayuda del CLI

## Estado

**[ ] Pendiente** | [~] En progreso | [r] En revisión | [x] Completada | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

Sustituir la línea de uso monolítica actual —que comprime los cinco subcomandos en una sola línea difícil de leer— por una ayuda estructurada: descripción breve de la herramienta, sinopsis por subcomando, opciones y ejemplos de uso. El objetivo es que una persona que ejecuta `teleprompter` sin argumentos o `teleprompter --help` entienda de un vistazo qué hace cada subcomando y cómo invocarlo.

## Dependencias

- Ninguna

## Entrada

- `src/cli.js` — punto donde se emite el mensaje de uso actual.
- `test/cli.test.js` — suite existente que cubre la salida del CLI.
- `manual/` — documentación de referencia de los subcomandos, por si la ayuda debe quedar alineada con ella.

## Resultado esperado

- `src/cli.js` emite una ayuda estructurada en `teleprompter`, `teleprompter --help` y `teleprompter help`: descripción breve, sección por subcomando (`install`, `guide`, `list`, `check`, `update`) con su sinopsis, opciones y ejemplos.
- `test/cli.test.js` actualizado para cubrir la nueva salida.
- Si el manual reproduce el texto de ayuda, la referencia correspondiente queda actualizada.

## Criterios de calidad

- La salida muestra cada subcomando con su sinopsis en líneas separadas y legibles en terminal.
- Las opciones (`--path`, `--package`, `--force`, `--skip`, `--dry-run`, `--ref`) y al menos un ejemplo de uso están presentes.
- `npm test` queda en verde con la cobertura exigida (100 % de líneas, funciones y ramas en `src/`).
- Los códigos de salida y las condiciones en las que se imprime la ayuda no cambian.

## Procedimiento sugerido

1. Diseñar el texto de ayuda nuevo a partir de la sinopsis actual y la referencia del manual.
2. Implementar el cambio en `src/cli.js` manteniendo las mismas condiciones de emisión.
3. Ajustar `test/cli.test.js` a la nueva salida y verificar la cobertura.

## Notas

- La ayuda actual es una única línea: `uso: teleprompter [install] <user/repo[@ref]> [destino] | --path <paquete> ... | guide [<paquete>] | list | check | update <paquete> ...`.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario (ejecución): [fecha] — [Aprueba | Solicita cambios]
- Usuario (cierre): [fecha] — [Aprueba | Solicita cambios]
