# D021: Idiomas de resultado por capa

## Estado

Aceptada

## Contexto

La revisión de arquitectura 004 encontró cuatro idiomas de
resultado y fallo coexistiendo: objetos discriminados
(`{ ok, … }` / `{ ok: false, error }` en fetch y paths,
`{ units }` / `{ code }` en la selección de unidades,
`{ kind, warnings, errors, … }` en la verificación), el
resultado `{ ok, reason }` de la defensa de rutas, los códigos
de salida crudos que devuelven los comandos y el
`ExecutionError` tipado que porta las acciones aplicadas. La
pregunta era si unificar hacia un solo idioma o aceptar la
pluralidad.

## Decisión

Mantenemos un idioma de resultado por capa en lugar de uno
único: las operaciones de dominio devuelven objetos
discriminados propios de su contrato, la capa de invocación los
mapea a códigos de salida, y la ejecución comunica los fallos a
mitad de plan con `ExecutionError` —que porta `applied` y la
causa—. Una operación nueva imita el idioma de su capa en lugar
de inventar uno.

## Justificación

Unificar forzaría a arrastrar detalles de capa a través de
fronteras que hoy están limpias: `applied` no le dice nada al
fetcher, un código de salida no le dice nada al dominio y un
`kind` de verificación no pertenece al ejecutor. Cada idioma
encaja el contrato de su capa —el grafo de dependencias, un DAG
sin ciclos donde el dominio nunca importa la invocación, lo
confirma—. El coste real no era la pluralidad sino que estaba
sin declarar: una operación nueva no tenía forma que imitar.
Declarada, la pluralidad deja de ser ambigüedad y pasa a ser
convención.

## Referencias

- `docs/architecture-reviews/004-arquitectura-general.md` —
  hallazgo H3.
