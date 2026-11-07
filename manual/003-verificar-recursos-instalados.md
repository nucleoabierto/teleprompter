# Verificar el estado de los recursos instalados

El usuario ejecuta `teleprompter check` desde la raíz del
repositorio destino para saber en qué estado quedó cada recurso que
Teleprompter escribió —intacto, modificado, ausente o no
verificable— confrontando el registro con el disco, sin abrir
`teleprompter-lock.json`. Qué contiene el registro está definido en
el [dominio del registro](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/003-registro.md).

## Comportamiento

- **`check` muestra una entrada por paquete instalado** con su
  `nombre@version` y una línea por recurso registrado con su marca
  de estado.
- **Un recurso editado tras la instalación se marca `modificado`**
  y uno borrado, `ausente`.
- **La guía de personalización gestionada se verifica como un
  recurso más,** porque está registrada en `files`.
- **Los recursos omitidos por colisión no se verifican:** el
  registro anota la decisión, pero la herramienta no escribió nada
  ahí.
- **Una entrada registrada sin hash se marca `no verificable`,** lo
  mismo que un recurso presente que no se puede leer.
- **Una ruta registrada que escapa del destino no se lee** —el
  registro es dato versionado, no memoria confiable— y se marca
  `no verificable`.
- **La salida es lenguaje de producto:** marcas y rutas, sin hashes
  ni acciones internas del registro.
- **Un recurso idéntico al paquete también se verifica:** instalar
  sobre contenido que ya coincide registra esos targets y `check`
  los reporta intactos como cualquier otro.
- **Un registro escrito a mano se clasifica igual** que uno
  producido por una instalación real.
- **Sin instalaciones registradas responde «no hay paquetes
  instalados»** con código 0 —es una respuesta, no un fallo—; un
  registro corrupto añade un aviso y responde lo mismo.
- **`check` no admite argumentos ni opciones:** cualquiera es un
  error de invocación con código 4.

Véase la [referencia de `check`](referencia-check.md) para la
gramática completa y los códigos de salida.
