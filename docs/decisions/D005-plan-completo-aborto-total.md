# D005: Plan completo antes de escribir, con aborto total

## Estado

Aceptada

## Contexto

El instalador opera sobre repositorios con trabajo previo: escribir
antes de conocer el conjunto completo de acciones produce operaciones
a medias, el modo de fallo que el problema describe. La investigación
de motores de instalación mostró que Stow calcula todos los conflictos
antes de ejecutar y Terraform materializa el plan como paso separado
de la aplicación.

## Decisión

Calculamos el plan completo —precondiciones, recursos y colisiones—
antes de escribir, y abortamos la operación entera si el plan no es
ejecutable: ni recursos ni registro quedan escritos.

## Justificación

La atomicidad del plan elimina el estado intermedio más difícil de
depurar: una instalación parcial sin constancia. La alternativa —
aplicar por archivo y resolver sobre la marcha, como copier o
chezmoi— exige registro e idempotencia para ser segura; preferimos el
modelo más simple que la investigación respalda. La contrapartida es
que una sola colisión detiene instalaciones parcialmente buenas, un
coste aceptable porque el informe de conflictos dice exactamente qué
resolver.

## Referencias

- `docs/research/2026-09-motores-instalacion.md` — rec. 1 y 2.
- `docs/instalador.md` — el comportamiento que esta decisión fija.
