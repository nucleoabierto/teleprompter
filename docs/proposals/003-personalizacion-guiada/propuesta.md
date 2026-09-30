# Personalización guiada: el paquete declara cómo adaptarse

## Estado

[p] Pendiente de revisión | [a] Aprobada | [d] Descartada

## Problema

Los recursos de un paquete están pensados para adaptarse al proyecto
que los recibe —nombres, rutas, convenciones, decisiones locales—,
pero qué debe personalizarse solo lo sabe con certeza quien mantiene
el paquete. Quien instala un paquete que no conoce no tiene más opción
que leer todos sus recursos para deducir qué es genérico y qué pide
adaptación, o confiar en que el paquete encaje tal cual.

Ese esfuerzo crece con el tamaño del paquete: en uno de pocos archivos
el descubrimiento es asumible, pero en paquetes grandes leerlo todo
para localizar los puntos de personalización es una carga real. La
alternativa actual —que el autor incluya instrucciones como un recurso
más— no resuelve el descubrimiento: las instrucciones llegan mezcladas
con el resto del contenido sin nada que las distinga, y localizarlas
exige la misma exploración que pretendían evitar.

Afecta al agente que opera en el repositorio destino —que es quien
ejecuta la adaptación— y, a través de él, a quien instala un paquete
ajeno. Ocurre en cada instalación de un paquete no trivial, y el coste
de dejarlo como está es doble: personalizaciones que no se hacen por
no descubrirse, o un esfuerzo de lectura completo que desincentiva
instalar paquetes grandes.

## Oportunidad

Resolverlo convertiría la personalización de un problema de
descubrimiento en información entregada: quien adapta recibiría del
propio paquete qué ajustar y cómo, sin lectura completa ni adivinación
de intención. Supera a las alternativas en los dos frentes —frente a
la lectura exhaustiva elimina el esfuerzo que escala con el tamaño, y
frente a las instrucciones como recurso anónimo las distingue del
contenido y las entrega como parte de la instalación—. Además es la
pieza que separa al producto de un copiador de archivos: no solo
traslada recursos, transfiere el criterio para adaptarlos.

## Forma de solución

El paquete gana un lugar declarado para las instrucciones de
personalización del mantenedor —distinguidas del resto del
contenido—, y la instalación gana un paso de entrega: al terminar,
quien instala recibe esas instrucciones como parte del resultado, y
quedan consultables después. El destinatario deja de descubrir qué
adaptar y pasa a recibir la guía del autor. Paso nuevo en un flujo
existente: el flujo de instalación funciona hoy; le falta el eslabón
que entrega el criterio de adaptación.

## Solución

El formato de paquete declara las instrucciones de personalización
como contenido distinguido del manifiesto —con la forma concreta que
fije la primera tarea: campo declarado, convención de archivo o una
combinación—, y la especificación para mantenedores lo documenta.

El instalador lee la declaración tras la verificación y, al terminar
la instalación con éxito, presenta las instrucciones como parte del
resultado; el mismo contenido queda accesible en el destino para
consulta posterior, de modo que la entrega no dependa de leer el
mensaje en el momento de instalar.

## Alternativas consideradas

- Instrucciones como recurso más del paquete (un archivo de guía
  copiado junto al contenido): se descarta porque reproduce el
  problema —las instrucciones llegan anónimas, sin nada que las
  distinga, y localizarlas exige la exploración que se quiere evitar—.
- Sustitución mecánica en la copia (el instalador rellena variables
  declaradas al escribir los recursos): se descarta como forma
  dominante porque reduce la transferencia de criterio a reemplazo de
  valores —solo cubre personalización de datos, no decisiones ni
  convenciones— y añade un lenguaje de plantillas al contrato del
  paquete.
- Adaptación automática ejecutada por el paquete (el mantenedor envía
  lógica que modifica el destino): se descarta porque convierte la
  instalación en ejecución de código ajeno, rompiendo el carácter
  declarativo del producto.

## Fuera de alcance

- Que el instalador aplique la personalización: entrega la guía; la
  adaptación la ejecuta el agente del repositorio destino.
- Mecanismos de plantillas o sustitución de variables dentro de los
  recursos.
- Validar la calidad o completitud de las instrucciones del
  mantenedor.
- Colecciones: cómo se declaran instrucciones cuando un repositorio
  contiene varios paquetes.

## Investigaciones de apoyo

- `01-investigar-instrucciones-postinstalacion.md` — el primer
  borrador es una investigación sobre cómo entregan guía
  post-instalación las herramientas comparables.

## Borradores

- `01-investigar-instrucciones-postinstalacion.md` — Investigar la
  entrega de guía post-instalación en herramientas comparables
- `02-declarar-personalizacion-en-el-formato.md` — Declarar las
  instrucciones de personalización en el formato de paquete
  (depende de 01)
- `03-entregar-personalizacion-al-instalar.md` — Entregar las
  instrucciones al instalar y bajo demanda (depende de 02)

## Revisión

- Pendiente de decisión del usuario.
