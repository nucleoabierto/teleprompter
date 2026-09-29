# Plan de instalación y detección de colisiones

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Implementar la generación del plan inspeccionable: la salida por
recurso con su estado (`create`, `identical`, `conflict`,
`managed-update`), la detección de colisiones contra
`teleprompter-lock.json` y el aborto de la operación cuando el plan no
es ejecutable —sin escribir nada en el destino.

## Dependencias

- 006.
- 008.

## Entrada

- El contrato de comportamiento en `docs/instalador.md` —secciones
  «El plan» y «Colisiones»— y las decisiones D005 y D006.
- El esqueleto del CLI y la verificación producidos por la tarea 008.
- El formato del registro en la decisión D007, que el plan consulta
  para distinguir recursos propios de ajenos.

## Resultado esperado

- La salida del plan lista cada recurso `install` con su `target` y su
  estado, a la manera de `terraform plan` y `chezmoi status`.
- La detección de colisiones distingue destino libre, destino ocupado
  por contenido ajeno y recurso propio modificado (`managed-update`)
  consultando `teleprompter-lock.json` si existe.
- Con colisiones presentes: en consola interactiva el plan se muestra
  y se entra a la resolución interactiva por recurso; sin consola
  interactiva la operación lista los conflictos y aborta sin escribir.
- Las opciones `--force` y `--skip` resuelven todas las colisiones por
  adelantado; declarar ambas es un error de invocación.
- El modo de solo-plan (`--dry-run`) produce la misma salida del plan
  y termina sin ejecutar ni registrar.

## Criterios de calidad

- El plan completo se calcula antes de escribir; un plan no ejecutable
  aborta la operación entera (D005).
- La marca de cada recurso coincide con la definición del contrato.
- Ninguna escritura ocurre en esta fase, ni siquiera del registro.

## Procedimiento sugerido

1. Leer `teleprompter-lock.json` del destino si existe.
2. Clasificar cada recurso `install` según el estado del destino y el
   registro.
3. Presentar el plan por recurso con su estado.
4. Implementar el aborto con informe de conflictos y el punto de
   entrada a la resolución interactiva.
5. Implementar el análisis de `--force`/`--skip` como opciones
   excluyentes y el modo de solo-plan que termina tras presentar el
   plan.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
