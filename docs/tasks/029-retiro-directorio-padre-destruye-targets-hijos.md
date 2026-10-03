# El retirado de un directorio padre destruye los targets hijos entrantes

## Estado

[ ] Pendiente | [~] En progreso | [r] En revisión | [x] Completada | [!] Bloqueada

## Tipo

desarrollo

## Objetivo

Cuando el mapa de instalación cambia de granularidad —un target
directorio registrado (`.agents/skills/` en factory 0.1.0) pasa a
declararse por hijos (`.agents/skills/<nombre>` en 0.2.0)— el plan
de actualización no debe retirar el árbol completo: los hijos
entrantes siguen gestionados. Hoy `buildUpdatePlan` clasificó el
directorio como `retire` intacto y la ejecución lo borró entero,
eliminando 32 skills que el propio plan acababa de marcar
`identical`. Es pérdida de datos silenciosa, observada en la
actualización real de factory 0.1.0 a 0.2.0.

## Dependencias

- Ninguna

## Entrada

- `src/plan.js` — `buildUpdatePlan`: clasificación de retirados por
  comparación entre targets registrados y targets entrantes.
- `src/execute.js` — ejecución de la acción `retire`/`remove`.
- `docs/decisions/D015` — solo se eliminan retirados intactos; los
  que derivaron exigen decisión.
- Reproducción real: teleprompter-lock de factory 0.1.0 (una entrada
  `.agents/skills/`) contra el manifiesto 0.2.0 (32 entradas
  `.agents/skills/<nombre>`).

## Resultado esperado

- Un target registrado que es ancestro de targets entrantes no se
  retira completo: la comparación desciende a los recursos, y solo
  se elimina lo que el mapa nuevo realmente abandonó.
- El caso inverso queda decidido también: hijos registrados que
  colapsan a un directorio padre entrante.
- Pruebas que fijan ambos comportamientos; cobertura 100 %.

## Criterios de calidad

- Reproducción del escenario real: registro con target directorio y
  mapa entrante por hijos → tras `update`, los archivos de los
  hijos entrantes siguen en disco y registrados.
- Un hijo presente en el mapa viejo y ausente en el nuevo sí se
  retira según las reglas vigentes (intacto → borrado, deriva →
  decisión).
- Coherencia con D015 y con la defensa de rutas registradas.

## Procedimiento sugerido

1. Escribir la prueba que reproduce el escenario factory 0.1→0.2.
2. Ajustar la clasificación de retirados: expandir el target
   directorio registrado a sus recursos antes de comparar, o
   excluir del retiro todo lo cubierto por targets entrantes.
3. Verificar el caso simétrico (hijos registrados → padre entrante)
   y la regresión de retirados normales.

## Notas

- El daño ya ocurrió en este repo y se reparó reinstalando; la
  tarea corrige la causa.
- Relacionada con la 030 —el registro omite los `identical`— pero
  son defectos independientes.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
