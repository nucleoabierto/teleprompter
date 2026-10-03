# Alinear los tags de release con el contenido publicado

## Estado

[ ] Pendiente | [~] En progreso | [r] En revisión | [x] Completada | [!] Bloqueada

## Tipo

mantenimiento

## Objetivo

Los tags `v0.1.0`, `v0.1.1` y `v0.2.0` se crearon retroactivamente el
2026-10-02 y al menos `v0.2.0` no identifica el contenido publicado:
apunta a `8f81421`, el commit donde el campo `version` pasó a
`0.2.0`, 31 commits antes del contenido que está en npm —el `npm
pack` local reproduce el `shasum` del registry—. Recolocar los tags
para que cada uno apunte al commit cuyo contenido se publicó, de modo
que tag, artefacto y enlace comparativo del changelog identifiquen lo
mismo.

## Dependencias

- Ninguna

## Entrada

- Hechos verificados: `v0.2.0` → `8f81421` (31 commits por debajo de
  HEAD); la publicación de 0.2.0 ocurrió el 2026-10-02 ~12:25 -0600,
  cuando HEAD era `3209608`.
- `v0.1.1` → `13350a2` («chore: release 0.1.1»), commit **fuera de
  master** —solo alcanzable por el tag— sobre una base con versión
  `0.1.0`; 0.1.1 se publicó bajo el dist-tag `legacy` a las ~12:32
  -0600 del mismo día.
- `v0.1.0` → `2f91d94`; esa versión ya no está en el registry (fue
  despublicada; solo queda su entrada en `time`).
- `npm view @nucleoabierto/teleprompter` — `shasum` por versión;
  `npm pack` en el commit candidato como verificación.

## Resultado esperado

- `v0.2.0` apunta al commit cuyo `npm pack` reproduce el `shasum`
  publicado como 0.2.0 (`b9687682…`), y el tag actualizado en
  `origin`.
- `v0.1.1` y `v0.1.0` quedan verificados del mismo modo, o sus
  anomalías documentadas en las notas de la tarea.

## Criterios de calidad

- `npm pack` ejecutado en el commit que `v0.2.0` etiqueta produce el
  mismo `shasum` que `npm view` registra para 0.2.0.
- El enlace comparativo `v0.1.1...v0.2.0` del changelog muestra la
  totalidad de los cambios de la versión.
- Ningún tag queda apuntando a un commit cuyo contenido difiera del
  artefacto publicado bajo esa versión.

## Procedimiento sugerido

1. Para cada versión publicada, identificar el commit candidato (para
   0.2.0: `3209608`, HEAD en el momento de la publicación) y
   verificarlo con `npm pack` contra el `shasum` del registry.
2. Reetiquetar `v0.2.0` sobre el commit verificado (`git tag -f`) y
   actualizar el remoto (`git push -f origin v0.2.0`).
3. Verificar `v0.1.1` y `v0.1.0` del mismo modo; documentar lo
   encontrado.

## Notas

- Mover un tag ya publicado en el remoto exige force-push del tag;
  ejecutarlo con el repo limpio y sin trabajo en vuelo.
- `v0.1.1` vive fuera de master por construcción (backfill de la
  línea legacy); el criterio no exige integrarlo a master, solo que
  el tag identifique el artefacto publicado.
- La convención tag ↔ commit de release que esta corrección siga a
  futuro la fija la tarea 027.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
