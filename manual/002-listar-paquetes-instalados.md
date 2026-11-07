# Listar los paquetes instalados

El usuario ejecuta `teleprompter list` desde la raíz del
repositorio destino para ver qué paquetes instaló Teleprompter —
nombre, versión, fecha y recursos escritos— sin abrir
`teleprompter-lock.json`. Qué contiene el registro está definido en
el [dominio de instalación](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/002-instalacion.md); la
referencia completa del comando, en la
[referencia de `list`](referencia-list.md).

## Escenarios

- **`list` muestra una entrada por paquete instalado** con su
  `nombre@version`, el instante de la instalación y una línea por
  recurso escrito.
- **La salida es lenguaje de producto:** los recursos se listan por
  su ruta, sin hashes ni acciones internas del registro.
- **Los recursos omitidos por colisión no se listan:** el registro
  anota la decisión, pero la herramienta no escribió nada ahí.
- **Una entrada sin fecha registrada se lista sin ella.**
- **Un paquete con guía de personalización señala cómo consultarla**
  con `guide`.
- **Sin instalaciones registradas responde «no hay paquetes
  instalados»** con código 0 —es una respuesta, no un fallo—; un
  registro corrupto añade un aviso y responde lo mismo.
- **El listado no depende del origen de la instalación:** tras
  instalar remoto o con `--path`, lee solo el registro del
  directorio de trabajo.
- **`list` no admite argumentos ni opciones:** cualquiera es un
  error de invocación con código 4.
