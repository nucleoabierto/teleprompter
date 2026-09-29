# Ejecución del plan y registro de instalación

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Implementar la ejecución del plan aprobado —la resolución interactiva
de colisiones, la copia de recursos al destino según sus acciones— y
la escritura del registro `teleprompter-lock.json` con lo instalado.

## Dependencias

- 006.
- 008.
- 009.

## Entrada

- El contrato de comportamiento en `docs/instalador.md` —la fase de
  ejecución de «La operación» y las secciones «El registro» y
  «Resultado y errores»— y las decisiones D005, D006 y D007.
- El plan de instalación producido por la tarea 009.

## Resultado esperado

- La resolución interactiva pregunta por cada recurso en conflicto si
  se sobrescribe o se omite; las opciones `--force` y `--skip`
  resuelven sin preguntar.
- La copia materializa cada acción del plan bajo el destino:
  `create` instala el recurso, `overwrite` reemplaza el destino (lo
  que incluye los recursos marcados `managed-update` en el plan) y
  `skip` lo deja intacto.
- `teleprompter-lock.json` queda escrito en la raíz del destino con
  `name`, `version`, `installedAt` y una entrada por recurso con
  `target`, acción (`create`, `overwrite`, `skip`) y hash SHA-256 del
  contenido escrito —las entradas `skip` registran la decisión sin
  hash.
- La salida final informa cada recurso con la acción realizada y los
  códigos de salida distinguen éxito, plan no ejecutable, manifiesto
  inválido y error de ejecución.

## Criterios de calidad

- La ejecución reproduce el plan: ninguna acción distinta de lo
  anunciado ocurre sobre el destino.
- El registro permite reconstruir qué se instaló, con qué acción y
  qué contenido —incluidas las decisiones `skip`.
- Un error a mitad de ejecución deja constancia de lo ya aplicado en
  la salida; la verificación previa ya garantiza que no hay fallos
  evitables.

## Procedimiento sugerido

1. Implementar la resolución interactiva por recurso en conflicto.
2. Copiar cada recurso según su acción, calculando el hash del
   contenido escrito.
3. Escribir `teleprompter-lock.json` fusionando con el registro
   previo si existe.
4. Implementar la salida final y los códigos de salida del contrato.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
