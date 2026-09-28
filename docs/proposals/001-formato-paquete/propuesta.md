# Formato de paquete para Teleprompter

## Estado

[a] Aprobada

## Problema

La configuración de agentes de IA —skills, reglas, guías de estilo,
plantillas— ya se traslada entre proyectos en la práctica: este mismo
repositorio empezó con un skill copiado de otro. Ese traslado se hace
copiando archivos a mano o con scripts propios, y explicando de forma
informal qué hay que ajustar. Cada traslado renegocia de cero qué es la
configuración, en qué versión está y qué adaptación requiere.

Afecta a los dos papeles involucrados —hoy la misma persona,
idealmente grupos distintos—: quien produce la configuración no puede
expresar qué partes son reutilizables y cuáles son específicas del
proyecto origen, y quien la recibe no puede saber con certeza qué le
llegó ni qué le toca adaptar. Como no hay un esquema común, cada
proyecto que resuelve esto inventa su propio mecanismo; el coste es
trabajo repetido, adaptaciones erróneas y configuraciones que divergen
del origen sin que nadie lo note.

## Oportunidad

Resolverlo haría que trasladar configuración entre proyectos fuera una
operación con contrato: quien produce declara una vez qué es y cómo se
adapta, y quien recibe sabe exactamente qué obtuvo y qué le falta por
hacer. Supera a las alternativas actuales —copia manual y scripts ad
hoc— en que sustituye la invención de un mecanismo privado por un
esquema común; estas solo ganan en que no exigen acordar nada
previamente.

## Forma de solución

Flujo nuevo: Teleprompter define una manera declarativa de describir un
conjunto de configuración de agentes como trasladable —qué contiene, en
qué versión está, dónde se instala cada parte y qué adaptación
requiere—, de modo que quien produce lo describe una vez y quien
consume puede inspeccionarlo antes de instalarlo.

## Solución

Se define el formato de paquete de Teleprompter: la estructura de un
directorio de paquete —recursos, manifiesto e instrucciones de
personalización— y el contrato del manifiesto, que declara identidad,
versión, mapa de instalación y precondiciones del repositorio destino.
El formato se valida empaquetando un caso real —la configuración de
agentes de este mismo repositorio— y queda fijado en una especificación
que el mantenedor de paquetes puede seguir sin conocer el producto por
dentro.

## Alternativas consideradas

- Convención documentada sin contrato: guía de buenas prácticas sin
  formato verificable; sigue exigiendo interpretación en cada consumo.
- Script de instalación por paquete: reinventa el mecanismo en cada
  paquete y obliga al consumidor a ejecutar código que no puede
  inspeccionar de antemano.
- Formato de distribución genérico: ninguno declara la semántica
  necesaria —qué se instala dónde y qué hay que adaptar al contexto—.

## Fuera de alcance

- El mecanismo que ejecuta la instalación según el contrato
  (corresponde a la idea `motor-instalacion`).
- El contenido de las instrucciones de personalización (corresponde a
  `personalizacion-guiada`); el formato solo declara que existen y
  dónde viven.
- Distribución de paquetes: publicación, descubrimiento o catálogo.
- Lógica de actualización entre versiones ya instaladas.

## Investigaciones de apoyo

- `docs/research/2026-09-formatos-manifiesto.md` — comparación de
  formatos de manifiesto existentes y decisiones candidatas para el
  formato de paquete.

## Borradores

- `docs/tasks/001-investigar-formatos-manifiesto.md` — investigación de
  formatos de manifiesto existentes
- `docs/tasks/002-definir-formato-paquete.md` — definición de la
  estructura y el contrato (depende de 001)
- `docs/tasks/003-paquete-referencia.md` — paquete de ejemplo acotado a
  los skills `crear-tareas` y `ejecutar-tareas` (depende de 002)
- `docs/tasks/004-especificar-formato.md` — especificación del formato
  para mantenedores (depende de 002 y 003)

## Revisión

- Usuario: 2026-09-28 — Aprueba (el paquete de referencia se acota a los
  skills `crear-tareas` y `ejecutar-tareas` como prueba de concepto)
