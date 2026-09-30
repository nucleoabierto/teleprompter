# Referencia de `guide`

```text
teleprompter guide [<paquete>]
```

Muestra las instrucciones de personalización que los paquetes
instalados declararon. Se ejecuta desde la raíz del repositorio
destino —no acepta un argumento de destino ni ninguna opción de
instalación— y lee el archivo que la instalación materializó en
`.teleprompter/<paquete>/<archivo>`: no reinstala ni vuelve a
descargar nada.

- Sin `<paquete>`: muestra la guía de cada paquete instalado que la
  declara, un bloque por paquete.
- Con `<paquete>`: muestra solo la de ese paquete.

La salida es el mismo bloque que la instalación entregó al final de
su resultado —`personalización (<ruta>):` seguido del contenido del
archivo tal cual, que es texto libre del mantenedor: nunca se valida
ni se ejecuta—. La ruta que cada bloque muestra es la registrada en
`teleprompter-lock.json` bajo `personalization`.

## Errores

| Situación                                                   | Código |
|-------------------------------------------------------------|--------|
| Ningún paquete instalado declara guía, o no hay instalaciones | `4`    |
| `<paquete>` no está instalado en el directorio de trabajo   | `4`    |
| `<paquete>` está instalado pero no declaró guía             | `4`    |
| Argumentos de más u opciones de instalación                 | `4`    |
| El archivo registrado no existe o no se puede leer          | `3`    |
| La ruta registrada escapa del destino (`..` o enlaces)      | `3`    |
