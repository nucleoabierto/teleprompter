# Plan de actualización consciente de la deriva

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Dado un paquete ya instalado y una versión entrante distinta de la
registrada, el sistema calcula un plan de actualización completo
—antes de escribir nada— que clasifica cada recurso según lo que la
versión nueva trae y lo que el usuario hizo con lo instalado.

## Dependencias

- 017 (la clasificación de deriva intacto / modificado / ausente que
  esta tarea reutiliza o reproduce).

## Entrada

- `buildPlan` en `src/plan.js`, `hashPath` en `src/hash.js`,
  `readLock` en `src/lock.js` y el contrato del registro.
- D005 (plan completo con aborto total) y D006 (política de
  colisiones) como decisiones que el plan respeta.

## Resultado esperado

- Una construcción de plan que, para un paquete cuyo nombre ya figura
  en el registro con una versión distinta de la entrante, clasifica
  cada recurso: nuevo en la versión, sin cambios, cambiado e intacto
  —actualizable sin pérdida—, cambiado pero con edición local
  —requiere decisión—, y registrado pero ausente del manifiesto
  nuevo —retirado por la versión, con su política de retirada
  decidida en la planeación.
- La misma versión entrante que la registrada produce un plan vacío o
  un informe de «ya está en esa versión», no una reinstalación.
- El plan es completo y abortable como el de instalación (D005): si
  no es ejecutable, nada se escribe ni se registra.

## Criterios de calidad

- Cada clase del plan está cubierta por la suite: recurso nuevo,
  idéntico, actualizable intacto, modificado localmente, retirado y
  recurso ausente en disco.
- La clasificación usa el hash registrado contra el contenido actual
  —no solo existencia—, igual que la verificación de deriva.
- Cobertura de pruebas del 100 % mantenida.

## Procedimiento sugerido

1. Definir en la planeación el vocabulario del plan de actualización
   —las clases por recurso y cómo se presentan— y la política para
   los recursos retirados por la versión nueva.
2. Implementar la construcción del plan como hermana de `buildPlan`,
   reutilizando `hashPath` y el registro.
3. Extender la suite con los casos de cada clase y con el aborto del
   plan no ejecutable.

## Notas

- Qué ocurre con un recurso retirado por la versión nueva —borrado
  automático, decisión por recurso o conservación— es la decisión
  más delicada del conjunto: quitar es destructivo y conservar deja
  restos huérfanos; la planeación la fija con evidencia de la suite.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
