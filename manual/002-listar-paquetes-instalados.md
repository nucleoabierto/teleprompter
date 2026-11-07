# Listar los paquetes instalados

El usuario ejecuta `teleprompter list` desde la raíz del
repositorio destino para ver qué paquetes instaló Teleprompter —
nombre, versión, fecha y recursos escritos— sin abrir
`teleprompter-lock.json`. Qué contiene el registro está definido en
el [dominio del registro](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/003-registro.md).

## Comportamiento

- **`list` muestra una entrada por paquete instalado** con su
  `nombre@versión`, la fecha de la instalación y una línea por
  recurso escrito.
- **La salida evita el detalle interno:** los recursos se listan por
  su ruta, sin hashes ni acciones internas del registro.
- **Los recursos omitidos por colisión no se listan:** el registro
  anota la decisión, pero la herramienta no escribió nada ahí.
- **Una entrada sin fecha registrada se lista sin ella.**
- **Un paquete con guía de personalización señala cómo consultarla**
  con `guide`.
- **Sin instalaciones registradas responde «no hay paquetes
  instalados»** —es una respuesta, no un fallo—; un registro
  corrupto añade un `aviso:` y responde lo mismo.
- **El listado no depende del origen de la instalación:** tras
  instalar remoto o con `--path`, lee solo el registro del
  directorio de trabajo.
- **`list` no admite argumentos ni opciones:** cualquiera es un
  error de invocación.

Véase la [referencia de `list`](referencia-list.md) para la
gramática completa y los códigos de salida.
