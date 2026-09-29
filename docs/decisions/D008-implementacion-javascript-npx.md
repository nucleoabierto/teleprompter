# D008: Implementación en JavaScript distribuida por npx

## Estado

Aceptada

## Contexto

El instalador introduce la primera base ejecutable del proyecto y hay
que elegir tecnología y forma de distribución. Los usuarios objetivo
ya ejecutan herramientas del ecosistema de agentes con `npx` (`npx
skills add`), y el proyecto tiene acceso al scope npm
`@nucleoabierto`.

## Decisión

Implementamos el instalador en JavaScript y lo distribuimos como el
paquete npm `@nucleoabierto/teleprompter`, ejecutable sin instalación
previa con `npx @nucleoabierto/teleprompter`.

## Justificación

`npx` elimina el paso de instalación previa —coherente con el problema
que el producto resuelve— y es el patrón que los usuarios del
ecosistema de skills ya conocen (skills.sh CLI). JavaScript/npm es la
plataforma nativa de ese flujo y la que hace la invocación portable
sin gestores adicionales. La alternativa considerada era Python de
biblioteca estándar: sin dependencias, pero exige un canal de
distribución propio y rompe la uniformidad con el ecosistema. La
consecuencia negativa es asumir la cadena de publicación de npm
(versionado, publicación del paquete), que la distribución queda fuera
de alcance por ahora solo aplaza.

## Referencias

- `docs/epics/002-motor-instalacion.md` — la épica asigna la elección
  de tecnología a la tarea 006.
- `docs/instalador.md` — sección «Distribución».
