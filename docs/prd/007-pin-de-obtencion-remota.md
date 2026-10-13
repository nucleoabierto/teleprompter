# PRD — Pin de obtención remota

El consumidor del canal no puede saber qué árbol remoto produjo su
instalación ni volver a él: la rama por defecto es un destino
móvil. Este conjunto convierte la procedencia en un hecho
registrado: cada instalación remota queda anclada al commit exacto
que la produjo, y avanzar sigue siendo una acción explícita.

## Usuarios

El consumidor de paquetes teleprompter —la persona que instala,
actualiza y audita lo instalado en su repositorio— y, en adelante,
las operaciones del propio canal que lean la procedencia
registrada.

## Casos de uso

- **CU-1 — Instalar con procedencia registrada:** el usuario
  instala un paquete desde un origen remoto, con o sin referencia
  explícita; el registro resultante declara el commit exacto que
  produjo la instalación, junto al origen.
  - Sin referencia explícita, la rama por defecto del remoto
    queda resuelta al commit al que apuntaba en el momento de la
    obtención.
  - Con referencia explícita —rama o etiqueta—, el commit
    registrado es el que esa referencia resolvía al obtener.
- **CU-2 — Avanzar con la misma confianza:** el usuario actualiza
  el paquete y el registro pasa a declarar el commit del árbol
  efectivamente instalado; la procedencia declarada nunca queda
  desfasada de lo que hay en el destino.
- **CU-3 — Consultar la procedencia instalada:** el usuario —o
  una operación futura del canal— lee el registro y conoce el
  commit exacto detrás de cada origen remoto, sin re-obtener ni
  adivinar.

## Comportamiento esperado

- **Registro del origen:** todo origen remoto instalado declara
  el commit que produjo la obtención, registrado junto a la
  referencia pedida cuando la hubo —la referencia móvil y el
  ancla coexisten—.
- **Actualización:** actualizar un origen remoto sustituye el
  commit registrado por el del árbol efectivamente obtenido; la
  procedencia declarada describe siempre lo instalado, nunca un
  estado pasado.
- **Registros previos:** un registro de instalación sin commit
  declarado sigue siendo válido y operable —el campo describe la
  procedencia cuando existe, no es un requisito retroactivo—.

## Criterios de éxito

- Toda instalación remota nueva deja escrito en el registro el
  commit que la produjo, comprobable contra lo que el remoto
  declaraba en ese momento.
- Dos instalaciones del mismo origen en momentos distintos dejan
  evidencia de si el árbol obtenido cambió.
- El usuario nunca tuvo que cambiar cómo invoca el canal para
  obtener la procedencia.

## Fuera de alcance

- Señalizar en listado o actualización que el remoto avanzó sin
  cambio de versión —la detección la compra el commit registrado;
  exponerla es otro conjunto—.
- Reconstruir el destino instalado a partir del registro.
- Anclar orígenes locales ni retro-llenar registros ya escritos.
- Verificar la integridad del contenido obtenido —el registro
  identifica el árbol, no lo certifica—.
