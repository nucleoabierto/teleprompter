# Verificar el estado de los recursos instalados

El usuario ejecuta `teleprompter check` desde la raíz del
repositorio destino para saber en qué estado quedó cada recurso que
Teleprompter escribió —intacto, modificado, ausente o no
verificable— confrontando el registro con el disco, sin abrir
`teleprompter-lock.json`. Qué contiene el registro está definido en
el [dominio de instalación](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/002-instalacion.md); la
referencia completa del comando, en la
[referencia de `check`](referencia-check.md).

## Escenarios

- **`check` muestra una entrada por paquete instalado** con su
  `nombre@version` y una línea por recurso registrado con su marca
  de estado. — módulo `test/cli.test.js` («check reports an
  installed resource as intact», «check reports each state across
  packages and resources»)
- **Un recurso editado tras la instalación se marca `modificado`**
  y uno borrado, `ausente`. — módulo `test/cli.test.js` («check
  reports an edited resource as modified», «check reports a deleted
  resource as missing»)
- **La guía de personalización gestionada se verifica como un
  recurso más,** porque está registrada en `files`. — módulo
  `test/cli.test.js`, «check verifies the managed guide as a
  recorded resource»
- **Los recursos omitidos por colisión no se verifican:** el
  registro anota la decisión, pero la herramienta no escribió nada
  ahí. — módulo `test/cli.test.js`, «check does not report resources
  recorded as skipped»
- **Una entrada registrada sin hash se marca `no verificable`,** lo
  mismo que un recurso presente que no se puede leer. — módulo
  `test/cli.test.js` («check reports a recorded entry without
  sha256 as unverifiable», «check reports an unreadable resource as
  unverifiable»)
- **Una ruta registrada que escapa del destino no se lee** —el
  registro es dato versionado, no memoria confiable— y se marca
  `no verificable`. — módulo `test/cli.test.js`, «check marks
  recorded paths that escape the destination as unverifiable»
- **La salida es lenguaje de producto:** marcas y rutas, sin hashes
  ni acciones internas del registro. — módulo `test/cli.test.js`,
  «check reports drift in product language, without hashes or
  actions»
- **Un registro escrito a mano se clasifica igual** que uno
  producido por una instalación real. — módulo `test/cli.test.js`,
  «check reports a hand-written lock entry whose hash differs as
  modified»
- **Sin instalaciones registradas responde «no hay paquetes
  instalados»** con código 0 —es una respuesta, no un fallo—; un
  registro corrupto añade un aviso y responde lo mismo. — módulo
  `test/cli.test.js` («check answers that nothing is installed when
  there is no lock», «check warns on a corrupt lock and answers
  nothing installed»)
- **`check` no admite argumentos ni opciones:** cualquiera es un
  error de invocación con código 4. — módulo `test/cli.test.js`,
  «check rejects arguments and install options»
