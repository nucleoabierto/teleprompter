# D017: La versión identifica el contenido — semver inmutable

## Estado

Aceptada

## Contexto

El plan de actualización declara `upToDate` cuando la versión
entrante coincide con la registrada (D015) sin comparar el contenido
del paquete. La revisión de arquitectura 002 observó que un mismo
número con contenido distinto —una release retagueada o un paquete
local editado sin bump— queda invisible para `update`: la deriva del
paquete no tiene detector, a diferencia de la deriva del destino, que
sí la tiene (D013).

## Decisión

Adoptamos el axioma semver del ecosistema: la versión identifica el
contenido. Un mismo número publica un mismo contenido; «misma
versión, otro contenido» es una violación del contrato del
mantenedor, no un estado que la herramienta detecte ni gestione.
`upToDate` sigue respondiendo por versión y no se añade comparación
de contenido entre paquete y registro.

## Justificación

Comparar contenido bajo el mismo número resolvería un caso que el
formato ya prohíbe por convención: semver explícita existe (D003)
precisamente para que la versión sea la identidad del contenido.
Añadir un detector de deriva del paquete complicaría el vocabulario
del plan para cubrir un incumplimiento que el mantenedor puede
resolver simplemente publicando una versión nueva. Consecuencia
aceptada: quien retaguea una release o edita un paquete local sin
bump obtiene «ya está en esa versión» aunque el contenido difiera —es
el comportamiento que el axioma declara correcto—.

## Referencias

- `docs/architecture-reviews/002-instalacion-tras-el-ciclo-de-vida.md`
  (hallazgo H4)
- `docs/decisions/D003-version-semver-en-manifiesto.md`
- `docs/decisions/D015-plan-de-actualizacion-y-retirados.md`
