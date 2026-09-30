# Ciclo de vida del paquete instalado

## Estado

[x] Planificada

## Objetivo

Lo que un paquete deja instalado en el destino tiene ciclo de vida
completo: se puede consultar qué paquetes hay, verificar en qué
estado quedaron sus recursos y llevar el paquete a la versión nueva
que publica su origen —con el registro como memoria que sostiene las
tres operaciones.

## Alcance

- **Dentro:** el listado de paquetes instalados (016, ya completa),
  la verificación del estado de los recursos instalados, el registro
  del origen de instalación, el plan de actualización consciente de
  la deriva y el comando `update`.
- **Fuera:** actuar sobre la deriva (restaurar o regenerar), fusión
  de contenido, desinstalación, detección automática de versiones
  nuevas, dependencias entre paquetes, downgrade.

## Piezas

- [x] docs/tasks/016-listar-paquetes-instalados.md — Listar los
  paquetes instalados
- [x] docs/tasks/017-verificar-recursos-instalados.md — Verificar el
  estado de los recursos instalados
- [x] docs/tasks/018-registrar-origen-en-el-registro.md — Registrar
  el origen de la instalación en el registro
- [x] docs/tasks/019-plan-de-actualizacion.md — Plan de actualización
  consciente de la deriva
- [ ] docs/tasks/020-comando-update.md — El comando `update`

## Plan técnico

La épica convierte el registro en superficie de producto y en memoria
del ciclo de vida: primero lo hace legible (016), luego contrastable
(017), después capaz de recordar la procedencia (018) y finalmente
base del plan que gobierna la actualización (019, 020).

- **Orden:** 017 y 018 pueden ir en paralelo tras 016; 019 presupone
  la clasificación de deriva de 017; 020 cierra consumiendo 018 y
  019.
- **Dependencias:** 019 necesita la clasificación de deriva de 017;
  020 necesita el origen registrado de 018 y el plan de 019.
- **Decisiones transversales:** las consultas del CLI operan sobre el
  directorio de trabajo, sin destino ni opciones (patrón de D011 y
  D012); el registro es la única memoria —ninguna operación consulta
  el origen por su cuenta; el contenido nunca se fusiona, la
  resolución decide por recurso completo (D006); todo plan se calcula
  completo antes de escribir y aborta entero si no es ejecutable
  (D005); `install` conserva su contrato idempotente sin semántica de
  versiones.

## Criterio de cierre

Quien tiene un paquete instalado puede listar qué tiene, verificar
qué recursos siguen intactos, modificados o ausentes, y ejecutar
`update` para llevar el paquete a la versión nueva viendo el plan
completo —qué avanza solo y qué se decide caso a caso— antes de que
se escriba nada; `install` reejecutado converge al mismo resultado.

## Revisión

- Usuario: 2026-09-30 — Aprueba
