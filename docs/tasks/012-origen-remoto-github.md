# Origen remoto `user/repo` y opción `--path`

## Estado

[ ] Pendiente

## Tipo

desarrollo

## Objetivo

Redefinir la entrada del CLI para que la invocación habitual sea
`npx @nucleoabierto/teleprompter user/repo [OUT]`: el comando obtiene
el árbol del repositorio público de GitHub descargando su tarball por
HTTP —sin git ni credenciales— y lo usa como directorio del paquete
para el proceso de instalación existente. La opción `--path <dir>`
toma un directorio local como origen y en ese caso el argumento
`user/repo` no se procesa. El segundo parámetro posicional, `OUT`,
es el destino de la copia y por defecto el directorio de trabajo.

## Dependencias

- Ninguna.

## Entrada

- El contrato de comportamiento en `docs/instalador.md` —las fases de
  «La operación», «Colisiones», «El registro» y «Resultado y
  errores»— y las decisiones D005, D006, D007 y D008.
- La implementación actual en `src/cli.js`, que hoy exige
  `install <paquete> <destino>` con directorios locales.
- La sintaxis acordada: la forma corta `teleprompter user/repo [OUT]`
  es la recomendada y `install` se mantiene como alias que acepta los
  mismos argumentos; `--path <dir>` sustituye el origen remoto; la
  referencia se selecciona con `user/repo@ref` u opción equivalente
  (`--ref`), con la rama por defecto del repositorio cuando no se
  indica.

## Resultado esperado

- `teleprompter user/repo [OUT]` descarga el tarball público del
  repositorio —URL de `codeload.github.com` o equivalente—, lo
  extrae en un directorio temporal y ejecuta sobre ese árbol el flujo
  completo verificación → plan → ejecución → registro.
- `--path <dir>` usa el directorio local como origen y el argumento
  posicional `user/repo` no se procesa.
- `OUT` omitido instala sobre el directorio de trabajo.
- `install` funciona como alias de la forma corta.
- `user/repo@ref` o `--ref <ref>` seleccionan la referencia del
  tarball; sin indicación se descarga la rama por defecto del
  repositorio.
- Los errores de obtención —repositorio inexistente o privado, ref
  inexistente, fallo de red— abortan antes del plan con mensaje
  claro y un código de salida distinguible, documentado junto a los
  existentes.
- El directorio temporal de extracción se elimina al terminar,
  también en caso de error y en `--dry-run`.
- Uso, `README.md`, `docs/instalador.md` y `manual/` reflejan la
  nueva invocación.

## Criterios de calidad

- La forma corta, `install` y `--path` producen el mismo plan y
  registro que un origen local equivalente.
- La obtención usa solo HTTP público: sin git, sin credenciales; un
  repositorio inaccesible aborta antes de calcular el plan.
- `OUT` omitido equivale a `pwd`; las rutas del plan y del registro
  son coherentes con el destino efectivo.
- No quedan temporales tras la ejecución, sea cual sea el resultado.
- Cobertura de pruebas del 100 % mantenida (convención del proyecto,
  `package.json`).

## Procedimiento sugerido

1. Nuevo módulo de obtención (p. ej. `src/fetch.js`): resuelve
   `user/repo` y la referencia a la URL del tarball, lo descarga y lo
   extrae en un directorio temporal.
2. Reescribir el parseo de argumentos en `src/cli.js`: subcomando
   opcional `install`, origen posicional o `--path`, `OUT` posicional
   opcional con defecto el directorio de trabajo, y opciones
   `--ref`, `--force`, `--skip`, `--dry-run`.
3. Conectar el origen resuelto con `verifyPackage` y el resto del
   flujo sin cambios, limpiando el temporal en `finally`.
4. Añadir el código de salida de error de obtención y actualizar
   `docs/instalador.md`, `README.md` y `manual/`.
5. Probar la nueva invocación y el módulo de obtención con HTTP
   simulado, manteniendo la cobertura.

## Notas

- Node 22 incluye `fetch` y `zlib`, pero no un extractor tar; la
  extracción puede apoyarse en el binario `tar` del sistema o en una
  dependencia mínima —decidir en la implementación—.
- Un repositorio puede contener varios paquetes (D002); la tarea
  decide si el paquete se busca en la raíz del árbol extraído o cómo
  se localiza.

## Revisión

- Subagente: [fecha] — [Aprueba | Solicita cambios]
- Usuario: [fecha] — [Aprueba | Solicita cambios]
