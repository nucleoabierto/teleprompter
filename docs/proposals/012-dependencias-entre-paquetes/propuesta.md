# Dependencias entre paquetes

## Estado

[a] Aprobada

## Problema

Un mantenedor descompuso un paquete monolítico en varios paquetes para
que los consumidores pudieran instalar solo la pieza que necesitan. La
descomposición cumplió ese objetivo, pero dejó un hueco: nada declara
qué piezas componen el producto completo, así que «instalar todo»
exige que el consumidor conozca el reparto y lo enumere pieza por
pieza. Quien olvida una pieza —o nunca la conoció— obtiene una
instalación incompleta sin aviso.

El mismo hueco aparece entre productos que viven en orígenes
distintos: un paquete que solo funciona en combinación con contenido de
otro origen no puede expresar esa relación de ninguna manera. El
consumidor la descubre de palabra o por documentación, instala cada
pieza por separado y debe acertar el orden si lo hubiera; el registro
queda con instalaciones aisladas que no reflejan que unas completan a
otras.

Afecta a quien publica paquetes descompuestos —no puede declarar el
conjunto ni sus relaciones— y a quien los consume —carga con el reparto
completo, la enumeración manual y el riesgo de una instalación
incompleta o desordenada—.

## Oportunidad

Declarar la relación entre piezas convertiría «instalar el producto
completo» en una decisión del mantenedor en lugar de conocimiento
tribal del consumidor: el conjunto se instala de una vez, completo,
mientras la selección parcial sigue disponible para quien solo necesita
una pieza. Supera a las alternativas actuales —enumerar miembros a mano
o documentar el reparto— en completitud garantizada, y expresa
relaciones entre orígenes que hoy no tienen forma de existir.

## Forma de solución

Paso nuevo en un flujo existente: la instalación gana la resolución del
conjunto declarado antes del plan compartido. El mantenedor declara,
junto al paquete, qué otros paquetes lo completan y qué versión debe
satisfacer cada uno; instalar uno trae consigo los declarados —los del
mismo origen se resuelven dentro del árbol obtenido, los ajenos se
obtienen como unidades propias—; el conjunto completo se resuelve,
ordena y verifica sus restricciones antes de planear; una relación
circular o una versión incompatible aborta la operación como conjunto
no ejecutable.

## Solución

El manifiesto de paquete gana una lista de dependencias: cada entrada
nombra el paquete que completa a este y, opcionalmente, la restricción
de versión que debe satisfacer. Una entrada sin origen propio se
resuelve como miembro del mismo árbol obtenido —mismo commit para todo
el conjunto—; una entrada con origen se obtiene como unidad
independiente, anclada a commit como cualquier instalación. La
resolución es transitiva, ordena el conjunto de modo que cada
dependencia se instale antes que su dependiente y verifica cada
restricción contra la versión que el manifiesto obtenido declara —
modelo de aserción, no de selección (la referencia elige el árbol, la
restricción lo valida, el commit lo fija). Cada pieza del conjunto
queda registrada como una instalación normal, con su origen propio.

## Alternativas consideradas

- Selección por defecto de la colección: el índice declara qué
  miembros se instalan cuando no hay `--package`. Resuelve solo «la
  colección entera del mismo origen»: no expresa relaciones parciales
  (A necesita B pero no C) ni nada entre orígenes —nombra un conjunto
  por defecto, no lo que cada pieza necesita—.
- Metapaquete como paquete físico: un envoltorio que reincrusta todos
  los recursos. Deshace la descomposición —duplica contenido que
  diverge cuando los subpaquetes cambian— y vuelve al monolito que se
  quiso partir.
- Documentar el reparto: es la alternativa vigente —el conocimiento
  del conjunto sigue tribal y la instalación incompleta sigue sin
  aviso.
- Resolución de versiones al estilo npm: el rango selecciona la máxima
  versión entre las publicadas en un registro. Impracticable —no
  existe índice que enumere versiones y la autoridad de la versión vive
  dentro del manifiesto obtenido—; descartada a favor del modelo de
  aserción de Go (véase Investigaciones).

## Fuera de alcance

- Resolución de versiones por enumeración —elegir qué versión instalar
  entre varias publicadas: la restricción valida lo obtenido, no lo
  elige—.
- Rangos con prereleases: el formato de versión es `x.y.z` y el
  vocabulario de prerelease queda fuera del conjunto inicial.
- Efectos en cascada sobre desinstalar o actualizar lo que otros
  necesitan: cada pieza queda registrada como instalada normal y las
  demás operaciones no conocen las relaciones.
- Dependencias opcionales, condicionadas o de desarrollo.
- Selección parcial dentro del conjunto resuelto: el conjunto
  declarado se instala entero; la selección parcial sigue siendo el
  `--package` de siempre.
- Orígenes privados o autenticados —ya en «No ahora» del roadmap—.

## Investigaciones de apoyo

- `docs/research/2026-11-dependencias-semver-gestores.md` — comparación
  de modelos de restricción de versión (npm/Cargo/pip por selección;
  Go por aserción con MVS) y recomendación del modelo de aserción con
  vocabulario acotado npm.

## Borradores

- `docs/tasks/065-dependencias-mismo-origen.md` — dependencias dentro
  del mismo origen: declaración, resolución en el árbol obtenido,
  orden, ciclos y verificación de versión
- `docs/tasks/066-dependencias-origenes-externos.md` — la misma entrada
  con origen propio: obtención anclada a commit, grafo transitivo
  entre orígenes y conflictos de identidad (depende de 065)

## Revisión

- Usuario: 2026-11-22 — Aprueba
