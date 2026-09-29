# Instalar el paquete de referencia sobre un destino real

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Validar el instalador de extremo a extremo instalando el paquete de
referencia `ciclo-tareas` sobre un repositorio con trabajo previo,
incluida una colisión provocada, y comprobar que el recorrido completo
—verificación, plan, ejecución y registro— se comporta como el
contrato declara.

## Dependencias

- Las tareas de implementación derivadas de la tarea 006.

## Entrada

- El instalador implementado por las tareas derivadas de la tarea 006.
- El paquete de referencia `packages/ciclo-tareas/` y su manifiesto.
- El comportamiento definido por la tarea 006 como referencia de lo
  esperado.

## Resultado esperado

- Una instalación real del paquete `ciclo-tareas` sobre un destino con
  trabajo previo, con el plan presentado antes de escribir y el
  registro producido después.
- Una colisión provocada —un recurso del paquete que ya existe en el
  destino— resuelta por la política declarada y dejada constancia en
  el registro.
- Las fricciones encontradas durante la instalación documentadas como
  correcciones al instalador o al manifiesto.

## Criterios de calidad

- La instalación se ejecuta contra un destino que no es un
  repositorio vacío: contiene archivos propios y al menos un recurso
  que colisiona con el paquete.
- El plan presentado coincide con lo que la ejecución hizo.
- El registro permite reconstruir qué se instaló y cómo se resolvió
  la colisión.
- Las fricciones encontradas quedan resueltas o documentadas, no
  acumuladas.

## Procedimiento sugerido

1. Preparar un repositorio destino con trabajo previo y una colisión
   provocada con el paquete.
2. Ejecutar la verificación y el plan, y comprobar que reflejan la
   colisión antes de escribir.
3. Ejecutar la instalación y comprobar el resultado contra el plan.
4. Revisar el registro producido.
5. Documentar las fricciones y corregirlas en el instalador o en el
   manifiesto.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
