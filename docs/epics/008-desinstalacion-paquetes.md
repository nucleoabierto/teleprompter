# Desinstalación de paquetes: salida limpia del ciclo de vida

## Estado

[x] Planificada | [ ] Completada

## Objetivo

`teleprompter uninstall <paquete>` retira del destino los recursos
registrados de un paquete —los intactos directamente, los divergentes
por decisión— y deja el registro sin su entrada, verificable con `list`
y `check`.

## Alcance

- **Dentro:** el comando, el plan de retirada visible antes de borrar,
  la retirada de registrados intactos —incluida la guía gestionada—, la
  resolución de divergencias con la política de conflictos, el respaldo
  de lo decidido a retirar, la reescritura del registro, `--dry-run` y
  la ayuda.
- **Fuera:** retirada parcial o masiva, purga de respaldos históricos,
  interdependencia entre paquetes, deshacer, reconstrucción del
  destino.

## Piezas

- [ ] docs/tasks/042-uninstall-retira-paquete-intacto.md — `uninstall`
  retira un paquete instalado intacto
- [ ] docs/tasks/043-resolucion-divergencias-retirada.md — resolución
  de divergencias en la retirada

## Plan técnico

- **Orden:** 042 → 043.
- **Dependencias:** 043 convierte en conflictos `removal` lo que 042
  conserva por deriva.
- **Decisiones transversales:** plan completo y preflight antes de
  escribir (D005); política de conflictos (D006) reutilizando
  `settleConflicts` y `diffResource`; vocabulario `remove`/`keep`
  (D016); defensa de rutas registradas (`recordedChainSafe`); respaldo
  previo al paso destructivo (`backupConflict`); reescritura atómica
  del lock. La unidad de decisión es el recurso registrado por deriva
  —el mismo modelo que los retirados divergentes de `update`.

## Criterio de cierre

`uninstall` retira un paquete de extremo a extremo dejando destino y
registro coherentes —`list` deja de mostrarlo, `check` no lo reporta—,
las divergencias se deciden con la política de conflictos y lo decidido
a retirar queda respaldado; suite en verde al 100 %.

## Revisión

- Usuario: 2026-10-23 — Aprueba
