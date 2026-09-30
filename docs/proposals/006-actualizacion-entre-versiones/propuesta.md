# Actualización entre versiones: el comando `update`

## Estado

[a] Aprobada

## Problema

Un paquete instalado es un punto en el tiempo: el mantenedor publica
una versión nueva y quien lo instaló solo puede repetir la
instalación completa, enfrentando cada recurso como si fuera la
primera vez. No existe la noción de «ya tengo la 1.0.0 y viene la
1.2.0»: sin comparar lo instalado, lo modificado localmente y lo que
trae la versión nueva, actualizar significa o sobrescribir todo
—perdiendo las adaptaciones locales— o quedarse congelado en la
versión inicial.

Afecta a quien instala paquetes que siguen evolucionando y al
mantenedor que publica mejoras: sus correcciones no llegan a quienes
ya instalaron sin que cada uno arriesgue su trabajo local. Ocurre
cada vez que un paquete publica una versión nueva sobre un destino ya
instalado, y el coste de no resolverlo es que el producto queda como
entrega única —instalar y olvidar— y la versión que el formato
obliga a declarar permanece como dato informativo que nada activa.

## Oportunidad

Resolverlo completa el ciclo de vida del paquete en el destino: lo
instalado deja de ser una copia congelada y pasa a tener una
trayectoria de versiones, en la que cada actualización distingue lo
que puede avanzar sin pérdida de lo que el usuario adaptó y merece
decisión deliberada. Supera a las alternativas actuales —reinstalar
sobrescribiendo a ciegas o no actualizar nunca— y activa el valor
del versionado que el formato ya obliga a declarar (D003): la
relación mantenedor→usuario pasa de entrega única a canal continuado
en el tiempo.

## Forma de solución

Quien tiene un paquete instalado puede pedir al producto «llévalo a
la versión que publica su origen» y recibe un plan de actualización:
el producto compara la versión registrada con la del paquete entrante
y muestra qué recursos son nuevos, cuáles cambiaron y pueden avanzar
sin pérdida porque siguen intactos, cuáles cambiaron pero el usuario
editó —decisión caso a caso— y cuáles ya no vienen; la resolución
por recurso reutiliza la política de colisiones existente. `install`
conserva su contrato actual: convergencia idempotente del destino al
contenido declarado, sin semántica de versiones. Categoría: flujo
nuevo — hoy no hay camino dentro del producto para actualizar lo
instalado.

## Solución

Un comando nuevo del CLI, `update`, junto a `install`, `guide` y
`list`: lleva un paquete instalado a la versión que publica su
origen. Reobtiene el paquete —desde la especificación indicada en la
invocación o, en su defecto, desde el origen que el registro aprende
a recordar en cada instalación—, compara la versión entrante con la
registrada y calcula un plan de actualización que clasifica cada
recurso: nuevo en la versión, sin cambios, cambiado e intacto
—actualizable sin pérdida—, cambiado pero editado localmente
—decisión caso a caso con la política de colisiones existente— o
retirado por la versión nueva. El plan se presenta completo antes de
escribir (D005) y la ejecución actualiza el registro con la nueva
versión.

`install` no cambia: su contrato sigue siendo converger el destino al
contenido declarado, idempotente y sin semántica de versiones.

## Alternativas consideradas

- Hacer `install` consciente de versiones (paso nuevo en el flujo de
  instalación): se descarta porque mezcla dos contratos distintos
  —instalar converge el destino al contenido declarado y es
  idempotente; actualizar compara trayectorias de versión y decide
  sobre trabajo del usuario— y cargaría cada instalación con la
  lógica del caso menos frecuente.
- Reinstalar con la política de colisiones actual, sin comparar
  versiones (lo que hoy ocurre de facto): se descarta porque es justo
  el problema —sin distinguir intacto de modificado, el usuario
  decide a ciegas recurso a recurso aunque la mayoría podrían
  avanzar solos.
- Fusión de contenidos a tres bandas (combinar ediciones locales con
  la versión nueva): se descarta porque contradice la política
  fijada —el contenido nunca se fusiona; la resolución decide por
  recurso completo (D006).

## Fuera de alcance

- Detección automática de versiones nuevas o notificaciones al
  usuario: actualizar es una decisión de quien invoca la operación;
  el producto no consulta orígenes por su cuenta.
- Fusión de contenido dentro de un recurso (marcadores de conflicto,
  diff): la resolución es por recurso completo.
- Dependencias entre paquetes o resolución de compatibilidad de
  versiones: el formato no declara dependencias.
- Desinstalación: retirar lo instalado es una operación distinta que
  esta propuesta no cubre.
- Política de downgrade —actualizar a una versión anterior a la
  registrada—: si se admite, usa el mismo mecanismo; su conveniencia
  la decide la planeación.

## Investigaciones de apoyo

Ninguna — el ciclo de obtención, verificación, plan, resolución de
colisiones y registro ya existe en el flujo de instalación; la
propuesta lo extiende con la comparación de versiones y la deriva.

## Tareas

- `docs/tasks/018-registrar-origen-en-el-registro.md` — Registrar el
  origen de la instalación en el registro (borrador
  `01-registrar-origen-en-el-registro.md`)
- `docs/tasks/019-plan-de-actualizacion.md` — Plan de actualización
  consciente de la deriva (borrador `02-plan-de-actualizacion.md`)
- `docs/tasks/020-comando-update.md` — El comando `update` (borrador
  `03-comando-update.md`, depende de 018 y 019)

## Revisión

- Usuario: 2026-09-30 — Aprueba el enmarcado del problema, la
  oportunidad y la forma de solución (comando `update` nuevo, con
  `install` idempotente y origen registrado con especificación
  sobrescribible) en el diálogo de descubrimiento.
- Usuario: 2026-09-30 — Aprueba la propuesta.
