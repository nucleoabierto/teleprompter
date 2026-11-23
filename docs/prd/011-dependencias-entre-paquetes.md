# PRD — Dependencias entre paquetes

Un paquete descompuesto en piezas o que funciona en combinación
con contenido de otro origen no puede declarar sus relaciones:
«instalar el producto completo» es conocimiento tribal del
consumidor. Este conjunto convierte esa relación en una decisión
del mantenedor: instalar una pieza trae el conjunto que declara,
verificado antes de escribir.

## Usuarios

Mantenedores que publican paquetes descompuestos o combinados;
consumidores que los instalan en su repositorio destino.

## Casos de uso

- **CU-1 — Producto completo:** el consumidor instala un paquete
  de composición y obtiene el conjunto declarado entero, sin
  conocer ni enumerar el reparto.
- **CU-2 — Solo una pieza:** el consumidor instala el subpaquete
  que necesita; solo su conjunto declarado se instala.
- **CU-3 — Entre orígenes:** un paquete de un origen declara una
  pieza de otro; el conjunto se obtiene anclado y se instala.
- **CU-4 — Bucle:** las dependencias forman un ciclo; la
  operación aborta con la ruta legible, sin escribir nada.
- **CU-5 — Versión insatisfecha:** la pieza obtenida no cumple la
  restricción declarada; la operación aborta, sin escribir.
- **CU-6 — Pieza inalcanzable:** la dependencia nombrada no
  existe o no puede obtenerse; la operación aborta con
  diagnóstico, sin escribir.
- **CU-7 — Restricciones unidas:** dos piezas exigen rangos
  sobre la misma dependencia; la obtenida debe cumplir ambos.

## Comportamiento esperado

- **Declaración:** el manifiesto de un paquete lista las piezas
  que lo completan con su restricción de versión opcional y su
  origen opcional; sin origen significa «del mismo árbol».
- **Resolución:** transitiva, dentro del árbol obtenido para las
  del mismo origen y como unidades propias ancladas a commit para
  las externas; el conjunto se ordena de modo que cada
  dependencia se instale antes que su dependiente.
- **Verificación:** cada restricción se evalúa contra la versión
  que el manifiesto de la pieza obtenida declara; una pieza
  exigida por varias entradas debe satisfacerlas todas.
- **Aborto:** un ciclo, una restricción incumplida o una pieza
  inalcanzable aborta el conjunto entero sin escribir destino,
  registro ni respaldos, con diagnóstico legible.
- **Registro:** cada pieza instalada queda registrada como una
  instalación normal con su origen, reproducible por las demás
  operaciones.
- **Selección:** la selección por nombre instala solo lo pedido y
  su conjunto declarado; un paquete puede existir solo para
  componer, sin recursos propios.

## Criterios de éxito

El consumidor instala el producto completo con una sola orden sin
conocer el reparto; una instalación incompleta por olvido deja de
ser posible; una relación entre orígenes se instala como un solo
conjunto.

## Fuera de alcance

Elegir qué versión instalar entre varias publicadas; prereleases
en rangos; efectos sobre desinstalar o actualizar lo que otros
necesitan; dependencias opcionales o de desarrollo; selección
parcial del conjunto resuelto; orígenes privados o autenticados.
