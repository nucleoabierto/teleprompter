# Instalar un paquete

El usuario ejecuta `teleprompter install <paquete> <destino>` para
llevar los recursos de un paquete a un repositorio existente, con el
plan completo visible antes de escribir y un registro de lo instalado.
Qué es un paquete y qué garantiza la instalación están definidos en
[dominio de paquete](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/001-paquete.md) y
[dominio de instalación](https://github.com/nucleoabierto/teleprompter/blob/master/docs/domains/002-instalacion.md); la
mecánica detallada, en la [referencia](referencia-install.md).

## Escenarios

- **Un paquete se instala de principio a fin con el binario real.** —
  módulo `test/e2e.test.js`, «the reference package installs end to end
  through the real binary»
- **El plan se presenta antes de escribir, con una marca por recurso.**
  En un destino vacío todo es `create`. — módulo `test/plan.test.js`,
  «plan marks every resource create on an empty destination»
- **Reinstalar es inocuo:** lo que ya coincide se marca `identical` y
  no se escribe. — módulos `test/plan.test.js` («plan marks identical
  when the destination already holds the same content») y
  `test/execute.test.js` («reinstalling the same package reports
  identical and keeps the recorded entry»)
- **Lo instalado por Teleprompter se actualiza sin preguntar** cuando
  el paquete trae una versión igual o posterior y el destino sigue
  siendo lo que el registro anotó. — módulo `test/plan.test.js`, «plan
  marks managed-update when the destination still holds what the lock
  recorded»
- **Lo modificado a mano es una colisión,** aunque el registro lo
  reconozca como instalado. — módulo `test/plan.test.js`, «plan marks
  conflict when a recorded resource was modified locally»
- **Las colisiones se resuelven una a una en consola interactiva.** —
  módulo `test/plan.test.js`, «an interactive console resolves each
  conflict per answer»
- **Sin forma de preguntar ni opciones de resolución, las colisiones
  abortan la operación sin escribir.** — módulo `test/plan.test.js`,
  «an interactive console without an asker reports conflicts and
  aborts»
- **`--force` y `--skip` resuelven todas las colisiones por adelantado**
  y son mutuamente excluyentes. — módulos `test/plan.test.js`
  («--force resolves every conflict as overwrite», «--skip resolves
  every conflict as skip») y `test/cli.test.js` («main exits with usage
  error on unknown or mutually exclusive flags»)
- **`--dry-run` muestra el plan y termina sin escribir ni registrar.**
  — módulo `test/plan.test.js`, «--dry-run prints the plan and exits
  without writing»
- **Un manifiesto inválido aborta con código 1 sin tocar el destino.**
  — módulo `test/cli.test.js`, «main exits 1 on an invalid manifest
  without writing to the destination»
- **Una precondición incumplida aborta con código 2 sin escribir;** con
  `create: true` la ruta se crea como parte del plan. — módulo
  `test/cli.test.js` («main exits 2 on an unmet precondition without
  writing», «main passes when a missing precondition path allows
  creation»)
- **Un error de invocación —argumentos ausentes, de más o rutas que no
  son directorios— sale con código 4.** — módulo `test/cli.test.js`,
  «main exits with usage error on missing, wrong, or excess arguments»
- **Cada instalación escribe `teleprompter-lock.json`** con los
  recursos instalados, sus acciones y sus hashes, y conserva lo
  registrado por otros paquetes. — módulo `test/execute.test.js`
  («install copies every resource and writes the lock on an empty
  destination», «writeLock preserves records belonging to other
  packages»)
- **Un error a mitad de ejecución sale con código 3 e informa de lo ya
  aplicado.** — módulo `test/execute.test.js`, «a mid-execution error
  exits 3 and reports what was applied»
- **Si el paquete declara personalización, la salida informa de dónde
  están las instrucciones.** — módulo `test/execute.test.js`, «install
  reports the personalization instructions location»
