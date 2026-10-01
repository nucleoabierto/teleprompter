# Extraer el pipeline compartido y la resolución de conflictos

## Estado

[ ] Pendiente

## Tipo

mantenimiento (refactoring)

## Objetivo

`main` y `runUpdate` en `src/cli.js` implementan dos veces el
mismo pipeline —obtención, verificación, plan, resolución de
colisiones, guarda de la guía, `--dry-run`, ejecución y registro— y
la política de colisiones de D006 vive en dos bucles que ya divergen
deliberadamente («¿quitar?» para `removal`). Además la capa de
aplicación muta las entradas del plan (`r.resolution = …`) y navega
`lock.packages[…]` directamente. Extraer las fases compartidas y
concentrar la resolución en una operación de dominio elimina la
fuente principal de divergencia y prepara el punto de apoyo para
comandos futuros (colecciones).

## Dependencias

- Ninguna

## Entrada

- `src/cli.js` (`main` líneas ~428-556, `runUpdate` líneas ~244-404)
- `docs/decisions/D005`, `D006`, `D015`, `D016` — contratos a
  preservar
- `docs/architecture-reviews/002-instalacion-tras-el-ciclo-de-vida.md`
  — hallazgos H1 y H7

## Resultado esperado

- Una sola implementación del bucle de resolución de conflicts
  (flags `--force`/`--skip` → interactivo → aborto), parametrizada
  por la pregunta por conflicto —`overwrite`/`skip` en instalación,
  `quitar`/`conservar` en `removal`—.
- Las fases compartidas (obtención con cleanup, mapeo de
  verificación, guarda de la guía, ejecución + registro + informe)
  extraídas de modo que `main` y `runUpdate` compartan el esqueleto.
- La mutación del plan y la navegación del registro concentradas en
  operaciones de dominio —p. ej. `resolveConflicts(plan, decision)` o
  equivalente— sin que `cli.js` toque `r.resolution` ni
  `lock.packages` directamente.
- Misma API pública, misma suite en verde sin tocar aserciones y
  mismo comportamiento observable —mensajes y códigos de salida
  idénticos—.

## Criterios de calidad

- `npm test` verde (100 % de cobertura) sin modificar las aserciones
  existentes; solo se permiten pruebas nuevas de las operaciones
  extraídas.
- Ninguna línea de `cli.js` asigna `resolution` ni accede a
  `lock.packages`.
- Un solo sitio implementa la resolución de conflicts.
- Los mensajes de salida y los códigos de salida son byte a byte los
  mismos (salvo donde una prueba nueva lo justifique).

## Procedimiento sugerido

1. Extraer la resolución de conflicts como operación compartida.
2. Extraer el bloque fetch/verify y el bloque
   ejecutar+guía+registro+informe.
3. Encapsular la navegación del registro (`entry(name)`, `origin`).
4. Verificar suite completa y cobertura.

## Notas

- Encaja con el paradigma declarado por el usuario: flujo de datos
  funcional en el pipeline, entidades de dominio con comportamiento
  para lo que tiene invariantes que proteger.

## Revisión

- Subagente: — 
- Usuario: — 
