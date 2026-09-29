# Motor de instalación para Teleprompter

## Estado

[a] Aprobada

## Problema

Instalar un conjunto de configuración en un repositorio que ya tiene
trabajo previo es una operación manual y a ciegas. Quien instala tiene
que comprobar por su cuenta qué recursos ya existen en el destino, si el
repositorio cumple lo que el conjunto presupone y dónde encaja cada
pieza según la estructura local —decisiones que se toman en el momento,
sin forma de verificarlas antes de ejecutarlas.

No hay validación previa ni registro de lo ocurrido: cuando algo se
sobrescribe, se omite o se fusiona, no queda constancia de la decisión,
y los errores se descubren tarde, ya mezclados con el trabajo del
proyecto. Cada instalación se negocia de cero —incluso repitiendo el
mismo conjunto sobre otro repositorio— y no hay manera de saber si dos
instalaciones produjeron el mismo resultado.

Afecta a quien consume la configuración trasladable —hoy la misma
persona que la produce— cada vez que un conjunto llega a un repositorio
con historia. El coste es una operación frágil e irrepetible: conflictos
silenciosos, trabajo perdido por sobrescritura y ausencia de
trazabilidad sobre qué quedó instalado.

## Oportunidad

Resolverlo convertiría la instalación en una operación confiable y
repetible sobre repositorios reales: saber antes de ejecutar si hay
conflictos o requisitos incumplidos, y dejar constancia de cada
decisión. Supera a la alternativa actual —la instalación manual— en
seguridad y predictibilidad; esta solo gana en que no exige adoptar
ningún mecanismo.

## Forma de solución

Flujo nuevo: Teleprompter incorpora el recorrido completo de
instalación que hoy no existe —apuntar a un paquete y a un repositorio
destino, comprobar precondiciones y colisiones antes de escribir nada,
aplicar el mapa de instalación resolviendo los conflictos con una
política declarada y dejar constancia del resultado—, de modo que
instalar un paquete deja de ser una operación manual a ciegas y se
convierte en una operación inspeccionable y repetible.

## Solución

Se crea el instalador de Teleprompter: una herramienta invocable que
toma un paquete conforme al formato definido y un repositorio destino,
verifica el manifiesto y las precondiciones declaradas, presenta un
plan de instalación —qué se copiará, qué colisiona y cómo se resolverá—
y solo entonces ejecuta la copia, dejando un registro del resultado.

El instalador se valida instalando de verdad el paquete de referencia
del repositorio sobre un destino con trabajo previo, incluida una
colisión provocada que la política declarada resuelve.

La descomposición del trabajo de implementación no se fija en esta
propuesta: la produce la tarea de definición, que es cuando el
comportamiento del instalador está acotado y el despiece puede hacerse
con conocimiento.

## Alternativas consideradas

- Guía de instalación manual documentada: instruir a quien instala
  sobre qué comprobar y en qué orden. Se descarta porque sigue
  dependiendo de la disciplina y la memoria de quien ejecuta, que es
  justo lo que falla hoy, y no produce registro.
- Script de instalación por paquete: cada paquete trae su propio
  ejecutable. Se descarta porque reinventa el mecanismo en cada paquete
  y obliga a quien consume a ejecutar código que no puede inspeccionar
  de antemano.
- Más declaratividad sin ejecutor: declarar la política de colisiones
  en el manifiesto pero dejar la aplicación en manos de quien instala.
  Se descarta porque un contrato sin ejecutor no elimina la operación a
  ciegas ni deja constancia: la verificación seguiría siendo manual.

## Fuera de alcance

- El contenido de las instrucciones de personalización (corresponde a
  `personalizacion-guiada`): la instalación las entrega y presenta,
  pero no decide qué dicen.
- Distribución de paquetes: publicación, descubrimiento o catálogo.
- Actualización o desinstalación de paquetes ya instalados; la
  operación cubre solo la instalación inicial.
- Fusionado dentro de los recursos: la política de colisiones decide
  por recurso completo, no mezcla contenido.

## Investigaciones de apoyo

- `docs/research/2026-09-motores-instalacion.md` — comparación de cómo
  instalan las herramientas comparables y decisiones candidatas para
  el comportamiento del instalador.
- `docs/research/2026-09-formatos-manifiesto.md` — la investigación de
  la épica anterior; define el contrato que el instalador ejecuta.

## Borradores

- `docs/tasks/005-investigar-motores-instalacion.md` — investigación
  de cómo instalan las herramientas comparables
- `docs/tasks/006-definir-comportamiento-instalador.md` — definición
  del comportamiento del instalador: verificación, plan, política de
  colisiones, registro y descomposición de la implementación en tareas
  (depende de 005)
- `docs/tasks/007-instalar-paquete-referencia.md` — instalación real
  del paquete `ciclo-tareas` sobre un destino con trabajo previo
  (depende de las tareas de implementación derivadas de 006)

## Revisión

- Usuario: 2026-09-28 — Solicita cambios (el número de tareas de
  implementación lo decide la tarea de definición, no la propuesta);
  reenviada a revisión tras aplicarlos
- Usuario: 2026-09-28 — Aprueba
