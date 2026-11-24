# Dependencias entre paquetes

## Estado

[x] Planificada | [x] Completada

## Objetivo

`teleprompter install` de un paquete instala también los paquetes
que lo completan —los que su manifiesto declara, del mismo árbol o
de orígenes ajenos— resueltos, ordenados y verificados antes de
escribir, verificable en una sola invocación.

## Alcance

- **Dentro:** el campo `dependencies` del manifiesto con su
  restricción de versión, la relajación de `install` para paquetes
  de composición, la resolución transitiva del conjunto en el
  árbol obtenido, la obtención de unidades de orígenes ajenos
  ancladas a commit, el orden topológico, la detección de ciclos
  y la unión de restricciones, el spec y la documentación del
  mantenedor.
- **Fuera:** resolución de versiones por enumeración, prereleases
  en rangos, efectos en cascada sobre `update`/`uninstall`,
  dependencias opcionales o condicionadas, selección parcial del
  conjunto, orígenes privados o autenticados.

## Piezas

- [ ] docs/tasks/065-dependencias-mismo-origen.md — Dependencias
  dentro del mismo origen
- [ ] docs/tasks/066-dependencias-origenes-externos.md —
  Dependencias de orígenes externos

## Plan técnico

- **Orden:** 065 → 066.
- **Dependencias:** 066 extiende la gramática y la resolución del
  conjunto que 065 introduce.
- **Decisiones transversales:** vocabulario uniforme de la
  dependencia —`{package, version?, origin?}`, con `origin`
  ausente = miembro del mismo árbol—; el conjunto declarado se
  resuelve entero antes del plan compartido y nada se escribe
  hasta que es ejecutable (D005); modelo de aserción —la
  referencia elige el árbol, la restricción valida la `version`
  del manifiesto obtenido, el commit fija—; identidad del grafo =
  nombre del paquete, con deduplicación y unión de restricciones;
  cada pieza en el lock como instalación normal con su origen
  (D014); rangos evaluados con la biblioteca `semver`, no con
  parser propio; `install` deja de ser obligatorio con
  `dependencies` presente.

## Criterio de cierre

Una sola invocación instala el producto completo: el paquete
pedido y todo su conjunto declarado —miembros del mismo árbol y
unidades de orígenes ajenos ancladas a commit— ordenado por
dependencia, con el plan del conjunto visible antes de escribir y
aborto sin efectos ante un ciclo, una pieza inalcanzable o una
versión insatisfecha; `--package` sigue instalando solo lo pedido.

## Revisión

- Usuario: 2026-11-22 — Aprueba
