# Auditoría de biblioteca / batch

Hallazgos cross-skill cuando el scope de `revisar-skills` es `library` o `batch`. Corre después de la Fase B por skill; resume en el chat cuando todos los archivos de revisión están en disco.

Las revisiones por skill siguen usando [audit-checklists.md](./audit-checklists.md) y [scoring-rubric.md](./scoring-rubric.md). Esta guía cubre patrones visibles solo entre hermanos.

## Checklist

- Routing de descriptions — ningún hermano roba triggers del otro
  - Notas: ≥ 2 frases de trigger por par de colisión; cita [description-guide.md](./description-guide.md)

- Alineación name/acción — verbo coincide con cuerpo a lo largo de la cadena
  - Notas: Tabla de snapshot abajo; cita [naming-guide.md](./naming-guide.md)

- Layout — sin `../_shared/` directos en ningún `SKILL.md`
  - Notas: Per [resource-layout-guide.md](./resource-layout-guide.md)

- Clusters de duplicación — candidatos de extract a `_shared/`
  - Notas: Candidatos por skill también en cada revisión § DRY & assets audit

- Tablas de orquestación — todos los skills de cadena enlazados
  - Notas: Cuando la librería define cadenas de workflow

- Acoplamiento de host — cluster de lenguaje específico de IDE
  - Notas: Prefiere agente / skills root / wording de delegación

- Clusters de wording vago
  - Notas: Grep per [direct-writing-guide.md](./direct-writing-guide.md)

## Name alignment snapshot (chat index)

Construye el snapshot de alineación de nombres en el resumen de chat, no en archivos de revisión individuales:

Para cada skill, registra:

- **Nombre del skill**: `<nombre>`
- **Acción principal (del cuerpo)**: `<descripción>`
- **Alineación**: Buena / Parcial / Desalineada
- **Renombre propuesto (si aplica)**: `<nombre propuesto o "none">`

Compara hermanos en la misma cadena de workflow. Marca nombres sustantivo–sustantivo, mismatches de verbo, y colisiones.

## Resumen de chat index

Cuando todas las revisiones por skill estén escritas, publica: conteo, score overall promedio, name scores, description scores, DRY & assets scores, violaciones de layout, mismatches name/acción, colisiones de routing, candidatos extract-shared.
